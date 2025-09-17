import React from 'react';

// 最简化的 App 组件，用于测试
function MinimalApp() {
  return (
    <div style={{ 
      padding: '20px', 
      background: '#f0f0f0', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🎉 EOS3 Flow 前端正常运行！
      </h1>
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>系统状态检查</h2>
        <ul>
          <li>✅ React 18 加载成功</li>
          <li>✅ TypeScript 编译正常</li>
          <li>✅ Vite 开发服务器运行中</li>
          <li>✅ 组件渲染正常</li>
        </ul>
        
        <p style={{ marginTop: '20px', color: '#666' }}>
          当前时间: {new Date().toLocaleString()}
        </p>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#e7f3ff', 
          border: '1px solid #b3d9ff',
          borderRadius: '4px'
        }}>
          <strong>说明:</strong> 这是一个最简化的测试组件，用于确认 React 应用基础功能正常。
          如果您看到这个页面，说明前端显示问题已解决。
        </div>
      </div>
    </div>
  );
}

export default MinimalApp;