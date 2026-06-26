'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/layout/Header';
import { DEMO_EVENTS, DEMO_PROJECTS, CURRENT_USER } from '@/lib/demo-data';
import { isToday, addDays, formatDateTime } from '@/lib/utils';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function AgendaPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const userEvents = DEMO_EVENTS.filter(e => e.user_id === CURRENT_USER.id);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Fill days before first of month
    const startPad = firstDay.getDay();
    for (let i = startPad - 1; i >= 0; i--) {
      days.push({ date: addDays(firstDay, -i - 1), isCurrentMonth: false });
    }

    // Fill current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({ date: new Date(year, month, d), isCurrentMonth: true });
    }

    // Fill rest of grid (complete 6 rows = 42 cells)
    while (days.length < 42) {
      const last = days[days.length - 1].date;
      days.push({ date: addDays(last, 1), isCurrentMonth: false });
    }

    return days;
  }, [currentMonth]);

  const getEventsForDate = (date: Date) => {
    return userEvents.filter(e => {
      const eventDate = new Date(e.start_time);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const monthLabel = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <>
      <Header
        title="Agenda"
        subtitle="Tu calendario personal de eventos y plazos"
        actions={
          <button className="btn btn-primary">+ Nuevo Evento</button>
        }
      />
      <div className="app-content">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          >
            ← Anterior
          </button>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, textTransform: 'capitalize' }}>{monthLabel}</h3>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          >
            Siguiente →
          </button>
        </div>

        {/* Calendar */}
        <div className="agenda-calendar">
          {/* Day headers */}
          {DAY_NAMES.map(name => (
            <div key={name} className="agenda-day-header">{name}</div>
          ))}

          {/* Calendar cells */}
          {calendarDays.map(({ date, isCurrentMonth }, i) => {
            const dayEvents = getEventsForDate(date);
            const today = isToday(date);

            return (
              <div
                key={i}
                className={`agenda-day ${today ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
              >
                <div className="agenda-day-number">{date.getDate()}</div>
                {dayEvents.slice(0, 3).map(event => {
                  const project = DEMO_PROJECTS.find(p => p.id === event.project_id);
                  return (
                    <div
                      key={event.id}
                      className="agenda-event"
                      style={{
                        background: `${event.color}33`,
                        color: event.color,
                        borderLeft: `2px solid ${event.color}`,
                      }}
                      title={`${event.title} — ${formatDateTime(event.start_time)}`}
                    >
                      {event.title}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                    +{dayEvents.length - 3} más
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Upcoming events list */}
        <div className="card" style={{ marginTop: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">Próximos Eventos</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {userEvents
              .filter(e => new Date(e.start_time) >= new Date())
              .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
              .slice(0, 8)
              .map(event => {
                const project = DEMO_PROJECTS.find(p => p.id === event.project_id);
                return (
                  <div key={event.id} style={{
                    padding: '12px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius)',
                    borderLeft: `3px solid ${event.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{event.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        {event.description}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
                      <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {formatDateTime(event.start_time)}
                      </div>
                      {project && (
                        <div className="flex items-center gap-2" style={{ justifyContent: 'flex-end', marginTop: '4px' }}>
                          <div className="color-dot" style={{ background: project.color, width: 6, height: 6 }} />
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{project.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
}
