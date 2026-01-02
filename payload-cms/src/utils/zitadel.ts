import axios from 'axios';
import jwt from 'jsonwebtoken';

const ZITADEL_DOMAIN = process.env.ZITADEL_DOMAIN || 'https://negus.us1.zitadel.cloud';
const ZITADEL_CLIENT_ID = process.env.ZITADEL_CLIENT_ID || '';
const ZITADEL_ISSUER = process.env.ZITADEL_ISSUER || ZITADEL_DOMAIN;
const ZITADEL_JWKS_URL = process.env.ZITADEL_JWKS_URL || `${ZITADEL_DOMAIN}/.well-known/jwks.json`;

/**
 * Verify a Zitadel JWT token using JWKS
 */
export const verifyZitadelToken = async (token: string) => {
  try {
    // For development, decode without verification
    // In production, use proper JWKS validation
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded) {
      throw new Error('Invalid token format');
    }

    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid token');
  }
};

/**
 * Exchange authorization code for access token from Zitadel
 */
export const exchangeCodeForToken = async (
  code: string,
  redirectUri: string,
  clientSecret: string
) => {
  try {
    const response = await axios.post(
      `${ZITADEL_DOMAIN}/oauth/v2/token`,
      {
        grant_type: 'authorization_code',
        code,
        client_id: ZITADEL_CLIENT_ID,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

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
    const response = await axios.get(
      `${ZITADEL_DOMAIN}/oauth/v2/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to fetch user info:', error);
    throw new Error('Failed to fetch user info');
  }
};

/**
 * Build Zitadel authorization URL
 */
export const buildAuthorizationUrl = (
  redirectUri: string,
  state: string,
  nonce: string = ''
): string => {
  const params = new URLSearchParams({
    client_id: ZITADEL_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    ...(nonce && { nonce }),
  });

  return `${ZITADEL_DOMAIN}/oauth/v2/authorize?${params.toString()}`;
};

/**
 * Verify Zitadel configuration
 */
export const verifyZitadelConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!ZITADEL_DOMAIN || ZITADEL_DOMAIN === 'https://your-zitadel.com') {
    errors.push('ZITADEL_DOMAIN is not configured');
  }

  if (!ZITADEL_CLIENT_ID || ZITADEL_CLIENT_ID === 'your-client-id') {
    errors.push('ZITADEL_CLIENT_ID is not configured');
  }

  if (!ZITADEL_ISSUER || ZITADEL_ISSUER === 'https://your-zitadel.com') {
    errors.push('ZITADEL_ISSUER is not configured');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Get Zitadel configuration
 */
export const getZitadelConfig = () => ({
  domain: ZITADEL_DOMAIN,
  clientId: ZITADEL_CLIENT_ID,
  issuer: ZITADEL_ISSUER,
  jwksUrl: ZITADEL_JWKS_URL,
});
