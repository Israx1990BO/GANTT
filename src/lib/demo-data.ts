/* ─── ProjectFlow — Demo Data Store ───
 * This module provides a fully functional in-memory store so the app
 * works as a demo without requiring a Supabase connection.
 * When Supabase is configured, the app components can switch to live data.
 */

import type { User, Project, Task, Note, AgendaEvent } from './types';

const today = new Date();
const d = (offset: number) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + offset);
  return dt.toISOString().split('T')[0];
};
const dt = (offset: number, hour: number = 10) => {
  const t = new Date(today);
  t.setDate(t.getDate() + offset);
  t.setHours(hour, 0, 0, 0);
  return t.toISOString();
};

export const DEMO_USERS: User[] = [
  { id: 'u1', email: 'admin@projectflow.com', full_name: 'Carlos Mendoza', role: 'admin', created_at: d(-60) },
  { id: 'u2', email: 'ana@projectflow.com', full_name: 'Ana Gutiérrez', role: 'consultor', created_at: d(-45) },
  { id: 'u3', email: 'marco@projectflow.com', full_name: 'Marco Ríos', role: 'consultor', created_at: d(-30) },
];

export const DEMO_PROJECTS: Project[] = [
  {
    id: 'p1', name: 'Rediseño Portal Web', description: 'Rediseño completo del portal institucional con nueva identidad visual.',
    color: '#3b82f6', start_date: d(-10), end_date: d(25), status: 'active', created_by: 'u1', created_at: d(-10),
  },
  {
    id: 'p2', name: 'App Móvil Estudiantes', description: 'Desarrollo de la aplicación móvil para consulta de notas y horarios.',
    color: '#8b5cf6', start_date: d(-5), end_date: d(35), status: 'active', created_by: 'u1', created_at: d(-5),
  },
  {
    id: 'p3', name: 'Migración Base de Datos', description: 'Migración de MySQL a PostgreSQL del sistema académico.',
    color: '#f59e0b', start_date: d(-20), end_date: d(5), status: 'active', created_by: 'u1', created_at: d(-20),
  },
  {
    id: 'p4', name: 'Capacitación Docente', description: 'Programa de capacitación en herramientas digitales para docentes.',
    color: '#22c55e', start_date: d(5), end_date: d(40), status: 'active', created_by: 'u2', created_at: d(-2),
  },
];

