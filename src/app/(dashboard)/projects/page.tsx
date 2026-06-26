'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import ProjectModal from '@/components/modals/ProjectModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import { useApp } from '@/context/AppContext';
import { formatDate, daysRemaining, getStatusLabel } from '@/lib/utils';
import Link from 'next/link';
import type { Project } from '@/lib/types';

export default function ProjectsPage() {
  const { projects, tasks, addProject, updateProject, deleteProject, duplicateProject } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <>
      <Header
        title="Proyectos"
        subtitle="Gestiona todos los proyectos del área"
        actions={
          <button className="btn btn-primary" onClick={() => { setEditProject(null); setShowModal(true); }}>
            + Nuevo Proyecto
          </button>
        }
      />
      <div className="app-content">
        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📁</div>
            <div className="empty-state-title">Sin proyectos</div>
            <div className="empty-state-description">Crea tu primer proyecto para empezar</div>
            <button className="btn btn-primary mt-4" onClick={() => setShowModal(true)}>+ Nuevo Proyecto</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {projects.map(project => {
              const projectTasks = tasks.filter(t => t.project_id === project.id);
              const progress = projectTasks.length > 0
                ? Math.round(projectTasks.reduce((s, t) => s + t.progress, 0) / projectTasks.length)
                : 0;
              const remaining = daysRemaining(project.end_date);
              const completedCount = projectTasks.filter(t => t.kanban_status === 'done').length;

              return (
                <div key={project.id} className="card" style={{ position: 'relative' }}>
                  {/* Action buttons */}
                  <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: '4px' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      title="Editar proyecto"
                      onClick={() => { setEditProject(project); setShowModal(true); }}
                    >✏️</button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      title="Duplicar proyecto"
                      onClick={() => duplicateProject(project.id)}
                    >📋</button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--danger)' }}
                      title="Eliminar proyecto"
                      onClick={() => setDeleteId(project.id)}
                    >🗑️</button>
                  </div>

                  <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="flex items-center gap-2 mb-2" style={{ paddingRight: '100px' }}>
                      <div className="color-dot" style={{ background: project.color, width: 12, height: 12 }} />
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{project.name}</h3>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                      {project.description || 'Sin descripción'}
                    </p>

                    <div className="flex items-center justify-between mb-2" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      <span>{formatDate(project.start_date)} — {formatDate(project.end_date)}</span>
                      <span className={`badge ${project.status === 'active' ? 'badge-accent' : project.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </div>

                    <div className="progress-bar mb-2">
                      <div className="progress-bar-fill" style={{ width: `${progress}%`, background: project.color }} />
                    </div>

                    <div className="flex items-center justify-between" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      <span>{completedCount}/{projectTasks.length} tareas completadas</span>
                      <span className={remaining < 5 ? 'text-accent' : ''} style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {remaining > 0 ? `${remaining}d restantes` : 'Vencido'}
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Project Modal */}
      {showModal && (
        <ProjectModal
          project={editProject}
          onSave={data => editProject ? updateProject(editProject.id, data) : addProject(data)}
          onClose={() => { setShowModal(false); setEditProject(null); }}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <ConfirmDialog
          title="Eliminar Proyecto"
          message="¿Estás seguro? Esta acción eliminará el proyecto y todas sus tareas. No se puede deshacer."
          confirmLabel="Eliminar Proyecto"
          onConfirm={() => deleteProject(deleteId)}
          onClose={() => setDeleteId(null)}
        />
      )}
    </>
  );
}
