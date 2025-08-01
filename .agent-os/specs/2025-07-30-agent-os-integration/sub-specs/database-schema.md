# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-07-30-agent-os-integration/spec.md

> Created: 2025-07-30
> Version: 1.0.0

## Current Database Analysis

### Main Application Databases (SQLite)
- **users.db**: User authentication and profile data
- **notes.db**: User notes and private content
- **images.db**: Uploaded image metadata and file paths

### DTF Application Database (PostgreSQL)
- **Comprehensive schema**: Financial data, engineering calculations, BSEE data, ERCOT energy data
- **Proper ORM**: SQLAlchemy models with secure query patterns

## Migration Strategy

### Option A: Migrate Main App to PostgreSQL
**Recommended Approach**: Unify both applications under single PostgreSQL database

**Schema Changes:**
```sql
-- Create main app tables in existing PostgreSQL database
CREATE SCHEMA main_app;

-- Users table (migrated from users.db)
CREATE TABLE main_app.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- bcrypt hash instead of SHA256
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    is_admin BOOLEAN DEFAULT false
);

-- Notes table (migrated from notes.db)
CREATE TABLE main_app.notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES main_app.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Images table (migrated from images.db)
CREATE TABLE main_app.images (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES main_app.users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    content_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON main_app.users(email);
CREATE INDEX idx_notes_user_id ON main_app.notes(user_id);
CREATE INDEX idx_images_user_id ON main_app.images(user_id);
```

### SQLAlchemy Models

```python
# models.py - New unified models for main application
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    __table_args__ = {'schema': 'main_app'}
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)
    
    # Relationships
    notes = db.relationship('Note', backref='user', lazy=True, cascade='all, delete-orphan')
    images = db.relationship('Image', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Note(db.Model):
    __tablename__ = 'notes'
    __table_args__ = {'schema': 'main_app'}
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('main_app.users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Image(db.Model):
    __tablename__ = 'images'
    __table_args__ = {'schema': 'main_app'}
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('main_app.users.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer)
    content_type = db.Column(db.String(100))
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
```

## Data Migration Plan

### Migration Script Structure
```python
# migrate_sqlite_to_postgresql.py
import sqlite3
import psycopg2
from werkzeug.security import generate_password_hash

def migrate_users():
    # Read from SQLite users.db
    # Transform password (rehash with bcrypt)
    # Insert into PostgreSQL main_app.users
    pass

def migrate_notes():
    # Read from SQLite notes.db
    # Map user relationships
    # Insert into PostgreSQL main_app.notes
    pass

def migrate_images():
    # Read from SQLite images.db
    # Verify file paths still exist
    # Insert into PostgreSQL main_app.images
    pass
```

## Rationale

**Security Improvements:**
- Eliminate SQL injection through ORM usage
- Implement proper foreign key constraints
- Use bcrypt for password hashing with automatic salting

**Performance Benefits:**
- PostgreSQL offers better concurrent access than SQLite
- Proper indexing strategy for common query patterns
- Connection pooling capabilities

**Development Consistency:**
- Unify database patterns across main app and DTF platform
- Single database connection configuration
- Consistent ORM patterns for all database interactions

**Backup and Maintenance:**
- Single database backup strategy
- Consistent monitoring and maintenance procedures
- Better integration with Heroku PostgreSQL addon