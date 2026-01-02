import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Generate a random state string for CSRF protection
 */
function generateState(length: number = 32): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let state = ''
  for (let i = 0; i < length; i++) {
    state += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return state
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

    // Generate CSRF state
    const state = generateState()

    // Build authorization URL
    const authUrl = new URL(`${zitadelApiUrl}/oauth/v2/authorize`)
    authUrl.searchParams.append('client_id', clientId)
    authUrl.searchParams.append('redirect_uri', redirectUri)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('scope', 'openid profile email')
    authUrl.searchParams.append('state', state)

    return Response.json({
      authUrl: authUrl.toString(),
      state,
    })
  } catch (error) {
    console.error('Zitadel login error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
