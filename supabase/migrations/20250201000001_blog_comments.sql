-- Blog Comments Table
-- Stores comments on blog posts with moderation support

CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
  approved BOOLEAN DEFAULT false,
  moderation_score DECIMAL(3, 2),
  moderation_reasons TEXT[],
  systems_thinking_insight TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  tenant_id TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_slug ON blog_comments(post_slug);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id ON blog_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON blog_comments(status);
CREATE INDEX IF NOT EXISTS idx_blog_comments_created_at ON blog_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_comments_tenant ON blog_comments(tenant_id);

-- Enable RLS
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view approved comments"
  ON blog_comments FOR SELECT
  USING (approved = true OR status = 'approved');

CREATE POLICY "Authenticated users can create comments"
  ON blog_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own comments"
  ON blog_comments FOR UPDATE
  USING (author_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_comments_updated_at
  BEFORE UPDATE ON blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_comments_updated_at();

-- Function to get comment count for a post
CREATE OR REPLACE FUNCTION get_blog_post_comment_count(post_slug_param TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM blog_comments
    WHERE post_slug = post_slug_param
    AND approved = true
  );
END;
$$ LANGUAGE plpgsql;
