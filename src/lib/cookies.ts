/**
 * Cookie preferences + loading of non-essential trackers.
 * Nothing in this file runs a tracker until the visitor has agreed.
 *
 * Set these in Vercel -> Settings -> Environment Variables (leave empty to disable):
 *   VITE_GA_ID          e.g. G-XXXXXXXXXX   (Google Analytics 4)
 *   VITE_META_PIXEL_ID  e.g. 1234567890     (Meta / Facebook Pixel)
 */

export interface CookiePrefs {
  analytics: boolean;
  ads: boolean;
}

export interface StoredCookiePrefs extends CookiePrefs {
  decidedAt: string;
  policyVersion: string;
}

const KEY = "ocean_cookie_prefs";
const COOKIE_POLICY_VERSION = "2026-10-30";

export const PREFS_EVENT = "cookieprefs";
export const OPEN_EVENT = "opencookiesettings";

const GA_ID = (import.meta.env.VITE_GA_ID as string | undefined)?.trim();
const PIXEL_ID = (
  import.meta.env.VITE_META_PIXEL_ID as string | undefined
)?.trim();

export function getPrefs(): StoredCookiePrefs | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<StoredCookiePrefs>;
    if (typeof p.analytics !== "boolean" || typeof p.ads !== "boolean")
      return null;
    return {
      analytics: p.analytics,
      ads: p.ads,
      decidedAt: p.decidedAt ?? "",
      policyVersion: p.policyVersion ?? "",
    };
  } catch {
    return null;
  }
}

export function savePrefs(prefs: CookiePrefs) {
  const stored: StoredCookiePrefs = {
    ...prefs,
    decidedAt: new Date().toISOString(),
    policyVersion: COOKIE_POLICY_VERSION,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    /* storage unavailable: choice only lasts for this page view */
  }
  applyPrefs(prefs);
  window.dispatchEvent(new Event(PREFS_EVENT));
}

/** Used by the footer "Cookie settings" link. */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/* ───────── tracker loading ───────── */

let gaLoaded = false;
let pixelLoaded = false;

function addScript(src: string) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function loadGoogleAnalytics() {
  if (gaLoaded || !GA_ID) return;
  gaLoaded = true;
  const w = window as unknown as Record<string, unknown>;
  const layer: unknown[] = (w.dataLayer as unknown[]) ?? [];
  w.dataLayer = layer;
  // GA needs the real `arguments` object, so this must be a function declaration.
  function gtag(..._a: unknown[]) {
    // eslint-disable-next-line prefer-rest-params
    layer.push(arguments);
  }
  w.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_ID, { anonymize_ip: true });
  addScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
  // Single-page app: report each in-app page change.
  window.addEventListener("pagechange", () => {
    gtag("event", "page_view", {
      page_path: window.location.pathname,
    });
  });
}

function loadMetaPixel() {
  if (pixelLoaded || !PIXEL_ID) return;
  pixelLoaded = true;
  const w = window as unknown as Record<string, any>;
  if (!w.fbq) {
    const n: any = function (...args: unknown[]) {
      if (n.callMethod) n.callMethod(...args);
      else n.queue.push(args);
    };
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [] as unknown[];
    w.fbq = n;
    if (!w._fbq) w._fbq = n;
  }
  addScript("https://connect.facebook.net/en_US/fbevents.js");
  w.fbq("init", PIXEL_ID);
  w.fbq("track", "PageView");
}

function deleteTrackerCookies() {
  const host = window.location.hostname;
  const domains = [
    "",
    host,
    `.${host}`,
    `.${host.split(".").slice(-2).join(".")}`,
  ];
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (!/^(_ga|_gid|_gat|_fbp|_fbc)/.test(name)) return;
    domains.forEach((d) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${
        d ? `; domain=${d}` : ""
      }`;
    });
  });
}

/** Load what is allowed. If something already loaded is now refused, clean up and reload. */
export function applyPrefs(prefs: CookiePrefs | null) {
  const analytics = !!prefs?.analytics;
  const ads = !!prefs?.ads;

  if ((gaLoaded && !analytics) || (pixelLoaded && !ads)) {
    deleteTrackerCookies();
    window.location.reload();
    return;
  }
  if (analytics) loadGoogleAnalytics();
  if (ads) loadMetaPixel();
}
