import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">设置</h1>
        <p className="text-gray-600 mt-1">配置系统参数和用户偏好</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <SettingsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">设置功能开发中</h3>
          <p className="text-gray-600">此功能正在开发中，敬请期待</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;