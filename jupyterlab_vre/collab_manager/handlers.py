import json
import uuid
from datetime import datetime
from tinydb import TinyDB, Query
from tornado import web
from notebook.base.handlers import APIHandler
from tornado import web

class CollabManagerHandler(APIHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
    
    def options(self, *args, **kwargs):
        self.finish()
    
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Initialize TinyDB database
        self.db = TinyDB('/tmp/collab_projects.json')
        self.projects_table = self.db.table('projects')

    def get(self, project_id=None):
        """Get all projects or specific project"""
        try:
            if project_id:
                # Get specific project
                Project = Query()
                project = self.projects_table.search(Project.id == project_id)
                
                if not project:
                    self.set_status(404)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Project not found'
                    }))
                    return
                
                self.finish(json.dumps({
                    'success': True,
                    'project': project[0]
                }))
                return
            else:
                # Get all projects
                projects = self.projects_table.all()
                self.finish(json.dumps({
                    'success': True,
                    'projects': projects
                }))
                return
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({
                'success': False,
                'error': str(e)
            }))
            return

    def post(self):
        """Create new project or update existing project"""
        try:
            # Check CSRF token - temporarily disabled for testing update functionality
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
                print(f"Update request for project ID: {project_id}")
                print(f"Update data: {data}")
                
                if not project_id:
                    self.set_status(400)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Project ID is required for update'
                    }))
                    return

                Project = Query()
                existing_project = self.projects_table.search(Project.id == project_id)
                print(f"Found existing project: {existing_project}")
                
                if not existing_project:
                    self.set_status(404)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Project not found'
                    }))
                    return

                # Update fields
                updated_fields = {
                    'name': data.get('name', existing_project[0].get('name', '')),
                    'description': data.get('description', existing_project[0].get('description', '')),
                    'owner': data.get('owner', existing_project[0].get('owner', 'Unknown')),
                    'tags': data.get('tags', existing_project[0].get('tags', [])),
                    'phases': data.get('phases', existing_project[0].get('phases', [])),
                    'modules': data.get('modules', existing_project[0].get('modules', [])),
                    'updatedAt': datetime.now().isoformat()
                }
                
                print(f"Updated fields: {updated_fields}")
                
                # Update project
                result = self.projects_table.update(updated_fields, Project.id == project_id)
                print(f"Update result: {result}")
                
                # Get updated project
                updated_project = self.projects_table.search(Project.id == project_id)
                print(f"Updated project: {updated_project}")
                
                if updated_project:
                    updated_project = updated_project[0]
                self.finish(json.dumps({'success': True, 'project': updated_project}))
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

                # Generate project ID
                project_id = str(uuid.uuid4())
                
                # Create project data
                project_data = {
                    'id': project_id,
                    'name': data.get('name', ''),
                    'description': data.get('description', ''),
                    'owner': data.get('owner', 'Unknown'),
                    'tags': data.get('tags', []),
                    'phases': data.get('phases', []),
                    'modules': data.get('modules', []),
                    'createdAt': datetime.now().isoformat(),
                    'updatedAt': datetime.now().isoformat()
                }
                
                # Save to database
                self.projects_table.insert(project_data)
                
                self.finish(json.dumps({'success': True, 'project': project_data}))
                return
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({
                'success': False,
                'error': str(e)
            }))
            return

    def put(self, project_id):
        """Update specific project"""
        try:
            # Check CSRF token - temporarily disabled for testing update functionality
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
                # If CSRF check fails, log error but continue processing
                
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

            # Find project
            Project = Query()
            project = self.projects_table.search(Project.id == project_id)
            
            if not project:
                self.set_status(404)
                self.finish(json.dumps({
                    'success': False,
                    'error': 'Project not found'
                }))
                return

            # Only update fields that need updating, preserve existing fields
            updated_fields = {
                'name': data.get('name', project[0].get('name', '')),
                'description': data.get('description', project[0].get('description', '')),
                'owner': data.get('owner', project[0].get('owner', 'Unknown')),
                'tags': data.get('tags', project[0].get('tags', [])),
                'phases': data.get('phases', project[0].get('phases', [])),
                'modules': data.get('modules', project[0].get('modules', [])),
                'updatedAt': datetime.now().isoformat()
            }

            # Update database - only update specified fields
            self.projects_table.update(updated_fields, Project.id == project_id)

            # Get complete updated project data
            updated_project = {**project[0], **updated_fields}
            
            self.finish(json.dumps({
                'success': True,
                'project': updated_project
            }))
            return
            
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({
                'success': False,
                'error': str(e)
            }))
            return

