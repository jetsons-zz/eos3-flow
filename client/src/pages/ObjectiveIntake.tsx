import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { useFlowStore } from '../stores/flowStore';

interface KPIForm {
  name: string;
  metric: string;
  target: number | '';
  unit: string;
}

const ObjectiveIntake: React.FC = () => {
  const navigate = useNavigate();
  const { createObjective, isLoading, error } = useFlowStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    deadline: '',
    constraints: [''],
    kpis: [{ name: '', metric: '', target: '', unit: '' }] as KPIForm[]
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 表单验证
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = '标题不能为空';
    }

    if (!formData.description.trim()) {
      errors.description = '描述不能为空';
    }

    // 验证KPI
    formData.kpis.forEach((kpi, index) => {
      if (kpi.name && (!kpi.metric || !kpi.target || !kpi.unit)) {
        errors[`kpi_${index}`] = 'KPI信息不完整';
      }
      if (kpi.target && isNaN(Number(kpi.target))) {
        errors[`kpi_target_${index}`] = '目标值必须是数字';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // 过滤掉空的约束条件和KPI
      const cleanConstraints = formData.constraints.filter(c => c.trim());
      const cleanKpis = formData.kpis
        .filter(kpi => kpi.name && kpi.metric && kpi.target && kpi.unit)
        .map(kpi => ({
          ...kpi,
          target: Number(kpi.target)
        }));

      await createObjective({
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined,
        constraints: cleanConstraints,
        kpis: cleanKpis
      });

      // 成功后跳转到仪表板
      navigate('/');
    } catch (error) {
      console.error('创建目标失败:', error);
    }
  };

  // 添加约束条件
  const addConstraint = () => {
    setFormData(prev => ({
      ...prev,
      constraints: [...prev.constraints, '']
    }));
  };

  // 删除约束条件
  const removeConstraint = (index: number) => {
    if (formData.constraints.length > 1) {
      setFormData(prev => ({
        ...prev,
        constraints: prev.constraints.filter((_, i) => i !== index)
      }));
    }
  };

  // 更新约束条件
  const updateConstraint = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      constraints: prev.constraints.map((c, i) => i === index ? value : c)
    }));
  };

  // 添加KPI
  const addKPI = () => {
    setFormData(prev => ({
      ...prev,
      kpis: [...prev.kpis, { name: '', metric: '', target: '', unit: '' }]
    }));
  };

  // 删除KPI
  const removeKPI = (index: number) => {
    if (formData.kpis.length > 1) {
      setFormData(prev => ({
        ...prev,
        kpis: prev.kpis.filter((_, i) => i !== index)
      }));
    }
  };

  // 更新KPI
  const updateKPI = (index: number, field: keyof KPIForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      kpis: prev.kpis.map((kpi, i) =>
        i === index ? { ...kpi, [field]: value } : kpi
      )
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">创建新目标</h1>
          <p className="text-gray-600 mt-1">定义目标并启动智能任务流程</p>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 基本信息 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">基本信息</h2>

          <div className="grid grid-cols-1 gap-6">
            {/* 标题 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                目标标题 *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="请输入目标标题，例如：削减10%市场预算"
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
              )}
            </div>

            {/* 描述 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                目标描述 *
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="详细描述目标的背景、现状和期望结果..."
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
              )}
            </div>

            {/* 优先级和截止日期 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  优先级
                </label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    priority: e.target.value as typeof formData.priority
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">低优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="high">高优先级</option>
                  <option value="critical">紧急优先级</option>
                </select>
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                  截止日期
                </label>
                <input
                  type="datetime-local"
                  id="deadline"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 约束条件 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">约束条件</h2>
            <button
              type="button"
              onClick={addConstraint}
              className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              添加约束
            </button>
          </div>

          <div className="space-y-4">
            {formData.constraints.map((constraint, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={constraint}
                  onChange={(e) => updateConstraint(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`约束条件 ${index + 1}，例如：预算不超过100万`}
                />
                {formData.constraints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeConstraint(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* KPI指标 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">KPI指标</h2>
            <button
              type="button"
              onClick={addKPI}
              className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              添加KPI
            </button>
          </div>

          <div className="space-y-6">
            {formData.kpis.map((kpi, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm font-medium text-gray-900">KPI {index + 1}</h3>
                  {formData.kpis.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeKPI(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      指标名称
                    </label>
                    <input
                      type="text"
                      value={kpi.name}
                      onChange={(e) => updateKPI(index, 'name', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      placeholder="例如：成本节约率"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      度量方式
                    </label>
                    <input
                      type="text"
                      value={kpi.metric}
                      onChange={(e) => updateKPI(index, 'metric', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      placeholder="例如：(原预算-新预算)/原预算"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      目标值
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={kpi.target}
                      onChange={(e) => updateKPI(index, 'target', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      单位
                    </label>
                    <input
                      type="text"
                      value={kpi.unit}
                      onChange={(e) => updateKPI(index, 'unit', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      placeholder="例如：%"
                    />
                  </div>
                </div>

                {validationErrors[`kpi_${index}`] && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors[`kpi_${index}`]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isLoading ? '创建中...' : '创建目标'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ObjectiveIntake;