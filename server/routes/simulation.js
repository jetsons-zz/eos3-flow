import express from 'express';

const router = express.Router();

/**
 * GET /api/simulation/flow/:flowId
 * 获取Flow的仿真结果
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

    res.json({
      success: true,
      data: {
        flowId,
        simulationResults: flow.simulationResults,
        status: flow.status,
        simulatedAt: flow.simulationResults.length > 0 ? flow.updatedAt : null
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/simulation/flow/:flowId/run
 * 重新运行仿真
 */
router.post('/flow/:flowId/run', async (req, res, next) => {
  try {
    const { flowId } = req.params;
    const { proposalIds, parameters } = req.body;

    const flow = req.orchestrator.activeFlows.get(flowId);

    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Flow不存在',
        timestamp: new Date()
      });
    }

    // 检查Flow状态
    if (!['proposals_generated', 'simulation_completed'].includes(flow.status)) {
      return res.status(400).json({
        success: false,
        error: `当前状态 ${flow.status} 不允许运行仿真`,
        timestamp: new Date()
      });
    }

    // 如果指定了特定方案，只仿真这些方案
    let proposalsToSimulate = flow.proposals;
    if (proposalIds && Array.isArray(proposalIds)) {
      proposalsToSimulate = flow.proposals.filter(p => proposalIds.includes(p.id));

      if (proposalsToSimulate.length === 0) {
        return res.status(400).json({
          success: false,
          error: '未找到指定的方案',
          timestamp: new Date()
        });
      }
    }

    // 重新运行仿真
    await req.orchestrator.runSimulation(flowId);

    res.json({
      success: true,
      data: {
        message: '仿真运行中...',
        flowId,
        proposalCount: proposalsToSimulate.length
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/simulation/:simulationId
 * 获取特定仿真结果详情
 */
router.get('/:simulationId', async (req, res, next) => {
  try {
    const { simulationId } = req.params;

    // 搜索所有Flow找到仿真结果
    let foundSimulation = null;
    let flowId = null;

    for (const [fId, flow] of req.orchestrator.activeFlows.entries()) {
      const simulation = flow.simulationResults.find(s => s.id === simulationId);
      if (simulation) {
        foundSimulation = simulation;
        flowId = fId;
        break;
      }
    }

    if (!foundSimulation) {
      return res.status(404).json({
        success: false,
        error: '仿真结果不存在',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        simulation: foundSimulation,
        flowId
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/simulation/:simulationId/scenarios
 * 获取仿真场景详情
 */
router.get('/:simulationId/scenarios', async (req, res, next) => {
  try {
    const { simulationId } = req.params;

    // 找到仿真结果
    let foundSimulation = null;
    for (const [fId, flow] of req.orchestrator.activeFlows.entries()) {
      const simulation = flow.simulationResults.find(s => s.id === simulationId);
      if (simulation) {
        foundSimulation = simulation;
        break;
      }
    }

    if (!foundSimulation) {
      return res.status(404).json({
        success: false,
        error: '仿真结果不存在',
        timestamp: new Date()
      });
    }

    // 生成场景统计
    const scenarioStats = foundSimulation.scenarios.map(scenario => ({
      id: scenario.id,
      name: scenario.name,
      probability: scenario.probability,
      outcomeCount: scenario.outcomes.length,
      timelineEventCount: scenario.timeline.length,
      riskLevel: scenario.outcomes.reduce((avg, outcome) => avg + (1 - outcome.confidence), 0) / scenario.outcomes.length || 0
    }));

    res.json({
      success: true,
      data: {
        scenarios: foundSimulation.scenarios,
        statistics: scenarioStats,
        totalProbability: foundSimulation.scenarios.reduce((sum, s) => sum + s.probability, 0)
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/simulation/:simulationId/risk-assessment
 * 获取风险评估详情
 */
router.get('/:simulationId/risk-assessment', async (req, res, next) => {
  try {
    const { simulationId } = req.params;

    // 找到仿真结果
    let foundSimulation = null;
    for (const [fId, flow] of req.orchestrator.activeFlows.entries()) {
      const simulation = flow.simulationResults.find(s => s.id === simulationId);
      if (simulation) {
        foundSimulation = simulation;
        break;
      }
    }

    if (!foundSimulation) {
      return res.status(404).json({
        success: false,
        error: '仿真结果不存在',
        timestamp: new Date()
      });
    }

    const riskAssessment = foundSimulation.riskAssessment;

    // 生成风险等级分类
    const riskLevels = {
      low: riskAssessment.overallRisk < 0.3,
      medium: riskAssessment.overallRisk >= 0.3 && riskAssessment.overallRisk < 0.7,
      high: riskAssessment.overallRisk >= 0.7
    };

    const currentRiskLevel = Object.keys(riskLevels).find(level => riskLevels[level]);

    res.json({
      success: true,
      data: {
        riskAssessment,
        riskLevel: currentRiskLevel,
        riskLevels,
        hasBottlenecks: riskAssessment.bottlenecks.length > 0,
        hasCriticalPaths: riskAssessment.criticalPaths.length > 0
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/simulation/compare
 * 比较多个仿真结果
 */
router.post('/compare', async (req, res, next) => {
  try {
    const { simulationIds } = req.body;

    if (!simulationIds || !Array.isArray(simulationIds) || simulationIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: '至少需要选择2个仿真结果进行比较',
        timestamp: new Date()
      });
    }

    // 收集所有仿真结果
    const simulations = [];
    for (const simulationId of simulationIds) {
      for (const [fId, flow] of req.orchestrator.activeFlows.entries()) {
        const simulation = flow.simulationResults.find(s => s.id === simulationId);
        if (simulation) {
          simulations.push(simulation);
          break;
        }
      }
    }

    if (simulations.length !== simulationIds.length) {
      return res.status(404).json({
        success: false,
        error: '部分仿真结果不存在',
        timestamp: new Date()
      });
    }

    // 生成比较报告
    const comparison = {
      simulations: simulations.map(s => ({
        id: s.id,
        proposalId: s.proposalId,
        consistencyScore: s.consistencyScore,
        overallRisk: s.riskAssessment.overallRisk,
        scenarioCount: s.scenarios.length,
        recommendedPath: s.recommendedPath,
        bottleneckCount: s.riskAssessment.bottlenecks.length,
        criticalPathCount: s.riskAssessment.criticalPaths.length
      })),
      summary: {
        mostConsistent: simulations.reduce((max, s) => s.consistencyScore > max.consistencyScore ? s : max),
        leastRisky: simulations.reduce((min, s) => s.riskAssessment.overallRisk < min.riskAssessment.overallRisk ? s : min),
        recommended: simulations.find(s => s.recommendedPath === s.proposalId) || null
      },
      averages: {
        consistencyScore: simulations.reduce((sum, s) => sum + s.consistencyScore, 0) / simulations.length,
        overallRisk: simulations.reduce((sum, s) => sum + s.riskAssessment.overallRisk, 0) / simulations.length
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

/**
 * GET /api/simulation/:simulationId/export
 * 导出仿真结果
 */
router.get('/:simulationId/export', async (req, res, next) => {
  try {
    const { simulationId } = req.params;
    const { format = 'json' } = req.query;

    // 找到仿真结果
    let foundSimulation = null;
    for (const [fId, flow] of req.orchestrator.activeFlows.entries()) {
      const simulation = flow.simulationResults.find(s => s.id === simulationId);
      if (simulation) {
        foundSimulation = simulation;
        break;
      }
    }

    if (!foundSimulation) {
      return res.status(404).json({
        success: false,
        error: '仿真结果不存在',
        timestamp: new Date()
      });
    }

    // 根据格式返回数据
    if (format === 'csv') {
      // 简化的CSV格式
      const csvData = [
        'Scenario,Probability,Outcome Count,Risk Level',
        ...foundSimulation.scenarios.map(s =>
          `${s.name},${s.probability},${s.outcomes.length},${foundSimulation.riskAssessment.overallRisk}`
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="simulation-${simulationId}.csv"`);
      res.send(csvData);
    } else {
      // JSON格式
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="simulation-${simulationId}.json"`);
      res.json({
        simulation: foundSimulation,
        exportedAt: new Date(),
        version: '1.0'
      });
    }

  } catch (error) {
    next(error);
  }
});

export default router;