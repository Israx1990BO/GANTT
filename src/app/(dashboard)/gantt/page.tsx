'use client';

import Header from '@/components/layout/Header';
import GanttChart from '@/components/gantt/GanttChart';
import { DEMO_PROJECTS, DEMO_TASKS } from '@/lib/demo-data';

export default function GanttPage() {
  return (
    <>
      <Header title="Gantt General" subtitle="Vista consolidada de todos los proyectos del área" />
      <div className="app-content">
        <GanttChart
          tasks={DEMO_TASKS}
          projects={DEMO_PROJECTS}
          title="Gantt General — Todos los Proyectos"
        />
      </div>
    </>
  );
}
