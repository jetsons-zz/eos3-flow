import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Star,
  Clock,
  Mail,
  Phone,
  ArrowLeft,
  MoreHorizontal,
  Badge,
  TrendingUp
} from 'lucide-react';
import { PersonResource, Skill } from '../../../shared/types';

interface PeopleFilters {
  department?: string;
  role?: string;
  skill?: string;
  availability?: 'available' | 'busy' | 'all';
}

const PeopleManagement: React.FC = () => {
  const [people, setPeople] = useState<PersonResource[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<PersonResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<PeopleFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadPeople();
  }, []);

  useEffect(() => {
    filterPeople();
  }, [people, searchTerm, filters]);

  const loadPeople = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockPeople: PersonResource[] = [
        {
          id: '1',
          type: 'human',
          name: '张三',
          email: 'zhang.san@company.com',
          role: '高级前端工程师',
          quantity: 1,
          unit: '人',
          available: 1,
          allocated: 0,
          department: '技术部',
          location: '北京',
          status: 'active',
          workload: 75,
          hourlyRate: 200,
          team: '前端团队',
          skills: [
            { id: '1', name: 'React', level: 'expert', yearsOfExperience: 5, certifications: ['React Developer'] },
            { id: '2', name: 'TypeScript', level: 'advanced', yearsOfExperience: 3, certifications: [] },
            { id: '3', name: 'Node.js', level: 'intermediate', yearsOfExperience: 2, certifications: [] }
          ],
          availability: [
            {
              startDate: new Date('2024-01-15'),
              endDate: new Date('2024-02-15'),
              availableHours: 160,
              note: '正常工作时间'
            }
          ],
          createdAt: new Date('2023-06-01'),
          updatedAt: new Date('2024-01-10')
        },
        {
          id: '2',
          type: 'human',
          name: '李四',
          email: 'li.si@company.com',
          role: '后端工程师',
          quantity: 1,
          unit: '人',
          available: 0,
          allocated: 1,
          department: '技术部',
          location: '上海',
          status: 'active',
          workload: 90,
          hourlyRate: 180,
          team: '后端团队',
          skills: [
            { id: '4', name: 'Java', level: 'expert', yearsOfExperience: 6, certifications: ['Oracle Java Certified'] },
            { id: '5', name: 'Spring Boot', level: 'advanced', yearsOfExperience: 4, certifications: [] },
            { id: '6', name: 'MySQL', level: 'advanced', yearsOfExperience: 4, certifications: [] }
          ],
          availability: [
            {
              startDate: new Date('2024-01-15'),
              endDate: new Date('2024-02-15'),
              availableHours: 40,
              note: '项目繁忙期，可用时间有限'
            }
          ],
          createdAt: new Date('2022-08-15'),
          updatedAt: new Date('2024-01-12')
        },
        {
          id: '3',
          type: 'human',
          name: '王五',
          email: 'wang.wu@company.com',
          role: '产品经理',
          quantity: 1,
          unit: '人',
          available: 1,
          allocated: 0,
          department: '产品部',
          location: '深圳',
          status: 'active',
          workload: 60,
          hourlyRate: 150,
          team: '产品团队',
          skills: [
            { id: '7', name: '产品设计', level: 'expert', yearsOfExperience: 4, certifications: ['PMP'] },
            { id: '8', name: '用户研究', level: 'advanced', yearsOfExperience: 3, certifications: [] },
            { id: '9', name: '数据分析', level: 'intermediate', yearsOfExperience: 2, certifications: [] }
          ],
          availability: [
            {
              startDate: new Date('2024-01-15'),
              endDate: new Date('2024-02-15'),
              availableHours: 120,
              note: '可参与新项目'
            }
          ],
          createdAt: new Date('2023-03-10'),
          updatedAt: new Date('2024-01-08')
        }
      ];

      setPeople(mockPeople);
    } catch (err) {
      setError('加载人员数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPeople = () => {
    let filtered = people;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(person =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.skills.some(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 部门过滤
    if (filters.department) {
      filtered = filtered.filter(person => person.department === filters.department);
    }

    // 角色过滤
    if (filters.role) {
      filtered = filtered.filter(person => person.role.includes(filters.role || ''));
    }

    // 技能过滤
    if (filters.skill) {
      filtered = filtered.filter(person =>
        person.skills.some(skill => skill.name.toLowerCase().includes((filters.skill || '').toLowerCase()))
      );
    }

    // 可用性过滤
    if (filters.availability) {
      if (filters.availability === 'available') {
        filtered = filtered.filter(person => person.workload < 80);
      } else if (filters.availability === 'busy') {
        filtered = filtered.filter(person => person.workload >= 80);
      }
    }

    setFilteredPeople(filtered);
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return 'text-red-600 bg-red-100';
    if (workload >= 80) return 'text-orange-600 bg-orange-100';
    if (workload >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getSkillLevelColor = (level: Skill['level']) => {
    switch (level) {
      case 'expert':
        return 'bg-purple-100 text-purple-800';
      case 'advanced':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-green-100 text-green-800';
      case 'beginner':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeletePerson = async (personId: string) => {
    if (!confirm('确定要删除这个人员吗？')) return;

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setPeople(prev => prev.filter(p => p.id !== personId));
    } catch (err) {
      setError('删除失败');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/resources"
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">人员管理</h1>
            <p className="text-gray-600 mt-1">管理企业人力资源和技能库</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center space-x-4">
        <Link
          to="/resources"
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">人员管理</h1>
          <p className="text-gray-600 mt-1">管理企业人力资源和技能库</p>
        </div>
        <Link
          to="/resources/people/add"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          添加人员
        </Link>
      </div>

      {/* 搜索和过滤 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索姓名、邮箱、角色或技能..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 过滤按钮 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            过滤
          </button>
        </div>

        {/* 过滤器 */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">部门</label>
                <select
                  value={filters.department || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">全部部门</option>
                  <option value="技术部">技术部</option>
                  <option value="产品部">产品部</option>
                  <option value="设计部">设计部</option>
                  <option value="市场部">市场部</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <input
                  type="text"
                  placeholder="输入角色关键词"
                  value={filters.role || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">技能</label>
                <input
                  type="text"
                  placeholder="输入技能关键词"
                  value={filters.skill || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, skill: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">可用性</label>
                <select
                  value={filters.availability || 'all'}
                  onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">全部</option>
                  <option value="available">可用</option>
                  <option value="busy">繁忙</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-3">
              <button
                onClick={() => setFilters({})}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                清除过滤
              </button>
              <span className="text-sm text-gray-500">
                显示 {filteredPeople.length} / {people.length} 人员
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 人员列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">人员列表</h3>
        </div>
        <div className="p-6">
          {filteredPeople.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {people.length === 0 ? '暂无人员数据' : '没有找到匹配的人员'}
              </p>
              {people.length === 0 && (
                <Link
                  to="/resources/people/add"
                  className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加第一个人员
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPeople.map((person) => (
                <div
                  key={person.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-lg">
                            {person.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{person.name}</h4>
                          <p className="text-gray-600">{person.role}</p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getWorkloadColor(person.workload)}`}
                        >
                          工作负载 {person.workload}%
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {person.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Badge className="h-4 w-4 mr-2" />
                            {person.department} · {person.team}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            ¥{person.hourlyRate}/小时
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">核心技能:</p>
                          <div className="flex flex-wrap gap-2">
                            {person.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill.id}
                                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getSkillLevelColor(skill.level)}`}
                              >
                                {skill.name}
                                <Star className="h-3 w-3 ml-1" />
                              </span>
                            ))}
                            {person.skills.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                +{person.skills.length - 3} 更多
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>位置: {person.location}</span>
                        <span>状态: {person.status === 'active' ? '在职' : '离职'}</span>
                        <span>入职时间: {person.createdAt.toLocaleDateString('zh-CN')}</span>
                      </div>
                    </div>

                    <div className="ml-4 flex items-center space-x-2">
                      <Link
                        to={`/resources/people/${person.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="查看详情"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/resources/people/${person.id}/edit`}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="编辑"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeletePerson(person.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default PeopleManagement;