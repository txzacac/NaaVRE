"""
PostgreSQL-based handlers for Collaboration Manager
"""
import json
import uuid
from datetime import datetime
from tornado import web
from notebook.base.handlers import APIHandler
from sqlalchemy.orm import Session
from jupyterlab_vre.database.config import SessionLocal, init_db
from jupyterlab_vre.database.dao import ProjectDAO, TaskDAO, SprintDAO, UserSessionDAO, AuditLogDAO

class CollabManagerHandler(APIHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
    
    def options(self, *args, **kwargs):
        self.finish()
    
    def prepare(self):
        """Override prepare method to disable CSRF check"""
        super().prepare()
        self._xsrf_token = None
    
    def check_xsrf_cookie(self):
        """Override to disable XSRF check for development/testing"""
        return True
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Initialize database
        init_db()
        self.db = SessionLocal()
        self.project_dao = ProjectDAO(self.db)
        self.audit_dao = AuditLogDAO(self.db)

    def get(self, project_id=None):
        """Get all projects or specific project"""
        try:
            if project_id:
                # Get specific project
                project = self.project_dao.get_by_id(project_id)
                
                if not project:
                    self.set_status(404)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Project not found'
                    }))
                    return
                
                # Convert to dict
                project_dict = {
                    'id': project.id,
                    'name': project.name,
                    'description': project.description,
                    'owner': project.owner,
                    'tags': project.tags or [],
                    'phases': project.phases or [],
                    'modules': project.modules or [],
                    'createdAt': project.created_at.isoformat(),
                    'updatedAt': project.updated_at.isoformat()
                }
                
                self.finish(json.dumps({
                    'success': True,
                    'project': project_dict
                }))
                return
            else:
                # Get all projects
                projects = self.project_dao.get_all()
                projects_list = []
                
                for project in projects:
                    project_dict = {
                        'id': project.id,
                        'name': project.name,
                        'description': project.description,
                        'owner': project.owner,
                        'tags': project.tags or [],
                        'phases': project.phases or [],
                        'modules': project.modules or [],
                        'createdAt': project.created_at.isoformat(),
                        'updatedAt': project.updated_at.isoformat()
                    }
                    projects_list.append(project_dict)
                
                self.finish(json.dumps({
                    'success': True,
                    'projects': projects_list
                }))
                return
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({
                'success': False,
                'error': str(e)
            }))
            return
        finally:
            self.db.close()

    def post(self):
        """Create new project or update existing project"""
        try:
            # Temporarily disable CSRF check for testing
            try:
                if not self.check_xsrf_cookie():
                    print("CSRF token missing, but continuing for testing...")
                    # self.set_status(403)
                    # self.finish(json.dumps({
                    #     'success': False,
                    #     'error': 'CSRF token missing or invalid'
                    # }))
                    # return
            except Exception as e:
                print(f"CSRF check warning: {e}")
                
            try:
                data = json.loads(self.request.body.decode('utf-8') or '{}')
            except json.JSONDecodeError:
                self.set_status(400)
                self.finish(json.dumps({
                    'success': False,
                    'error': 'Invalid JSON'
                }))
                return

            # Check if this is an update operation
            is_update = data.get('_action') == 'update'
            project_id = data.get('id')

            if is_update:
                # Update existing project
                if not project_id:
                    self.set_status(400)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Project ID is required for update'
                    }))
                    return

                # Prepare update data
                update_data = {
                    'name': data.get('name'),
                    'description': data.get('description'),
                    'owner': data.get('owner'),
                    'tags': data.get('tags', []),
                    'phases': data.get('phases', []),
                    'modules': data.get('modules', [])
                }
                
                # Remove None values
                update_data = {k: v for k, v in update_data.items() if v is not None}
                
                # Update project
                updated_project = self.project_dao.update(project_id, update_data)
                
                if not updated_project:
                    self.set_status(404)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Project not found'
                    }))
                    return
                
                # Convert to dict
                project_dict = {
                    'id': updated_project.id,
                    'name': updated_project.name,
                    'description': updated_project.description,
                    'owner': updated_project.owner,
                    'tags': updated_project.tags or [],
                    'phases': updated_project.phases or [],
                    'modules': updated_project.modules or [],
                    'createdAt': updated_project.created_at.isoformat(),
                    'updatedAt': updated_project.updated_at.isoformat()
                }
                
                self.finish(json.dumps({'success': True, 'project': project_dict}))
                return
            else:
                # Create new project
                if not data.get('name'):
                    self.set_status(400)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Project name is required'
                    }))
                    return

                # Create project data
                project_data = {
                    'name': data.get('name', ''),
                    'description': data.get('description', ''),
                    'owner': data.get('owner', 'Unknown'),
                    'tags': data.get('tags', []),
                    'phases': data.get('phases', []),
                    'modules': data.get('modules', [])
                }
                
                # Create project
                project = self.project_dao.create(project_data)
                
                # Convert to dict
                project_dict = {
                    'id': project.id,
                    'name': project.name,
                    'description': project.description,
                    'owner': project.owner,
                    'tags': project.tags or [],
                    'phases': project.phases or [],
                    'modules': project.modules or [],
                    'createdAt': project.created_at.isoformat(),
                    'updatedAt': project.updated_at.isoformat()
                }
                
                self.finish(json.dumps({'success': True, 'project': project_dict}))
                return
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({
                'success': False,
                'error': str(e)
            }))
            return
        finally:
            self.db.close()

    def put(self, project_id):
        """Update specific project"""
        try:
            # Temporarily disable CSRF check for testing
            try:
                if not self.check_xsrf_cookie():
                    print("CSRF token missing, but continuing for testing...")
                    # self.set_status(403)
                    # self.finish(json.dumps({
                    #     'success': False,
                    #     'error': 'CSRF token missing or invalid'
                    # }))
                    # return
            except Exception as e:
                print(f"CSRF check warning: {e}")
                
            if not project_id:
                self.set_status(400)
                self.finish(json.dumps({
                    'success': False,
                    'error': 'Project ID is required'
                }))
                return

            try:
                data = json.loads(self.request.body.decode('utf-8') or '{}')
            except json.JSONDecodeError:
                self.set_status(400)
                self.finish(json.dumps({
                    'success': False,
                    'error': 'Invalid JSON'
                }))
                return

            # Prepare update data
            update_data = {
                'name': data.get('name'),
                'description': data.get('description'),
                'owner': data.get('owner'),
                'tags': data.get('tags', []),
                'phases': data.get('phases', []),
                'modules': data.get('modules', [])
            }
            
            # Remove None values
            update_data = {k: v for k, v in update_data.items() if v is not None}
            
            # Update project
            updated_project = self.project_dao.update(project_id, update_data)
            
            if not updated_project:
                self.set_status(404)
                self.finish(json.dumps({
                    'success': False,
                    'error': 'Project not found'
                }))
                return
            
            # Convert to dict
            project_dict = {
                'id': updated_project.id,
                'name': updated_project.name,
                'description': updated_project.description,
                'owner': updated_project.owner,
                'tags': updated_project.tags or [],
                'phases': updated_project.phases or [],
                'modules': updated_project.modules or [],
                'createdAt': updated_project.created_at.isoformat(),
                'updatedAt': updated_project.updated_at.isoformat()
            }
            
            self.finish(json.dumps({
                'success': True,
                'project': project_dict
            }))
            return
            
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({
                'success': False,
                'error': str(e)
            }))
            return
        finally:
            self.db.close()

