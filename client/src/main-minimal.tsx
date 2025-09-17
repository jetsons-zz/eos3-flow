import React from 'react'
import ReactDOM from 'react-dom/client'
import MinimalApp from './MinimalApp'

console.log('加载最简化应用...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MinimalApp />
  </React.StrictMode>,
)

console.log('最简化应用渲染完成');