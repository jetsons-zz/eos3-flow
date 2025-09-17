import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';

// 简化的测试组件
function TestDashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard 测试页面</h1>
      <p>这是一个简化的 Dashboard 组件，用于测试路由是否正常工作。</p>
    </div>
  );
}

function TestObjectiveIntake() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Objective Intake 测试页面</h1>
      <p>这是一个简化的 Objective Intake 组件。</p>
    </div>
  );
}

function SimpleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <header style={{ 
        background: '#white', 
        padding: '1rem 2rem', 
        borderBottom: '1px solid #ddd',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>EOS3 Flow - 测试版本</h1>
        <nav style={{ marginTop: '1rem' }}>
          <a href="/" style={{ marginRight: '1rem', color: '#007acc' }}>首页</a>
          <a href="/intake" style={{ marginRight: '1rem', color: '#007acc' }}>目标录入</a>
        </nav>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SimpleLayout>
        <Routes>
          <Route path="/" element={<TestDashboard />} />
          <Route path="/intake" element={<TestObjectiveIntake />} />
        </Routes>
      </SimpleLayout>
    </BrowserRouter>
  );
}

export default App;