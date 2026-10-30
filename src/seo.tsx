import { useEffect } from "react";
import { pageHref } from "./router";
import type { Page } from "./router";

// TODO: replace with your real production domain (no trailing slash)
export const SITE_URL = "https://YOUR-DOMAIN.com";

const PAGE_META: Record<Page, { title: string; description: string }> = {
  home: {
    title: "OCEAN LED | LED Video Wall & Display Solutions in India",
    description:
      "OCEAN LED designs and supplies indoor and outdoor LED video walls, digital signage and custom LED display systems across India. Based in Nagpur. Get a free quote.",
  },
  process: {
    title: "Our Process | LED Display Planning & Installation | OCEAN LED",
    description:
      "See how OCEAN LED takes an LED video wall from requirement and design to installation and support, step by step.",
  },
  projects: {
    title: "Projects | LED Video Wall Installations | OCEAN LED",
    description:
      "Browse OCEAN LED projects: corporate video walls, outdoor displays, retail signage, control rooms and event backdrops across India.",
  },
  about: {
    title: "About OCEAN LED | LED Display Experts in Nagpur",
    description:
      "Learn about OCEAN LED, a Nagpur-based team delivering premium LED display solutions across India, and why customers choose us.",
  },
  contact: {
    title: "Contact OCEAN LED | Get an LED Display Quote",
    description:
      "Contact OCEAN LED in Nagpur for LED video wall and digital signage quotes. Call, email or visit our office.",
  },
  "privacy-policy": {
    title: "Privacy Policy | OCEAN LED",
    description:
      "How OCEAN LED collects, uses, stores and protects your personal data, and how you can withdraw consent, use your rights or complain to the Data Protection Board.",
  },
  "manage-consent": {
    title: "Manage Consent | OCEAN LED",
    description:
      "Withdraw your consent for marketing emails or WhatsApp updates from OCEAN LED in one step.",
  },
};

function setTag(
  selector: string,
  create: () => HTMLElement,
  attr: "content" | "href",
  value: string,
) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

const meta = (key: "name" | "property", val: string) => () => {
  const m = document.createElement("meta");
  m.setAttribute(key, val);
  return m;
};

function applyMeta(
  title: string,
  description: string,
  path: string,
  robots: string,
) {
  const url = `${SITE_URL}${path}`;
  document.title = title;
  setTag(
    'meta[name="description"]',
    meta("name", "description"),
    "content",
    description,
  );
  setTag('meta[name="robots"]', meta("name", "robots"), "content", robots);
  setTag(
    'link[rel="canonical"]',
    () => {
      const l = document.createElement("link");
      l.rel = "canonical";
      return l;
    },
    "href",
    url,
  );
  setTag(
    'meta[property="og:title"]',
    meta("property", "og:title"),
    "content",
    title,
  );
  setTag(
    'meta[property="og:description"]',
    meta("property", "og:description"),
    "content",
    description,
  );
  setTag('meta[property="og:url"]', meta("property", "og:url"), "content", url);
}

/** Per-page title, description, canonical and Open Graph tags. */
export function useSeo(page: Page) {
  useEffect(() => {
    const { title, description } = PAGE_META[page];
    applyMeta(
      title,
      description,
      pageHref(page),
      "index, follow, max-image-preview:large",
    );
  }, [page]);
}

/** Render on admin screens to keep them out of search results. */
export function NoIndex() {
  useEffect(() => {
    applyMeta("Admin | OCEAN LED", "Admin area", "/", "noindex, nofollow");
  }, []);
  return null;
}
