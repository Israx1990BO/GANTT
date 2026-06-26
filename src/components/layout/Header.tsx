'use client';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="header">
      <div>
        <h2 className="header-title">{title}</h2>
        {subtitle && <p className="text-muted" style={{ fontSize: '0.78rem' }}>{subtitle}</p>}
      </div>
      {actions && <div className="header-actions">{actions}</div>}
    </header>
  );
}