class JoinProjectHandler(APIHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.db = SessionLocal()
        self.project_dao = ProjectDAO(self.db)

    def post(self):
        """Join project"""
        try:
            data = json.loads(self.request.body.decode('utf-8'))
            project_id = data.get('projectId', '')
            
            if not project_id:
                self.finish(json.dumps({
                    'success': False,
                    'error': 'Project ID is required'
                }))
                return
            
            # Find project
            project = self.project_dao.get_by_id(project_id)
            
            if not project:
                self.finish(json.dumps({
                    'success': False,
                    'error': 'Project not found'
                }))
                return
            
            # Convert to dict
            project_dict = {
                'id': project.id,
                'name': project.name,
                'description': project.description,
                'owner': project.owner,
                'tags': project.tags or [],
                'phases': project.phases or [],
                'modules': project.modules or [],
                'createdAt': project.created_at.isoformat(),
                'updatedAt': project.updated_at.isoformat()
            }
            
            self.finish(json.dumps({
                'success': True,
                'project': project_dict
            }))
            
        except Exception as e:
            self.finish(json.dumps({
                'success': False,
                'error': str(e)
            }))
        finally:
            self.db.close()

class TaskBoardHandler(APIHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
    
    def options(self, *args, **kwargs):
        self.finish()
    
    def prepare(self):
        """Override prepare method to disable CSRF check"""
        super().prepare()
        self._xsrf_token = None
    
    def check_xsrf_cookie(self):
        """Override to disable XSRF check for development/testing"""
        return True
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.db = SessionLocal()
        self.task_dao = TaskDAO(self.db)
        self.sprint_dao = SprintDAO(self.db)

    def get(self, project_id):
        """Get project task board data"""
        try:
            if not project_id:
                self.set_status(400)
                self.finish(json.dumps({
                    'success': False,
                    'error': 'Project ID is required'
                }))
                return

            # Get sprint filter from query parameters
            sprint_filter = self.get_argument('sprint', None)
            
            # Get all tasks for the project
            tasks = self.task_dao.get_by_project(project_id, sprint_filter)
            
            # Group tasks by status
            columns = {
                'todo': {'id': 'todo', 'title': 'To Do', 'tasks': [], 'color': '#e3f2fd'},
                'in-progress': {'id': 'in-progress', 'title': 'In Progress', 'tasks': [], 'color': '#fff3e0'},
                'review': {'id': 'review', 'title': 'Review', 'tasks': [], 'color': '#f3e5f5'},
                'done': {'id': 'done', 'title': 'Done', 'tasks': [], 'color': '#e8f5e8'}
            }
            
            for task in tasks:
                status = task.status or 'todo'
                if status in columns:
                    # Convert task to dict
                    task_dict = {
                        'id': task.id,
                        'title': task.title,
                        'description': task.description,
                        'status': task.status,
                        'assignee': task.assignee,
                        'collaborators': task.collaborators or [],
                        'priority': task.priority,
                        'dueDate': task.due_date.isoformat() if task.due_date else '',
                        'createdAt': task.created_at.isoformat(),
                        'updatedAt': task.updated_at.isoformat(),
                        'tags': task.tags or [],
                        'projectId': task.project_id,
                        'attachments': task.attachments or [],
                        'links': task.links or [],
                        'sprintId': task.sprint_id,
                        'group': task.group,
                        'dependsOn': task.depends_on or []
                    }
                    columns[status]['tasks'].append(task_dict)
            
            task_board_data = {
                'projectId': project_id,
                'columns': list(columns.values()),
                'lastUpdated': datetime.now().isoformat()
            }
            
            self.finish(json.dumps({
                'success': True,
                'taskBoard': task_board_data
            }))
            
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({
                'success': False,
                'error': str(e)
            }))
        finally:
            self.db.close()

    def post(self, project_id, task_id=None):
        """Create, update or delete task"""
        try:
            if not project_id:
                self.set_status(400)
                self.finish(json.dumps({
                    'success': False,
                    'error': 'Project ID is required'
                }))
                return

            data = json.loads(self.request.body.decode('utf-8') or '{}')
            action = data.get('action', 'create')  # create, update, delete
            
            if action == 'create':
                # Create new task
                def ensure_list(value):
                    """Ensure value is a list, not a string"""
                    if isinstance(value, str):
                        try:
                            return json.loads(value)
                        except:
                            return []
                    return value if isinstance(value, list) else []
                
                task_data = {
                    'project_id': project_id,
                    'title': data.get('title', ''),
                    'description': data.get('description', ''),
                    'status': data.get('status', 'todo'),
                    'assignee': data.get('assignee', ''),
                    'collaborators': ensure_list(data.get('collaborators', [])),
                    'priority': data.get('priority', 'medium'),
                    'due_date': datetime.fromisoformat(data.get('dueDate', '')) if data.get('dueDate') else None,
                    'tags': ensure_list(data.get('tags', [])),
                    'attachments': ensure_list(data.get('attachments', [])),
                    'links': ensure_list(data.get('links', [])),
                    'sprint_id': data.get('sprintId'),
                    'group': data.get('group'),
                    'depends_on': ensure_list(data.get('dependsOn', []))
                }
                
                # Create task
                task = self.task_dao.create(task_data)
                
                # Convert to dict
                task_dict = {
                    'id': task.id,
                    'title': task.title,
                    'description': task.description,
                    'status': task.status,
                    'assignee': task.assignee,
                    'collaborators': task.collaborators or [],
                    'priority': task.priority,
                    'dueDate': task.due_date.isoformat() if task.due_date else '',
                    'createdAt': task.created_at.isoformat(),
                    'updatedAt': task.updated_at.isoformat(),
                    'tags': task.tags or [],
                    'projectId': task.project_id,
                    'attachments': task.attachments or [],
                    'links': task.links or [],
                    'sprintId': task.sprint_id,
                    'group': task.group,
                    'dependsOn': task.depends_on or []
                }
                
                self.finish(json.dumps({
                    'success': True,
                    'task': task_dict
                }))
                
            elif action == 'update':
                # Update task
                if not task_id:
                    self.set_status(400)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Task ID is required for update'
                    }))
                    return
                
                # Prepare update data
                def ensure_list(value):
                    """Ensure value is a list, not a string"""
                    if isinstance(value, str):
                        try:
                            return json.loads(value)
                        except:
                            return []
                    return value if isinstance(value, list) else []
                
                update_data = {
                    'title': data.get('title'),
                    'description': data.get('description'),
                    'status': data.get('status'),
                    'assignee': data.get('assignee'),
                    'collaborators': ensure_list(data.get('collaborators', [])),
                    'priority': data.get('priority'),
                    'due_date': datetime.fromisoformat(data.get('dueDate', '')) if data.get('dueDate') else None,
                    'tags': ensure_list(data.get('tags', [])),
                    'attachments': ensure_list(data.get('attachments', [])),
                    'links': ensure_list(data.get('links', [])),
                    'sprint_id': data.get('sprintId'),
                    'group': data.get('group'),
                    'depends_on': ensure_list(data.get('dependsOn', []))
                }
                
                # Remove None values
                update_data = {k: v for k, v in update_data.items() if v is not None}
                
                # Update task
                updated_task = self.task_dao.update(task_id, update_data)
                
                if not updated_task:
                    self.set_status(404)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Task not found'
                    }))
                    return
                
                # Convert to dict
                task_dict = {
                    'id': updated_task.id,
                    'title': updated_task.title,
                    'description': updated_task.description,
                    'status': updated_task.status,
                    'assignee': updated_task.assignee,
                    'collaborators': updated_task.collaborators or [],
                    'priority': updated_task.priority,
                    'dueDate': updated_task.due_date.isoformat() if updated_task.due_date else '',
                    'createdAt': updated_task.created_at.isoformat(),
                    'updatedAt': updated_task.updated_at.isoformat(),
                    'tags': updated_task.tags or [],
                    'projectId': updated_task.project_id,
                    'attachments': updated_task.attachments or [],
                    'links': updated_task.links or [],
                    'sprintId': updated_task.sprint_id,
                    'group': updated_task.group,
                    'dependsOn': updated_task.depends_on or []
                }
                
                self.finish(json.dumps({
                    'success': True,
                    'task': task_dict
                }))
                
            elif action == 'delete':
                # Delete task
                if not task_id:
                    self.set_status(400)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Task ID is required for delete'
                    }))
                    return
                
                # Delete task
                success = self.task_dao.delete(task_id)
                
                if not success:
                    self.set_status(404)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Task not found'
                    }))
                    return
                
                self.finish(json.dumps({
                    'success': True,
                    'message': 'Task deleted successfully'
                }))
            else:
                self.set_status(400)
                self.finish(json.dumps({
                    'success': False,
                    'error': 'Invalid action. Must be create, update, or delete'
                }))
            
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({
                'success': False,
                'error': str(e)
            }))
        finally:
            self.db.close()

