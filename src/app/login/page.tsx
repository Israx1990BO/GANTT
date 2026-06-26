'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type AuthMode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const isSupabaseConfigured =
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // ── DEMO MODE ──
    if (!isSupabaseConfigured) {
      setTimeout(() => { router.push('/'); }, 600);
      return;
    }

    // ── SUPABASE MODE ──
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      if (mode === 'login') {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) {
          setError(
            authError.message === 'Invalid login credentials'
              ? 'Email o contraseña incorrectos. Verifica tus datos.'
              : authError.message
          );
          setLoading(false);
        } else {
          router.push('/');
          router.refresh();
        }
      } else {
        // Sign up
        if (!fullName.trim()) { setError('El nombre completo es obligatorio.'); setLoading(false); return; }
        if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); setLoading(false); return; }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role: 'consultor' },
          },
        });
        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
        } else {
          setSuccess('¡Cuenta creada! Revisa tu email para confirmar tu cuenta y luego inicia sesión.');
          setMode('login');
          setPassword('');
          setLoading(false);
        }
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
          <h1>Project<span className="text-accent">Flow</span></h1>
          <p>Gestión de Proyectos Inteligente</p>
        </div>

        {/* Mode Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-primary)', borderRadius: 'var(--radius)', padding: '4px', marginBottom: '24px', gap: '4px' }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            style={{
              flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)',
              background: mode === 'login' ? 'var(--bg-elevated)' : 'transparent',
              border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
              color: mode === 'login' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              transition: 'all var(--transition)',
            }}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
            style={{
              flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)',
              background: mode === 'signup' ? 'var(--bg-elevated)' : 'transparent',
              border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
              color: mode === 'signup' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              transition: 'all var(--transition)',
            }}
          >
            Crear Cuenta
          </button>
        </div>

        {error && <div className="login-error">⚠️ {error}</div>}
        {success && <div className="login-success">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label" htmlFor="signup-name">Nombre Completo</label>
              <input
                id="signup-name"
                type="text"
                className="input"
                placeholder="Tu nombre completo"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="input"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
              onChange={e => setPassword(e.target.value)}
              required
            />
            {mode === 'signup' && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Mínimo 6 caracteres
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ marginTop: '8px', padding: '12px', fontSize: '0.9rem' }}
          >
            {loading
              ? (mode === 'login' ? 'Ingresando...' : 'Creando cuenta...')
              : (mode === 'login' ? '→ Iniciar Sesión' : '→ Crear Cuenta')
            }
          </button>
        </form>

        {!isSupabaseConfigured && (
          <div style={{
            marginTop: '20px', padding: '12px',
            background: 'var(--accent-dim)', borderRadius: 'var(--radius)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
              🧪 <strong>Modo Demo</strong> — Ingresa cualquier dato para explorar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