export const DEMO_TASKS: Task[] = [
  // Project 1 — Rediseño Portal Web
  { id: 't1', project_id: 'p1', title: 'Wireframes UI/UX', description: 'Crear wireframes de todas las páginas principales.', start_date: d(-10), end_date: d(-4), progress: 100, priority: 'high', kanban_status: 'done', kanban_order: 0, assigned_to: 'u2', depends_on: null, created_at: d(-10) },
  { id: 't2', project_id: 'p1', title: 'Diseño Visual', description: 'Implementar diseño visual basado en wireframes aprobados.', start_date: d(-3), end_date: d(4), progress: 65, priority: 'high', kanban_status: 'in_progress', kanban_order: 0, assigned_to: 'u2', depends_on: 't1', created_at: d(-10) },
  { id: 't3', project_id: 'p1', title: 'Maquetación Frontend', description: 'Convertir diseños a HTML/CSS/JS.', start_date: d(5), end_date: d(15), progress: 0, priority: 'medium', kanban_status: 'todo', kanban_order: 0, assigned_to: 'u3', depends_on: 't2', created_at: d(-10) },
  { id: 't4', project_id: 'p1', title: 'Integración Backend', description: 'Conectar frontend con APIs existentes.', start_date: d(14), end_date: d(22), progress: 0, priority: 'medium', kanban_status: 'backlog', kanban_order: 0, assigned_to: 'u3', depends_on: 't3', created_at: d(-10) },
  { id: 't5', project_id: 'p1', title: 'QA y Testing', description: 'Pruebas de funcionalidad y usabilidad.', start_date: d(20), end_date: d(25), progress: 0, priority: 'critical', kanban_status: 'backlog', kanban_order: 1, assigned_to: 'u1', depends_on: 't4', created_at: d(-10) },

  // Project 2 — App Móvil
  { id: 't6', project_id: 'p2', title: 'Definir Arquitectura', description: 'Definir stack tecnológico y arquitectura de la app.', start_date: d(-5), end_date: d(-2), progress: 100, priority: 'critical', kanban_status: 'done', kanban_order: 0, assigned_to: 'u1', depends_on: null, created_at: d(-5) },
  { id: 't7', project_id: 'p2', title: 'Diseño de Pantallas', description: 'Diseño de todas las pantallas de la app.', start_date: d(-1), end_date: d(8), progress: 40, priority: 'high', kanban_status: 'in_progress', kanban_order: 1, assigned_to: 'u2', depends_on: 't6', created_at: d(-5) },
  { id: 't8', project_id: 'p2', title: 'API REST', description: 'Desarrollo de endpoints REST para la app.', start_date: d(3), end_date: d(18), progress: 10, priority: 'high', kanban_status: 'in_progress', kanban_order: 2, assigned_to: 'u3', depends_on: null, created_at: d(-5) },
  { id: 't9', project_id: 'p2', title: 'Desarrollo Flutter', description: 'Implementación de la app en Flutter.', start_date: d(10), end_date: d(30), progress: 0, priority: 'medium', kanban_status: 'todo', kanban_order: 1, assigned_to: 'u3', depends_on: 't7', created_at: d(-5) },
  { id: 't10', project_id: 'p2', title: 'Deploy App Stores', description: 'Publicar en Google Play y App Store.', start_date: d(30), end_date: d(35), progress: 0, priority: 'low', kanban_status: 'backlog', kanban_order: 2, assigned_to: 'u1', depends_on: 't9', created_at: d(-5) },

  // Project 3 — Migración BD
  { id: 't11', project_id: 'p3', title: 'Auditoría BD Actual', description: 'Analizar estructura y datos de la BD actual.', start_date: d(-20), end_date: d(-14), progress: 100, priority: 'high', kanban_status: 'done', kanban_order: 0, assigned_to: 'u1', depends_on: null, created_at: d(-20) },
  { id: 't12', project_id: 'p3', title: 'Script de Migración', description: 'Escribir scripts de migración automática.', start_date: d(-13), end_date: d(-5), progress: 100, priority: 'critical', kanban_status: 'done', kanban_order: 1, assigned_to: 'u3', depends_on: 't11', created_at: d(-20) },
  { id: 't13', project_id: 'p3', title: 'Migración de Prueba', description: 'Ejecutar migración en entorno de pruebas.', start_date: d(-4), end_date: d(1), progress: 80, priority: 'critical', kanban_status: 'review', kanban_order: 0, assigned_to: 'u3', depends_on: 't12', created_at: d(-20) },
  { id: 't14', project_id: 'p3', title: 'Migración Producción', description: 'Ejecutar migración en servidor de producción.', start_date: d(2), end_date: d(5), progress: 0, priority: 'critical', kanban_status: 'todo', kanban_order: 2, assigned_to: 'u1', depends_on: 't13', created_at: d(-20) },

  // Project 4 — Capacitación
  { id: 't15', project_id: 'p4', title: 'Planificar Contenido', description: 'Definir temario y materiales del curso.', start_date: d(5), end_date: d(12), progress: 0, priority: 'medium', kanban_status: 'todo', kanban_order: 3, assigned_to: 'u2', depends_on: null, created_at: d(-2) },
  { id: 't16', project_id: 'p4', title: 'Grabar Videos', description: 'Producir videos tutoriales.', start_date: d(13), end_date: d(28), progress: 0, priority: 'medium', kanban_status: 'backlog', kanban_order: 3, assigned_to: 'u2', depends_on: 't15', created_at: d(-2) },
  { id: 't17', project_id: 'p4', title: 'Sesiones en Vivo', description: 'Impartir sesiones en vivo con docentes.', start_date: d(30), end_date: d(40), progress: 0, priority: 'high', kanban_status: 'backlog', kanban_order: 4, assigned_to: 'u1', depends_on: 't16', created_at: d(-2) },
];

