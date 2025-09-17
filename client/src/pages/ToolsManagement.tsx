import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  ExternalLink,
  Shield,
  Zap
} from 'lucide-react';
import { ToolResource } from '../../../shared/types';

interface ToolFilters {
  vendor?: string;
  licenseType?: string;
  department?: string;
  status?: 'active' | 'expiring' | 'expired' | 'all';
}

interface ToolSummary {
  totalTools: number;
  activeTools: number;
  expiringSoon: number; // 30天内到期
  totalUsers: number;
  averageUtilization: number;
  vendorCount: number;
}

const ToolsManagement: React.FC = () => {
  const [tools, setTools] = useState<ToolResource[]>([]);
  const [filteredTools, setFilteredTools] = useState<ToolResource[]>([]);
  const [summary, setSummary] = useState<ToolSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ToolFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTools();
  }, []);

  useEffect(() => {
    filterTools();
    calculateSummary();
  }, [tools, searchTerm, filters]);

  const loadTools = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockTools: ToolResource[] = [
        {
          id: '1',
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
        },
        {
          id: '2',
          type: 'tool',
          name: 'Adobe Creative Suite',
          vendor: 'Adobe',
          version: '2024',
          licenseType: 'subscription',
          maxUsers: 20,
          currentUsers: 18,
          expirationDate: new Date('2024-06-30'),
          renewalDate: new Date('2024-05-30'),
          supportContact: 'support@adobe.com',
          documentationUrl: 'https://helpx.adobe.com/',
          quantity: 20,
          unit: '许可证',
          available: 2,
          allocated: 18,
          department: '设计部',
          location: '总部',
          status: 'active',
          description: '包含Photoshop、Illustrator、InDesign等设计工具',
          cost: 2400,
          createdAt: new Date('2023-06-30'),
          updatedAt: new Date('2024-01-05')
        },
        {
          id: '3',
          type: 'tool',
          name: 'Slack Enterprise',
          vendor: 'Slack Technologies',
          version: '4.35.0',
          licenseType: 'subscription',
          maxUsers: 200,
          currentUsers: 156,
          expirationDate: new Date('2024-08-15'),
          renewalDate: new Date('2024-07-15'),
          supportContact: 'support@slack.com',
          documentationUrl: 'https://slack.com/help',
          quantity: 200,
          unit: '用户席位',
          available: 44,
          allocated: 156,
          department: '全公司',
          location: '云端',
          status: 'active',
          description: '企业级团队协作和通信平台',
          cost: 960,
          createdAt: new Date('2023-08-15'),
          updatedAt: new Date('2024-01-12')
        },
        {
          id: '4',
          type: 'tool',
          name: 'Microsoft Office 365',
          vendor: 'Microsoft',
          version: '2024',
          licenseType: 'subscription',
          maxUsers: 100,
          currentUsers: 95,
          expirationDate: new Date('2024-03-31'),
          renewalDate: new Date('2024-02-28'),
          supportContact: 'support@microsoft.com',
          documentationUrl: 'https://support.microsoft.com/office',
          quantity: 100,
          unit: '用户席位',
          available: 5,
          allocated: 95,
          department: '全公司',
          location: '云端',
          status: 'active',
          description: '包含Word、Excel、PowerPoint、Teams等办公套件',
          cost: 1200,
          createdAt: new Date('2023-04-01'),
          updatedAt: new Date('2024-01-08')
        },
        {
          id: '5',
          type: 'tool',
          name: 'GitHub Enterprise',
          vendor: 'GitHub',
          version: '3.11',
          licenseType: 'subscription',
          maxUsers: 80,
          currentUsers: 65,
          expirationDate: new Date('2024-10-01'),
          renewalDate: new Date('2024-09-01'),
          supportContact: 'support@github.com',
          documentationUrl: 'https://docs.github.com/enterprise',
          quantity: 80,
          unit: '用户席位',
          available: 15,
          allocated: 65,
          department: '技术部',
          location: '云端',
          status: 'active',
          description: '企业级代码托管和协作开发平台',
          cost: 2100,
          createdAt: new Date('2023-10-01'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: '6',
          type: 'tool',
          name: 'Tableau Desktop',
          vendor: 'Tableau',
          version: '2024.1',
          licenseType: 'named_user',
          maxUsers: 10,
          currentUsers: 8,
          expirationDate: new Date('2024-02-15'),
          renewalDate: new Date('2024-01-15'),
          supportContact: 'support@tableau.com',
          documentationUrl: 'https://www.tableau.com/support',
          quantity: 10,
          unit: '命名用户',
          available: 2,
          allocated: 8,
          department: '数据分析部',
          location: '总部',
          status: 'active',
          description: '强大的数据可视化和商业智能分析工具',
          cost: 1800,
          createdAt: new Date('2023-02-15'),
          updatedAt: new Date('2024-01-03')
        }
      ];

      setTools(mockTools);
    } catch (err) {
      setError('加载工具数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTools = () => {
    let filtered = tools;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 厂商过滤
    if (filters.vendor) {
      filtered = filtered.filter(tool => tool.vendor === filters.vendor);
    }

    // 许可证类型过滤
    if (filters.licenseType) {
      filtered = filtered.filter(tool => tool.licenseType === filters.licenseType);
    }

    // 部门过滤
    if (filters.department) {
      filtered = filtered.filter(tool => tool.department === filters.department);
    }

    // 状态过滤
    if (filters.status && filters.status !== 'all') {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(tool => {
        if (filters.status === 'active') {
          return tool.status === 'active' && (!tool.expirationDate || tool.expirationDate > thirtyDaysFromNow);
        }
        if (filters.status === 'expiring') {
          return tool.expirationDate && tool.expirationDate <= thirtyDaysFromNow && tool.expirationDate > now;
        }
        if (filters.status === 'expired') {
          return tool.expirationDate && tool.expirationDate <= now;
        }
        return true;
      });
    }

    setFilteredTools(filtered);
  };

  const calculateSummary = () => {
    if (filteredTools.length === 0) {
      setSummary(null);
      return;
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const activeTools = filteredTools.filter(tool => tool.status === 'active').length;
    const expiringSoon = filteredTools.filter(tool =>
      tool.expirationDate && tool.expirationDate <= thirtyDaysFromNow && tool.expirationDate > now
    ).length;

    const totalUsers = filteredTools.reduce((sum, tool) => sum + tool.currentUsers, 0);
    const totalMaxUsers = filteredTools.reduce((sum, tool) => sum + (tool.maxUsers || 0), 0);
    const averageUtilization = totalMaxUsers > 0 ? (totalUsers / totalMaxUsers) * 100 : 0;

    const vendors = new Set(filteredTools.map(tool => tool.vendor));

    setSummary({
      totalTools: filteredTools.length,
      activeTools,
      expiringSoon,
      totalUsers,
      averageUtilization,
      vendorCount: vendors.size
    });
  };

  const getStatusColor = (tool: ToolResource) => {
    if (tool.status !== 'active') return 'text-gray-600 bg-gray-100';

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (tool.expirationDate) {
      if (tool.expirationDate <= now) return 'text-red-600 bg-red-100';
      if (tool.expirationDate <= thirtyDaysFromNow) return 'text-orange-600 bg-orange-100';
    }

    return 'text-green-600 bg-green-100';
  };

  const getStatusText = (tool: ToolResource) => {
    if (tool.status !== 'active') return '非活跃';

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (tool.expirationDate) {
      if (tool.expirationDate <= now) return '已过期';
      if (tool.expirationDate <= thirtyDaysFromNow) return '即将到期';
    }

    return '正常';
  };

  const getStatusIcon = (tool: ToolResource) => {
    if (tool.status !== 'active') return <Clock className="h-4 w-4" />;

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (tool.expirationDate) {
      if (tool.expirationDate <= now) return <AlertTriangle className="h-4 w-4" />;
      if (tool.expirationDate <= thirtyDaysFromNow) return <Clock className="h-4 w-4" />;
    }

    return <CheckCircle className="h-4 w-4" />;
  };

  const getLicenseTypeText = (type: ToolResource['licenseType']) => {
    switch (type) {
      case 'perpetual': return '永久许可';
      case 'subscription': return '订阅许可';
      case 'concurrent': return '并发许可';
      case 'named_user': return '命名用户';
      default: return type;
    }
  };

  const getUtilizationColor = (current: number, max: number) => {
    const rate = max > 0 ? current / max : 0;
    if (rate >= 0.9) return 'text-red-600';
    if (rate >= 0.8) return 'text-orange-600';
    if (rate >= 0.6) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleDeleteTool = async (toolId: string) => {
    if (!confirm('确定要删除这个工具吗？')) return;

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setTools(prev => prev.filter(t => t.id !== toolId));
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
            <h1 className="text-2xl font-bold text-gray-900">工具设备管理</h1>
            <p className="text-gray-600 mt-1">管理企业软件工具和设备资源</p>
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
          <h1 className="text-2xl font-bold text-gray-900">工具设备管理</h1>
          <p className="text-gray-600 mt-1">管理企业软件工具和设备资源</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/resources/tools/renewal-calendar"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-4 w-4 mr-2" />
            续费日历
          </Link>
          <Link
            to="/resources/tools/add"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            添加工具
          </Link>
        </div>
      </div>

      {/* 工具概览 */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">工具总数</h3>
              <Wrench className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalTools}</p>
            <p className="text-sm text-gray-600 mt-1">
              {summary.activeTools} 个活跃 · {summary.vendorCount} 个厂商
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">用户总数</h3>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalUsers}</p>
            <p className="text-sm text-gray-600 mt-1">
              使用率 {summary.averageUtilization.toFixed(1)}%
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">即将到期</h3>
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.expiringSoon}</p>
            <p className="text-sm text-orange-600 mt-1">
              30天内需要续费
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">月度支出</h3>
              <Zap className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ¥{filteredTools.reduce((sum, tool) => sum + (tool.cost || 0), 0).toLocaleString()}
            </p>
            <p className="text-sm text-green-600 mt-1">
              许可证费用
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
              placeholder="搜索工具名称、厂商或部门..."
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
                <label className="block text-sm font-medium text-gray-700 mb-1">厂商</label>
                <select
                  value={filters.vendor || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, vendor: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">全部厂商</option>
                  <option value="JetBrains">JetBrains</option>
                  <option value="Adobe">Adobe</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Slack Technologies">Slack Technologies</option>
                  <option value="GitHub">GitHub</option>
                  <option value="Tableau">Tableau</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">许可证类型</label>
                <select
                  value={filters.licenseType || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, licenseType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">全部类型</option>
                  <option value="subscription">订阅许可</option>
                  <option value="perpetual">永久许可</option>
                  <option value="concurrent">并发许可</option>
                  <option value="named_user">命名用户</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">部门</label>
                <select
                  value={filters.department || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">全部部门</option>
                  <option value="技术部">技术部</option>
                  <option value="设计部">设计部</option>
                  <option value="数据分析部">数据分析部</option>
                  <option value="全公司">全公司</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  value={filters.status || 'all'}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">全部状态</option>
                  <option value="active">正常</option>
                  <option value="expiring">即将到期</option>
                  <option value="expired">已过期</option>
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
                显示 {filteredTools.length} / {tools.length} 工具
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 工具列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">工具列表</h3>
        </div>
        <div className="p-6">
          {filteredTools.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {tools.length === 0 ? '暂无工具数据' : '没有找到匹配的工具'}
              </p>
              {tools.length === 0 && (
                <Link
                  to="/resources/tools/add"
                  className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加第一个工具
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTools.map((tool) => {
                const utilizationRate = tool.maxUsers ? (tool.currentUsers / tool.maxUsers) * 100 : 0;
                return (
                  <div
                    key={tool.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Wrench className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{tool.name}</h4>
                            <p className="text-gray-600">{tool.vendor} · {tool.version}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tool)}`}
                            >
                              {getStatusIcon(tool)}
                              <span className="ml-1">{getStatusText(tool)}</span>
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getLicenseTypeText(tool.licenseType)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">许可证数量</p>
                            <p className="text-lg font-bold text-gray-900">
                              {tool.quantity} {tool.unit}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">当前用户</p>
                            <p className={`text-lg font-bold ${getUtilizationColor(tool.currentUsers, tool.maxUsers || 0)}`}>
                              {tool.currentUsers} / {tool.maxUsers || '∞'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">使用率</p>
                            <p className={`text-lg font-bold ${getUtilizationColor(tool.currentUsers, tool.maxUsers || 0)}`}>
                              {utilizationRate.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">月度费用</p>
                            <p className="text-lg font-bold text-gray-900">
                              ¥{(tool.cost || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* 使用率进度条 */}
                        {tool.maxUsers && (
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">许可证使用进度</span>
                              <span className="text-sm font-medium text-gray-900">
                                {tool.currentUsers} / {tool.maxUsers}
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
                        )}

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>部门: {tool.department}</span>
                          <span>位置: {tool.location}</span>
                          {tool.expirationDate && (
                            <span>到期时间: {tool.expirationDate.toLocaleDateString('zh-CN')}</span>
                          )}
                        </div>

                        {tool.description && (
                          <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                        )}

                        <div className="flex items-center space-x-4">
                          {tool.documentationUrl && (
                            <a
                              href={tool.documentationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              查看文档
                            </a>
                          )}
                          {tool.supportContact && (
                            <span className="text-sm text-gray-600">
                              技术支持: {tool.supportContact}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="ml-4 flex items-center space-x-2">
                        <Link
                          to={`/resources/tools/${tool.id}/users`}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="用户管理"
                        >
                          <Users className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/resources/tools/${tool.id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="编辑"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteTool(tool.id)}
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

export default ToolsManagement;