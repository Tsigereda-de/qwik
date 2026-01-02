import { getPayload } from 'payload'
import config from '@payload-config'
import { exchangeCodeForTokens, getUserInfo } from '@/utilities/zitadel'
import type { User } from '@/payload-types'

/**
 * GET /api/auth/zitadel/callback
 * Handles OAuth callback from Zitadel
 * Exchanges authorization code for tokens and creates/updates user
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code) {
    return Response.json({ error: 'Authorization code not provided' }, { status: 400 })
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)

    // Get user info from Zitadel
    const userInfo = await getUserInfo(tokens.access_token)

    // Get Payload instance
    const payload = await getPayload({ config })

    // Find or create user in Payload
    let user: User | null = null

    // Try to find existing user by Zitadel ID
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        zitadelId: {
          equals: userInfo.sub,
        },
      },
    })

    if (existingUser.docs.length > 0) {
      // Update existing user
      user = existingUser.docs[0]
      await payload.update({
        collection: 'users',
        id: user.id as string,
        data: {
          zitadelId: userInfo.sub,
          zitadelProfile: userInfo,
          name: userInfo.name || `${userInfo.given_name} ${userInfo.family_name}`.trim(),
          isActive: true,
        },
      })
    } else {
      // Check if user exists by email
      const userByEmail = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: userInfo.email,
          },
        },
      })

      if (userByEmail.docs.length > 0) {
        // Update existing user with Zitadel data
        user = userByEmail.docs[0]
        await payload.update({
          collection: 'users',
          id: user.id as string,
          data: {
            zitadelId: userInfo.sub,
            zitadelProfile: userInfo,
            name: userInfo.name || `${userInfo.given_name} ${userInfo.family_name}`.trim(),
            isActive: true,
          },
        })
      } else {
        // Create new user
        user = (await payload.create({
          collection: 'users',
          data: {
            email: userInfo.email,
            zitadelId: userInfo.sub,
            zitadelProfile: userInfo,
            name: userInfo.name || `${userInfo.given_name} ${userInfo.family_name}`.trim(),
            role: 'user',
            isActive: true,
            password: crypto.getRandomUUID(), // Required for auth, but not used with OAuth
          },
        })) as User
      }
    }

    // Create session/JWT token for the user
    const loginResponse = await payload.auth({
      collection: 'users',
      data: {
        email: user.email,
      },
    })

    // Store tokens and redirect to frontend callback
    const frontendCallbackUrl = new URL(`${process.env.VITE_ZITADEL_REDIRECT_URI || 'http://localhost:5173/auth/callback'}`)
    frontendCallbackUrl.searchParams.set('access_token', tokens.access_token)
    frontendCallbackUrl.searchParams.set('id_token', tokens.id_token)
    frontendCallbackUrl.searchParams.set('refresh_token', tokens.refresh_token || '')
    frontendCallbackUrl.searchParams.set('user_id', user.id as string)

    return Response.redirect(frontendCallbackUrl.toString())
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Zitadel callback error:', errorMessage)

    // Redirect to frontend with error
    const errorUrl = new URL('http://localhost:5173/auth/callback')
    errorUrl.searchParams.set('error', 'authentication_failed')
    errorUrl.searchParams.set('error_description', errorMessage)

    return Response.redirect(errorUrl.toString())
  }
}
