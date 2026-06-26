'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import type { Task, KanbanStatus } from '@/lib/types';
import { KANBAN_COLUMNS } from '@/lib/types';
import { DEMO_USERS } from '@/lib/demo-data';
import { getInitials, getPriorityColor, formatDate } from '@/lib/utils';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove?: (taskId: string, newStatus: KanbanStatus) => void;
}

/* ─── Sortable Card ─── */
function SortableCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { status: task.kanban_status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
}

/* ─── Task Card ─── */
function TaskCard({ task }: { task: Task }) {
  const assignee = DEMO_USERS.find(u => u.id === task.assigned_to);

  return (
    <div className="kanban-card">
      <div className="kanban-card-title">{task.title}</div>
      <div className="kanban-card-meta">
        <div className="flex items-center gap-2">
          <div
            className="kanban-card-priority"
            style={{ background: getPriorityColor(task.priority) }}
          />
          <span className="kanban-card-dates">{formatDate(task.end_date)}</span>
        </div>
        {assignee && (
          <div className="kanban-card-assignee" title={assignee.full_name}>
            {getInitials(assignee.full_name)}
          </div>
        )}
      </div>
      {task.progress > 0 && (
        <div className="kanban-card-footer">
          <div className="progress-bar" style={{ flex: 1 }}>
            <div className="progress-bar-fill" style={{ width: `${task.progress}%` }} />
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginLeft: '8px', fontFamily: 'var(--font-mono)' }}>
            {task.progress}%
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Droppable Column ─── */
function DroppableColumn({ columnId, children }: { columnId: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });
  return (
    <div
      ref={setNodeRef}
      className={`kanban-column-body ${isOver ? 'drag-over' : ''}`}
    >
      {children}
    </div>
  );
}

/* ─── Kanban Board ─── */
export default function KanbanBoard({ tasks: initialTasks, onTaskMove }: KanbanBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Determine target column
    let targetStatus: KanbanStatus;

    // Check if dropped on a column directly
    const isColumn = KANBAN_COLUMNS.some(c => c.id === overId);
    if (isColumn) {
      targetStatus = overId as KanbanStatus;
    } else {
      // Dropped on a task — use that task's column
      const overTask = tasks.find(t => t.id === overId);
      if (!overTask) return;
      targetStatus = overTask.kanban_status;
    }

    setTasks(prev =>
      prev.map(t =>
        t.id === activeId ? { ...t, kanban_status: targetStatus } : t
      )
    );

    onTaskMove?.(activeId, targetStatus);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {KANBAN_COLUMNS.map(column => {
          const columnTasks = tasks.filter(t => t.kanban_status === column.id);
          return (
            <div key={column.id} className="kanban-column">
              <div className="kanban-column-header">
                <div className="kanban-column-title">
                  <div className="color-dot" style={{ background: column.color }} />
                  {column.title}
                </div>
                <span className="kanban-column-count">{columnTasks.length}</span>
              </div>
              <DroppableColumn columnId={column.id}>
                <SortableContext
                  items={columnTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columnTasks.map(task => (
                    <SortableCard key={task.id} task={task} />
                  ))}
                  {columnTasks.length === 0 && (
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '0.78rem',
                      border: '1px dashed var(--border)',
                      borderRadius: 'var(--radius)',
                    }}>
                      Arrastra tareas aquí
                    </div>
                  )}
                </SortableContext>
              </DroppableColumn>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
}
