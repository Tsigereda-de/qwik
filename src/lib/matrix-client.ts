import { env } from './env';

interface MatrixMessage {
  id: string;
  content: {
    body: string;
    msgtype: string;
  };
  sender: string;
  timestamp: number;
  type: string;
}

interface MatrixRoom {
  id: string;
  name: string;
  topic?: string;
  unreadCount?: number;
}

interface MatrixUser {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
}

/**
 * Matrix chat client for real-time messaging
 * Uses matrix-js-sdk under the hood
 */
export class MatrixChatClient {
  private homeserverUrl: string;
  private accessToken: string | null = null;
  private userId: string | null = null;
  private roomId: string | null = null;
  private messages: MatrixMessage[] = [];
  private messageListeners: Array<(messages: MatrixMessage[]) => void> = [];

  constructor(homeserverUrl: string = env.matrixHomeserverUrl) {
    this.homeserverUrl = homeserverUrl;
  }

  /**
   * Initialize client with user authentication
   */
  async init(userId: string, accessToken: string): Promise<void> {
    this.userId = userId;
    this.accessToken = accessToken;
  }

  /**
   * Get list of joined rooms
   */
  async getRooms(): Promise<MatrixRoom[]> {
    try {
      const response = await fetch(
        `${this.homeserverUrl}/_matrix/client/r0/sync`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const rooms: MatrixRoom[] = [];

      for (const roomId of Object.keys(data.rooms?.join || {})) {
        const roomData = data.rooms.join[roomId];
        const nameEvent = roomData.state?.events?.find(
          (e: any) => e.type === 'm.room.name'
        );

        rooms.push({
          id: roomId,
          name: nameEvent?.content?.name || roomId,
          topic: roomData.state?.events?.find(
            (e: any) => e.type === 'm.room.topic'
          )?.content?.topic,
        });
      }

      return rooms;
    } catch (error) {
      console.error('Failed to get rooms:', error);
      return [];
    }
  }

  /**
   * Join a room or create if it doesn't exist
   */
  async joinOrCreateRoom(roomNameOrId: string): Promise<string> {
    try {
      // Try to join existing room
      const joinResponse = await fetch(
        `${this.homeserverUrl}/_matrix/client/r0/join/${encodeURIComponent(roomNameOrId)}`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({}),
        }
      );

      if (joinResponse.ok) {
        const data = await joinResponse.json();
        this.roomId = data.room_id;
        return data.room_id;
      }

      // If join fails, try to create new room
      const createResponse = await fetch(
        `${this.homeserverUrl}/_matrix/client/r0/createRoom`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            room_alias_name: roomNameOrId.toLowerCase(),
            name: roomNameOrId,
            preset: 'public_chat',
          }),
        }
      );

      if (!createResponse.ok) {
        throw new Error('Failed to join or create room');
      }

      const data = await createResponse.json();
      this.roomId = data.room_id;
      return data.room_id;
    } catch (error) {
      console.error('Failed to join/create room:', error);
      throw error;
    }
  }

  /**
   * Load message history for a room
   */
  async loadMessages(limit: number = 20): Promise<MatrixMessage[]> {
    if (!this.roomId) {
      throw new Error('No room selected');
    }

    try {
      const response = await fetch(
        `${this.homeserverUrl}/_matrix/client/r0/rooms/${encodeURIComponent(this.roomId)}/messages?limit=${limit}&dir=b`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      this.messages = (data.chunk || [])
        .filter((e: any) => e.type === 'm.room.message')
        .reverse()
        .map((e: any) => ({
          id: e.event_id,
          content: e.content,
          sender: e.sender,
          timestamp: e.origin_server_ts,
          type: e.type,
        }));

      return this.messages;
    } catch (error) {
      console.error('Failed to load messages:', error);
      return [];
    }
  }

  /**
   * Send a message to the current room
   */
  async sendMessage(body: string): Promise<void> {
    if (!this.roomId) {
      throw new Error('No room selected');
    }

    try {
      const response = await fetch(
        `${this.homeserverUrl}/_matrix/client/r0/rooms/${encodeURIComponent(this.roomId)}/send/m.room.message?access_token=${this.accessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            msgtype: 'm.text',
            body,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Reload messages after sending
      await this.loadMessages();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Subscribe to message updates
   */
  onMessagesUpdate(listener: (messages: MatrixMessage[]) => void): void {
    this.messageListeners.push(listener);
  }

  /**
   * Unsubscribe from message updates
   */
  offMessagesUpdate(listener: (messages: MatrixMessage[]) => void): void {
    this.messageListeners = this.messageListeners.filter((l) => l !== listener);
  }

  /**
   * Get current messages
   */
  getMessages(): MatrixMessage[] {
    return this.messages;
  }

  /**
   * Notify all listeners of message updates
   */
  private notifyListeners(): void {
    this.messageListeners.forEach((listener) => {
      listener(this.messages);
    });
  }

  /**
   * Get authorization headers
   */
  private getAuthHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(this.accessToken && {
        Authorization: `Bearer ${this.accessToken}`,
      }),
    };
  }

  /**
   * Leave current room
   */
  async leaveRoom(): Promise<void> {
    if (!this.roomId) {
      return;
    }

    try {
      await fetch(
        `${this.homeserverUrl}/_matrix/client/r0/rooms/${encodeURIComponent(this.roomId)}/leave`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({}),
        }
      );

      this.roomId = null;
      this.messages = [];
    } catch (error) {
      console.error('Failed to leave room:', error);
    }
  }
}

// Export singleton instance
let instance: MatrixChatClient | null = null;

export const getMatrixClient = (): MatrixChatClient => {
  if (!instance) {
    instance = new MatrixChatClient();
  }
  return instance;
};
