import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// EOS3 Flow 核心调度器 - 整合Pradya, Jantra, HITL, Virya/Karma
class FlowOrchestrator {
  constructor() {
    this.flows = new Map(); // 存储所有Flow实例
    this.approvals = new Map(); // 存储审批记录
    this.executions = new Map(); // 存储执行状态
  }

  // 完整的Flow流程：目标→推理→仿真→审批→执行
  async processObjective(objective) {
    const flowId = uuidv4();
    const flow = {
      id: flowId,
      objectiveId: objective.id,
      objective,
      status: 'intake_complete',
      proposals: [],
      simulationResults: null,
      approvalRequest: null,
      taskGraph: null,
      executionStatus: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [
        { stage: 'intake', timestamp: new Date(), status: 'completed' }
      ]
    };

    this.flows.set(flowId, flow);
    console.log(`Flow ${flowId} 创建成功，开始处理目标: ${objective.title}`);

    try {
      // 阶段1: Pradya推理生成候选方案
      await this.pradyaStage(flowId);

      // 阶段2: Jantra仿真验证
      await this.jantraStage(flowId);

      // 阶段3: HITL审批准备
      await this.hitlPrepStage(flowId);

      return this.flows.get(flowId);

    } catch (error) {
      flow.status = 'failed';
      flow.error = error.message;
      flow.updatedAt = new Date();
      this.flows.set(flowId, flow);
      throw error;
    }
  }

  // Pradya推理阶段
  async pradyaStage(flowId) {
    const flow = this.flows.get(flowId);
    flow.status = 'pradya_processing';
    this.updateFlowHistory(flow, 'pradya', 'processing');

    try {
      // 模拟调用Pradya推理引擎
      const proposals = await this.callPradyaEngine(flow.objective);

      flow.proposals = proposals;
      flow.status = 'pradya_complete';
      this.updateFlowHistory(flow, 'pradya', 'completed');

      console.log(`Flow ${flowId} Pradya阶段完成，生成${proposals.length}个候选方案`);

    } catch (error) {
      flow.status = 'pradya_failed';
      this.updateFlowHistory(flow, 'pradya', 'failed');
      throw new Error(`Pradya推理失败: ${error.message}`);
    }
  }

  // Jantra仿真阶段
  async jantraStage(flowId) {
    const flow = this.flows.get(flowId);
    flow.status = 'jantra_processing';
    this.updateFlowHistory(flow, 'jantra', 'processing');

    try {
      // 模拟调用Jantra仿真引擎
      const simulationResults = await this.callJantraEngine(flow.proposals);

      flow.simulationResults = simulationResults;
      flow.status = 'jantra_complete';
      this.updateFlowHistory(flow, 'jantra', 'completed');

      console.log(`Flow ${flowId} Jantra仿真完成，验证结果生成`);

    } catch (error) {
      flow.status = 'jantra_failed';
      this.updateFlowHistory(flow, 'jantra', 'failed');
      throw new Error(`Jantra仿真失败: ${error.message}`);
    }
  }

  // HITL审批准备阶段
  async hitlPrepStage(flowId) {
    const flow = this.flows.get(flowId);
    flow.status = 'hitl_prep';
    this.updateFlowHistory(flow, 'hitl_prep', 'processing');

    try {
      // 创建审批请求
      const approvalRequest = {
        id: uuidv4(),
        flowId,
        objectiveId: flow.objectiveId,
        proposals: flow.proposals,
        simulationResults: flow.simulationResults,
        status: 'pending',
        priority: flow.objective.priority,
        deadline: flow.objective.deadline,
        requesterId: flow.objective.userId,
        approverIds: ['admin'], // 简化：默认管理员审批
        comments: [],
        createdAt: new Date()
      };

      this.approvals.set(approvalRequest.id, approvalRequest);
      flow.approvalRequest = approvalRequest;
      flow.status = 'awaiting_approval';
      this.updateFlowHistory(flow, 'hitl_prep', 'completed');

      console.log(`Flow ${flowId} 审批请求已创建，等待HITL审批`);

    } catch (error) {
      flow.status = 'hitl_prep_failed';
      this.updateFlowHistory(flow, 'hitl_prep', 'failed');
      throw new Error(`HITL准备失败: ${error.message}`);
    }
  }

