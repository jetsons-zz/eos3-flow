import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// 模拟Jantra仿真引擎
class JantraEngine {
  constructor() {
    this.scenarios = ['最优情况', '预期情况', '悲观情况'];
    this.simulationConfig = {
      iterations: 1000,
      confidenceLevel: 0.95,
      timeStep: 1 // 天
    };
  }

  // 运行仿真验证
  async runSimulation(proposals) {
    try {
      console.log('Jantra仿真引擎开始分析方案...');

      // 模拟仿真计算过程
      await this.simulateComputation();

      const simulationResults = [];

      for (const proposal of proposals) {
        const result = await this.simulateProposal(proposal);
        simulationResults.push(result);
      }

      // 生成综合分析
      const analysis = this.generateAnalysis(simulationResults);

      console.log('Jantra仿真完成，生成验证结果');
      return {
        id: uuidv4(),
        proposalIds: proposals.map(p => p.id),
        results: simulationResults,
        analysis,
        createdAt: new Date(),
        status: 'completed'
      };

    } catch (error) {
      console.error('Jantra仿真失败:', error);
      throw new Error('仿真引擎暂时不可用');
    }
  }

  // 模拟计算过程
  async simulateComputation() {
    return new Promise(resolve => {
      setTimeout(resolve, 2000 + Math.random() * 3000); // 2-5秒仿真时间
    });
  }

  // 仿真单个方案
  async simulateProposal(proposal) {
    const scenarios = this.generateScenarios(proposal);
    const riskAssessment = this.assessRisks(proposal);
    const resourceBottlenecks = this.identifyBottlenecks(proposal);
    const timelineAnalysis = this.analyzeTimeline(proposal);

    return {
      id: uuidv4(),
      proposalId: proposal.id,
      proposalTitle: proposal.title,
      scenarios,
      riskAssessment,
      resourceBottlenecks,
      timelineAnalysis,
      recommendations: this.generateRecommendations(proposal, scenarios, riskAssessment),
      overallScore: this.calculateOverallScore(scenarios, riskAssessment),
      confidence: this.calculateConfidence(proposal)
    };
  }

  // 生成仿真场景
  generateScenarios(proposal) {
    const baselineDuration = proposal.estimatedDuration;
    const baselineCost = proposal.estimatedCost;

    return [
      {
        name: '最优情况',
        probability: 0.15,
        duration: Math.ceil(baselineDuration * 0.85), // 提前15%
        cost: Math.ceil(baselineCost * 0.9), // 节省10%成本
        successRate: 0.95,
        kpiAchievement: 1.1, // 超额完成10%
        description: '所有条件理想，团队高效协作'
      },
      {
        name: '预期情况',
        probability: 0.6,
        duration: baselineDuration,
        cost: baselineCost,
        successRate: 0.85,
        kpiAchievement: 1.0, // 正常完成
        description: '按计划执行，遇到常规挑战'
      },
      {
        name: '悲观情况',
        probability: 0.25,
        duration: Math.ceil(baselineDuration * 1.4), // 延期40%
        cost: Math.ceil(baselineCost * 1.3), // 超支30%
        successRate: 0.6,
        kpiAchievement: 0.7, // 只完成70%
        description: '遇到重大阻碍，需要额外资源'
      }
    ];
  }

  // 风险评估
  assessRisks(proposal) {
    const risks = proposal.risks || [];
    const overallRisk = this.calculateOverallRisk(risks);

    return {
      overallRisk,
      riskLevel: overallRisk > 0.7 ? '高风险' : overallRisk > 0.4 ? '中等风险' : '低风险',
      criticalRisks: risks.filter(r => r.probability * r.impact > 0.5),
      mitigation: this.generateRiskMitigation(risks),
      contingencyPlan: this.generateContingencyPlan(proposal, risks)
    };
  }

  // 识别资源瓶颈
  identifyBottlenecks(proposal) {
    const requirements = proposal.resourceRequirements || [];
    const bottlenecks = [];

    // 模拟资源瓶颈分析
    requirements.forEach(req => {
      if (req.urgency === 'high' || req.urgency === 'critical') {
        bottlenecks.push({
          type: req.type,
          skills: req.skills,
          severity: req.urgency === 'critical' ? '严重' : '中等',
          impact: '可能延误项目进度',
          solution: this.suggestBottleneckSolution(req)
        });
      }
    });

    return {
      identified: bottlenecks,
      count: bottlenecks.length,
      severity: bottlenecks.some(b => b.severity === '严重') ? '高' :
               bottlenecks.length > 0 ? '中' : '低'
    };
  }

  // 时间线分析
  analyzeTimeline(proposal) {
    const tasks = proposal.taskBreakdown || [];
    const criticalPath = this.findCriticalPath(tasks);
    const bufferAnalysis = this.analyzeTimeBuffers(tasks);

    return {
      criticalPath,
      totalDuration: proposal.estimatedDuration,
      bufferAnalysis,
      milestones: this.generateMilestones(tasks),
      riskPeriods: this.identifyRiskPeriods(tasks, proposal.risks)
    };
  }

