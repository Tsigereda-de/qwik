import { getPayload } from 'payload'
import { cookies as nextCookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Agent } from 'undici'
import config from '@payload-config'

interface ZitadelTokenResponse {
  access_token: string
  id_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
}

interface ZitadelUserInfo {
  sub: string
  email: string
  name?: string
  given_name?: string
  family_name?: string
  email_verified?: boolean
}

export const POST = async (request: Request) => {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return Response.json(
        { error: 'Missing authorization code' },
        { status: 400 },
      )
    }

    // Read state and code_verifier from cookies (set during login)
    const cookieHeader = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [k, ...v] = c.trim().split('=')
        return [k, v.join('=')]
      }),
    )

    const codeVerifier = cookies['zitadel_code_verifier']
    const stateCookie = cookies['zitadel_state']

    if (!codeVerifier) {
      return Response.json(
        { error: 'Missing PKCE code verifier' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Get environment variables
    const zitadelApiUrl = process.env.ZITADEL_API_URL
    const clientId = process.env.ZITADEL_CLIENT_ID
    const redirectUri = process.env.ZITADEL_REDIRECT_URI

    if (!zitadelApiUrl || !clientId || !redirectUri) {
      console.error('Missing Zitadel environment variables')
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 },
      )
    }

    // Force IPv4 and add timeouts to avoid hanging network calls
    const ipv4Agent = new Agent({
      connect: {
        family: 4,
        timeout: 10_000,
      },
    })

    const isRetryableNetworkError = (err: unknown): boolean => {
      if (!err || typeof err !== 'object') return false
      const anyErr = err as { code?: string; cause?: { code?: string } }
      const code = anyErr.code ?? anyErr.cause?.code
      return (
        code === 'ECONNRESET' ||
        code === 'ETIMEDOUT' ||
        code === 'EAI_AGAIN' ||
        code === 'ENETUNREACH'
      )
    }

    // Exchange code for tokens (retry transient network failures)
    const tokenUrl = `${zitadelApiUrl}/oauth/v2/token`
    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
    }).toString()

    let tokenResponse: Response | undefined
    let lastError: unknown

    for (let attempt = 1; attempt <= 3; attempt++) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 12_000)

      try {
        tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: tokenBody,
          dispatcher: ipv4Agent,
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
        break
      } catch (err) {
        clearTimeout(timeoutId)
        lastError = err

        if (err instanceof Error && err.name === 'AbortError') {
          console.error('Token exchange aborted (timeout)')
          return Response.json({ error: 'Token exchange timeout' }, { status: 504 })
        }

        if (attempt < 3 && isRetryableNetworkError(err)) {
          console.error(`Token exchange fetch failed (attempt ${attempt}/3):`, err)
          await new Promise((r) => setTimeout(r, 250 * attempt))
          continue
        }

        console.error('Token exchange fetch failed:', err)
        return Response.json({ error: 'Token exchange failed' }, { status: 502 })
      }
    }

    if (!tokenResponse) {
      console.error('Token exchange failed (no response):', lastError)
      return Response.json({ error: 'Token exchange failed' }, { status: 502 })
    }

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text())
      return Response.json(
        { error: 'Token exchange failed' },
        { status: 401 },
      )
    }

    const rawToken = await tokenResponse.text()
    let tokenData: ZitadelTokenResponse
    try {
      tokenData = JSON.parse(rawToken) as ZitadelTokenResponse
    } catch (err) {
      console.error('Failed to parse token response:', rawToken, err)
      return Response.json(
        { error: 'Invalid token response' },
        { status: 502 },
      )
    }

    // Get user info
    const userInfoResponse = await fetch(`${zitadelApiUrl}/oauth/v2/userinfo`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      dispatcher: ipv4Agent,
    })

    if (!userInfoResponse.ok) {
      console.error('User info fetch failed:', await userInfoResponse.text())
      return Response.json(
        { error: 'Failed to fetch user info' },
        { status: 401 },
      )
    }

    const userInfo = (await userInfoResponse.json()) as ZitadelUserInfo

    // Find or create user
    let user = await payload.find({
      collection: 'users',
      where: {
        zitadelId: {
          equals: userInfo.sub,
        },
      },
    })

    if (user.docs.length > 0) {
      // Update existing user
      const existingUser = user.docs[0]
      await payload.update({
        collection: 'users',
        id: existingUser.id,
        data: {
          name: userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim(),
          zitadelProfile: userInfo as unknown as Record<string, unknown>,
          isActive: true,
        },
      })
    } else {
      // Create new user
      await payload.create({
        collection: 'users',
        data: {
          email: userInfo.email,
          name: userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim(),
          zitadelId: userInfo.sub,
          zitadelProfile: userInfo as unknown as Record<string, unknown>,
          password: crypto.randomUUID(),
          isActive: true,
        },
      })
    }

    // Fetch the final user data
    const finalUser = await payload.find({
      collection: 'users',
      where: {
        zitadelId: {
          equals: userInfo.sub,
        },
      },
    })

    return Response.json({
      success: true,
      user: finalUser.docs[0],
      accessToken: tokenData.access_token,
      idToken: tokenData.id_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
    })
  } catch (error) {
    console.error('Zitadel callback error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
