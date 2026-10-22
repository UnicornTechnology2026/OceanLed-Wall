import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";

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

export interface SiteSettingsContextValue {
  settings: SiteSettings;
  isAdmin: boolean;
  inquiries: Inquiry[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateContact: (contact: Partial<ContactSettings>) => void;
  updateAbout: (about: Partial<AboutSettings>) => void;
  updateProject: (index: number, project: Partial<Project>) => void;
  addInquiry: (inquiry: NewInquiry) => Inquiry;
  markInquiryRead: (id: string) => void;
  deleteInquiry: (id: string) => void;
  clearInquiries: () => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: SiteSettings = {
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

const STORAGE_KEY = "ocean_led_settings";
const INQUIRIES_KEY = "ocean_led_inquiries";
const AUTH_KEY = "ocean_led_admin_auth";

const ADMIN_USER = "admin";
const ADMIN_PASS = "oceanled2026";

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(
  null,
);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const merged = {
          ...DEFAULT_SETTINGS,
          ...JSON.parse(saved),
        } as SiteSettings;
        // Browsers that saved the old placeholder address get the new office address
        if (merged.contact?.address === "Nagpur, Maharashtra, India") {
          merged.contact = {
            ...merged.contact,
            address: DEFAULT_SETTINGS.contact.address,
          };
        }
        return merged;
      }
    } catch {
      /* ignore */
    }
    return DEFAULT_SETTINGS;
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    try {
      const saved = localStorage.getItem(INQUIRIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      /* ignore */
    }
    return [];
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiries));
  }, [inquiries]);

  const login = useCallback((username: string, password: string) => {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      localStorage.setItem(AUTH_KEY, "true");
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setIsAdmin(false);
  }, []);

  const updateContact = useCallback((contact: Partial<ContactSettings>) => {
    setSettings((prev) => ({
      ...prev,
      contact: { ...prev.contact, ...contact },
    }));
  }, []);

  const updateAbout = useCallback((about: Partial<AboutSettings>) => {
    setSettings((prev) => ({ ...prev, about: { ...prev.about, ...about } }));
  }, []);

  const updateProject = useCallback(
    (index: number, project: Partial<Project>) => {
      setSettings((prev) => {
        const projects = [...prev.projects];
        projects[index] = { ...projects[index], ...project };
        return { ...prev, projects };
      });
    },
    [],
  );

  const addInquiry = useCallback((inquiry: NewInquiry) => {
    const entry: Inquiry = {
      id: Date.now().toString(),
      ...inquiry,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setInquiries((prev) => [entry, ...prev]);
    return entry;
  }, []);

  const markInquiryRead = useCallback((id: string) => {
    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }, []);

  const deleteInquiry = useCallback((id: string) => {
    setInquiries((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearInquiries = useCallback(() => {
    setInquiries([]);
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
  }, []);

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        isAdmin,
        inquiries,
        login,
        logout,
        updateContact,
        updateAbout,
        updateProject,
        addInquiry,
        markInquiryRead,
        deleteInquiry,
        clearInquiries,
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
