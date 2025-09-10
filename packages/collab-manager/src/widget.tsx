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
          onProjectJoined: (project: ProjectConfig) => this.showWorkspace(project)
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

    // 根据模块 ID 执行相应的命令
    switch (moduleId) {
      case 'ideaBoard':
        // 跳转到 experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'clustering':
        // 可以跳转到其他 widget
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
        // 实时协作编辑 - 可以打开一个新的 notebook
        this.app.commands.execute('docmanager:new-untitled', { type: 'notebook' });
        break;
      case 'videoMeet':
        // 视频会议 - 可以打开一个占位页面
        alert('Video Meeting feature is coming soon!');
        break;
      case 'chat':
        // 聊天功能 - 可以打开一个占位页面
        alert('Chat feature is coming soon!');
        break;
      case 'sharedGlossary':
        // 共享词汇表 - 可以打开一个占位页面
        alert('Shared Glossary feature is coming soon!');
        break;
      case 'onboardingDocs':
        // 入门文档 - 可以打开一个占位页面
        alert('Onboarding Docs feature is coming soon!');
        break;
      case 'fileShare':
        // 文件共享 - 可以打开文件浏览器
        this.app.commands.execute('filebrowser:open');
        break;
      case 'taskBoard':
        // 任务看板 - 可以打开 experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'workflowMap':
        // 工作流地图 - 可以打开 experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'sprint':
        // 冲刺管理 - 可以打开 experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'liveProgress':
        // 实时进度 - 可以打开 experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'phaseStruct':
        // 阶段结构 - 可以打开 experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'scopedWorkspaces':
        // 作用域工作区 - 可以打开文件浏览器
        this.app.commands.execute('filebrowser:open');
        break;
      case 'crossGroupDash':
        // 跨组仪表板 - 可以打开 experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'integrationSchedule':
        // 集成计划 - 可以打开 experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'taskReassign':
        // 任务重新分配 - 可以打开 experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'inlineComment':
        // 内联评论 - 可以打开一个占位页面
        alert('Inline Comments feature is coming soon!');
        break;
      case 'versionThread':
        // 版本讨论 - 可以打开一个占位页面
        alert('Version Thread feature is coming soon!');
        break;
      case 'activityFeed':
        // 活动动态 - 可以打开一个占位页面
        alert('Activity Feed feature is coming soon!');
        break;
      case 'contribAttribution':
        // 贡献归属 - 可以打开一个占位页面
        alert('Contribution Attribution feature is coming soon!');
        break;
      case 'projectOverview':
        // 项目概览 - 可以打开 experiment manager
        this.app.commands.execute('create-vre-composer');
        break;
      case 'exportReport':
        // 导出报告 - 可以打开一个占位页面
        alert('Export Report feature is coming soon!');
        break;
      case 'artifactRegistry':
        // 制品注册表 - 可以打开一个占位页面
        alert('Artifact Registry feature is coming soon!');
        break;
      default:
        alert(`Module "${moduleId}" is under construction. This feature will be available soon!`);
    }
  }
}
