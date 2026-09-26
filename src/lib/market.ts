import { useSyncExternalStore } from "react";

export type Category = "hot" | "l1defi" | "meme" | "ai";
export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: number;
  sparkline: number[];
  category: Category[];
  color: string;
  lev: number;
}

export function stableRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

const seed: [string, string, number, number, Category[], string, number][] = [
  ["BTC", "Bitcoin", 83737.64, 1.42, ["hot", "l1defi"], "#F7931A", 100],
  ["ETH", "Ethereum", 2685.84, 2.18, ["hot", "l1defi"], "#8A9BB8", 100],
  ["SOL", "Solana", 120.3795, 3.51, ["hot", "l1defi"], "#14F195", 100],
  ["BNB", "BNB", 773.41, -0.62, ["hot", "l1defi"], "#F3BA2F", 75],
  ["XRP", "XRP", 1.56118, -1.24, ["hot"], "#9AA5B1", 75],
  ["DOGE", "Dogecoin", 0.096909, 4.12, ["hot", "meme"], "#C2A633", 75],
  ["FIL", "Filecoin", 2.8741, 5.83, ["l1defi"], "#0090FF", 50],
  ["MON", "Monad", 0.4721, 12.4, ["hot", "l1defi"], "#7FD4C1", 50],
  ["SUI", "Sui", 1.0955, 6.2, ["hot", "l1defi"], "#4DA2FF", 75],
  ["HBAR", "Hedera", 0.18342, -2.1, ["l1defi"], "#9AA5B1", 50],
  ["PEPE", "Pepe", 0.00000812, 8.9, ["meme"], "#4C9540", 50],
  ["ADA", "Cardano", 0.6521, 0.84, ["l1defi"], "#3468D1", 75],
  ["AVAX", "Avalanche", 21.843, -0.37, ["l1defi"], "#E84142", 75],
  ["LINK", "Chainlink", 13.7683, 1.93, ["l1defi"], "#2A5ADA", 75],
  ["UNI", "Uniswap", 9.6563, 0.67, ["l1defi"], "#FF007A", 50],
  ["AAVE", "Aave", 153.4173, 2.6, ["l1defi"], "#B6509E", 50],
  ["NEAR", "NEAR", 4.9811, -0.94, ["l1defi", "ai"], "#00C08B", 50],
  ["ARB", "Arbitrum", 0.4102, -3.2, ["l1defi"], "#28A0F0", 50],
  ["OP", "Optimism", 0.7183, 1.1, ["l1defi"], "#FF0420", 50],
  ["TIA", "Celestia", 3.214, -4.6, ["l1defi"], "#7B8FA1", 50],
  ["INJ", "Injective", 8.0348, -0.94, ["l1defi"], "#0082FA", 50],
  ["RENDER", "Render", 3.842, 7.1, ["ai"], "#E0443A", 50],
  ["FET", "Fetch.ai", 0.6124, 5.3, ["ai"], "#1D2B4A", 50],
  ["GRT", "The Graph", 0.0921, 2.2, ["ai", "l1defi"], "#6F4CFF", 25],
  ["THETA", "Theta", 0.7812, -1.8, ["ai"], "#2AB8E6", 25],
  ["WLD", "Worldcoin", 0.9231, 9.4, ["ai"], "#BFC7CF", 50],
  ["SHIB", "Shiba Inu", 0.00001312, 1.6, ["meme"], "#FFA409", 50],
  ["WIF", "dogwifhat", 0.5621, -6.1, ["meme"], "#C49A6C", 50],
  ["BONK", "Bonk", 0.00001421, 3.9, ["meme"], "#F8A31B", 50],
  ["ONDO", "Ondo", 0.539774, 1.19, ["l1defi"], "#6A7B8C", 50],
];

function spark(base: number, trend: number): number[] {
  const out: number[] = [];
  let v = base * (1 - trend / 100);
  for (let i = 0; i < 24; i++) {
    v = v * (1 + (stableRandom(base * 1000 + i) - 0.5) * 0.02 + trend / 100 / 24);
    out.push(v);
  }
  out[23] = base;
  return out;
}

let assets: Asset[] = seed.map(([symbol, name, price, ch, category, color, lev]) => ({
  symbol, name, price, change24h: ch,
  high24h: price * (1 + Math.abs(ch) / 100 * 0.6 + 0.004),
  low24h: price * (1 - Math.abs(ch) / 100 * 0.8 - 0.003),
  volume: Math.round(price * (2e5 + stableRandom(price * 1e6) * 5e6)),
  sparkline: spark(price, ch),
  category, color, lev,
}));

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function tick() {
  assets = assets.map((a) => {
    if (Math.random() > 0.55) return a;
    const drift = (Math.random() - 0.5) * 0.0024;
    const price = a.price * (1 + drift);
    const change24h = +(a.change24h + drift * 100).toFixed(2);
    return {
      ...a, price, change24h,
      high24h: Math.max(a.high24h, price), low24h: Math.min(a.low24h, price),
      sparkline: [...a.sparkline.slice(1), price],
    };
  });
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  if (!timer && typeof window !== "undefined") timer = setInterval(tick, 3500);
  return () => {
    listeners.delete(l);
    if (!listeners.size && timer) { clearInterval(timer); timer = null; }
  };
}
const snap = () => assets;
const serverSnap = assets;

export function useMarkets() {
  return useSyncExternalStore(subscribe, snap, () => serverSnap);
}
export function useAsset(symbol: string) {
  const all = useMarkets();
  return all.find((a) => a.symbol === symbol.toUpperCase()) ?? all[0]!;
}

export function fmtPrice(p: number) {
  if (p >= 1000) return p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1) return p.toFixed(4);
  if (p >= 0.01) return p.toFixed(5);
  return p.toPrecision(4);
}
export function fmtCompact(n: number) {
  return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n);
}

export interface Candle { t: number; o: number; h: number; l: number; c: number; v: number }
export function genCandles(base: number, n = 80, vol = 0.006): Candle[] {
  const out: Candle[] = [];
  let c = base * (1 - vol * 4);
  for (let i = 0; i < n; i++) {
    const o = c;
    c = o * (1 + (Math.random() - 0.48) * vol * 2);
    const h = Math.max(o, c) * (1 + Math.random() * vol);
    const l = Math.min(o, c) * (1 - Math.random() * vol);
    out.push({ t: i, o, h, l, c, v: Math.random() * 100 + 20 });
  }
  const f = base / (out[n - 1]?.c ?? base);
  return out.map((k) => ({ ...k, o: k.o * f, h: k.h * f, l: k.l * f, c: k.c * f }));
}
