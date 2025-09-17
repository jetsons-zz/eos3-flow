import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// 内存存储（生产环境应使用数据库）
const objectives = new Map();

/**
 * POST /api/objectives
 * 创建新的目标任务
 */
router.post('/', async (req, res, next) => {
  try {
    const { title, description, constraints = [], kpis = [], priority = 'medium', deadline, userId } = req.body;

    // 输入验证
    if (!title || !description || !userId) {
      return res.status(400).json({
        success: false,
        error: '标题、描述和用户ID为必填项',
        timestamp: new Date()
      });
    }

    // 创建目标对象
    const objective = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim(),
      constraints: constraints.map(c => c.trim()),
      kpis: kpis.map(kpi => ({
        id: uuidv4(),
        ...kpi
      })),
      priority,
      deadline: deadline ? new Date(deadline) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: userId.trim()
    };

    // 保存目标
    objectives.set(objective.id, objective);

    // 启动Flow流程（使用新的Flow API）
    let flowResult = null;
    try {
      const flowResponse = await fetch('http://localhost:8085/api/flow/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective })
      });

      if (flowResponse.ok) {
        const flowData = await flowResponse.json();
        flowResult = flowData.data;
      }
    } catch (error) {
      console.log('Flow启动失败，继续返回目标创建结果:', error.message);
    }

    res.status(201).json({
      success: true,
      data: {
        objective,
        flowId: flowResult?.id || `flow-${objective.id}`
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/objectives
 * 获取目标列表
 */
router.get('/', async (req, res, next) => {
  try {
    const { userId, status, priority, page = 1, limit = 20 } = req.query;

    let filteredObjectives = Array.from(objectives.values());

    // 按用户过滤
    if (userId) {
      filteredObjectives = filteredObjectives.filter(obj => obj.userId === userId);
    }

    // 按优先级过滤
    if (priority) {
      filteredObjectives = filteredObjectives.filter(obj => obj.priority === priority);
    }

    // 排序（最新创建的在前）
    filteredObjectives.sort((a, b) => b.createdAt - a.createdAt);

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedObjectives = filteredObjectives.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        objectives: paginatedObjectives,
        pagination: {
          total: filteredObjectives.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(filteredObjectives.length / limit)
        }
      },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/objectives/:id
 * 获取特定目标详情
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const objective = objectives.get(id);

    if (!objective) {
      return res.status(404).json({
        success: false,
        error: '目标不存在',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: objective,
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/objectives/:id
 * 更新目标
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const objective = objectives.get(id);

    if (!objective) {
      return res.status(404).json({
        success: false,
        error: '目标不存在',
        timestamp: new Date()
      });
    }

    // 更新字段
    const updatableFields = ['title', 'description', 'constraints', 'kpis', 'priority', 'deadline'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        objective[field] = req.body[field];
      }
    });

    objective.updatedAt = new Date();
    objectives.set(id, objective);

    res.json({
      success: true,
      data: objective,
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/objectives/:id
 * 删除目标
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const objective = objectives.get(id);

    if (!objective) {
      return res.status(404).json({
        success: false,
        error: '目标不存在',
        timestamp: new Date()
      });
    }

    objectives.delete(id);

    res.json({
      success: true,
      data: { message: '目标已删除' },
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/objectives/:id/kpis
 * 获取目标的KPI列表
 */
router.get('/:id/kpis', async (req, res, next) => {
  try {
    const { id } = req.params;
    const objective = objectives.get(id);

    if (!objective) {
      return res.status(404).json({
        success: false,
        error: '目标不存在',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: objective.kpis,
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/objectives/:id/kpis
 * 为目标添加新的KPI
 */
router.post('/:id/kpis', async (req, res, next) => {
  try {
    const { id } = req.params;
    const objective = objectives.get(id);

    if (!objective) {
      return res.status(404).json({
        success: false,
        error: '目标不存在',
        timestamp: new Date()
      });
    }

    const { name, metric, target, unit } = req.body;

    if (!name || !metric || target === undefined || !unit) {
      return res.status(400).json({
        success: false,
        error: 'KPI名称、指标、目标值和单位为必填项',
        timestamp: new Date()
      });
    }

    const newKpi = {
      id: uuidv4(),
      name: name.trim(),
      metric: metric.trim(),
      target: parseFloat(target),
      unit: unit.trim(),
      current: null
    };

    objective.kpis.push(newKpi);
    objective.updatedAt = new Date();
    objectives.set(id, objective);

    res.status(201).json({
      success: true,
      data: newKpi,
      timestamp: new Date()
    });

  } catch (error) {
    next(error);
  }
});

export default router;