"""
Data Access Object (DAO) for Collaboration Manager
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from datetime import datetime, timedelta
from .models import Project, Task, Sprint, UserSession, AuditLog, SharedFile

class ProjectDAO:
    """Project Data Access Object"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, project_data: Dict[str, Any]) -> Project:
        """Create a new project"""
        project = Project(**project_data)
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project
    
    def get_by_id(self, project_id: str) -> Optional[Project]:
        """Get project by ID"""
        return self.db.query(Project).filter(Project.id == project_id).first()
    
    def get_all(self) -> List[Project]:
        """Get all projects"""
        return self.db.query(Project).order_by(desc(Project.updated_at)).all()
    
    def update(self, project_id: str, update_data: Dict[str, Any]) -> Optional[Project]:
        """Update project"""
        project = self.get_by_id(project_id)
        if project:
            for key, value in update_data.items():
                setattr(project, key, value)
            project.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(project)
        return project
    
    def delete(self, project_id: str) -> bool:
        """Delete project"""
        project = self.get_by_id(project_id)
        if project:
            self.db.delete(project)
            self.db.commit()
            return True
        return False

class TaskDAO:
    """Task Data Access Object"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, task_data: Dict[str, Any]) -> Task:
        """Create a new task"""
        task = Task(**task_data)
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task
    
    def get_by_id(self, task_id: str) -> Optional[Task]:
        """Get task by ID"""
        return self.db.query(Task).filter(Task.id == task_id).first()
    
    def get_by_project(self, project_id: str, sprint_filter: Optional[str] = None) -> List[Task]:
        """Get tasks by project ID with optional sprint filter"""
        query = self.db.query(Task).filter(Task.project_id == project_id)
        
        if sprint_filter:
            if sprint_filter == 'backlog':
                query = query.filter(Task.sprint_id.is_(None))
            else:
                query = query.filter(Task.sprint_id == sprint_filter)
        
        return query.order_by(desc(Task.updated_at)).all()
    
    def update(self, task_id: str, update_data: Dict[str, Any]) -> Optional[Task]:
        """Update task"""
        task = self.get_by_id(task_id)
        if task:
            for key, value in update_data.items():
                setattr(task, key, value)
            task.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(task)
        return task
    
    def delete(self, task_id: str) -> bool:
        """Delete task"""
        task = self.get_by_id(task_id)
        if task:
            self.db.delete(task)
            self.db.commit()
            return True
        return False
    
    def get_by_sprint(self, sprint_id: str) -> List[Task]:
        """Get tasks by sprint ID"""
        return self.db.query(Task).filter(Task.sprint_id == sprint_id).all()
    
    def get_by_group(self, project_id: str, group: str) -> List[Task]:
        """Get tasks by group"""
        return self.db.query(Task).filter(
            and_(Task.project_id == project_id, Task.group == group)
        ).all()

class SprintDAO:
    """Sprint Data Access Object"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, sprint_data: Dict[str, Any]) -> Sprint:
        """Create a new sprint"""
        sprint = Sprint(**sprint_data)
        self.db.add(sprint)
        self.db.commit()
        self.db.refresh(sprint)
        return sprint
    
    def get_by_id(self, sprint_id: str) -> Optional[Sprint]:
        """Get sprint by ID"""
        return self.db.query(Sprint).filter(Sprint.id == sprint_id).first()
    
    def get_by_project(self, project_id: str) -> List[Sprint]:
        """Get sprints by project ID"""
        return self.db.query(Sprint).filter(
            Sprint.project_id == project_id
        ).order_by(desc(Sprint.start_date)).all()
    
    def update(self, sprint_id: str, update_data: Dict[str, Any]) -> Optional[Sprint]:
        """Update sprint"""
        sprint = self.get_by_id(sprint_id)
        if sprint:
            for key, value in update_data.items():
                setattr(sprint, key, value)
            sprint.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(sprint)
        return sprint
    
    def delete(self, sprint_id: str) -> bool:
        """Delete sprint"""
        sprint = self.get_by_id(sprint_id)
        if sprint:
            self.db.delete(sprint)
            self.db.commit()
            return True
        return False
    
    def get_active_sprint(self, project_id: str) -> Optional[Sprint]:
        """Get active sprint for project"""
        now = datetime.utcnow()
        return self.db.query(Sprint).filter(
            and_(
                Sprint.project_id == project_id,
                Sprint.status == 'active',
                Sprint.start_date <= now,
                Sprint.end_date >= now
            )
        ).first()

class UserSessionDAO:
    """User Session Data Access Object"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_or_update(self, user_id: str, project_id: str, session_data: Dict[str, Any]) -> UserSession:
        """Create or update user session"""
        session = self.db.query(UserSession).filter(
            and_(UserSession.user_id == user_id, UserSession.project_id == project_id)
        ).first()
        
        if session:
            session.session_data = session_data
            session.last_activity = datetime.utcnow()
        else:
            session = UserSession(
                user_id=user_id,
                project_id=project_id,
                session_data=session_data
            )
            self.db.add(session)
        
        self.db.commit()
        self.db.refresh(session)
        return session
    
    def get_active_users(self, project_id: str) -> List[UserSession]:
        """Get active users for project"""
        # Consider users active if they've been active in the last 5 minutes
        cutoff_time = datetime.utcnow() - timedelta(minutes=5)
        return self.db.query(UserSession).filter(
            and_(
                UserSession.project_id == project_id,
                UserSession.last_activity >= cutoff_time
            )
        ).all()

class AuditLogDAO:
    """Audit Log Data Access Object"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def log_action(self, user_id: str, project_id: str, action: str, 
                   entity_type: str, entity_id: str, old_values: Dict = None, 
                   new_values: Dict = None) -> AuditLog:
        """Log an action"""
        audit_log = AuditLog(
            user_id=user_id,
            project_id=project_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            old_values=old_values,
            new_values=new_values
        )
        self.db.add(audit_log)
        self.db.commit()
        self.db.refresh(audit_log)
        return audit_log
    
    def get_project_logs(self, project_id: str, limit: int = 100) -> List[AuditLog]:
        """Get audit logs for project"""
        return self.db.query(AuditLog).filter(
            AuditLog.project_id == project_id
        ).order_by(desc(AuditLog.timestamp)).limit(limit).all()


class FileDAO:
    """Shared File Data Access Object"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def list_by_project(self, project_id: str) -> List[SharedFile]:
        return (
            self.db.query(SharedFile)
            .filter(SharedFile.project_id == project_id, SharedFile.is_active == True)
            .order_by(desc(SharedFile.updated_at))
            .all()
        )
    
    def get_by_id(self, file_id: str) -> Optional[SharedFile]:
        return self.db.query(SharedFile).filter(SharedFile.id == file_id).first()
    
    def create(self, data: Dict[str, Any]) -> SharedFile:
        record = SharedFile(**data)
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record
    
    def update(self, file_id: str, update_data: Dict[str, Any]) -> Optional[SharedFile]:
        rec = self.get_by_id(file_id)
        if rec:
            for k, v in update_data.items():
                setattr(rec, k, v)
            rec.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(rec)
        return rec
    
    def soft_delete(self, file_id: str) -> bool:
        rec = self.get_by_id(file_id)
        if rec:
            rec.is_active = False
            rec.updated_at = datetime.utcnow()
            self.db.commit()
            return True
        return False
