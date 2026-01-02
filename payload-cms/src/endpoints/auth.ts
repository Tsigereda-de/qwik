import { Request, Response } from 'express';
import { exchangeCodeForToken, getUserInfo, buildAuthorizationUrl } from '../utils/zitadel';
import crypto from 'crypto';

/**
 * GET /api/auth/zitadel-login
 * Initiates Zitadel OAuth flow
 */
export const initiateZitadelLogin = (req: Request, res: Response) => {
  const state = crypto.randomBytes(16).toString('hex');
  const redirectUri = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback`;

  // Store state in session/cache for verification (in production, use proper session management)
  // For now, we'll just generate the URL

  const authUrl = buildAuthorizationUrl(redirectUri, state);

  res.json({
    authUrl,
    state,
  });
};

/**
 * POST /api/auth/zitadel-callback
 * Handles Zitadel OAuth callback
 */
export const handleZitadelCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const redirectUri = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback`;

    // Exchange code for token
    const tokenData = await exchangeCodeForToken(code, redirectUri);

    // Get user info
    const userInfo = await getUserInfo(tokenData.access_token);

    // Create or update user in Payload
    // This would typically be done via Payload API

    return res.json({
      accessToken: tokenData.access_token,
      idToken: tokenData.id_token,
      refreshToken: tokenData.refresh_token,
      userInfo,
    });
  } catch (error) {
    console.error('Zitadel callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * POST /api/auth/logout
 * Logout user
 */
export const logout = (req: Request, res: Response) => {
  // In a real application, you would:
  // 1. Clear session/token
  // 2. Revoke token at Zitadel if necessary
  res.json({ message: 'Logged out successfully' });
};
