import { useState } from 'react';
import {
  LogOut,
  Save,
  RotateCcw,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon,
  Hash,
  ArrowLeft,
  CheckCircle,
  Inbox,
  Trash2,
  Eye,
} from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import type {
  ContactSettings,
  AboutSettings,
  Project,
} from '../../context/SiteSettingsContext';
import OceanLedLogo from '../OceanLedLogo';
import ImageUpload from './ImageUpload';

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const {
    settings,
    logout,
    updateContact,
    updateAbout,
    updateProject,
    resetSettings,
    inquiries,
    markInquiryRead,
    deleteInquiry,
    clearInquiries,
  } = useSiteSettings();

  const [contact, setContact] = useState<ContactSettings>({ ...settings.contact });
  const [about, setAbout] = useState<AboutSettings>({ ...settings.about });
  const [projects, setProjects] = useState<Project[]>(
    settings.projects.map((p) => ({ ...p }))
  );
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState('inquiries');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const unreadCount = inquiries.filter((i) => !i.read).length;

  const handleSave = () => {
    updateContact(contact);
    updateAbout(about);
    projects.forEach((p, i) => updateProject(i, p));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      resetSettings();
      setTimeout(() => window.location.reload(), 100);
    }
  };

  const updateProjectField = (index: number, field: keyof Project, value: string) => {
    setProjects((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const openInquiry = (id: string) => {
    setSelectedId(id);
    markInquiryRead(id);
  };

  const selected = inquiries.find((i) => i.id === selectedId);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const tabs = [
    { id: 'inquiries', label: 'Inquiries', icon: Inbox, badge: unreadCount },
    { id: 'contact', label: 'Contact Info', icon: Mail },
    { id: 'about', label: 'About & Stats', icon: Hash },
    { id: 'projects', label: 'Project Images', icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-ocean-dark text-white">
      <header className="sticky top-0 z-50 border-b border-white/6 bg-ocean-dark/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <OceanLedLogo size={32} />
            <span className="font-bold tracking-wide">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-ocean-cyan transition-colors"
            >
              <ArrowLeft size={15} />
              View Site
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-white/60 hover:border-red-400/40 hover:text-red-400 transition-colors"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setSelectedId(null);
              }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-ocean-cyan/15 text-ocean-cyan border border-ocean-cyan/30'
                  : 'text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70'
              }`}
            >
              <t.icon size={15} />
              {t.label}
              {(t.badge ?? 0) > 0 && (
                <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ocean-cyan text-[10px] font-bold text-ocean-dark px-1.5">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* INQUIRIES TAB */}
        {tab === 'inquiries' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-semibold">Form Submissions</h2>
                <p className="text-sm text-white/40">
                  {inquiries.length === 0
                    ? 'No inquiries yet. When a client submits the contact form, it will appear here.'
                    : `${inquiries.length} total · ${unreadCount} unread`}
                </p>
              </div>
              {inquiries.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Delete all inquiries?')) clearInquiries();
                  }}
                  className="text-xs text-red-400/70 hover:text-red-400 border border-red-400/20 rounded-full px-3 py-1.5 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {inquiries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/2 p-16 text-center">
                <Inbox size={40} className="mx-auto text-white/20 mb-4" />
                <p className="text-white/40 text-sm">Waiting for form submissions…</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <div className="lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                  {inquiries.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openInquiry(item.id)}
                      className={`w-full text-left rounded-xl border p-4 transition-all ${
                        selectedId === item.id
                          ? 'border-ocean-cyan/40 bg-ocean-cyan/10'
                          : item.read
                          ? 'border-white/6 bg-white/2 hover:border-white/15'
                          : 'border-ocean-cyan/20 bg-ocean-cyan/5 hover:border-ocean-cyan/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${item.read ? 'text-white/70' : 'text-white'}`}>
                            {!item.read && (
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-ocean-cyan mr-2 align-middle" />
                            )}
                            {item.name}
                          </p>
                          <p className="text-xs text-white/40 truncate mt-0.5">{item.email}</p>
                        </div>
                        <span className="text-[10px] text-white/30 whitespace-nowrap shrink-0">
                          {formatDate(item.createdAt).split(',')[0]}
                        </span>
                      </div>
                      <p className="text-xs text-white/35 mt-2 line-clamp-2">{item.message}</p>
                    </button>
                  ))}
                </div>

                <div className="lg:col-span-3">
                  {selected ? (
                    <div className="rounded-2xl border border-white/6 bg-white/2 p-6 space-y-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{selected.name}</h3>
                          <p className="text-xs text-white/40 mt-1">{formatDate(selected.createdAt)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            deleteInquiry(selected.id);
                            setSelectedId(null);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 border border-red-400/20 rounded-full px-3 py-1.5 transition-colors"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/ 6  border-white/ 3] p-3">
                          <p className="text-[10px] uppercase tracking-wider text-white/35 mb-1">Email</p>
                          <a href={`mailto:${selected.email}`} className="text-sm text-ocean-cyan hover:underline break-all">
                            {selected.email}
                          </a>
                        </div>
                        <div className="rounded-xl border border-white/ 6  border-white/ 3] p-3">
                          <p className="text-[10px] uppercase tracking-wider text-white/35 mb-1">Phone</p>
                          <p className="text-sm text-white/70">{selected.phone || '—'}</p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/ 6  border-white/ 3] p-4">
                        <p className="text-[10px] uppercase tracking-wider text-white/35 mb-2">Message</p>
                        <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                          {selected.message}
                        </p>
                      </div>

                      <a
                        href={`mailto:${selected.email}?subject=Re: Your inquiry to OCEAN LED`}
                        className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-ocean-blue to-ocean-cyan px-5 py-2.5 text-sm font-semibold text-ocean-dark"
                      >
                        <Mail size={15} />
                        Reply by Email
                      </a>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/2 p-16 text-center h-full flex flex-col items-center justify-center min-h-70">
                      <Eye size={32} className="text-white/20 mb-3" />
                      <p className="text-sm text-white/35">Select an inquiry to view details</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CONTACT TAB */}
        {tab === 'contact' && (
          <div className="rounded-2xl border border-white/ 6  bg-white/2 p-6 sm:p-8 space-y-5 max-w-xl">
            <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
            <p className="text-sm text-white/40 mb-4">These appear in the Contact section and Footer.</p>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-1.5">
                <Mail size={14} /> Email
              </label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-ocean-cyan/40 transition"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-1.5">
                <Phone size={14} /> Phone
              </label>
              <input
                type="text"
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-ocean-cyan/40 transition"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-1.5">
                <MapPin size={14} /> Address
              </label>
              <input
                type="text"
                value={contact.address}
                onChange={(e) => setContact({ ...contact, address: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-ocean-cyan/40 transition"
              />
            </div>
          </div>
        )}

        {/* ABOUT TAB */}
        {tab === 'about' && (
          <div className="rounded-2xl border border-white/ 6  bg-white/2 p-6 sm:p-8 space-y-5 max-w-xl">
            <h2 className="text-lg font-semibold mb-2">About Section</h2>
            <p className="text-sm text-white/40 mb-4">Image and statistics shown on the About section.</p>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-1.5">
                <ImageIcon size={14} /> About Image
              </label>
              <ImageUpload
                value={about.image}
                onChange={(img) => setAbout({ ...about, image: img })}
                previewClass="h-32 w-full"
                maxWidth={1000}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Since</label>
                <input
                  type="text"
                  value={about.since}
                  onChange={(e) => setAbout({ ...about, since: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/4 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-ocean-cyan/40 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Projects</label>
                <input
                  type="text"
                  value={about.projects}
                  onChange={(e) => setAbout({ ...about, projects: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/4 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-ocean-cyan/40 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Cities</label>
                <input
                  type="text"
                  value={about.cities}
                  onChange={(e) => setAbout({ ...about, cities: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/4 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-ocean-cyan/40 transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {tab === 'projects' && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold">Project Images</h2>
            <p className="text-sm text-white/40 mb-2">
              Update title, category, location, and image for each project card.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {projects.map((project, i) => (
                <div key={i} className="rounded-2xl border border-white/ 6  bg-white/2 p-5 space-y-3">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-medium text-ocean-cyan">Project {i + 1}</span>
                  </div>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => updateProjectField(i, 'title', e.target.value)}
                    placeholder="Title"
                    className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-ocean-cyan/40 transition"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={project.category}
                      onChange={(e) => updateProjectField(i, 'category', e.target.value)}
                      placeholder="Category"
                      className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-ocean-cyan/40 transition"
                    />
                    <input
                      type="text"
                      value={project.location}
                      onChange={(e) => updateProjectField(i, 'location', e.target.value)}
                      placeholder="Location"
                      className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-ocean-cyan/40 transition"
                    />
                  </div>
                  <ImageUpload
                    value={project.image}
                    onChange={(img) => updateProjectField(i, 'image', img)}
                    previewClass="h-36 w-full"
                    maxWidth={900}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab !== 'inquiries' && (
          <div className="mt-8 flex flex-wrap items-center gap-3 sticky bottom-4">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-ocean-blue to-ocean-cyan px-6 py-3 text-sm font-semibold text-ocean-dark shadow-lg shadow-ocean-blue/25 hover:shadow-ocean-cyan/40 transition-all"
            >
              {saved ? (
                <><CheckCircle size={16} /> Saved!</>
              ) : (
                <><Save size={16} /> Save Changes</>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-white/50 hover:border-white/20 hover:text-white/70 transition-colors"
            >
              <RotateCcw size={15} />
              Reset to Defaults
            </button>
          </div>
        )}
      </div>
    </div>
  );
}