import express from 'express';

const router = express.Router();

/**
 * GET /api/execution/flow/:flowId
 * 获取Flow的执行状态
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

    let executionStatus = null;
    if (flow.executionId) {
      executionStatus = req.orchestrator.executionCache.get(flow.executionId);
    }

    res.json({
      success: true,
      data: {
        flowId,
        executionId: flow.executionId,
        taskGraph: flow.taskGraph,
        executionStatus,
        flowStatus: flow.status,
        startedAt: flow.taskGraph?.startTime,
        completedAt: flow.taskGraph?.endTime
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/execution/flow/:flowId/start
 * 手动启动执行（通常由审批自动触发）
 */
router.post('/flow/:flowId/start', async (req, res, next) => {
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

    if (flow.status !== 'approved') {
      return res.status(400).json({
        success: false,
        error: `Flow状态 ${flow.status} 不允许启动执行`,
        timestamp: new Date()
      });
    }

    if (!flow.taskGraph) {
      return res.status(400).json({
        success: false,
        error: 'TaskGraph未生成',
        timestamp: new Date()
      });
    }

    // 启动执行
    await req.orchestrator.startExecution(flowId);

    res.json({
      success: true,
      data: {
        message: '执行已启动',
        flowId,
        executionId: flow.executionId
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/execution/:executionId/pause
 * 暂停执行
 */
router.post('/:executionId/pause', async (req, res, next) => {
  try {
    const { executionId } = req.params;

    // 找到对应的Flow
    let flow = null;
    let flowId = null;

    for (const [fId, f] of req.orchestrator.activeFlows.entries()) {
      if (f.executionId === executionId) {
        flow = f;
        flowId = fId;
        break;
      }
    }

    if (!flow) {
      return res.status(404).json({
        success: false,
        error: '执行实例不存在',
        timestamp: new Date()
      });
    }

    // 模拟暂停操作
    if (flow.taskGraph) {
      flow.taskGraph.status = 'paused';
      req.orchestrator.updateFlow(flowId, flow);
    }

    res.json({
      success: true,
      data: {
        message: '执行已暂停',
        executionId,
        flowId
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/execution/:executionId/resume
 * 恢复执行
 */
router.post('/:executionId/resume', async (req, res, next) => {
  try {
    const { executionId } = req.params;

    // 找到对应的Flow
    let flow = null;
    let flowId = null;

    for (const [fId, f] of req.orchestrator.activeFlows.entries()) {
      if (f.executionId === executionId) {
        flow = f;
        flowId = fId;
        break;
      }
    }

    if (!flow) {
      return res.status(404).json({
        success: false,
        error: '执行实例不存在',
        timestamp: new Date()
      });
    }

    // 模拟恢复操作
    if (flow.taskGraph && flow.taskGraph.status === 'paused') {
      flow.taskGraph.status = 'executing';
      req.orchestrator.updateFlow(flowId, flow);

      // 重新开始监控
      req.orchestrator.monitorExecution(flowId, executionId);
    }

    res.json({
      success: true,
      data: {
        message: '执行已恢复',
        executionId,
        flowId
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/execution/:executionId/cancel
 * 取消执行
 */
router.post('/:executionId/cancel', async (req, res, next) => {
  try {
    const { executionId } = req.params;
    const { reason } = req.body;

    // 找到对应的Flow
    let flow = null;
    let flowId = null;

    for (const [fId, f] of req.orchestrator.activeFlows.entries()) {
      if (f.executionId === executionId) {
        flow = f;
        flowId = fId;
        break;
      }
    }

    if (!flow) {
      return res.status(404).json({
        success: false,
        error: '执行实例不存在',
        timestamp: new Date()
      });
    }

    // 模拟取消操作
    if (flow.taskGraph) {
      flow.taskGraph.status = 'cancelled';
      flow.taskGraph.endTime = new Date();
    }

    flow.status = 'cancelled';
    flow.cancelReason = reason || '用户取消';
    req.orchestrator.updateFlow(flowId, flow);

    res.json({
      success: true,
      data: {
        message: '执行已取消',
        executionId,
        flowId,
        reason
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/execution/:executionId/tasks
 * 获取执行中的任务详情
 */
router.get('/:executionId/tasks', async (req, res, next) => {
  try {
    const { executionId } = req.params;
    const { status, assignee } = req.query;

    // 找到对应的Flow
    let flow = null;

    for (const [fId, f] of req.orchestrator.activeFlows.entries()) {
      if (f.executionId === executionId) {
        flow = f;
        break;
      }
    }

    if (!flow || !flow.taskGraph) {
      return res.status(404).json({
        success: false,
        error: '执行实例或TaskGraph不存在',
        timestamp: new Date()
      });
    }

    let tasks = flow.taskGraph.nodes;

    // 按状态过滤
    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }

    // 按负责人过滤
    if (assignee) {
      tasks = tasks.filter(task => task.assignee === assignee);
    }

    // 生成任务统计
    const statistics = {
      total: flow.taskGraph.nodes.length,
      pending: flow.taskGraph.nodes.filter(t => t.status === 'pending').length,
      ready: flow.taskGraph.nodes.filter(t => t.status === 'ready').length,
      executing: flow.taskGraph.nodes.filter(t => t.status === 'executing').length,
      completed: flow.taskGraph.nodes.filter(t => t.status === 'completed').length,
      failed: flow.taskGraph.nodes.filter(t => t.status === 'failed').length,
      blocked: flow.taskGraph.nodes.filter(t => t.status === 'blocked').length,
      totalEstimatedHours: flow.taskGraph.nodes.reduce((sum, t) => sum + t.estimatedHours, 0),
      totalActualHours: flow.taskGraph.nodes.reduce((sum, t) => sum + (t.actualHours || 0), 0)
    };

    res.json({
      success: true,
      data: {
        executionId,
        tasks,
        statistics,
        edges: flow.taskGraph.edges,
        overallProgress: flow.taskGraph.progress
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/execution/:executionId/tasks/:taskId
 * 更新任务状态
 */
router.put('/:executionId/tasks/:taskId', async (req, res, next) => {
  try {
    const { executionId, taskId } = req.params;
    const { status, actualHours, deliverables, notes } = req.body;

    // 找到对应的Flow
    let flow = null;
    let flowId = null;

    for (const [fId, f] of req.orchestrator.activeFlows.entries()) {
      if (f.executionId === executionId) {
        flow = f;
        flowId = fId;
        break;
      }
    }

    if (!flow || !flow.taskGraph) {
      return res.status(404).json({
        success: false,
        error: '执行实例或TaskGraph不存在',
        timestamp: new Date()
      });
    }

    // 找到任务
    const task = flow.taskGraph.nodes.find(t => t.id === taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: '任务不存在',
        timestamp: new Date()
      });
    }

    // 更新任务状态
    if (status && ['pending', 'ready', 'executing', 'completed', 'failed', 'blocked'].includes(status)) {
      const oldStatus = task.status;
      task.status = status;

      // 更新时间戳
      if (status === 'executing' && oldStatus !== 'executing') {
        task.startTime = new Date();
      }
      if (['completed', 'failed'].includes(status) && !['completed', 'failed'].includes(oldStatus)) {
        task.endTime = new Date();
      }
    }

    // 更新实际工时
    if (actualHours !== undefined) {
      task.actualHours = parseFloat(actualHours);
    }

    // 更新交付物
    if (deliverables && Array.isArray(deliverables)) {
      deliverables.forEach(deliverable => {
        const existing = task.deliverables.find(d => d.id === deliverable.id);
        if (existing) {
          Object.assign(existing, deliverable);
        }
      });
    }

    // 添加更新记录
    if (!task.updateHistory) {
      task.updateHistory = [];
    }
    task.updateHistory.push({
      timestamp: new Date(),
      changes: { status, actualHours, deliverables },
      notes: notes || ''
    });

    // 重新计算整体进度
    const completedTasks = flow.taskGraph.nodes.filter(t => t.status === 'completed').length;
    flow.taskGraph.progress = Math.round((completedTasks / flow.taskGraph.nodes.length) * 100);

    req.orchestrator.updateFlow(flowId, flow);

    res.json({
      success: true,
      data: {
        message: '任务状态已更新',
        task,
        overallProgress: flow.taskGraph.progress
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/execution/:executionId/feedback
 * 提交执行反馈
 */
router.post('/:executionId/feedback', async (req, res, next) => {
  try {
    const { executionId } = req.params;
    const { taskNodeId, type, message, data, source = 'human' } = req.body;

    if (!type || !message) {
      return res.status(400).json({
        success: false,
        error: '反馈类型和消息为必填项',
        timestamp: new Date()
      });
    }

    if (!['progress', 'completion', 'error', 'blocked', 'resource_request'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: '无效的反馈类型',
        timestamp: new Date()
      });
    }

    // 找到对应的Flow
    let flow = null;
    let flowId = null;

    for (const [fId, f] of req.orchestrator.activeFlows.entries()) {
      if (f.executionId === executionId) {
        flow = f;
        flowId = fId;
        break;
      }
    }

    if (!flow) {
      return res.status(404).json({
        success: false,
        error: '执行实例不存在',
        timestamp: new Date()
      });
    }

    // 创建反馈记录
    const feedback = {
      id: `feedback_${Date.now()}`,
      taskNodeId,
      type,
      message,
      data: data || {},
      timestamp: new Date(),
      source
    };

    // 保存反馈到Flow
    if (!flow.feedbackHistory) {
      flow.feedbackHistory = [];
    }
    flow.feedbackHistory.push(feedback);

    req.orchestrator.updateFlow(flowId, flow);

    // 根据反馈类型处理特殊逻辑
    if (type === 'blocked' && taskNodeId) {
      // 如果任务被阻塞，更新任务状态
      const task = flow.taskGraph?.nodes.find(t => t.id === taskNodeId);
      if (task) {
        task.status = 'blocked';
        task.blockReason = message;
      }
    }

    res.json({
      success: true,
      data: {
        message: '反馈已记录',
        feedback
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/execution/:executionId/feedback
 * 获取执行反馈历史
 */
router.get('/:executionId/feedback', async (req, res, next) => {
  try {
    const { executionId } = req.params;
    const { type, taskNodeId, source, page = 1, limit = 50 } = req.query;

    // 找到对应的Flow
    let flow = null;

    for (const [fId, f] of req.orchestrator.activeFlows.entries()) {
      if (f.executionId === executionId) {
        flow = f;
        break;
      }
    }

    if (!flow) {
      return res.status(404).json({
        success: false,
        error: '执行实例不存在',
        timestamp: new Date()
      });
    }

    let feedbacks = flow.feedbackHistory || [];

    // 过滤
    if (type) {
      feedbacks = feedbacks.filter(f => f.type === type);
    }
    if (taskNodeId) {
      feedbacks = feedbacks.filter(f => f.taskNodeId === taskNodeId);
    }
    if (source) {
      feedbacks = feedbacks.filter(f => f.source === source);
    }

    // 排序（最新的在前）
    feedbacks.sort((a, b) => b.timestamp - a.timestamp);

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedFeedbacks = feedbacks.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        feedbacks: paginatedFeedbacks,
        pagination: {
          total: feedbacks.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(feedbacks.length / limit)
        }
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/execution/status
 * 获取所有活跃执行的状态概览
 */
router.get('/status', async (req, res, next) => {
  try {
    const { userId } = req.query;

    const executionOverview = [];

    for (const [flowId, flow] of req.orchestrator.activeFlows.entries()) {
      if (flow.executionId && flow.taskGraph) {
        // 用户过滤
        if (userId && flow.objective.userId !== userId) {
          continue;
        }

        const status = req.orchestrator.executionCache.get(flow.executionId);

        executionOverview.push({
          flowId,
          executionId: flow.executionId,
          objectiveTitle: flow.objective.title,
          priority: flow.objective.priority,
          status: flow.taskGraph.status,
          progress: flow.taskGraph.progress,
          startTime: flow.taskGraph.startTime,
          estimatedCompletion: status?.estimatedCompletion,
          activeNodeCount: status?.activeNodes.length || 0,
          blockedNodeCount: status?.blockedNodes.length || 0,
          failedNodeCount: status?.failedNodes.length || 0
        });
      }
    }

    // 排序（进度倒序，优先级高的在前）
    executionOverview.sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a.priority] || 1;
      const bPriority = priorityWeight[b.priority] || 1;

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      return a.progress - b.progress; // 进度低的在前（需要关注）
    });

    res.json({
      success: true,
      data: {
        executions: executionOverview,
        summary: {
          total: executionOverview.length,
          executing: executionOverview.filter(e => e.status === 'executing').length,
          completed: executionOverview.filter(e => e.status === 'completed').length,
          paused: executionOverview.filter(e => e.status === 'paused').length,
          failed: executionOverview.filter(e => e.status === 'failed').length,
          avgProgress: executionOverview.reduce((sum, e) => sum + e.progress, 0) / executionOverview.length || 0
        }
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

export default router;