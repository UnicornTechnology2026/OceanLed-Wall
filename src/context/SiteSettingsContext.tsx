import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import {
  isSupabaseConfigured,
  onAuthChange,
  signInWithPassword,
  signOut,
  rpc,
  dbSelect,
  dbInsert,
  dbUpsert,
  dbUpdate,
  dbDelete,
} from "../lib/supabase";

export interface ContactSettings {
  email: string;
  phone: string;
  address: string;
}

export interface AboutSettings {
  image: string;
  since: string;
  projects: string;
  cities: string;
}

export interface Project {
  title: string;
  category: string;
  location: string;
  image: string;
}

export interface SiteSettings {
  contact: ContactSettings;
  about: AboutSettings;
  projects: Project[];
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export type NewInquiry = Omit<Inquiry, "id" | "createdAt" | "read">;

/**
 * loading      – first fetch from Supabase in progress (defaults/cache shown)
 * ready        – settings loaded from Supabase
 * error        – Supabase is configured but the fetch failed
 * unconfigured – no VITE_SUPABASE_* env vars
 */
export type LoadStatus = "loading" | "ready" | "error" | "unconfigured";

export interface SiteSettingsContextValue {
  settings: SiteSettings;
  status: LoadStatus;
  reloadSettings: () => Promise<void>;

  /** false until the saved session has been checked (avoids a login flash) */
  authReady: boolean;
  isAdmin: boolean;
  /** resolves to an error message, or null on success */
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;

  inquiries: Inquiry[];
  refreshInquiries: () => Promise<void>;
  /** public: anyone may submit. Throws on failure. */
  addInquiry: (inquiry: NewInquiry) => Promise<void>;
  markInquiryRead: (id: string) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
  clearInquiries: () => Promise<void>;

  /* admin saves – all throw an Error on failure */
  saveContact: (contact: ContactSettings) => Promise<void>;
  saveAbout: (about: AboutSettings) => Promise<void>;
  saveProjects: (projects: Project[]) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  contact: {
    email: "oceanled2812@gmail.com",
    phone: "+91 90112 40214",
    address:
      "Plot No. 109/A, Near Hanuman Mandir, Ramna Maroti Nagar, Nagpur, Maharashtra 440024",
  },
  about: {
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=80",
    since: "2018",
    projects: "500+",
    cities: "40+",
  },
  projects: [
    {
      title: "Corporate Lobby Video Wall",
      category: "Indoor LED",
      location: "Mumbai",
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    },
    {
      title: "Outdoor Stadium Display",
      category: "Outdoor LED",
      location: "Delhi",
      image:
        "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80",
    },
    {
      title: "Retail Digital Signage Network",
      category: "Digital Signage",
      location: "Bangalore",
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    },
    {
      title: "Control Room Command Center",
      category: "LED Video Wall",
      location: "Hyderabad",
      image:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    },
    {
      title: "Architectural Facade Installation",
      category: "Custom LED",
      location: "Chennai",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    },
    {
      title: "Event Stage Backdrop",
      category: "Indoor LED",
      location: "Pune",
      image:
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    },
  ],
};

/**
 * Last settings fetched from Supabase. Used ONLY to paint the page instantly on
 * the next visit (no flash of default text); Supabase stays the source of truth.
 */
const CACHE_KEY = "ocean_led_settings_cache_v1";

function readCache(): SiteSettings | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as SiteSettings) : null;
  } catch {
    return null;
  }
}

function writeCache(settings: SiteSettings) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(settings));
  } catch {
    /* storage unavailable or full – not critical */
  }
}

/* ───────── DB row ⇄ app type mapping ───────── */

interface InquiryRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface ProjectRow {
  title: string;
  category: string;
  location: string;
  image_url: string;
}

const rowToInquiry = (r: InquiryRow): Inquiry => ({
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone,
  message: r.message,
  createdAt: r.created_at,
  read: r.is_read,
});

const rowToProject = (r: ProjectRow): Project => ({
  title: r.title,
  category: r.category,
  location: r.location,
  image: r.image_url,
});

