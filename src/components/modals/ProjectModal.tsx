'use client';

import { useState, useEffect } from 'react';
import type { Project, ProjectStatus } from '@/lib/types';
import { PROJECT_COLORS } from '@/lib/types';

interface ProjectModalProps {
  project?: Project | null;
  onSave: (data: Omit<Project, 'id' | 'created_at' | 'created_by'>) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'active', label: 'Activo' },
  { value: 'on_hold', label: 'En Pausa' },
  { value: 'completed', label: 'Completado' },
];

export default function ProjectModal({ project, onSave, onClose }: ProjectModalProps) {
  const isEdit = !!project;

  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    color: project?.color || PROJECT_COLORS[0],
    start_date: project?.start_date || new Date().toISOString().split('T')[0],
    end_date: project?.end_date || '',
    status: project?.status || 'active' as ProjectStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'El nombre es obligatorio';
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

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Name */}
            <div className="form-group">
              <label className="form-label">Nombre del Proyecto *</label>
              <input
                className={`input ${errors.name ? 'error' : ''}`}
                placeholder="Ej: Rediseño Portal Web"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Describe el objetivo del proyecto..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Fecha de Inicio *</label>
                <input
                  type="date"
                  className={`input ${errors.start_date ? 'error' : ''}`}
                  value={form.start_date}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                />
                {errors.start_date && <span className="form-error">{errors.start_date}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de Fin *</label>
                <input
                  type="date"
                  className={`input ${errors.end_date ? 'error' : ''}`}
                  value={form.end_date}
                  onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                />
                {errors.end_date && <span className="form-error">{errors.end_date}</span>}
              </div>
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                className="input"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as ProjectStatus }))}
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div className="form-group">
              <label className="form-label">Color del Proyecto</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {PROJECT_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, color }))}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: color,
                      border: form.color === color ? '3px solid white' : '2px solid transparent',
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
            <button type="submit" className="btn btn-primary">{isEdit ? 'Guardar Cambios' : 'Crear Proyecto'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
