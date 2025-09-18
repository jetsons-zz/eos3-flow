import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ObjectiveIntake from './pages/ObjectiveIntake';
import FlowDetail from './pages/FlowDetail';
import ApprovalDashboard from './pages/ApprovalDashboard';
import ExecutionMonitor from './pages/ExecutionMonitor';
import Settings from './pages/Settings';
import ResourceCenter from './pages/ResourceCenter';
import PeopleManagement from './pages/PeopleManagement';
import BudgetManagement from './pages/BudgetManagement';
import ToolsManagement from './pages/ToolsManagement';
import { Toaster } from './components/ui/Toaster';

function App() {
  return (
    <div className="min-h-screen tech-gradient-bg">
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/intake" element={<ObjectiveIntake />} />
          <Route path="/flow/:flowId" element={<FlowDetail />} />
          <Route path="/approval" element={<ApprovalDashboard />} />
          <Route path="/execution" element={<ExecutionMonitor />} />
          <Route path="/resources" element={<ResourceCenter />} />
          <Route path="/resources/people" element={<PeopleManagement />} />
          <Route path="/resources/budget" element={<BudgetManagement />} />
          <Route path="/resources/tools" element={<ToolsManagement />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
      <Toaster />
    </div>
  );
}

export default App;