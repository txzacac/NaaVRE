import json
import uuid
from datetime import datetime
from tinydb import TinyDB, Query
from tornado import web
from notebook.base.handlers import APIHandler

class CollabManagerHandler(APIHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 初始化 TinyDB 数据库
        self.db = TinyDB('/tmp/collab_projects.json')
        self.projects_table = self.db.table('projects')

    def get(self):
        """获取所有项目列表"""
        try:
            projects = self.projects_table.all()
            self.finish(json.dumps({
                'success': True,
                'projects': projects
            }))
        except Exception as e:
            self.finish(json.dumps({
                'success': False,
                'error': str(e)
            }))

    def post(self):
        """创建新项目"""
        try:
            data = json.loads(self.request.body.decode('utf-8'))
            
            # 生成唯一的项目 ID
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
            
            self.finish(json.dumps({
                'success': True,
                'project': project_data
            }))
            
        except Exception as e:
            self.finish(json.dumps({
                'success': False,
                'error': str(e)
            }))

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
