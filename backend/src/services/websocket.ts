import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

export interface WebSocketClient {
  id: string;
  ws: WebSocket;
  userId?: string;
  lastPing: number;
}

export class WebSocketManager {
  private clients: Map<string, WebSocketClient> = new Map();
  private wss: WebSocketServer;
  private pingInterval: NodeJS.Timeout;

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.setupWebSocketServer();
    this.startPingInterval();
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const clientId = uuidv4();
      const client: WebSocketClient = {
        id: clientId,
        ws,
        lastPing: Date.now()
      };

      this.clients.set(clientId, client);
      logger.info(`WebSocket client connected: ${clientId}`);

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'connection',
        data: { 
          clientId, 
          message: 'Connected to backend server',
          timestamp: new Date().toISOString()
        }
      });

      // Handle messages from client
      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(clientId, message);
        } catch (error) {
          logger.error(`Error parsing WebSocket message from ${clientId}:`, error);
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        this.clients.delete(clientId);
        logger.info(`WebSocket client disconnected: ${clientId}`);
      });

      // Handle WebSocket errors
      ws.on('error', (error) => {
        logger.error(`WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });

      // Update ping timestamp on pong
      ws.on('pong', () => {
        const client = this.clients.get(clientId);
        if (client) {
          client.lastPing = Date.now();
        }
      });
    });
  }

  private handleClientMessage(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'ping':
        this.sendToClient(clientId, { type: 'pong', timestamp: Date.now() });
        break;
      case 'auth':
        // Handle authentication if needed
        client.userId = message.userId;
        this.sendToClient(clientId, { 
          type: 'auth_success', 
          data: { userId: message.userId } 
        });
        break;
      default:
        logger.warn(`Unknown message type from client ${clientId}:`, message.type);
    }
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      const now = Date.now();
      this.clients.forEach((client, clientId) => {
        if (now - client.lastPing > 60000) { // 60 seconds timeout
          logger.info(`Removing inactive WebSocket client: ${clientId}`);
          client.ws.terminate();
          this.clients.delete(clientId);
        } else {
          // Send ping
          if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.ping();
          }
        }
      });
    }, 30000); // Check every 30 seconds
  }

  public sendToClient(clientId: string, message: any): boolean {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      client.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      logger.error(`Error sending message to client ${clientId}:`, error);
      return false;
    }
  }

  public broadcast(message: any, excludeClientId?: string): void {
    this.clients.forEach((client, clientId) => {
      if (clientId !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
        this.sendToClient(clientId, message);
      }
    });
  }

  public sendToUser(userId: string, message: any): boolean {
    const userClients = Array.from(this.clients.values()).filter(
      client => client.userId === userId
    );

    if (userClients.length === 0) {
      return false;
    }

    userClients.forEach(client => {
      this.sendToClient(client.id, message);
    });

    return true;
  }

  public getConnectedClients(): number {
    return this.clients.size;
  }

  public close(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    this.clients.forEach(client => {
      client.ws.close();
    });
    this.clients.clear();
  }
} 