export const DEMO_NOTES: Note[] = [
  { id: 'n1', user_id: 'u1', project_id: 'p1', title: 'Paleta de Colores Aprobada', content: 'Se aprobó la paleta azul institucional con acentos en verde esmeralda. El comité aprobó la propuesta #3 de Ana.', type: 'meeting', color: '#1e3a5f', created_at: d(-8) },
  { id: 'n2', user_id: 'u1', project_id: null, title: 'Ideas para Q3', content: 'Explorar la posibilidad de integrar un chatbot con IA para soporte estudiantil. Revisar opciones de Dialogflow vs custom LLM.', type: 'idea', color: '#3b1e5f', created_at: d(-5) },
  { id: 'n3', user_id: 'u1', project_id: 'p3', title: 'Revisar Índices', content: 'Los índices de la tabla "matriculas" están fragmentados. Correr REINDEX antes de la migración final.', type: 'reminder', color: '#5f4b1e', created_at: d(-3) },
  { id: 'n4', user_id: 'u2', project_id: 'p1', title: 'Feedback del Cliente', content: 'El cliente pidió más contraste en los botones CTA. También quiere que el footer sea más compacto.', type: 'general', color: '#1e293b', created_at: d(-2) },
  { id: 'n5', user_id: 'u1', project_id: 'p2', title: 'Reunión con Equipo Móvil', content: 'Se decidió usar Flutter en vez de React Native por performance. Marco se encargará del desarrollo.', type: 'meeting', color: '#1e3a5f', created_at: d(-4) },
  { id: 'n6', user_id: 'u3', project_id: 'p3', title: 'Error en Migración Test', content: 'Encontré un error con las foreign keys circulares en la tabla "prerequisitos". Necesita resolverse antes de migrar a prod.', type: 'reminder', color: '#5f1e3b', created_at: d(-1) },
];

export const DEMO_EVENTS: AgendaEvent[] = [
  { id: 'e1', user_id: 'u1', project_id: 'p1', task_id: null, title: 'Revisión de Diseño', description: 'Reunión con Ana para revisar los diseños del portal.', start_time: dt(0, 10), end_time: dt(0, 11), type: 'meeting', color: '#3b82f6', created_at: d(-2) },
  { id: 'e2', user_id: 'u1', project_id: 'p3', task_id: 't14', title: 'Deadline: Migración', description: 'Fecha límite para la migración a producción.', start_time: dt(5, 9), end_time: dt(5, 18), type: 'deadline', color: '#ef4444', created_at: d(-2) },
  { id: 'e3', user_id: 'u1', project_id: null, task_id: null, title: 'Almuerzo con Dirección', description: 'Almuerzo de planificación estratégica.', start_time: dt(1, 12), end_time: dt(1, 14), type: 'personal', color: '#22c55e', created_at: d(-1) },
  { id: 'e4', user_id: 'u1', project_id: 'p2', task_id: null, title: 'Sprint Planning', description: 'Planificación del sprint 2 de la app móvil.', start_time: dt(2, 15), end_time: dt(2, 16), type: 'meeting', color: '#8b5cf6', created_at: d(-1) },
  { id: 'e5', user_id: 'u2', project_id: 'p1', task_id: 't2', title: 'Entregar Mockups', description: 'Deadline de entrega de los mockups finales.', start_time: dt(3, 9), end_time: dt(3, 18), type: 'deadline', color: '#ef4444', created_at: d(-1) },
  { id: 'e6', user_id: 'u1', project_id: null, task_id: null, title: 'Daily Standup', description: 'Standup diario del equipo.', start_time: dt(0, 9), end_time: dt(0, 9), type: 'meeting', color: '#06b6d4', created_at: d(-5) },
  { id: 'e7', user_id: 'u1', project_id: 'p4', task_id: null, title: 'Reunión Capacitación', description: 'Coordinar temario con el equipo docente.', start_time: dt(4, 14), end_time: dt(4, 15), type: 'meeting', color: '#22c55e', created_at: d(-1) },
];

/* ─── Current user helper ─── */
export const CURRENT_USER = DEMO_USERS[0]; // Admin by default
