import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// 模拟数据存储
let resources = new Map();
let allocations = new Map();
let usageHistory = new Map();
let capacityPlans = new Map();

// 初始化一些模拟数据
initMockData();

function initMockData() {
  // 人员资源
  const person1 = {
    id: '1',
    type: 'human',
    name: '张三',
    email: 'zhang.san@company.com',
    role: '高级前端工程师',
    quantity: 1,
    unit: '人',
    available: 1,
    allocated: 0,
    department: '技术部',
    location: '北京',
    status: 'active',
    workload: 75,
    hourlyRate: 200,
    team: '前端团队',
    skills: [
      { id: '1', name: 'React', level: 'expert', yearsOfExperience: 5, certifications: ['React Developer'] },
      { id: '2', name: 'TypeScript', level: 'advanced', yearsOfExperience: 3, certifications: [] }
    ],
    availability: [
      {
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
        availableHours: 160,
        note: '正常工作时间'
      }
    ],
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2024-01-10')
  };

  // 预算资源
  const budget1 = {
    id: '2',
    type: 'budget',
    name: '技术部Q1研发预算',
    currency: 'CNY',
    totalAmount: 2000000,
    spentAmount: 1200000,
    reservedAmount: 300000,
    availableAmount: 500000,
    fiscalYear: '2024',
    budgetCategory: '研发费用',
    department: '技术部',
    approvalRequired: true,
    approver: 'CTO',
    quantity: 1,
    unit: '项目',
    available: 1,
    allocated: 0,
    status: 'active',
    description: '用于Q1季度的产品研发和技术团队建设',
    location: '总部',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  };

  // 工具资源
  const tool1 = {
    id: '3',
    type: 'tool',
    name: 'IntelliJ IDEA Ultimate',
    vendor: 'JetBrains',
    version: '2024.1',
    licenseType: 'subscription',
    maxUsers: 50,
    currentUsers: 35,
    expirationDate: new Date('2024-12-31'),
    renewalDate: new Date('2024-11-30'),
    supportContact: 'support@jetbrains.com',
    documentationUrl: 'https://www.jetbrains.com/idea/documentation/',
    quantity: 50,
    unit: '许可证',
    available: 15,
    allocated: 35,
    department: '技术部',
    location: '总部',
    status: 'active',
    description: '专业Java开发集成环境，支持Spring Boot等框架',
    cost: 1500,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10')
  };

  resources.set(person1.id, person1);
  resources.set(budget1.id, budget1);
  resources.set(tool1.id, tool1);
}

// 通用资源API

/**
 * GET /api/resources
 * 获取所有资源或按类型过滤
 */
