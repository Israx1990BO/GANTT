'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Project, Task, Note, AgendaEvent, KanbanStatus } from '@/lib/types';
import { DEMO_PROJECTS, DEMO_TASKS, DEMO_NOTES, DEMO_EVENTS, CURRENT_USER } from '@/lib/demo-data';

/* ─── Supabase availability check ─── */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const isSupabase = SUPABASE_URL && SUPABASE_URL !== 'https://your-project.supabase.co';

const uid = () => Math.random().toString(36).slice(2, 10);
const nowStr = () => new Date().toISOString().split('T')[0];

/* ─── Context shape ─── */
interface AppContextType {
  projects: Project[];
  tasks: Task[];
  notes: Note[];
  events: AgendaEvent[];
  loading: boolean;
  addProject: (p: Omit<Project, 'id' | 'created_at' | 'created_by'>) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<void>;
  addTask: (t: Omit<Task, 'id' | 'created_at'>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  duplicateTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, status: KanbanStatus) => Promise<void>;
  addNote: (n: Omit<Note, 'id' | 'created_at'>) => Promise<void>;
  updateNote: (id: string, data: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addEvent: (e: Omit<AgendaEvent, 'id' | 'created_at'>) => Promise<void>;
  updateEvent: (id: string, data: Partial<AgendaEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

/* ═══════════════════════════════════════════════
   SUPABASE DATA SERVICE
   ═══════════════════════════════════════════════ */
async function getSupabase() {
  const { createClient } = await import('@/lib/supabase/client');
  return createClient();
}

/* ═══════════════════════════════════════════════
   APP PROVIDER
   ═══════════════════════════════════════════════ */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);

  /* ─── Load data on mount ─── */
  useEffect(() => {
    if (isSupabase) {
      loadFromSupabase();
    } else {
      // Demo mode — load demo data
      setProjects(DEMO_PROJECTS);
      setTasks(DEMO_TASKS);
      setNotes(DEMO_NOTES);
      setEvents(DEMO_EVENTS);
      setLoading(false);
    }
  }, []);

  async function loadFromSupabase() {
    try {
      const supabase = await getSupabase();
      const [pRes, tRes, nRes, eRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').order('kanban_order', { ascending: true }),
        supabase.from('notes').select('*').order('created_at', { ascending: false }),
        supabase.from('agenda_events').select('*').order('start_time', { ascending: true }),
      ]);
      if (pRes.data) setProjects(pRes.data as Project[]);
      if (tRes.data) setTasks(tRes.data as Task[]);
      if (nRes.data) setNotes(nRes.data as Note[]);
      if (eRes.data) setEvents(eRes.data as AgendaEvent[]);
    } catch (err) {
      console.error('Error loading from Supabase:', err);
      // Fallback to demo data if Supabase fails
      setProjects(DEMO_PROJECTS);
      setTasks(DEMO_TASKS);
      setNotes(DEMO_NOTES);
      setEvents(DEMO_EVENTS);
    } finally {
      setLoading(false);
    }
  }

  /* ═══════════════════════════════════════════════
     PROJECTS
     ═══════════════════════════════════════════════ */
  const addProject = useCallback(async (p: Omit<Project, 'id' | 'created_at' | 'created_by'>) => {
    if (isSupabase) {
      const supabase = await getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('projects')
        .insert({ ...p, created_by: user?.id })
        .select()
        .single();
      if (!error && data) setProjects(prev => [data as Project, ...prev]);
    } else {
      const newProject: Project = { ...p, id: `p-${uid()}`, created_by: CURRENT_USER.id, created_at: nowStr() };
      setProjects(prev => [newProject, ...prev]);
    }
  }, []);

