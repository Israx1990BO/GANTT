'use client';

import { useMemo, useState, useRef } from 'react';
import type { Task, Project } from '@/lib/types';
import { isToday, isWeekend, addDays, toISODate } from '@/lib/utils';

type ZoomLevel = 'day' | 'week' | 'month';

interface GanttChartProps {
  tasks: Task[];
  projects: Project[];
  /** If provided, only show tasks for this project (micro gantt) */
  projectId?: string;
  title?: string;
}

const CELL_WIDTHS: Record<ZoomLevel, number> = {
  day: 36,
  week: 22,
  month: 14,
};

const ROW_HEIGHT = 40;
const LABEL_WIDTH = 210;

export default function GanttChart({ tasks, projects, projectId, title }: GanttChartProps) {
  const [zoom, setZoom] = useState<ZoomLevel>('day');
  const scrollRef = useRef<HTMLDivElement>(null);
  const cellWidth = CELL_WIDTHS[zoom];

  // Filter tasks by project if needed
  const filteredTasks = useMemo(() => {
    if (projectId) return tasks.filter(t => t.project_id === projectId);
    return tasks;
  }, [tasks, projectId]);

  // Calculate the date range for the chart
  const { startDate, endDate, totalDays, dates } = useMemo(() => {
    if (filteredTasks.length === 0) {
      const s = new Date();
      s.setDate(s.getDate() - 7);
      const e = new Date();
      e.setDate(e.getDate() + 30);
      const days = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
      const d: Date[] = [];
      for (let i = 0; i <= days; i++) d.push(addDays(s, i));
      return { startDate: s, endDate: e, totalDays: days, dates: d };
    }

    let minDate = new Date(filteredTasks[0].start_date);
    let maxDate = new Date(filteredTasks[0].end_date);

    filteredTasks.forEach(t => {
      const s = new Date(t.start_date);
      const e = new Date(t.end_date);
      if (s < minDate) minDate = s;
      if (e > maxDate) maxDate = e;
    });

    // Add padding
    const padded_start = addDays(minDate, -5);
    const padded_end = addDays(maxDate, 10);
    const days = Math.ceil((padded_end.getTime() - padded_start.getTime()) / (1000 * 60 * 60 * 24));
    const d: Date[] = [];
    for (let i = 0; i <= days; i++) d.push(addDays(padded_start, i));
    return { startDate: padded_start, endDate: padded_end, totalDays: days, dates: d };
  }, [filteredTasks]);

  // Group tasks by project for the general gantt
  const groupedRows = useMemo(() => {
    if (projectId) {
      // Micro gantt — no grouping, just tasks
      return [{ project: projects.find(p => p.id === projectId)!, tasks: filteredTasks }];
    }
    // General gantt — group by project
    const groups: { project: Project; tasks: Task[] }[] = [];
    projects.forEach(p => {
      const pts = filteredTasks.filter(t => t.project_id === p.id);
      if (pts.length > 0) groups.push({ project: p, tasks: pts });
    });
    return groups;
  }, [filteredTasks, projects, projectId]);

  // Calculate bar position
  const getBarStyle = (task: Task) => {
    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.end_date);
    const offsetDays = Math.max(0, (taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const durationDays = Math.max(1, (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24));

    return {
      left: LABEL_WIDTH + (offsetDays * cellWidth),
      width: Math.max(durationDays * cellWidth, 24),
    };
  };

  // Today line position
  const todayOffset = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const offset = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return LABEL_WIDTH + (offset * cellWidth);
  }, [startDate, cellWidth]);

  // Count total visible rows
  let rowIndex = 0;

  return (
    <div className="gantt-container">
      <div className="gantt-toolbar">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{title || 'Diagrama Gantt'}</h3>
        <div className="gantt-zoom-controls">
          {(['day', 'week', 'month'] as ZoomLevel[]).map(level => (
            <button
              key={level}
              className={`btn btn-sm ${zoom === level ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setZoom(level)}
            >
              {level === 'day' ? 'Día' : level === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      <div className="gantt-scroll-area" ref={scrollRef}>
        <div style={{ minWidth: LABEL_WIDTH + (totalDays * cellWidth), position: 'relative' }}>
          {/* Header */}
          <div className="gantt-header">
            <div className="gantt-header-row">
              <div style={{
                width: LABEL_WIDTH,
                minWidth: LABEL_WIDTH,
                position: 'sticky',
                left: 0,
                zIndex: 11,
                background: 'var(--bg-elevated)',
                padding: '6px 12px',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                borderRight: '1px solid var(--border)',
              }}>
                Tarea
              </div>
              {dates.map((date, i) => {
                const dayLabel = zoom === 'day'
                  ? date.getDate().toString()
                  : zoom === 'week'
                  ? date.getDate().toString()
                  : date.getDate() === 1
                    ? date.toLocaleDateString('es-ES', { month: 'short' })
                    : '';
                return (
                  <div
                    key={i}
                    className={`gantt-header-cell ${isToday(date) ? 'today' : ''} ${isWeekend(date) ? 'weekend' : ''}`}
                    style={{ width: cellWidth, minWidth: cellWidth }}
                    title={date.toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })}
                  >
                    {dayLabel}
                  </div>
                );
              })}
            </div>
            {/* Month row */}
            {zoom !== 'month' && (
              <div className="gantt-header-row" style={{ borderBottom: '2px solid var(--border)' }}>
                <div style={{
                  width: LABEL_WIDTH,
                  minWidth: LABEL_WIDTH,
                  position: 'sticky',
                  left: 0,
                  zIndex: 11,
                  background: 'var(--bg-elevated)',
                  borderRight: '1px solid var(--border)',
                }} />
                {(() => {
                  const months: { label: string; span: number }[] = [];
                  let current = '';
                  dates.forEach(date => {
                    const m = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                    if (m !== current) {
                      months.push({ label: m, span: 1 });
                      current = m;
                    } else {
                      months[months.length - 1].span++;
                    }
                  });
                  return months.map((m, i) => (
                    <div key={i} style={{
                      width: m.span * cellWidth,
                      minWidth: m.span * cellWidth,
                      padding: '4px 8px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      textTransform: 'capitalize',
                      borderRight: '1px solid var(--border)',
                      textAlign: 'center',
                    }}>
                      {m.label}
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>

          {/* Body */}
          <div className="gantt-body">
            {groupedRows.map(group => (
              <div key={group.project.id}>
                {/* Project group header (only for general gantt) */}
                {!projectId && (
                  <div className="gantt-project-group">
                    <div className="color-dot" style={{ background: group.project.color }} />
                    {group.project.name}
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                      ({group.tasks.length} tareas)
                    </span>
                  </div>
                )}

                {/* Task rows */}
                {group.tasks.map(task => {
                  const bar = getBarStyle(task);
                  const color = group.project.color;
                  rowIndex++;
                  return (
                    <div key={task.id} className="gantt-row">
                      <div className="gantt-row-label">
                        {projectId && (
                          <div
                            className="kanban-card-priority"
                            style={{ background: (() => {
                              switch (task.priority) {
                                case 'critical': return '#ef4444';
                                case 'high': return '#f59e0b';
                                case 'medium': return '#3b82f6';
                                default: return '#64748b';
                              }
                            })() }}
                          />
                        )}
                        <span className="truncate">{task.title}</span>
                      </div>
                      <div className="gantt-row-cells">
                        {dates.map((date, i) => (
                          <div
                            key={i}
                            className={`gantt-cell ${isWeekend(date) ? 'weekend' : ''} ${isToday(date) ? 'today' : ''}`}
                            style={{ width: cellWidth, minWidth: cellWidth }}
                          />
                        ))}
                      </div>
                      {/* Bar */}
                      <div
                        className="gantt-bar-container"
                        style={{ left: bar.left, width: bar.width }}
                        title={`${task.title} (${task.progress}%)`}
                      >
                        <div className="gantt-bar" style={{ background: color }}>
                          <div
                            className="gantt-bar-progress"
                            style={{ width: `${task.progress}%` }}
                          />
                          {bar.width > 60 && (
                            <span style={{ position: 'relative', zIndex: 1 }}>
                              {task.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Today line */}
            {todayOffset > LABEL_WIDTH && todayOffset < LABEL_WIDTH + (totalDays * cellWidth) && (
              <div className="gantt-today-line" style={{ left: todayOffset }} />
            )}
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-title">Sin tareas</div>
          <div className="empty-state-description">Crea tareas para visualizar el diagrama Gantt</div>
        </div>
      )}
    </div>
  );
}
