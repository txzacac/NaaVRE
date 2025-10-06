-- Initialize database for NaaVRE Collaboration Manager
-- Database and user are already created by POSTGRES_DB and POSTGRES_USER
-- Grant all privileges to postgres user (already has them by default)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for better performance
-- These will be created after tables are created by SQLAlchemy
