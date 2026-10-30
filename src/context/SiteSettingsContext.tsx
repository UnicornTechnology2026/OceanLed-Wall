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
import {
  recordConsent,
  grantedEvents,
  rowToConsentEvent,
} from "../lib/consent";
import type { ConsentChoices, ConsentEvent, ConsentRow } from "../lib/consent";

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

/** A gallery photo – the Projects page shows images only, no text. */
export interface Project {
  image: string;
}

export interface SiteSettings {
  contact: ContactSettings;
  about: AboutSettings;
  projects: Project[];
}

/** Every value shown on the LED Configurator page, saved with the quote request. */
export interface LedConfiguration {
  shape: string;
  shape_label: string;
  shape_detail: string;
  width_m: number;
  height_m: number;
  width_ft: number;
  height_ft: number;
  area_sqm: number;
  area_sqft: number;
  curve_angle_deg: number | null;
  orientation: string | null;
  pixel_pitch: string;
  preview_content: string;
  show_cabinet_grid: boolean;
  show_person: boolean;
  cabinet_columns: number;
  cabinet_rows: number;
  cabinets_total: number;
  cabinet_size_mm: string;
  resolution_x: number;
  resolution_y: number;
  megapixels: number;
  custom_requirements: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  /** where the inquiry came from, e.g. "contact", "led_configurator" */
  source: string;
  configuration: LedConfiguration | null;
  createdAt: string;
  read: boolean;
}

export type NewInquiry = Omit<
  Inquiry,
  "id" | "createdAt" | "read" | "source" | "configuration"
> & {
  source?: string;
  configuration?: LedConfiguration | null;
  consent: ConsentChoices;
};

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

  /** admin: append-only log of who consented to what, and when */
  consents: ConsentEvent[];
  refreshConsents: () => Promise<void>;

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
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    },
    {
      image:
        "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80",
    },
    {
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    },
    {
      image:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    },
    {
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    },
    {
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
  source: string | null;
  configuration: LedConfiguration | null;
  is_read: boolean;
  created_at: string;
}

interface ProjectRow {
  image_url: string;
}

const rowToInquiry = (r: InquiryRow): Inquiry => ({
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone,
  message: r.message,
  source: r.source ?? "contact",
  configuration: r.configuration ?? null,
  createdAt: r.created_at,
  read: r.is_read,
});

const rowToProject = (r: ProjectRow): Project => ({
  image: r.image_url,
});

const projectToRow = (p: Project, position: number) => ({
  position,
  title: "",
  category: "",
  location: "",
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
  const [consents, setConsents] = useState<ConsentEvent[]>([]);
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
        dbSelect<ProjectRow>("projects", "select=image_url&order=position.asc"),
      ]);

      // Fall back to defaults for anything that has not been saved yet
      const next: SiteSettings = {
        contact: { ...DEFAULT_SETTINGS.contact, ...(rows[0]?.contact ?? {}) },
        about: { ...DEFAULT_SETTINGS.about, ...(rows[0]?.about ?? {}) },
        projects: projectRows.map(rowToProject),
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
      "select=id,name,email,phone,message,source,configuration,is_read,created_at&order=created_at.desc",
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

  const refreshConsents = useCallback(async () => {
    const rows = await dbSelect<ConsentRow>(
      "consent_events",
      "select=*&order=created_at.desc&limit=2000",
    );
    setConsents(rows.map(rowToConsentEvent));
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setConsents([]);
      return;
    }
    refreshConsents().catch((err) =>
      console.error("Failed to load consent records", err),
    );
  }, [isAdmin, refreshConsents]);

  const addInquiry = useCallback(async (inquiry: NewInquiry) => {
    if (!inquiry.consent.service) {
      throw new Error(
        "Please agree to us using your details for this request.",
      );
    }
    try {
      // Record consent first: no consent record, no processing.
      await recordConsent(
        { name: inquiry.name, email: inquiry.email, phone: inquiry.phone },
        grantedEvents(inquiry.consent),
        inquiry.source ?? "contact",
      );
      await dbInsert("inquiries", {
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        message: inquiry.message,
        source: inquiry.source ?? "contact",
        configuration: inquiry.configuration ?? null,
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
    if (projects.length > 0) {
      await dbUpsert("projects", projects.map(projectToRow), "position");
    }
    // remove rows left over from images the admin deleted
    await dbDelete("projects", `position=gte.${projects.length}`);

    // Row-level security can silently ignore a delete, so confirm it worked
    const remaining = await dbSelect<ProjectRow>(
      "projects",
      "select=image_url",
    );
    if (remaining.length > projects.length) {
      throw new Error(
        "The photo could not be removed from the website – the database is missing delete permission on the projects table (see the SQL policy).",
      );
    }

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
        consents,
        refreshConsents,
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