  // 计算综合风险
  calculateOverallRisk(risks) {
    if (!risks || risks.length === 0) return 0.2;

    const weightedRisk = risks.reduce((sum, risk) => {
      return sum + (risk.probability * risk.impact);
    }, 0) / risks.length;

    return Math.min(weightedRisk * 1.2, 1); // 轻微增加风险评估
  }

  // 生成建议
  generateRecommendations(proposal, scenarios, riskAssessment) {
    const recommendations = [];

    // 基于信心度的建议
    if (proposal.confidence < 0.7) {
      recommendations.push({
        type: '增强计划',
        priority: 'high',
        description: '建议增加预研时间，完善技术方案',
        impact: '提高执行成功率'
      });
    }

    // 基于风险的建议
    if (riskAssessment.overallRisk > 0.6) {
      recommendations.push({
        type: '风险控制',
        priority: 'critical',
        description: '建议制定详细的风险应对预案',
        impact: '降低项目失败概率'
      });
    }

    // 基于场景的建议
    const pessimisticScenario = scenarios.find(s => s.name === '悲观情况');
    if (pessimisticScenario && pessimisticScenario.probability > 0.3) {
      recommendations.push({
        type: '缓冲增加',
        priority: 'medium',
        description: '建议增加20%的时间和预算缓冲',
        impact: '提高计划的稳健性'
      });
    }

    return recommendations;
  }

  // 计算综合评分
  calculateOverallScore(scenarios, riskAssessment) {
    const expectedScenario = scenarios.find(s => s.name === '预期情况');
    const successRate = expectedScenario ? expectedScenario.successRate : 0.8;
    const riskPenalty = riskAssessment.overallRisk * 0.3;

    return Math.max(0, Math.min(100, (successRate - riskPenalty) * 100));
  }

  // 计算信心度
  calculateConfidence(proposal) {
    let confidence = proposal.confidence || 0.8;

    // 基于任务分解完整性调整
    const taskBreakdown = proposal.taskBreakdown || [];
    if (taskBreakdown.length < 5) {
      confidence *= 0.9; // 任务分解不够详细
    }

    return Math.min(confidence, 0.95);
  }

  // 生成风险缓解措施
  generateRiskMitigation(risks) {
    return risks.map(risk => ({
      riskId: risk.id,
      category: risk.category,
      mitigation: risk.mitigation || '定期监控和评估',
      contingency: this.getContingencyAction(risk.category)
    }));
  }

  // 生成应急计划
  generateContingencyPlan(proposal, risks) {
    const highRisks = risks.filter(r => r.probability * r.impact > 0.4);

    return {
      triggers: highRisks.map(r => `${r.category}风险触发`),
      actions: [
        '立即评估影响范围',
        '激活备用资源',
        '调整项目计划',
        '通知相关干系人'
      ],
      escalation: '如风险无法控制，上报管理层决策'
    };
  }

  // 建议瓶颈解决方案
  suggestBottleneckSolution(requirement) {
    const solutions = {
      'human': '考虑外包或临时雇佣，建立人才储备',
      'budget': '申请追加预算或调整资源分配',
      'tool': '寻找替代工具或临时许可证',
      'compute': '使用云资源或优化算法'
    };

    return solutions[requirement.type] || '寻找替代方案';
  }

  // 找到关键路径
  findCriticalPath(tasks) {
    // 简化的关键路径计算
    const longestTasks = tasks
      .sort((a, b) => b.estimatedDuration - a.estimatedDuration)
      .slice(0, 3);

    return {
      tasks: longestTasks.map(t => t.name),
      duration: longestTasks.reduce((sum, t) => sum + t.estimatedDuration, 0),
      bottleneck: longestTasks[0]?.name || '无'
    };
  }

  // 分析时间缓冲
  analyzeTimeBuffers(tasks) {
    const totalEstimated = tasks.reduce((sum, t) => sum + t.estimatedDuration, 0);
    const bufferNeeded = totalEstimated * 0.2; // 建议20%缓冲

    return {
      totalEstimated,
      recommendedBuffer: Math.ceil(bufferNeeded),
      bufferRatio: 0.2,
      rationale: '基于历史项目数据的风险缓冲建议'
    };
  }

  // 生成里程碑
  generateMilestones(tasks) {
    const milestones = [];
    let accumulatedDuration = 0;

    tasks.forEach((task, index) => {
      accumulatedDuration += task.estimatedDuration;
      if (index % 2 === 1 || index === tasks.length - 1) { // 每2个任务一个里程碑
        milestones.push({
          name: `里程碑${Math.floor(index/2) + 1}`,
          tasks: tasks.slice(Math.max(0, index-1), index+1).map(t => t.name),
          expectedDate: accumulatedDuration,
          deliverables: [`${task.name}完成确认`]
        });
      }
    });

    return milestones;
  }

