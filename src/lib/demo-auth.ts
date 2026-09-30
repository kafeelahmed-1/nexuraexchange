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
  assets: Record<string, number>;
  positions?: Record<string, { quantity: number; averageEntryPrice: number }>;
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
const accountStateChangedEvent = "nexora:demo-account-state-changed";
const passwordIterations = 120_000;
const adminEmail = "admin@gmail.com";
const adminPassword = "admin123";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isAdminUser(user: DemoProfile | null | undefined) {
  return Boolean(user && (user.role === "admin" || user.accountType === "admin"));
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
    { name: "PBKDF2", hash: "SHA-256", salt: new Uint8Array(salt), iterations: passwordIterations },
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
    positions: {},
    orders: { openOrders: [], orderHistory: [], tradeHistory: [] },
    fundingHistory: [],
    watchlist: ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
  };
}

export async function ensureDefaultAdmin() {
  const users = readJson<StoredDemoUser[]>(usersKey, []);
  const adminUser = users.find((entry) => entry.profile.email === adminEmail);
  if (adminUser) {
    const profile = { ...adminUser.profile, accountType: "admin" as const, role: "admin" as const };
    if (adminUser.profile.accountType !== "admin" || adminUser.profile.role !== "admin") {
      writeJson(usersKey, users.map((entry) => entry.profile.id === profile.id ? { ...entry, profile } : entry));
    }
    return profile;
  }

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
  if (normalizedEmail === adminEmail) {
    throw new Error("This email is reserved for the administrator account.");
  }
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
  return users.find((user) => user.id === session.userId && !user.suspended) ?? null;
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
  const positions = state.positions ?? {};
  if (!positions || typeof positions !== "object" || Array.isArray(positions)) {
    throw new Error("Saved demo positions are unreadable. Clear this site's local storage to start over.");
  }
  return { ...state, positions, fundingHistory: state.fundingHistory ?? [] };
}

export function saveDemoAccountState(state: DemoAccountState) {
  const states = readJson<Record<string, DemoAccountState>>(accountStateKey, {});
  if (!states || typeof states !== "object" || Array.isArray(states)) {
    throw new Error("Saved demo portfolio is unreadable. Clear this site's local storage to start over.");
  }
  writeJson(accountStateKey, { ...states, [state.userId]: state });
  window.dispatchEvent(new Event(accountStateChangedEvent));
}

export class InsufficientBalanceError extends Error {
  constructor(
    public readonly asset: string,
    public readonly available: number,
    public readonly required: number,
  ) {
    super(`Insufficient ${asset} balance. Add funds or reduce the order amount.`);
    this.name = "InsufficientBalanceError";
  }
}

export function executeSpotMarketOrder(
  userId: string,
  symbol: string,
  side: "buy" | "sell",
  quantity: number,
  price: number,
  marketPrices: Record<string, number>,
) {
  const asset = symbol.trim().toUpperCase();
  if (!/^[A-Z0-9]{2,12}$/.test(asset) || asset === "USDT") throw new Error("Choose a valid USDT market.");
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("Enter an amount greater than zero.");
  if (!Number.isFinite(price) || price <= 0) throw new Error("The market price is unavailable. Try again.");

  const state = getDemoAccountState(userId);
  const currentQuantity = Number(state.assets[asset] ?? 0);
  const currentCash = Number(state.assets["USDT"] ?? 0);
  const tradeQuantity = Math.round(quantity * 1e8) / 1e8;
  if (tradeQuantity <= 0) throw new Error("Order amount is too small.");
  const notional = tradeQuantity * price;
  const nextAssets = { ...state.assets };
  const positions = { ...(state.positions ?? {}) };
  const currentPosition = positions[asset];
  const averageEntryPrice = currentPosition?.averageEntryPrice ?? price;
  let realizedPnL = 0;
  let filledQuantity = tradeQuantity;

  if (side === "buy") {
    if (notional > currentCash + 1e-8) {
      throw new InsufficientBalanceError("USDT", currentCash, notional);
    }
    const nextQuantity = currentQuantity + tradeQuantity;
    positions[asset] = {
      quantity: nextQuantity,
      averageEntryPrice: (currentQuantity * averageEntryPrice + tradeQuantity * price) / nextQuantity,
    };
    nextAssets["USDT"] = Math.max(0, currentCash - notional);
    nextAssets[asset] = nextQuantity;
  } else {
    if (tradeQuantity > currentQuantity + 1e-8) {
      throw new InsufficientBalanceError(asset, currentQuantity, tradeQuantity);
    }
    const soldQuantity = Math.min(tradeQuantity, currentQuantity);
    filledQuantity = soldQuantity;
    realizedPnL = (price - averageEntryPrice) * soldQuantity;
    const remaining = Math.max(0, currentQuantity - soldQuantity);
    nextAssets["USDT"] = currentCash + soldQuantity * price;
    nextAssets[asset] = remaining;
    if (remaining <= 1e-8) {
      delete positions[asset];
      nextAssets[asset] = 0;
    } else {
      positions[asset] = { quantity: remaining, averageEntryPrice };
    }
  }

  const unrealizedPnL = Object.entries(positions).reduce((total, [positionSymbol, position]) => {
    const markPrice = marketPrices[positionSymbol] ?? position.averageEntryPrice;
    return total + position.quantity * (markPrice - position.averageEntryPrice);
  }, 0);
  const totalBalance = Object.entries(nextAssets).reduce((total, [balanceSymbol, balance]) => {
    const markPrice = balanceSymbol === "USDT" ? 1 : marketPrices[balanceSymbol] ?? positions[balanceSymbol]?.averageEntryPrice ?? 0;
    return total + balance * markPrice;
  }, 0);
  const createdAt = new Date().toISOString();
  const trade = {
    id: crypto.randomUUID(),
    symbol: asset,
    pair: `${asset}/USDT`,
    side,
    type: "Market",
    quantity: filledQuantity,
    price,
    value: filledQuantity * price,
    realizedPnL,
    fee: 0,
    status: "Filled",
    createdAt,
  };
  const updated: DemoAccountState = {
    ...state,
    assets: nextAssets,
    positions,
    portfolio: {
      ...state.portfolio,
      totalBalance,
      availableBalance: nextAssets["USDT"],
      realizedPnL: state.portfolio.realizedPnL + realizedPnL,
      unrealizedPnL,
    },
    orders: {
      ...state.orders,
      orderHistory: [trade, ...state.orders.orderHistory],
      tradeHistory: [trade, ...state.orders.tradeHistory],
    },
  };
  saveDemoAccountState(updated);
  return { state: updated, trade };
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
  if (!current) throw new Error("User not found.");
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
    const updatedUser = nextUsers[index];
    if (!updatedUser) throw new Error("User not found.");
    nextUsers[index] = { ...updatedUser, passwordSalt: bytesToHex(salt), passwordHash };
  }

  writeJson(usersKey, nextUsers);
  notifySessionChanged();
  return mergedProfile;
}

