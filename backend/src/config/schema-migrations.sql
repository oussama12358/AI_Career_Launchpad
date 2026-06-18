-- AI Career Launchpad - Schema Migrations for New Features

-- 1. Portfolio Themes Table
CREATE TABLE IF NOT EXISTS portfolio_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  preview_colors JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Portfolio Settings/Customization Table
CREATE TABLE IF NOT EXISTS portfolio_customizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE UNIQUE,
  theme_name VARCHAR(100) DEFAULT 'default',
  primary_color VARCHAR(7) DEFAULT '#2563eb',
  secondary_color VARCHAR(7) DEFAULT '#1e40af',
  accent_color VARCHAR(7) DEFAULT '#dbeafe',
  background_color VARCHAR(7) DEFAULT '#ffffff',
  text_color VARCHAR(7) DEFAULT '#1f2937',
  layout_style VARCHAR(50) DEFAULT 'modern',
  show_resume BOOLEAN DEFAULT true,
  show_github BOOLEAN DEFAULT true,
  show_projects BOOLEAN DEFAULT true,
  show_skills BOOLEAN DEFAULT true,
  show_testimonials BOOLEAN DEFAULT false,
  font_family VARCHAR(100) DEFAULT 'system-ui',
  custom_css TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Enhance Projects Table - Add columns for images and featured status
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS demo_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS featured_order INTEGER;

-- 4. Skills with Proficiency and Endorsements
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_name VARCHAR(255) NOT NULL,
  proficiency_level VARCHAR(50) DEFAULT 'beginner',
  years_of_experience DECIMAL(3,1),
  endorsements_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, skill_name)
);

-- 5. Skill Endorsements Table
CREATE TABLE IF NOT EXISTS skill_endorsements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_skill_id UUID REFERENCES user_skills(id) ON DELETE CASCADE,
  endorsed_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_skill_id, endorsed_by)
);

-- 6. Portfolio Views/Analytics Table
CREATE TABLE IF NOT EXISTS portfolio_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  visitor_id VARCHAR(255),
  user_agent TEXT,
  referrer TEXT,
  ip_address VARCHAR(45),
  country_code VARCHAR(2),
  viewed_at TIMESTAMP DEFAULT NOW()
);

-- 7. Portfolio Shares Table
CREATE TABLE IF NOT EXISTS portfolio_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  share_token VARCHAR(255) UNIQUE,
  share_method VARCHAR(50),
  shared_via TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Add columns to resumes table for PDF export support
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS formatted_data JSONB;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS template_style VARCHAR(50) DEFAULT 'modern';

-- 9. Add columns to portfolios for sharing
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS share_enabled BOOLEAN DEFAULT true;
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP;

-- 10. Testimonials/References Table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL,
  author_role VARCHAR(255),
  author_image_url TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 11. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_portfolio_customizations_portfolio_id ON portfolio_customizations(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_endorsements_user_skill_id ON skill_endorsements(user_skill_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_portfolio_id ON portfolio_analytics(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_viewed_at ON portfolio_analytics(viewed_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_shares_portfolio_id ON portfolio_shares(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_portfolio_id ON testimonials(portfolio_id);

-- Seed default portfolio themes
INSERT INTO portfolio_themes (name, label, description, preview_colors) VALUES
('default', 'Modern Blue', 'Clean, professional blue theme', '{"primary": "#2563eb", "secondary": "#1e40af", "accent": "#dbeafe"}'),
('dark', 'Dark Mode', 'Dark theme with light text', '{"primary": "#1f2937", "secondary": "#111827", "accent": "#f3f4f6"}'),
('minimal', 'Minimal Light', 'Minimalist light theme', '{"primary": "#374151", "secondary": "#9ca3af", "accent": "#ffffff"}'),
('vibrant', 'Vibrant Purple', 'Bold purple and pink', '{"primary": "#7c3aed", "secondary": "#db2777", "accent": "#fce7f3"}'),
('tech', 'Tech Dark', 'Tech-focused dark theme', '{"primary": "#00d4ff", "secondary": "#0099cc", "accent": "#1a1a2e"}'),
('nature', 'Nature Green', 'Green nature-inspired', '{"primary": "#10b981", "secondary": "#059669", "accent": "#d1fae5"}')
ON CONFLICT (name) DO NOTHING;
