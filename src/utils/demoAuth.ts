export const DEMO_SESSION_KEY = "dermacare-demo-session";
export const DEMO_REGISTRATION_KEY = "dermacare-demo-registration";
export const DEMO_OTP = "123456";

export const DEMO_ACCOUNT = {
  name: "Demo Patient",
  email: "demo.patient@dermacare.local",
  password: "DemoPass123",
  role: "PATIENT" as const,
};

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: "PATIENT";
};

export function isDemoAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_AUTH === "true";
}

function encodeBase64Url(value: string): string {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return window
      .btoa(value)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  return Buffer.from(value, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function createDemoToken(user: DemoUser): string {
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiry = issuedAt + 60 * 60 * 24 * 7;
  const payload = encodeBase64Url(
    JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iat: issuedAt,
      exp: expiry,
    })
  );

  return `${header}.${payload}.demo`;
}

export function readDemoSession(): { token: string; user: DemoUser } | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { token?: string; user?: DemoUser };
    if (!parsed.token || !parsed.user) {
      return null;
    }

    return { token: parsed.token, user: parsed.user };
  } catch {
    return null;
  }
}

export function persistDemoSession(token: string, user: DemoUser) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    DEMO_SESSION_KEY,
    JSON.stringify({
      token,
      user,
    })
  );
}

export function clearDemoSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(DEMO_SESSION_KEY);
}

export function readDemoRegistration(): { name: string; email: string; role: "PATIENT" } | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(DEMO_REGISTRATION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { name?: string; email?: string; role?: "PATIENT" };
    if (!parsed.email || !parsed.name || !parsed.role) {
      return null;
    }

    return {
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
    };
  } catch {
    return null;
  }
}

export function persistDemoRegistration(email: string, name: string, role: "PATIENT") {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    DEMO_REGISTRATION_KEY,
    JSON.stringify({
      email,
      name,
      role,
    })
  );
}

export function clearDemoRegistration() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(DEMO_REGISTRATION_KEY);
}
