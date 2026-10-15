import { useState } from 'react';
import type { FormEvent } from 'react';
import { Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import OceanLedLogo from '../OceanLedLogo';

export default function AdminLogin({ onSuccess, onBack }: { onSuccess?: () => void; onBack: () => void }) {
  const { login } = useSiteSettings();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const ok = login(username.trim(), password);
      setLoading(false);
      if (ok) onSuccess?.();
      else setError('Invalid username or password');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-ocean-dark flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-150 h-100px rounded-full blur-[140px] opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00b4ff 0%, #7b5cff 50%, transparent 70%)' }} />

      <div className="relative w-full max-w-md">
        <button type="button" onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/40 hover:text-ocean-cyan transition-colors">
          <ArrowLeft size={16} /> Back to website
        </button>

        <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <OceanLedLogo size={56} />
            <h1 className="mt-4 text-xl font-bold text-white">Admin Panel</h1>
            <p className="mt-1 text-sm text-white/40">Sign in to manage site content</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/4 pl-10 pr-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-ocean-cyan/40"
                  placeholder="admin" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/4 pl-10 pr-11 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-ocean-cyan/40"
                  placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full rounded-full bg-linear-to-r from-ocean-blue to-ocean-cyan py-3.5 text-sm font-semibold text-ocean-dark disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="mt-6 text-center text-[11px] text-white/25">
            Demo: username <span className="text-white/40">admin</span> · password <span className="text-white/40">oceanled2026</span>
          </p>
        </div>
      </div>
    </div>
  );
}