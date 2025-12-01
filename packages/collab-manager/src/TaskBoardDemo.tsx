import React from 'react';

interface TaskBoardDemoProps {
  onBack: () => void;
}

export const TaskBoardDemo: React.FC<TaskBoardDemoProps> = ({ onBack }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Task Board Demo</h1>
      <p>This is a demonstration of the Task Board functionality.</p>
      <p>Features include:</p>
      <ul>
        <li>✅ Kanban-style task board with 4 columns: To Do, In Progress, Review, Done</li>
        <li>✅ Drag and drop functionality to move tasks between columns</li>
        <li>✅ Create, edit, and delete tasks</li>
        <li>✅ Task properties: title, description, assignee, priority, due date, tags</li>
        <li>✅ Priority indicators with color coding</li>
        <li>✅ Real-time data persistence with backend API</li>
        <li>✅ Responsive design with modern UI</li>
      </ul>
      
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={onBack}
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
          Back to Main
        </button>
        <button
          onClick={() => window.open('http://localhost:8888/lab', '_blank')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Open JupyterLab
        </button>
      </div>
    </div>
  );
};
