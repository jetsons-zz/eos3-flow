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
  // 企业资源管理扩展字段
  available?: number; // 可用数量
  allocated?: number; // 已分配数量
  description?: string;
  department?: string;
  location?: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

// 人员资源详细信息
export interface PersonResource extends Resource {
  type: 'human';
  email: string;
  role: string;
  skills: Skill[];
  workload: number; // 0-100 当前工作负载百分比
  hourlyRate?: number;
  availability: AvailabilityPeriod[];
  manager?: string; // 管理者ID
  team?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  certifications?: string[];
}

export interface AvailabilityPeriod {
  startDate: Date;
  endDate: Date;
  availableHours: number; // 该时间段内的可用小时数
  note?: string;
}

// 计算资源详细信息
export interface ComputeResource extends Resource {
  type: 'compute';
  specifications: {
    cpu?: string;
    memory?: string;
    storage?: string;
    gpu?: string;
    network?: string;
  };
  utilizationRate: number; // 0-100 使用率
  maxConcurrentJobs: number;
  currentJobs: number;
  accessUrl?: string;
}

// 预算资源详细信息
export interface BudgetResource extends Resource {
  type: 'budget';
  currency: string;
  totalAmount: number;
  spentAmount: number;
  reservedAmount: number;
  availableAmount: number;
  fiscalYear: string;
  budgetCategory: string;
  approvalRequired: boolean;
  approver?: string;
}

// 工具资源详细信息
export interface ToolResource extends Resource {
  type: 'tool';
  vendor: string;
  version?: string;
  licenseType: 'perpetual' | 'subscription' | 'concurrent' | 'named_user';
  maxUsers?: number;
  currentUsers: number;
  expirationDate?: Date;
  renewalDate?: Date;
  supportContact?: string;
  documentationUrl?: string;
}

// 资源分配记录
export interface ResourceAllocation {
  id: string;
  resourceId: string;
  flowId?: string;
  taskNodeId?: string;
  allocatedBy: string;
  allocatedTo: string; // 分配给谁（用户ID或团队ID）
  quantity: number;
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 资源使用历史
export interface ResourceUsageHistory {
  id: string;
  resourceId: string;
  flowId?: string;
  taskNodeId?: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  quantityUsed: number;
  efficiency: number; // 0-100 使用效率
  outcome: 'success' | 'failed' | 'partial';
  feedback?: string;
  cost?: number;
}

// 资源容量规划
export interface ResourceCapacityPlan {
  id: string;
  resourceType: Resource['type'];
  department: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  currentCapacity: number;
  plannedCapacity: number;
  demandForecast: number;
  gapAnalysis: {
    shortage: number;
    surplus: number;
    recommendations: string[];
  };
  costProjection: number;
  createdAt: Date;
  updatedAt: Date;
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

// 资源管理服务接口
export interface ResourceService {
  // 通用资源操作
  getAllResources(type?: Resource['type']): Promise<Resource[]>;
  getResourceById(id: string): Promise<Resource>;
  createResource(resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resource>;
  updateResource(id: string, updates: Partial<Resource>): Promise<Resource>;
  deleteResource(id: string): Promise<void>;

  // 资源分配
  allocateResource(allocation: Omit<ResourceAllocation, 'id' | 'createdAt' | 'updatedAt'>): Promise<ResourceAllocation>;
  deallocateResource(allocationId: string): Promise<void>;
  getResourceAllocations(resourceId?: string, flowId?: string): Promise<ResourceAllocation[]>;

  // 资源使用追踪
  recordResourceUsage(usage: Omit<ResourceUsageHistory, 'id'>): Promise<ResourceUsageHistory>;
  getResourceUsageHistory(resourceId: string, startDate?: Date, endDate?: Date): Promise<ResourceUsageHistory[]>;

  // 容量规划
  getCapacityPlan(department?: string, resourceType?: Resource['type']): Promise<ResourceCapacityPlan[]>;
  createCapacityPlan(plan: Omit<ResourceCapacityPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<ResourceCapacityPlan>;

  // 资源查找和推荐
  findAvailableResources(criteria: ResourceSearchCriteria): Promise<Resource[]>;
  recommendResources(taskRequirements: TaskResourceRequirement[]): Promise<ResourceRecommendation[]>;
}

// 资源搜索条件
export interface ResourceSearchCriteria {
  type?: Resource['type'];
  department?: string;
  skills?: string[]; // 对于人员资源
  startDate: Date;
  endDate: Date;
  minQuantity?: number;
  maxCost?: number;
  location?: string;
}

// 任务资源需求
export interface TaskResourceRequirement {
  type: Resource['type'];
  quantity: number;
  duration: number; // 小时
  skills?: string[]; // 对于人员资源
  specifications?: Record<string, any>; // 对于设备资源
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// 资源推荐结果
export interface ResourceRecommendation {
  resource: Resource;
  matchScore: number; // 0-100 匹配度
  availability: {
    startDate: Date;
    endDate: Date;
    availableQuantity: number;
  };
  estimatedCost: number;
  reasons: string[]; // 推荐理由
  alternatives?: ResourceRecommendation[]; // 备选方案
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