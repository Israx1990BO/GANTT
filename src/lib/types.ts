/* ─── ProjectFlow Type Definitions ─── */

export type UserRole = 'admin' | 'consultor';

export type ProjectStatus = 'active' | 'completed' | 'on_hold';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type KanbanStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

export type NoteType = 'general' | 'meeting' | 'reminder' | 'idea';

export type AgendaEventType = 'meeting' | 'deadline' | 'reminder' | 'personal';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  start_date: string;
  end_date: string;
  status: ProjectStatus;
  created_by: string;
  created_at: string;
  /* joined */
  tasks?: Task[];
  creator?: User;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  progress: number;
  priority: TaskPriority;
  kanban_status: KanbanStatus;
  kanban_order: number;
  assigned_to: string | null;
  depends_on: string | null;
  created_at: string;
  /* joined */
  project?: Project;
  assignee?: User;
}

export interface Note {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  content: string;
  type: NoteType;
  color: string;
  created_at: string;
  /* joined */
  project?: Project;
}

export interface AgendaEvent {
  id: string;
  user_id: string;
  project_id: string | null;
  task_id: string | null;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  type: AgendaEventType;
  color: string;
  created_at: string;
}

/* ─── Gantt helpers ─── */

export interface GanttRow {
  task: Task;
  projectName?: string;
  projectColor?: string;
}

/* ─── Kanban helpers ─── */

export interface KanbanColumnDef {
  id: KanbanStatus;
  title: string;
  color: string;
}

export const KANBAN_COLUMNS: KanbanColumnDef[] = [
  { id: 'backlog', title: 'Backlog', color: '#64748b' },
  { id: 'todo', title: 'Por Hacer', color: '#3b82f6' },
  { id: 'in_progress', title: 'En Progreso', color: '#f59e0b' },
  { id: 'review', title: 'Revisión', color: '#a855f7' },
  { id: 'done', title: 'Completado', color: '#22c55e' },
];

/* ─── Color Palettes ─── */

export const PROJECT_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#22c55e', '#06b6d4', '#2dd4bf',
  '#6366f1', '#f97316',
];

export const NOTE_COLORS = [
  '#1e293b', '#1e3a5f', '#3b1e5f', '#5f1e3b',
  '#1e5f3b', '#5f4b1e', '#1e5f5f', '#3b3b1e',
];
