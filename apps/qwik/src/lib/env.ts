/**
 * Environment variables utility
 * Provides type-safe access to environment variables
 */

/**
 * Get the redirect URI for Zitadel OAuth
 * This is a function to avoid accessing window during SSR
 */
const getZitadelRedirectUri = (): string => {
  const configured = import.meta.env.VITE_ZITADEL_REDIRECT_URI;
  if (configured) {
    return configured;
  }

  // Only access window on client side
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }

  return 'http://localhost:5173/auth/callback';
};

export const env = {
  // API Endpoints
  graphqlEndpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:3000/api/graphql',
  payloadApiUrl: import.meta.env.VITE_PAYLOAD_API_URL || 'http://localhost:3000',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',

  // Zitadel OAuth
  zitadelApiUrl: import.meta.env.VITE_ZITADEL_API_URL || '',
  zitadelClientId: import.meta.env.VITE_ZITADEL_CLIENT_ID || '',
  get zitadelRedirectUri(): string {
    return getZitadelRedirectUri();
  },

  // Matrix Chat
  matrixHomeserverUrl: import.meta.env.VITE_MATRIX_HOMESERVER_URL || '',
  matrixGuestToken: import.meta.env.VITE_MATRIX_GUEST_TOKEN || '',

  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Qwik Store',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',

  // Feature Flags
  enablePwa: import.meta.env.VITE_ENABLE_PWA === 'true',
  enableChat: import.meta.env.VITE_ENABLE_CHAT === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',

  // Helpers
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
};

/**
 * Validate that all required environment variables are set
 */
export const validateEnv = () => {
  const required = [
    'VITE_GRAPHQL_ENDPOINT',
    'VITE_ZITADEL_API_URL',
    'VITE_ZITADEL_CLIENT_ID',
  ];

  const missing = required.filter(
    (key) => !import.meta.env[key as keyof ImportMeta['env']]
  );

  if (missing.length > 0) {
    console.warn(
      `Missing environment variables: ${missing.join(', ')}. Some features may not work.`
    );
  }
};
