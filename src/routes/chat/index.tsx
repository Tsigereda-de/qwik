import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { useNavigate } from '@builder.io/qwik-city';
import { authService } from '~/lib/auth';
import Header from '~/components/header/header';
import ChatWindow from '~/components/chat-window/chat-window';
import styles from './chat.module.css';

export default component$(() => {
  const navigate = useNavigate();
  const isAuthenticated = useSignal(false);

  useVisibleTask$(async () => {
    const authState = authService.getAuthState();

    if (!authState.isAuthenticated) {
      navigate('/');
      return;
    }

    isAuthenticated.value = true;
  });

  if (!isAuthenticated.value) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <>
      <Header />
      <div class={styles.container}>
        <h1>Community Chat</h1>
        <ChatWindow roomName="general" />
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
