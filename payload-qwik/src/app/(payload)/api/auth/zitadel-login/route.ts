import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Generate a random state string for CSRF protection
 */
function generateRandomString(length: number = 64): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let state = ''
  for (let i = 0; i < length; i++) {
    state += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return state
}

async function sha256(base: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(base)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashString = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  const binary = hashString.match(/.{1,2}/g)?.map((byte) => String.fromCharCode(parseInt(byte, 16))).join('') ?? ''
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export const GET = async (request: Request) => {
  try {
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

    // Generate PKCE verifier/challenge and CSRF state
    const state = generateRandomString(32)
    const codeVerifier = generateRandomString(64)
    const codeChallenge = await sha256(codeVerifier)

    // Build authorization URL
    const authUrl = new URL(`${zitadelApiUrl}/oauth/v2/authorize`)
    authUrl.searchParams.append('client_id', clientId)
    authUrl.searchParams.append('redirect_uri', redirectUri)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('scope', 'openid profile email')
    authUrl.searchParams.append('state', state)
    authUrl.searchParams.append('code_challenge', codeChallenge)
    authUrl.searchParams.append('code_challenge_method', 'S256')

    // Store state and code_verifier in HttpOnly cookies (short-lived)
    const cookies = [
      `zitadel_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`,
      `zitadel_code_verifier=${codeVerifier}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`,
    ]

    return new Response(
      JSON.stringify({
        authUrl: authUrl.toString(),
        state,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookies,
        },
      },
    )
  } catch (error) {
    console.error('Zitadel login error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
