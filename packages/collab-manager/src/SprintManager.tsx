import React, { useState, useEffect } from 'react';
import { Sprint, SprintStatus, SprintReport } from './types';

interface SprintManagerProps {
  projectId: string;
  onSprintSelect: (sprintId: string | null) => void;
  selectedSprintId: string | null;
}

interface SprintModalProps {
  sprint?: Sprint;
  onSave: (sprintData: any) => void;
  onCancel: () => void;
}

const SprintModal: React.FC<SprintModalProps> = ({ sprint, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: sprint?.name || '',
    goal: sprint?.goal || '',
    startDate: sprint?.startDate || '',
    endDate: sprint?.endDate || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '500px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
          {sprint ? '编辑 Sprint' : '新建 Sprint'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Sprint 名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="例如：Sprint 1, Sprint 2"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Sprint 目标
            </label>
            <textarea
              value={formData.goal}
              onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical'
              }}
              placeholder="简要描述本次迭代要达成的目标，例如：完成文献综述初稿"
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                开始日期
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                结束日期
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              取消
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#007bff',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {sprint ? '更新 Sprint' : '创建 Sprint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const SprintManager: React.FC<SprintManagerProps> = ({ 
  projectId, 
  onSprintSelect, 
  selectedSprintId 
}) => {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [sprintReport, setSprintReport] = useState<SprintReport | null>(null);

  useEffect(() => {
    loadSprints();
  }, [projectId]);

  const loadSprints = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/collab-manager/api/sprints/${projectId}`);
      const data = await response.json();
      
      if (data.success) {
        setSprints(data.sprints || []);
      } else {
        console.error('Failed to load sprints:', data.error);
      }
    } catch (error) {
      console.error('Error loading sprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSprint = async (sprintData: any) => {
    try {
      const response = await fetch(`/collab-manager/api/sprints/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', ...sprintData })
      });
      
      const data = await response.json();
      if (data.success) {
        setSprints(prev => [...prev, data.sprint]);
        setShowCreateModal(false);
      } else {
        alert('创建 Sprint 失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating sprint:', error);
      alert('创建 Sprint 时出错');
    }
  };

  const handleUpdateSprint = async (sprintData: any) => {
    if (!editingSprint) return;
    
    try {
      const response = await fetch(`/collab-manager/api/sprints/${projectId}/${editingSprint.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', ...sprintData })
      });
      
      const data = await response.json();
      if (data.success) {
        setSprints(prev => prev.map(s => s.id === editingSprint.id ? data.sprint : s));
        setEditingSprint(null);
      } else {
        alert('更新 Sprint 失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating sprint:', error);
      alert('更新 Sprint 时出错');
    }
  };

  const handleDeleteSprint = async (sprintId: string) => {
    if (!confirm('确定要删除这个 Sprint 吗？')) return;
    
    try {
      const response = await fetch(`/collab-manager/api/sprints/${projectId}/${sprintId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete' })
      });
      
      const data = await response.json();
      if (data.success) {
        setSprints(prev => prev.filter(s => s.id !== sprintId));
        if (selectedSprintId === sprintId) {
          onSprintSelect(null);
        }
      } else {
        alert('删除 Sprint 失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting sprint:', error);
      alert('删除 Sprint 时出错');
    }
  };

  const handleStartSprint = async (sprintId: string) => {
    try {
      const response = await fetch(`/collab-manager/api/sprints/${projectId}/${sprintId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      });
      
      const data = await response.json();
      if (data.success) {
        setSprints(prev => prev.map(s => s.id === sprintId ? data.sprint : s));
        onSprintSelect(sprintId);
      } else {
        alert('启动 Sprint 失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error starting sprint:', error);
      alert('启动 Sprint 时出错');
    }
  };

  const handleCompleteSprint = async (sprintId: string) => {
    if (!confirm('确定要完成这个 Sprint 吗？这将生成 Sprint 报告。')) return;
    
    try {
      const response = await fetch(`/collab-manager/api/sprints/${projectId}/${sprintId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' })
      });
      
      const data = await response.json();
      if (data.success) {
        setSprints(prev => prev.map(s => s.id === sprintId ? data.sprint : s));
        setSprintReport(data.report);
        onSprintSelect(null);
      } else {
        alert('完成 Sprint 失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error completing sprint:', error);
      alert('完成 Sprint 时出错');
    }
  };

  const getStatusColor = (status: SprintStatus) => {
    switch (status) {
      case 'planned': return '#6c757d';
      case 'active': return '#28a745';
      case 'completed': return '#17a2b8';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status: SprintStatus) => {
    switch (status) {
      case 'planned': return '计划中';
      case 'active': return '进行中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return status;
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>加载 Sprint 中...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h2 style={{ margin: 0, color: '#333' }}>Sprint 管理</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          新建 Sprint
        </button>
      </div>

      {/* Sprint 报告模态框 */}
      {sprintReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '600px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>Sprint 报告</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{sprintReport.sprintName}</h3>
              <p style={{ margin: '0 0 10px 0', color: '#666' }}><strong>目标:</strong> {sprintReport.goal}</p>
              <p style={{ margin: '0 0 20px 0', color: '#666' }}>
                <strong>完成时间:</strong> {sprintReport.completedAt}
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '20px', 
              marginBottom: '20px' 
            }}>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                  {sprintReport.totalTasks}
                </div>
                <div style={{ color: '#666' }}>总任务数</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>
                  {sprintReport.completedTasks}
                </div>
                <div style={{ color: '#666' }}>已完成</div>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8d7da', borderRadius: '4px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#721c24' }}>
                  {sprintReport.incompleteTasks}
                </div>
                <div style={{ color: '#666' }}>未完成</div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>完成率</h4>
              <div style={{ 
                width: '100%', 
                height: '20px', 
                backgroundColor: '#e9ecef', 
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${sprintReport.completionRate}%`,
                  height: '100%',
                  backgroundColor: '#28a745',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ textAlign: 'center', marginTop: '5px', fontWeight: 'bold' }}>
                {sprintReport.completionRate}%
              </div>
            </div>

            {sprintReport.incompleteTaskList.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>未完成任务</h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {sprintReport.incompleteTaskList.map(task => (
                    <div key={task.id} style={{ 
                      padding: '10px', 
                      border: '1px solid #dee2e6', 
                      borderRadius: '4px', 
                      marginBottom: '5px',
                      backgroundColor: '#f8f9fa'
                    }}>
                      <div style={{ fontWeight: 'bold' }}>{task.title}</div>
                      <div style={{ color: '#666', fontSize: '14px' }}>状态: {task.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => setSprintReport(null)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                关闭报告
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sprint 列表 */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {sprints.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            还没有创建任何 Sprint。创建第一个 Sprint 开始使用吧！
          </div>
        ) : (
          sprints.map(sprint => (
            <div key={sprint.id} style={{
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '15px'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{sprint.name}</h3>
                  <div style={{ 
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: getStatusColor(sprint.status),
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {getStatusText(sprint.status)}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {sprint.status === 'planned' && (
                    <>
                      <button
                        onClick={() => setEditingSprint(sprint)}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid #007bff',
                          backgroundColor: 'white',
                          color: '#007bff',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleStartSprint(sprint.id)}
                        style={{
                          padding: '6px 12px',
                          border: 'none',
                          backgroundColor: '#28a745',
                          color: 'white',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        开始
                      </button>
                    </>
                  )}
                  
                  {sprint.status === 'active' && (
                    <button
                      onClick={() => handleCompleteSprint(sprint.id)}
                      style={{
                        padding: '6px 12px',
                        border: 'none',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      完成
                    </button>
                  )}
                  
                  {sprint.status === 'planned' && (
                    <button
                      onClick={() => handleDeleteSprint(sprint.id)}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #dc3545',
                        backgroundColor: 'white',
                        color: '#dc3545',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      删除
                    </button>
                  )}
                  
                  <button
                    onClick={() => onSprintSelect(selectedSprintId === sprint.id ? null : sprint.id)}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #6c757d',
                      backgroundColor: selectedSprintId === sprint.id ? '#6c757d' : 'white',
                      color: selectedSprintId === sprint.id ? 'white' : '#6c757d',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {selectedSprintId === sprint.id ? '隐藏' : '查看'}
                  </button>
                </div>
              </div>

              {sprint.goal && (
                <p style={{ margin: '0 0 15px 0', color: '#666', fontStyle: 'italic' }}>
                  "{sprint.goal}"
                </p>
              )}

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: '14px',
                color: '#666'
              }}>
                <div>
                  {sprint.startDate && (
                    <span>开始: {new Date(sprint.startDate).toLocaleDateString()}</span>
                  )}
                  {sprint.startDate && sprint.endDate && <span> • </span>}
                  {sprint.endDate && (
                    <span>结束: {new Date(sprint.endDate).toLocaleDateString()}</span>
                  )}
                </div>
                
                {sprint.progress && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>{sprint.progress.completedTasks}/{sprint.progress.totalTasks} 任务</span>
                    <div style={{ 
                      width: '60px', 
                      height: '8px', 
                      backgroundColor: '#e9ecef', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${sprint.progress.completionPercentage}%`,
                        height: '100%',
                        backgroundColor: '#28a745',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                      {sprint.progress.completionPercentage}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 创建/编辑 Sprint 模态框 */}
      {(showCreateModal || editingSprint) && (
        <SprintModal
          sprint={editingSprint || undefined}
          onSave={editingSprint ? handleUpdateSprint : handleCreateSprint}
          onCancel={() => {
            setShowCreateModal(false);
            setEditingSprint(null);
          }}
        />
      )}
    </div>
  );
};