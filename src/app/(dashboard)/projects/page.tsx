'use client';

import Header from '@/components/layout/Header';
import { DEMO_PROJECTS, DEMO_TASKS } from '@/lib/demo-data';
import { formatDate, daysRemaining, getStatusLabel } from '@/lib/utils';
import Link from 'next/link';

export default function ProjectsPage() {
  return (
    <>
      <Header
        title="Proyectos"
        subtitle="Gestiona todos los proyectos del área"
        actions={
          <button className="btn btn-primary">+ Nuevo Proyecto</button>
        }
      />
      <div className="app-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {DEMO_PROJECTS.map(project => {
            const projectTasks = DEMO_TASKS.filter(t => t.project_id === project.id);
            const progress = projectTasks.length > 0
              ? Math.round(projectTasks.reduce((s, t) => s + t.progress, 0) / projectTasks.length)
              : 0;
            const remaining = daysRemaining(project.end_date);
            const completedCount = projectTasks.filter(t => t.kanban_status === 'done').length;

            return (
              <Link href={`/projects/${project.id}`} key={project.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card" style={{ cursor: 'pointer', height: '100%' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="color-dot" style={{ background: project.color, width: 12, height: 12 }} />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{project.name}</h3>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                    {project.description}
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
                      {remaining > 0 ? `${remaining} días restantes` : 'Vencido'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
