'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Demo mode — accept any credentials
    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co';

    if (!isSupabaseConfigured) {
      // Demo mode: just redirect
      setTimeout(() => {
        router.push('/');
      }, 800);
      return;
    }

    // Supabase auth
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(authError.message);
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Error de conexión. Verifica tu configuración.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h1>
            Project<span className="text-accent">Flow</span>
          </h1>
          <p>Gestión de Proyectos Inteligente</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="input"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ marginTop: '8px', padding: '12px' }}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: 'var(--accent-dim)',
          borderRadius: 'var(--radius)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
            🧪 <strong>Modo Demo</strong> — Ingresa cualquier dato para explorar
          </p>
        </div>
      </div>
    </div>
  );
}
