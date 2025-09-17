import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App-test'
import './index.css'

console.log('启动测试版 EOS3 Flow 应用...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

console.log('测试版应用渲染完成');