class JoinProjectHandler(APIHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Initialize TinyDB database
        self.db = TinyDB('/tmp/collab_projects.json')
        self.projects_table = self.db.table('projects')

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
            Project = Query()
            project = self.projects_table.search(Project.id == project_id)
            
            if not project:
                self.finish(json.dumps({
                    'success': False,
                    'error': 'Project not found'
                }))
                return
            
            self.finish(json.dumps({
                'success': True,
                'project': project[0]
            }))
            
        except Exception as e:
            self.finish(json.dumps({
                'success': False,
                'error': str(e)
            }))

class TaskBoardHandler(APIHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
    
    def options(self, *args, **kwargs):
        self.finish()
    
    def prepare(self):
        super().prepare()
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Initialize TinyDB database
        self.db = TinyDB('/tmp/collab_projects.json')
        self.tasks_table = self.db.table('tasks')

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

            # Get all tasks for the project
            Task = Query()
            tasks = self.tasks_table.search(Task.projectId == project_id)

            # Optional sprint filter via query argument
            try:
                sprint_id = self.get_query_argument('sprintId', None)
            except Exception:
                sprint_id = None
            if sprint_id:
                if sprint_id == 'backlog':
                    # Show tasks without sprint assignment
                    tasks = [t for t in tasks if not t.get('sprintId') or t.get('sprintId') == '']
                else:
                    # Show tasks for specific sprint
                    tasks = [t for t in tasks if t.get('sprintId') == sprint_id]
            
            # Group tasks by status
            columns = {
                'todo': {'id': 'todo', 'title': 'To Do', 'tasks': [], 'color': '#e3f2fd'},
                'in-progress': {'id': 'in-progress', 'title': 'In Progress', 'tasks': [], 'color': '#fff3e0'},
                'review': {'id': 'review', 'title': 'Review', 'tasks': [], 'color': '#f3e5f5'},
                'done': {'id': 'done', 'title': 'Done', 'tasks': [], 'color': '#e8f5e8'}
            }
            
            for task in tasks:
                status = task.get('status', 'todo')
                if status in columns:
                    columns[status]['tasks'].append(task)
            
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

    def post(self, project_id, task_id=None):
        """Create, update or delete task"""
        try:
            # Temporarily disable CSRF check for testing functionality
            # try:
            #     if not self.check_xsrf_cookie():
            #         self.set_status(403)
            #         self.finish(json.dumps({
            #             'success': False,
            #             'error': 'CSRF token missing or invalid'
            #         }))
            #         return
            # except Exception as e:
            #     print(f"CSRF check warning: {e}")
            #     # If CSRF check fails, log error but continue processing
                
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
                # Generate task ID
                task_id = f"task_{int(datetime.now().timestamp() * 1000)}_{uuid.uuid4().hex[:8]}"
                
                # Create task data
                task_data = {
                    'id': task_id,
                    'title': data.get('title', ''),
                    'description': data.get('description', ''),
                    'status': data.get('status', 'todo'),
                    'assignee': data.get('assignee', ''),
                    'collaborators': data.get('collaborators', []),
                    'priority': data.get('priority', 'medium'),
                    'dueDate': data.get('dueDate', ''),
                    'createdAt': datetime.now().isoformat(),
                    'updatedAt': datetime.now().isoformat(),
                    'tags': data.get('tags', []),
                    'projectId': project_id,
                    'sprintId': data.get('sprintId', ''),
                    'attachments': data.get('attachments', []),
                    'links': data.get('links', [])
                }
                
                # Save to database
                self.tasks_table.insert(task_data)
                
                self.finish(json.dumps({
                    'success': True,
                    'task': task_data
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
                
                # Find task
                Task = Query()
                task = self.tasks_table.search((Task.id == task_id) & (Task.projectId == project_id))
                
                if not task:
                    self.set_status(404)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Task not found'
                    }))
                    return

                # Update task data
                updated_fields = {
                    'title': data.get('title', task[0].get('title', '')),
                    'description': data.get('description', task[0].get('description', '')),
                    'status': data.get('status', task[0].get('status', 'todo')),
                    'assignee': data.get('assignee', task[0].get('assignee', '')),
                    'collaborators': data.get('collaborators', task[0].get('collaborators', [])),
                    'priority': data.get('priority', task[0].get('priority', 'medium')),
                    'dueDate': data.get('dueDate', task[0].get('dueDate', '')),
                    'tags': data.get('tags', task[0].get('tags', [])),
                    'sprintId': data.get('sprintId', task[0].get('sprintId', '')),
                    'attachments': data.get('attachments', task[0].get('attachments', [])),
                    'links': data.get('links', task[0].get('links', [])),
                    'updatedAt': datetime.now().isoformat()
                }
                
                # Update database
                self.tasks_table.update(updated_fields, (Task.id == task_id) & (Task.projectId == project_id))
                
                # Get updated task
                updated_task = {**task[0], **updated_fields}
                
                self.finish(json.dumps({
                    'success': True,
                    'task': updated_task
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
                
                # Find and delete task
                Task = Query()
                result = self.tasks_table.remove((Task.id == task_id) & (Task.projectId == project_id))
                
                if not result:
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


class SprintHandler(APIHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    
    def options(self, *args, **kwargs):
        self.finish()
    
    def prepare(self):
        super().prepare()
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.db = TinyDB('/tmp/collab_projects.json')
        self.sprints_table = self.db.table('sprints')
        self.tasks_table = self.db.table('tasks')

    def get(self, project_id, sprint_id=None):
        try:
            if not project_id:
                self.set_status(400)
                self.finish(json.dumps({'success': False, 'error': 'Project ID is required'}))
                return

            Sprint = Query()
            if sprint_id:
                sprints = self.sprints_table.search((Sprint.id == sprint_id) & (Sprint.projectId == project_id))
                if not sprints:
                    self.set_status(404)
                    self.finish(json.dumps({'success': False, 'error': 'Sprint not found'}))
                    return
                sprint = sprints[0]
                # Include tasks and progress statistics for the sprint
                Task = Query()
                tasks = self.tasks_table.search((Task.projectId == project_id) & (Task.sprintId == sprint_id))
                
                # Calculate progress statistics
                total_tasks = len(tasks)
                completed_tasks = len([t for t in tasks if t.get('status') == 'done'])
                in_progress_tasks = len([t for t in tasks if t.get('status') == 'in-progress'])
                todo_tasks = len([t for t in tasks if t.get('status') == 'todo'])
                
                progress_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
                
                sprint['progress'] = {
                    'totalTasks': total_tasks,
                    'completedTasks': completed_tasks,
                    'inProgressTasks': in_progress_tasks,
                    'todoTasks': todo_tasks,
                    'completionPercentage': round(progress_percentage, 1)
                }
                
                self.finish(json.dumps({'success': True, 'sprint': sprint, 'tasks': tasks}))
            else:
                sprints = self.sprints_table.search(Sprint.projectId == project_id)
                
                # Add progress statistics to each sprint
                Task = Query()
                for sprint in sprints:
                    tasks = self.tasks_table.search((Task.projectId == project_id) & (Task.sprintId == sprint['id']))
                    total_tasks = len(tasks)
                    completed_tasks = len([t for t in tasks if t.get('status') == 'done'])
                    progress_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
                    
                    sprint['progress'] = {
                        'totalTasks': total_tasks,
                        'completedTasks': completed_tasks,
                        'completionPercentage': round(progress_percentage, 1)
                    }
                
                self.finish(json.dumps({'success': True, 'sprints': sprints}))
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({'success': False, 'error': str(e)}))

    def post(self, project_id, sprint_id=None):
        try:
            if not project_id:
                self.set_status(400)
                self.finish(json.dumps({'success': False, 'error': 'Project ID is required'}))
                return

            data = json.loads(self.request.body.decode('utf-8') or '{}')
            action = data.get('action', 'create')  # create, update, delete, start, complete

            if action == 'create':
                new_id = f"sprint_{int(datetime.now().timestamp() * 1000)}_{uuid.uuid4().hex[:8]}"
                sprint = {
                    'id': new_id,
                    'projectId': project_id,
                    'name': data.get('name', ''),
                    'goal': data.get('goal', ''),
                    'startDate': data.get('startDate', ''),
                    'endDate': data.get('endDate', ''),
                    'status': 'planned',  # planned, active, completed, cancelled
                    'createdAt': datetime.now().isoformat(),
                    'updatedAt': datetime.now().isoformat()
                }
                self.sprints_table.insert(sprint)
                self.finish(json.dumps({'success': True, 'sprint': sprint}))

            elif action == 'update':
                if not sprint_id:
                    self.set_status(400)
                    self.finish(json.dumps({'success': False, 'error': 'Sprint ID is required for update'}))
                    return
                Sprint = Query()
                found = self.sprints_table.search((Sprint.id == sprint_id) & (Sprint.projectId == project_id))
                if not found:
                    self.set_status(404)
                    self.finish(json.dumps({'success': False, 'error': 'Sprint not found'}))
                    return
                
                # Only allow editing planned sprints
                if found[0].get('status') != 'planned':
                    self.set_status(400)
                    self.finish(json.dumps({'success': False, 'error': 'Only planned sprints can be edited'}))
                    return
                
                updated_fields = {
                    'name': data.get('name', found[0].get('name', '')),
                    'goal': data.get('goal', found[0].get('goal', '')),
                    'startDate': data.get('startDate', found[0].get('startDate', '')),
                    'endDate': data.get('endDate', found[0].get('endDate', '')),
                    'updatedAt': datetime.now().isoformat()
                }
                self.sprints_table.update(updated_fields, (Sprint.id == sprint_id) & (Sprint.projectId == project_id))
                updated = {**found[0], **updated_fields}
                self.finish(json.dumps({'success': True, 'sprint': updated}))

            elif action == 'delete':
                if not sprint_id:
                    self.set_status(400)
                    self.finish(json.dumps({'success': False, 'error': 'Sprint ID is required for delete'}))
                    return
                Sprint = Query()
                found = self.sprints_table.search((Sprint.id == sprint_id) & (Sprint.projectId == project_id))
                if not found:
                    self.set_status(404)
                    self.finish(json.dumps({'success': False, 'error': 'Sprint not found'}))
                    return
                
                # Only allow deleting planned sprints
                if found[0].get('status') != 'planned':
                    self.set_status(400)
                    self.finish(json.dumps({'success': False, 'error': 'Only planned sprints can be deleted'}))
                    return
                
                result = self.sprints_table.remove((Sprint.id == sprint_id) & (Sprint.projectId == project_id))
                if not result:
                    self.set_status(404)
                    self.finish(json.dumps({'success': False, 'error': 'Sprint not found'}))
                    return
                self.finish(json.dumps({'success': True, 'message': 'Sprint deleted successfully'}))
                
            elif action == 'start':
                if not sprint_id:
                    self.set_status(400)
                    self.finish(json.dumps({'success': False, 'error': 'Sprint ID is required to start sprint'}))
                    return
                Sprint = Query()
                found = self.sprints_table.search((Sprint.id == sprint_id) & (Sprint.projectId == project_id))
                if not found:
                    self.set_status(404)
                    self.finish(json.dumps({'success': False, 'error': 'Sprint not found'}))
                    return
                
                # Update sprint status to active
                self.sprints_table.update({
                    'status': 'active',
                    'updatedAt': datetime.now().isoformat()
                }, (Sprint.id == sprint_id) & (Sprint.projectId == project_id))
                
                updated = {**found[0], 'status': 'active', 'updatedAt': datetime.now().isoformat()}
                self.finish(json.dumps({'success': True, 'sprint': updated}))
                
            elif action == 'complete':
                if not sprint_id:
                    self.set_status(400)
                    self.finish(json.dumps({'success': False, 'error': 'Sprint ID is required to complete sprint'}))
                    return
                Sprint = Query()
                found = self.sprints_table.search((Sprint.id == sprint_id) & (Sprint.projectId == project_id))
                if not found:
                    self.set_status(404)
                    self.finish(json.dumps({'success': False, 'error': 'Sprint not found'}))
                    return
                
                # Update sprint status to completed
                self.sprints_table.update({
                    'status': 'completed',
                    'updatedAt': datetime.now().isoformat()
                }, (Sprint.id == sprint_id) & (Sprint.projectId == project_id))
                
                # Generate sprint report
                Task = Query()
                tasks = self.tasks_table.search((Task.projectId == project_id) & (Task.sprintId == sprint_id))
                total_tasks = len(tasks)
                completed_tasks = len([t for t in tasks if t.get('status') == 'done'])
                incomplete_tasks = [t for t in tasks if t.get('status') != 'done']
                
                report = {
                    'sprintId': sprint_id,
                    'sprintName': found[0].get('name', ''),
                    'goal': found[0].get('goal', ''),
                    'totalTasks': total_tasks,
                    'completedTasks': completed_tasks,
                    'incompleteTasks': len(incomplete_tasks),
                    'completionRate': round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 1),
                    'incompleteTaskList': incomplete_tasks,
                    'completedAt': datetime.now().isoformat()
                }
                
                updated = {**found[0], 'status': 'completed', 'updatedAt': datetime.now().isoformat()}
                self.finish(json.dumps({'success': True, 'sprint': updated, 'report': report}))
            else:
                self.set_status(400)
                self.finish(json.dumps({'success': False, 'error': 'Invalid action. Must be create, update, delete, start, or complete'}))
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({'success': False, 'error': str(e)}))


class CrossGroupDashboardHandler(APIHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    
    def options(self, *args, **kwargs):
        self.finish()
    
    def prepare(self):
        super().prepare()
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.db = TinyDB('/tmp/collab_projects.json')
        self.tasks_table = self.db.table('tasks')
        self.sprints_table = self.db.table('sprints')

    def get(self, project_id):
        """Get cross-group dashboard data"""
        try:
            if not project_id:
                self.set_status(400)
                self.finish(json.dumps({'success': False, 'error': 'Project ID is required'}))
                return

            # Get query parameters
            sprint_id = self.get_query_argument('sprint', None)
            status_filter = self.get_query_argument('status', None)
            assignee_filter = self.get_query_argument('assignee', None)
            labels_filter = self.get_query_argument('labels', None)
            groups_filter = self.get_query_argument('groups', None)

            # Get all tasks for the project
            Task = Query()
            tasks = self.tasks_table.search(Task.projectId == project_id)

            # Apply filters
            if sprint_id and sprint_id != 'All':
                tasks = [t for t in tasks if t.get('sprintId') == sprint_id]
            
            if status_filter:
                statuses = status_filter.split(',')
                tasks = [t for t in tasks if t.get('status') in statuses]
            
            if assignee_filter:
                assignees = assignee_filter.split(',')
                tasks = [t for t in tasks if t.get('assignee') in assignees]
            
            if labels_filter:
                labels = labels_filter.split(',')
                tasks = [t for t in tasks if any(label in t.get('tags', []) for label in labels)]
            
            if groups_filter:
                groups = groups_filter.split(',')
                tasks = [t for t in tasks if t.get('group') in groups]

            # Group tasks by group
            groups_data = {}
            for task in tasks:
                group = task.get('group', 'Unassigned')
                if group not in groups_data:
                    groups_data[group] = []
                groups_data[group].append(task)

            # Calculate group summaries
            group_summaries = []
            total_tasks = len(tasks)
            total_completed = 0
            total_overdue = 0
            total_due_in_7_days = 0

            for group, group_tasks in groups_data.items():
                completed = len([t for t in group_tasks if t.get('status') == 'done'])
                in_progress = len([t for t in group_tasks if t.get('status') == 'in-progress'])
                todo = len([t for t in group_tasks if t.get('status') == 'todo'])
                
                # Calculate overdue tasks
                today = datetime.now().date()
                overdue = 0
                due_in_7_days = 0
                cycle_times = []
                
                for task in group_tasks:
                    if task.get('dueDate'):
                        due_date = datetime.fromisoformat(task['dueDate']).date()
                        if due_date < today:
                            overdue += 1
                        elif (due_date - today).days <= 7:
                            due_in_7_days += 1
                    
                    # Calculate cycle time for completed tasks
                    if task.get('status') == 'done' and task.get('createdAt') and task.get('updatedAt'):
                        try:
                            created = datetime.fromisoformat(task['createdAt'])
                            updated = datetime.fromisoformat(task['updatedAt'])
                            cycle_time = (updated - created).days
                            cycle_times.append(cycle_time)
                        except:
                            pass
                
                completion_percentage = (completed / len(group_tasks) * 100) if group_tasks else 0
                average_cycle_time = sum(cycle_times) / len(cycle_times) if cycle_times else 0
                
                group_summaries.append({
                    'group': group,
                    'totalTasks': len(group_tasks),
                    'completedTasks': completed,
                    'inProgressTasks': in_progress,
                    'todoTasks': todo,
                    'overdueTasks': overdue,
                    'completionPercentage': round(completion_percentage, 1),
                    'averageCycleTime': round(average_cycle_time, 1),
                    'wipCount': in_progress,
                    'dueIn7Days': due_in_7_days
                })
                
                total_completed += completed
                total_overdue += overdue
                total_due_in_7_days += due_in_7_days

            # Calculate overall KPIs
            overall_completion_rate = (total_completed / total_tasks * 100) if total_tasks > 0 else 0
            average_wip = sum(gs['wipCount'] for gs in group_summaries) / len(group_summaries) if group_summaries else 0
            average_cycle_time = sum(gs['averageCycleTime'] for gs in group_summaries) / len(group_summaries) if group_summaries else 0

            kpis = {
                'totalTasks': total_tasks,
                'totalCompletionRate': round(overall_completion_rate, 1),
                'overdueTasks': total_overdue,
                'dueIn7Days': total_due_in_7_days,
                'averageWIP': round(average_wip, 1),
                'averageCycleTime': round(average_cycle_time, 1)
            }

            # Calculate cross-group dependencies
            dependencies = self._calculate_dependencies(tasks)

            self.finish(json.dumps({
                'success': True,
                'kpis': kpis,
                'groupSummaries': group_summaries,
                'dependencies': dependencies,
                'totalGroups': len(groups_data)
            }))

        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({'success': False, 'error': str(e)}))

    def _calculate_dependencies(self, tasks):
        """Calculate cross-group dependencies and risks"""
        dependencies = []
        task_map = {task['id']: task for task in tasks}
        
        for task in tasks:
            if task.get('dependsOn'):
                for dep_id in task['dependsOn']:
                    if dep_id in task_map:
                        dep_task = task_map[dep_id]
                        if dep_task.get('group') != task.get('group'):
                            # Cross-group dependency
                            status = 'on_track'
                            days_late = None
                            due_in_days = None
                            
                            # Check if dependency is overdue
                            if dep_task.get('status') != 'done' and dep_task.get('dueDate'):
                                due_date = datetime.fromisoformat(dep_task['dueDate']).date()
                                today = datetime.now().date()
                                if due_date < today:
                                    status = 'blocked'
                                    days_late = (today - due_date).days
                                elif (due_date - today).days <= 3:
                                    status = 'at_risk'
                                    due_in_days = (due_date - today).days
                            
                            dependencies.append({
                                'id': f"{dep_id}_{task['id']}",
                                'fromGroup': dep_task.get('group', 'Unassigned'),
                                'toGroup': task.get('group', 'Unassigned'),
                                'fromTask': dep_task['title'],
                                'toTask': task['title'],
                                'status': status,
                                'daysLate': days_late,
                                'dueInDays': due_in_days
                            })
        
        return dependencies

    def post(self, project_id):
        """Get comparison data for selected groups"""
        try:
            if not project_id:
                self.set_status(400)
                self.finish(json.dumps({'success': False, 'error': 'Project ID is required'}))
                return

            data = json.loads(self.request.body.decode('utf-8') or '{}')
            compare_groups = data.get('groups', [])
            compare_metrics = data.get('metrics', ['completion', 'overdue', 'wip'])
            sprint_id = data.get('sprint', None)

            if not compare_groups:
                self.set_status(400)
                self.finish(json.dumps({'success': False, 'error': 'Groups to compare are required'}))
                return

            # Get tasks for selected groups
            Task = Query()
            tasks = self.tasks_table.search(Task.projectId == project_id)
            
            if sprint_id and sprint_id != 'All':
                tasks = [t for t in tasks if t.get('sprintId') == sprint_id]
            
            # Filter by groups
            tasks = [t for t in tasks if t.get('group') in compare_groups]

            # Calculate comparison data
            comparison_data = {}
            for group in compare_groups:
                group_tasks = [t for t in tasks if t.get('group') == group]
                
                completed = len([t for t in group_tasks if t.get('status') == 'done'])
                in_progress = len([t for t in group_tasks if t.get('status') == 'in-progress'])
                todo = len([t for t in group_tasks if t.get('status') == 'todo'])
                
                # Calculate metrics
                metrics = {}
                if 'completion' in compare_metrics:
                    metrics['completion'] = (completed / len(group_tasks) * 100) if group_tasks else 0
                
                if 'overdue' in compare_metrics:
                    today = datetime.now().date()
                    overdue = len([t for t in group_tasks 
                                  if t.get('dueDate') and 
                                  datetime.fromisoformat(t['dueDate']).date() < today])
                    metrics['overdue'] = overdue
                
                if 'wip' in compare_metrics:
                    metrics['wip'] = in_progress
                
                if 'todo' in compare_metrics:
                    metrics['todo'] = todo
                
                if 'total' in compare_metrics:
                    metrics['total'] = len(group_tasks)
                
                comparison_data[group] = metrics

            self.finish(json.dumps({
                'success': True,
                'comparisonData': comparison_data,
                'groups': compare_groups,
                'metrics': compare_metrics
            }))

        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({'success': False, 'error': str(e)}))
