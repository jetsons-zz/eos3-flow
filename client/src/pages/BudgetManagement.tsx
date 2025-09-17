import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart
} from 'lucide-react';
import { BudgetResource } from '../../../shared/types';

interface BudgetFilters {
  department?: string;
  category?: string;
  fiscalYear?: string;
  status?: 'normal' | 'warning' | 'danger';
}

interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalAvailable: number;
  utilizationRate: number;
  departmentCount: number;
  categoryCount: number;
}

const BudgetManagement: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetResource[]>([]);
  const [filteredBudgets, setFilteredBudgets] = useState<BudgetResource[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<BudgetFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadBudgets();
  }, []);

  useEffect(() => {
    filterBudgets();
    calculateSummary();
  }, [budgets, searchTerm, filters]);

  const loadBudgets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockBudgets: BudgetResource[] = [
        {
          id: '1',
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
        },
        {
          id: '2',
          type: 'budget',
          name: '市场部Q1推广预算',
          currency: 'CNY',
          totalAmount: 1500000,
          spentAmount: 1350000,
          reservedAmount: 100000,
          availableAmount: 50000,
          fiscalYear: '2024',
          budgetCategory: '市场推广',
          department: '市场部',
          approvalRequired: true,
          approver: 'CMO',
          quantity: 1,
          unit: '项目',
          available: 1,
          allocated: 0,
          status: 'active',
          description: '用于品牌推广、线上广告投放和活动营销',
          location: '总部',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-14')
        },
        {
          id: '3',
          type: 'budget',
          name: '人力资源招聘预算',
          currency: 'CNY',
          totalAmount: 800000,
          spentAmount: 320000,
          reservedAmount: 200000,
          availableAmount: 280000,
          fiscalYear: '2024',
          budgetCategory: '人力资源',
          department: 'HR',
          approvalRequired: false,
          quantity: 1,
          unit: '项目',
          available: 1,
          allocated: 0,
          status: 'active',
          description: '用于人员招聘、培训和团队建设活动',
          location: '总部',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-10')
        },
        {
          id: '4',
          type: 'budget',
          name: '运营成本预算',
          currency: 'CNY',
          totalAmount: 1200000,
          spentAmount: 450000,
          reservedAmount: 150000,
          availableAmount: 600000,
          fiscalYear: '2024',
          budgetCategory: '运营成本',
          department: '运营部',
          approvalRequired: false,
          quantity: 1,
          unit: '项目',
          available: 1,
          allocated: 0,
          status: 'active',
          description: '用于日常运营、办公用品和基础设施维护',
          location: '总部',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-12')
        }
      ];

      setBudgets(mockBudgets);
    } catch (err) {
      setError('加载预算数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const filterBudgets = () => {
    let filtered = budgets;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(budget =>
        budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.budgetCategory.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 部门过滤
    if (filters.department) {
      filtered = filtered.filter(budget => budget.department === filters.department);
    }

    // 类别过滤
    if (filters.category) {
      filtered = filtered.filter(budget => budget.budgetCategory === filters.category);
    }

    // 财年过滤
    if (filters.fiscalYear) {
      filtered = filtered.filter(budget => budget.fiscalYear === filters.fiscalYear);
    }

    // 状态过滤
    if (filters.status) {
      filtered = filtered.filter(budget => {
        const utilizationRate = budget.spentAmount / budget.totalAmount;
        if (filters.status === 'danger') return utilizationRate >= 0.9;
        if (filters.status === 'warning') return utilizationRate >= 0.8 && utilizationRate < 0.9;
        if (filters.status === 'normal') return utilizationRate < 0.8;
        return true;
      });
    }

    setFilteredBudgets(filtered);
  };

  const calculateSummary = () => {
    if (filteredBudgets.length === 0) {
      setSummary(null);
      return;
    }

    const totalBudget = filteredBudgets.reduce((sum, budget) => sum + budget.totalAmount, 0);
    const totalSpent = filteredBudgets.reduce((sum, budget) => sum + budget.spentAmount, 0);
    const totalAvailable = filteredBudgets.reduce((sum, budget) => sum + budget.availableAmount, 0);
    const utilizationRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const departments = new Set(filteredBudgets.map(budget => budget.department).filter(Boolean));
    const categories = new Set(filteredBudgets.map(budget => budget.budgetCategory));

    setSummary({
      totalBudget,
      totalSpent,
      totalAvailable,
      utilizationRate,
      departmentCount: departments.size,
      categoryCount: categories.size
    });
  };

  const getUtilizationColor = (spentAmount: number, totalAmount: number) => {
    const rate = spentAmount / totalAmount;
    if (rate >= 0.9) return 'text-red-600 bg-red-100';
    if (rate >= 0.8) return 'text-orange-600 bg-orange-100';
    if (rate >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getUtilizationIcon = (spentAmount: number, totalAmount: number) => {
    const rate = spentAmount / totalAmount;
    if (rate >= 0.9) return <AlertTriangle className="h-4 w-4" />;
    if (rate >= 0.8) return <Clock className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm('确定要删除这个预算项目吗？')) return;

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setBudgets(prev => prev.filter(b => b.id !== budgetId));
    } catch (err) {
      setError('删除失败');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/resources"
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">预算管理</h1>
            <p className="text-gray-600 mt-1">管理企业预算分配和使用情况</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center space-x-4">
        <Link
          to="/resources"
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">预算管理</h1>
          <p className="text-gray-600 mt-1">管理企业预算分配和使用情况</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/resources/budget/analytics"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            预算分析
          </Link>
          <Link
            to="/resources/budget/add"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            添加预算
          </Link>
        </div>
      </div>

      {/* 预算概览 */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">总预算</h3>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.totalBudget, 'CNY')}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {summary.departmentCount} 个部门 · {summary.categoryCount} 个类别
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">已使用</h3>
              <TrendingUp className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.totalSpent, 'CNY')}
            </p>
            <p className="text-sm text-red-600 mt-1">
              使用率 {summary.utilizationRate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">可用余额</h3>
              <TrendingDown className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.totalAvailable, 'CNY')}
            </p>
            <p className="text-sm text-green-600 mt-1">
              剩余 {((summary.totalAvailable / summary.totalBudget) * 100).toFixed(1)}%
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">预警状态</h3>
              {summary.utilizationRate >= 80 ? (
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {filteredBudgets.filter(b => (b.spentAmount / b.totalAmount) >= 0.8).length}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              需要关注的预算项
            </p>
          </div>
        </div>
      )}

      {/* 搜索和过滤 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索预算名称、部门或类别..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 过滤按钮 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            过滤
          </button>
        </div>

        {/* 过滤器 */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">部门</label>
                <select
                  value={filters.department || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">全部部门</option>
                  <option value="技术部">技术部</option>
                  <option value="市场部">市场部</option>
                  <option value="HR">HR</option>
                  <option value="运营部">运营部</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">预算类别</label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">全部类别</option>
                  <option value="研发费用">研发费用</option>
                  <option value="市场推广">市场推广</option>
                  <option value="人力资源">人力资源</option>
                  <option value="运营成本">运营成本</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">财年</label>
                <select
                  value={filters.fiscalYear || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, fiscalYear: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">全部财年</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">使用状态</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">全部状态</option>
                  <option value="normal">正常 (&lt;80%)</option>
                  <option value="warning">预警 (80-90%)</option>
                  <option value="danger">危险 (&gt;90%)</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-3">
              <button
                onClick={() => setFilters({})}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                清除过滤
              </button>
              <span className="text-sm text-gray-500">
                显示 {filteredBudgets.length} / {budgets.length} 预算项
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 预算列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">预算列表</h3>
        </div>
        <div className="p-6">
          {filteredBudgets.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {budgets.length === 0 ? '暂无预算数据' : '没有找到匹配的预算项'}
              </p>
              {budgets.length === 0 && (
                <Link
                  to="/resources/budget/add"
                  className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加第一个预算
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBudgets.map((budget) => {
                const utilizationRate = (budget.spentAmount / budget.totalAmount) * 100;
                return (
                  <div
                    key={budget.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{budget.name}</h4>
                            <p className="text-gray-600">{budget.budgetCategory} · {budget.department}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUtilizationColor(budget.spentAmount, budget.totalAmount)}`}
                            >
                              {getUtilizationIcon(budget.spentAmount, budget.totalAmount)}
                              <span className="ml-1">{utilizationRate.toFixed(1)}%</span>
                            </span>
                            {budget.approvalRequired && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                需审批
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">总预算</p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(budget.totalAmount, budget.currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">已使用</p>
                            <p className="text-lg font-bold text-red-600">
                              {formatCurrency(budget.spentAmount, budget.currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">预留</p>
                            <p className="text-lg font-bold text-orange-600">
                              {formatCurrency(budget.reservedAmount, budget.currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">可用</p>
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency(budget.availableAmount, budget.currency)}
                            </p>
                          </div>
                        </div>

                        {/* 进度条 */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">预算使用进度</span>
                            <span className="text-sm font-medium text-gray-900">
                              {utilizationRate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                utilizationRate >= 90 ? 'bg-red-500' :
                                utilizationRate >= 80 ? 'bg-orange-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>财年: {budget.fiscalYear}</span>
                          {budget.approver && <span>审批人: {budget.approver}</span>}
                          <span>更新时间: {budget.updatedAt.toLocaleDateString('zh-CN')}</span>
                        </div>

                        {budget.description && (
                          <p className="mt-2 text-sm text-gray-600">{budget.description}</p>
                        )}
                      </div>

                      <div className="ml-4 flex items-center space-x-2">
                        <Link
                          to={`/resources/budget/${budget.id}/details`}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="查看详情"
                        >
                          <PieChart className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/resources/budget/${budget.id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="编辑"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default BudgetManagement;