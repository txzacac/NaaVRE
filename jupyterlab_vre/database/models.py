"""
Database models for Collaboration Manager
"""
from sqlalchemy import Column, String, Text, DateTime, Integer, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from .config import Base

class Project(Base):
    """Project model"""
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    owner = Column(String(100), nullable=False)
    tags = Column(JSON)  # Store as JSON array
    phases = Column(JSON)  # Store as JSON array
    modules = Column(JSON)  # Store as JSON array
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    sprints = relationship("Sprint", back_populates="project", cascade="all, delete-orphan")

class Task(Base):
    """Task model"""
    __tablename__ = "tasks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(String(50), default="todo")  # todo, in-progress, review, done
    assignee = Column(String(100))
    collaborators = Column(JSON)  # Store as JSON array
    priority = Column(String(20), default="medium")  # low, medium, high, urgent
    due_date = Column(DateTime)
    tags = Column(JSON)  # Store as JSON array
    attachments = Column(JSON)  # Store as JSON array
    links = Column(JSON)  # Store as JSON array
    sprint_id = Column(String, ForeignKey("sprints.id"), nullable=True)
    group = Column(String(100))  # For cross-group dashboard
    depends_on = Column(JSON)  # Store as JSON array of task IDs
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="tasks")
    sprint = relationship("Sprint", back_populates="tasks")

class Sprint(Base):
    """Sprint model"""
    __tablename__ = "sprints"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String(20), default="planned")  # planned, active, completed, cancelled
    goal = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="sprints")
    tasks = relationship("Task", back_populates="sprint")

class UserSession(Base):
    """User session model for tracking active users"""
    __tablename__ = "user_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(100), nullable=False)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    session_data = Column(JSON)  # Store session-specific data
    last_activity = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    project = relationship("Project")

class AuditLog(Base):
    """Audit log for tracking changes"""
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(100), nullable=False)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    action = Column(String(50), nullable=False)  # create, update, delete, etc.
    entity_type = Column(String(50), nullable=False)  # project, task, sprint, etc.
    entity_id = Column(String, nullable=False)
    old_values = Column(JSON)
    new_values = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    project = relationship("Project")
