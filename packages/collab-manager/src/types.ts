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
    description: 'Brainstorming, goal alignment, and planning activities',
    modules: [
      { id: 'ideaBoard', name: 'Idea Board', description: 'Virtual whiteboard and sticky notes for brainstorming ideas', phase: 'ideation-planning' },
      { id: 'clustering', name: 'Clustering', description: 'Group similar ideas into thematic clusters for synthesis', phase: 'ideation-planning' },
      { id: 'voting', name: 'Voting', description: 'Voting and prioritization to help the team reach consensus', phase: 'ideation-planning' },
      { id: 'goalNegotiation', name: 'Goal Negotiation', description: 'Interface for structured goal discussion and consensus-building', phase: 'ideation-planning' },
      { id: 'teamRoles', name: 'Team Roles', description: 'Team role overview to clarify responsibilities', phase: 'ideation-planning' },
      { id: 'phaseStruct', name: 'Phase Structuring', description: 'Organize work into phases with deliverables and approval gates', phase: 'ideation-planning' }
    ]
  },
  {
    id: 'workflow-tracking',
    name: 'Workflow Tracking & Task Coordination',
    description: 'Task boards, progress tracking, and workflow coordination',
    modules: [
      { id: 'taskBoard', name: 'Task Board', description: 'Kanban-style task board to track assignments and status', phase: 'workflow-tracking' },
      { id: 'workflowMap', name: 'Workflow Map', description: 'Visual workflow map showing dependencies and transitions', phase: 'workflow-tracking' },
      { id: 'sprint', name: 'Sprint Planning', description: 'Agile sprint planning and iteration management', phase: 'workflow-tracking' },
      { id: 'liveProgress', name: 'Live Progress', description: 'Real-time progress tracking and priority indicators', phase: 'workflow-tracking' },
      { id: 'scopedWorkspaces', name: 'Scoped Workspaces', description: 'Private sub-group areas within a project for focused collaboration, with role-based access and integration into cross-group dashboards', phase: 'workflow-tracking' },
      { id: 'crossGroupDash', name: 'Cross-group Dashboard', description: 'Integrated dashboard combining multiple team views', phase: 'workflow-tracking' },
      { id: 'integrationSchedule', name: 'Integration Schedule', description: 'Shared calendar and scheduling tools for coordination', phase: 'workflow-tracking' },
      { id: 'taskReassign', name: 'Task Reassignment', description: 'Reassign and reconfigure tasks dynamically', phase: 'workflow-tracking' }
    ]
  },
  {
    id: 'collaboration-coproduction',
    name: 'Collaboration & Content Co-production',
    description: 'Real-time collaboration, shared glossaries, and content co-production',
    modules: [
      { id: 'realtimeCoedit', name: 'Real-time Co-editing', description: 'Collaborative editing of docs/code (supports Jupyter & manuscripts)', phase: 'collaboration-coproduction' },
      { id: 'videoMeet', name: 'Video Meeting', description: 'Integrated video conferencing', phase: 'collaboration-coproduction' },
      { id: 'chat', name: 'Chat', description: 'Instant messaging channels for quick communication', phase: 'collaboration-coproduction' },
      { id: 'sharedGlossary', name: 'Shared Glossary', description: 'Central glossary to align terminology across disciplines', phase: 'collaboration-coproduction' },
      { id: 'onboardingDocs', name: 'Onboarding Docs', description: 'Documents to help new members integrate quickly', phase: 'collaboration-coproduction' },
      { id: 'fileShare', name: 'File Share', description: 'File and dataset sharing within the project', phase: 'collaboration-coproduction' },
      { id: 'gitIntegration', name: 'Git Integration', description: 'Built-in Git repository for version control and code collaboration', phase: 'collaboration-coproduction' },
      { id: 'githubIntegration', name: 'GitHub Integration', description: 'GitHub repository integration for code collaboration and version control', phase: 'collaboration-coproduction' }
    ]
  },
  {
    id: 'review-feedback',
    name: 'Review & Feedback',
    description: 'Comments, version tracking, and contribution attribution',
    modules: [
      { id: 'inlineComment', name: 'Inline Comments', description: 'Context-aware inline comments in docs or notebooks', phase: 'review-feedback' },
      { id: 'versionThread', name: 'Version Thread', description: 'Version Thread – Manage document/code versions with discussion threads linked to each change', phase: 'review-feedback' },
      { id: 'activityFeed', name: 'Activity Feed', description: 'Activity Feed – Real-time stream of edits, task changes, and team updates', phase: 'review-feedback' },
      { id: 'contribAttribution', name: 'Contribution Attribution', description: 'Tagging contributions for accountability and recognition', phase: 'review-feedback' },
      { id: 'retrospectiveTools', name: 'Retrospective Tools', description: 'Tools that support team reflection at the end of a phase to review progress and plan improvements', phase: 'review-feedback' }
    ]
  },
  {
    id: 'dissemination-finalization',
    name: 'Finalization & Dissemination',
    description: 'Results publication, finalization, and dissemination',
    modules: [
      { id: 'metadataTemplates', name: 'Metadata Templates', description: 'Structured forms to document datasets and experiments for reproducibility', phase: 'dissemination-finalization' },
      { id: 'auditTrails', name: 'Audit Trails', description: 'Log system that records who accessed, modified, or shared data, with timestamps for full accountability', phase: 'dissemination-finalization' },
      { id: 'projectOverview', name: 'Project Overview', description: 'Centralized overview of goals, timelines, and deliverables', phase: 'dissemination-finalization' },
      { id: 'openDataSharing', name: 'Open Data Sharing', description: 'Publish datasets, code, and papers with DOI integration', phase: 'dissemination-finalization' },
      { id: 'visualizationDashboard', name: 'Visualization & Dashboard', description: 'Built-in plotting and analytical dashboards', phase: 'dissemination-finalization' },
      { id: 'provenanceExplorer', name: 'Provenance Explorer', description: 'Tool that shows the full history of a result, from raw data to final output', phase: 'dissemination-finalization' },
      { 
        id: 'approvalGates', 
        name: 'Approval Gates', 
        description: 'Tools that set checkpoints in workflows where results must be approved before moving to the next stage', 
        phase: 'dissemination-finalization' 
      }
      ]
  },
  {
    id: 'cross-phase-infrastructure',
    name: 'Cross-phase Infrastructure',
    description: 'Cross-phase infrastructure and shared services',
    modules: [
      { id: 'rolePermission', name: 'Role & Permission', description: 'Role-based project access (PI, researcher, student, collaborator)', phase: 'cross-phase-infrastructure' },
      { id: 'accessControl', name: 'Access Control', description: 'Hierarchical permission management down to file/task level', phase: 'cross-phase-infrastructure' },
      { id: 'referenceManager', name: 'Reference Manager', description: 'Integrated Zotero/Mendeley library for citations', phase: 'cross-phase-infrastructure' },
      { id: 'notebookSearch', name: 'Notebook Search', description: 'Search and discover notebooks across projects', phase: 'cross-phase-infrastructure' },
      { id: 'datasetSearch', name: 'Dataset Search', description: 'Search and discover datasets across projects', phase: 'cross-phase-infrastructure' },
      { id: 'workflowBuilder', name: 'Workflow Builder', description: 'Build and package experimental workflows with Docker/Conda for scalable and reproducible execution', phase: 'cross-phase-infrastructure' },
      { id: 'componentContainerizer', name: 'Component Containerizer', description: 'Containerize and package components for reproducible workflows', phase: 'cross-phase-infrastructure' },
      
      { 
        id: 'dataLifecycleManagement', 
        name: 'Data Lifecycle Management', 
        description: 'Tools that manage research data through its full lifecycle, including retention reminders, archiving, and long-term storage to ensure sustainability and compliance.', 
        phase: 'cross-phase-infrastructure' 
      },
      
      { 
        id: 'aiAssistant', 
        name: 'AI Assistant', 
        description: 'Tools that provide smart support across all phases, suggesting literature, summarizing content, and guiding workflows to boost research productivity.', 
        phase: 'cross-phase-infrastructure' 
      }
         ]
  }
];
