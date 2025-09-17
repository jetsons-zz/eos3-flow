import { v4 as uuidv4 } from 'uuid';

/**
 * Flow编排服务 - 核心业务逻辑控制器
 * 负责协调Pradya、Jantra、Virya等外部服务
 */
export class FlowOrchestrator {
  constructor(wsManager) {
    this.wsManager = wsManager;
    this.activeFlows = new Map(); // 存储活跃的流程实例
    this.executionCache = new Map(); // 缓存执行状态
  }

  /**
   * 处理新的目标输入，启动完整的Flow流程
   */
  async processObjective(objective) {
    const flowId = uuidv4();
    const flow = {
      id: flowId,
      objective,
      status: 'intake',
      proposals: [],
      simulationResults: [],
      approvalRequest: null,
      taskGraph: null,
      executionId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.activeFlows.set(flowId, flow);

    // 广播流程开始
    this.wsManager.broadcast({
      type: 'flow_started',
      payload: { flowId, objective },
      timestamp: new Date()
    });

    try {
      // 第一步：调用Pradya生成候选方案
      await this.generateProposals(flowId);

      return { success: true, flowId };
    } catch (error) {
      flow.status = 'error';
      flow.error = error.message;
      this.updateFlow(flowId, flow);
      throw error;
    }
  }

  /**
   * 调用Pradya服务生成候选方案
   */
  async generateProposals(flowId) {
    const flow = this.activeFlows.get(flowId);
    if (!flow) throw new Error('Flow not found');

    flow.status = 'generating_proposals';
    this.updateFlow(flowId, flow);

    try {
      // 模拟Pradya服务调用
      const proposals = await this.mockPradyaService(flow.objective);

      flow.proposals = proposals;
      flow.status = 'proposals_generated';
      this.updateFlow(flowId, flow);

      // 自动进入仿真阶段
      await this.runSimulation(flowId);

    } catch (error) {
      flow.status = 'error';
      flow.error = error.message;
      this.updateFlow(flowId, flow);
      throw error;
    }
  }

  /**
   * 调用Jantra服务进行仿真验证
   */
  async runSimulation(flowId) {
    const flow = this.activeFlows.get(flowId);
    if (!flow) throw new Error('Flow not found');

    flow.status = 'running_simulation';
    this.updateFlow(flowId, flow);

    try {
      // 模拟Jantra服务调用
      const simulationResults = await this.mockJantraService(flow.proposals);

      flow.simulationResults = simulationResults;
      flow.status = 'simulation_completed';
      this.updateFlow(flowId, flow);

      // 自动创建审批请求
      await this.createApprovalRequest(flowId);

    } catch (error) {
      flow.status = 'error';
      flow.error = error.message;
      this.updateFlow(flowId, flow);
      throw error;
    }
  }

  /**
   * 创建HITL审批请求
   */
  async createApprovalRequest(flowId) {
    const flow = this.activeFlows.get(flowId);
    if (!flow) throw new Error('Flow not found');

    const approvalRequest = {
      id: uuidv4(),
      objectiveId: flow.objective.id,
      proposals: flow.proposals,
      simulationResults: flow.simulationResults,
      status: 'pending',
      approver: flow.objective.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    flow.approvalRequest = approvalRequest;
    flow.status = 'awaiting_approval';
    this.updateFlow(flowId, flow);

    // 通知用户需要审批
    this.wsManager.sendToUser(flow.objective.userId, {
      type: 'approval_required',
      payload: { flowId, approvalRequest },
      timestamp: new Date()
    });
  }

  /**
   * 处理审批决策
   */
  async processApproval(flowId, approvalDecision) {
    const flow = this.activeFlows.get(flowId);
    if (!flow) throw new Error('Flow not found');

    const { status, selectedProposal, modifications, comments } = approvalDecision;

    flow.approvalRequest.status = status;
    flow.approvalRequest.selectedProposal = selectedProposal;
    flow.approvalRequest.modifications = modifications;
    flow.approvalRequest.comments = comments;
    flow.approvalRequest.updatedAt = new Date();

    if (status === 'approved') {
      flow.status = 'approved';
      this.updateFlow(flowId, flow);

      // 生成TaskGraph并开始执行
      await this.generateTaskGraph(flowId);
    } else if (status === 'rejected') {
      flow.status = 'rejected';
      this.updateFlow(flowId, flow);
    } else if (status === 'modified') {
      flow.status = 'modifying';
      this.updateFlow(flowId, flow);

      // 重新生成修改后的方案
      await this.refineProposal(flowId, selectedProposal, modifications);
    }
  }

  /**
   * 生成TaskGraph并启动执行
   */
  async generateTaskGraph(flowId) {
    const flow = this.activeFlows.get(flowId);
    if (!flow) throw new Error('Flow not found');

    const selectedProposal = flow.proposals.find(
      p => p.id === flow.approvalRequest.selectedProposal
    );

    if (!selectedProposal) throw new Error('Selected proposal not found');

    const taskGraph = this.createTaskGraphFromProposal(selectedProposal, flow);

    flow.taskGraph = taskGraph;
    flow.status = 'executing';
    this.updateFlow(flowId, flow);

    // 调用Virya开始执行
    await this.startExecution(flowId);
  }

  /**
   * 启动任务执行
   */
  async startExecution(flowId) {
    const flow = this.activeFlows.get(flowId);
    if (!flow) throw new Error('Flow not found');

    try {
      // 模拟Virya服务调用
      const executionId = await this.mockViryaService(flow.taskGraph);

      flow.executionId = executionId;
      this.updateFlow(flowId, flow);

      // 开始监控执行状态
      this.monitorExecution(flowId, executionId);

    } catch (error) {
      flow.status = 'error';
      flow.error = error.message;
      this.updateFlow(flowId, flow);
      throw error;
    }
  }

  /**
   * 监控执行状态
   */
  monitorExecution(flowId, executionId) {
    const interval = setInterval(async () => {
      try {
        const status = await this.mockExecutionStatus(executionId);

        this.executionCache.set(executionId, status);

        // 广播执行更新
        this.wsManager.broadcast({
          type: 'execution_update',
          payload: { flowId, executionId, status },
          timestamp: new Date()
        });

        // 检查是否完成
        if (status.overallProgress >= 100) {
          clearInterval(interval);
          await this.completeExecution(flowId);
        }

      } catch (error) {
        console.error('监控执行状态失败:', error);
        clearInterval(interval);
      }
    }, 5000); // 每5秒检查一次
  }

  /**
   * 完成执行流程
   */
  async completeExecution(flowId) {
    const flow = this.activeFlows.get(flowId);
    if (!flow) return;

    flow.status = 'completed';
    flow.updatedAt = new Date();
    this.updateFlow(flowId, flow);

    // 回写反馈到Mandala
    await this.recordFeedback(flowId);

    // 清理资源
    setTimeout(() => {
      this.activeFlows.delete(flowId);
    }, 24 * 60 * 60 * 1000); // 24小时后清理
  }

  /**
   * 更新流程状态并广播
   */
  updateFlow(flowId, flow) {
    flow.updatedAt = new Date();
    this.activeFlows.set(flowId, flow);

    this.wsManager.broadcast({
      type: 'flow_updated',
      payload: { flowId, flow },
      timestamp: new Date()
    });
  }

  // ===== 辅助方法 =====

  createTaskGraphFromProposal(proposal, flow) {
    const nodes = proposal.steps.map(step => ({
      id: step.id,
      stepId: step.id,
      title: step.title,
      description: step.description,
      status: 'pending',
      estimatedHours: step.estimatedHours,
      deliverables: step.deliverables.map(d => ({
        id: uuidv4(),
        name: d,
        type: 'other',
        status: 'pending',
        metadata: {}
      })),
      metadata: {}
    }));

    const edges = [];
    proposal.steps.forEach(step => {
      step.dependencies.forEach(depId => {
        edges.push({
          id: uuidv4(),
          source: depId,
          target: step.id,
          type: 'dependency'
        });
      });
    });

    return {
      id: uuidv4(),
      objectiveId: flow.objective.id,
      approvalId: flow.approvalRequest.id,
      nodes,
      edges,
      status: 'created',
      progress: 0
    };
  }

  // ===== 模拟外部服务 =====

  async mockPradyaService(objective) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    return [
      {
        id: uuidv4(),
        title: '方案A: 渐进式实施',
        description: '分阶段实现目标，降低风险',
        steps: [
          {
            id: uuidv4(),
            title: '需求分析',
            description: '详细分析现状和目标差距',
            estimatedHours: 8,
            assigneeType: 'human',
            dependencies: [],
            deliverables: ['需求分析报告']
          },
          {
            id: uuidv4(),
            title: '方案设计',
            description: '设计实施方案',
            estimatedHours: 16,
            assigneeType: 'human',
            dependencies: [],
            deliverables: ['设计文档']
          }
        ],
        estimatedDuration: 24,
        confidence: 0.8,
        risks: [
          {
            id: uuidv4(),
            description: '时间延期风险',
            probability: 0.3,
            impact: 0.6
          }
        ],
        resources: []
      },
      {
        id: uuidv4(),
        title: '方案B: 快速部署',
        description: '快速实现核心功能',
        steps: [
          {
            id: uuidv4(),
            title: '快速原型',
            description: '构建MVP版本',
            estimatedHours: 12,
            assigneeType: 'karma',
            dependencies: [],
            deliverables: ['原型系统']
          }
        ],
        estimatedDuration: 12,
        confidence: 0.6,
        risks: [
          {
            id: uuidv4(),
            description: '质量风险',
            probability: 0.5,
            impact: 0.7
          }
        ],
        resources: []
      }
    ];
  }

  async mockJantraService(proposals) {
    await new Promise(resolve => setTimeout(resolve, 1500));

    return proposals.map(proposal => ({
      id: uuidv4(),
      proposalId: proposal.id,
      scenarios: [
        {
          id: uuidv4(),
          name: '最佳情况',
          probability: 0.3,
          outcomes: [],
          timeline: []
        },
        {
          id: uuidv4(),
          name: '正常情况',
          probability: 0.5,
          outcomes: [],
          timeline: []
        },
        {
          id: uuidv4(),
          name: '最坏情况',
          probability: 0.2,
          outcomes: [],
          timeline: []
        }
      ],
      consistencyScore: Math.random() * 0.3 + 0.7, // 0.7-1.0
      riskAssessment: {
        overallRisk: Math.random() * 0.5, // 0-0.5
        criticalPaths: [],
        bottlenecks: [],
        recommendations: ['建议增加缓冲时间', '需要额外资源储备']
      },
      recommendedPath: proposal.confidence > 0.7 ? proposal.id : null,
      createdAt: new Date()
    }));
  }

  async mockViryaService(taskGraph) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return uuidv4(); // 返回执行ID
  }

  async mockExecutionStatus(executionId) {
    const cached = this.executionCache.get(executionId);
    const currentProgress = cached ? cached.overallProgress : 0;
    const newProgress = Math.min(100, currentProgress + Math.random() * 15);

    return {
      taskGraphId: executionId,
      overallProgress: newProgress,
      activeNodes: [],
      completedNodes: [],
      failedNodes: [],
      blockedNodes: [],
      estimatedCompletion: new Date(Date.now() + (100 - newProgress) * 60000),
      currentBottlenecks: [],
      lastUpdate: new Date()
    };
  }

  async recordFeedback(flowId) {
    // 模拟反馈回写到Mandala
    console.log(`记录流程 ${flowId} 的执行反馈到Mandala`);
  }

  async refineProposal(flowId, proposalId, modifications) {
    // 模拟方案优化
    console.log(`优化方案 ${proposalId}:`, modifications);
    // 重新进入仿真阶段
    await this.runSimulation(flowId);
  }
}