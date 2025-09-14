// @ts-ignore
import React, { useState, useEffect } from 'react';
import { ProjectConfig, PHASES } from './types';
import { PageConfig } from '@jupyterlab/coreutils';

interface ProjectWizardProps {
  mode: 'create' | 'modify';
  onBack: () => void;
  onProjectCreated?: (project: ProjectConfig) => void;
  onProjectModified?: (project: ProjectConfig) => void;
  initialProjectId?: string;
}

export const ProjectWizard: React.FC<ProjectWizardProps> = ({ 
  mode, 
  onBack, 
  onProjectCreated, 
  onProjectModified,
  initialProjectId 
}) => {
  const [step, setStep] = useState(1);
  const [projectId, setProjectId] = useState(initialProjectId || '');
  // const [loading, setLoading] = useState(false);
  const [projectData, setProjectData] = useState({
    id: '',
    name: '',
    description: '',
    owner: mode === 'create' ? 'Current User' : '',
    tags: [] as string[],
    phases: [] as string[],
    modules: [] as string[]
  });
  const [newTag, setNewTag] = useState('');

  // Calculate total steps
  const totalSteps = mode === 'create' ? 3 : 4;
  const isModifyMode = mode === 'modify';

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handlePhaseToggle = (phaseId: string) => {
    setProjectData(prev => ({
      ...prev,
      phases: prev.phases.includes(phaseId)
        ? prev.phases.filter(id => id !== phaseId)
        : [...prev.phases, phaseId]
    }));
  };

  const handleModuleToggle = (moduleId: string) => {
    setProjectData(prev => ({
      ...prev,
      modules: prev.modules.includes(moduleId)
        ? prev.modules.filter(id => id !== moduleId)
        : [...prev.modules, moduleId]
    }));
  };

  const handleSelectAllModules = () => {
    const allModules = PHASES
      .filter(phase => projectData.phases.includes(phase.id))
      .flatMap(phase => phase.modules.map(module => module.id));
    
    setProjectData(prev => ({
      ...prev,
      modules: allModules
    }));
  };

  const handleDeselectAllModules = () => {
    setProjectData(prev => ({
      ...prev,
      modules: []
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !projectData.tags.includes(newTag.trim())) {
      setProjectData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setProjectData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const loadProject = async () => {
    if (!projectId.trim()) {
      alert('Please enter a Project ID');
      return;
    }

    // setLoading(true);
    // const startTime = Date.now();
    // const minLoadingTime = 1500; // 1.5 seconds minimum loading time for loading project
    
    try {
      const baseUrl = PageConfig.getBaseUrl();
      const token = PageConfig.getToken();
      
      const authHeaders = {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${baseUrl}vre/collab/projects`, {
        method: 'GET',
        headers: authHeaders,
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        const project = result.projects.find((p: any) => p.id === projectId.trim());
        
        if (project) {
          setProjectData({
            id: project.id,
            name: project.name,
            description: project.description || '',
            owner: project.owner,
            tags: project.tags || [],
            phases: project.phases || [],
            modules: project.modules || []
          });
          setStep(2); // Move to step 2 after loading
        } else {
          alert('Project not found. Please check the Project ID and try again.');
        }
      } else {
        alert(`Failed to load projects: ${result.error}`);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      alert('Failed to load project. Please check the Project ID and try again.');
    } finally {
      // setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    // setLoading(true);
    // const startTime = Date.now();
    // const minLoadingTime = 2000; // 2 seconds minimum loading time
    
    try {
      const baseUrl = PageConfig.getBaseUrl();
      const token = PageConfig.getToken();
      
      // Get CSRF token - try multiple methods
      let xsrfToken = '';
      try {
        // Method 1: Try to get from meta tag
        const metaTag = document.querySelector('meta[name="_xsrf"]');
        if (metaTag) {
          xsrfToken = metaTag.getAttribute('content') || '';
        }
        
        // Method 2: Try to get from cookies
        if (!xsrfToken) {
          const cookies = document.cookie.split(';');
          for (const cookie of cookies) {
            const trimmed = cookie.trim();
            if (trimmed.startsWith('_xsrf=')) {
              xsrfToken = trimmed.split('=')[1];
              break;
            }
          }
        }
        
        // Method 3: Try to get from JupyterLab's PageConfig
        if (!xsrfToken) {
          // @ts-ignore - PageConfig might have xsrf token
          xsrfToken = PageConfig.getOption('xsrfToken') || '';
        }
        
        console.log('CSRF Token obtained:', xsrfToken ? 'Yes' : 'No');
      } catch (e) {
        console.warn('Could not get CSRF token:', e);
      }
      
      const authHeaders = {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'X-XSRFToken': xsrfToken
      };

      const response = await fetch(`${baseUrl}vre/collab/projects`, {
        method: 'POST',
        headers: authHeaders,
        credentials: 'same-origin',
        body: JSON.stringify({
          name: projectData.name,
          description: projectData.description,
          owner: projectData.owner,
          tags: projectData.tags,
          phases: projectData.phases,
          modules: projectData.modules
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        alert(`Project created successfully! \n Project ID: ${result.project.id}`);
        onProjectCreated?.(result.project);
      } else {
        alert(`Failed to create project: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      // setLoading(false);
    }
  };

  const handleUpdateProject = async () => {
    // setLoading(true);
    // const startTime = Date.now();
    // const minLoadingTime = 2000; // 2 seconds minimum loading time
    
    try {
      if (!projectData.id.trim()) {
        alert('Project ID missing. Load a project first.');
        return;
      }

      const baseUrl = PageConfig.getBaseUrl();
      const token = PageConfig.getToken();
      
      // Get CSRF token - try multiple methods
      let xsrfToken = '';
      try {
        // Method 1: Try to get from meta tag
        const metaTag = document.querySelector('meta[name="_xsrf"]');
        if (metaTag) {
          xsrfToken = metaTag.getAttribute('content') || '';
        }
        
        // Method 2: Try to get from cookies
        if (!xsrfToken) {
          const cookies = document.cookie.split(';');
          for (const cookie of cookies) {
            const trimmed = cookie.trim();
            if (trimmed.startsWith('_xsrf=')) {
              xsrfToken = trimmed.split('=')[1];
              break;
            }
          }
        }
        
        // Method 3: Try to get from JupyterLab's PageConfig
        if (!xsrfToken) {
          // @ts-ignore - PageConfig might have xsrf token
          xsrfToken = PageConfig.getOption('xsrfToken') || '';
        }
        
        console.log('CSRF Token obtained:', xsrfToken ? 'Yes' : 'No');
      } catch (e) {
        console.warn('Could not get CSRF token:', e);
      }
      
      const authHeaders = {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'X-XSRFToken': xsrfToken
      };

      const response = await fetch(`${baseUrl}vre/collab/projects`, {
        method: 'POST',
        headers: authHeaders,
        credentials: 'same-origin',
        body: JSON.stringify({
          _action: 'update',
          id: projectData.id,
          name: projectData.name,
          description: projectData.description,
          owner: projectData.owner,
          tags: projectData.tags,
          phases: projectData.phases,
          modules: projectData.modules
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        alert('Project updated successfully!');
        onProjectModified?.(result.project);
      } else {
        alert(`Failed to update project: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    } finally {
      // setLoading(false);
    }
  };

  const renderLoadProjectStep = () => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        Load Project to Modify
      </h2>
      
      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
          Project ID *
        </label>
        <input
          type="text"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && loadProject()}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px'
          }}
          placeholder="Enter Project ID (e.g., 8d614f6b-2660-4715-8647-b3e97e5db24b)"
        />
      </div>

      <div style={{ display: 'flex', gap: '15px' }}>
        <button
          onClick={onBack}
          style={{
            flex: 1,
            padding: '12px 24px',
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
          onClick={loadProject}
          disabled={!projectId.trim()}
          style={{
            flex: 1,
            padding: '12px 24px',
            background: !projectId.trim() ? '#ccc' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: !projectId.trim() ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          Load Project
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
          <li>Check your project list in the workspace</li>
          <li>Ask the project owner to share the Project ID</li>
          <li>Look for the Project ID in project documentation</li>
        </ul>
      </div>
    </div>
  );

  const renderBasicInfoStep = () => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        Basic Information
      </h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
          Project Name *
        </label>
        <input
          type="text"
          value={projectData.name}
          onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px'
          }}
          placeholder="Enter project name"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
          Description
        </label>
        <textarea
          value={projectData.description}
          onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px',
            minHeight: '100px',
            resize: 'vertical'
          }}
          placeholder="Enter project description (optional)"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
          Project Owner
        </label>
        <input
          type="text"
          value={projectData.owner}
          onChange={(e) => setProjectData(prev => ({ ...prev, owner: e.target.value }))}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '16px'
          }}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
          Tags
        </label>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            style={{
              flex: 1,
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
            placeholder="Add a tag"
          />
          <button
            onClick={addTag}
            style={{
              padding: '12px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Add
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {projectData.tags.map(tag => (
            <span
              key={tag}
              style={{
                background: '#e3f2fd',
                color: '#1976d2',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1976d2',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPhasesStep = () => (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        Select Research Phases
      </h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Choose the research phases that will be part of your project
      </p>
      
      <div style={{ display: 'grid', gap: '20px' }}>
        {PHASES.map(phase => (
          <div
            key={phase.id}
            onClick={() => handlePhaseToggle(phase.id)}
            style={{
              border: `2px solid ${projectData.phases.includes(phase.id) ? '#667eea' : '#ddd'}`,
              borderRadius: '12px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: projectData.phases.includes(phase.id) ? '#f8f9ff' : 'white'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <input
                type="checkbox"
                checked={projectData.phases.includes(phase.id)}
                onChange={() => {}}
                style={{ transform: 'scale(1.2)' }}
              />
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{phase.name}</h3>
                <p style={{ margin: 0, color: '#666' }}>{phase.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderModulesStep = () => {
    const allAvailableModules = PHASES
      .filter(phase => projectData.phases.includes(phase.id))
      .flatMap(phase => phase.modules.map(module => module.id));
    
    const allSelected = allAvailableModules.length > 0 && 
      allAvailableModules.every(moduleId => projectData.modules.includes(moduleId));
    
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          Select Collaboration Modules
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
          Choose the specific modules you want to enable for each selected phase
        </p>
        
        {/* Select All / Deselect All buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '15px', 
          marginBottom: '30px' 
        }}>
          <button
            onClick={handleSelectAllModules}
            disabled={allAvailableModules.length === 0}
            style={{
              padding: '10px 20px',
              background: allSelected ? '#4caf50' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: allAvailableModules.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              opacity: allAvailableModules.length === 0 ? 0.5 : 1
            }}
          >
            {allSelected ? 'All Selected' : 'Select All'}
          </button>
          <button
            onClick={handleDeselectAllModules}
            disabled={projectData.modules.length === 0}
            style={{
              padding: '10px 20px',
              background: projectData.modules.length === 0 ? '#ccc' : '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: projectData.modules.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              opacity: projectData.modules.length === 0 ? 0.5 : 1
            }}
          >
            Deselect All
          </button>
        </div>
        
        <div style={{ display: 'grid', gap: '30px' }}>
        {PHASES.filter(phase => projectData.phases.includes(phase.id)).map(phase => (
          <div key={phase.id} style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
              {phase.name}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              {phase.modules.map(module => (
                <label
                  key={module.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px',
                    border: `1px solid ${projectData.modules.includes(module.id) ? '#667eea' : '#ddd'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: projectData.modules.includes(module.id) ? '#f8f9ff' : 'white'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={projectData.modules.includes(module.id)}
                    onChange={() => handleModuleToggle(module.id)}
                    style={{ marginTop: '2px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
                      {module.name}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {module.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>
    );
  };

  const getStepContent = () => {
    if (isModifyMode) {
      switch (step) {
        case 1: return renderLoadProjectStep();
        case 2: return renderBasicInfoStep();
        case 3: return renderPhasesStep();
        case 4: return renderModulesStep();
        default: return null;
      }
    } else {
      switch (step) {
        case 1: return renderBasicInfoStep();
        case 2: return renderPhasesStep();
        case 3: return renderModulesStep();
        default: return null;
      }
    }
  };

  const canProceed = () => {
    if (isModifyMode) {
      switch (step) {
        case 1: return projectId.trim() !== '';
        case 2: return projectData.name.trim() !== '';
        case 3: return projectData.phases.length > 0;
        case 4: return true;
        default: return false;
      }
    } else {
      switch (step) {
        case 1: return projectData.name.trim() !== '';
        case 2: return projectData.phases.length > 0;
        case 3: return true;
        default: return false;
      }
    }
  };

  const getButtonText = () => {
    if (isModifyMode) {
      return step === totalSteps ? 'Update Project' : 'Next';
    } else {
      return step === totalSteps ? 'Create Project' : 'Next';
    }
  };

  const handleSubmit = () => {
    if (isModifyMode) {
      handleUpdateProject();
    } else {
      handleCreateProject();
    }
  };

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#f8f9fa', position: 'relative' }}>
      {/* Loading Overlay */}
      {/* Loading overlay removed */}
      {/* Progress Bar */}
      <div style={{ maxWidth: '600px', margin: '0 auto 40px auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map(stepNum => (
            <div
              key={stepNum}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: step >= stepNum ? '#667eea' : '#ddd',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}
            >
              {stepNum}
            </div>
          ))}
        </div>
        <div style={{ background: '#ddd', height: '4px', borderRadius: '2px' }}>
          <div
            style={{
              background: '#667eea',
              height: '100%',
              width: `${(step / totalSteps) * 100}%`,
              borderRadius: '2px',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Step Content */}
      {getStepContent()}

      {/* Navigation Buttons - Hide on Load Project step in modify mode */}
      {!(isModifyMode && step === 1) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', maxWidth: '600px', margin: '40px auto 0 auto' }}>
          <button
            onClick={step === 1 ? onBack : handleBack}
            style={{
              padding: '12px 24px',
              background: step === 1 ? '#6c757d' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {step === 1 ? 'Back to Main' : 'Previous'}
          </button>
          
          {step < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              style={{
                padding: '12px 24px',
                background: !canProceed() ? '#ccc' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: !canProceed() ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={false}
              style={{
                padding: '12px 24px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                opacity: 1
              }}
            >
              {getButtonText()}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
