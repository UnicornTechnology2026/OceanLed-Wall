import { useEffect, useState } from "react";

export const PAGES = [
  "home",
  "process",
  "projects",
  "about",
  "faq",
  "contact",
] as const;

export type Page = (typeof PAGES)[number];

export function getPageFromHash(): Page {
  const match = window.location.hash.match(/^#\/(\w+)/);
  const name = match?.[1] as Page | undefined;
  return name && PAGES.includes(name) ? name : "home";
}

export function pageHref(page: Page): string {
  return page === "home" ? "#/" : `#/${page}`;
}

export function navigate(page: Page) {
  window.location.hash = pageHref(page);
}

export function usePage(): Page {
  const [page, setPage] = useState<Page>(getPageFromHash);

  useEffect(() => {
    const onHash = () => {
      setPage(getPageFromHash());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return page;
}
