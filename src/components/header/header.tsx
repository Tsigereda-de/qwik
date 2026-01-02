import { component$, useSignal, useEffect$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { authService } from '~/lib/auth';
import styles from './header.module.css';

export default component$(() => {
  const isAuthenticated = useSignal(false);
  const userName = useSignal<string>('');

  useEffect$(() => {
    const authState = authService.getAuthState();
    isAuthenticated.value = authState.isAuthenticated;
    userName.value = authState.user?.name || authState.user?.email || '';
  });

  const handleLogin = $(async () => {
    await authService.initiateLogin();
  });

  const handleLogout = $(() => {
    authService.logout();
    isAuthenticated.value = false;
  });

  return (
    <header class={styles.header}>
      <div class={styles.container}>
        <Link href="/" class={styles.logo}>
          <h1>Qwik Store</h1>
        </Link>

        <nav class={styles.nav}>
          <Link href="/products" class={styles.navLink}>
            Products
          </Link>
          {isAuthenticated.value && (
            <Link href="/chat" class={styles.navLink}>
              Chat
            </Link>
          )}
        </nav>

        <div class={styles.auth}>
          {isAuthenticated.value ? (
            <div class={styles.userMenu}>
              <span class={styles.userName}>{userName.value}</span>
              <button
                onClick$={handleLogout}
                class={styles.logoutBtn}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick$={handleLogin}
              class={styles.loginBtn}
            >
              Login with Zitadel
            </button>
          )}
        </div>
      </div>
    </header>
  );
});
