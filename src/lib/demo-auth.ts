import { useEffect, useState } from "react";

export interface DemoProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  accountType: "demo" | "admin";
  role: "user" | "admin";
  suspended?: boolean;
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
const adminEmail = "admin@gmail.com";
const adminPassword = "admin123";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isAdminUser(user: DemoProfile | null | undefined) {
  return Boolean(user && (user.role === "admin" || user.accountType === "admin" || user.email === adminEmail));
}

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

export async function ensureDefaultAdmin() {
  const users = readJson<StoredDemoUser[]>(usersKey, []);
  const adminUser = users.find((entry) => entry.profile.email === adminEmail);
  if (adminUser) return adminUser.profile;

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const profile: DemoProfile = {
    id: crypto.randomUUID(),
    name: "BR Trades Admin",
    email: adminEmail,
    createdAt: new Date().toISOString(),
    accountType: "admin",
    role: "admin",
    suspended: false,
  };
  const passwordHash = await hashPassword(adminPassword, salt);
  writeJson(usersKey, [
    ...users,
    {
      profile,
      passwordSalt: bytesToHex(salt),
      passwordHash,
    },
  ]);
  const states = readJson<Record<string, DemoAccountState>>(accountStateKey, {});
  writeJson(accountStateKey, {
    ...states,
    [profile.id]: {
      ...initialAccountState(profile.id),
      portfolio: { totalBalance: 250000, availableBalance: 250000, unrealizedPnL: 0, realizedPnL: 0 },
      assets: { USDT: 250000, BTC: 1.6, ETH: 4.8, SOL: 48, BNB: 16, XRP: 1200, DOGE: 5000 },
    },
  });
  return profile;
}

export async function registerDemoUser(name: string, email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
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
    role: "user",
    suspended: false,
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
  await ensureDefaultAdmin();
  const normalizedEmail = normalizeEmail(email);
  const users = readJson<StoredDemoUser[]>(usersKey, []);
  if (!Array.isArray(users)) throw new Error("Saved demo accounts are unreadable. Clear this site's local storage to start over.");
  const user = users.find((entry) => entry.profile.email === normalizedEmail);
  if (!user) throw new Error("Email or password is incorrect.");

  const salt = Uint8Array.from(user.passwordSalt.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16));
  if (salt.length !== 16 || (await hashPassword(password, salt)) !== user.passwordHash) {
    throw new Error("Email or password is incorrect.");
  }
  if (user.profile.suspended) {
    throw new Error("This account has been suspended by the administrator.");
  }

  writeJson(sessionKey, { userId: user.profile.id, createdAt: new Date().toISOString() } satisfies DemoSession);
  notifySessionChanged();
  return user.profile;
}

export function getAllDemoUsers(): DemoProfile[] {
  const users = readJson<StoredDemoUser[]>(usersKey, []);
  if (!Array.isArray(users)) throw new Error("Saved demo accounts are unreadable. Clear this site's local storage to start over.");
  return users.map(({ profile }) => ({
    ...profile,
    role: profile.role ?? (profile.accountType === "admin" ? "admin" : "user"),
    accountType: profile.accountType ?? "demo",
    suspended: profile.suspended ?? false,
  }));
}

