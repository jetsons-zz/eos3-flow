import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, AlertTriangle, ThumbsUp, ThumbsDown, FileText } from 'lucide-react';

interface PendingApproval {
  id: string;
  flowId: string;
  objectiveTitle: string;
  objectiveDescription: string;
  proposals: {
    id: string;
    title: string;
    description: string;
    estimatedDuration: number;
    confidence: number;
  }[];
  simulationResults: {
    id: string;
    proposalId: string;
    consistencyScore: number;
    overallRisk: number;
  }[];
  createdAt: string;
  priority: string;
}

const ApprovalDashboard: React.FC = () => {
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const loadPendingApprovals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/approval/pending');
      const data = await response.json();
      if (data.success) {
        setPendingApprovals(data.data.approvals || []);
      } else {
        setError(data.error || '加载失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (flowId: string, status: 'approved' | 'rejected', selectedProposal?: string) => {
    try {
      const response = await fetch(`/api/approval/flow/${flowId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          selectedProposal,
          comments: status === 'approved' ? '已批准执行' : '需要进一步优化'
        })
      });

      const data = await response.json();
      if (data.success) {
        // 刷新列表
        loadPendingApprovals();
      } else {
        setError(data.error || '操作失败');
      }
    } catch (err) {
      setError('网络错误');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">审批中心</h1>
          <p className="text-gray-600 mt-1">管理和处理待审批的Flow请求</p>
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
          <h1 className="text-2xl font-bold text-gray-900">审批中心</h1>
          <p className="text-gray-600 mt-1">管理和处理待审批的Flow请求</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => loadPendingApprovals()}
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">审批中心</h1>
        <p className="text-gray-600 mt-1">管理和处理待审批的Flow请求</p>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">待审批</p>
              <p className="text-2xl font-bold text-gray-900">{pendingApprovals.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">今日已审批</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">高优先级</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingApprovals.filter(a => ['critical', 'high'].includes(a.priority)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 待审批列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">待审批请求</h3>
        </div>
        <div className="p-6">
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">暂无待审批项目</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {approval.objectiveTitle}
                        </h4>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(approval.priority)}`}
                        >
                          {approval.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{approval.objectiveDescription}</p>
                      <p className="text-sm text-gray-500">
                        提交时间: {new Date(approval.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>

                  {/* 候选方案 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {approval.proposals.map((proposal) => {
                      const simResult = approval.simulationResults.find(s => s.proposalId === proposal.id);
                      return (
                        <div key={proposal.id} className="border border-gray-100 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">{proposal.title}</h5>
                          <p className="text-sm text-gray-600 mb-3">{proposal.description}</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">预计时长:</span>
                              <span className="font-medium">{proposal.estimatedDuration}小时</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">置信度:</span>
                              <span className="font-medium">{(proposal.confidence * 100).toFixed(1)}%</span>
                            </div>
                            {simResult && (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">一致性:</span>
                                  <span className="font-medium">{(simResult.consistencyScore * 100).toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">风险度:</span>
                                  <span className={`font-medium ${simResult.overallRisk > 0.5 ? 'text-red-600' : 'text-green-600'}`}>
                                    {(simResult.overallRisk * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="mt-3 space-x-2">
                            <button
                              onClick={() => handleApproval(approval.flowId, 'approved', proposal.id)}
                              className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              批准此方案
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <Link
                      to={`/flow/${approval.flowId}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      查看详情
                    </Link>
                    <div className="space-x-3">
                      <button
                        onClick={() => handleApproval(approval.flowId, 'rejected')}
                        className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        拒绝
                      </button>
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

export default ApprovalDashboard;