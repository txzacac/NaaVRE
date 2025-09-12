// @ts-ignore
import React, { useState } from 'react';

interface MainPageProps {
  onCreateProject: () => void;
  onJoinProject: () => void;
  onModifyProject: () => void;
}

export const MainPage: React.FC<MainPageProps> = ({ onCreateProject, onJoinProject, onModifyProject }) => {
  return (
    <div style={{ 
      padding: '40px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: '30px',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ textAlign: 'center', color: 'white', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', fontWeight: '300' }}>
          Collaboration Manager
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, margin: 0 }}>
          Choose how you want to start your collaborative research project
        </p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '30px',
        width: '100%',
        maxWidth: '1200px'
      }}>
        {/* Create Project Card */}
        <div 
          onClick={onCreateProject}
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '2px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
            e.currentTarget.style.borderColor = '#667eea';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🚀</div>
          <h2 style={{ color: '#333', margin: '0 0 15px 0', fontSize: '1.5rem' }}>
            Create Project
          </h2>
          <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
            Start a new collaborative research project. Configure phases, modules, and invite team members.
          </p>
        </div>

        {/* Join Project Card */}
        <div 
          onClick={onJoinProject}
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '2px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
            e.currentTarget.style.borderColor = '#667eea';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🤝</div>
          <h2 style={{ color: '#333', margin: '0 0 15px 0', fontSize: '1.5rem' }}>
            Join Project
          </h2>
          <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
            Join an existing project using a Project ID. Get instant access to configured collaboration tools.
          </p>
        </div>

        {/* Modify Project Card */}
        <div 
          onClick={onModifyProject}
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '2px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
            e.currentTarget.style.borderColor = '#667eea';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚙️</div>
          <h2 style={{ color: '#333', margin: '0 0 15px 0', fontSize: '1.5rem' }}>
            Modify Project
          </h2>
          <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
            Update an existing project configuration. Change phases, modules, and other project settings.
          </p>
        </div>
      </div>
    </div>
  );
};