  // HITL审批处理
  async processApproval(approvalId, decision, comment, selectedProposalId) {
    const approval = this.approvals.get(approvalId);
    if (!approval) {
      throw new Error('审批请求不存在');
    }

    const flow = this.flows.get(approval.flowId);
    approval.status = decision;
    approval.comments.push({
      id: uuidv4(),
      userId: 'admin',
      userName: '管理员',
      content: comment,
      type: decision,
      timestamp: new Date()
    });

    if (decision === 'approved' && selectedProposalId) {
      approval.selectedProposal = selectedProposalId;
      flow.status = 'approved';
      this.updateFlowHistory(flow, 'hitl_approval', 'approved');

      // 继续到TaskGraph生成阶段
      await this.taskGraphStage(flow.id, selectedProposalId);

    } else if (decision === 'rejected') {
      flow.status = 'rejected';
      this.updateFlowHistory(flow, 'hitl_approval', 'rejected');

    } else if (decision === 'needs_revision') {
      flow.status = 'needs_revision';
      this.updateFlowHistory(flow, 'hitl_approval', 'needs_revision');
    }

    approval.decidedAt = new Date();
    this.approvals.set(approvalId, approval);
    this.flows.set(flow.id, flow);

    return { approval, flow };
  }

  // TaskGraph生成阶段
  async taskGraphStage(flowId, selectedProposalId) {
    const flow = this.flows.get(flowId);
    flow.status = 'taskgraph_generating';
    this.updateFlowHistory(flow, 'taskgraph', 'processing');

    try {
      const selectedProposal = flow.proposals.find(p => p.id === selectedProposalId);
      if (!selectedProposal) {
        throw new Error('选中的方案不存在');
      }

      // 生成TaskGraph
      const taskGraph = await this.generateTaskGraph(selectedProposal);

      flow.taskGraph = taskGraph;
      flow.status = 'taskgraph_complete';
      this.updateFlowHistory(flow, 'taskgraph', 'completed');

      console.log(`Flow ${flowId} TaskGraph生成完成`);

      // 继续到执行阶段
      await this.executionStage(flowId);

    } catch (error) {
      flow.status = 'taskgraph_failed';
      this.updateFlowHistory(flow, 'taskgraph', 'failed');
      throw new Error(`TaskGraph生成失败: ${error.message}`);
    }
  }

  // 执行阶段
  async executionStage(flowId) {
    const flow = this.flows.get(flowId);
    flow.status = 'executing';
    this.updateFlowHistory(flow, 'execution', 'started');

    try {
      // 模拟启动Virya/Karma执行
      const executionId = await this.startExecution(flow.taskGraph);

      flow.executionStatus = {
        executionId,
        status: 'running',
        progress: 0,
        startedAt: new Date()
      };

      this.executions.set(executionId, {
        flowId,
        taskGraphId: flow.taskGraph.id,
        status: 'running',
        progress: 0,
        startedAt: new Date()
      });

      console.log(`Flow ${flowId} 执行已启动，执行ID: ${executionId}`);

    } catch (error) {
      flow.status = 'execution_failed';
      this.updateFlowHistory(flow, 'execution', 'failed');
      throw new Error(`执行启动失败: ${error.message}`);
    }
  }

  // 模拟Pradya调用
  async callPradyaEngine(objective) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 简化的方案生成
    return [
      {
        id: uuidv4(),
        objectiveId: objective.id,
        title: '快速执行方案',
        confidence: 0.7,
        estimatedDuration: 30,
        estimatedCost: 50000,
        taskBreakdown: [
          { id: uuidv4(), name: '需求分析', estimatedDuration: 8 },
          { id: uuidv4(), name: '开发实现', estimatedDuration: 16 },
          { id: uuidv4(), name: '测试验证', estimatedDuration: 6 }
        ]
      },
      {
        id: uuidv4(),
        objectiveId: objective.id,
        title: '平衡方案',
        confidence: 0.85,
        estimatedDuration: 45,
        estimatedCost: 70000,
        taskBreakdown: [
          { id: uuidv4(), name: '需求分析', estimatedDuration: 12 },
          { id: uuidv4(), name: '设计阶段', estimatedDuration: 8 },
          { id: uuidv4(), name: '开发实现', estimatedDuration: 20 },
          { id: uuidv4(), name: '测试验证', estimatedDuration: 5 }
        ]
      }
    ];
  }

  // 模拟Jantra调用
  async callJantraEngine(proposals) {
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      id: uuidv4(),
      analysis: {
        recommendedProposal: proposals[1].id, // 推荐平衡方案
        averageScore: 78,
        insights: ['建议选择平衡方案，风险可控']
      },
      results: proposals.map(p => ({
        proposalId: p.id,
        overallScore: p.confidence * 100,
        scenarios: [
          { name: '预期情况', probability: 0.7, successRate: 0.85 }
        ]
      }))
    };
  }

  // 生成TaskGraph
  async generateTaskGraph(proposal) {
    await new Promise(resolve => setTimeout(resolve, 800));

    const nodes = proposal.taskBreakdown.map((task, index) => ({
      id: uuidv4(),
      taskId: task.id,
      name: task.name,
      status: 'pending',
      estimatedHours: task.estimatedDuration,
      dependencies: index > 0 ? [proposal.taskBreakdown[index-1].id] : []
    }));

    return {
      id: uuidv4(),
      proposalId: proposal.id,
      nodes,
      edges: nodes.slice(1).map((node, index) => ({
        id: uuidv4(),
        source: nodes[index].id,
        target: node.id,
        type: 'sequence'
      })),
      status: 'ready',
      createdAt: new Date()
    };
  }

  // 启动执行
  async startExecution(taskGraph) {
    const executionId = uuidv4();

    // 模拟Virya/Karma启动
    setTimeout(() => {
      this.simulateExecution(executionId);
    }, 1000);

    return executionId;
  }

  // 模拟执行过程
  simulateExecution(executionId) {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    const interval = setInterval(() => {
      execution.progress += Math.random() * 10;
      if (execution.progress >= 100) {
        execution.progress = 100;
        execution.status = 'completed';
        execution.completedAt = new Date();

        // 更新Flow状态
        const flow = this.flows.get(execution.flowId);
        flow.status = 'completed';
        flow.executionStatus.status = 'completed';
        this.updateFlowHistory(flow, 'execution', 'completed');

        clearInterval(interval);
        console.log(`执行 ${executionId} 已完成`);
      }

      this.executions.set(executionId, execution);
    }, 2000); // 每2秒更新一次进度
  }

  // 更新Flow历史
  updateFlowHistory(flow, stage, status) {
    flow.history.push({
      stage,
      timestamp: new Date(),
      status
    });
    flow.updatedAt = new Date();
  }

  // 获取Flow状态
  getFlow(flowId) {
    return this.flows.get(flowId);
  }

  // 获取所有Flow
  getAllFlows() {
    return Array.from(this.flows.values());
  }

  // 获取执行状态
  getExecutionStatus(executionId) {
    return this.executions.get(executionId);
  }
}

// 创建Flow调度器实例
const flowOrchestrator = new FlowOrchestrator();

// 启动完整Flow流程
router.post('/start', async (req, res) => {
  try {
    const { objective } = req.body;

    if (!objective) {
      return res.status(400).json({
        success: false,
        error: '缺少目标信息',
        timestamp: new Date()
      });
    }

    console.log('启动Flow流程:', objective.title);

    const flow = await flowOrchestrator.processObjective(objective);

    res.json({
      success: true,
      data: flow,
      message: 'Flow流程已启动',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Flow启动失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

// HITL审批处理
router.post('/approval/:approvalId', async (req, res) => {
  try {
    const { approvalId } = req.params;
    const { decision, comment, selectedProposalId } = req.body;

    if (!['approved', 'rejected', 'needs_revision'].includes(decision)) {
      return res.status(400).json({
        success: false,
        error: '无效的审批决策',
        timestamp: new Date()
      });
    }

    const result = await flowOrchestrator.processApproval(
      approvalId,
      decision,
      comment,
      selectedProposalId
    );

    res.json({
      success: true,
      data: result,
      message: `审批${decision === 'approved' ? '通过' : decision === 'rejected' ? '拒绝' : '需要修订'}`,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('审批处理失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

// 获取Flow状态
router.get('/:flowId', (req, res) => {
  try {
    const { flowId } = req.params;
    const flow = flowOrchestrator.getFlow(flowId);

    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Flow不存在',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: flow,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('获取Flow状态失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

// 获取所有Flow
router.get('/', (req, res) => {
  try {
    const flows = flowOrchestrator.getAllFlows();

    res.json({
      success: true,
      data: {
        flows,
        total: flows.length,
        summary: {
          pending: flows.filter(f => f.status.includes('processing') || f.status === 'awaiting_approval').length,
          executing: flows.filter(f => f.status === 'executing').length,
          completed: flows.filter(f => f.status === 'completed').length,
          failed: flows.filter(f => f.status.includes('failed')).length
        }
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('获取Flow列表失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

// 获取执行状态
router.get('/execution/:executionId/status', (req, res) => {
  try {
    const { executionId } = req.params;
    const execution = flowOrchestrator.getExecutionStatus(executionId);

    if (!execution) {
      return res.status(404).json({
        success: false,
        error: '执行不存在',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: execution,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('获取执行状态失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

export default router;