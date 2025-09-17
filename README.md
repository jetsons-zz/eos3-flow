# EOS3 Flow - 智能任务调度中枢

EOS3 Flow 是企业级 AI Native 操作系统 EOS3 的核心模块，作为智能任务调度 Agent，负责从目标输入到执行完成的全链路协调。

## 功能特性

### 核心功能
- **目标 Intake**: 录入目标/约束/KPI，生成任务单元
- **推理建议生成**: 调用 Pradya 输出候选路径和优先级
- **仿真验证**: 调用 Jantra 模拟不同路径的效果、风险和一致性
- **HITL 审批**: 支持人工对方案进行审批、修改或驳回
- **任务流生成**: 将批准路径转化为标准化 TaskGraph
- **执行调度**: 调用 Virya/Karma 分派任务，实时跟踪执行进展
- **状态反馈可视化**: 展示执行进度、异常、风险点
- **反馈回写**: 执行结果写入 Mandala 优化未来推理

### 技术架构
- **前端**: React 18 + TypeScript + Tailwind CSS + Zustand
- **后端**: Node.js + Express + WebSocket
- **通信**: RESTful API + WebSocket 实时通信
- **外部集成**: Pradya (推理) + Jantra (仿真) + Virya/Karma (执行) + Mandala (知识图谱)

## 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 环境配置
复制环境变量模板并配置：
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置必要的参数：
- PORT: 服务器端口 (默认 8080)
- PRADYA_API_URL: Pradya 服务地址
- JANTRA_API_URL: Jantra 服务地址
- VIRYA_API_URL: Virya 服务地址
- MANDALA_API_URL: Mandala 服务地址

### 启动开发服务器
```bash
# 启动前后端开发服务器
npm run dev

# 或分别启动
npm run server:dev  # 后端服务器 (http://localhost:8080)
npm run client:dev  # 前端服务器 (http://localhost:3000)
```

### 构建生产版本
```bash
npm run build
```

## API 文档

### 核心 API 端点

#### 目标管理
- `POST /api/objectives` - 创建新目标
- `GET /api/objectives` - 获取目标列表
- `GET /api/objectives/:id` - 获取目标详情
- `PUT /api/objectives/:id` - 更新目标
- `DELETE /api/objectives/:id` - 删除目标

#### 方案生成
- `GET /api/proposals/flow/:flowId` - 获取Flow的候选方案
- `POST /api/proposals/flow/:flowId/regenerate` - 重新生成候选方案
- `GET /api/proposals/:proposalId` - 获取特定方案详情

#### 仿真验证
- `GET /api/simulation/flow/:flowId` - 获取Flow的仿真结果
- `POST /api/simulation/flow/:flowId/run` - 运行仿真
- `GET /api/simulation/:simulationId` - 获取仿真详情

#### 审批流程
- `GET /api/approval/flow/:flowId` - 获取Flow的审批请求
- `POST /api/approval/flow/:flowId/submit` - 提交审批决策
- `GET /api/approval/pending` - 获取待审批列表

#### 执行监控
- `GET /api/execution/flow/:flowId` - 获取Flow的执行状态
- `POST /api/execution/:executionId/pause` - 暂停执行
- `POST /api/execution/:executionId/resume` - 恢复执行
- `POST /api/execution/:executionId/cancel` - 取消执行

### WebSocket 事件

客户端可通过 WebSocket 接收实时更新：

```javascript
// 连接 WebSocket
const ws = new WebSocket('ws://localhost:8080/ws');

// 认证用户
ws.send(JSON.stringify({
  type: 'authenticate',
  payload: { userId: 'user-id' }
}));

// 订阅 Flow 更新
ws.send(JSON.stringify({
  type: 'subscribe_flow',
  payload: { flowId: 'flow-id' }
}));
```

支持的事件类型：
- `flow_started` - Flow 启动
- `flow_updated` - Flow 状态更新
- `execution_update` - 执行状态更新
- `approval_required` - 需要审批
- `task_complete` - 任务完成

## 开发指南

### 项目结构
```
eos3-flow/
├── client/                 # 前端应用
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── pages/         # 页面组件
│   │   ├── stores/        # Zustand 状态管理
│   │   ├── hooks/         # 自定义 Hooks
│   │   └── services/      # API 服务
├── server/                # 后端服务
│   ├── routes/           # API 路由
│   ├── services/         # 业务服务
│   └── utils/            # 工具函数
├── shared/               # 共享类型定义
└── docs/                 # 文档
```

### 核心概念

#### Flow 生命周期
1. **Intake** - 目标录入和初始化
2. **Proposal Generation** - Pradya 生成候选方案
3. **Simulation** - Jantra 仿真验证
4. **Approval** - HITL 人工审批
5. **Execution** - Virya/Karma 执行任务
6. **Completion** - 完成并反馈学习

#### 数据流
```
目标输入 → Pradya 推理 → Jantra 仿真 → HITL 审批 → TaskGraph 生成 → Virya 执行 → Mandala 反馈
```

### 外部服务集成

Flow 依赖以下外部服务，需要在 `.env` 中正确配置：

#### Pradya (推理服务)
- 负责根据目标生成候选执行方案
- 提供置信度评估和风险识别

#### Jantra (仿真服务)
- 对候选方案进行路径仿真
- 提供一致性验证和风险评估

#### Virya (执行网关)
- 任务分派和执行调度
- 与 Karma 分身系统集成

#### Mandala (知识图谱)
- 存储执行反馈和历史数据
- 支持因果关系学习和优化

## 部署

### 生产环境部署

1. 构建应用：
```bash
npm run build
```

2. 配置生产环境变量
3. 启动服务：
```bash
npm start
```

### Docker 部署
```bash
# 构建镜像
docker build -t eos3-flow .

# 运行容器
docker run -d -p 8080:8080 --env-file .env eos3-flow
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/new-feature`)
3. 提交更改 (`git commit -am 'Add new feature'`)
4. 推送分支 (`git push origin feature/new-feature`)
5. 创建 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目主页: [EOS3 Flow](https://github.com/eos3/flow)
- 问题反馈: [Issues](https://github.com/eos3/flow/issues)
- 文档: [Wiki](https://github.com/eos3/flow/wiki)