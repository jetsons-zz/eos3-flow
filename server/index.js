import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';

// 路由导入
import objectiveRoutes from './routes/objectives.js';
import proposalRoutes from './routes/proposals.js';
import simulationRoutes from './routes/simulation.js';
import approvalRoutes from './routes/approval.js';
import executionRoutes from './routes/execution.js';

// 服务导入
import { WebSocketManager } from './services/websocket.js';
import { FlowOrchestrator } from './services/orchestrator.js';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// 全局中间件
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// WebSocket管理器初始化
const wsManager = new WebSocketManager(wss);
const orchestrator = new FlowOrchestrator(wsManager);

// 将服务实例添加到请求上下文
app.use((req, res, next) => {
  req.wsManager = wsManager;
  req.orchestrator = orchestrator;
  next();
});

// API路由
app.use('/api/objectives', objectiveRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/execution', executionRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 8082;

server.listen(PORT, () => {
  console.log(`🚀 Flow服务器启动成功`);
  console.log(`📡 HTTP服务: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket服务: ws://localhost:${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，开始优雅关闭...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，开始优雅关闭...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});