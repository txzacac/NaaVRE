import React, { useState, useEffect } from 'react';
import { 
  GroupSummary, 
  DashboardKPIs, 
  CrossGroupDependency, 
  DashboardFilters, 
  CompareMetrics,
  Sprint 
} from './types';

interface CrossGroupDashboardProps {
  projectId: string;
  onBack: () => void;
}

interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, color = '#007bff', trend }) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '';
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <div style={{ 
        fontSize: '32px', 
        fontWeight: 'bold', 
        color: color,
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {value} {getTrendIcon()}
      </div>
      <div style={{ fontSize: '16px', color: '#333', fontWeight: '500' }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

interface GroupSummaryTableProps {
  summaries: GroupSummary[];
  onGroupSelect: (group: string) => void;
  selectedGroups: string[];
}

const GroupSummaryTable: React.FC<GroupSummaryTableProps> = ({ 
  summaries, 
  onGroupSelect, 
  selectedGroups 
}) => {
  const [sortBy, setSortBy] = useState<keyof GroupSummary>('completionPercentage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedSummaries = [...summaries].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const handleSort = (column: keyof GroupSummary) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column: keyof GroupSummary) => {
    if (sortBy !== column) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #e0e0e0' }}>
        <h3 style={{ margin: 0, color: '#333' }}>团队汇总</h3>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ 
                padding: '12px', 
                textAlign: 'left', 
                borderBottom: '1px solid #e0e0e0',
                cursor: 'pointer',
                userSelect: 'none'
              }}>
                <input 
                  type="checkbox" 
                  onChange={() => {}} 
                  style={{ marginRight: '8px' }}
                />
                全选
              </th>
              <th 
                style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  borderBottom: '1px solid #e0e0e0',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
                onClick={() => handleSort('group')}
              >
                团队 {getSortIcon('group')}
              </th>
              <th 
                style={{ 
                  padding: '12px', 
                  textAlign: 'center', 
                  borderBottom: '1px solid #e0e0e0',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
                onClick={() => handleSort('totalTasks')}
              >
                总任务 {getSortIcon('totalTasks')}
              </th>
              <th 
                style={{ 
                  padding: '12px', 
                  textAlign: 'center', 
                  borderBottom: '1px solid #e0e0e0',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
                onClick={() => handleSort('completedTasks')}
              >
                已完成 {getSortIcon('completedTasks')}
              </th>
              <th 
                style={{ 
                  padding: '12px', 
                  textAlign: 'center', 
                  borderBottom: '1px solid #e0e0e0',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
                onClick={() => handleSort('inProgressTasks')}
              >
                进行中 {getSortIcon('inProgressTasks')}
              </th>
              <th 
                style={{ 
                  padding: '12px', 
                  textAlign: 'center', 
                  borderBottom: '1px solid #e0e0e0',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
                onClick={() => handleSort('todoTasks')}
              >
                待办 {getSortIcon('todoTasks')}
              </th>
              <th 
                style={{ 
                  padding: '12px', 
                  textAlign: 'center', 
                  borderBottom: '1px solid #e0e0e0',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
                onClick={() => handleSort('overdueTasks')}
              >
                逾期 {getSortIcon('overdueTasks')}
              </th>
              <th 
                style={{ 
                  padding: '12px', 
                  textAlign: 'center', 
                  borderBottom: '1px solid #e0e0e0',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
                onClick={() => handleSort('completionPercentage')}
              >
                完成率 {getSortIcon('completionPercentage')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedSummaries.map((summary, index) => (
              <tr 
                key={summary.group}
                style={{ 
                  backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                  cursor: 'pointer'
                }}
                onClick={() => onGroupSelect(summary.group)}
              >
                <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedGroups.includes(summary.group)}
                    onChange={() => onGroupSelect(summary.group)}
                  />
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0', fontWeight: '500' }}>
                  {summary.group}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0', textAlign: 'center' }}>
                  {summary.totalTasks}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0', textAlign: 'center', color: '#28a745' }}>
                  {summary.completedTasks}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0', textAlign: 'center', color: '#ffc107' }}>
                  {summary.inProgressTasks}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0', textAlign: 'center', color: '#6c757d' }}>
                  {summary.todoTasks}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0', textAlign: 'center', color: '#dc3545' }}>
                  {summary.overdueTasks}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '8px', 
                      backgroundColor: '#e9ecef', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${summary.completionPercentage}%`,
                        height: '100%',
                        backgroundColor: summary.completionPercentage >= 80 ? '#28a745' : 
                                        summary.completionPercentage >= 60 ? '#ffc107' : '#dc3545',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', minWidth: '40px' }}>
                      {summary.completionPercentage}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface ComparePanelProps {
  projectId: string;
  selectedGroups: string[];
  onGroupsChange: (groups: string[]) => void;
}

const ComparePanel: React.FC<ComparePanelProps> = ({ 
  projectId, 
  selectedGroups, 
  onGroupsChange 
}) => {
  const [compareData, setCompareData] = useState<CompareMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['completion', 'overdue', 'wip']);

  useEffect(() => {
    if (selectedGroups.length >= 2) {
      loadComparisonData();
    }
  }, [selectedGroups, selectedMetrics]);

  const loadComparisonData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/collab-manager/api/dashboard/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groups: selectedGroups,
          metrics: selectedMetrics
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setCompareData(data);
      }
    } catch (error) {
      console.error('Error loading comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableMetrics = [
    { key: 'completion', label: '完成率' },
    { key: 'overdue', label: '逾期任务' },
    { key: 'wip', label: '在制品' },
    { key: 'todo', label: '待办任务' },
    { key: 'total', label: '总任务' }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        加载对比数据中...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>团队对比</h3>
        
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              选择团队 (至少2个)
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['Team A', 'Team B', 'Team C', 'Team D'].map(group => (
                <label key={group} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group)}
                    onChange={() => {
                      if (selectedGroups.includes(group)) {
                        onGroupsChange(selectedGroups.filter(g => g !== group));
                      } else {
                        onGroupsChange([...selectedGroups, group]);
                      }
                    }}
                  />
                  {group}
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              对比指标
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {availableMetrics.map(metric => (
                <label key={metric.key} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric.key)}
                    onChange={() => {
                      if (selectedMetrics.includes(metric.key)) {
                        setSelectedMetrics(selectedMetrics.filter(m => m !== metric.key));
                      } else {
                        setSelectedMetrics([...selectedMetrics, metric.key]);
                      }
                    }}
                  />
                  {metric.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedGroups.length >= 2 && compareData && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Side-by-Side KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${selectedGroups.length}, 1fr)`, gap: '15px' }}>
            {selectedGroups.map(group => (
              <div key={group} style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0'
              }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#333', textAlign: 'center' }}>
                  {group}
                </h4>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {selectedMetrics.map(metric => (
                    <div key={metric} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      padding: '8px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px'
                    }}>
                      <span style={{ fontSize: '14px', color: '#666' }}>
                        {availableMetrics.find(m => m.key === metric)?.label}
                      </span>
                      <span style={{ fontWeight: 'bold', color: '#333' }}>
                        {compareData.data[group]?.[metric] || 0}
                        {metric === 'completion' ? '%' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Stacked Bars Comparison */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{ margin: '0 0 20px 0', color: '#333' }}>任务状态对比</h4>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'end' }}>
              {selectedGroups.map(group => {
                const data = compareData.data[group];
                const total = data?.total || 1;
                const todo = data?.todo || 0;
                const wip = data?.wip || 0;
                const completed = data?.completion ? (data.completion / 100) * total : 0;
                
                return (
                  <div key={group} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>{group}</div>
                    <div style={{ 
                      height: '100px', 
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'end',
                      gap: '2px'
                    }}>
                      <div style={{
                        height: `${(completed / total) * 100}%`,
                        backgroundColor: '#28a745',
                        borderRadius: '2px',
                        minHeight: '2px'
                      }} />
                      <div style={{
                        height: `${(wip / total) * 100}%`,
                        backgroundColor: '#ffc107',
                        borderRadius: '2px',
                        minHeight: '2px'
                      }} />
                      <div style={{
                        height: `${(todo / total) * 100}%`,
                        backgroundColor: '#6c757d',
                        borderRadius: '2px',
                        minHeight: '2px'
                      }} />
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                      <div>完成: {Math.round(completed)}</div>
                      <div>进行中: {wip}</div>
                      <div>待办: {todo}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedGroups.length < 2 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          请选择至少2个团队进行对比
        </div>
      )}
    </div>
  );
};

export const CrossGroupDashboard: React.FC<CrossGroupDashboardProps> = ({ projectId, onBack }) => {
  const [viewMode, setViewMode] = useState<'overview' | 'compare'>('overview');
  const [dashboardData, setDashboardData] = useState<{
    kpis: DashboardKPIs;
    groupSummaries: GroupSummary[];
    dependencies: CrossGroupDependency[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<string>('All');
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  useEffect(() => {
    loadDashboardData();
    loadSprints();
  }, [projectId, selectedSprint, filters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedSprint !== 'All') params.append('sprint', selectedSprint);
      if (filters.status?.length) params.append('status', filters.status.join(','));
      if (filters.assignee?.length) params.append('assignee', filters.assignee.join(','));
      if (filters.labels?.length) params.append('labels', filters.labels.join(','));
      if (filters.groups?.length) params.append('groups', filters.groups.join(','));

      const response = await fetch(`/collab-manager/api/dashboard/${projectId}?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSprints = async () => {
    try {
      const response = await fetch(`/collab-manager/api/sprints/${projectId}`);
      const data = await response.json();
      if (data.success) {
        setSprints(data.sprints || []);
      }
    } catch (error) {
      console.error('Error loading sprints:', error);
    }
  };

  const handleGroupSelect = (group: string) => {
    if (selectedGroups.includes(group)) {
      setSelectedGroups(selectedGroups.filter(g => g !== group));
    } else {
      setSelectedGroups([...selectedGroups, group]);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>加载仪表盘数据中...</div>
          <div style={{ color: '#666' }}>正在分析团队协作数据</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
            跨团队协作仪表盘
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>项目: {projectId}</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Sprint Selector */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
              Sprint
            </label>
            <select
              value={selectedSprint}
              onChange={(e) => setSelectedSprint(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="All">所有 Sprint</option>
              {sprints.map(sprint => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name} ({sprint.status})
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
              视图模式
            </label>
            <div style={{ display: 'flex', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
              <button
                onClick={() => setViewMode('overview')}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  backgroundColor: viewMode === 'overview' ? '#007bff' : 'white',
                  color: viewMode === 'overview' ? 'white' : '#333',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                总览
              </button>
              <button
                onClick={() => setViewMode('compare')}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  backgroundColor: viewMode === 'compare' ? '#007bff' : 'white',
                  color: viewMode === 'compare' ? 'white' : '#333',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                对比
              </button>
            </div>
          </div>

          <button
            onClick={onBack}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            返回项目
          </button>
        </div>
      </div>

      {viewMode === 'overview' && dashboardData && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <KPICard
              title="总任务数"
              value={dashboardData.kpis.totalTasks}
              color="#007bff"
            />
            <KPICard
              title="完成率"
              value={`${dashboardData.kpis.totalCompletionRate}%`}
              color={dashboardData.kpis.totalCompletionRate >= 80 ? '#28a745' : 
                     dashboardData.kpis.totalCompletionRate >= 60 ? '#ffc107' : '#dc3545'}
            />
            <KPICard
              title="逾期任务"
              value={dashboardData.kpis.overdueTasks}
              color="#dc3545"
            />
            <KPICard
              title="7天内到期"
              value={dashboardData.kpis.dueIn7Days}
              color="#ffc107"
            />
            <KPICard
              title="平均在制品"
              value={dashboardData.kpis.averageWIP}
              color="#17a2b8"
            />
            <KPICard
              title="平均周期"
              value={`${dashboardData.kpis.averageCycleTime}天`}
              color="#6c757d"
            />
          </div>

          {/* Group Summary Table */}
          <GroupSummaryTable
            summaries={dashboardData.groupSummaries}
            onGroupSelect={handleGroupSelect}
            selectedGroups={selectedGroups}
          />

          {/* Dependencies Panel */}
          {dashboardData.dependencies.length > 0 && (
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>跨团队依赖与风险</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {dashboardData.dependencies.map(dep => (
                  <div key={dep.id} style={{
                    padding: '12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    backgroundColor: dep.status === 'blocked' ? '#f8d7da' : 
                                   dep.status === 'at_risk' ? '#fff3cd' : '#d4edda'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {dep.fromGroup}: {dep.fromTask} → {dep.toGroup}: {dep.toTask}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      状态: {dep.status === 'blocked' ? '阻塞' : 
                            dep.status === 'at_risk' ? '有风险' : '正常'}
                      {dep.daysLate && ` (逾期 ${dep.daysLate} 天)`}
                      {dep.dueInDays && ` (${dep.dueInDays} 天内到期)`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'compare' && (
        <ComparePanel
          projectId={projectId}
          selectedGroups={selectedGroups}
          onGroupsChange={setSelectedGroups}
        />
      )}
    </div>
  );
};

