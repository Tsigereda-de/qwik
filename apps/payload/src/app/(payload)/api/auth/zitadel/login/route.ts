import { generateAuthorizationUrl } from '@/utilities/zitadel'

/**
 * GET /api/auth/zitadel/login
 * Redirects user to Zitadel authorization endpoint
 */
export async function GET() {
  try {
    const authUrl = generateAuthorizationUrl()
    return Response.redirect(authUrl)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return Response.json(
      { error: 'Failed to initiate login', details: errorMessage },
      { status: 500 }
    )
  }
}
