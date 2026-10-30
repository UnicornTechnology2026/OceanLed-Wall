import { useEffect, useState } from "react";

export const PAGES = [
  "home",
  "process",
  "projects",
  "about",
  "contact",
  "privacy-policy",
  "manage-consent",
] as const;

export type Page = (typeof PAGES)[number] | "not-found";

export function pageHref(page: Page): string {
  return page === "home" || page === "not-found" ? "/" : `/${page}`;
}

function pageFromPath(pathname: string): (typeof PAGES)[number] | null {
  const name = pathname.replace(/^\/+|\/+$/g, "") || "home";
  return (PAGES as readonly string[]).includes(name)
    ? (name as (typeof PAGES)[number])
    : null;
}

export function getPageFromLocation(): Page {
  return pageFromPath(window.location.pathname) ?? "not-found";
}

// Old links like /#/contact -> /contact (keeps previously shared URLs working)
if (typeof window !== "undefined") {
  const legacy = window.location.hash.match(/^#\/(\w+)/)?.[1];
  if (legacy && (PAGES as readonly string[]).includes(legacy)) {
    window.history.replaceState(null, "", pageHref(legacy as Page));
  }
}

export function navigate(page: Page) {
  const href = pageHref(page);
  if (window.location.pathname !== href || window.location.hash) {
    window.history.pushState(null, "", href);
  }
  window.dispatchEvent(new Event("pagechange"));
}

/** Turns clicks on normal <a href="/contact"> links into client-side navigation. */
export function installLinkHandler() {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.("a");
    if (!a || a.hasAttribute("download")) return;
    if (a.target && a.target !== "_self") return;
    const url = new URL(a.href, window.location.href);
    if (url.origin !== window.location.origin || url.hash) return;
    const page = pageFromPath(url.pathname);
    if (!page) return;
    e.preventDefault();
    navigate(page);
  };
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}

export function usePage(): Page {
  const [page, setPage] = useState<Page>(getPageFromLocation);

  useEffect(() => {
    const sync = () => {
      setPage(getPageFromLocation());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("pagechange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("pagechange", sync);
    };
  }, []);

  return page;
}
