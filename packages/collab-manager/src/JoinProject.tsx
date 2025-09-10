// @ts-ignore
import React, { useState } from 'react';

interface JoinProjectProps {
  onBack: () => void;
  onProjectJoined: (project: any) => void;
}

export const JoinProject: React.FC<JoinProjectProps> = ({ onBack, onProjectJoined }) => {
  const [projectId, setProjectId] = useState('');

  const handleJoinProject = async () => {
    if (!projectId.trim()) {
      alert('Please enter a Project ID');
      return;
    }

    try {
      // 获取 CSRF token
      const xsrfToken = document.querySelector('meta[name="_xsrf"]')?.getAttribute('content') || 
                       document.cookie.split('; ').find(row => row.startsWith('_xsrf='))?.split('=')[1] || '';

      const response = await fetch('/vre/collab/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRFToken': xsrfToken
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          projectId: projectId.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        alert(`Successfully joined project: ${result.project.name}`);
        onProjectJoined(result.project);
      } else {
        alert(`Failed to join project: ${result.error}`);
      }
    } catch (error) {
      console.error('Error joining project:', error);
      alert('Failed to join project. Please check the Project ID and try again.');
    }
  };

  return (
    <div style={{ 
      padding: '40px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '40px', 
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 8px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🤝</div>
          <h1 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '1.8rem' }}>
            Join Project
          </h1>
          <p style={{ color: '#666', margin: 0, lineHeight: '1.6' }}>
            Enter the Project ID to join an existing collaborative research project
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold', 
            color: '#555' 
          }}>
            Project ID
          </label>
          <input
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJoinProject()}
            style={{
              width: '100%',
              padding: '15px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="Enter Project ID (e.g., 123e4567-e89b-12d3-a456-426614174000)"
          />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={onBack}
            style={{
              flex: 1,
              padding: '15px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Back to Main
          </button>
          <button
            onClick={handleJoinProject}
            disabled={!projectId.trim()}
            style={{
              flex: 1,
              padding: '15px',
              background: !projectId.trim() ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: !projectId.trim() ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            Join Project
          </button>
        </div>

        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          background: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>How to get a Project ID?</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#666', fontSize: '14px' }}>
            <li>Ask the project creator to share the Project ID</li>
            <li>Check your email for project invitation links</li>
            <li>Look for the Project ID in project documentation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
