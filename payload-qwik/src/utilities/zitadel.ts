/**
 * Zitadel OAuth2/OIDC Integration
 * Handles authentication with Zitadel identity provider
 */

interface ZitadelConfig {
  apiUrl: string
  clientId: string
  clientSecret: string
  redirectUri: string
}

interface ZitadelTokenResponse {
  access_token: string
  id_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
}

interface ZitadelUserInfo {
  sub: string
  email: string
  name?: string
  given_name?: string
  family_name?: string
  picture?: string
  locale?: string
  email_verified?: boolean
}

/**
 * Get Zitadel configuration from environment variables
 */
export function getZitadelConfig(): ZitadelConfig {
  const apiUrl = process.env.ZITADEL_API_URL
  const clientId = process.env.ZITADEL_CLIENT_ID
  const clientSecret = process.env.ZITADEL_CLIENT_SECRET
  const redirectUri = process.env.ZITADEL_REDIRECT_URI

  if (!apiUrl || !clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Zitadel environment variables not configured. Please set ZITADEL_API_URL, ZITADEL_CLIENT_ID, ZITADEL_CLIENT_SECRET, and ZITADEL_REDIRECT_URI'
    )
  }

  return { apiUrl, clientId, clientSecret, redirectUri }
}

/**
 * Generate Zitadel authorization URL
 */
export function generateAuthorizationUrl(state?: string): string {
  const config = getZitadelConfig()
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state: state || crypto.getRandomValues(new Uint8Array(16)).toString(),
  })

  return `${config.apiUrl}/oauth/v2/authorize?${params.toString()}`
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<ZitadelTokenResponse> {
  const config = getZitadelConfig()

  const response = await fetch(`${config.apiUrl}/oauth/v2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
    }).toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Zitadel token exchange failed: ${error}`)
  }

  return response.json()
}

/**
 * Get user info from access token
 */
export async function getUserInfo(accessToken: string): Promise<ZitadelUserInfo> {
  const config = getZitadelConfig()

  const response = await fetch(`${config.apiUrl}/oauth/v2/userinfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to fetch user info: ${error}`)
  }

  return response.json()
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<ZitadelTokenResponse> {
  const config = getZitadelConfig()

  const response = await fetch(`${config.apiUrl}/oauth/v2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }).toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token refresh failed: ${error}`)
  }

  return response.json()
}
