// @ts-ignore
import React from 'react';
// @ts-ignore
import ReactDOM from 'react-dom';
// @ts-ignore
import { Widget } from '@lumino/widgets';
import { MainPage } from './MainPage';
import { CreateProjectWizard } from './CreateProjectWizard';
import { JoinProject } from './JoinProject';
import { ProjectWorkspace } from './ProjectWorkspace';
import { ProjectConfig } from './types';

type ViewType = 'main' | 'create' | 'join' | 'workspace';

export class CollabManagerWidget extends Widget {
  private currentView: ViewType = 'main';
  private currentProject: ProjectConfig | null = null;

  constructor() {
    super();
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
          onJoinProject: () => this.showJoinProject()
        });
        break;
      case 'create':
        content = React.createElement(CreateProjectWizard, {
          onBack: () => this.showMain(),
          onProjectCreated: (project: ProjectConfig) => this.showWorkspace(project)
        });
        break;
      case 'join':
        content = React.createElement(JoinProject, {
          onBack: () => this.showMain(),
          onProjectJoined: (projectId: string) => this.showMain() // 暂时回到主页面
        });
        break;
      case 'workspace':
        if (this.currentProject) {
          content = React.createElement(ProjectWorkspace, {
            project: this.currentProject,
            onBack: () => this.showMain()
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

  private showWorkspace(project: ProjectConfig) {
    this.currentView = 'workspace';
    this.currentProject = project;
    this.render();
  }
}
