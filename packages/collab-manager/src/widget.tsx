// @ts-ignore
import React from 'react';
// @ts-ignore
import ReactDOM from 'react-dom';
// @ts-ignore
import { Widget } from '@lumino/widgets';
import { MainPage } from './MainPage';
import { ProjectWizard } from './ProjectWizard';
import { JoinProject } from './JoinProject';
import { ProjectWorkspace } from './ProjectWorkspace';
import { ProjectConfig } from './types';

type ViewType = 'main' | 'create' | 'join' | 'modify' | 'workspace';

export class CollabManagerWidget extends Widget {
  private currentView: ViewType = 'main';
  private currentProject: ProjectConfig | null = null;
  private app: any = null;

  constructor(app?: any) {
    super();
    this.app = app;
    // @ts-ignore
    this.addClass('collab-manager-widget');
    this.id = 'collab-manager';
    this.title.label = 'Collaboration Manager';
    this.title.closable = true;
    
    this.render();
  }

  private render() {
    // @ts-ignore
    const container = this.node;
    container.innerHTML = '';
    
    let content;
    
    switch (this.currentView) {
      case 'main':
        content = React.createElement(MainPage, {
          onCreateProject: () => this.showCreateProject(),
          onJoinProject: () => this.showJoinProject(),
          onModifyProject: () => this.showModifyProject()
        });
        break;
      case 'create':
        content = React.createElement(ProjectWizard, {
          mode: 'create',
          onBack: () => this.showMain(),
          onProjectCreated: (project: ProjectConfig) => this.showWorkspace(project)
        });
        break;
      case 'join':
        content = React.createElement(JoinProject, {
          onBack: () => this.showMain(),
          onProjectJoined: (project: ProjectConfig) => this.showWorkspace(project)
        });
        break;
      case 'modify':
        content = React.createElement(ProjectWizard, {
          mode: 'modify',
          onBack: () => this.showMain(),
          onProjectModified: (project: ProjectConfig) => this.showWorkspace(project)
        });
        break;
      case 'workspace':
        if (this.currentProject) {
          content = React.createElement(ProjectWorkspace, {
            project: this.currentProject,
            onBack: () => this.showMain(),
            onModuleClick: (moduleId: string) => this.handleModuleClick(moduleId)
          });
        } else {
          content = React.createElement('div', { style: { padding: '20px' } }, 'No project selected');
        }
        break;
      default:
        content = React.createElement('div', { style: { padding: '20px' } }, 'Unknown view');
    }
    
    // @ts-ignore
    const reactContainer = document.createElement('div');
    ReactDOM.render(content, reactContainer);
    container.appendChild(reactContainer);
  }

  private showMain() {
    this.currentView = 'main';
    this.currentProject = null;
    this.render();
  }

  private showCreateProject() {
    this.currentView = 'create';
    this.render();
  }

  private showJoinProject() {
    this.currentView = 'join';
    this.render();
  }

  private showModifyProject() {
    this.currentView = 'modify';
    this.render();
  }

  private showWorkspace(project: ProjectConfig) {
    this.currentView = 'workspace';
    this.currentProject = project;
    this.render();
  }

