-- ═══════════════════════════════════════════════
-- ProjectFlow — Supabase SQL Schema
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users Profile Table ───
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'consultor' CHECK (role IN ('admin', 'consultor')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Projects ───
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT NOT NULL DEFAULT '#3b82f6',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tasks ───
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  kanban_status TEXT NOT NULL DEFAULT 'backlog' CHECK (kanban_status IN ('backlog', 'todo', 'in_progress', 'review', 'done')),
  kanban_order INTEGER DEFAULT 0,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  depends_on UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Notes ───
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'meeting', 'reminder', 'idea')),
  color TEXT DEFAULT '#1e293b',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Agenda Events ───
CREATE TABLE IF NOT EXISTS agenda_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL DEFAULT 'meeting' CHECK (type IN ('meeting', 'deadline', 'reminder', 'personal')),
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Row Level Security (RLS) ───

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_events ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, edit their own
CREATE POLICY "profiles_read_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: all authenticated users can read; admins can create/edit/delete
CREATE POLICY "projects_read_all" ON projects FOR SELECT USING (true);
CREATE POLICY "projects_insert_admin" ON projects FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "projects_update_admin" ON projects FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "projects_delete_admin" ON projects FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Tasks: all can read; admins can do everything; consultors can update assigned tasks
CREATE POLICY "tasks_read_all" ON tasks FOR SELECT USING (true);
CREATE POLICY "tasks_insert_admin" ON tasks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "tasks_update" ON tasks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  OR assigned_to = auth.uid()
);
CREATE POLICY "tasks_delete_admin" ON tasks FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Notes: users can CRUD their own notes
CREATE POLICY "notes_own" ON notes FOR ALL USING (user_id = auth.uid());

-- Agenda Events: users can CRUD their own events
CREATE POLICY "events_own" ON agenda_events FOR ALL USING (user_id = auth.uid());

-- ─── Auto-create profile on signup ───
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'consultor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Indexes for performance ───
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_kanban ON tasks(kanban_status);
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user ON agenda_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_time ON agenda_events(start_time);
