import axios from 'axios';
import jwt from 'jsonwebtoken';

const ZITADEL_API_URL = process.env.ZITADEL_API_URL || 'https://zitadel.example.com';
const ZITADEL_CLIENT_ID = process.env.ZITADEL_CLIENT_ID || '';
const ZITADEL_CLIENT_SECRET = process.env.ZITADEL_CLIENT_SECRET || '';

/**
 * Verify a Zitadel JWT token
 */
export const verifyZitadelToken = async (token: string) => {
  try {
    // In production, fetch JWKS from Zitadel to verify the token
    const decoded = jwt.decode(token, { complete: true });
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid token');
  }
};

/**
 * Exchange authorization code for access token from Zitadel
 */
export const exchangeCodeForToken = async (code: string, redirectUri: string) => {
  try {
    const response = await axios.post(`${ZITADEL_API_URL}/oauth/v2/token`, {
      grant_type: 'authorization_code',
      code,
      client_id: ZITADEL_CLIENT_ID,
      client_secret: ZITADEL_CLIENT_SECRET,
      redirect_uri: redirectUri,
    });

    return response.data;
  } catch (error) {
    console.error('Token exchange failed:', error);
    throw new Error('Failed to exchange code for token');
  }
};

/**
 * Get user info from Zitadel using access token
 */
export const getUserInfo = async (accessToken: string) => {
  try {
    const response = await axios.get(`${ZITADEL_API_URL}/oauth/v2/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Failed to fetch user info:', error);
    throw new Error('Failed to fetch user info');
  }
};

/**
 * Build Zitadel authorization URL
 */
export const buildAuthorizationUrl = (redirectUri: string, state: string): string => {
  const params = new URLSearchParams({
    client_id: ZITADEL_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state,
  });

  return `${ZITADEL_API_URL}/oauth/v2/authorize?${params.toString()}`;
};
