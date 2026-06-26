'use client';

import Header from '@/components/layout/Header';
import { DEMO_PROJECTS, DEMO_TASKS, DEMO_EVENTS, CURRENT_USER } from '@/lib/demo-data';
import { formatDate, daysRemaining, getStatusLabel, getPriorityColor } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const totalProjects = DEMO_PROJECTS.length;
  const activeTasks = DEMO_TASKS.filter(t => t.kanban_status !== 'done').length;
  const completedTasks = DEMO_TASKS.filter(t => t.kanban_status === 'done').length;
  const overallProgress = Math.round(
    DEMO_TASKS.reduce((sum, t) => sum + t.progress, 0) / DEMO_TASKS.length
  );
  const todayEvents = DEMO_EVENTS.filter(e => {
    const d = new Date(e.start_time).toDateString();
    return d === new Date().toDateString() && e.user_id === CURRENT_USER.id;
  });
  const urgentTasks = DEMO_TASKS.filter(
    t => t.priority === 'critical' && t.kanban_status !== 'done'
  );

  return (
    <>
      <Header title="Dashboard" subtitle="Vista general de tus proyectos y actividad" />
      <div className="app-content">
        {/* KPIs */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Proyectos Activos</div>
            <div className="kpi-value text-accent">{totalProjects}</div>
            <div className="kpi-sub">{DEMO_PROJECTS.filter(p => p.status === 'active').length} en progreso</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Tareas Pendientes</div>
            <div className="kpi-value" style={{ color: 'var(--warning)' }}>{activeTasks}</div>
            <div className="kpi-sub">{completedTasks} completadas</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Progreso General</div>
            <div className="kpi-value">{overallProgress}%</div>
            <div className="progress-bar mt-2">
              <div className="progress-bar-fill" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Eventos Hoy</div>
            <div className="kpi-value" style={{ color: 'var(--info)' }}>{todayEvents.length}</div>
            <div className="kpi-sub">en tu agenda</div>
          </div>
        </div>

        <div className="grid-2">
          {/* Projects */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Proyectos</h3>
              <Link href="/projects" className="btn btn-ghost btn-sm">Ver todos →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {DEMO_PROJECTS.map(project => {
                const projectTasks = DEMO_TASKS.filter(t => t.project_id === project.id);
                const projectProgress = projectTasks.length > 0
                  ? Math.round(projectTasks.reduce((s, t) => s + t.progress, 0) / projectTasks.length)
                  : 0;
                const remaining = daysRemaining(project.end_date);
                return (
                  <Link href={`/projects/${project.id}`} key={project.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{
                      padding: '12px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      transition: 'all var(--transition)',
                      cursor: 'pointer',
                    }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="color-dot" style={{ background: project.color }} />
                          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{project.name}</span>
                        </div>
                        <span className={`badge ${remaining < 5 ? 'badge-danger' : 'badge-accent'}`}>
                          {remaining > 0 ? `${remaining}d` : 'Vencido'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        <span>{projectTasks.length} tareas · {getStatusLabel(project.status)}</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{projectProgress}%</span>
                      </div>
                      <div className="progress-bar mt-2">
                        <div className="progress-bar-fill" style={{ width: `${projectProgress}%`, background: project.color }} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Today's Events */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">📅 Agenda de Hoy</h3>
                <Link href="/agenda" className="btn btn-ghost btn-sm">Ver agenda →</Link>
              </div>
              {todayEvents.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>No hay eventos para hoy</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {todayEvents.map(event => (
                    <div key={event.id} style={{
                      padding: '10px 12px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius)',
                      borderLeft: `3px solid ${event.color}`,
                    }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{event.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                        {new Date(event.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        {' — '}
                        {new Date(event.end_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Urgent Tasks */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">🔴 Tareas Críticas</h3>
              </div>
              {urgentTasks.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Sin tareas críticas pendientes</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {urgentTasks.map(task => {
                    const project = DEMO_PROJECTS.find(p => p.id === task.project_id);
                    const remaining = daysRemaining(task.end_date);
                    return (
                      <div key={task.id} style={{
                        padding: '10px 12px',
                        background: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius)',
                        borderLeft: `3px solid ${getPriorityColor(task.priority)}`,
                      }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{task.title}</div>
                        <div className="flex items-center justify-between mt-2" style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                          <span>{project?.name}</span>
                          <span className={`badge ${remaining < 3 ? 'badge-danger' : 'badge-warning'}`}>
                            {remaining > 0 ? `${remaining}d restantes` : 'Vencida'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
