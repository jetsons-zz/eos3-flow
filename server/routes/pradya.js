import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// 模拟Pradya推理引擎
class PradyaEngine {
  constructor() {
    this.templates = {
      '研发项目': {
        approach: '敏捷开发方法',
        commonSteps: [
          { name: '需求分析', type: 'research', duration: 16, skills: ['产品分析', '业务理解'] },
          { name: '技术方案设计', type: 'development', duration: 24, skills: ['系统架构', '技术选型'] },
          { name: '原型开发', type: 'development', duration: 40, skills: ['前端开发', '后端开发'] },
          { name: '功能开发', type: 'development', duration: 80, skills: ['编程', '数据库'] },
          { name: '测试验证', type: 'testing', duration: 32, skills: ['测试', '质量保证'] },
          { name: '部署上线', type: 'deployment', duration: 16, skills: ['运维', '部署'] }
        ],
        risks: [
          { category: 'technical', description: '技术难度超预期', probability: 0.3, impact: 0.7 },
          { category: 'resource', description: '关键人员不可用', probability: 0.2, impact: 0.8 },
          { category: 'timeline', description: '需求变更导致延期', probability: 0.4, impact: 0.6 }
        ]
      },
      '市场活动': {
        approach: '数据驱动营销',
        commonSteps: [
          { name: '市场调研', type: 'research', duration: 24, skills: ['市场分析', '数据分析'] },
          { name: '策略制定', type: 'development', duration: 16, skills: ['营销策划', '创意设计'] },
          { name: '内容创作', type: 'development', duration: 32, skills: ['内容创作', '视觉设计'] },
          { name: '渠道投放', type: 'deployment', duration: 8, skills: ['数字营销', '媒体投放'] },
          { name: '效果监控', type: 'testing', duration: 16, skills: ['数据分析', 'ROI分析'] },
          { name: '优化调整', type: 'review', duration: 12, skills: ['优化分析', '策略调整'] }
        ],
        risks: [
          { category: 'budget', description: '营销预算超支', probability: 0.3, impact: 0.6 },
          { category: 'external', description: '市场环境变化', probability: 0.4, impact: 0.5 },
          { category: 'timeline', description: '竞争对手抢先发布', probability: 0.2, impact: 0.8 }
        ]
      },
      '预算优化': {
        approach: '数据分析驱动',
        commonSteps: [
          { name: '成本分析', type: 'research', duration: 20, skills: ['财务分析', '数据挖掘'] },
          { name: '削减方案设计', type: 'development', duration: 16, skills: ['财务规划', '风险评估'] },
          { name: '影响评估', type: 'testing', duration: 12, skills: ['业务分析', '风险建模'] },
          { name: '方案实施', type: 'deployment', duration: 24, skills: ['项目管理', '变更管理'] },
          { name: '效果跟踪', type: 'review', duration: 16, skills: ['财务监控', '绩效分析'] }
        ],
        risks: [
          { category: 'budget', description: '削减过度影响业务', probability: 0.4, impact: 0.9 },
          { category: 'resource', description: '员工士气下降', probability: 0.5, impact: 0.6 },
          { category: 'timeline', description: '实施阻力大', probability: 0.3, impact: 0.7 }
        ]
      }
    };
  }

  // 智能推理生成候选方案
  async generateProposals(objective) {
    try {
      console.log('Pradya引擎开始分析目标:', objective.title);

      // 模拟分析过程
      await this.simulateAnalysis();

      const category = this.categorizeObjective(objective);
      const template = this.templates[category] || this.templates['研发项目'];

      // 生成3个候选方案
      const proposals = [
        this.generateAggressiveProposal(objective, template),
        this.generateBalancedProposal(objective, template),
        this.generateConservativeProposal(objective, template)
      ];

      console.log(`Pradya引擎完成分析，生成${proposals.length}个候选方案`);
      return proposals;

    } catch (error) {
      console.error('Pradya推理失败:', error);
      throw new Error('推理引擎暂时不可用');
    }
  }

