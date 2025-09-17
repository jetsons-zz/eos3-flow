import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Objective, ProposalPath, SimulationResult, ApprovalRequest, TaskGraph, ExecutionStatus } from '@shared/types';

interface FlowState {
  // 状态数据
  flows: Map<string, FlowData>;
  objectives: Objective[];
  currentFlow: FlowData | null;
  currentUser: string;

  // UI状态
  isLoading: boolean;
  error: string | null;

  // 操作方法
  setCurrentUser: (userId: string) => void;
  createObjective: (objective: Omit<Objective, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  loadObjectives: () => Promise<void>;
  loadFlow: (flowId: string) => Promise<void>;
  updateFlowData: (flowId: string, data: Partial<FlowData>) => void;
  submitApproval: (flowId: string, decision: ApprovalDecision) => Promise<void>;
  clearError: () => void;
}

interface FlowData {
  id: string;
  objective: Objective;
  status: string;
  proposals: ProposalPath[];
  simulationResults: SimulationResult[];
  approvalRequest: ApprovalRequest | null;
  taskGraph: TaskGraph | null;
  executionId: string | null;
  executionStatus: ExecutionStatus | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ApprovalDecision {
  status: 'approved' | 'rejected' | 'modified';
  selectedProposal?: string;
  modifications?: any[];
  comments?: string;
}

export const useFlowStore = create<FlowState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      flows: new Map(),
      objectives: [],
      currentFlow: null,
      currentUser: 'demo-user',
      isLoading: false,
      error: null,

      // 设置当前用户
      setCurrentUser: (userId: string) => {
        set({ currentUser: userId });
      },

      // 创建目标
      createObjective: async (objectiveData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('http://localhost:8085/api/objectives', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...objectiveData,
              userId: get().currentUser
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '创建目标失败');
          }

          const result = await response.json();

          if (result.success) {
            // 更新objectives列表
            await get().loadObjectives();

            // 创建Flow数据
            const flowData: FlowData = {
              id: result.data.flowId,
              objective: result.data.objective,
              status: 'intake',
              proposals: [],
              simulationResults: [],
              approvalRequest: null,
              taskGraph: null,
              executionId: null,
              executionStatus: null,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            set(state => ({
              flows: new Map(state.flows.set(result.data.flowId, flowData)),
              currentFlow: flowData,
              isLoading: false
            }));
          } else {
            throw new Error(result.error || '创建目标失败');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '未知错误',
            isLoading: false
          });
          throw error;
        }
      },

      // 加载目标列表
      loadObjectives: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`http://localhost:8085/api/objectives?userId=${get().currentUser}`);

          if (!response.ok) {
            throw new Error('加载目标列表失败');
          }

          const result = await response.json();

          if (result.success) {
            set({
              objectives: result.data.objectives,
              isLoading: false
            });
          } else {
            throw new Error(result.error || '加载目标列表失败');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '未知错误',
            isLoading: false
          });
        }
      },

      // 加载Flow详情
      loadFlow: async (flowId: string) => {
        set({ isLoading: true, error: null });

        try {
          // 并行加载Flow的各个部分
          const [proposalsRes, simulationRes, approvalRes, executionRes] = await Promise.allSettled([
            fetch(`/api/proposals/flow/${flowId}`),
            fetch(`/api/simulation/flow/${flowId}`),
            fetch(`/api/approval/flow/${flowId}`),
            fetch(`/api/execution/flow/${flowId}`)
          ]);

          const flowData: Partial<FlowData> = { id: flowId };

          // 处理proposals
          if (proposalsRes.status === 'fulfilled' && proposalsRes.value.ok) {
            const proposalsData = await proposalsRes.value.json();
            if (proposalsData.success) {
              flowData.proposals = proposalsData.data.proposals;
              flowData.status = proposalsData.data.status;
            }
          }

          // 处理simulation
          if (simulationRes.status === 'fulfilled' && simulationRes.value.ok) {
            const simulationData = await simulationRes.value.json();
            if (simulationData.success) {
              flowData.simulationResults = simulationData.data.simulationResults;
            }
          }

          // 处理approval
          if (approvalRes.status === 'fulfilled' && approvalRes.value.ok) {
            const approvalData = await approvalRes.value.json();
            if (approvalData.success) {
              flowData.approvalRequest = approvalData.data.approvalRequest;
            }
          }

          // 处理execution
          if (executionRes.status === 'fulfilled' && executionRes.value.ok) {
            const executionData = await executionRes.value.json();
            if (executionData.success) {
              flowData.taskGraph = executionData.data.taskGraph;
              flowData.executionId = executionData.data.executionId;
              flowData.executionStatus = executionData.data.executionStatus;
            }
          }

          set(state => {
            const existingFlow = state.flows.get(flowId);
            const updatedFlow: FlowData = {
              ...existingFlow,
              ...flowData,
              updatedAt: new Date()
            } as FlowData;

            return {
              flows: new Map(state.flows.set(flowId, updatedFlow)),
              currentFlow: updatedFlow,
              isLoading: false
            };
          });

        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '加载Flow失败',
            isLoading: false
          });
        }
      },

      // 更新Flow数据（用于WebSocket更新）
      updateFlowData: (flowId: string, data: Partial<FlowData>) => {
        set(state => {
          const existingFlow = state.flows.get(flowId);
          if (!existingFlow) return state;

          const updatedFlow = {
            ...existingFlow,
            ...data,
            updatedAt: new Date()
          };

          const newFlows = new Map(state.flows.set(flowId, updatedFlow));

          return {
            flows: newFlows,
            currentFlow: state.currentFlow?.id === flowId ? updatedFlow : state.currentFlow
          };
        });
      },

      // 提交审批决策
      submitApproval: async (flowId: string, decision: ApprovalDecision) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`/api/approval/flow/${flowId}/submit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(decision),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '提交审批失败');
          }

          const result = await response.json();

          if (result.success) {
            // 重新加载Flow数据
            await get().loadFlow(flowId);
          } else {
            throw new Error(result.error || '提交审批失败');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '提交审批失败',
            isLoading: false
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'flow-store',
    }
  )
);