import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProjectFlow — Gestión de Proyectos',
  description: 'Plataforma de gestión de proyectos con Gantt, Kanban, Agenda y Notas. Administra tus plazos y equipos de forma eficiente.',
  keywords: ['gestión de proyectos', 'gantt', 'kanban', 'agenda', 'project management'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
