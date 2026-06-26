'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import GanttChart from '@/components/gantt/GanttChart';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { DEMO_PROJECTS, DEMO_TASKS, DEMO_USERS } from '@/lib/demo-data';
import { formatDate, daysRemaining, getInitials, getPriorityLabel, getPriorityColor } from '@/lib/utils';

type ViewTab = 'gantt' | 'kanban' | 'tasks';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [activeTab, setActiveTab] = useState<ViewTab>('gantt');

  const project = DEMO_PROJECTS.find(p => p.id === projectId);
  const projectTasks = DEMO_TASKS.filter(t => t.project_id === projectId);

  if (!project) {
    return (
      <>
        <Header title="Proyecto no encontrado" />
        <div className="app-content">
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">Proyecto no encontrado</div>
          </div>
        </div>
      </>
    );
  }

  const progress = projectTasks.length > 0
    ? Math.round(projectTasks.reduce((s, t) => s + t.progress, 0) / projectTasks.length)
    : 0;
  const remaining = daysRemaining(project.end_date);
  const completedCount = projectTasks.filter(t => t.kanban_status === 'done').length;

  return (
    <>
      <Header
        title={project.name}
        subtitle={project.description}
      />
      <div className="app-content">
        {/* Project Summary */}
        <div className="kpi-grid" style={{ marginBottom: '20px' }}>
          <div className="kpi-card">
            <div className="kpi-label">Progreso</div>
            <div className="kpi-value text-accent">{progress}%</div>
            <div className="progress-bar mt-2">
              <div className="progress-bar-fill" style={{ width: `${progress}%`, background: project.color }} />
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Tareas</div>
            <div className="kpi-value">{completedCount}<span style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}>/{projectTasks.length}</span></div>
            <div className="kpi-sub">completadas</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Plazo</div>
            <div className="kpi-value" style={{ color: remaining < 5 ? 'var(--danger)' : 'var(--warning)' }}>
              {remaining > 0 ? remaining : 0}
            </div>
            <div className="kpi-sub">{remaining > 0 ? 'días restantes' : '¡Vencido!'}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Período</div>
            <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: '8px' }}>
              {formatDate(project.start_date)}
              <br />
              {formatDate(project.end_date)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'gantt' ? 'active' : ''}`} onClick={() => setActiveTab('gantt')}>
            📊 Micro Gantt
          </button>
          <button className={`tab ${activeTab === 'kanban' ? 'active' : ''}`} onClick={() => setActiveTab('kanban')}>
            📋 Kanban
          </button>
          <button className={`tab ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
            📝 Lista de Tareas
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'gantt' && (
          <GanttChart
            tasks={DEMO_TASKS}
            projects={DEMO_PROJECTS}
            projectId={projectId}
            title={`Micro Gantt — ${project.name}`}
          />
        )}

        {activeTab === 'kanban' && (
          <KanbanBoard tasks={projectTasks} />
        )}

        {activeTab === 'tasks' && (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Tarea</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Asignado</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th>Progreso</th>
                  </tr>
                </thead>
                <tbody>
                  {projectTasks.map(task => {
                    const assignee = DEMO_USERS.find(u => u.id === task.assigned_to);
                    return (
                      <tr key={task.id}>
                        <td style={{ fontWeight: 600 }}>{task.title}</td>
                        <td>
                          <span className="badge" style={{
                            background: `${getPriorityColor(task.priority)}22`,
                            color: getPriorityColor(task.priority),
                          }}>
                            {getPriorityLabel(task.priority)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            task.kanban_status === 'done' ? 'badge-success' :
                            task.kanban_status === 'in_progress' ? 'badge-warning' :
                            task.kanban_status === 'review' ? 'badge-purple' :
                            'badge-info'
                          }`}>
                            {task.kanban_status === 'done' ? 'Completado' :
                             task.kanban_status === 'in_progress' ? 'En Progreso' :
                             task.kanban_status === 'review' ? 'Revisión' :
                             task.kanban_status === 'todo' ? 'Por Hacer' : 'Backlog'}
                          </span>
                        </td>
                        <td>
                          {assignee ? (
                            <div className="flex items-center gap-2">
                              <div className="kanban-card-assignee">{getInitials(assignee.full_name)}</div>
                              <span style={{ fontSize: '0.82rem' }}>{assignee.full_name}</span>
                            </div>
                          ) : '—'}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                          {formatDate(task.start_date)}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                          {formatDate(task.end_date)}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="progress-bar" style={{ width: '60px' }}>
                              <div className="progress-bar-fill" style={{ width: `${task.progress}%` }} />
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                              {task.progress}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
