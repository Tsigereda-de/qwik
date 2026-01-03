import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { authService } from '~/lib/auth';

export default component$(() => {
  const location = useLocation();
  const nav = useNavigate();

  useVisibleTask$(async () => {
    const params = new URLSearchParams(location.url.search);
    const code = params.get('code');
    const state = params.get('state');

    if (!code) {
      // No code provided, redirect to home
      nav('/');
      return;
    }

    try {
      // Handle the OAuth callback
      await authService.handleCallback(code, state || '');
      // Redirect to products or dashboard
      nav('/products');
    } catch (error) {
      console.error('Authentication failed:', error);
      // Redirect back to home with error
      nav('/?error=auth_failed');
    }
  });

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Authenticating...</h1>
      <p>Please wait while we complete your login.</p>
    </div>
  );
});
