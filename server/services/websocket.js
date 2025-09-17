/**
 * WebSocket管理服务
 * 负责管理WebSocket连接和消息广播
 */
export class WebSocketManager {
  constructor(wss) {
    this.wss = wss;
    this.clients = new Map(); // userId -> WebSocket connection
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      console.log('新的WebSocket连接');

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('解析WebSocket消息失败:', error);
          ws.send(JSON.stringify({
            type: 'error',
            payload: { message: '消息格式错误' },
            timestamp: new Date()
          }));
        }
      });

      ws.on('close', () => {
        // 清理断开的连接
        for (const [userId, client] of this.clients.entries()) {
          if (client === ws) {
            this.clients.delete(userId);
            console.log(`用户 ${userId} 断开连接`);
            break;
          }
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket错误:', error);
      });

      // 发送连接确认
      ws.send(JSON.stringify({
        type: 'connected',
        payload: { message: '连接成功' },
        timestamp: new Date()
      }));
    });
  }

  handleMessage(ws, message) {
    const { type, payload } = message;

    switch (type) {
      case 'authenticate':
        this.authenticateUser(ws, payload.userId);
        break;

      case 'subscribe_flow':
        this.subscribeToFlow(ws, payload.flowId);
        break;

      case 'ping':
        ws.send(JSON.stringify({
          type: 'pong',
          payload: {},
          timestamp: new Date()
        }));
        break;

      default:
        console.log('未知的WebSocket消息类型:', type);
    }
  }

  authenticateUser(ws, userId) {
    if (!userId) {
      ws.send(JSON.stringify({
        type: 'auth_error',
        payload: { message: '用户ID不能为空' },
        timestamp: new Date()
      }));
      return;
    }

    // 保存用户连接
    this.clients.set(userId, ws);
    ws.userId = userId;

    ws.send(JSON.stringify({
      type: 'authenticated',
      payload: { userId },
      timestamp: new Date()
    }));

    console.log(`用户 ${userId} 认证成功`);
  }

  subscribeToFlow(ws, flowId) {
    if (!ws.subscriptions) {
      ws.subscriptions = new Set();
    }
    ws.subscriptions.add(flowId);

    ws.send(JSON.stringify({
      type: 'subscribed',
      payload: { flowId },
      timestamp: new Date()
    }));

    console.log(`用户 ${ws.userId} 订阅流程 ${flowId}`);
  }

  // 向特定用户发送消息
  sendToUser(userId, message) {
    const client = this.clients.get(userId);
    if (client && client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  // 向所有连接的客户端广播消息
  broadcast(message) {
    const messageStr = JSON.stringify(message);

    this.wss.clients.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(messageStr);
      }
    });
  }

  // 向特定流程的订阅者发送消息
  broadcastToFlow(flowId, message) {
    const messageStr = JSON.stringify(message);

    this.wss.clients.forEach(client => {
      if (client.readyState === client.OPEN &&
          client.subscriptions &&
          client.subscriptions.has(flowId)) {
        client.send(messageStr);
      }
    });
  }

  // 获取在线用户数
  getOnlineUserCount() {
    return this.clients.size;
  }

  // 获取活跃连接数
  getActiveConnectionCount() {
    return this.wss.clients.size;
  }

  // 断开特定用户连接
  disconnectUser(userId) {
    const client = this.clients.get(userId);
    if (client) {
      client.terminate();
      this.clients.delete(userId);
      return true;
    }
    return false;
  }

  // 清理断开的连接
  cleanup() {
    for (const [userId, client] of this.clients.entries()) {
      if (client.readyState !== client.OPEN) {
        this.clients.delete(userId);
      }
    }
  }
}