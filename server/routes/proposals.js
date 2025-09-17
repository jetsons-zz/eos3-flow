import express from 'express';

const router = express.Router();

/**
 * GET /api/proposals/flow/:flowId
 * 获取特定Flow的候选方案
 */
router.get('/flow/:flowId', async (req, res, next) => {
  try {
    const { flowId } = req.params;

    // 从编排器获取Flow状态
    const flow = req.orchestrator.activeFlows.get(flowId);

    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Flow不存在',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        flowId,
        proposals: flow.proposals,
        status: flow.status,
        generatedAt: flow.proposals.length > 0 ? flow.updatedAt : null
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/proposals/flow/:flowId/regenerate
 * 重新生成候选方案
 */
router.post('/flow/:flowId/regenerate', async (req, res, next) => {
  try {
    const { flowId } = req.params;
    const { modifications } = req.body;

    const flow = req.orchestrator.activeFlows.get(flowId);

    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Flow不存在',
        timestamp: new Date()
      });
    }

    // 检查Flow状态，确保可以重新生成
    if (!['proposals_generated', 'simulation_completed', 'rejected'].includes(flow.status)) {
      return res.status(400).json({
        success: false,
        error: `当前状态 ${flow.status} 不允许重新生成方案`,
        timestamp: new Date()
      });
    }

    // 如果有修改要求，应用到目标
    if (modifications && modifications.length > 0) {
      // 这里可以实现对目标的修改逻辑
      console.log('应用修改:', modifications);
    }

    // 重新生成方案
    await req.orchestrator.generateProposals(flowId);

    res.json({
      success: true,
      data: {
        message: '方案重新生成中...',
        flowId
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/proposals/:proposalId
 * 获取特定方案详情
 */
router.get('/:proposalId', async (req, res, next) => {
  try {
    const { proposalId } = req.params;

    // 搜索所有Flow找到包含该方案的Flow
    let foundProposal = null;
    let flowId = null;

    for (const [fId, flow] of req.orchestrator.activeFlows.entries()) {
      const proposal = flow.proposals.find(p => p.id === proposalId);
      if (proposal) {
        foundProposal = proposal;
        flowId = fId;
        break;
      }
    }

    if (!foundProposal) {
      return res.status(404).json({
        success: false,
        error: '方案不存在',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        proposal: foundProposal,
        flowId
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/proposals/:proposalId/refine
 * 优化特定方案
 */
router.post('/:proposalId/refine', async (req, res, next) => {
  try {
    const { proposalId } = req.params;
    const { modifications } = req.body;

    if (!modifications || !Array.isArray(modifications)) {
      return res.status(400).json({
        success: false,
        error: '必须提供修改列表',
        timestamp: new Date()
      });
    }

    // 找到包含该方案的Flow
    let flowId = null;
    for (const [fId, flow] of req.orchestrator.activeFlows.entries()) {
      if (flow.proposals.some(p => p.id === proposalId)) {
        flowId = fId;
        break;
      }
    }

    if (!flowId) {
      return res.status(404).json({
        success: false,
        error: '方案不存在',
        timestamp: new Date()
      });
    }

    // 调用编排器优化方案
    await req.orchestrator.refineProposal(flowId, proposalId, modifications);

    res.json({
      success: true,
      data: {
        message: '方案优化中...',
        proposalId,
        flowId
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/proposals/:proposalId/steps
 * 获取方案的步骤详情
 */
router.get('/:proposalId/steps', async (req, res, next) => {
  try {
    const { proposalId } = req.params;

    // 找到方案
    let foundProposal = null;
    for (const [fId, flow] of req.orchestrator.activeFlows.entries()) {
      const proposal = flow.proposals.find(p => p.id === proposalId);
      if (proposal) {
        foundProposal = proposal;
        break;
      }
    }

    if (!foundProposal) {
      return res.status(404).json({
        success: false,
        error: '方案不存在',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: foundProposal.steps,
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/proposals/:proposalId/risks
 * 获取方案的风险评估
 */
router.get('/:proposalId/risks', async (req, res, next) => {
  try {
    const { proposalId } = req.params;

    // 找到方案
    let foundProposal = null;
    for (const [fId, flow] of req.orchestrator.activeFlows.entries()) {
      const proposal = flow.proposals.find(p => p.id === proposalId);
      if (proposal) {
        foundProposal = proposal;
        break;
      }
    }

    if (!foundProposal) {
      return res.status(404).json({
        success: false,
        error: '方案不存在',
        timestamp: new Date()
      });
    }

    // 计算风险统计
    const riskStats = {
      totalRisks: foundProposal.risks.length,
      averageProbability: foundProposal.risks.reduce((sum, r) => sum + r.probability, 0) / foundProposal.risks.length || 0,
      averageImpact: foundProposal.risks.reduce((sum, r) => sum + r.impact, 0) / foundProposal.risks.length || 0,
      highRisks: foundProposal.risks.filter(r => r.probability * r.impact > 0.5).length
    };

    res.json({
      success: true,
      data: {
        risks: foundProposal.risks,
        statistics: riskStats
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/proposals/compare
 * 比较多个方案
 */
router.post('/compare', async (req, res, next) => {
  try {
    const { proposalIds } = req.body;

    if (!proposalIds || !Array.isArray(proposalIds) || proposalIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: '至少需要选择2个方案进行比较',
        timestamp: new Date()
      });
    }

    // 收集所有方案
    const proposals = [];
    for (const proposalId of proposalIds) {
      for (const [fId, flow] of req.orchestrator.activeFlows.entries()) {
        const proposal = flow.proposals.find(p => p.id === proposalId);
        if (proposal) {
          proposals.push(proposal);
          break;
        }
      }
    }

    if (proposals.length !== proposalIds.length) {
      return res.status(404).json({
        success: false,
        error: '部分方案不存在',
        timestamp: new Date()
      });
    }

    // 生成比较报告
    const comparison = {
      proposals: proposals.map(p => ({
        id: p.id,
        title: p.title,
        estimatedDuration: p.estimatedDuration,
        confidence: p.confidence,
        riskCount: p.risks.length,
        stepCount: p.steps.length,
        avgRisk: p.risks.reduce((sum, r) => sum + r.probability * r.impact, 0) / p.risks.length || 0
      })),
      summary: {
        fastest: proposals.reduce((min, p) => p.estimatedDuration < min.estimatedDuration ? p : min),
        mostConfident: proposals.reduce((max, p) => p.confidence > max.confidence ? p : max),
        leastRisky: proposals.reduce((min, p) => {
          const pRisk = p.risks.reduce((sum, r) => sum + r.probability * r.impact, 0) / p.risks.length || 0;
          const minRisk = min.risks.reduce((sum, r) => sum + r.probability * r.impact, 0) / min.risks.length || 0;
          return pRisk < minRisk ? p : min;
        })
      }
    };

    res.json({
      success: true,
      data: comparison,
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

export default router;