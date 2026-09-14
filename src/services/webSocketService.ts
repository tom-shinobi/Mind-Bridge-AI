/**
 * MindBridge AI - WebSocket Real-Time Client Service
 * Provides bidirectional real-time synchronization for Campus Pulse posts,
 * comments, likes, Discord study squads, Instagram direct messages,
 * typing indicators, presence, and RTSC (WebRTC) streaming signaling.
 */

import type {
  Post,
  ChatMessage,
  DirectMessage,
  PostComment,
  StudentProfile
} from '../types';

export type WebSocketStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

export interface PresenceInfo {
  onlineCount: number;
  user?: Partial<StudentProfile>;
}

export interface TypingInfo {
  scope: 'channel' | 'dm';
  targetId: string;
  userId: string;
  userName: string;
  userHandle?: string;
  isTyping: boolean;
}

export interface RtscSignalPayload {
  fromUserId?: string;
  fromHandle?: string;
  channelId?: string;
  signalData: any;
}

type EventCallback<T = any> = (data: T) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private status: WebSocketStatus = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: any = null;
  private heartbeatTimer: any = null;
  private messageQueue: string[] = [];
  private currentUser: Partial<StudentProfile> | null = null;
  private onlineCount = 1;

  // Event Listeners Map
  private listeners: Map<string, Set<EventCallback>> = new Map();

  constructor() {
    // Start connection in browser environments
    if (typeof window !== 'undefined') {
      // Connect after short tick to allow app initialization
      setTimeout(() => this.connect(), 200);

      // Reconnect when device comes back online or screen unlocks
      window.addEventListener('online', () => {
        console.log('[WebSocket] Device back online, reconnecting...');
        this.reconnect();
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.status !== 'connected') {
          this.reconnect();
        }
      });
    }
  }

  // =========================================================================
  // CONNECTION MANAGEMENT
  // =========================================================================

  public connect(): void {
    if (typeof window === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.setStatus(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting');

    const wsUrl = this.resolveWebSocketUrl();

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected to MindBridge Real-Time Hub:', wsUrl);
        this.reconnectAttempts = 0;
        this.setStatus('connected');

        // Re-identify if current user is set
        if (this.currentUser) {
          this.identify(this.currentUser);
        }

        // Flush any queued messages
        while (this.messageQueue.length > 0) {
          const queued = this.messageQueue.shift();
          if (queued) this.ws?.send(queued);
        }

        // Start heartbeat ping check
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          this.handleIncomingMessage(packet);
        } catch (err) {
          console.warn('[WebSocket] Invalid JSON packet received:', err);
        }
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        this.setStatus('disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[WebSocket] Connection error:', err);
        this.ws?.close();
      };
    } catch (err) {
      console.warn('[WebSocket] Failed to establish socket:', err);
      this.setStatus('disconnected');
      this.scheduleReconnect();
    }
  }

  public reconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.connect();
  }

  private resolveWebSocketUrl(): string {
    const isHttps = window.location.protocol === 'https:';
    const proto = isHttps ? 'wss:' : 'ws:';
    const host = window.location.host;

    // If running in local Vite dev server on port 5173, fallback to port 3000 where server.js runs
    if (host.includes('localhost:5173') || host.includes('127.0.0.1:5173')) {
      return `ws://${window.location.hostname}:3000/ws`;
    }

    return `${proto}//${host}/ws`;
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(1.4, this.reconnectAttempts), 10000);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private setStatus(newStatus: WebSocketStatus): void {
    if (this.status === newStatus) return;
    this.status = newStatus;
    this.emit('connection_change', { status: newStatus, onlineCount: this.onlineCount });
  }

  public getStatus(): WebSocketStatus {
    return this.status;
  }

  public isConnected(): boolean {
    return this.status === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  public getOnlineCount(): number {
    return this.onlineCount;
  }

  // Heartbeat keep-alive
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        try {
          this.ws?.send(JSON.stringify({ type: 'ping' }));
        } catch {}
      }
    }, 25000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // =========================================================================
  // MESSAGE SENDING & INCOMING DISPATCH
  // =========================================================================

  public send(type: string, payload: Record<string, any> = {}): boolean {
    const data = JSON.stringify({ type, ...payload });
    if (this.isConnected()) {
      try {
        this.ws?.send(data);
        return true;
      } catch (e) {
        console.warn('[WebSocket] Send failed, queuing:', e);
        this.messageQueue.push(data);
        return false;
      }
    } else {
      // Queue message to send once reconnected
      if (this.messageQueue.length < 50) {
        this.messageQueue.push(data);
      }
      return false;
    }
  }

  private handleIncomingMessage(packet: any): void {
    if (!packet || !packet.type) return;

    switch (packet.type) {
      case 'sync':
        if (packet.onlineCount !== undefined) this.onlineCount = packet.onlineCount;
        this.emit('sync', packet);
        this.emit('connection_change', { status: this.status, onlineCount: this.onlineCount });
        break;

      case 'presence':
        if (packet.onlineCount !== undefined) this.onlineCount = packet.onlineCount;
        this.emit('presence', packet);
        this.emit('connection_change', { status: this.status, onlineCount: this.onlineCount });
        break;

      case 'post_created':
        this.emit('post_created', packet.post);
        break;

      case 'post_liked':
        this.emit('post_liked', packet);
        break;

      case 'post_comment':
        this.emit('post_comment', packet);
        break;

      case 'post_deleted':
        this.emit('post_deleted', packet.postId);
        break;

      case 'channel_message':
        this.emit('channel_message', packet);
        break;

      case 'dm_message':
        this.emit('dm_message', packet);
        break;

      case 'typing':
        this.emit('typing', packet);
        break;

      case 'rtsc_signal':
        this.emit('rtsc_signal', packet);
        break;

      default:
        this.emit(packet.type, packet);
        break;
    }
  }

  // =========================================================================
  // TYPED PUBLIC ACTIONS
  // =========================================================================

  public identify(user: Partial<StudentProfile>): void {
    this.currentUser = user;
    this.send('identify', { user });
  }

  public sendPostCreate(post: Post): void {
    this.send('post_create', { post });
  }

  public sendPostLike(postId: string, userId: string): void {
    this.send('post_like', { postId, userId });
  }

  public sendPostComment(postId: string, comment: PostComment): void {
    this.send('post_comment', { postId, comment });
  }

  public sendPostDelete(postId: string): void {
    this.send('post_delete', { postId });
  }

  public sendChannelMessage(serverId: string, channelId: string, message: ChatMessage): void {
    this.send('channel_message', { serverId, channelId, message });
  }

  public sendDirectMessage(conversationId: string, message: DirectMessage): void {
    this.send('dm_message', { conversationId, message });
  }

  public sendTyping(
    scope: 'channel' | 'dm',
    targetId: string,
    userId: string,
    userName: string,
    userHandle?: string,
    isTyping: boolean = true
  ): void {
    this.send('typing', {
      scope,
      targetId,
      userId,
      userName,
      userHandle,
      isTyping
    });
  }

  /**
   * Real-Time Streaming Communication (RTSC / WebRTC Signaling)
   * Sends offer, answer, ice candidates, or media stream negotiation packets
   */
  public sendRtscSignal(targetUserId: string | undefined, signalData: any, channelId?: string): void {
    this.send('rtsc_signal', {
      targetUserId,
      channelId,
      signalData,
      fromUserId: this.currentUser?.id
    });
  }

  // =========================================================================
  // EVENT SUBSCRIPTIONS
  // =========================================================================

  public on<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[WebSocket] Error in ${event} callback:`, e);
        }
      });
    }
  }

  public onPostCreated(cb: (post: Post) => void): () => void {
    return this.on('post_created', cb);
  }

  public onPostLiked(cb: (data: { postId: string; likesCount: number; likedBy: string[] }) => void): () => void {
    return this.on('post_liked', cb);
  }

  public onPostComment(cb: (data: { postId: string; comment: PostComment; commentsCount: number }) => void): () => void {
    return this.on('post_comment', cb);
  }

  public onPostDeleted(cb: (postId: string) => void): () => void {
    return this.on('post_deleted', cb);
  }

  public onChannelMessage(cb: (data: { serverId: string; channelId: string; message: ChatMessage }) => void): () => void {
    return this.on('channel_message', cb);
  }

  public onDirectMessage(cb: (data: { conversationId: string; message: DirectMessage }) => void): () => void {
    return this.on('dm_message', cb);
  }

  public onTyping(cb: (data: TypingInfo) => void): () => void {
    return this.on('typing', cb);
  }

  public onPresence(cb: (data: PresenceInfo) => void): () => void {
    return this.on('presence', cb);
  }

  public onRtscSignal(cb: (data: RtscSignalPayload) => void): () => void {
    return this.on('rtsc_signal', cb);
  }

  public onConnectionChange(cb: (data: { status: WebSocketStatus; onlineCount: number }) => void): () => void {
    return this.on('connection_change', cb);
  }
}

export const webSocketService = new WebSocketService();