  const updateProject = useCallback(async (id: string, data: Partial<Project>) => {
    // Optimistic update
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    if (isSupabase) {
      const supabase = await getSupabase();
      const { error } = await supabase.from('projects').update(data).eq('id', id);
      if (error) {
        console.error('Error updating project:', error);
        // Revert on error
        await loadFromSupabase();
      }
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    // Optimistic update
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.project_id !== id));
    if (isSupabase) {
      const supabase = await getSupabase();
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        console.error('Error deleting project:', error);
        await loadFromSupabase();
      }
    }
  }, []);

  const duplicateProject = useCallback(async (id: string) => {
    const original = projects.find(p => p.id === id);
    if (!original) return;
    const { id: _id, created_at: _ca, ...projectData } = original;
    const newName = `${original.name} (copia)`;

    if (isSupabase) {
      const supabase = await getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: newProject, error } = await supabase
        .from('projects')
        .insert({ ...projectData, name: newName, created_by: user?.id })
        .select()
        .single();
      if (!error && newProject) {
        setProjects(prev => [...prev, newProject as Project]);
        // Duplicate tasks
        const projectTasks = tasks.filter(t => t.project_id === id);
        if (projectTasks.length > 0) {
          const newTasks = projectTasks.map(t => {
            const { id: _tid, created_at: _tca, ...taskData } = t;
            return { ...taskData, project_id: newProject.id };
          });
          const { data: createdTasks } = await supabase.from('tasks').insert(newTasks).select();
          if (createdTasks) setTasks(prev => [...prev, ...(createdTasks as Task[])]);
        }
      }
    } else {
      const newId = `p-${uid()}`;
      setProjects(prev => [...prev, { ...original, id: newId, name: newName, created_at: nowStr() }]);
      const projectTasks = tasks.filter(t => t.project_id === id);
      setTasks(prev => [...prev, ...projectTasks.map(t => ({ ...t, id: `t-${uid()}`, project_id: newId, created_at: nowStr() }))]);
    }
  }, [projects, tasks]);

  /* ═══════════════════════════════════════════════
     TASKS
     ═══════════════════════════════════════════════ */
  const addTask = useCallback(async (t: Omit<Task, 'id' | 'created_at'>) => {
    if (isSupabase) {
      const supabase = await getSupabase();
      const { data, error } = await supabase.from('tasks').insert(t).select().single();
      if (!error && data) setTasks(prev => [...prev, data as Task]);
    } else {
      setTasks(prev => [...prev, { ...t, id: `t-${uid()}`, created_at: nowStr() }]);
    }
  }, []);

  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    if (isSupabase) {
      const supabase = await getSupabase();
      const { error } = await supabase.from('tasks').update(data).eq('id', id);
      if (error) {
        console.error('Error updating task:', error);
        await loadFromSupabase();
      }
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (isSupabase) {
      const supabase = await getSupabase();
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) {
        console.error('Error deleting task:', error);
        await loadFromSupabase();
      }
    }
  }, []);

  const duplicateTask = useCallback(async (id: string) => {
    const original = tasks.find(t => t.id === id);
    if (!original) return;
    const { id: _id, created_at: _ca, ...taskData } = original;
    const newTitle = `${original.title} (copia)`;

    if (isSupabase) {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...taskData, title: newTitle })
        .select()
        .single();
      if (!error && data) setTasks(prev => [...prev, data as Task]);
    } else {
      setTasks(prev => [...prev, { ...original, id: `t-${uid()}`, title: newTitle, created_at: nowStr() }]);
    }
  }, [tasks]);

  const moveTask = useCallback(async (taskId: string, status: KanbanStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, kanban_status: status } : t));
    if (isSupabase) {
      const supabase = await getSupabase();
      await supabase.from('tasks').update({ kanban_status: status }).eq('id', taskId);
    }
  }, []);

  /* ═══════════════════════════════════════════════
     NOTES
     ═══════════════════════════════════════════════ */
  const addNote = useCallback(async (n: Omit<Note, 'id' | 'created_at'>) => {
    if (isSupabase) {
      const supabase = await getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('notes')
        .insert({ ...n, user_id: user?.id })
        .select()
        .single();
      if (!error && data) setNotes(prev => [data as Note, ...prev]);
    } else {
      setNotes(prev => [{ ...n, id: `n-${uid()}`, created_at: nowStr() }, ...prev]);
    }
  }, []);

  const updateNote = useCallback(async (id: string, data: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...data } : n));
    if (isSupabase) {
      const supabase = await getSupabase();
      await supabase.from('notes').update(data).eq('id', id);
    }
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (isSupabase) {
      const supabase = await getSupabase();
      await supabase.from('notes').delete().eq('id', id);
    }
  }, []);

  /* ═══════════════════════════════════════════════
     EVENTS
     ═══════════════════════════════════════════════ */
  const addEvent = useCallback(async (e: Omit<AgendaEvent, 'id' | 'created_at'>) => {
    if (isSupabase) {
      const supabase = await getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('agenda_events')
        .insert({ ...e, user_id: user?.id })
        .select()
        .single();
      if (!error && data) setEvents(prev => [...prev, data as AgendaEvent]);
    } else {
      setEvents(prev => [...prev, { ...e, id: `e-${uid()}`, created_at: nowStr() }]);
    }
  }, []);

  const updateEvent = useCallback(async (id: string, data: Partial<AgendaEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    if (isSupabase) {
      const supabase = await getSupabase();
      await supabase.from('agenda_events').update(data).eq('id', id);
    }
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    if (isSupabase) {
      const supabase = await getSupabase();
      await supabase.from('agenda_events').delete().eq('id', id);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      projects, tasks, notes, events, loading,
      addProject, updateProject, deleteProject, duplicateProject,
      addTask, updateTask, deleteTask, duplicateTask, moveTask,
      addNote, updateNote, deleteNote,
      addEvent, updateEvent, deleteEvent,
    }}>
      {loading ? (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-base)', flexDirection: 'column', gap: '16px',
        }}>
          <div style={{
            width: 40, height: 40, border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Cargando datos...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
