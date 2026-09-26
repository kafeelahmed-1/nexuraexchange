import { useSyncExternalStore } from "react";

export interface PriceAlert {
  id: string;
  symbol: string;
  direction: "above" | "below";
  target: number;
  createdAt: string;
  triggeredAt: string | null;
}

export interface LocalNotification {
  id: string;
  type: "price" | "order" | "deposit" | "trading" | "security" | "system";
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
}

interface LocalFeaturesState {
  favorites: string[];
  alerts: PriceAlert[];
  notifications: LocalNotification[];
}

const storageKey = "nexora.localFeatures.v1";
const defaultState: LocalFeaturesState = {
  favorites: ["BTC", "ETH", "SOL"],
  alerts: [],
  notifications: [],
};
let state = defaultState;
let initialized = false;
const listeners = new Set<() => void>();

function initialize() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? "null");
    if (value && typeof value === "object") {
      const stored = value as Partial<LocalFeaturesState>;
      state = {
        favorites: Array.isArray(stored.favorites) ? stored.favorites.filter((item): item is string => typeof item === "string") : defaultState.favorites,
        alerts: Array.isArray(stored.alerts) ? stored.alerts.filter(isAlert) : [],
        notifications: Array.isArray(stored.notifications) ? stored.notifications.filter(isNotification) : [],
      };
    }
  } catch {
    state = defaultState;
  }
}

function isAlert(value: unknown): value is PriceAlert {
  if (!value || typeof value !== "object") return false;
  const alert = value as Partial<PriceAlert>;
  return typeof alert.id === "string" && typeof alert.symbol === "string" && (alert.direction === "above" || alert.direction === "below") && typeof alert.target === "number" && Number.isFinite(alert.target) && typeof alert.createdAt === "string" && (typeof alert.triggeredAt === "string" || alert.triggeredAt === null);
}

function isNotification(value: unknown): value is LocalNotification {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<LocalNotification>;
  return typeof item.id === "string" && typeof item.title === "string" && typeof item.description === "string" && typeof item.createdAt === "string" && typeof item.read === "boolean";
}

function emit() {
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* Storage may be unavailable or full. */ }
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  initialize();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function snapshot() {
  initialize();
  return state;
}

export function useLocalFeatures() {
  return useSyncExternalStore(subscribe, snapshot, () => defaultState);
}

export function toggleFavorite(symbol: string) {
  initialize();
  const normalized = symbol.toUpperCase();
  state = { ...state, favorites: state.favorites.includes(normalized) ? state.favorites.filter((item) => item !== normalized) : [...state.favorites, normalized] };
  emit();
}

export function addPriceAlert(symbol: string, direction: PriceAlert["direction"], target: number) {
  initialize();
  if (!Number.isFinite(target) || target <= 0) return;
  const alert: PriceAlert = { id: crypto.randomUUID(), symbol: symbol.toUpperCase(), direction, target, createdAt: new Date().toISOString(), triggeredAt: null };
  state = { ...state, alerts: [alert, ...state.alerts] };
  emit();
}

export function updatePriceAlert(id: string, update: Partial<Pick<PriceAlert, "triggeredAt">>) {
  initialize();
  state = { ...state, alerts: state.alerts.map((alert) => alert.id === id ? { ...alert, ...update } : alert) };
  emit();
}

export function removePriceAlert(id: string) {
  initialize();
  state = { ...state, alerts: state.alerts.filter((alert) => alert.id !== id) };
  emit();
}

export function addLocalNotification(notification: Omit<LocalNotification, "id" | "createdAt" | "read">) {
  initialize();
  state = { ...state, notifications: [{ ...notification, id: crypto.randomUUID(), createdAt: new Date().toISOString(), read: false }, ...state.notifications].slice(0, 100) };
  emit();
}

export function markNotificationRead(id: string) {
  initialize();
  state = { ...state, notifications: state.notifications.map((item) => item.id === id ? { ...item, read: true } : item) };
  emit();
}

export function markAllNotificationsRead() {
  initialize();
  state = { ...state, notifications: state.notifications.map((item) => ({ ...item, read: true })) };
  emit();
}

export function clearNotification(id: string) {
  initialize();
  state = { ...state, notifications: state.notifications.filter((item) => item.id !== id) };
  emit();
}
