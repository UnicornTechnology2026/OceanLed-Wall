const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(
  /\/+$/,
  "",
);
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);
export const IMAGE_BUCKET = "site-images";

function config() {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.",
    );
  }
  return { url, anonKey };
}

async function toError(res: Response): Promise<Error> {
  let message = `Request failed (${res.status})`;
  try {
    const body = await res.json();
    message =
      body.message ||
      body.msg ||
      body.error_description ||
      body.error ||
      message;
  } catch {
    /* non-JSON error body */
  }
  return new Error(message);
}

/* ───────── auth / session ───────── */

interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix seconds
}

const SESSION_KEY = "ocean_led_sb_session";
const listeners = new Set<(session: Session | null) => void>();

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

let session: Session | null = loadSession();

function setSession(next: Session | null) {
  session = next;
  try {
    if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* session just won't survive a reload */
  }
  listeners.forEach((fn) => fn(next));
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

function toSession(t: TokenResponse): Session {
  return {
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + t.expires_in,
  };
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<void> {
  const c = config();
  const res = await fetch(`${c.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: c.anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw await toError(res);
  setSession(toSession((await res.json()) as TokenResponse));
}

let refreshing: Promise<void> | null = null;

async function refreshSession(refreshToken: string): Promise<void> {
  const c = config();
  try {
    const res = await fetch(`${c.url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: c.anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      setSession(null); // refresh token no longer valid → signed out
      return;
    }
    setSession(toSession((await res.json()) as TokenResponse));
  } catch {
    /* network hiccup – keep the old session, retry on next request */
  }
}

async function getAccessToken(): Promise<string | null> {
  if (!session) return null;
  if (session.expires_at - Math.floor(Date.now() / 1000) < 60) {
    refreshing ??= refreshSession(session.refresh_token).finally(() => {
      refreshing = null;
    });
    await refreshing;
  }
  return session?.access_token ?? null;
}

export async function signOut(): Promise<void> {
  const c = config();
  const token = session?.access_token;
  setSession(null);
  if (token) {
    try {
      await fetch(`${c.url}/auth/v1/logout`, {
        method: "POST",
        headers: { apikey: c.anonKey, Authorization: `Bearer ${token}` },
      });
    } catch {
      /* already signed out locally */
    }
  }
}

/** Fires once with the current state, then on every sign-in / sign-out. */
export function onAuthChange(fn: (signedIn: boolean) => void): () => void {
  const listener = (s: Session | null) => fn(Boolean(s));
  listeners.add(listener);
  void getAccessToken().then(() => fn(Boolean(session)));
  return () => {
    listeners.delete(listener);
  };
}

/* ───────── REST (PostgREST) ───────── */

async function request(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
): Promise<Response> {
  const c = config();
  const token = await getAccessToken();
  const hasBody = options.body !== undefined;
  const res = await fetch(`${c.url}${path}`, {
    method: options.method ?? "GET",
    headers: {
      apikey: c.anonKey,
      Authorization: `Bearer ${token ?? c.anonKey}`,
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    body: hasBody ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) throw await toError(res);
  return res;
}

export async function dbSelect<T>(
  table: string,
  query = "select=*",
): Promise<T[]> {
  const res = await request(`/rest/v1/${table}?${query}`);
  return (await res.json()) as T[];
}

export async function dbInsert(table: string, row: object): Promise<void> {
  await request(`/rest/v1/${table}`, {
    method: "POST",
    body: row,
    headers: { Prefer: "return=minimal" },
  });
}

export async function dbUpsert(
  table: string,
  rows: object | object[],
  onConflict: string,
): Promise<void> {
  await request(`/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: "POST",
    body: rows,
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
  });
}

export async function dbUpdate(
  table: string,
  filter: string,
  patch: object,
): Promise<void> {
  await request(`/rest/v1/${table}?${filter}`, {
    method: "PATCH",
    body: patch,
    headers: { Prefer: "return=minimal" },
  });
}

export async function dbDelete(table: string, filter: string): Promise<void> {
  await request(`/rest/v1/${table}?${filter}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
}

export async function rpc<T>(fn: string): Promise<T> {
  const res = await request(`/rest/v1/rpc/${fn}`, { method: "POST", body: {} });
  return (await res.json()) as T;
}

/* ───────── Storage ───────── */

export async function uploadImage(blob: Blob, path: string): Promise<string> {
  const c = config();
  const token = await getAccessToken();
  const res = await fetch(
    `${c.url}/storage/v1/object/${IMAGE_BUCKET}/${path}`,
    {
      method: "POST",
      headers: {
        apikey: c.anonKey,
        Authorization: `Bearer ${token ?? c.anonKey}`,
        "Content-Type": "image/jpeg",
        "Cache-Control": "max-age=31536000",
        "x-upsert": "false",
      },
      body: blob,
    },
  );
  if (!res.ok) throw await toError(res);
  return `${c.url}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
}
/** Removes an uploaded image from Storage, given its public URL. Best-effort. */
export async function deleteImageByUrl(publicUrl: string): Promise<void> {
  const c = config();
  const prefix = `${c.url}/storage/v1/object/public/${IMAGE_BUCKET}/`;
  if (!publicUrl.startsWith(prefix)) return; // not one of our uploads
  const path = publicUrl.slice(prefix.length);
  const token = await getAccessToken();
  await fetch(`${c.url}/storage/v1/object/${IMAGE_BUCKET}/${path}`, {
    method: "DELETE",
    headers: {
      apikey: c.anonKey,
      Authorization: `Bearer ${token ?? c.anonKey}`,
    },
  });
}