  // 识别风险时期
  identifyRiskPeriods(tasks, risks) {
    const riskPeriods = [];

    // 项目初期风险
    riskPeriods.push({
      period: '项目启动期',
      timeframe: '前20%时间',
      risks: ['需求不明确', '团队磨合'],
      mitigation: '加强沟通，明确需求'
    });

    // 项目中期风险
    riskPeriods.push({
      period: '开发高峰期',
      timeframe: '40%-80%时间',
      risks: ['技术难题', '进度压力'],
      mitigation: '技术评审，进度监控'
    });

    return riskPeriods;
  }

  // 获取应急行动
  getContingencyAction(category) {
    const actions = {
      'technical': '引入技术专家，降低技术难度',
      'resource': '启用备用人员，外部支援',
      'timeline': '并行开发，优化流程',
      'budget': '重新审批预算，削减非核心功能',
      'external': '启动应急预案，寻找替代方案'
    };

    return actions[category] || '寻求管理层支持';
  }

  // 生成综合分析
  generateAnalysis(results) {
    const avgScore = results.reduce((sum, r) => sum + r.overallScore, 0) / results.length;
    const bestProposal = results.reduce((best, current) =>
      current.overallScore > best.overallScore ? current : best
    );
    const riskiest = results.reduce((highest, current) =>
      current.riskAssessment.overallRisk > highest.riskAssessment.overallRisk ? current : highest
    );

    return {
      summary: {
        averageScore: Math.round(avgScore),
        recommendedProposal: bestProposal.proposalId,
        riskiestProposal: riskiest.proposalId,
        overallRecommendation: this.getOverallRecommendation(avgScore)
      },
      insights: [
        `最佳方案得分: ${bestProposal.overallScore}分`,
        `平均成功率: ${Math.round(avgScore)}%`,
        `主要风险: ${riskiest.riskAssessment.riskLevel}`,
        `建议: ${avgScore > 75 ? '可以推进' : avgScore > 60 ? '需要优化' : '重新规划'}`
      ],
      nextSteps: this.suggestNextSteps(avgScore, results)
    };
  }

  // 获取总体建议
  getOverallRecommendation(avgScore) {
    if (avgScore > 80) return '强烈推荐执行';
    if (avgScore > 70) return '建议执行';
    if (avgScore > 60) return '需要优化后执行';
    return '建议重新规划';
  }

  // 建议下一步行动
  suggestNextSteps(avgScore, results) {
    const steps = [];

    if (avgScore > 75) {
      steps.push('提交审批决策');
      steps.push('准备资源分配');
    } else if (avgScore > 60) {
      steps.push('优化高风险环节');
      steps.push('增加资源缓冲');
      steps.push('完善风险应对预案');
    } else {
      steps.push('重新评估目标可行性');
      steps.push('调整方案或时间线');
      steps.push('寻求额外资源支持');
    }

    steps.push('准备HITL审批材料');
    return steps;
  }
}

// 创建Jantra引擎实例
const jantraEngine = new JantraEngine();

// 运行仿真验证
router.post('/run-simulation', async (req, res) => {
  try {
    const { proposals } = req.body;

    if (!proposals || !Array.isArray(proposals) || proposals.length === 0) {
      return res.status(400).json({
        success: false,
        error: '缺少方案数据',
        timestamp: new Date()
      });
    }

    console.log(`收到仿真请求，共${proposals.length}个方案`);

    // 调用Jantra引擎运行仿真
    const simulationResult = await jantraEngine.runSimulation(proposals);

    res.json({
      success: true,
      data: simulationResult,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Jantra仿真失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

// 获取仿真状态
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      engine: 'Jantra v1.0',
      status: 'operational',
      capabilities: [
        '多场景仿真',
        '风险评估',
        '资源瓶颈分析',
        '时间线验证',
        '一致性检查'
      ],
      config: jantraEngine.simulationConfig
    },
    timestamp: new Date()
  });
});

// 验证方案一致性
router.post('/validate-consistency/:proposalId', async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { proposal } = req.body;

    // 模拟一致性验证
    await new Promise(resolve => setTimeout(resolve, 800));

    const consistencyScore = Math.random() * 0.3 + 0.7; // 0.7-1.0

    res.json({
      success: true,
      data: {
        proposalId,
        consistencyScore: Math.round(consistencyScore * 100) / 100,
        issues: consistencyScore < 0.8 ? [
          '任务依赖关系需要优化',
          '资源需求与时间线不匹配'
        ] : [],
        recommendations: consistencyScore < 0.8 ? [
          '调整任务并行度',
          '优化资源分配'
        ] : ['方案一致性良好']
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('一致性验证失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

export default router;