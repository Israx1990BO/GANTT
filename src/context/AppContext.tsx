'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Project, Task, Note, AgendaEvent, KanbanStatus } from '@/lib/types';
import {
  DEMO_PROJECTS, DEMO_TASKS, DEMO_NOTES, DEMO_EVENTS, CURRENT_USER,
} from '@/lib/demo-data';

/* ─── Context shape ─── */
interface AppContextType {
  projects: Project[];
  tasks: Task[];
  notes: Note[];
  events: AgendaEvent[];

  // Projects
  addProject: (p: Omit<Project, 'id' | 'created_at' | 'created_by'>) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;

  // Tasks
  addTask: (t: Omit<Task, 'id' | 'created_at'>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  duplicateTask: (id: string) => void;
  moveTask: (taskId: string, status: KanbanStatus) => void;

  // Notes
  addNote: (n: Omit<Note, 'id' | 'created_at'>) => void;
  updateNote: (id: string, data: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // Events
  addEvent: (e: Omit<AgendaEvent, 'id' | 'created_at'>) => void;
  updateEvent: (id: string, data: Partial<AgendaEvent>) => void;
  deleteEvent: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString().split('T')[0];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(DEMO_TASKS);
  const [notes, setNotes] = useState<Note[]>(DEMO_NOTES);
  const [events, setEvents] = useState<AgendaEvent[]>(DEMO_EVENTS);

  /* ─── Projects ─── */
  const addProject = useCallback((p: Omit<Project, 'id' | 'created_at' | 'created_by'>) => {
    setProjects(prev => [...prev, { ...p, id: `p-${uid()}`, created_by: CURRENT_USER.id, created_at: now() }]);
  }, []);

  const updateProject = useCallback((id: string, data: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.project_id !== id));
  }, []);

  const duplicateProject = useCallback((id: string) => {
    const original = projects.find(p => p.id === id);
    if (!original) return;
    const newId = `p-${uid()}`;
    setProjects(prev => [...prev, { ...original, id: newId, name: `${original.name} (copia)`, created_at: now() }]);
    // Also duplicate tasks
    const projectTasks = tasks.filter(t => t.project_id === id);
    setTasks(prev => [...prev, ...projectTasks.map(t => ({ ...t, id: `t-${uid()}`, project_id: newId, created_at: now() }))]);
  }, [projects, tasks]);

  /* ─── Tasks ─── */
  const addTask = useCallback((t: Omit<Task, 'id' | 'created_at'>) => {
    setTasks(prev => [...prev, { ...t, id: `t-${uid()}`, created_at: now() }]);
  }, []);

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const duplicateTask = useCallback((id: string) => {
    const original = tasks.find(t => t.id === id);
    if (!original) return;
    setTasks(prev => [...prev, { ...original, id: `t-${uid()}`, title: `${original.title} (copia)`, created_at: now() }]);
  }, [tasks]);

  const moveTask = useCallback((taskId: string, status: KanbanStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, kanban_status: status } : t));
  }, []);

  /* ─── Notes ─── */
  const addNote = useCallback((n: Omit<Note, 'id' | 'created_at'>) => {
    setNotes(prev => [...prev, { ...n, id: `n-${uid()}`, created_at: now() }]);
  }, []);

  const updateNote = useCallback((id: string, data: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...data } : n));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  /* ─── Events ─── */
  const addEvent = useCallback((e: Omit<AgendaEvent, 'id' | 'created_at'>) => {
    setEvents(prev => [...prev, { ...e, id: `e-${uid()}`, created_at: now() }]);
  }, []);

  const updateEvent = useCallback((id: string, data: Partial<AgendaEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      projects, tasks, notes, events,
      addProject, updateProject, deleteProject, duplicateProject,
      addTask, updateTask, deleteTask, duplicateTask, moveTask,
      addNote, updateNote, deleteNote,
      addEvent, updateEvent, deleteEvent,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
