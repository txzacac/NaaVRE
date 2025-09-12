import json
import uuid
from datetime import datetime
from tinydb import TinyDB, Query
from tornado import web
from notebook.base.handlers import APIHandler

class CollabManagerHandler(APIHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
    
    def options(self, *args, **kwargs):
        self.finish()
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 初始化 TinyDB 数据库
        self.db = TinyDB('/tmp/collab_projects.json')
        self.projects_table = self.db.table('projects')

    def get(self, project_id=None):
        """获取所有项目列表或特定项目"""
        try:
            if project_id:
                # 获取特定项目
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
                # 获取所有项目
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
        """创建新项目或更新现有项目"""
        try:
            # 检查CSRF token
            try:
                if not self.check_xsrf_cookie():
                    self.set_status(403)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'CSRF token missing or invalid'
                    }))
                    return
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

            # 检查是否是更新操作
            is_update = data.get('_action') == 'update'
            project_id = data.get('id')

            if is_update:
                # 更新现有项目
                if not project_id:
                    self.set_status(400)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Project ID is required for update'
                    }))
                    return

                Project = Query()
                existing_project = self.projects_table.search(Project.id == project_id)
                if not existing_project:
                    self.set_status(404)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Project not found'
                    }))
                    return

                # 更新字段
                updated_fields = {
                    'name': data.get('name', existing_project[0].get('name', '')),
                    'description': data.get('description', existing_project[0].get('description', '')),
                    'owner': data.get('owner', existing_project[0].get('owner', 'Unknown')),
                    'tags': data.get('tags', existing_project[0].get('tags', [])),
                    'phases': data.get('phases', existing_project[0].get('phases', [])),
                    'modules': data.get('modules', existing_project[0].get('modules', [])),
                    'updatedAt': datetime.now().isoformat()
                }
                
                # 使用lambda函数进行部分更新
                self.projects_table.update(lambda x: {**x, **updated_fields}, Project.id == project_id)
                
                # 获取更新后的项目
                updated_project = self.projects_table.get(Project.id == project_id)
                self.finish(json.dumps({'success': True, 'project': updated_project}))
                return
            else:
                # 创建新项目
                if not data.get('name'):
                    self.set_status(400)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'Project name is required'
                    }))
                    return

                # 生成项目ID
                project_id = str(uuid.uuid4())
                
                # 创建项目数据
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
                
                # 保存到数据库
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
        """更新特定项目"""
        try:
            # 检查CSRF token
            try:
                if not self.check_xsrf_cookie():
                    self.set_status(403)
                    self.finish(json.dumps({
                        'success': False,
                        'error': 'CSRF token missing or invalid'
                    }))
                    return
            except Exception as e:
                print(f"CSRF check warning: {e}")
                # 如果CSRF检查失败，记录错误但继续处理
                
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

            # 查找项目
            Project = Query()
            project = self.projects_table.search(Project.id == project_id)
            
            if not project:
                self.set_status(404)
                self.finish(json.dumps({
                    'success': False,
                    'error': 'Project not found'
                }))
                return

            # 只更新需要更新的字段，保留原有字段
            updated_fields = {
                'name': data.get('name', project[0].get('name', '')),
                'description': data.get('description', project[0].get('description', '')),
                'owner': data.get('owner', project[0].get('owner', 'Unknown')),
                'tags': data.get('tags', project[0].get('tags', [])),
                'phases': data.get('phases', project[0].get('phases', [])),
                'modules': data.get('modules', project[0].get('modules', [])),
                'updatedAt': datetime.now().isoformat()
            }

            # 更新数据库 - 只更新指定字段
            self.projects_table.update(updated_fields, Project.id == project_id)

            # 获取更新后的完整项目数据
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
        # 初始化 TinyDB 数据库
        self.db = TinyDB('/tmp/collab_projects.json')
        self.projects_table = self.db.table('projects')

    def post(self):
        """加入项目"""
        try:
            data = json.loads(self.request.body.decode('utf-8'))
            project_id = data.get('projectId', '')
            
            if not project_id:
                self.finish(json.dumps({
                    'success': False,
                    'error': 'Project ID is required'
                }))
                return
            
            # 查找项目
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
