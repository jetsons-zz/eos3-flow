#!/bin/bash

# EOS3 Flow 启动脚本

echo "🚀 启动 EOS3 Flow 开发环境..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖包..."
    npm install
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚙️  创建环境配置文件..."
    cp .env.example .env
fi

# 启动服务
echo "🔧 启动后端服务 (端口 8081)..."
echo "🌐 启动前端服务 (端口 3000)..."
echo ""
echo "访问地址:"
echo "  前端: http://localhost:3000"
echo "  后端: http://localhost:8081"
echo "  健康检查: http://localhost:8081/api/health"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 并行启动前后端
npm run dev