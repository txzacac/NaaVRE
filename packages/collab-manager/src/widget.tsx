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
        // Video meeting - can open a placeholder page
        alert('Video Meeting feature is coming soon!');
        break;
      case 'chat':
        // Chat functionality - can open a placeholder page
        alert('Chat feature is coming soon!');
        break;
      case 'sharedGlossary':
        // Shared glossary - can open a placeholder page
        alert('Shared Glossary feature is coming soon!');
        break;
      case 'onboardingDocs':
        // Onboarding docs - can open a placeholder page
        alert('Onboarding Docs feature is coming soon!');
        break;
      case 'fileShare':
        // File sharing - can open file browser
        this.app.commands.execute('filebrowser:open');
        break;
      case 'gitIntegration':
        // Git integration - can open file browser
        this.app.commands.execute('filebrowser:open');
        break;
      case 'taskBoard':
        // Task board - can open experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'workflowMap':
        // Workflow map - can open experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'sprint':
        // Sprint management - can open experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'liveProgress':
        // Live progress - can open experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'phaseStruct':
        // Phase structure - can open experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'scopedWorkspaces':
        // Scoped workspaces - can open file browser
        this.app.commands.execute('filebrowser:open');
        break;
      case 'crossGroupDash':
        // Cross-group dashboard - can open experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'integrationSchedule':
        // Integration schedule - can open experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'taskReassign':
        // Task reassignment - can open experiment manager
        this.app.commands.execute('create-vre-composer');
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
      case 'searchDiscovery':
        // Search discovery - can open a placeholder page
        alert('Search & Discovery feature is coming soon!');
        break;
      case 'workflowBuilder':
        // Workflow builder - can open experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      default:
        alert(`Module "${moduleId}" is under construction. This feature will be available soon!`);
    }
  }
}
