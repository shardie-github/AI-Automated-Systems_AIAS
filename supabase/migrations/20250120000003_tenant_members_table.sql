-- Tenant Members Table Migration
-- This migration creates the missing tenant_members table that is referenced in RLS policies

-- Create tenant_members table
CREATE TABLE IF NOT EXISTS tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer', 'billing')),
  permissions JSONB DEFAULT '{}',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended', 'removed')),
  last_active TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant_id ON tenant_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_user_id ON tenant_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_role ON tenant_members(role);
CREATE INDEX IF NOT EXISTS idx_tenant_members_status ON tenant_members(status);

-- Enable RLS
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenant_members
CREATE POLICY "Users can view their own tenant memberships" ON tenant_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Tenant admins can view all members in their tenant" ON tenant_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      WHERE tm.tenant_id = tenant_members.tenant_id 
      AND tm.user_id = auth.uid() 
      AND tm.role = 'admin'
    )
  );

CREATE POLICY "Tenant admins can manage members in their tenant" ON tenant_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenant_members tm
      WHERE tm.tenant_id = tenant_members.tenant_id 
      AND tm.user_id = auth.uid() 
      AND tm.role = 'admin'
    )
  );

-- Function to add user to tenant
CREATE OR REPLACE FUNCTION add_tenant_member(
  p_tenant_id UUID,
  p_user_id UUID,
  p_role TEXT DEFAULT 'member',
  p_permissions JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  new_member_id UUID;
BEGIN
  INSERT INTO tenant_members (tenant_id, user_id, role, permissions, invited_by)
  VALUES (p_tenant_id, p_user_id, p_role, p_permissions, auth.uid())
  RETURNING id INTO new_member_id;
  
  RETURN new_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove user from tenant
CREATE OR REPLACE FUNCTION remove_tenant_member(
  p_tenant_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE tenant_members 
  SET status = 'removed', updated_at = NOW()
  WHERE tenant_id = p_tenant_id AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update member role
CREATE OR REPLACE FUNCTION update_tenant_member_role(
  p_tenant_id UUID,
  p_user_id UUID,
  p_role TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE tenant_members 
  SET role = p_role, updated_at = NOW()
  WHERE tenant_id = p_tenant_id AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is tenant member
CREATE OR REPLACE FUNCTION is_tenant_member(
  p_tenant_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tenant_members 
    WHERE tenant_id = p_tenant_id 
    AND user_id = p_user_id 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's role in tenant
CREATE OR REPLACE FUNCTION get_tenant_member_role(
  p_tenant_id UUID,
  p_user_id UUID
)
RETURNS TEXT AS $$
DECLARE
  member_role TEXT;
BEGIN
  SELECT role INTO member_role
  FROM tenant_members 
  WHERE tenant_id = p_tenant_id 
  AND user_id = p_user_id 
  AND status = 'active';
  
  RETURN COALESCE(member_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updated_at timestamp
CREATE TRIGGER update_tenant_members_updated_at
  BEFORE UPDATE ON tenant_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update the create_tenant function to use the new table structure
CREATE OR REPLACE FUNCTION create_tenant(
  p_name TEXT,
  p_subdomain TEXT,
  p_plan_id UUID
)
RETURNS UUID AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  INSERT INTO tenants (name, subdomain, plan_id)
  VALUES (p_name, p_subdomain, p_plan_id)
  RETURNING id INTO new_tenant_id;
  
  -- Add creator as tenant admin
  INSERT INTO tenant_members (tenant_id, user_id, role, permissions)
  VALUES (new_tenant_id, auth.uid(), 'admin', '{"all": true}');
  
  RETURN new_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
