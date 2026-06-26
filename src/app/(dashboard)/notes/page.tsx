'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import NoteModal from '@/components/modals/NoteModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import { useApp } from '@/context/AppContext';
import { CURRENT_USER } from '@/lib/demo-data';
import type { NoteType, Note } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const NOTE_TYPE_CONFIG: Record<NoteType, { icon: string; label: string; color: string }> = {
  general: { icon: '📄', label: 'General', color: 'var(--text-secondary)' },
  meeting: { icon: '🤝', label: 'Reunión', color: 'var(--info)' },
  reminder: { icon: '⏰', label: 'Recordatorio', color: 'var(--warning)' },
  idea: { icon: '💡', label: 'Idea', color: 'var(--purple)' },
};

type FilterType = 'all' | NoteType;

export default function NotesPage() {
  const { notes, projects, addNote, updateNote, deleteNote } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const userNotes = notes.filter(n => n.user_id === CURRENT_USER.id);
  const filteredNotes = filter === 'all' ? userNotes : userNotes.filter(n => n.type === filter);

  return (
    <>
      <Header
        title="Notas"
        subtitle="Tus notas personales y de proyecto"
        actions={
          <button className="btn btn-primary" onClick={() => { setEditNote(null); setShowModal(true); }}>
            + Nueva Nota
          </button>
        }
      />
      <div className="app-content">
        {/* Filter tabs */}
        <div className="tabs">
          <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            Todas ({userNotes.length})
          </button>
          {(Object.keys(NOTE_TYPE_CONFIG) as NoteType[]).map(type => {
            const config = NOTE_TYPE_CONFIG[type];
            const count = userNotes.filter(n => n.type === type).length;
            return (
              <button key={type} className={`tab ${filter === type ? 'active' : ''}`} onClick={() => setFilter(type)}>
                {config.icon} {config.label} ({count})
              </button>
            );
          })}
        </div>

        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-title">Sin notas</div>
            <div className="empty-state-description">Crea una nueva nota para organizar tus ideas</div>
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowModal(true)}>
              + Nueva Nota
            </button>
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map(note => {
              const config = NOTE_TYPE_CONFIG[note.type];
              const project = projects.find(p => p.id === note.project_id);

              return (
                <div key={note.id} className="note-card" style={{ background: note.color, position: 'relative' }}>
                  {/* Action buttons */}
                  <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: '2px' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '3px 6px', fontSize: '0.7rem', opacity: 0.7 }}
                      title="Editar"
                      onClick={() => { setEditNote(note); setShowModal(true); }}
                    >✏️</button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '3px 6px', fontSize: '0.7rem', opacity: 0.7, color: 'var(--danger)' }}
                      title="Eliminar"
                      onClick={() => setDeleteId(note.id)}
                    >🗑️</button>
                  </div>

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

      {showModal && (
        <NoteModal
          note={editNote}
          projects={projects}
          onSave={data => editNote ? updateNote(editNote.id, data) : addNote(data)}
          onClose={() => { setShowModal(false); setEditNote(null); }}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          title="Eliminar Nota"
          message="¿Estás seguro de que deseas eliminar esta nota? Esta acción no se puede deshacer."
          confirmLabel="Eliminar Nota"
          onConfirm={() => deleteNote(deleteId)}
          onClose={() => setDeleteId(null)}
        />
      )}
    </>
  );
}