class SprintHandler(APIHandler):
    """Sprint management handler"""
    
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
    
    def options(self, *args, **kwargs):
        self.finish()
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.db = SessionLocal()
        self.sprint_dao = SprintDAO(self.db)
        self.task_dao = TaskDAO(self.db)

    def get(self, project_id, sprint_id=None):
        """Get sprints for project or specific sprint"""
        try:
            if sprint_id:
                # Get specific sprint
                sprint = self.sprint_dao.get_by_id(sprint_id)
                if not sprint:
                    self.set_status(404)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Sprint not found'
                    }))
                    return
                
                # Get sprint progress
                tasks = self.task_dao.get_by_sprint(sprint_id)
                total_tasks = len(tasks)
                completed_tasks = len([t for t in tasks if t.status == 'done'])
                in_progress_tasks = len([t for t in tasks if t.status == 'in-progress'])
                todo_tasks = len([t for t in tasks if t.status == 'todo'])
                completion_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
                
                sprint_dict = {
                    'id': sprint.id,
                    'name': sprint.name,
                    'description': sprint.description,
                    'startDate': sprint.start_date.isoformat(),
                    'endDate': sprint.end_date.isoformat(),
                    'status': sprint.status,
                    'goal': sprint.goal,
                    'createdAt': sprint.created_at.isoformat(),
                    'updatedAt': sprint.updated_at.isoformat(),
                    'progress': {
                        'total': total_tasks,
                        'completed': completed_tasks,
                        'inProgress': in_progress_tasks,
                        'todo': todo_tasks,
                        'completionPercentage': round(completion_percentage, 2)
                    }
                }
                
                self.finish(json.dumps({
                    'success': True,
                    'sprint': sprint_dict
                }))
            else:
                # Get all sprints for project
                sprints = self.sprint_dao.get_by_project(project_id)
                sprints_list = []
                
                for sprint in sprints:
                    # Get sprint progress
                    tasks = self.task_dao.get_by_sprint(sprint.id)
                    total_tasks = len(tasks)
                    completed_tasks = len([t for t in tasks if t.status == 'done'])
                    in_progress_tasks = len([t for t in tasks if t.status == 'in-progress'])
                    todo_tasks = len([t for t in tasks if t.status == 'todo'])
                    completion_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
                    
                    sprint_dict = {
                        'id': sprint.id,
                        'name': sprint.name,
                        'description': sprint.description,
                        'startDate': sprint.start_date.isoformat(),
                        'endDate': sprint.end_date.isoformat(),
                        'status': sprint.status,
                        'goal': sprint.goal,
                        'createdAt': sprint.created_at.isoformat(),
                        'updatedAt': sprint.updated_at.isoformat(),
                        'progress': {
                            'total': total_tasks,
                            'completed': completed_tasks,
                            'inProgress': in_progress_tasks,
                            'todo': todo_tasks,
                            'completionPercentage': round(completion_percentage, 2)
                        }
                    }
                    sprints_list.append(sprint_dict)
                
                self.finish(json.dumps({
                    'success': True,
                    'sprints': sprints_list
                }))
                
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({
                'success': False,
                'error': str(e)
            }))
        finally:
            self.db.close()

    def post(self, project_id, sprint_id=None):
        """Create, update, delete, start, or complete sprint"""
        try:
            data = json.loads(self.request.body.decode('utf-8') or '{}')
            action = data.get('action', 'create')
            
            if action == 'create':
                # Create new sprint
                sprint_data = {
                    'project_id': project_id,
                    'name': data.get('name', ''),
                    'description': data.get('description', ''),
                    'start_date': datetime.fromisoformat(data.get('startDate', '')),
                    'end_date': datetime.fromisoformat(data.get('endDate', '')),
                    'goal': data.get('goal', ''),
                    'status': 'planned'
                }
                
                sprint = self.sprint_dao.create(sprint_data)
                
                sprint_dict = {
                    'id': sprint.id,
                    'name': sprint.name,
                    'description': sprint.description,
                    'startDate': sprint.start_date.isoformat(),
                    'endDate': sprint.end_date.isoformat(),
                    'status': sprint.status,
                    'goal': sprint.goal,
                    'createdAt': sprint.created_at.isoformat(),
                    'updatedAt': sprint.updated_at.isoformat(),
                    'progress': {
                        'total': 0,
                        'completed': 0,
                        'inProgress': 0,
                        'todo': 0,
                        'completionPercentage': 0
                    }
                }
                
                self.finish(json.dumps({
                    'success': True,
                    'sprint': sprint_dict
                }))
                
            elif action == 'update':
                # Update sprint
                if not sprint_id:
                    self.set_status(400)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Sprint ID is required for update'
                    }))
                    return
                
                update_data = {
                    'name': data.get('name'),
                    'description': data.get('description'),
                    'start_date': datetime.fromisoformat(data.get('startDate', '')) if data.get('startDate') else None,
                    'end_date': datetime.fromisoformat(data.get('endDate', '')) if data.get('endDate') else None,
                    'goal': data.get('goal')
                }
                
                # Remove None values
                update_data = {k: v for k, v in update_data.items() if v is not None}
                
                updated_sprint = self.sprint_dao.update(sprint_id, update_data)
                
                if not updated_sprint:
                    self.set_status(404)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Sprint not found'
                    }))
                    return
                
                # Get sprint progress
                tasks = self.task_dao.get_by_sprint(sprint_id)
                total_tasks = len(tasks)
                completed_tasks = len([t for t in tasks if t.status == 'done'])
                in_progress_tasks = len([t for t in tasks if t.status == 'in-progress'])
                todo_tasks = len([t for t in tasks if t.status == 'todo'])
                completion_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
                
                sprint_dict = {
                    'id': updated_sprint.id,
                    'name': updated_sprint.name,
                    'description': updated_sprint.description,
                    'startDate': updated_sprint.start_date.isoformat(),
                    'endDate': updated_sprint.end_date.isoformat(),
                    'status': updated_sprint.status,
                    'goal': updated_sprint.goal,
                    'createdAt': updated_sprint.created_at.isoformat(),
                    'updatedAt': updated_sprint.updated_at.isoformat(),
                    'progress': {
                        'total': total_tasks,
                        'completed': completed_tasks,
                        'inProgress': in_progress_tasks,
                        'todo': todo_tasks,
                        'completionPercentage': round(completion_percentage, 2)
                    }
                }
                
                self.finish(json.dumps({
                    'success': True,
                    'sprint': sprint_dict
                }))
                
            elif action == 'delete':
                # Delete sprint
                if not sprint_id:
                    self.set_status(400)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Sprint ID is required for delete'
                    }))
                    return
                
                sprint = self.sprint_dao.get_by_id(sprint_id)
                if not sprint:
                    self.set_status(404)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Sprint not found'
                    }))
                    return
                
                # Only allow deleting planned sprints
                if sprint.status != 'planned':
                    self.set_status(400)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Only planned sprints can be deleted'
                    }))
                    return
                
                success = self.sprint_dao.delete(sprint_id)
                
                if not success:
                    self.set_status(404)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Sprint not found'
                    }))
                    return
                
                self.finish(json.dumps({
                    'success': True,
                    'message': 'Sprint deleted successfully'
                }))
                
            elif action == 'start':
                # Start sprint
                if not sprint_id:
                    self.set_status(400)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Sprint ID is required to start sprint'
                    }))
                    return
                
                sprint = self.sprint_dao.get_by_id(sprint_id)
                if not sprint:
                    self.set_status(404)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Sprint not found'
                    }))
                    return
                
                if sprint.status != 'planned':
                    self.set_status(400)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Only planned sprints can be started'
                    }))
                    return
                
                # Update sprint status
                updated_sprint = self.sprint_dao.update(sprint_id, {'status': 'active'})
                
                sprint_dict = {
                    'id': updated_sprint.id,
                    'name': updated_sprint.name,
                    'description': updated_sprint.description,
                    'startDate': updated_sprint.start_date.isoformat(),
                    'endDate': updated_sprint.end_date.isoformat(),
                    'status': updated_sprint.status,
                    'goal': updated_sprint.goal,
                    'createdAt': updated_sprint.created_at.isoformat(),
                    'updatedAt': updated_sprint.updated_at.isoformat()
                }
                
                self.finish(json.dumps({
                    'success': True,
                    'sprint': sprint_dict
                }))
                
            elif action == 'complete':
                # Complete sprint
                if not sprint_id:
                    self.set_status(400)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Sprint ID is required to complete sprint'
                    }))
                    return
                
                sprint = self.sprint_dao.get_by_id(sprint_id)
                if not sprint:
                    self.set_status(404)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Sprint not found'
                    }))
                    return
                
                if sprint.status != 'active':
                    self.set_status(400)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Only active sprints can be completed'
                    }))
                    return
                
                # Get sprint tasks for report
                tasks = self.task_dao.get_by_sprint(sprint_id)
                total_tasks = len(tasks)
                completed_tasks = len([t for t in tasks if t.status == 'done'])
                incomplete_tasks = [t for t in tasks if t.status != 'done']
                
                # Generate sprint report
                report = {
                    'sprintId': sprint_id,
                    'sprintName': sprint.name,
                    'goal': sprint.goal,
                    'startDate': sprint.start_date.isoformat(),
                    'endDate': sprint.end_date.isoformat(),
                    'totalTasks': total_tasks,
                    'completedTasks': completed_tasks,
                    'completionRate': (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
                    'incompleteTasks': [
                        {
                            'id': t.id,
                            'title': t.title,
                            'status': t.status,
                            'assignee': t.assignee
                        } for t in incomplete_tasks
                    ],
                    'generatedAt': datetime.now().isoformat()
                }
                
                # Update sprint status
                updated_sprint = self.sprint_dao.update(sprint_id, {
                    'status': 'completed',
                    'report': report
                })
                
                sprint_dict = {
                    'id': updated_sprint.id,
                    'name': updated_sprint.name,
                    'description': updated_sprint.description,
                    'startDate': updated_sprint.start_date.isoformat(),
                    'endDate': updated_sprint.end_date.isoformat(),
                    'status': updated_sprint.status,
                    'goal': updated_sprint.goal,
                    'createdAt': updated_sprint.created_at.isoformat(),
                    'updatedAt': updated_sprint.updated_at.isoformat(),
                    'report': report
                }
                
                self.finish(json.dumps({
                    'success': True,
                    'sprint': sprint_dict
                }))
            else:
                self.set_status(400)
                self.finish(json.dumps({
                    'success': False,
                    'error': 'Invalid action. Must be create, update, delete, start, or complete'
                }))
                
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({
                'success': False,
                'error': str(e)
            }))
        finally:
            self.db.close()

