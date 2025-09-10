export interface ProjectConfig {
  id: string;
  name: string;
  description?: string;
  owner: string;
  tags: string[];
  phases: string[];
  modules: string[];
  createdAt: string;
}

export interface Phase {
  id: string;
  name: string;
  description: string;
  modules: Module[];
}

export interface Module {
  id: string;
  name: string;
  description: string;
  phase: string;
}

export const PHASES: Phase[] = [
  {
    id: 'ideation-planning',
    name: 'Ideation & Planning',
    description: '头脑风暴、目标对齐等',
    modules: [
      { id: 'ideaBoard', name: 'Idea Board', description: '创意收集板', phase: 'ideation-planning' },
      { id: 'clustering', name: 'Clustering', description: '想法聚类', phase: 'ideation-planning' },
      { id: 'voting', name: 'Voting', description: '投票决策', phase: 'ideation-planning' },
      { id: 'goalNegotiation', name: 'Goal Negotiation', description: '目标协商', phase: 'ideation-planning' },
      { id: 'teamRoles', name: 'Team Roles', description: '团队角色分配', phase: 'ideation-planning' }
    ]
  },
  {
    id: 'collaboration-coproduction',
    name: 'Collaboration & Co-production',
    description: '实时协作、共享词汇表等',
    modules: [
      { id: 'realtimeCoedit', name: 'Real-time Co-editing', description: '实时协作编辑', phase: 'collaboration-coproduction' },
      { id: 'videoMeet', name: 'Video Meeting', description: '视频会议', phase: 'collaboration-coproduction' },
      { id: 'chat', name: 'Chat', description: '即时聊天', phase: 'collaboration-coproduction' },
      { id: 'sharedGlossary', name: 'Shared Glossary', description: '共享词汇表', phase: 'collaboration-coproduction' },
      { id: 'onboardingDocs', name: 'Onboarding Docs', description: '入门文档', phase: 'collaboration-coproduction' },
      { id: 'fileShare', name: 'File Share', description: '文件共享', phase: 'collaboration-coproduction' }
    ]
  },
  {
    id: 'workflow-tracking',
    name: 'Workflow Tracking & Task Coordination',
    description: '任务面板、进度追踪等',
    modules: [
      { id: 'taskBoard', name: 'Task Board', description: '任务看板', phase: 'workflow-tracking' },
      { id: 'workflowMap', name: 'Workflow Map', description: '工作流地图', phase: 'workflow-tracking' },
      { id: 'sprint', name: 'Sprint', description: '冲刺管理', phase: 'workflow-tracking' },
      { id: 'liveProgress', name: 'Live Progress', description: '实时进度', phase: 'workflow-tracking' },
      { id: 'phaseStruct', name: 'Phase Structure', description: '阶段结构', phase: 'workflow-tracking' },
      { id: 'scopedWorkspaces', name: 'Scoped Workspaces', description: '作用域工作区', phase: 'workflow-tracking' },
      { id: 'crossGroupDash', name: 'Cross-group Dashboard', description: '跨组仪表板', phase: 'workflow-tracking' },
      { id: 'integrationSchedule', name: 'Integration Schedule', description: '集成计划', phase: 'workflow-tracking' },
      { id: 'taskReassign', name: 'Task Reassignment', description: '任务重新分配', phase: 'workflow-tracking' }
    ]
  },
  {
    id: 'review-feedback',
    name: 'Review & Feedback',
    description: '评论、版本追踪、贡献归属等',
    modules: [
      { id: 'inlineComment', name: 'Inline Comments', description: '内联评论', phase: 'review-feedback' },
      { id: 'versionThread', name: 'Version Thread', description: '版本讨论', phase: 'review-feedback' },
      { id: 'activityFeed', name: 'Activity Feed', description: '活动动态', phase: 'review-feedback' },
      { id: 'contribAttribution', name: 'Contribution Attribution', description: '贡献归属', phase: 'review-feedback' },
      { id: 'projectOverview', name: 'Project Overview', description: '项目概览', phase: 'review-feedback' }
    ]
  },
  {
    id: 'dissemination-finalization',
    name: 'Dissemination & Finalization',
    description: '成果发布、最终化等',
    modules: [
      { id: 'exportReport', name: 'Export Report', description: '导出报告', phase: 'dissemination-finalization' },
      { id: 'artifactRegistry', name: 'Artifact Registry', description: '制品注册表', phase: 'dissemination-finalization' }
    ]
  }
];