export function getActiveDemoUser(): DemoProfile | null {
  const session = readJson<DemoSession | null>(sessionKey, null);
  if (!session || typeof session.userId !== "string") return null;
  const users = getAllDemoUsers();
  return users.find((user) => user.id === session.userId) ?? null;
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

export async function updateDemoUserProfile(userId: string, changes: Partial<Pick<DemoProfile, "name" | "email" | "suspended">> & { password?: string }) {
  const users = readJson<StoredDemoUser[]>(usersKey, []);
  const index = users.findIndex((entry) => entry.profile.id === userId);
  if (index === -1) throw new Error("User not found.");

  const current = users[index];
  const nextEmail = normalizeEmail(changes.email ?? current.profile.email);
  if (users.some((entry) => entry.profile.id !== userId && entry.profile.email === nextEmail)) {
    throw new Error("An account with this email already exists.");
  }
  const mergedProfile: DemoProfile = {
    ...current.profile,
    name: changes.name?.trim() || current.profile.name,
    email: nextEmail,
    suspended: changes.suspended ?? current.profile.suspended ?? false,
    role: current.profile.role ?? (current.profile.accountType === "admin" ? "admin" : "user"),
    accountType: current.profile.accountType ?? "demo",
  };

  const nextUsers = users.map((entry) => (entry.profile.id === userId ? { ...entry, profile: mergedProfile } : entry));
  if (changes.password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const passwordHash = await hashPassword(changes.password, salt);
    nextUsers[index] = { ...nextUsers[index], passwordSalt: bytesToHex(salt), passwordHash };
  }

  writeJson(usersKey, nextUsers);
  notifySessionChanged();
  return mergedProfile;
}

export function toggleDemoUserSuspension(userId: string) {
  const users = readJson<StoredDemoUser[]>(usersKey, []);
  const target = users.find((entry) => entry.profile.id === userId);
  if (!target) throw new Error("User not found.");
  const updated = users.map((entry) =>
    entry.profile.id === userId
      ? { ...entry, profile: { ...entry.profile, suspended: !(entry.profile.suspended ?? false) } }
      : entry,
  );
  writeJson(usersKey, updated);
  notifySessionChanged();
  return updated.find((entry) => entry.profile.id === userId)?.profile ?? null;
}

export function deleteDemoUser(userId: string) {
  const users = readJson<StoredDemoUser[]>(usersKey, []);
  const filtered = users.filter((entry) => entry.profile.id !== userId);
  writeJson(usersKey, filtered);

  const states = readJson<Record<string, DemoAccountState>>(accountStateKey, {});
  if (states[userId]) delete states[userId];
  writeJson(accountStateKey, states);

  const session = readJson<DemoSession | null>(sessionKey, null);
  if (session?.userId === userId) {
    window.localStorage.removeItem(sessionKey);
  }
  notifySessionChanged();
  return filtered;
}

export async function createDemoUserByAdmin(name: string, email: string, password: string) {
  return registerDemoUser(name, email, password);
}

export function applyTradeManualPnl(userId: string, tradeId: string, pnl: number) {
  const states = readJson<Record<string, DemoAccountState>>(accountStateKey, {});
  const state = states[userId];
  if (!state) return null;

  const tradeHistory = state.orders.tradeHistory.map((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return entry;
    const record = entry as Record<string, unknown>;
    if (record.id !== tradeId) return entry;
    return { ...record, manualPnl: Number(pnl), pnl: Number(pnl), adjustedByAdmin: true, updatedAt: new Date().toISOString() };
  });

  const nextState: DemoAccountState = {
    ...state,
    orders: { ...state.orders, tradeHistory },
    portfolio: {
      ...state.portfolio,
      realizedPnL: tradeHistory.reduce((total, entry) => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) return total;
        const record = entry as Record<string, unknown>;
        const value = record.manualPnl ?? record.realizedPnL ?? record.pnl ?? 0;
        return total + Number(value || 0);
      }, 0),
    },
  };
  writeJson(accountStateKey, { ...states, [userId]: nextState });
  return nextState;
}

export function adjustBalance(userId: string, changes: Partial<DemoAccountState["portfolio"]> & { deltaUSDT?: number }) {
  const states = readJson<Record<string, DemoAccountState>>(accountStateKey, {});
  const current = states[userId] ?? initialAccountState(userId);
  const { deltaUSDT = 0, ...portfolioChanges } = changes;
  const next: DemoAccountState = {
    ...current,
    portfolio: {
      ...current.portfolio,
      ...portfolioChanges,
      availableBalance: Number(current.portfolio.availableBalance + deltaUSDT),
    },
    assets: {
      ...current.assets,
      USDT: Number(portfolioChanges.availableBalance ?? (current.assets.USDT ?? 0) + deltaUSDT),
    },
  };
  next.portfolio.totalBalance = Number(next.portfolio.availableBalance + next.portfolio.unrealizedPnL + next.portfolio.realizedPnL);
  writeJson(accountStateKey, { ...states, [userId]: next });
  return next;
}

export function useDemoUser() {
  const [user, setUser] = useState<DemoProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const refresh = () => {
      try {
        void ensureDefaultAdmin();
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