const projectToRow = (p: Project, position: number) => ({
  position,
  title: p.title,
  category: p.category,
  location: p.location,
  image_url: p.image,
});

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(
  null,
);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(
    () => readCache() ?? DEFAULT_SETTINGS,
  );
  const [status, setStatus] = useState<LoadStatus>(
    isSupabaseConfigured ? "loading" : "unconfigured",
  );
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);

  /* ── settings + projects (public read) ── */
  const reloadSettings = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const [rows, projectRows] = await Promise.all([
        dbSelect<{
          contact: Partial<ContactSettings>;
          about: Partial<AboutSettings>;
        }>("site_settings", "select=contact,about&id=eq.1"),
        dbSelect<ProjectRow>(
          "projects",
          "select=title,category,location,image_url&order=position.asc",
        ),
      ]);

      // Fall back to defaults for anything that has not been saved yet
      const next: SiteSettings = {
        contact: { ...DEFAULT_SETTINGS.contact, ...(rows[0]?.contact ?? {}) },
        about: { ...DEFAULT_SETTINGS.about, ...(rows[0]?.about ?? {}) },
        projects:
          projectRows.length > 0
            ? projectRows.map(rowToProject)
            : DEFAULT_SETTINGS.projects,
      };
      setSettings(next);
      writeCache(next);
      setStatus("ready");
    } catch (err) {
      console.error("Failed to load site settings", err);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void reloadSettings();
  }, [reloadSettings]);

  /* ── auth ── */
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    let run = 0;

    const unsubscribe = onAuthChange(async (signedIn) => {
      const id = ++run; // ignore results of superseded checks
      let admin = false;
      if (signedIn) {
        try {
          admin = (await rpc<boolean>("is_admin")) === true;
        } catch {
          admin = false;
        }
      }
      if (!active || id !== run) return;
      setIsAdmin(admin);
      setAuthReady(true);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      await signInWithPassword(email, password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      return /invalid login/i.test(msg)
        ? "Invalid email or password"
        : msg || "Could not sign in";
    }

    // Signed in – but only users in the `admins` table may use the panel
    let ok = false;
    try {
      ok = (await rpc<boolean>("is_admin")) === true;
    } catch {
      ok = false;
    }
    if (!ok) {
      await signOut();
      return "This account does not have admin access";
    }
    return null;
  }, []);

  const logout = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    await signOut();
  }, []);

  /* ── inquiries ── */
  const refreshInquiries = useCallback(async () => {
    const rows = await dbSelect<InquiryRow>(
      "inquiries",
      "select=id,name,email,phone,message,is_read,created_at&order=created_at.desc",
    );
    setInquiries(rows.map(rowToInquiry));
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setInquiries([]);
      return;
    }
    refreshInquiries().catch((err) =>
      console.error("Failed to load inquiries", err),
    );
  }, [isAdmin, refreshInquiries]);

  const addInquiry = useCallback(async (inquiry: NewInquiry) => {
    try {
      await dbInsert("inquiries", {
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        message: inquiry.message,
      });
    } catch (err) {
      console.error("Failed to submit inquiry", err);
      throw new Error(
        "We couldn't send your message. Please try again, or contact us by phone or email.",
      );
    }
  }, []);

  const markInquiryRead = useCallback(async (id: string) => {
    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
    try {
      await dbUpdate("inquiries", `id=eq.${encodeURIComponent(id)}`, {
        is_read: true,
      });
    } catch (err) {
      console.error("Failed to mark inquiry read", err);
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: false } : item)),
      );
    }
  }, []);

  const deleteInquiry = useCallback(async (id: string) => {
    await dbDelete("inquiries", `id=eq.${encodeURIComponent(id)}`);
    setInquiries((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearInquiries = useCallback(async () => {
    // PostgREST needs a filter on delete; "id is not null" matches every row
    await dbDelete("inquiries", "id=not.is.null");
    setInquiries([]);
  }, []);

  /* ── admin saves ── */
  const saveContact = useCallback(async (contact: ContactSettings) => {
    await dbUpsert(
      "site_settings",
      { id: 1, contact, updated_at: new Date().toISOString() },
      "id",
    );
    setSettings((prev) => {
      const next = { ...prev, contact };
      writeCache(next);
      return next;
    });
  }, []);

  const saveAbout = useCallback(async (about: AboutSettings) => {
    await dbUpsert(
      "site_settings",
      { id: 1, about, updated_at: new Date().toISOString() },
      "id",
    );
    setSettings((prev) => {
      const next = { ...prev, about };
      writeCache(next);
      return next;
    });
  }, []);

  const saveProjects = useCallback(async (projects: Project[]) => {
    await dbUpsert("projects", projects.map(projectToRow), "position");
    setSettings((prev) => {
      const next = { ...prev, projects };
      writeCache(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(async () => {
    await saveContact(DEFAULT_SETTINGS.contact);
    await saveAbout(DEFAULT_SETTINGS.about);
    await saveProjects(DEFAULT_SETTINGS.projects);
  }, [saveContact, saveAbout, saveProjects]);

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        status,
        reloadSettings,
        authReady,
        isAdmin,
        login,
        logout,
        inquiries,
        refreshInquiries,
        addInquiry,
        markInquiryRead,
        deleteInquiry,
        clearInquiries,
        saveContact,
        saveAbout,
        saveProjects,
        resetSettings,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx)
    throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  return ctx;
}
