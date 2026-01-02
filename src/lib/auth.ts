import { env } from './env';

interface AuthState {
  isAuthenticated: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
}

const STORAGE_KEY = 'auth_state';
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Auth service for Zitadel integration
 */
export const authService = {
  /**
   * Get current auth state
   */
  getAuthState(): AuthState {
    if (typeof window === 'undefined') {
      return { isAuthenticated: false };
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const token = localStorage.getItem(TOKEN_KEY);

    if (stored && token) {
      try {
        return JSON.parse(stored);
      } catch {
        return { isAuthenticated: false };
      }
    }

    return { isAuthenticated: false };
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getAuthState().isAuthenticated;
  },

  /**
   * Get access token
   */
  getAccessToken(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return localStorage.getItem(TOKEN_KEY) || undefined;
  },

  /**
   * Get refresh token
   */
  getRefreshToken(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return localStorage.getItem(REFRESH_TOKEN_KEY) || undefined;
  },

  /**
   * Initiate Zitadel login
   */
  async initiateLogin(): Promise<void> {
    try {
      // Backend will redirect to Zitadel authorization endpoint
      if (typeof window !== 'undefined') {
        window.location.href = `${env.payloadApiUrl}/api/auth/zitadel/login`;
      }
    } catch (error) {
      console.error('Login initiation failed:', error);
      throw error;
    }
  },

  /**
   * Handle OAuth callback
   * Called after Zitadel redirects back to the app
   */
  async handleCallback(): Promise<AuthState> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Window is not available');
      }

      // Extract tokens from URL parameters
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get('access_token');
      const idToken = params.get('id_token');
      const refreshToken = params.get('refresh_token');
      const userId = params.get('user_id');
      const error = params.get('error');
      const errorDescription = params.get('error_description');

      if (error) {
        throw new Error(`Authentication failed: ${errorDescription || error}`);
      }

      if (!accessToken || !userId) {
        throw new Error('Missing authentication tokens in callback');
      }

      // Store tokens and user info
      localStorage.setItem(TOKEN_KEY, accessToken);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }

      const authState: AuthState = {
        isAuthenticated: true,
        accessToken,
        idToken: idToken || undefined,
        refreshToken: refreshToken || undefined,
        user: {
          id: userId,
          email: '', // Will be loaded from user query
          name: '',
        },
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);

      return authState;
    } catch (error) {
      console.error('Callback handling failed:', error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      window.location.href = '/';
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${env.apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
        }
      }

      return data.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return null;
    }
  },
};

/**
 * Decode JWT token (basic implementation)
 */
export const decodeToken = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const decoded = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    return decoded;
  } catch (error) {
    console.error('Token decode failed:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  return decoded.exp * 1000 < Date.now();
};
