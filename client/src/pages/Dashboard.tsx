import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Users,
  Zap,
  Activity
} from 'lucide-react';
import { useFlowStore } from '../stores/flowStore';
import { useWebSocket } from '../hooks/useWebSocket';

const Dashboard: React.FC = () => {
  const {
    objectives,
    flows,
    currentUser,
    isLoading,
    error,
    loadObjectives
  } = useFlowStore();

  const { isConnected } = useWebSocket();
  const [stats, setStats] = useState({
    totalObjectives: 0,
    activeFlows: 0,
    pendingApprovals: 0,
    completedTasks: 0
  });

  useEffect(() => {
    loadObjectives();
  }, [loadObjectives]);

  useEffect(() => {
    // 计算统计数据
    const flowsArray = Array.from(flows.values());
    setStats({
      totalObjectives: objectives.length,
      activeFlows: flowsArray.filter(f => ['executing', 'approved'].includes(f.status)).length,
      pendingApprovals: flowsArray.filter(f => f.status === 'awaiting_approval').length,
      completedTasks: flowsArray.filter(f => f.status === 'completed').length
    });
  }, [objectives, flows]);

  const recentFlows = Array.from(flows.values())
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'executing':
        return 'text-blue-600 bg-blue-100';
      case 'awaiting_approval':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'intake':
        return '录入中';
      case 'generating_proposals':
        return '生成方案中';
      case 'proposals_generated':
        return '方案已生成';
      case 'running_simulation':
        return '仿真运行中';
      case 'simulation_completed':
        return '仿真完成';
      case 'awaiting_approval':
        return '待审批';
      case 'approved':
        return '已批准';
      case 'rejected':
        return '已拒绝';
      case 'executing':
        return '执行中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadObjectives()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">仪表板</h1>
          <p className="text-gray-600 mt-1">欢迎回到 Flow 智能任务调度中枢</p>
        </div>
        <Link
          to="/intake"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          创建新目标
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">总目标数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalObjectives}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">活跃流程</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeFlows}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">待审批</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">已完成</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近的Flow */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">最近的流程</h3>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentFlows.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">暂无流程</p>
                <Link
                  to="/intake"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  创建第一个目标
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentFlows.map((flow) => (
                  <Link
                    key={flow.id}
                    to={`/flow/${flow.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {flow.objective.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {flow.objective.description}
                        </p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              flow.status
                            )}`}
                          >
                            {getStatusText(flow.status)}
                          </span>
                          <span
                            className={`text-xs font-medium ${getPriorityColor(
                              flow.objective.priority
                            )}`}
                          >
                            {flow.objective.priority}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 text-xs text-gray-500">
                        {new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' }).format(
                          Math.floor((flow.updatedAt.getTime() - Date.now()) / (1000 * 60 * 60)),
                          'hour'
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 快速操作和状态 */}
        <div className="space-y-6">
          {/* 快速操作 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">快速操作</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <Link
                to="/intake"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <Plus className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">创建目标</p>
                  <p className="text-sm text-gray-600">启动新的流程</p>
                </div>
              </Link>

              <Link
                to="/approval"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">审批中心</p>
                  <p className="text-sm text-gray-600">处理待审批事项</p>
                </div>
              </Link>

              <Link
                to="/execution"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <Activity className="h-6 w-6 text-orange-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">执行监控</p>
                  <p className="text-sm text-gray-600">查看执行状态</p>
                </div>
              </Link>

              <Link
                to="/settings"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <Users className="h-6 w-6 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">设置</p>
                  <p className="text-sm text-gray-600">配置系统选项</p>
                </div>
              </Link>
            </div>
          </div>

          {/* 系统状态 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">系统状态</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">WebSocket连接</span>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    isConnected
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isConnected ? '已连接' : '未连接'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">当前用户</span>
                <span className="text-sm font-medium text-gray-900">{currentUser}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">系统版本</span>
                <span className="text-sm font-medium text-gray-900">v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;