import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../api/client';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&w=1400&q=70';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ name, email, password });
      }
      navigate('/');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not sign you in. Check your details.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Left: hero image with stats, hidden on small screens */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden bg-black p-10 md:flex"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(10,10,11,0.4) 0%, rgba(10,10,11,0.55) 55%, rgba(10,10,11,0.96) 100%), url(${HERO_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Logo />

        <div>
          <div className="mb-4 flex gap-1.5 text-accent">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="h-2 w-6 skew-x-[-20deg] bg-accent/80" />
            ))}
          </div>
          <h1 className="font-display max-w-md text-4xl font-bold leading-[1.05] text-ink">
            The inventory floor, at your command.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            Track stock, price and move iron across the lot. Built for dealers who move
            metal, not paperwork.
          </p>

          <div className="mt-8 flex gap-10">
            <Stat value="128" label="UNITS" />
            <Stat value="41" label="TURN / MO" />
            <Stat value="99.9%" label="UPTIME" />
          </div>
        </div>
      </div>

      {/* Right: auth form */}
      <div className="grid-floor flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 md:hidden">
            <Logo />
          </div>

          <div className="label-eyebrow mb-2 text-center text-muted-2 md:text-left">
            {mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </div>
          <h2 className="font-display text-center text-3xl font-bold text-ink md:text-left">
            {mode === 'login' ? 'Welcome back.' : 'Join the floor.'}
          </h2>
          <p className="mt-2 text-center text-sm text-muted md:text-left">
            {mode === 'login'
              ? 'Sign in to manage your dealership inventory.'
              : 'Register to start browsing and managing inventory.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {mode === 'register' && (
              <label className="block">
                <span className="label-eyebrow mb-1.5 block text-muted-2">Name</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Dealer"
                  className="field-input"
                />
              </label>
            )}

            <label className="block">
              <span className="label-eyebrow mb-1.5 block text-muted-2">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@dealership.com"
                className="field-input"
              />
            </label>

            <label className="block">
              <span className="label-eyebrow mb-1.5 block text-muted-2">Password</span>
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="field-input"
              />
            </label>

            {error && (
              <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="label-eyebrow w-full rounded-lg bg-accent py-3 text-accent-ink transition hover:bg-accent-hover disabled:opacity-60"
            >
              {submitting
                ? 'PLEASE WAIT…'
                : mode === 'login'
                  ? 'ENTER CONSOLE'
                  : 'CREATE ACCOUNT'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {mode === 'login' ? (
              <>
                New to Redline?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-medium text-accent hover:underline"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-medium text-accent hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-mono-tab text-2xl font-bold text-ink">{value}</div>
      <div className="label-eyebrow text-muted-2">{label}</div>
    </div>
  );
}
