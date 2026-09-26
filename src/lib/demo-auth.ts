import { useEffect, useState } from "react";

export interface DemoProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  accountType: "demo";
}

interface StoredDemoUser {
  profile: DemoProfile;
  passwordSalt: string;
  passwordHash: string;
}

interface DemoSession {
  userId: string;
  createdAt: string;
}

export interface DemoAccountState {
  userId: string;
  portfolio: {
    totalBalance: number;
    availableBalance: number;
    unrealizedPnL: number;
    realizedPnL: number;
  };
  assets: Record<"USDT" | "BTC" | "ETH" | "SOL" | "BNB" | "XRP" | "DOGE", number>;
  orders: {
    openOrders: unknown[];
    orderHistory: unknown[];
    tradeHistory: unknown[];
  };
  fundingHistory: Array<{
    id: string;
    amount: number;
    asset: "USDT";
    createdAt: string;
    method: "sandbox-card";
    status: "completed";
  }>;
  watchlist: string[];
}

const usersKey = "nexora.demoUsers";
const sessionKey = "nexora.activeDemoSession";
const accountStateKey = "nexora.demoAccountState";
const sessionChangedEvent = "nexora:demo-session-changed";
const passwordIterations = 120_000;

function readJson<T>(key: string, fallback: T): T {
  const value = window.localStorage.getItem(key);
  if (value === null) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    throw new Error("Saved demo data is unreadable. Clear this site's local storage to start over.");
  }
}

function writeJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function notifySessionChanged() {
  window.dispatchEvent(new Event(sessionChangedEvent));
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password: string, salt: Uint8Array) {
  if (!crypto.subtle) throw new Error("This browser cannot create a local demo account.");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: passwordIterations },
    key,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
}

function initialAccountState(userId: string): DemoAccountState {
  return {
    userId,
    portfolio: { totalBalance: 0, availableBalance: 0, unrealizedPnL: 0, realizedPnL: 0 },
    assets: { USDT: 0, BTC: 0, ETH: 0, SOL: 0, BNB: 0, XRP: 0, DOGE: 0 },
    orders: { openOrders: [], orderHistory: [], tradeHistory: [] },
    fundingHistory: [],
    watchlist: ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
  };
}

export async function registerDemoUser(name: string, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = readJson<StoredDemoUser[]>(usersKey, []);
  if (!Array.isArray(users)) throw new Error("Saved demo accounts are unreadable. Clear this site's local storage to start over.");
  if (users.some((user) => user.profile.email === normalizedEmail)) {
    throw new Error("An account with this email already exists.");
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const profile: DemoProfile = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    createdAt: new Date().toISOString(),
    accountType: "demo",
  };
  const [passwordHash, accountStates] = await Promise.all([
    hashPassword(password, salt),
    Promise.resolve(readJson<Record<string, DemoAccountState>>(accountStateKey, {})),
  ]);
  if (!accountStates || typeof accountStates !== "object" || Array.isArray(accountStates)) {
    throw new Error("Saved demo portfolios are unreadable. Clear this site's local storage to start over.");
  }

  writeJson(usersKey, [...users, { profile, passwordSalt: bytesToHex(salt), passwordHash }]);
  writeJson(accountStateKey, { ...accountStates, [profile.id]: initialAccountState(profile.id) });
  return profile;
}

export async function loginDemoUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = readJson<StoredDemoUser[]>(usersKey, []);
  if (!Array.isArray(users)) throw new Error("Saved demo accounts are unreadable. Clear this site's local storage to start over.");
  const user = users.find((entry) => entry.profile.email === normalizedEmail);
  if (!user) throw new Error("Email or password is incorrect.");

  const salt = Uint8Array.from(user.passwordSalt.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16));
  if (salt.length !== 16 || (await hashPassword(password, salt)) !== user.passwordHash) {
    throw new Error("Email or password is incorrect.");
  }

  writeJson(sessionKey, { userId: user.profile.id, createdAt: new Date().toISOString() } satisfies DemoSession);
  notifySessionChanged();
  return user.profile;
}

export function getActiveDemoUser(): DemoProfile | null {
  const session = readJson<DemoSession | null>(sessionKey, null);
  if (!session || typeof session.userId !== "string") return null;
  const users = readJson<StoredDemoUser[]>(usersKey, []);
  if (!Array.isArray(users)) throw new Error("Saved demo accounts are unreadable. Clear this site's local storage to start over.");
  return users.find((user) => user.profile.id === session.userId)?.profile ?? null;
}

export function getDemoAccountState(userId: string): DemoAccountState {
  const states = readJson<Record<string, DemoAccountState>>(accountStateKey, {});
  if (!states || typeof states !== "object" || Array.isArray(states)) {
    throw new Error("Saved demo portfolio is unreadable. Clear this site's local storage to start over.");
  }
  const state = states[userId];
  if (state === undefined) return initialAccountState(userId);
  if (
    !state ||
    state.userId !== userId ||
    !state.portfolio ||
    !state.assets ||
    !state.orders ||
    !Array.isArray(state.orders.openOrders) ||
    !Array.isArray(state.orders.orderHistory) ||
    !Array.isArray(state.orders.tradeHistory) ||
    (state.fundingHistory !== undefined && !Array.isArray(state.fundingHistory)) ||
    !Array.isArray(state.watchlist)
  ) {
    throw new Error("Saved demo portfolio is unreadable. Clear this site's local storage to start over.");
  }
  return { ...state, fundingHistory: state.fundingHistory ?? [] };
}

export function saveDemoAccountState(state: DemoAccountState) {
  const states = readJson<Record<string, DemoAccountState>>(accountStateKey, {});
  if (!states || typeof states !== "object" || Array.isArray(states)) {
    throw new Error("Saved demo portfolio is unreadable. Clear this site's local storage to start over.");
  }
  writeJson(accountStateKey, { ...states, [state.userId]: state });
}

export function logoutDemoUser() {
  window.localStorage.removeItem(sessionKey);
  notifySessionChanged();
}

export function useDemoUser() {
  const [user, setUser] = useState<DemoProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const refresh = () => {
      try {
        setUser(getActiveDemoUser());
      } catch {
        setUser(null);
      }
      setLoaded(true);
    };
    refresh();
    window.addEventListener(sessionChangedEvent, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(sessionChangedEvent, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return { user, loaded };
}