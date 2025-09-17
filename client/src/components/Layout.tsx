import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Plus,
  CheckSquare,
  Activity,
  Settings as SettingsIcon,
  Zap,
  Users,
  BarChart3
} from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useFlowStore } from '../stores/flowStore';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isConnected } = useWebSocket();
  const { currentUser } = useFlowStore();

  const navigation = [
    { name: '仪表板', href: '/', icon: Home },
    { name: '创建目标', href: '/intake', icon: Plus },
    { name: '待审批', href: '/approval', icon: CheckSquare },
    { name: '执行监控', href: '/execution', icon: Activity },
    { name: '设置', href: '/settings', icon: SettingsIcon },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo和标题 */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Zap className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">EOS3 Flow</h1>
                  <p className="text-xs text-gray-500">智能任务调度中枢</p>
                </div>
              </div>
            </div>

            {/* 右侧状态信息 */}
            <div className="flex items-center space-x-4">
              {/* 连接状态 */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-sm text-gray-600">
                  {isConnected ? '已连接' : '未连接'}
                </span>
              </div>

              {/* 用户信息 */}
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{currentUser}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边导航 */}
        <nav className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        isActive(item.href)
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                          isActive(item.href)
                            ? 'text-blue-700'
                            : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* 底部状态面板 */}
          <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center justify-between">
                <span>系统状态</span>
                <span className="text-green-600">正常</span>
              </div>
              <div className="flex items-center justify-between">
                <span>版本</span>
                <span>v1.0.0</span>
              </div>
            </div>
          </div>
        </nav>

        {/* 主要内容区域 */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;