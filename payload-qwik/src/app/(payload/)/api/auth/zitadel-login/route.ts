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

export async function GET(request: Request) {
  try {
    const zitadelApiUrl = process.env.ZITADEL_API_URL
    const clientId = process.env.ZITADEL_CLIENT_ID
    const redirectUri = process.env.ZITADEL_REDIRECT_URI

    console.log('[Zitadel Login] Endpoint called')
    console.log('[Zitadel Login] ZITADEL_API_URL:', zitadelApiUrl ? '***set***' : 'NOT SET')
    console.log('[Zitadel Login] ZITADEL_CLIENT_ID:', clientId ? '***set***' : 'NOT SET')
    console.log('[Zitadel Login] ZITADEL_REDIRECT_URI:', redirectUri ? '***set***' : 'NOT SET')

    if (!zitadelApiUrl || !clientId || !redirectUri) {
      const missingVars = []
      if (!zitadelApiUrl) missingVars.push('ZITADEL_API_URL')
      if (!clientId) missingVars.push('ZITADEL_CLIENT_ID')
      if (!redirectUri) missingVars.push('ZITADEL_REDIRECT_URI')

      const errorMsg = `Missing Zitadel environment variables: ${missingVars.join(', ')}`
      console.error('[Zitadel Login]', errorMsg)

      return Response.json(
        { error: 'Server configuration error', details: errorMsg },
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

    console.log('[Zitadel Login] Authorization URL generated successfully')

    return Response.json({
      authUrl: authUrl.toString(),
      state,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[Zitadel Login] Error:', errorMessage)

    return Response.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 },
    )
  }
}
