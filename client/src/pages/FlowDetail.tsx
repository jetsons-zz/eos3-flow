import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useFlowStore } from '../stores/flowStore';
import { useWebSocket } from '../hooks/useWebSocket';

const FlowDetail: React.FC = () => {
  const { flowId } = useParams<{ flowId: string }>();
  const { currentFlow, loadFlow, isLoading, error } = useFlowStore();
  const { subscribe, unsubscribe } = useWebSocket();

  useEffect(() => {
    if (flowId) {
      loadFlow(flowId);
      subscribe(flowId);

      return () => {
        unsubscribe(flowId);
      };
    }
  }, [flowId, loadFlow, subscribe, unsubscribe]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentFlow) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Flow不存在</h3>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            返回仪表板
          </Link>
        </div>
      </div>
    );
  }

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center space-x-4">
        <Link
          to="/"
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{currentFlow.objective.title}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                currentFlow.status
              )}`}
            >
              {getStatusText(currentFlow.status)}
            </span>
            <span className="text-sm text-gray-600">
              创建于 {new Date(currentFlow.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 目标信息 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">目标详情</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700">描述</h3>
            <p className="mt-1 text-gray-900">{currentFlow.objective.description}</p>
          </div>

          {currentFlow.objective.constraints.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">约束条件</h3>
              <ul className="mt-1 space-y-1">
                {currentFlow.objective.constraints.map((constraint, index) => (
                  <li key={index} className="text-gray-900 text-sm">• {constraint}</li>
                ))}
              </ul>
            </div>
          )}

          {currentFlow.objective.kpis.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">KPI指标</h3>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentFlow.objective.kpis.map((kpi) => (
                  <div key={kpi.id} className="border border-gray-200 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900">{kpi.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{kpi.metric}</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      目标: {kpi.target} {kpi.unit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 候选方案 */}
      {currentFlow.proposals.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">候选方案</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentFlow.proposals.map((proposal) => (
              <div key={proposal.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">{proposal.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{proposal.description}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    预计时长: {proposal.estimatedDuration}小时
                  </span>
                  <span className="font-medium text-blue-600">
                    信心度: {Math.round(proposal.confidence * 100)}%
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-xs text-gray-600">
                    {proposal.steps.length} 个步骤，{proposal.risks.length} 个风险点
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 仿真结果 */}
      {currentFlow.simulationResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">仿真结果</h2>
          <div className="space-y-4">
            {currentFlow.simulationResults.map((simulation) => (
              <div key={simulation.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">
                    方案仿真 #{simulation.id.slice(-6)}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      一致性: {Math.round(simulation.consistencyScore * 100)}%
                    </span>
                    <span className="text-sm text-gray-600">
                      风险评级: {Math.round(simulation.riskAssessment.overallRisk * 100)}%
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {simulation.scenarios.length} 个场景，
                  {simulation.riskAssessment.bottlenecks.length} 个瓶颈
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 审批状态 */}
      {currentFlow.approvalRequest && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">审批状态</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">审批人</span>
              <span className="font-medium">{currentFlow.approvalRequest.approver}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">状态</span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  currentFlow.approvalRequest.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : currentFlow.approvalRequest.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {currentFlow.approvalRequest.status === 'approved' && '已批准'}
                {currentFlow.approvalRequest.status === 'rejected' && '已拒绝'}
                {currentFlow.approvalRequest.status === 'pending' && '待审批'}
                {currentFlow.approvalRequest.status === 'modified' && '已修改'}
              </span>
            </div>
            {currentFlow.approvalRequest.comments && (
              <div>
                <span className="text-sm text-gray-600">评论</span>
                <p className="mt-1 text-gray-900">{currentFlow.approvalRequest.comments}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 执行状态 */}
      {currentFlow.taskGraph && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">执行状态</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">整体进度</span>
              <span className="font-medium">{currentFlow.taskGraph.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${currentFlow.taskGraph.progress}%` }}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-gray-900">
                  {currentFlow.taskGraph.nodes.filter(n => n.status === 'pending').length}
                </div>
                <div className="text-gray-600">待处理</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">
                  {currentFlow.taskGraph.nodes.filter(n => n.status === 'executing').length}
                </div>
                <div className="text-gray-600">执行中</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600">
                  {currentFlow.taskGraph.nodes.filter(n => n.status === 'completed').length}
                </div>
                <div className="text-gray-600">已完成</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">
                  {currentFlow.taskGraph.nodes.filter(n => n.status === 'failed').length}
                </div>
                <div className="text-gray-600">失败</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowDetail;