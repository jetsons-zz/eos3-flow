import express from 'express';

const router = express.Router();

/**
 * GET /api/approval/flow/:flowId
 * 获取Flow的审批请求
 */
router.get('/flow/:flowId', async (req, res, next) => {
  try {
    const { flowId } = req.params;

    const flow = req.orchestrator.activeFlows.get(flowId);

    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Flow不存在',
        timestamp: new Date()
      });
    }

    if (!flow.approvalRequest) {
      return res.status(404).json({
        success: false,
        error: '审批请求不存在',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        flowId,
        approvalRequest: flow.approvalRequest,
        flowStatus: flow.status
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/approval/flow/:flowId/submit
 * 提交审批决策
 */
router.post('/flow/:flowId/submit', async (req, res, next) => {
  try {
    const { flowId } = req.params;
    const { status, selectedProposal, modifications = [], comments } = req.body;

    // 输入验证
    if (!status || !['approved', 'rejected', 'modified'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: '审批状态必须是 approved、rejected 或 modified',
        timestamp: new Date()
      });
    }

    if (status === 'approved' && !selectedProposal) {
      return res.status(400).json({
        success: false,
        error: '批准时必须选择一个方案',
        timestamp: new Date()
      });
    }

    if (status === 'modified' && (!selectedProposal || modifications.length === 0)) {
      return res.status(400).json({
        success: false,
        error: '修改时必须选择方案并提供修改内容',
        timestamp: new Date()
      });
    }

    const flow = req.orchestrator.activeFlows.get(flowId);

    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Flow不存在',
        timestamp: new Date()
      });
    }

    if (!flow.approvalRequest) {
      return res.status(404).json({
        success: false,
        error: '审批请求不存在',
        timestamp: new Date()
      });
    }

    if (flow.approvalRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `审批请求已处理，当前状态: ${flow.approvalRequest.status}`,
        timestamp: new Date()
      });
    }

    // 验证选择的方案存在
    if (selectedProposal) {
      const proposalExists = flow.proposals.some(p => p.id === selectedProposal);
      if (!proposalExists) {
        return res.status(400).json({
          success: false,
          error: '选择的方案不存在',
          timestamp: new Date()
        });
      }
    }

    // 处理审批决策
    const approvalDecision = {
      status,
      selectedProposal,
      modifications,
      comments
    };

    await req.orchestrator.processApproval(flowId, approvalDecision);

    res.json({
      success: true,
      data: {
        message: '审批决策已提交',
        flowId,
        decision: approvalDecision
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/approval/pending
 * 获取待审批的请求列表
 */
router.get('/pending', async (req, res, next) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;

    const pendingApprovals = [];

    // 遍历所有活跃Flow查找待审批请求
    for (const [flowId, flow] of req.orchestrator.activeFlows.entries()) {
      if (flow.approvalRequest &&
          flow.approvalRequest.status === 'pending' &&
          (!userId || flow.approvalRequest.approver === userId)) {

        pendingApprovals.push({
          flowId,
          approvalRequest: flow.approvalRequest,
          objective: flow.objective,
          proposalCount: flow.proposals.length,
          simulationCount: flow.simulationResults.length,
          priority: flow.objective.priority,
          deadline: flow.objective.deadline,
          pendingDays: Math.floor((new Date() - flow.approvalRequest.createdAt) / (1000 * 60 * 60 * 24))
        });
      }
    }

    // 排序（优先级高和等待时间长的在前）
    pendingApprovals.sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a.priority] || 1;
      const bPriority = priorityWeight[b.priority] || 1;

      // 先按优先级排序，再按等待天数排序
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      return b.pendingDays - a.pendingDays;
    });

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedApprovals = pendingApprovals.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        approvals: paginatedApprovals,
        pagination: {
          total: pendingApprovals.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(pendingApprovals.length / limit)
        },
        statistics: {
          totalPending: pendingApprovals.length,
          criticalCount: pendingApprovals.filter(a => a.priority === 'critical').length,
          overdueDays: pendingApprovals.filter(a => a.deadline && new Date() > new Date(a.deadline)).length,
          avgPendingDays: pendingApprovals.reduce((sum, a) => sum + a.pendingDays, 0) / pendingApprovals.length || 0
        }
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/approval/:approvalId
 * 获取特定审批请求详情
 */
router.get('/:approvalId', async (req, res, next) => {
  try {
    const { approvalId } = req.params;

    // 搜索所有Flow找到审批请求
    let foundApproval = null;
    let flowId = null;
    let flow = null;

    for (const [fId, f] of req.orchestrator.activeFlows.entries()) {
      if (f.approvalRequest && f.approvalRequest.id === approvalId) {
        foundApproval = f.approvalRequest;
        flowId = fId;
        flow = f;
        break;
      }
    }

    if (!foundApproval) {
      return res.status(404).json({
        success: false,
        error: '审批请求不存在',
        timestamp: new Date()
      });
    }

    // 生成审批详情报告
    const approvalDetails = {
      approval: foundApproval,
      flowId,
      objective: flow.objective,
      proposals: flow.proposals,
      simulationResults: flow.simulationResults,
      summary: {
        proposalCount: flow.proposals.length,
        totalSteps: flow.proposals.reduce((sum, p) => sum + p.steps.length, 0),
        avgConfidence: flow.proposals.reduce((sum, p) => sum + p.confidence, 0) / flow.proposals.length,
        avgRisk: flow.simulationResults.reduce((sum, s) => sum + s.riskAssessment.overallRisk, 0) / flow.simulationResults.length,
        pendingHours: Math.floor((new Date() - foundApproval.createdAt) / (1000 * 60 * 60))
      }
    };

    res.json({
      success: true,
      data: approvalDetails,
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/approval/:approvalId/delegate
 * 委托审批给其他人
 */
router.put('/:approvalId/delegate', async (req, res, next) => {
  try {
    const { approvalId } = req.params;
    const { newApprover, reason } = req.body;

    if (!newApprover) {
      return res.status(400).json({
        success: false,
        error: '必须指定新的审批人',
        timestamp: new Date()
      });
    }

    // 找到审批请求
    let foundApproval = null;
    let flowId = null;

    for (const [fId, flow] of req.orchestrator.activeFlows.entries()) {
      if (flow.approvalRequest && flow.approvalRequest.id === approvalId) {
        foundApproval = flow.approvalRequest;
        flowId = fId;

        // 更新审批人
        flow.approvalRequest.approver = newApprover;
        flow.approvalRequest.updatedAt = new Date();

        // 记录委托历史
        if (!flow.approvalRequest.delegationHistory) {
          flow.approvalRequest.delegationHistory = [];
        }
        flow.approvalRequest.delegationHistory.push({
          from: foundApproval.approver,
          to: newApprover,
          reason: reason || '审批委托',
          timestamp: new Date()
        });

        req.orchestrator.updateFlow(flowId, flow);
        break;
      }
    }

    if (!foundApproval) {
      return res.status(404).json({
        success: false,
        error: '审批请求不存在',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        message: '审批已委托',
        approvalId,
        newApprover,
        reason
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/approval/history/:userId
 * 获取用户的审批历史
 */
router.get('/history/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 20, startDate, endDate } = req.query;

    const approvalHistory = [];

    // 遍历所有Flow查找用户相关的审批
    for (const [flowId, flow] of req.orchestrator.activeFlows.entries()) {
      if (flow.approvalRequest && flow.approvalRequest.approver === userId) {

        // 状态过滤
        if (status && flow.approvalRequest.status !== status) {
          continue;
        }

        // 日期过滤
        if (startDate && flow.approvalRequest.createdAt < new Date(startDate)) {
          continue;
        }
        if (endDate && flow.approvalRequest.createdAt > new Date(endDate)) {
          continue;
        }

        approvalHistory.push({
          flowId,
          approvalRequest: flow.approvalRequest,
          objective: {
            id: flow.objective.id,
            title: flow.objective.title,
            priority: flow.objective.priority
          },
          processingTime: flow.approvalRequest.updatedAt - flow.approvalRequest.createdAt,
          outcomeStatus: flow.status
        });
      }
    }

    // 排序（最新的在前）
    approvalHistory.sort((a, b) => b.approvalRequest.createdAt - a.approvalRequest.createdAt);

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedHistory = approvalHistory.slice(startIndex, endIndex);

    // 统计
    const statistics = {
      total: approvalHistory.length,
      approved: approvalHistory.filter(h => h.approvalRequest.status === 'approved').length,
      rejected: approvalHistory.filter(h => h.approvalRequest.status === 'rejected').length,
      modified: approvalHistory.filter(h => h.approvalRequest.status === 'modified').length,
      pending: approvalHistory.filter(h => h.approvalRequest.status === 'pending').length,
      avgProcessingTime: approvalHistory
        .filter(h => h.approvalRequest.status !== 'pending')
        .reduce((sum, h) => sum + h.processingTime, 0) /
        approvalHistory.filter(h => h.approvalRequest.status !== 'pending').length || 0
    };

    res.json({
      success: true,
      data: {
        history: paginatedHistory,
        pagination: {
          total: approvalHistory.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(approvalHistory.length / limit)
        },
        statistics
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

export default router;