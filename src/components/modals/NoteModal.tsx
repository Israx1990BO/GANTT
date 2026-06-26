'use client';

import { useState, useEffect } from 'react';
import type { Note, NoteType } from '@/lib/types';
import { NOTE_COLORS } from '@/lib/types';
import type { Project } from '@/lib/types';
import { CURRENT_USER } from '@/lib/demo-data';

interface NoteModalProps {
  note?: Note | null;
  projects: Project[];
  onSave: (data: Omit<Note, 'id' | 'created_at'>) => void;
  onClose: () => void;
}

const TYPE_OPTIONS: { value: NoteType; label: string; icon: string }[] = [
  { value: 'general', label: 'General', icon: '📄' },
  { value: 'meeting', label: 'Reunión', icon: '🤝' },
  { value: 'reminder', label: 'Recordatorio', icon: '⏰' },
  { value: 'idea', label: 'Idea', icon: '💡' },
];

export default function NoteModal({ note, projects, onSave, onClose }: NoteModalProps) {
  const isEdit = !!note;
  const [form, setForm] = useState({
    user_id: note?.user_id || CURRENT_USER.id,
    project_id: note?.project_id || null as string | null,
    title: note?.title || '',
    content: note?.content || '',
    type: note?.type || 'general' as NoteType,
    color: note?.color || NOTE_COLORS[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'El título es obligatorio';
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
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Editar Nota' : 'Nueva Nota'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Título *</label>
              <input className={`input ${errors.title ? 'error' : ''}`}
                placeholder="Título de la nota..."
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Contenido</label>
              <textarea className="input" rows={5}
                placeholder="Escribe tu nota aquí..."
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select className="input" value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as NoteType }))}>
                  {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.icon} {o.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Proyecto</label>
                <select className="input" value={form.project_id || ''}
                  onChange={e => setForm(f => ({ ...f, project_id: e.target.value || null }))}>
                  <option value="">— Sin proyecto —</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Color de la Nota</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {NOTE_COLORS.map(color => (
                  <button key={color} type="button"
                    onClick={() => setForm(f => ({ ...f, color }))}
                    style={{
                      width: 32, height: 32, borderRadius: 'var(--radius)',
                      background: color,
                      border: form.color === color ? '3px solid white' : '2px solid var(--border)',
                      cursor: 'pointer',
                      outline: form.color === color ? '2px solid var(--accent)' : 'none',
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{isEdit ? 'Guardar Cambios' : 'Crear Nota'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
