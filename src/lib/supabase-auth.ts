import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { addLocalNotification } from "@/lib/local-features";
import { supabase } from "@/lib/supabase";

export interface DemoProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  accountType: "demo" | "admin";
  role: "user" | "admin";
  suspended: boolean;
}

export interface DemoAccountState {
  userId: string;
  welcomeBonusGranted: boolean;
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

type ProfileRow = {
  id: string;
  full_name: string;
  role: "user" | "admin";
  suspended: boolean;
};

const accountStateChangedEvent = "nexora:demo-account-state-changed";
const checkedBonusUsers = new Set<string>();

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isAdminUser(user: DemoProfile | null | undefined) {
  return user?.role === "admin";
}

function mapProfile(profile: ProfileRow, authUser: User): DemoProfile {
  const role = profile.role === "admin" ? "admin" : "user";
  return {
    id: profile.id,
    name: profile.full_name || authUser.user_metadata?.["full_name"] || "Nexora user",
    email: authUser.email ?? "",
    createdAt: authUser.created_at,
    accountType: role === "admin" ? "admin" : "demo",
    role,
    suspended: profile.suspended,
  };
}

async function getProfile(authUser: User) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, suspended")
    .eq("id", authUser.id)
    .single();
  if (error) throw error;
  return mapProfile(data as ProfileRow, authUser);
}

export function createInitialAccountState(userId: string): DemoAccountState {
  return {
    userId,
    welcomeBonusGranted: false,
    portfolio: { totalBalance: 0, availableBalance: 0, unrealizedPnL: 0, realizedPnL: 0 },
    assets: { USDT: 0, BTC: 0, ETH: 0, SOL: 0, BNB: 0, XRP: 0, DOGE: 0 },
    positions: {},
    orders: { openOrders: [], orderHistory: [], tradeHistory: [] },
    fundingHistory: [],
    watchlist: ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
  };
}

export async function registerDemoUser(name: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email: normalizeEmail(email),
    password,
    options: { data: { full_name: name.trim() } },
  });
  if (error) throw error;
  if (!data.user) throw new Error("Supabase did not return a user for this registration.");
  return {
    id: data.user.id,
    name: name.trim(),
    email: data.user.email ?? normalizeEmail(email),
    createdAt: data.user.created_at,
    accountType: "demo",
    role: "user",
    suspended: false,
  } satisfies DemoProfile;
}

async function loginDemoAccount(email: string, password: string, expectedRole: "user" | "admin") {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  });
  if (error) throw error;
  if (!data.user) throw new Error("Supabase did not return an authenticated user.");

  try {
    const profile = await getProfile(data.user);
    if (profile.suspended) throw new Error("This account has been suspended by the administrator.");
    if (profile.role !== expectedRole) {
      throw new Error(
        expectedRole === "admin"
          ? "This account does not have administrator access."
          : "Administrator accounts must sign in at /admin.",
      );
    }
    return profile;
  } catch (error) {
    await supabase.auth.signOut();
    throw error;
  }
}

export function loginDemoUser(email: string, password: string) {
  return loginDemoAccount(email, password, "user");
}

export function loginDemoAdmin(email: string, password: string) {
  return loginDemoAccount(email, password, "admin");
}

export async function getDemoAccountState(userId: string): Promise<DemoAccountState> {
  const { data, error } = await supabase
    .from("account_data")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data?.data as DemoAccountState | undefined) ?? createInitialAccountState(userId);
}

export async function saveDemoAccountState(state: DemoAccountState) {
  const { error } = await supabase.from("account_data").upsert(
    {
      user_id: state.userId,
      data: state,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
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

export async function executeSpotMarketOrder(
  userId: string,
  symbol: string,
  side: "buy" | "sell",
  quantity: number,
  price: number,
  marketPrices: Record<string, number>,
) {
  const asset = symbol.trim().toUpperCase();
  if (!/^[A-Z0-9]{2,12}$/.test(asset) || asset === "USDT")
    throw new Error("Choose a valid USDT market.");
  if (!Number.isFinite(quantity) || quantity <= 0)
    throw new Error("Enter an amount greater than zero.");
  if (!Number.isFinite(price) || price <= 0)
    throw new Error("The market price is unavailable. Try again.");

  const state = await getDemoAccountState(userId);
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
    if (notional > currentCash + 1e-8)
      throw new InsufficientBalanceError("USDT", currentCash, notional);
    const nextQuantity = currentQuantity + tradeQuantity;
    positions[asset] = {
      quantity: nextQuantity,
      averageEntryPrice:
        (currentQuantity * averageEntryPrice + tradeQuantity * price) / nextQuantity,
    };
    nextAssets["USDT"] = Math.max(0, currentCash - notional);
    nextAssets[asset] = nextQuantity;
  } else {
    if (tradeQuantity > currentQuantity + 1e-8)
      throw new InsufficientBalanceError(asset, currentQuantity, tradeQuantity);
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
    const markPrice =
      balanceSymbol === "USDT"
        ? 1
        : (marketPrices[balanceSymbol] ?? positions[balanceSymbol]?.averageEntryPrice ?? 0);
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
  await saveDemoAccountState(updated);
  return { state: updated, trade };
}

export async function logoutDemoUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function useDemoUser() {
  const [user, setUser] = useState<DemoProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const refresh = async (authUser: User | null) => {
      if (!authUser) {
        if (active) {
          setUser(null);
          setLoaded(true);
        }
        return;
      }
      try {
        const profile = await getProfile(authUser);
        if (profile.suspended) {
          await supabase.auth.signOut({ scope: "local" });
          if (active) setUser(null);
          return;
        }
        if (profile.role === "user" && !checkedBonusUsers.has(profile.id)) {
          checkedBonusUsers.add(profile.id);
          try {
            const { data, error } = await supabase.rpc("claim_welcome_bonus");
            if (error) throw error;
            if (data === true) {
              const description = "$200 USDT has been added to your account.";
              toast.success("You’ve been rewarded with a $200 welcome bonus!", { description });
              addLocalNotification({
                type: "system",
                title: "$200 welcome bonus credited",
                description,
              });
              window.dispatchEvent(new Event(accountStateChangedEvent));
            }
          } catch (error) {
            toast.error(
              error instanceof Error
                ? `Unable to check your welcome bonus: ${error.message}`
                : "Unable to check your welcome bonus. Please try again later.",
            );
          }
        }
        if (active) setUser(profile);
      } catch (error) {
        const missingProfile =
          !!error && typeof error === "object" && "code" in error && error.code === "PGRST116";
        if (missingProfile) await supabase.auth.signOut({ scope: "local" });
        if (active && missingProfile) setUser(null);
      } finally {
        if (active) setLoaded(true);
      }
    };

    const refreshCurrentUser = () => {
      if (document.visibilityState !== "visible") return;
      void supabase.auth.getSession().then(({ data, error }) => {
        if (!error) void refresh(data.session?.user ?? null);
      });
    };

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        if (active) setLoaded(true);
        return;
      }
      void refresh(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => void refresh(session?.user ?? null), 0);
    });
    const refreshInterval = window.setInterval(refreshCurrentUser, 15_000);
    window.addEventListener("focus", refreshCurrentUser);
    document.addEventListener("visibilitychange", refreshCurrentUser);

    return () => {
      active = false;
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", refreshCurrentUser);
      document.removeEventListener("visibilitychange", refreshCurrentUser);
      subscription.unsubscribe();
    };
  }, []);

  return { user, loaded };
}