  private handleModuleClick(moduleId: string) {
    if (!this.app) {
      alert('JupyterLab app not available');
      return;
    }

    // Execute corresponding commands based on module ID
    switch (moduleId) {
      case 'ideaBoard':
        // Navigate to experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'clustering':
        // Can navigate to other widgets
        this.app.commands.execute('create-vre-composer');
        break;
      case 'voting':
        this.app.commands.execute('create-vre-composer');
        break;
      case 'goalNegotiation':
        this.app.commands.execute('create-vre-composer');
        break;
      case 'teamRoles':
        this.app.commands.execute('create-vre-composer');
        break;
      case 'realtimeCoedit':
        // Real-time collaborative editing - can open a new notebook
        this.app.commands.execute('docmanager:new-untitled', { type: 'notebook' });
        break;
      case 'videoMeet':
        // Video meeting - open Video Chat extension
        try {
          this.app.commands.execute('jupyterlab-videochat:open');
        } catch (error) {
          console.error('Failed to open Video Chat:', error);
          // Fallback: try alternative command names
          try {
            this.app.commands.execute('videochat:open');
          } catch (error2) {
            console.error('Failed to open Video Chat with alternative command:', error2);
            alert('Video Chat feature is not available. Please check if the extension is properly installed.');
          }
        }
        break;
      case 'chat':
        // Chat functionality - can open a placeholder page
        alert('Chat feature is coming soon!');
        break;
      case 'sharedGlossary':
        // Shared glossary - open Knowledge Repo
        try {
          this.app.commands.execute('knowledge-repo:open');
        } catch (error) {
          console.error('Failed to open Knowledge Repo:', error);
          // Fallback: try alternative command names
          try {
            this.app.commands.execute('knowledge-repo:launch');
          } catch (error2) {
            console.error('Failed to open Knowledge Repo with alternative command:', error2);
            alert('Knowledge Repo feature is not available. Please check if the extension is properly installed.');
          }
        }
        break;
      case 'onboardingDocs':
        // Onboarding docs - can open a placeholder page
        alert('Onboarding Docs feature is coming soon!');
        break;
      case 'fileShare':
        // File sharing - open File Browser widget
        try {
          // Try to activate the file browser widget by ID
          this.app.shell.activateById('filebrowser');
        } catch (error) {
          console.error('Failed to open File Browser:', error);
          // Fallback: try alternative widget IDs
          try {
            this.app.shell.activateById('jp-property-inspector');
          } catch (error2) {
            console.error('Failed to open File Browser with alternative ID:', error2);
            alert('File Browser feature is not available. Please check if the extension is properly installed.');
          }
        }
        break;
      case 'gitIntegration':
        // Git integration - open Git widget
        try {
          // Try to activate the git widget by ID
          this.app.shell.activateById('jp-git-sessions');
        } catch (error) {
          console.error('Failed to open Git extension:', error);
          // Fallback: try alternative widget IDs
          try {
            this.app.shell.activateById('git-sessions');
          } catch (error2) {
            console.error('Failed to open Git with alternative ID:', error2);
            alert('Git extension is not available. Please check if jupyterlab-git is properly installed.');
          }
        }
        break;
      case 'githubIntegration':
        // GitHub integration - open GitHub widget
        try {
          // Try to activate the GitHub widget by ID
          this.app.shell.activateById('github-file-browser');
        } catch (error) {
          console.error('Failed to open GitHub extension:', error);
          // Fallback: try alternative widget IDs
          // try {
          //   this.app.shell.activateById('github-panel');
          // } catch (error2) {
          //   console.error('Failed to open GitHub with alternative ID:', error2);
          //   alert('GitHub extension is not available. Please check if jupyterlab-github is properly installed.');
          // }
        }
        break;
      case 'taskBoard':
        // Task board - can open experiment manager
        alert('This feature is coming soon!');
        break;
      case 'workflowMap':
        // Workflow map - can open experiment manager
        alert('This feature is coming soon!');
        break;
      case 'sprint':
        // Sprint management - can open experiment manager
        alert('This feature is coming soon!');
        break;
      case 'liveProgress':
        // Live progress - can open experiment manager
        alert('This feature is coming soon!');
        break;
      case 'phaseStruct':
        // Phase structure - can open experiment manager
        alert('This feature is coming soon!');
        break;
      case 'scopedWorkspaces':
        // Scoped workspaces - can open file browser
        alert('This feature is coming soon!');
        break;
      case 'crossGroupDash':
        // Cross-group dashboard - can open experiment manager
        alert('This feature is coming soon!');
        break;
      case 'integrationSchedule':
        // Integration schedule - can open experiment manager
        alert('This feature is coming soon!');
        break;
      case 'taskReassign':
        // Task reassignment - can open experiment manager
        alert('This feature is coming soon!');
        break;
      case 'inlineComment':
        // Inline comments - can open a placeholder page
        alert('Inline Comments feature is coming soon!');
        break;
      case 'versionThread':
        // Version discussion - can open a placeholder page
        alert('Version Thread feature is coming soon!');
        break;
      case 'activityFeed':
        // Activity feed - can open a placeholder page
        alert('Activity Feed feature is coming soon!');
        break;
      case 'contribAttribution':
        // Contribution attribution - can open a placeholder page
        alert('Contribution Attribution feature is coming soon!');
        break;
      case 'projectOverview':
        // Project overview - can open experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'exportReport':
        // Export report - can open a placeholder page
        alert('Export Report feature is coming soon!');
        break;
      case 'metadataTemplates':
        // Metadata templates - can open a placeholder page
        alert('Metadata Templates feature is coming soon!');
        break;
      case 'auditTrails':
        // Audit trails - can open a placeholder page
        alert('Audit Trails feature is coming soon!');
        break;
      case 'openDataSharing':
        // Open data sharing - can open a placeholder page
        alert('Open Data Sharing feature is coming soon!');
        break;
      case 'visualizationDashboard':
        // Visualization dashboard - can open experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'provenanceExplorer':
        // Provenance explorer - can open a placeholder page
        alert('Provenance Explorer feature is coming soon!');
        break;
      case 'rolePermission':
        // Role permissions - can open a placeholder page
        alert('Role & Permission feature is coming soon!');
        break;
      case 'accessControl':
        // Access control - can open a placeholder page
        alert('Access Control feature is coming soon!');
        break;
      case 'referenceManager':
        // Reference manager - can open a placeholder page
        alert('Reference Manager feature is coming soon!');
        break;
      case 'notebookSearch':
        // Notebook search - open notebook search widget
        try {
          // Try to activate the notebook search widget by ID
          const notebookSearchId = 'lifewatch/notebook-search';
          this.app.shell.activateById(notebookSearchId);
        } catch (error) {
          console.error('Failed to open Notebook Search:', error);
          // Fallback: try alternative widget IDs
          try {
            this.app.shell.activateById('notebook-search');
          } catch (error2) {
            console.error('Failed to open Notebook Search with alternative ID:', error2);
            alert('Notebook Search feature is not available. Please check if the extension is properly installed.');
          }
        }
        break;
      case 'datasetSearch':
        // Dataset search - open dataset search widget
        try {
          // Try to activate the dataset search widget by ID
          this.app.shell.activateById('lifewatch/dataset-search');
        } catch (error) {
          console.error('Failed to open Dataset Search:', error);
          // Fallback: try alternative widget IDs
          try {
            this.app.shell.activateById('dataset-search');
          } catch (error2) {
            console.error('Failed to open Dataset Search with alternative ID:', error2);
            alert('Dataset Search feature is not available. Please check if the extension is properly installed.');
          }
        }
        break;
      case 'workflowBuilder':
        // Workflow builder - can open experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'componentContainerizer':
        // Component containerizer - open component containerizer widget
        try {
          // Try to activate the component containerizer widget by ID
          this.app.shell.activateById('lifewatch/panel');
        } catch (error) {
          console.error('Failed to open Component Containerizer:', error);
          // Fallback: try alternative widget IDs
          try {
            this.app.shell.activateById('containerizer');
          } catch (error2) {
            console.error('Failed to open Component Containerizer with alternative ID:', error2);
            alert('Component Containerizer feature is not available. Please check if the extension is properly installed.');
          }
        }
        break;
      default:
        alert(`Module "${moduleId}" is under construction. This feature will be available soon!`);
    }
  }
}
