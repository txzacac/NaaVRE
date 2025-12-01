import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, TaskColumn, TaskBoardData } from './types';

interface TaskBoardProps {
  projectId: string;
  onBack: () => void;
}

const COLUMN_CONFIG: { [key in TaskStatus]: { title: string; color: string } } = {
  'todo': { title: 'To Do', color: '#e3f2fd' },
  'in-progress': { title: 'In Progress', color: '#fff3e0' },
  'review': { title: 'Review', color: '#f3e5f5' },
  'done': { title: 'Done', color: '#e8f5e8' }
};

const PRIORITY_COLORS: { [key in TaskPriority]: string } = {
  'low': '#4caf50',
  'medium': '#ff9800',
  'high': '#f44336',
  'urgent': '#9c27b0'
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ projectId, onBack }) => {
  const [taskBoardData, setTaskBoardData] = useState<TaskBoardData | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize task board data
  useEffect(() => {
    loadTaskBoardData();
  }, [projectId]);

  const loadTaskBoardData = async () => {
    try {
      const response = await fetch(`/collab-manager/api/tasks/${projectId}`);
      const result = await response.json();
      
      if (result.success) {
        setTaskBoardData(result.taskBoard);
      } else {
        // If no data exists, initialize empty board
        initializeEmptyBoard();
      }
    } catch (error) {
      console.error('Failed to load task board data:', error);
      // Initialize empty board as fallback
      initializeEmptyBoard();
    }
    setLoading(false);
  };

  const initializeEmptyBoard = () => {
    const columns: TaskColumn[] = Object.keys(COLUMN_CONFIG).map(status => ({
      id: status as TaskStatus,
      title: COLUMN_CONFIG[status as TaskStatus].title,
      tasks: [],
      color: COLUMN_CONFIG[status as TaskStatus].color
    }));

    const initialData: TaskBoardData = {
      projectId,
      columns,
      lastUpdated: new Date().toISOString()
    };

    setTaskBoardData(initialData);
  };

  const getCSRFToken = () => {
    // Method 1: Try to get from meta tag
    const metaTag = document.querySelector('meta[name="_xsrf"]');
    if (metaTag) {
      return metaTag.getAttribute('content') || '';
    }
    
    // Method 2: Try to get from cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith('_xsrf=')) {
        return trimmed.split('=')[1];
      }
    }
    
    return '';
  };

  const createTask = async (taskId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const xsrfToken = getCSRFToken();
      const response = await fetch(`/collab-manager/api/tasks/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRFToken': xsrfToken,
        },
        body: JSON.stringify(taskData)
      });

      const result = await response.json();
      
      if (result.success) {
        // Reload task board data to get the updated state
        await loadTaskBoardData();
        setShowCreateModal(false);
      } else {
        alert('Failed to create task: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const xsrfToken = getCSRFToken();
      const response = await fetch(`/collab-manager/api/tasks/${projectId}/${taskId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRFToken': xsrfToken,
        },
        body: JSON.stringify({
          action: 'update',
          ...updates
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Reload task board data to get the updated state
        await loadTaskBoardData();
        setEditingTask(null);
      } else {
        alert('Failed to update task: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const xsrfToken = getCSRFToken();
      const response = await fetch(`/collab-manager/api/tasks/${projectId}/${taskId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRFToken': xsrfToken,
        },
        body: JSON.stringify({
          action: 'delete'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Reload task board data to get the updated state
        await loadTaskBoardData();
      } else {
        alert('Failed to delete task: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const xsrfToken = getCSRFToken();
      const response = await fetch(`/collab-manager/api/tasks/${projectId}/${taskId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRFToken': xsrfToken,
        },
        body: JSON.stringify({ 
          action: 'update',
          status: newStatus 
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Reload task board data to get the updated state
        await loadTaskBoardData();
      } else {
        alert('Failed to move task: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to move task:', error);
      alert('Failed to move task. Please try again.');
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    moveTask(taskId, targetStatus);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Loading Task Board...</div>
      </div>
    );
  }

  if (!taskBoardData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Failed to load Task Board</div>
        <button onClick={onBack} style={{ marginTop: '20px', padding: '10px 20px' }}>
          Back to Project
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>Task Board</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>Project: {projectId}</p>
        </div>
        <div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            + New Task
          </button>
          <button
            onClick={onBack}
            style={{
              padding: '10px 20px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Project
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        overflowX: 'auto',
        paddingBottom: '20px'
      }}>
        {taskBoardData.columns.map(column => (
          <div
            key={column.id}
            style={{
              minWidth: '300px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              padding: '16px'
            }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: `3px solid ${column.color}`
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
                {column.title}
              </h3>
              <span style={{
                backgroundColor: column.color,
                color: '#333',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {column.tasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div style={{ minHeight: '200px' }}>
              {column.tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={setEditingTask}
                  onDelete={deleteTask}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <TaskModal
          onSave={createTask}
          onCancel={() => setShowCreateModal(false)}
          projectId={projectId}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskModal
          task={editingTask}
          onSave={updateTask}
          onCancel={() => setEditingTask(null)}
          projectId={projectId}
        />
      )}
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onDragStart }) => {
  const priorityColor = PRIORITY_COLORS[task.priority];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      style={{
        backgroundColor: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        padding: '12px',
        marginBottom: '8px',
        cursor: 'move',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      }}
    >
      {/* Task Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '14px', color: '#333', flex: 1 }}>{task.title}</h4>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => onEdit(task)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              fontSize: '12px',
              color: '#666'
            }}
            title="Edit task"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(task.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              fontSize: '12px',
              color: '#f44336'
            }}
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Task Description */}
      {task.description && (
        <p style={{ 
          margin: '0 0 8px 0', 
          fontSize: '12px', 
          color: '#666',
          lineHeight: '1.4'
        }}>
          {task.description}
        </p>
      )}

      {/* Task Meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: priorityColor
        }} />
        <span style={{ fontSize: '11px', color: '#999' }}>
          {task.priority.toUpperCase()}
        </span>
      </div>

      {/* Assignee and Due Date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#666', marginBottom: '4px' }}>
        <span>{task.assignee || 'Unassigned'}</span>
        {task.dueDate && (
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
        )}
      </div>

      {/* Collaborators */}
      {task.collaborators && task.collaborators.length > 0 && (
        <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>
          <strong>Collaborators:</strong> {task.collaborators.join(', ')}
        </div>
      )}

      {/* Links */}
      {task.links && task.links.length > 0 && (
        <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>
          <strong>Links:</strong>
          {task.links.slice(0, 2).map((link, index) => (
            <div key={index} style={{ marginLeft: '8px' }}>
              <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'none' }}>
                {link.title} ({link.type})
              </a>
            </div>
          ))}
          {task.links.length > 2 && (
            <div style={{ marginLeft: '8px', color: '#999' }}>
              +{task.links.length - 2} more...
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {task.tags.map(tag => (
            <span
              key={tag}
              style={{
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '10px'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

interface TaskModalProps {
  task?: Task;
  onSave: (taskId: string, taskData: any) => void;
  onCancel: () => void;
  projectId: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onSave, onCancel, projectId }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo' as TaskStatus,
    assignee: task?.assignee || '',
    collaborators: task?.collaborators?.join(', ') || '',
    priority: task?.priority || 'medium' as TaskPriority,
    dueDate: task?.dueDate || '',
    tags: task?.tags.join(', ') || '',
    links: task?.links?.map(link => `${link.title}|${link.url}|${link.type}`).join('\n') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      collaborators: formData.collaborators.split(',').map(collab => collab.trim()).filter(collab => collab),
      links: formData.links.split('\n').map(line => {
        const [title, url, type] = line.split('|');
        return title && url ? { title: title.trim(), url: url.trim(), type: (type?.trim() as any) || 'other' } : null;
      }).filter(link => link),
      projectId
    };

    if (task) {
      onSave(task.id, taskData);
    } else {
      onSave('', taskData);
    }
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
        borderRadius: '8px',
        padding: '24px',
        width: '500px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ margin: '0 0 20px 0' }}>
          {task ? 'Edit Task' : 'Create New Task'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Assignee
              </label>
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
                placeholder="Enter assignee name"
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
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
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

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Collaborators
            </label>
            <input
              type="text"
              value={formData.collaborators}
              onChange={(e) => setFormData(prev => ({ ...prev, collaborators: e.target.value }))}
              placeholder="Enter collaborator names separated by commas"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Links
            </label>
            <textarea
              value={formData.links}
              onChange={(e) => setFormData(prev => ({ ...prev, links: e.target.value }))}
              placeholder="Enter links in format: Title|URL|Type (one per line)&#10;Example:&#10;GitHub Repo|https://github.com/user/repo|code&#10;Document|https://docs.example.com|document"
              rows={4}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Format: Title|URL|Type (one per line). Types: document, code, image, other
            </small>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="Enter tags separated by commas"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
