'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { DEMO_NOTES, DEMO_PROJECTS, CURRENT_USER } from '@/lib/demo-data';
import type { NoteType } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const NOTE_TYPE_CONFIG: Record<NoteType, { icon: string; label: string; color: string }> = {
  general: { icon: '📄', label: 'General', color: 'var(--text-secondary)' },
  meeting: { icon: '🤝', label: 'Reunión', color: 'var(--info)' },
  reminder: { icon: '⏰', label: 'Recordatorio', color: 'var(--warning)' },
  idea: { icon: '💡', label: 'Idea', color: 'var(--purple)' },
};

type FilterType = 'all' | NoteType;

export default function NotesPage() {
  const [filter, setFilter] = useState<FilterType>('all');

  const userNotes = DEMO_NOTES.filter(n => n.user_id === CURRENT_USER.id);
  const filteredNotes = filter === 'all'
    ? userNotes
    : userNotes.filter(n => n.type === filter);

  return (
    <>
      <Header
        title="Notas"
        subtitle="Tus notas personales y de proyecto"
        actions={
          <button className="btn btn-primary">+ Nueva Nota</button>
        }
      />
      <div className="app-content">
        {/* Filter tabs */}
        <div className="tabs">
          <button
            className={`tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas ({userNotes.length})
          </button>
          {(Object.keys(NOTE_TYPE_CONFIG) as NoteType[]).map(type => {
            const config = NOTE_TYPE_CONFIG[type];
            const count = userNotes.filter(n => n.type === type).length;
            return (
              <button
                key={type}
                className={`tab ${filter === type ? 'active' : ''}`}
                onClick={() => setFilter(type)}
              >
                {config.icon} {config.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Notes grid */}
        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-title">Sin notas</div>
            <div className="empty-state-description">Crea una nueva nota para empezar a organizar tus ideas</div>
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map(note => {
              const config = NOTE_TYPE_CONFIG[note.type];
              const project = DEMO_PROJECTS.find(p => p.id === note.project_id);

              return (
                <div
                  key={note.id}
                  className="note-card"
                  style={{ background: note.color }}
                >
                  <div className="note-card-type" style={{ color: config.color }}>
                    {config.icon} {config.label}
                  </div>
                  <div className="note-card-title">{note.title}</div>
                  <div className="note-card-content">{note.content}</div>
                  <div className="note-card-footer">
                    <span>{formatDate(note.created_at)}</span>
                    {project && (
                      <div className="flex items-center gap-2">
                        <div className="color-dot" style={{ background: project.color, width: 6, height: 6 }} />
                        <span>{project.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
