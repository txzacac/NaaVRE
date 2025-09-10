// @ts-ignore
import React, { useState } from 'react';
import { ProjectConfig, PHASES } from './types';

interface CreateProjectWizardProps {
  onBack: () => void;
  onProjectCreated: (project: ProjectConfig) => void;
}

export const CreateProjectWizard: React.FC<CreateProjectWizardProps> = ({ onBack, onProjectCreated }) => {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    owner: 'Current User', // 默认当前用户
    tags: [] as string[],
    phases: [] as string[],
    modules: [] as string[]
  });
  const [newTag, setNewTag] = useState('');

  const handleNext = () => {
    if (step < 3) {
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

  const handleCreateProject = async () => {
    try {
      // 获取 CSRF token
      const xsrfToken = document.querySelector('meta[name="_xsrf"]')?.getAttribute('content') || 
                       document.cookie.split('; ').find(row => row.startsWith('_xsrf='))?.split('=')[1] || '';

      const response = await fetch('/vre/collab/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRFToken': xsrfToken
        },
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
        alert(`Project created successfully! Project ID: ${result.project.id}`);
        onProjectCreated(result.project);
      } else {
        alert(`Failed to create project: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const renderStep1 = () => (
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

  const renderStep2 = () => (
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

  const renderStep3 = () => (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        Select Collaboration Modules
      </h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Choose the specific modules you want to enable for each selected phase
      </p>
      
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

  return (
    <div style={{ padding: '40px', minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Progress Bar */}
      <div style={{ maxWidth: '600px', margin: '0 auto 40px auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          {[1, 2, 3].map(stepNum => (
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
              width: `${(step / 3) * 100}%`,
              borderRadius: '2px',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      {/* Navigation Buttons */}
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
        
        {step < 3 ? (
          <button
            onClick={handleNext}
            disabled={step === 1 && !projectData.name.trim()}
            style={{
              padding: '12px 24px',
              background: step === 1 && !projectData.name.trim() ? '#ccc' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: step === 1 && !projectData.name.trim() ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleCreateProject}
            style={{
              padding: '12px 24px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Create Project
          </button>
        )}
      </div>
    </div>
  );
};
