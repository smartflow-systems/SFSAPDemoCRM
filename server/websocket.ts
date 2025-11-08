/**
 * WebSocket Notification System
 * Real-time notifications for CRM events
 */

import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

export interface NotificationMessage {
  type: 'lead_created' | 'lead_updated' | 'opportunity_won' | 'task_due' | 'system_alert';
  title: string;
  message: string;
  userId?: string;
  data?: any;
  timestamp: Date;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

export class NotificationService {
  private wss: WebSocketServer;
  private clients: Map<string, Set<AuthenticatedWebSocket>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.setupWebSocketServer();
    this.startHeartbeat();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: AuthenticatedWebSocket, request: IncomingMessage) => {
      console.log('New WebSocket connection established');

      // Mark connection as alive
      ws.isAlive = true;

      // Handle pong messages for heartbeat
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle authentication message
      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());

          if (data.type === 'auth' && data.userId) {
            this.authenticateClient(ws, data.userId);
            ws.send(JSON.stringify({
              type: 'auth_success',
              message: 'Authentication successful',
              timestamp: new Date()
            }));
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        this.removeClient(ws);
      });

      // Send initial connection message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to notification service',
        timestamp: new Date()
      }));
    });
  }

  private authenticateClient(ws: AuthenticatedWebSocket, userId: string) {
    ws.userId = userId;

    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }

    this.clients.get(userId)?.add(ws);
    console.log(`User ${userId} authenticated`);
  }

  private removeClient(ws: AuthenticatedWebSocket) {
    if (ws.userId) {
      const userClients = this.clients.get(ws.userId);
      if (userClients) {
        userClients.delete(ws);
        if (userClients.size === 0) {
          this.clients.delete(ws.userId);
        }
      }
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws: WebSocket) => {
        const authenticatedWs = ws as AuthenticatedWebSocket;

        if (authenticatedWs.isAlive === false) {
          console.log('Terminating inactive connection');
          return authenticatedWs.terminate();
        }

        authenticatedWs.isAlive = false;
        authenticatedWs.ping();
      });
    }, 30000); // 30 seconds
  }

  /**
   * Send notification to specific user
   */
  public notifyUser(userId: string, notification: NotificationMessage) {
    const userClients = this.clients.get(userId);

    if (userClients) {
      const message = JSON.stringify(notification);
      userClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  /**
   * Broadcast notification to all connected users
   */
  public broadcast(notification: NotificationMessage) {
    const message = JSON.stringify(notification);

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  /**
   * Send notification to multiple users
   */
  public notifyUsers(userIds: string[], notification: NotificationMessage) {
    userIds.forEach((userId) => {
      this.notifyUser(userId, notification);
    });
  }

  /**
   * Get count of active connections
   */
  public getActiveConnectionsCount(): number {
    return this.wss.clients.size;
  }

  /**
   * Get count of authenticated users
   */
  public getAuthenticatedUsersCount(): number {
    return this.clients.size;
  }

  /**
   * Cleanup on server shutdown
   */
  public shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.wss.clients.forEach((client) => {
      client.close();
    });

    this.wss.close();
  }
}

/**
 * Helper function to create notifications for common CRM events
 */
export const createNotification = {
  leadCreated: (leadName: string, ownerId: string): NotificationMessage => ({
    type: 'lead_created',
    title: 'New Lead',
    message: `New lead "${leadName}" has been created`,
    userId: ownerId,
    timestamp: new Date(),
    priority: 'medium'
  }),

  leadUpdated: (leadName: string, ownerId: string): NotificationMessage => ({
    type: 'lead_updated',
    title: 'Lead Updated',
    message: `Lead "${leadName}" has been updated`,
    userId: ownerId,
    timestamp: new Date(),
    priority: 'low'
  }),

  opportunityWon: (opportunityName: string, amount: number, ownerId: string): NotificationMessage => ({
    type: 'opportunity_won',
    title: 'Opportunity Won!',
    message: `Congratulations! "${opportunityName}" won - $${amount.toLocaleString()}`,
    userId: ownerId,
    timestamp: new Date(),
    priority: 'high',
    data: { amount }
  }),

  taskDue: (taskName: string, ownerId: string): NotificationMessage => ({
    type: 'task_due',
    title: 'Task Due',
    message: `Task "${taskName}" is due soon`,
    userId: ownerId,
    timestamp: new Date(),
    priority: 'high'
  }),

  systemAlert: (message: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'): NotificationMessage => ({
    type: 'system_alert',
    title: 'System Alert',
    message,
    timestamp: new Date(),
    priority
  })
};
