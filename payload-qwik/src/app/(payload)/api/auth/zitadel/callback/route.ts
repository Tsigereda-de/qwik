import { getPayload } from 'payload'
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

    const payload = await getPayload({ config })

    // Get environment variables
    const zitadelApiUrl = process.env.ZITADEL_API_URL
    const clientId = process.env.ZITADEL_CLIENT_ID
    const clientSecret = process.env.ZITADEL_CLIENT_SECRET
    const redirectUri = process.env.ZITADEL_REDIRECT_URI

    if (!zitadelApiUrl || !clientId || !clientSecret || !redirectUri) {
      console.error('Missing Zitadel environment variables')
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 },
      )
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(
      `${zitadelApiUrl}/oauth/v2/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }).toString(),
      },
    )

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text())
      return Response.json(
        { error: 'Token exchange failed' },
        { status: 401 },
      )
    }

    const tokenData = (await tokenResponse.json()) as ZitadelTokenResponse

    // Get user info
    const userInfoResponse = await fetch(
      `${zitadelApiUrl}/oauth/v2/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    )

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
          zitadelProfile: userInfo,
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
          zitadelProfile: userInfo,
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
      token: tokenData.access_token,
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
