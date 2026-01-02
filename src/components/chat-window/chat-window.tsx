import { component$, useSignal, useVisibleTask$, $ } from '@builder.io/qwik';
import { getMatrixClient } from '~/lib/matrix-client';
import { authService } from '~/lib/auth';
import type { MatrixMessage } from '~/lib/matrix-client';
import styles from './chat-window.module.css';

interface ChatWindowProps {
  roomId: string;
}

export default component$<ChatWindowProps>(({ roomId }) => {
  const messages = useSignal<MatrixMessage[]>([]);
  const messageInput = useSignal('');
  const loading = useSignal(true);
  const sending = useSignal(false);
  const error = useSignal<string | null>(null);

  useVisibleTask$(async () => {
    try {
      const client = getMatrixClient();

      // Load initial messages
      const initialMessages = await client.loadMessages(30);
      messages.value = initialMessages;

      // Subscribe to message updates
      const updateHandler = $(
        (updatedMessages: MatrixMessage[]) => {
          messages.value = updatedMessages;
        }
      );
      client.onMessagesUpdate(updateHandler);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load messages';
      console.error('Failed to load messages:', err);
    } finally {
      loading.value = false;
    }
  });

  const sendMessage = $(async () => {
    if (!messageInput.value.trim()) {
      return;
    }

    sending.value = true;
    try {
      const client = getMatrixClient();
      await client.sendMessage(messageInput.value);
      messageInput.value = '';
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send message';
      console.error('Failed to send message:', err);
    } finally {
      sending.value = false;
    }
  });

  const handleKeyDown = $(
    async (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        await sendMessage();
      }
    }
  );

  const currentUser = authService.getAuthState().user;

  return (
    <div class={styles.chatWindow}>
      {error.value && (
        <div class={styles.errorBanner}>
          <p>{error.value}</p>
        </div>
      )}

      <div class={styles.messagesContainer}>
        {loading.value ? (
          <div class={styles.loadingState}>
            <p>Loading messages...</p>
          </div>
        ) : messages.value.length === 0 ? (
          <div class={styles.emptyState}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div class={styles.messagesList}>
            {messages.value.map((message) => {
              const isCurrentUser = message.sender === currentUser?.id;
              const date = new Date(message.timestamp);
              const timeString = date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={message.id}
                  class={[styles.message, isCurrentUser && styles.messageSelf]}
                >
                  <div class={styles.messageContent}>
                    <div class={styles.messageBubble}>
                      {message.content.body}
                    </div>
                    <span class={styles.messageTime}>{timeString}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div class={styles.inputContainer}>
        <textarea
          class={styles.input}
          placeholder="Type a message... (Shift+Enter for new line)"
          value={messageInput.value}
          onInput$={(event) => {
            messageInput.value = (event.target as HTMLTextAreaElement).value;
          }}
          onKeyDown$={handleKeyDown}
          disabled={sending.value}
          rows={3}
        />
        <button
          class={styles.sendButton}
          onClick$={sendMessage}
          disabled={sending.value || !messageInput.value.trim()}
        >
          {sending.value ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
});
