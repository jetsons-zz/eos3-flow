import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ObjectiveIntake from './pages/ObjectiveIntake';
import FlowDetail from './pages/FlowDetail';
import ApprovalDashboard from './pages/ApprovalDashboard';
import ExecutionMonitor from './pages/ExecutionMonitor';
import Settings from './pages/Settings';
import { Toaster } from './components/ui/Toaster';

// 暂时移除 WebSocket 和复杂的状态管理，先确保基本渲染正常
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/intake" element={<ObjectiveIntake />} />
          <Route path="/flow/:flowId" element={<FlowDetail />} />
          <Route path="/approval" element={<ApprovalDashboard />} />
          <Route path="/execution" element={<ExecutionMonitor />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
      <Toaster />
    </div>
  );
}

export default App;