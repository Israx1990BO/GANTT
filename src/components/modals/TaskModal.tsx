'use client';

import { useState, useEffect } from 'react';
import type { Task, TaskPriority, KanbanStatus, Project } from '@/lib/types';
import { DEMO_USERS } from '@/lib/demo-data';

interface TaskModalProps {
  task?: Task | null;
  projectId: string;
  projects: Project[];
  onSave: (data: Omit<Task, 'id' | 'created_at'>) => void;
  onClose: () => void;
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Baja', color: '#64748b' },
  { value: 'medium', label: 'Media', color: '#3b82f6' },
  { value: 'high', label: 'Alta', color: '#f59e0b' },
  { value: 'critical', label: 'Crítica', color: '#ef4444' },
];

const STATUS_OPTIONS: { value: KanbanStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'Por Hacer' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'review', label: 'Revisión' },
  { value: 'done', label: 'Completado' },
];

export default function TaskModal({ task, projectId, projects, onSave, onClose }: TaskModalProps) {
  const isEdit = !!task;

  const [form, setForm] = useState({
    project_id: task?.project_id || projectId,
    title: task?.title || '',
    description: task?.description || '',
    start_date: task?.start_date || new Date().toISOString().split('T')[0],
    end_date: task?.end_date || '',
    priority: task?.priority || 'medium' as TaskPriority,
    kanban_status: task?.kanban_status || 'todo' as KanbanStatus,
    kanban_order: task?.kanban_order || 0,
    progress: task?.progress || 0,
    assigned_to: task?.assigned_to || null as string | null,
    depends_on: task?.depends_on || null as string | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'El título es obligatorio';
    if (!form.start_date) e.start_date = 'La fecha de inicio es obligatoria';
    if (!form.end_date) e.end_date = 'La fecha de fin es obligatoria';
    if (form.start_date && form.end_date && form.start_date >= form.end_date)
      e.end_date = 'La fecha de fin debe ser posterior al inicio';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave(form);
    onClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Título de la Tarea *</label>
              <input
                className={`input ${errors.title ? 'error' : ''}`}
                placeholder="Ej: Diseño de pantallas"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                className="input"
                rows={2}
                placeholder="Detalla el alcance de esta tarea..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Fecha Inicio *</label>
                <input type="date" className={`input ${errors.start_date ? 'error' : ''}`}
                  value={form.start_date}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                />
                {errors.start_date && <span className="form-error">{errors.start_date}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Fecha Fin *</label>
                <input type="date" className={`input ${errors.end_date ? 'error' : ''}`}
                  value={form.end_date}
                  onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                />
                {errors.end_date && <span className="form-error">{errors.end_date}</span>}
              </div>
            </div>

            {/* Priority & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Prioridad</label>
                <select className="input" value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value as TaskPriority }))}>
                  {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Estado Kanban</label>
                <select className="input" value={form.kanban_status}
                  onChange={e => setForm(f => ({ ...f, kanban_status: e.target.value as KanbanStatus }))}>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Progress */}
            <div className="form-group">
              <label className="form-label">Progreso: <span className="text-accent">{form.progress}%</span></label>
              <input
                type="range" min={0} max={100} step={5}
                value={form.progress}
                onChange={e => setForm(f => ({ ...f, progress: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />
            </div>

            {/* Assigned To */}
            <div className="form-group">
              <label className="form-label">Asignado a</label>
              <select className="input" value={form.assigned_to || ''}
                onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value || null }))}>
                <option value="">— Sin asignar —</option>
                {DEMO_USERS.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>)}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{isEdit ? 'Guardar Cambios' : 'Crear Tarea'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
