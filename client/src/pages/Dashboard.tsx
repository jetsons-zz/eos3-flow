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
        return 'text-tech-accent bg-tech-accent/20 border border-tech-accent/30';
      case 'executing':
        return 'text-tech-secondary bg-tech-secondary/20 border border-tech-secondary/30';
      case 'awaiting_approval':
        return 'text-yellow-400 bg-yellow-400/20 border border-yellow-400/30';
      case 'failed':
        return 'text-red-400 bg-red-400/20 border border-red-400/30';
      default:
        return 'text-gray-400 bg-gray-400/20 border border-gray-400/30';
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
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-tech-accent';
      default:
        return 'text-gray-400';
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-medium text-white mb-2">加载失败</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => loadObjectives()}
            className="px-6 py-3 button-gradient-bg text-white rounded-xl hover:shadow-glow transition-all duration-300 transform hover:scale-105"
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
          <h1 className="text-3xl font-bold text-white animate-slide-in">仪表板</h1>
          <p className="text-gray-300 mt-2">欢迎回到 Flow 智能任务调度中枢</p>
        </div>
        <Link
          to="/intake"
          className="inline-flex items-center px-6 py-3 button-gradient-bg text-white rounded-xl hover:shadow-glow transition-all duration-300 transform hover:scale-105 shadow-tech"
        >
          <Plus className="h-5 w-5 mr-2" />
          创建新目标
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-gradient-bg rounded-xl shadow-lg border border-gray-600 p-6 hover:shadow-2xl transition-all duration-300 animate-slide-in">
          <div className="flex items-center">
            <BarChart3 className="h-10 w-10 text-purple-500 animate-float" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">总目标数</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.totalObjectives}</p>
            </div>
          </div>
        </div>

        <div className="card-gradient-bg rounded-xl shadow-lg border border-gray-600 p-6 hover:shadow-2xl transition-all duration-300 animate-slide-in" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center">
            <Zap className="h-10 w-10 text-green-400 animate-float" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">活跃流程</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.activeFlows}</p>
            </div>
          </div>
        </div>

        <div className="card-gradient-bg rounded-xl shadow-card border border-gray-600 p-6 hover:shadow-glow transition-all duration-300 animate-slide-in" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center">
            <Clock className="h-10 w-10 text-yellow-400 animate-float" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">待审批</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.pendingApprovals}</p>
            </div>
          </div>
        </div>

        <div className="card-gradient-bg rounded-xl shadow-card border border-gray-600 p-6 hover:shadow-glow transition-all duration-300 animate-slide-in" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center">
            <CheckCircle className="h-10 w-10 text-green-400 animate-float" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">已完成</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.completedTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近的Flow */}
        <div className="card-gradient-bg rounded-xl shadow-card border border-gray-600 backdrop-blur-xl">
          <div className="p-6 border-b border-gray-600">
            <h3 className="text-lg font-medium text-white">最近的流程</h3>
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
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-300">暂无流程</p>
                <Link
                  to="/intake"
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
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
                    className="block p-4 border border-gray-600 rounded-xl hover:border-tech-primary hover:shadow-tech transition-all duration-300 bg-gray-800/30 backdrop-blur-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">
                          {flow.objective.title}
                        </h4>
                        <p className="text-sm text-gray-300 mt-1 line-clamp-2">
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
                      <div className="ml-4 text-xs text-gray-400">
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
          <div className="card-gradient-bg rounded-xl shadow-card border border-gray-600 backdrop-blur-xl">
            <div className="p-6 border-b border-gray-600">
              <h3 className="text-lg font-medium text-white">快速操作</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <Link
                to="/intake"
                className="flex items-center p-4 border border-gray-600 rounded-xl hover:border-tech-primary hover:shadow-tech transition-all duration-300 bg-gray-800/20 backdrop-blur-sm group"
              >
                <Plus className="h-6 w-6 text-tech-primary mr-3 group-hover:animate-bounce" />
                <div>
                  <p className="font-medium text-white">创建目标</p>
                  <p className="text-sm text-gray-300">启动新的流程</p>
                </div>
              </Link>

              <Link
                to="/approval"
                className="flex items-center p-4 border border-gray-600 rounded-xl hover:border-tech-accent hover:shadow-tech transition-all duration-300 bg-gray-800/20 backdrop-blur-sm group"
              >
                <CheckCircle className="h-6 w-6 text-tech-accent mr-3 group-hover:animate-bounce" />
                <div>
                  <p className="font-medium text-white">审批中心</p>
                  <p className="text-sm text-gray-300">处理待审批事项</p>
                </div>
              </Link>

              <Link
                to="/execution"
                className="flex items-center p-4 border border-gray-600 rounded-xl hover:border-orange-400 hover:shadow-tech transition-all duration-300 bg-gray-800/20 backdrop-blur-sm group"
              >
                <Activity className="h-6 w-6 text-orange-400 mr-3 group-hover:animate-bounce" />
                <div>
                  <p className="font-medium text-white">执行监控</p>
                  <p className="text-sm text-gray-300">查看执行状态</p>
                </div>
              </Link>

              <Link
                to="/settings"
                className="flex items-center p-4 border border-gray-600 rounded-xl hover:border-tech-glow hover:shadow-tech transition-all duration-300 bg-gray-800/20 backdrop-blur-sm group"
              >
                <Users className="h-6 w-6 text-tech-glow mr-3 group-hover:animate-bounce" />
                <div>
                  <p className="font-medium text-white">设置</p>
                  <p className="text-sm text-gray-300">配置系统选项</p>
                </div>
              </Link>
            </div>
          </div>

          {/* 系统状态 */}
          <div className="card-gradient-bg rounded-xl shadow-card border border-gray-600 backdrop-blur-xl">
            <div className="p-6 border-b border-gray-600">
              <h3 className="text-lg font-medium text-white">系统状态</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">WebSocket连接</span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                    isConnected
                      ? 'bg-tech-accent/20 text-tech-accent border-tech-accent/30 animate-pulse'
                      : 'bg-red-400/20 text-red-400 border-red-400/30'
                  }`}
                >
                  {isConnected ? '已连接' : '未连接'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">当前用户</span>
                <span className="text-sm font-medium text-white">{currentUser}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">系统版本</span>
                <span className="text-sm font-medium text-purple-400">v2.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;