// Flow模块核心类型定义

export interface Objective {
  id: string;
  title: string;
  description: string;
  constraints: string[];
  kpis: KPI[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface KPI {
  id: string;
  name: string;
  metric: string;
  target: number;
  current?: number;
  unit: string;
}

// Pradya推理结果
export interface ProposalPath {
  id: string;
  title: string;
  description: string;
  steps: TaskStep[];
  estimatedDuration: number; // 小时
  confidence: number; // 0-1
  risks: Risk[];
  resources: Resource[];
  dependencies: string[];
}

export interface TaskStep {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  assigneeType: 'human' | 'karma' | 'system';
  dependencies: string[];
  deliverables: string[];
}

export interface Risk {
  id: string;
  description: string;
  probability: number; // 0-1
  impact: number; // 0-1
  mitigation?: string;
}

export interface Resource {
  id: string;
  type: 'human' | 'compute' | 'budget' | 'tool';
  name: string;
  quantity: number;
  unit: string;
  cost?: number;
}

// Jantra仿真结果
export interface SimulationResult {
  id: string;
  proposalId: string;
  scenarios: Scenario[];
  consistencyScore: number; // 0-1
  riskAssessment: RiskAssessment;
  recommendedPath?: string;
  createdAt: Date;
}

export interface Scenario {
  id: string;
  name: string;
  probability: number;
  outcomes: Outcome[];
  timeline: TimelineEvent[];
}

export interface Outcome {
  kpiId: string;
  predictedValue: number;
  variance: number;
  confidence: number;
}

export interface RiskAssessment {
  overallRisk: number; // 0-1
  criticalPaths: string[];
  bottlenecks: string[];
  recommendations: string[];
}

export interface TimelineEvent {
  timestamp: Date;
  event: string;
  impact: number;
}

// HITL审批
export interface ApprovalRequest {
  id: string;
  objectiveId: string;
  proposals: ProposalPath[];
  simulationResults: SimulationResult[];
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  approver: string;
  comments?: string;
  selectedProposal?: string;
  modifications?: Modification[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Modification {
  type: 'add_step' | 'remove_step' | 'modify_step' | 'change_timeline' | 'adjust_resources';
  target: string; // step ID or resource ID
  changes: Record<string, any>;
  reason: string;
}

// TaskGraph生成
export interface TaskGraph {
  id: string;
  objectiveId: string;
  approvalId: string;
  nodes: TaskNode[];
  edges: TaskEdge[];
  status: 'created' | 'executing' | 'completed' | 'failed' | 'paused';
  startTime?: Date;
  endTime?: Date;
  progress: number; // 0-100
}

export interface TaskNode {
  id: string;
  stepId: string;
  title: string;
  description: string;
  status: 'pending' | 'ready' | 'executing' | 'completed' | 'failed' | 'blocked';
  assignee?: string;
  estimatedHours: number;
  actualHours?: number;
  startTime?: Date;
  endTime?: Date;
  deliverables: Deliverable[];
  metadata: Record<string, any>;
}

export interface TaskEdge {
  id: string;
  source: string;
  target: string;
  type: 'dependency' | 'sequence' | 'parallel';
  condition?: string;
}

export interface Deliverable {
  id: string;
  name: string;
  type: 'document' | 'code' | 'data' | 'approval' | 'other';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  url?: string;
  metadata: Record<string, any>;
}

// 执行反馈
export interface ExecutionFeedback {
  id: string;
  taskNodeId: string;
  type: 'progress' | 'completion' | 'error' | 'blocked' | 'resource_request';
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
  source: 'human' | 'karma' | 'virya' | 'system';
}

// Virya/Karma执行状态
export interface ExecutionStatus {
  taskGraphId: string;
  overallProgress: number;
  activeNodes: string[];
  completedNodes: string[];
  failedNodes: string[];
  blockedNodes: string[];
  estimatedCompletion?: Date;
  currentBottlenecks: string[];
  lastUpdate: Date;
}

// 外部服务接口
export interface PradyaService {
  generateProposals(objective: Objective): Promise<ProposalPath[]>;
  refineProposal(proposalId: string, modifications: Modification[]): Promise<ProposalPath>;
}

export interface JantraService {
  runSimulation(proposals: ProposalPath[]): Promise<SimulationResult[]>;
  validateConsistency(proposal: ProposalPath): Promise<number>;
}

export interface ViryaService {
  createExecution(taskGraph: TaskGraph): Promise<string>;
  getExecutionStatus(executionId: string): Promise<ExecutionStatus>;
  pauseExecution(executionId: string): Promise<void>;
  resumeExecution(executionId: string): Promise<void>;
  cancelExecution(executionId: string): Promise<void>;
}

export interface MandalaService {
  recordFeedback(feedback: ExecutionFeedback[]): Promise<void>;
  updateCausalWeights(objectiveId: string, outcome: ExecutionStatus): Promise<void>;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

// WebSocket消息类型
export interface WSMessage {
  type: 'execution_update' | 'task_complete' | 'error' | 'approval_required';
  payload: any;
  timestamp: Date;
}