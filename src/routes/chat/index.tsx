import { component$, useSignal, useEffect$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { useNavigate } from '@builder.io/qwik-city';
import { authService } from '~/lib/auth';
import { getMatrixClient } from '~/lib/matrix-client';
import Header from '~/components/header/header';
import ChatWindow from '~/components/chat-window/chat-window';
import styles from './chat.module.css';

export default component$(() => {
  const navigate = useNavigate();
  const isAuthenticated = useSignal(false);
  const loading = useSignal(true);
  const error = useSignal<string | null>(null);
  const roomId = useSignal<string | null>(null);

  useEffect$(async () => {
    const authState = authService.getAuthState();

    if (!authState.isAuthenticated) {
      navigate('/');
      return;
    }

    isAuthenticated.value = true;

    try {
      const client = getMatrixClient();
      const token = authService.getAccessToken();

      if (!token || !authState.user?.id) {
        throw new Error('Authentication required for chat');
      }

      // Initialize Matrix client
      await client.init(authState.user.id, token);

      // Join or create a general chat room
      const id = await client.joinOrCreateRoom('general');
      roomId.value = id;

      // Load initial messages
      await client.loadMessages(20);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize chat';
      console.error('Chat initialization error:', err);
    } finally {
      loading.value = false;
    }
  });

  if (!isAuthenticated.value) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <>
      <Header />
      <div class={styles.container}>
        <h1>Community Chat</h1>

        {loading.value && (
          <div class={styles.loading}>
            <p>Initializing chat...</p>
          </div>
        )}

        {error.value && (
          <div class={styles.error}>
            <p>Error: {error.value}</p>
          </div>
        )}

        {!loading.value && roomId.value && (
          <ChatWindow roomId={roomId.value} />
        )}
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: 'Chat - Qwik Store',
  meta: [
    {
      name: 'description',
      content: 'Connect with other users in our community chat',
    },
  ],
};