export function toggleDemoUserSuspension(userId: string) {
  const users = readJson<StoredDemoUser[]>(usersKey, []);
  const target = users.find((entry) => entry.profile.id === userId);
  if (!target) throw new Error("User not found.");
  const suspended = !(target.profile.suspended ?? false);
  const updated = users.map((entry) =>
    entry.profile.id === userId
      ? { ...entry, profile: { ...entry.profile, suspended } }
      : entry,
  );
  writeJson(usersKey, updated);
  if (suspended) {
    const session = readJson<DemoSession | null>(sessionKey, null);
    if (session?.userId === userId) window.localStorage.removeItem(sessionKey);
  }
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
  if (!state) throw new Error("User account data could not be found.");
  if (!Number.isFinite(pnl)) throw new Error("Enter a valid P&L amount.");

  const currentTrade = state.orders.tradeHistory.find((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
    return (entry as Record<string, unknown>)["id"] === tradeId;
  });
  if (!currentTrade || typeof currentTrade !== "object" || Array.isArray(currentTrade)) {
    throw new Error("The selected trade could not be found.");
  }
  const currentRecord = currentTrade as Record<string, unknown>;
  const previousPnl = Number(currentRecord["manualPnl"] ?? currentRecord["realizedPnL"] ?? currentRecord["pnl"] ?? 0);
  if (!Number.isFinite(previousPnl)) throw new Error("The selected trade has invalid P&L data.");
  const pnlDelta = pnl - previousPnl;
  const nextUsdt = Number(state.assets["USDT"] ?? 0) + pnlDelta;
  if (nextUsdt < -1e-8) throw new Error("This loss would make the user's available USDT balance negative.");

  const tradeHistory = state.orders.tradeHistory.map((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return entry;
    const record = entry as Record<string, unknown>;
    if (record["id"] !== tradeId) return entry;
    return { ...record, manualPnl: Number(pnl), pnl: Number(pnl), adjustedByAdmin: true, updatedAt: new Date().toISOString() };
  });
  const orderHistory = state.orders.orderHistory.map((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return entry;
    const record = entry as Record<string, unknown>;
    return record["id"] === tradeId
      ? { ...record, manualPnl: Number(pnl), pnl: Number(pnl), realizedPnL: Number(pnl), adjustedByAdmin: true, updatedAt: new Date().toISOString() }
      : entry;
  });

  const nextState: DemoAccountState = {
    ...state,
    assets: { ...state.assets, USDT: Math.max(0, nextUsdt) },
    orders: { ...state.orders, tradeHistory, orderHistory },
    portfolio: {
      ...state.portfolio,
      totalBalance: state.portfolio.totalBalance + pnlDelta,
      availableBalance: Math.max(0, nextUsdt),
      realizedPnL: state.portfolio.realizedPnL + pnlDelta,
    },
  };
  saveDemoAccountState(nextState);
  return nextState;
}

export function adjustBalance(userId: string, changes: Partial<DemoAccountState["portfolio"]> & { deltaUSDT?: number }) {
  const states = readJson<Record<string, DemoAccountState>>(accountStateKey, {});
  const current = states[userId] ?? initialAccountState(userId);
  const { deltaUSDT = 0, ...portfolioChanges } = changes;
  const hasAvailableBalance = portfolioChanges.availableBalance !== undefined;
  const hasTotalBalance = portfolioChanges.totalBalance !== undefined;
  const availableBalance = hasAvailableBalance
    ? Number(portfolioChanges.availableBalance)
    : hasTotalBalance
      ? current.portfolio.availableBalance + Number(portfolioChanges.totalBalance) - current.portfolio.totalBalance
      : current.portfolio.availableBalance + deltaUSDT;
  const balanceDelta = availableBalance - current.portfolio.availableBalance;
  const totalBalance = hasTotalBalance
    ? Number(portfolioChanges.totalBalance)
    : current.portfolio.totalBalance + balanceDelta;
  if (!Number.isFinite(availableBalance) || availableBalance < 0 || !Number.isFinite(totalBalance) || totalBalance < 0) {
    throw new Error("Account balances must be valid, non-negative amounts.");
  }
  const { availableBalance: _availableBalance, totalBalance: _totalBalance, ...otherPortfolioChanges } = portfolioChanges;
  const next: DemoAccountState = {
    ...current,
    portfolio: {
      ...current.portfolio,
      ...otherPortfolioChanges,
      availableBalance,
      totalBalance,
    },
    assets: {
      ...current.assets,
      USDT: availableBalance,
    },
  };
  saveDemoAccountState(next);
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