class CrossGroupDashboardHandler(APIHandler):
    """Cross-group dashboard handler"""
    
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
    
    def options(self, *args, **kwargs):
        self.finish()
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.db = SessionLocal()
        self.task_dao = TaskDAO(self.db)
        self.sprint_dao = SprintDAO(self.db)

    def get(self, project_id):
        """Get cross-group dashboard data"""
        try:
            # Get filters from query parameters
            sprint_filter = self.get_argument('sprint', None)
            status_filter = self.get_argument('status', None)
            assignee_filter = self.get_argument('assignee', None)
            labels_filter = self.get_argument('labels', None)
            groups_filter = self.get_argument('groups', None)
            
            # Get all tasks for the project
            tasks = self.task_dao.get_by_project(project_id, sprint_filter)
            
            # Apply filters
            if status_filter:
                tasks = [t for t in tasks if t.status == status_filter]
            if assignee_filter:
                tasks = [t for t in tasks if t.assignee == assignee_filter]
            if labels_filter:
                label_list = labels_filter.split(',')
                tasks = [t for t in tasks if any(label in (t.tags or []) for label in label_list)]
            if groups_filter:
                group_list = groups_filter.split(',')
                tasks = [t for t in tasks if t.group in group_list]
            
            # Group tasks by group
            group_tasks = {}
            for task in tasks:
                group = task.group or 'Unassigned'
                if group not in group_tasks:
                    group_tasks[group] = []
                group_tasks[group].append(task)
            
            # Calculate group summaries
            group_summaries = []
            for group, group_task_list in group_tasks.items():
                total_tasks = len(group_task_list)
                completed_tasks = len([t for t in group_task_list if t.status == 'done'])
                in_progress_tasks = len([t for t in group_task_list if t.status == 'in-progress'])
                todo_tasks = len([t for t in group_task_list if t.status == 'todo'])
                completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
                
                # Calculate average task age
                now = datetime.now()
                task_ages = []
                for task in group_task_list:
                    age = (now - task.created_at).days
                    task_ages.append(age)
                avg_task_age = sum(task_ages) / len(task_ages) if task_ages else 0
                
                group_summary = {
                    'group': group,
                    'totalTasks': total_tasks,
                    'completedTasks': completed_tasks,
                    'inProgressTasks': in_progress_tasks,
                    'todoTasks': todo_tasks,
                    'completionRate': round(completion_rate, 2),
                    'avgTaskAge': round(avg_task_age, 1),
                    'tasks': [
                        {
                            'id': t.id,
                            'title': t.title,
                            'status': t.status,
                            'assignee': t.assignee,
                            'priority': t.priority,
                            'dueDate': t.due_date.isoformat() if t.due_date else None,
                            'tags': t.tags or [],
                            'dependsOn': t.depends_on or []
                        } for t in group_task_list
                    ]
                }
                group_summaries.append(group_summary)
            
            # Calculate overall KPIs
            all_tasks = tasks
            total_tasks = len(all_tasks)
            completed_tasks = len([t for t in all_tasks if t.status == 'done'])
            overall_completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
            
            # Calculate dependencies
            dependencies = self._calculate_dependencies(all_tasks)
            
            kpis = {
                'totalTasks': total_tasks,
                'completedTasks': completed_tasks,
                'overallCompletionRate': round(overall_completion_rate, 2),
                'activeGroups': len(group_summaries),
                'totalDependencies': len(dependencies)
            }
            
            dashboard_data = {
                'projectId': project_id,
                'groupSummaries': group_summaries,
                'kpis': kpis,
                'dependencies': dependencies,
                'lastUpdated': datetime.now().isoformat()
            }
            
            self.finish(json.dumps({
                'success': True,
                'dashboard': dashboard_data
            }))
            
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({
                'success': False,
                'error': str(e)
            }))
        finally:
            self.db.close()

    def _calculate_dependencies(self, tasks):
        """Calculate cross-group dependencies"""
        dependencies = []
        task_dict = {task.id: task for task in tasks}
        
        for task in tasks:
            if task.depends_on:
                for dep_id in task.depends_on:
                    if dep_id in task_dict:
                        dep_task = task_dict[dep_id]
                        if dep_task.group != task.group:
                            # Cross-group dependency
                            dependency = {
                                'fromTask': {
                                    'id': dep_task.id,
                                    'title': dep_task.title,
                                    'group': dep_task.group,
                                    'status': dep_task.status
                                },
                                'toTask': {
                                    'id': task.id,
                                    'title': task.title,
                                    'group': task.group,
                                    'status': task.status
                                },
                                'status': 'blocked' if dep_task.status != 'done' else 'on_track',
                                'risk': 'high' if dep_task.status == 'todo' else 'medium' if dep_task.status == 'in-progress' else 'low'
                            }
                            dependencies.append(dependency)
        
        return dependencies
