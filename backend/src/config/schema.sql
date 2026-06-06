-- AI Career Launchpad - PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  raw_text TEXT,
  parsed_data JSONB,
  ai_feedback TEXT,
  score INTEGER,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- GitHub profiles table
CREATE TABLE IF NOT EXISTS github_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  github_username VARCHAR(255) NOT NULL,
  profile_data JSONB,
  repos_data JSONB,
  last_synced TIMESTAMP DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  ai_description TEXT,
  tech_stack TEXT[],
  github_url TEXT,
  live_url TEXT,
  stars INTEGER DEFAULT 0,
  language VARCHAR(100),
  source VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  bio TEXT,
  ai_bio TEXT,
  skills TEXT[],
  contact_email VARCHAR(255),
  linkedin_url TEXT,
  github_url TEXT,
  theme VARCHAR(50) DEFAULT 'default',
  is_published BOOLEAN DEFAULT false,
  slug VARCHAR(255) UNIQUE,
  score INTEGER,
  generated_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Skill assessments table
CREATE TABLE IF NOT EXISTS skill_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skills_detected TEXT[],
  skills_missing TEXT[],
  recommendations JSONB,
  career_path VARCHAR(255),
  interview_questions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_github_profiles_user_id ON github_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_assessments_user_id ON skill_assessments(user_id);
