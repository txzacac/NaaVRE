// @ts-ignore
import React from 'react';
import { ProjectConfig, PHASES } from './types';

interface ProjectWorkspaceProps {
  project: ProjectConfig;
  onBack: () => void;
  onModuleClick: (moduleId: string) => void;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ project, onBack, onModuleClick }) => {
  // Define which modules are under construction
  const modulesUnderConstruction = new Set([
    // Ideation & Planning
    'ideaBoard',
    'clustering',
    'voting',
    'goalNegotiation',
    'teamRoles',
    'phaseStruct',
    
    // Collaboration & Content Co-production
    'realtimeCoedit',
    'chat',
    'onboardingDocs',
    // Note: 'videoMeet', 'sharedGlossary', 'fileShare', 'gitIntegration', 'githubIntegration' are removed because they're now functional
    
    // Workflow Tracking & Task Coordination
    'taskBoard',
    'workflowMap',
    'sprint',
    'liveProgress',
    'scopedWorkspaces',
    'crossGroupDash',
    'integrationSchedule',
    'taskReassign',
    
    // Review & Feedback
    'inlineComment',
    'versionThread',
    'activityFeed',
    'contribAttribution',
    
    // Finalization & Dissemination
    'metadataTemplates',
    'auditTrails',
    'projectOverview',
    'openDataSharing',
    'visualizationDashboard',
    'provenanceExplorer',
    
    // Cross-phase Infrastructure
    'rolePermission',
    'accessControl',
    'referenceManager'
    // Note: 'notebookSearch', 'datasetSearch', 'workflowBuilder', 'componentContainerizer' are removed because they're now functional
  ]);

  const getPhaseModules = (phaseId: string) => {
    const phase = PHASES.find(p => p.id === phaseId);
    return phase ? phase.modules.filter(m => project.modules.includes(m.id)) : [];
  };

  const handleModuleClick = (moduleId: string) => {
    onModuleClick(moduleId);
  };

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '30px', 
        marginBottom: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '2rem' }}>
              {project.name}
            </h1>
            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '1.1rem' }}>
              {project.description || 'No description provided'}
            </p>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <span style={{ color: '#888', fontSize: '14px' }}>
                Project ID: <strong>{project.id}</strong>
              </span>
              <span style={{ color: '#888', fontSize: '14px' }}>
                Owner: <strong>{project.owner}</strong>
              </span>
            </div>
          </div>
          <button
            onClick={onBack}
            style={{
              padding: '10px 20px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Back to Main
          </button>
        </div>
        
        {project.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {project.tags.map(tag => (
              <span
                key={tag}
                style={{
                  background: '#e3f2fd',
                  color: '#1976d2',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Modules by Phase */}
      <div style={{ display: 'grid', gap: '30px' }}>
        {project.phases.map(phaseId => {
          const phase = PHASES.find(p => p.id === phaseId);
          const modules = getPhaseModules(phaseId);
          
          if (!phase || modules.length === 0) return null;

          return (
            <div key={phaseId} style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '30px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ 
                margin: '0 0 20px 0', 
                color: '#333', 
                fontSize: '1.5rem',
                borderBottom: '2px solid #667eea',
                paddingBottom: '10px'
              }}>
                {phase.name}
              </h2>
              <p style={{ margin: '0 0 25px 0', color: '#666' }}>
                {phase.description}
              </p>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '20px' 
              }}>
                {modules.map(module => (
                  <div
                    key={module.id}
                    onClick={() => handleModuleClick(module.id)}
                    style={{
                      border: '2px solid #ddd',
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                      e.currentTarget.style.borderColor = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#ddd';
                    }}
                  >
                    {modulesUnderConstruction.has(module.id) && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '10px', 
                        right: '10px',
                        background: '#ffc107',
                        color: '#333',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        UNDER CONSTRUCTION
                      </div>
                    )}
                    
                    <h3 style={{ 
                      margin: '0 0 10px 0', 
                      color: '#333', 
                      fontSize: '1.1rem',
                      fontWeight: '600'
                    }}>
                      {module.name}
                    </h3>
                    <p style={{ 
                      margin: '0 0 15px 0', 
                      color: '#666', 
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}>
                      {module.description}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      color: '#667eea',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      <span>Click to access</span>
                      <span style={{ marginLeft: '8px' }}>→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {project.phases.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📋</div>
          <h3 style={{ color: '#333', marginBottom: '10px' }}>No Phases Selected</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            This project doesn't have any research phases configured yet.
          </p>
          <button
            onClick={onBack}
            style={{
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Go Back and Configure
          </button>
        </div>
      )}
    </div>
  );
};
