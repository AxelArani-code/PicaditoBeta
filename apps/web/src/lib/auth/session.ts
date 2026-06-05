const AUTH_SESSION_KEY = "picadito.auth.session";

export type AuthSession = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user?: unknown;
};

export function saveAuthSession(session: AuthSession): void {
  if (typeof window === "undefined") {
    return;
  }

  const expiresAt =
    typeof session.expires_in === "number"
      ? Date.now() + session.expires_in * 1000
      : session.expires_at;

  localStorage.setItem(
    AUTH_SESSION_KEY,
    JSON.stringify({
      ...session,
      expires_at: expiresAt,
    })
  );
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const session = JSON.parse(raw) as AuthSession;

    if (session.expires_at && Date.now() >= session.expires_at) {
      localStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function getAccessToken(): string | null {
  return getAuthSession()?.access_token ?? null;
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_SESSION_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export function buildAuthHeaders(baseHeaders?: HeadersInit): HeadersInit {
  const token = getAccessToken();

  return {
    "Content-Type": "application/json",
    ...baseHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
