import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useFlowStore } from '../stores/flowStore';

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: any;
  sendMessage: (message: any) => void;
  subscribe: (flowId: string) => void;
  unsubscribe: (flowId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionsRef = useRef<Set<string>>(new Set());

  const { updateFlowData, currentUser } = useFlowStore();

  // 连接WebSocket
  const connect = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket连接已建立');
        setIsConnected(true);

        // 认证用户
        if (currentUser) {
          sendMessage({
            type: 'authenticate',
            payload: { userId: currentUser }
          });
        }

        // 重新订阅之前的Flow
        subscriptionsRef.current.forEach(flowId => {
          sendMessage({
            type: 'subscribe_flow',
            payload: { flowId }
          });
        });

        // 清除重连定时器
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);
          handleMessage(message);
        } catch (error) {
          console.error('解析WebSocket消息失败:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket连接已关闭');
        setIsConnected(false);

        // 自动重连
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('尝试重新连接WebSocket...');
            connect();
          }, 3000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket错误:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('创建WebSocket连接失败:', error);
      setIsConnected(false);
    }
  };

  // 处理收到的消息
  const handleMessage = (message: any) => {
    const { type, payload } = message;

    switch (type) {
      case 'connected':
        console.log('WebSocket认证成功');
        break;

      case 'authenticated':
        console.log('用户认证成功:', payload.userId);
        break;

      case 'flow_started':
        console.log('Flow已启动:', payload.flowId);
        break;

      case 'flow_updated':
        if (payload.flowId && payload.flow) {
          updateFlowData(payload.flowId, payload.flow);
        }
        break;

      case 'execution_update':
        if (payload.flowId && payload.status) {
          updateFlowData(payload.flowId, {
            executionStatus: payload.status
          });
        }
        break;

      case 'approval_required':
        if (payload.flowId && payload.approvalRequest) {
          updateFlowData(payload.flowId, {
            approvalRequest: payload.approvalRequest,
            status: 'awaiting_approval'
          });

          // 可以在这里显示通知
          console.log('需要审批:', payload.approvalRequest);
        }
        break;

      case 'task_complete':
        console.log('任务完成:', payload);
        break;

      case 'error':
        console.error('WebSocket错误消息:', payload);
        break;

      case 'pong':
        // 心跳响应
        break;

      default:
        console.log('未处理的WebSocket消息:', type, payload);
    }
  };

  // 发送消息
  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ...message,
        timestamp: new Date()
      }));
    } else {
      console.warn('WebSocket未连接，无法发送消息');
    }
  };

  // 订阅Flow更新
  const subscribe = (flowId: string) => {
    subscriptionsRef.current.add(flowId);
    sendMessage({
      type: 'subscribe_flow',
      payload: { flowId }
    });
  };

  // 取消订阅Flow
  const unsubscribe = (flowId: string) => {
    subscriptionsRef.current.delete(flowId);
  };

  // 初始化连接
  useEffect(() => {
    connect();

    // 心跳检测
    const heartbeatInterval = setInterval(() => {
      if (isConnected) {
        sendMessage({ type: 'ping', payload: {} });
      }
    }, 30000); // 30秒发送一次心跳

    return () => {
      clearInterval(heartbeatInterval);

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // 用户变更时重新认证
  useEffect(() => {
    if (isConnected && currentUser) {
      sendMessage({
        type: 'authenticate',
        payload: { userId: currentUser }
      });
    }
  }, [currentUser, isConnected]);

  const contextValue: WebSocketContextType = {
    isConnected,
    lastMessage,
    sendMessage,
    subscribe,
    unsubscribe
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};