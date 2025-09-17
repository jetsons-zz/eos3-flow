import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BarChart3, AlertTriangle, Play, Pause, CheckCircle, Clock, XCircle } from 'lucide-react';

interface ExecutingFlow {
  id: string;
  objectiveTitle: string;
  objectiveDescription: string;
  executionId: string;
  overallProgress: number;
  status: string;
  activeNodes: string[];
  completedNodes: string[];
  failedNodes: string[];
  blockedNodes: string[];
  estimatedCompletion?: string;
  currentBottlenecks: string[];
  lastUpdate: string;
  taskGraph: {
    nodes: {
      id: string;
      title: string;
      status: string;
      estimatedHours: number;
      actualHours?: number;
    }[];
  };
}

const ExecutionMonitor: React.FC = () => {
  const [executingFlows, setExecutingFlows] = useState<ExecutingFlow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExecutingFlows();
    // 设置定时刷新
    const interval = setInterval(loadExecutingFlows, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadExecutingFlows = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 模拟获取正在执行的流程
      // 在实际实现中，这里应该调用API获取所有执行中的流程
      const mockFlows: ExecutingFlow[] = [
        // 可以添加模拟数据或者调用真实API
      ];
      setExecutingFlows(mockFlows);
    } catch (err) {
      setError('网络错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseExecution = async (executionId: string) => {
    try {
      const response = await fetch(`/api/execution/${executionId}/pause`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        loadExecutingFlows();
      } else {
        setError(data.error || '操作失败');
      }
    } catch (err) {
      setError('网络错误');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'executing':
      case 'ready':
        return 'text-blue-600 bg-blue-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'blocked':
        return 'text-yellow-600 bg-yellow-100';
      case 'pending':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'executing':
        return '执行中';
      case 'ready':
        return '就绪';
      case 'failed':
        return '失败';
      case 'blocked':
        return '阻塞';
      case 'pending':
        return '等待中';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'executing':
        return <Activity className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'blocked':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading && executingFlows.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">执行监控</h1>
          <p className="text-gray-600 mt-1">实时监控任务执行状态和进度</p>
        </div>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">执行监控</h1>
          <p className="text-gray-600 mt-1">实时监控任务执行状态和进度</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => loadExecutingFlows()}
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">执行监控</h1>
          <p className="text-gray-600 mt-1">实时监控任务执行状态和进度</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${isLoading ? 'bg-yellow-400' : 'bg-green-400'}`} />
          <span className="text-sm text-gray-600">
            {isLoading ? '更新中...' : '实时监控'}
          </span>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">执行中</p>
              <p className="text-2xl font-bold text-gray-900">
                {executingFlows.filter(f => f.status === 'executing').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">已完成</p>
              <p className="text-2xl font-bold text-gray-900">
                {executingFlows.filter(f => f.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">有阻塞</p>
              <p className="text-2xl font-bold text-gray-900">
                {executingFlows.filter(f => f.blockedNodes.length > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">有失败</p>
              <p className="text-2xl font-bold text-gray-900">
                {executingFlows.filter(f => f.failedNodes.length > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 执行中的流程列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">执行中的流程</h3>
        </div>
        <div className="p-6">
          {executingFlows.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">暂无执行中的流程</p>
              <Link
                to="/intake"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                创建新目标
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {executingFlows.map((flow) => (
                <div
                  key={flow.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {flow.objectiveTitle}
                      </h4>
                      <p className="text-gray-600 mb-3">{flow.objectiveDescription}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>执行ID: {flow.executionId}</span>
                        <span>最后更新: {new Date(flow.lastUpdate).toLocaleString('zh-CN')}</span>
                        {flow.estimatedCompletion && (
                          <span>预计完成: {new Date(flow.estimatedCompletion).toLocaleString('zh-CN')}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {flow.overallProgress.toFixed(1)}%
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${flow.overallProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 任务节点状态 */}
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-3">任务节点状态</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {flow.taskGraph.nodes.map((node) => (
                        <div key={node.id} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
                          <div className={`p-1 rounded-full ${getStatusColor(node.status)}`}>
                            {getStatusIcon(node.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{node.title}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(node.status)}`}
                              >
                                {getStatusText(node.status)}
                              </span>
                              <span>{node.estimatedHours}h</span>
                              {node.actualHours && <span>实际: {node.actualHours}h</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 瓶颈和问题 */}
                  {(flow.currentBottlenecks.length > 0 || flow.failedNodes.length > 0) && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-3">当前问题</h5>
                      <div className="space-y-2">
                        {flow.currentBottlenecks.map((bottleneck, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg">
                            <AlertTriangle className="h-4 w-4" />
                            <span>瓶颈: {bottleneck}</span>
                          </div>
                        ))}
                        {flow.failedNodes.map((nodeId, index) => {
                          const node = flow.taskGraph.nodes.find(n => n.id === nodeId);
                          return (
                            <div key={index} className="flex items-center space-x-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">
                              <XCircle className="h-4 w-4" />
                              <span>失败任务: {node?.title || nodeId}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <Link
                      to={`/flow/${flow.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      查看详情
                    </Link>
                    <div className="space-x-3">
                      {flow.status === 'executing' && (
                        <button
                          onClick={() => handlePauseExecution(flow.executionId)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          暂停
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutionMonitor;