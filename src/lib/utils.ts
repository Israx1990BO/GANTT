/* ─── ProjectFlow Utilities ─── */

/**
 * Format a date string to locale display
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a datetime string
 */
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate the number of days between two dates
 */
export function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days remaining from today
 */
export function daysRemaining(endDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Generate a UUID v4
 */
export function uuid(): string {
  return crypto.randomUUID();
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Get initials from a full name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get priority badge color
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical': return '#ef4444';
    case 'high': return '#f59e0b';
    case 'medium': return '#3b82f6';
    case 'low': return '#64748b';
    default: return '#64748b';
  }
}

/**
 * Get priority label in Spanish
 */
export function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'critical': return 'Crítica';
    case 'high': return 'Alta';
    case 'medium': return 'Media';
    case 'low': return 'Baja';
    default: return priority;
  }
}

/**
 * Get status label in Spanish
 */
export function getStatusLabel(status: string): string {
  switch (status) {
    case 'active': return 'Activo';
    case 'completed': return 'Completado';
    case 'on_hold': return 'En Espera';
    default: return status;
  }
}

/**
 * Generate dates between a range (inclusive)
 */
export function getDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is a weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Format a date as YYYY-MM-DD
 */
export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * CN - classNames helper
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
