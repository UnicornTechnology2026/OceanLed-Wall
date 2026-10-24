import { useState } from "react";
import type { ReactNode } from "react";
import {
  LogOut,
  Save,
  RotateCcw,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon,
  ArrowLeft,
  CheckCircle,
  Inbox,
  Trash2,
  Eye,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import type {
  ContactSettings,
  Project,
} from "../../context/SiteSettingsContext";
import oceanLogo from "../../assets/logo.png";
import ImageUpload from "./ImageUpload";

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-ocean-cyan/50 focus:bg-ocean-cyan/[0.03] focus:ring-2 focus:ring-ocean-cyan/30";
const labelCls =
  "mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/50";

/* dark card with the cyan top edge, same as every other page */
function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-b from-[#0a1220] to-[#060b14] p-5 shadow-[0_0_80px_rgba(0,0,0,0.5)] sm:p-7 ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-ocean-cyan/70 to-transparent" />
      {children}
    </div>
  );
}

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const {
    settings,
    logout,
    saveContact,
    saveProjects,
    resetSettings,
    inquiries,
    refreshInquiries,
    markInquiryRead,
    deleteInquiry,
    clearInquiries,
  } = useSiteSettings();

  const [contact, setContact] = useState<ContactSettings>({
    ...settings.contact,
  });
  const [projects, setProjects] = useState<Project[]>(
    settings.projects.map((p) => ({ ...p })),
  );
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("inquiries");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const unreadCount = inquiries.filter((i) => !i.read).length;

  const messageOf = (err: unknown) =>
    err instanceof Error ? err.message : "Something went wrong";

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      await Promise.all([saveContact(contact), saveProjects(projects)]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(`Could not save changes: ${messageOf(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset all settings to defaults?")) return;
    setError("");
    try {
      await resetSettings();
      window.location.reload();
    } catch (err) {
      setError(`Could not reset: ${messageOf(err)}`);
    }
  };

  const handleRefresh = async () => {
    setError("");
    setRefreshing(true);
    try {
      await refreshInquiries();
    } catch (err) {
      setError(`Could not refresh inquiries: ${messageOf(err)}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError("");
    try {
      await deleteInquiry(id);
      setSelectedId(null);
    } catch (err) {
      setError(`Could not delete inquiry: ${messageOf(err)}`);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Delete all inquiries?")) return;
    setError("");
    try {
      await clearInquiries();
    } catch (err) {
      setError(`Could not clear inquiries: ${messageOf(err)}`);
    }
  };

  const updateProjectField = (
    index: number,
    field: keyof Project,
    value: string,
  ) => {
    setProjects((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const openInquiry = (id: string) => {
    setSelectedId(id);
    void markInquiryRead(id);
  };

  const selected = inquiries.find((i) => i.id === selectedId);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const tabs = [
    {
      id: "inquiries",
      label: "Inquiries",
      icon: Inbox,
      badge: unreadCount,
      title: "Form submissions",
      sub: "Messages sent through the contact form.",
    },
    {
      id: "contact",
      label: "Contact Info",
      icon: Mail,
      title: "Contact information",
      sub: "Shown in the Contact section, map and Footer.",
    },
    {
      id: "projects",
      label: "Project Images",
      icon: ImageIcon,
      title: "Project images",
      sub: "Update the title, category, location and image of each project card.",
    },
  ];

  const current = tabs.find((t) => t.id === tab) ?? tabs[0];

  const changeTab = (id: string) => {
    setTab(id);
    setSelectedId(null);
  };

  return (
    <div className="relative min-h-screen bg-ocean-dark text-white">
      {/* soft cyan glow, same style as the site */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_15%_10%,rgba(0,229,255,0.07),transparent_55%)]" />
      <div className="pointer-events-none fixed -right-40 top-1/3 h-96 w-96 rounded-full bg-ocean-cyan/10 blur-[140px]" />

      {/* ───────── SIDEBAR (desktop) ───────── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-white/10 bg-ocean-dark/95 p-5 backdrop-blur-md lg:flex">
        <div className="flex items-center gap-3 px-2 -mt-3.5">
          <img src={oceanLogo} alt="" className="h-28 w-28" />
          <div className="-ml-7">
            <p className="text-base font-extrabold uppercase leading-none tracking-wide text-white">
              OCEAN LED
            </p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-ocean-cyan">
              Admin Panel
            </p>
          </div>
        </div>

        <nav className=" flex-1 space-y-2">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => changeTab(t.id)}
                aria-current={active ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                  active
                    ? "border-ocean-cyan/35 bg-ocean-cyan/5"
                    : "border-transparent hover:bg-white/4"
                }`}
              >
                <span
                  className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                    active
                      ? "border-ocean-cyan bg-ocean-cyan text-black"
                      : "border-ocean-cyan/30 bg-ocean-dark text-ocean-cyan"
                  }`}
                >
                  <t.icon size={18} strokeWidth={1.75} />
                </span>
                <span className="block min-w-0 flex-1">
                  <span
                    className={`block text-sm font-semibold uppercase tracking-wide ${
                      active ? "text-white" : "text-white/70"
                    }`}
                  >
                    {t.label}
                  </span>
                </span>
                {(t.badge ?? 0) > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ocean-cyan px-1.5 text-[10px] font-bold text-black">
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/70 transition hover:border-ocean-cyan/40 hover:text-ocean-cyan"
          >
            <ArrowLeft size={15} />
            View Site
          </button>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/50 transition hover:border-red-400/40 hover:text-red-400"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* ───────── TOP BAR (mobile / tablet) ───────── */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ocean-dark/90 backdrop-blur-md lg:hidden">
        <div className=" flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={oceanLogo} alt="" className="h-28 w-28" />
            <div>
              <p className="text-sm font-extrabold uppercase leading-none tracking-wide">
                OCEAN LED
              </p>
              <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.2em] text-ocean-cyan">
                Admin Panel
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              aria-label="View site"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-ocean-cyan/40 hover:text-ocean-cyan"
            >
              <ArrowLeft size={15} />
            </button>
            <button
              type="button"
              onClick={logout}
              aria-label="Logout"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-red-400/40 hover:text-red-400"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        <div className="mt-2 flex gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => changeTab(t.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] font-medium uppercase tracking-wider transition ${
                  active
                    ? "border-ocean-cyan/30 bg-ocean-cyan/6 text-ocean-cyan"
                    : "border-white/10 text-white/60"
                }`}
              >
                <t.icon size={13} />
                {t.label}
                {(t.badge ?? 0) > 0 && (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-ocean-cyan px-1 text-[9px] font-bold text-black">
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ───────── MAIN ───────── */}
      <main className="relative lg:pl-72">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-12 lg:px-10">
          {/* page header */}
          <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/3 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-white/70 sm:text-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-ocean-cyan shadow-[0_0_10px_rgba(0,229,255,0.9)]" />
            Dashboard // {current.label}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold uppercase leading-[0.95] tracking-tighter text-white sm:text-5xl">
            {current.title.split(" ")[0]}
            <span className="block bg-linear-to-r from-slate-400 via-slate-300 to-ocean-cyan bg-clip-text text-transparent">
              {current.title.split(" ").slice(1).join(" ")}
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
            {current.sub}
          </p>

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-300"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span className="min-w-0 flex-1 wrap-break-word">{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                className="shrink-0 text-xs font-semibold uppercase tracking-wider text-red-300/70 hover:text-red-300"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="mt-8">
            {/* ───────── INQUIRIES TAB ───────── */}
            {tab === "inquiries" && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total", value: inquiries.length, hl: false },
                    { label: "Unread", value: unreadCount, hl: true },
                    {
                      label: "Read",
                      value: inquiries.length - unreadCount,
                      hl: false,
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl border border-white/10 bg-white/3 p-4 text-center sm:p-5"
                    >
                      <p
                        className={`text-2xl font-extrabold tracking-tight sm:text-4xl ${
                          s.hl ? "text-ocean-cyan" : "text-white"
                        }`}
                      >
                        {s.value}
                      </p>
                      <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/45 sm:text-xs">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-white/60 transition hover:border-ocean-cyan/40 hover:text-ocean-cyan disabled:opacity-50"
                  >
                    <RefreshCw
                      size={12}
                      className={refreshing ? "animate-spin" : ""}
                    />
                    Refresh
                  </button>
                  {inquiries.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="inline-flex items-center gap-2 rounded-full border border-red-400/25 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-red-400/80 transition hover:border-red-400/50 hover:text-red-400"
                    >
                      <Trash2 size={12} />
                      Clear all
                    </button>
                  )}
                </div>

                {inquiries.length === 0 ? (
                  <Card className="py-16 text-center">
                    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-ocean-cyan/30 bg-ocean-dark text-ocean-cyan">
                      <Inbox size={28} strokeWidth={1.5} />
                    </span>
                    <p className="mt-5 text-lg font-bold uppercase tracking-wide text-white">
                      No inquiries yet
                    </p>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-white/50">
                      When a client submits the contact form, it will appear
                      here.
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-5">
                    {/* list */}
                    <Card className="p-3! xl:col-span-2">
                      <div className="max-h-[70vh] space-y-2 overflow-y-auto p-1 pr-2">
                        {inquiries.map((item) => {
                          const isSel = selectedId === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => openInquiry(item.id)}
                              className={`w-full rounded-xl border p-4 text-left transition ${
                                isSel
                                  ? "border-ocean-cyan/40 bg-ocean-cyan/6"
                                  : item.read
                                    ? "border-white/10 bg-white3 hover:border-ocean-cyan/30"
                                    : "border-ocean-cyan/25 bg-ocean-cyan4 hover:border-ocean-cyan/40"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p
                                    className={`truncate text-sm font-bold uppercase tracking-wide ${
                                      item.read ? "text-white/70" : "text-white"
                                    }`}
                                  >
                                    {!item.read && (
                                      <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-ocean-cyan align-middle shadow-[0_0_8px_rgba(0,229,255,0.9)]" />
                                    )}
                                    {item.name}
                                  </p>
                                  <p className="mt-0.5 truncate text-xs text-white/40">
                                    {item.email}
                                  </p>
                                </div>
                                <span className="shrink-0 whitespace-nowrap text-[10px] text-white/30">
                                  {formatDate(item.createdAt).split(",")[0]}
                                </span>
                              </div>
                              <p className="mt-2 line-clamp-2 text-xs text-white/40">
                                {item.message}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </Card>

                    {/* detail */}
                    <div className="xl:col-span-3">
                      {selected ? (
                        <Card className="space-y-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                                Inquiry from
                              </p>
                              <h3 className="mt-0.5 text-xl font-bold uppercase tracking-wide text-white">
                                {selected.name}
                              </h3>
                              <p className="mt-1 text-xs text-white/40">
                                {formatDate(selected.createdAt)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDelete(selected.id)}
                              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-400/25 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-red-400/80 transition hover:border-red-400/50 hover:text-red-400"
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-white/10 bg-white/3 p-4">
                              <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
                                Email
                              </p>
                              <a
                                href={`mailto:${selected.email}`}
                                className="break-all text-sm text-ocean-cyan hover:underline"
                              >
                                {selected.email}
                              </a>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/3 p-4">
                              <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
                                Phone
                              </p>
                              <p className="text-sm text-white/75">
                                {selected.phone || "—"}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-white/3 p-4">
                            <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/40">
                              Message
                            </p>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">
                              {selected.message}
                            </p>
                          </div>

                          <a
                            href={`mailto:${selected.email}?subject=Re: Your inquiry to OCEAN LED`}
                            className="inline-flex items-center gap-3 rounded-md bg-ocean-cyan px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-black shadow-[0_0_30px_rgba(0,229,255,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(0,229,255,0.55)]"
                          >
                            <Mail size={15} />
                            Reply by Email
                            <ChevronRight size={15} />
                          </a>
                        </Card>
                      ) : (
                        <Card className="flex min-h-72 flex-col items-center justify-center text-center">
                          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-ocean-cyan/30 bg-ocean-dark text-ocean-cyan">
                            <Eye size={24} strokeWidth={1.5} />
                          </span>
                          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-white/60">
                            Select an inquiry
                          </p>
                          <p className="mt-1 text-xs text-white/35">
                            Pick one from the list to read the full message.
                          </p>
                        </Card>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ───────── CONTACT TAB ───────── */}
            {tab === "contact" && (
              <Card className="max-w-2xl space-y-5">
                <div>
                  <label className={labelCls}>
                    <Mail size={13} /> Email
                  </label>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) =>
                      setContact({ ...contact, email: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    <Phone size={13} /> Phone
                  </label>
                  <input
                    type="text"
                    value={contact.phone}
                    onChange={(e) =>
                      setContact({ ...contact, phone: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    <MapPin size={13} /> Address
                  </label>
                  <input
                    type="text"
                    value={contact.address}
                    onChange={(e) =>
                      setContact({ ...contact, address: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              </Card>
            )}

            {/* ───────── PROJECTS TAB ───────── */}
            {tab === "projects" && (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {projects.map((project, i) => (
                  <Card key={i} className="space-y-4 p-5!">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ocean-cyan/30 bg-ocean-dark text-xs font-bold text-ocean-cyan">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                          Project {i + 1}
                        </p>
                        <p className="truncate text-sm font-bold uppercase tracking-wide text-white">
                          {project.title || "Untitled"}
                        </p>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) =>
                        updateProjectField(i, "title", e.target.value)
                      }
                      placeholder="Title"
                      className={inputCls}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={project.category}
                        onChange={(e) =>
                          updateProjectField(i, "category", e.target.value)
                        }
                        placeholder="Category"
                        className={inputCls}
                      />
                      <input
                        type="text"
                        value={project.location}
                        onChange={(e) =>
                          updateProjectField(i, "location", e.target.value)
                        }
                        placeholder="Location"
                        className={inputCls}
                      />
                    </div>
                    <ImageUpload
                      value={project.image}
                      folder="projects"
                      onChange={(img) => updateProjectField(i, "image", img)}
                      previewClass="h-40 w-full"
                      maxWidth={900}
                    />
                  </Card>
                ))}
              </div>
            )}

            {/* ───────── SAVE BAR ───────── */}
            {tab !== "inquiries" && (
              <div className="sticky bottom-4 z-30 mt-8">
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-[#0a1220]/90 p-3 shadow-[0_0_60px_rgba(0,0,0,0.6)] backdrop-blur-md">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-3 rounded-md bg-ocean-cyan px-6 py-3 text-sm font-bold uppercase tracking-wide text-black shadow-[0_0_30px_rgba(0,229,255,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(0,229,255,0.55)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {saving ? (
                      "Saving…"
                    ) : saved ? (
                      <>
                        <CheckCircle size={16} /> Saved
                      </>
                    ) : (
                      <>
                        <Save size={16} /> Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-md border border-white/15 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white/60 transition hover:border-red-400/40 hover:text-red-400"
                  >
                    <RotateCcw size={15} />
                    Reset to Defaults
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
