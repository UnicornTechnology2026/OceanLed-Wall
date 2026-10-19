import { useState } from "react";
import type { FormEvent } from "react";
import { Lock, User, Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import OceanLedLogo from "../OceanLedLogo";

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-ocean-cyan/50 focus:bg-ocean-cyan/[0.03] focus:ring-2 focus:ring-ocean-cyan/30";
const labelCls =
  "mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50";

export default function AdminLogin({
  onSuccess,
  onBack,
}: {
  onSuccess?: () => void;
  onBack: () => void;
}) {
  const { login } = useSiteSettings();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const ok = login(username.trim(), password);
      setLoading(false);
      if (ok) onSuccess?.();
      else setError("Invalid username or password");
    }, 400);
  };

  return (
    <div className="relative flex min-h-screen items-center overflow-hidden bg-ocean-dark px-4 py-12 sm:px-6 lg:px-8">
      {/* soft cyan glow, same style as the site */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_25%,rgba(0,229,255,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-ocean-cyan/10 blur-[140px]" />

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        {/* ───────── SECTION 1 : TEXT ───────── */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <OceanLedLogo size={44} className="shadow-none!" />
            <span className="text-xl font-extrabold uppercase tracking-wide text-white">
              OCEAN LED
            </span>
          </div>

          <span className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/3 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-white/70 sm:text-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-ocean-cyan shadow-[0_0_10px_rgba(0,229,255,0.9)]" />
            Admin Panel // Secure Access
          </span>

          <h1 className="mt-5 text-3xl font-extrabold uppercase leading-[0.95] tracking-tighter text-white sm:text-5xl lg:text-6xl">
            Manage your
            <span className="block bg-linear-to-r from-slate-400 via-slate-300 to-ocean-cyan bg-clip-text text-transparent">
              website content.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/70 sm:text-lg lg:mx-0">
            Sign in to read client inquiries, update contact details and edit
            your project gallery.
          </p>

          <button
            type="button"
            onClick={onBack}
            className="mt-8 hidden items-center gap-3 rounded-md border border-white/20 bg-white/4 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:border-ocean-cyan/50 hover:text-ocean-cyan lg:inline-flex"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Back to Website
          </button>
        </div>

        {/* ───────── SECTION 2 : LOGIN CARD ───────── */}
        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-linear-to-b from-[#0a1220] to-[#060b14] p-6 shadow-[0_0_80px_rgba(0,0,0,0.6)] sm:p-8">
            {/* cyan top edge highlight */}
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-ocean-cyan/70 to-transparent" />

            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-ocean-cyan/30 bg-ocean-dark text-ocean-cyan">
                <Lock size={22} strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                  Admin Panel
                </p>
                <h2 className="mt-0.5 text-lg font-bold uppercase tracking-wide text-white">
                  Sign in to continue
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label htmlFor="username" className={labelCls}>
                  Username
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ocean-cyan/70"
                  />
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`${inputCls} pr-4`}
                    placeholder="admin"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className={labelCls}>
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ocean-cyan/70"
                  />
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputCls} pr-12`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white/35 transition hover:text-ocean-cyan"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-2.5 rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-300"
                >
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-ocean-cyan px-8 py-4 text-sm font-bold uppercase tracking-wide text-black shadow-[0_0_30px_rgba(0,229,255,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(0,229,255,0.55)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign In
                    <span className="h-1.5 w-1.5 rounded-full bg-black" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-[11px] text-white/30">
              Demo: username <span className="text-white/50">admin</span> ·
              password <span className="text-white/50">oceanled2026</span>
            </p>
          </div>

          {/* mobile back button */}
          <button
            type="button"
            onClick={onBack}
            className="mx-auto mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50 transition hover:text-ocean-cyan lg:hidden"
          >
            <ArrowLeft size={14} />
            Back to Website
          </button>
        </div>
      </div>
    </div>
  );
}