router.get('/', async (req, res) => {
  try {
    const { type, department, status } = req.query;
    let filteredResources = Array.from(resources.values());

    // 按类型过滤
    if (type) {
      filteredResources = filteredResources.filter(r => r.type === type);
    }

    // 按部门过滤
    if (department) {
      filteredResources = filteredResources.filter(r => r.department === department);
    }

    // 按状态过滤
    if (status) {
      filteredResources = filteredResources.filter(r => r.status === status);
    }

    res.json({
      success: true,
      data: {
        resources: filteredResources,
        total: filteredResources.length
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/resources/stats
 * 获取资源统计信息
 */
router.get('/stats', async (req, res) => {
  try {
    const allResources = Array.from(resources.values());

    const stats = {
      human: {
        total: allResources.filter(r => r.type === 'human').length,
        available: allResources.filter(r => r.type === 'human' && r.workload < 80).length,
        utilization: allResources.filter(r => r.type === 'human').reduce((sum, r) => sum + (r.workload || 0), 0) / Math.max(1, allResources.filter(r => r.type === 'human').length)
      },
      compute: {
        total: allResources.filter(r => r.type === 'compute').length,
        active: allResources.filter(r => r.type === 'compute' && r.status === 'active').length,
        utilization: 85 // 模拟数据
      },
      budget: {
        totalAmount: allResources.filter(r => r.type === 'budget').reduce((sum, r) => sum + (r.totalAmount || 0), 0),
        spentAmount: allResources.filter(r => r.type === 'budget').reduce((sum, r) => sum + (r.spentAmount || 0), 0),
        availableAmount: allResources.filter(r => r.type === 'budget').reduce((sum, r) => sum + (r.availableAmount || 0), 0),
        currency: 'CNY'
      },
      tool: {
        total: allResources.filter(r => r.type === 'tool').length,
        licensed: allResources.filter(r => r.type === 'tool' && r.status === 'active').length,
        expiringSoon: allResources.filter(r => {
          if (r.type !== 'tool' || !r.expirationDate) return false;
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          return new Date(r.expirationDate) <= thirtyDaysFromNow;
        }).length
      }
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/resources/:id
 * 获取特定资源详情
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resource = resources.get(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: resource,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * POST /api/resources
 * 创建新资源
 */
router.post('/', async (req, res) => {
  try {
    const resourceData = req.body;
    const id = uuidv4();

    const newResource = {
      ...resourceData,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 验证必需字段
    if (!newResource.name || !newResource.type) {
      return res.status(400).json({
        success: false,
        error: 'Name and type are required',
        timestamp: new Date()
      });
    }

    resources.set(id, newResource);

    res.status(201).json({
      success: true,
      data: newResource,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * PUT /api/resources/:id
 * 更新资源
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existingResource = resources.get(id);
    if (!existingResource) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found',
        timestamp: new Date()
      });
    }

    const updatedResource = {
      ...existingResource,
      ...updates,
      id, // 确保ID不被修改
      updatedAt: new Date()
    };

    resources.set(id, updatedResource);

    res.json({
      success: true,
      data: updatedResource,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * DELETE /api/resources/:id
 * 删除资源
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!resources.has(id)) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found',
        timestamp: new Date()
      });
    }

    resources.delete(id);

    res.json({
      success: true,
      message: 'Resource deleted successfully',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

// 资源分配API

/**
 * GET /api/resources/allocations
 * 获取资源分配记录
 */
router.get('/allocations', async (req, res) => {
  try {
    const { resourceId, flowId, status } = req.query;
    let filteredAllocations = Array.from(allocations.values());

    if (resourceId) {
      filteredAllocations = filteredAllocations.filter(a => a.resourceId === resourceId);
    }

    if (flowId) {
      filteredAllocations = filteredAllocations.filter(a => a.flowId === flowId);
    }

    if (status) {
      filteredAllocations = filteredAllocations.filter(a => a.status === status);
    }

    res.json({
      success: true,
      data: {
        allocations: filteredAllocations,
        total: filteredAllocations.length
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * POST /api/resources/allocations
 * 创建资源分配
 */
router.post('/allocations', async (req, res) => {
  try {
    const allocationData = req.body;
    const id = uuidv4();

    // 验证资源是否存在
    const resource = resources.get(allocationData.resourceId);
    if (!resource) {
      return res.status(400).json({
        success: false,
        error: 'Resource not found',
        timestamp: new Date()
      });
    }

    // 检查资源可用性
    if (resource.available < allocationData.quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient resource availability',
        timestamp: new Date()
      });
    }

    const newAllocation = {
      ...allocationData,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    allocations.set(id, newAllocation);

    // 更新资源的分配状态
    resource.allocated = (resource.allocated || 0) + allocationData.quantity;
    resource.available = resource.available - allocationData.quantity;
    resource.updatedAt = new Date();
    resources.set(resource.id, resource);

    res.status(201).json({
      success: true,
      data: newAllocation,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * DELETE /api/resources/allocations/:id
 * 取消资源分配
 */
router.delete('/allocations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const allocation = allocations.get(id);
    if (!allocation) {
      return res.status(404).json({
        success: false,
        error: 'Allocation not found',
        timestamp: new Date()
      });
    }

    const resource = resources.get(allocation.resourceId);
    if (resource) {
      // 释放资源
      resource.allocated = Math.max(0, (resource.allocated || 0) - allocation.quantity);
      resource.available = resource.available + allocation.quantity;
      resource.updatedAt = new Date();
      resources.set(resource.id, resource);
    }

    allocations.delete(id);

    res.json({
      success: true,
      message: 'Allocation cancelled successfully',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

// 资源搜索和推荐API

/**
 * POST /api/resources/search
 * 搜索可用资源
 */
router.post('/search', async (req, res) => {
  try {
    const criteria = req.body;
    const allResources = Array.from(resources.values());

    let filteredResources = allResources.filter(resource => {
      // 基础过滤条件
      if (criteria.type && resource.type !== criteria.type) return false;
      if (criteria.department && resource.department !== criteria.department) return false;
      if (criteria.location && resource.location !== criteria.location) return false;
      if (criteria.minQuantity && resource.available < criteria.minQuantity) return false;
      if (criteria.maxCost && resource.cost > criteria.maxCost) return false;

      // 技能匹配（针对人员资源）
      if (criteria.skills && resource.type === 'human' && resource.skills) {
        const hasRequiredSkills = criteria.skills.some(requiredSkill =>
          resource.skills.some(skill =>
            skill.name.toLowerCase().includes(requiredSkill.toLowerCase())
          )
        );
        if (!hasRequiredSkills) return false;
      }

      // 时间可用性检查
      if (criteria.startDate && criteria.endDate) {
        // 简化的可用性检查逻辑
        if (resource.type === 'human' && resource.availability) {
          const hasAvailability = resource.availability.some(period => {
            const startDate = new Date(criteria.startDate);
            const endDate = new Date(criteria.endDate);
            const periodStart = new Date(period.startDate);
            const periodEnd = new Date(period.endDate);

            return startDate >= periodStart && endDate <= periodEnd && period.availableHours > 0;
          });
          if (!hasAvailability) return false;
        }
      }

      return true;
    });

    res.json({
      success: true,
      data: {
        resources: filteredResources,
        total: filteredResources.length
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * POST /api/resources/recommend
 * 获取资源推荐
 */
router.post('/recommend', async (req, res) => {
  try {
    const taskRequirements = req.body.requirements || [];
    const allResources = Array.from(resources.values());

    const recommendations = taskRequirements.map(requirement => {
      const matchingResources = allResources.filter(resource => {
        if (resource.type !== requirement.type) return false;
        if (resource.available < requirement.quantity) return false;

        // 技能匹配评分
        let skillScore = 1;
        if (requirement.skills && resource.type === 'human' && resource.skills) {
          const matchedSkills = requirement.skills.filter(reqSkill =>
            resource.skills.some(skill =>
              skill.name.toLowerCase().includes(reqSkill.toLowerCase())
            )
          );
          skillScore = matchedSkills.length / requirement.skills.length;
        }

        return skillScore > 0;
      });

      const resourceRecommendations = matchingResources.map(resource => {
        // 计算匹配度
        let matchScore = 50; // 基础分数

        // 可用性加分
        if (resource.available >= requirement.quantity) {
          matchScore += 20;
        }

        // 技能匹配加分
        if (requirement.skills && resource.type === 'human' && resource.skills) {
          const matchedSkills = requirement.skills.filter(reqSkill =>
            resource.skills.some(skill =>
              skill.name.toLowerCase().includes(reqSkill.toLowerCase())
            )
          );
          matchScore += (matchedSkills.length / requirement.skills.length) * 30;
        }

        // 成本考虑
        if (resource.cost && requirement.priority === 'low') {
          matchScore += resource.cost < 1000 ? 10 : 0;
        }

        const estimatedCost = (resource.cost || 0) * requirement.quantity * (requirement.duration || 1);

        return {
          resource,
          matchScore: Math.min(100, matchScore),
          availability: {
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            availableQuantity: resource.available
          },
          estimatedCost,
          reasons: [
            `可用数量: ${resource.available}`,
            `匹配度: ${Math.round(matchScore)}%`,
            resource.type === 'human' ? `工作负载: ${resource.workload || 0}%` : null
          ].filter(Boolean)
        };
      }).sort((a, b) => b.matchScore - a.matchScore);

      return {
        requirement,
        recommendations: resourceRecommendations.slice(0, 5) // 返回前5个推荐
      };
    });

    res.json({
      success: true,
      data: recommendations,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

// 使用历史API

/**
 * POST /api/resources/usage
 * 记录资源使用
 */
router.post('/usage', async (req, res) => {
  try {
    const usageData = req.body;
    const id = uuidv4();

    const newUsage = {
      ...usageData,
      id,
      startTime: new Date(usageData.startTime || Date.now())
    };

    usageHistory.set(id, newUsage);

    res.status(201).json({
      success: true,
      data: newUsage,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * GET /api/resources/:id/usage
 * 获取资源使用历史
 */
router.get('/:id/usage', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    let filteredUsage = Array.from(usageHistory.values())
      .filter(usage => usage.resourceId === id);

    if (startDate) {
      filteredUsage = filteredUsage.filter(usage =>
        new Date(usage.startTime) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredUsage = filteredUsage.filter(usage =>
        new Date(usage.startTime) <= new Date(endDate)
      );
    }

    res.json({
      success: true,
      data: {
        usage: filteredUsage,
        total: filteredUsage.length
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

export default router;