  // 模拟分析过程
  async simulateAnalysis() {
    return new Promise(resolve => {
      setTimeout(resolve, 1000 + Math.random() * 2000); // 1-3秒分析时间
    });
  }

  // 目标分类
  categorizeObjective(objective) {
    const title = objective.title.toLowerCase();
    const description = objective.description.toLowerCase();
    const text = title + ' ' + description;

    if (text.includes('开发') || text.includes('研发') || text.includes('产品') || text.includes('功能')) {
      return '研发项目';
    } else if (text.includes('营销') || text.includes('推广') || text.includes('市场') || text.includes('获客')) {
      return '市场活动';
    } else if (text.includes('预算') || text.includes('成本') || text.includes('削减') || text.includes('财务')) {
      return '预算优化';
    }
    return '研发项目'; // 默认
  }

  // 生成激进方案（快速、高风险）
  generateAggressiveProposal(objective, template) {
    const baseDuration = template.commonSteps.reduce((sum, step) => sum + step.duration, 0);

    return {
      id: uuidv4(),
      objectiveId: objective.id,
      title: '快速执行方案',
      description: '采用并行开发和快速迭代，最短时间内达成目标',
      approach: template.approach + ' + 并行执行',
      estimatedDuration: Math.ceil(baseDuration * 0.7), // 减少30%时间
      estimatedCost: this.estimateCost(objective, baseDuration * 0.8), // 稍微降低成本
      confidence: 0.65, // 较低信心度
      risks: this.enhanceRisks(template.risks, 1.3), // 风险提高30%
      dependencies: this.extractDependencies(objective),
      resourceRequirements: this.generateResourceRequirements(template.commonSteps, 'aggressive'),
      taskBreakdown: this.generateTaskBreakdown(template.commonSteps, 'aggressive'),
      createdAt: new Date(),
      status: 'ready'
    };
  }

  // 生成平衡方案（中等风险，合理时间）
  generateBalancedProposal(objective, template) {
    const baseDuration = template.commonSteps.reduce((sum, step) => sum + step.duration, 0);

    return {
      id: uuidv4(),
      objectiveId: objective.id,
      title: '平衡执行方案',
      description: '在时间、质量和风险之间取得平衡，稳步推进目标实现',
      approach: template.approach + ' + 质量控制',
      estimatedDuration: baseDuration,
      estimatedCost: this.estimateCost(objective, baseDuration),
      confidence: 0.8, // 中等信心度
      risks: template.risks,
      dependencies: this.extractDependencies(objective),
      resourceRequirements: this.generateResourceRequirements(template.commonSteps, 'balanced'),
      taskBreakdown: this.generateTaskBreakdown(template.commonSteps, 'balanced'),
      createdAt: new Date(),
      status: 'ready'
    };
  }

  // 生成保守方案（低风险，充裕时间）
  generateConservativeProposal(objective, template) {
    const baseDuration = template.commonSteps.reduce((sum, step) => sum + step.duration, 0);

    return {
      id: uuidv4(),
      objectiveId: objective.id,
      title: '稳健执行方案',
      description: '充分的缓冲时间和资源，确保目标稳妥达成',
      approach: template.approach + ' + 充分验证',
      estimatedDuration: Math.ceil(baseDuration * 1.3), // 增加30%时间
      estimatedCost: this.estimateCost(objective, baseDuration * 1.2), // 增加20%成本
      confidence: 0.9, // 高信心度
      risks: this.enhanceRisks(template.risks, 0.7), // 风险降低30%
      dependencies: this.extractDependencies(objective),
      resourceRequirements: this.generateResourceRequirements(template.commonSteps, 'conservative'),
      taskBreakdown: this.generateTaskBreakdown(template.commonSteps, 'conservative'),
      createdAt: new Date(),
      status: 'ready'
    };
  }

  // 估算成本
  estimateCost(objective, duration) {
    const baseCostPerHour = 200; // 基础小时成本
    const complexityMultiplier = objective.priority === 'critical' ? 1.5 :
                                 objective.priority === 'high' ? 1.2 : 1.0;
    return Math.ceil(duration * baseCostPerHour * complexityMultiplier);
  }

  // 增强风险评估
  enhanceRisks(baseRisks, multiplier) {
    return baseRisks.map(risk => ({
      id: uuidv4(),
      category: risk.category,
      description: risk.description,
      probability: Math.min(risk.probability * multiplier, 1),
      impact: risk.impact,
      mitigation: this.generateMitigation(risk)
    }));
  }

  // 生成风险缓解措施
  generateMitigation(risk) {
    const mitigations = {
      'technical': '增加技术预研时间，引入专家咨询',
      'resource': '准备备选人员，建立资源池',
      'timeline': '设立里程碑检查点，及时调整计划',
      'budget': '设置预算预警，定期成本审查',
      'external': '建立应急预案，增强灵活性'
    };
    return mitigations[risk.category] || '定期风险评估和监控';
  }

  // 提取依赖关系
  extractDependencies(objective) {
    const dependencies = [];
    if (objective.constraints) {
      objective.constraints.forEach(constraint => {
        if (constraint.includes('依赖') || constraint.includes('前置')) {
          dependencies.push(constraint);
        }
      });
    }
    return dependencies;
  }

  // 生成资源需求
  generateResourceRequirements(steps, approach) {
    const requirements = [];

    // 人员需求
    const uniqueSkills = [...new Set(steps.flatMap(step => step.skills))];
    uniqueSkills.forEach(skill => {
      requirements.push({
        type: 'human',
        skills: [skill],
        quantity: approach === 'aggressive' ? 2 : 1,
        duration: approach === 'conservative' ? 240 : approach === 'balanced' ? 200 : 160,
        urgency: approach === 'aggressive' ? 'high' : 'medium'
      });
    });

    // 预算需求
    requirements.push({
      type: 'budget',
      quantity: 1,
      duration: approach === 'conservative' ? 90 : approach === 'balanced' ? 60 : 45,
      urgency: approach === 'aggressive' ? 'critical' : 'medium'
    });

    return requirements;
  }

  // 生成任务分解
  generateTaskBreakdown(steps, approach) {
    return steps.map((step, index) => {
      const duration = approach === 'aggressive' ? step.duration * 0.7 :
                      approach === 'conservative' ? step.duration * 1.3 : step.duration;

      return {
        id: uuidv4(),
        name: step.name,
        description: `${step.name}阶段的具体工作内容`,
        type: step.type,
        dependencies: index > 0 ? [steps[index-1].name] : [],
        estimatedDuration: Math.ceil(duration),
        requiredSkills: step.skills,
        status: 'pending'
      };
    });
  }
}

// 创建Pradya引擎实例
const pradyaEngine = new PradyaEngine();

// 目标推理生成候选方案
router.post('/generate-proposals', async (req, res) => {
  try {
    const { objective } = req.body;

    if (!objective) {
      return res.status(400).json({
        success: false,
        error: '缺少目标信息',
        timestamp: new Date()
      });
    }

    console.log('收到推理请求:', objective.title);

    // 调用Pradya引擎生成方案
    const proposals = await pradyaEngine.generateProposals(objective);

    res.json({
      success: true,
      data: proposals,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Pradya推理失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

// 方案细化
router.post('/refine-proposal/:proposalId', async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { modifications } = req.body;

    // 模拟方案细化
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.json({
      success: true,
      data: {
        proposalId,
        status: 'refined',
        appliedModifications: modifications.length,
        message: '方案已根据修改建议进行优化'
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('方案细化失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

// 获取推理状态
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      engine: 'Pradya v1.0',
      status: 'operational',
      templates: Object.keys(pradyaEngine.templates),
      capabilities: [
        '目标分析',
        '方案生成',
        '风险评估',
        '资源需求分析',
        '任务分解'
      ]
    },
    timestamp: new Date()
  });
});

export default router;