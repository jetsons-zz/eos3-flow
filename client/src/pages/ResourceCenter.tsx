import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Server,
  DollarSign,
  Wrench,
  Plus,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react';

interface ResourceStats {
  human: {
    total: number;
    available: number;
    utilization: number;
  };
  compute: {
    total: number;
    active: number;
    utilization: number;
  };
  budget: {
    totalAmount: number;
    spentAmount: number;
    availableAmount: number;
    currency: string;
  };
  tool: {
    total: number;
    licensed: number;
    expiringSoon: number;
  };
}

interface ResourceAlert {
  id: string;
  type: 'shortage' | 'overallocation' | 'expiring' | 'budget_limit';
  resource: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

const ResourceCenter: React.FC = () => {
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [alerts, setAlerts] = useState<ResourceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResourceData();
  }, []);

  const loadResourceData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats({
        human: {
          total: 45,
          available: 12,
          utilization: 73
        },
        compute: {
          total: 20,
          active: 15,
          utilization: 85
        },
        budget: {
          totalAmount: 5000000,
          spentAmount: 3200000,
          availableAmount: 1800000,
          currency: 'CNY'
        },
        tool: {
          total: 25,
          licensed: 22,
          expiringSoon: 3
        }
      });

      setAlerts([
        {
          id: '1',
          type: 'shortage',
          resource: '高级开发工程师',
          message: '高级开发工程师资源紧张，建议提前规划招聘',
          severity: 'high',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          type: 'expiring',
          resource: 'IntelliJ IDEA 许可证',
          message: '10个许可证将在30天内到期',
          severity: 'medium',
          createdAt: '2024-01-15T09:15:00Z'
        },
        {
          id: '3',
          type: 'budget_limit',
          resource: '市场部Q1预算',
          message: '市场部Q1预算使用率已达85%',
          severity: 'medium',
          createdAt: '2024-01-15T08:45:00Z'
        }
      ]);
    } catch (err) {
      setError('加载资源数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: ResourceAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">资源管理中心</h1>
          <p className="text-gray-600 mt-1">统一管理企业人力、计算、预算和工具资源</p>
        </div>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">资源管理中心</h1>
          <p className="text-gray-600 mt-1">统一管理企业人力、计算、预算和工具资源</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadResourceData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">资源管理中心</h1>
          <p className="text-gray-600 mt-1">统一管理企业人力、计算、预算和工具资源</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/resources/capacity-planning"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            容量规划
          </Link>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            添加资源
          </button>
        </div>
      </div>

      {/* 资源概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 人力资源 */}
        <Link to="/resources/people" className="group">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.human.total}</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">人力资源</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>可用人员:</span>
                <span className="font-medium">{stats.human.available}人</span>
              </div>
              <div className="flex justify-between">
                <span>利用率:</span>
                <span className={`font-medium ${stats.human.utilization > 80 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.human.utilization}%
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* 计算资源 */}
        <Link to="/resources/compute" className="group">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Server className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.compute.total}</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">计算资源</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>运行中:</span>
                <span className="font-medium">{stats.compute.active}台</span>
              </div>
              <div className="flex justify-between">
                <span>利用率:</span>
                <span className={`font-medium ${stats.compute.utilization > 80 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.compute.utilization}%
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* 预算资源 */}
        <Link to="/resources/budget" className="group">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(stats.budget.totalAmount, stats.budget.currency)}
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">预算资源</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>可用:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(stats.budget.availableAmount, stats.budget.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>使用率:</span>
                <span className={`font-medium ${(stats.budget.spentAmount / stats.budget.totalAmount) > 0.8 ? 'text-red-600' : 'text-green-600'}`}>
                  {((stats.budget.spentAmount / stats.budget.totalAmount) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* 工具资源 */}
        <Link to="/resources/tools" className="group">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Wrench className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.tool.total}</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">工具资源</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>已授权:</span>
                <span className="font-medium">{stats.tool.licensed}个</span>
              </div>
              <div className="flex justify-between">
                <span>即将到期:</span>
                <span className={`font-medium ${stats.tool.expiringSoon > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.tool.expiringSoon}个
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* 资源预警 */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">资源预警</h3>
              <span className="ml-auto text-sm text-gray-500">{alerts.length} 条预警</span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{alert.resource}</h4>
                      <p className="text-sm mt-1">{alert.message}</p>
                      <p className="text-xs mt-2 opacity-75">
                        {new Date(alert.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-opacity-75`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 快速操作 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">快速操作</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/resources/people/add"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors group"
            >
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">添加人员</h4>
                <p className="text-sm text-gray-600">录入新员工信息</p>
              </div>
            </Link>

            <Link
              to="/resources/allocations"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors group"
            >
              <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">资源分配</h4>
                <p className="text-sm text-gray-600">查看分配状态</p>
              </div>
            </Link>

            <Link
              to="/resources/usage-report"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors group"
            >
              <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">使用报告</h4>
                <p className="text-sm text-gray-600">分析资源使用情况</p>
              </div>
            </Link>

            <Link
              to="/resources/optimization"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors group"
            >
              <CheckCircle className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">优化建议</h4>
                <p className="text-sm text-gray-600">获取AI优化建议</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCenter;