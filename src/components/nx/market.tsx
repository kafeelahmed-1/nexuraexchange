import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, ArrowUpDown, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fmtPrice, fmtCompact, genCandles, useMarkets, type Asset, type Candle } from "@/lib/market";
import { AnimatedNumber, Skeleton, useFakeLoad } from "./motion";

export function CoinIcon({ a, size = 28 }: { a: Pick<Asset, "symbol" | "color">; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full text-[10px] font-black"
      style={{ width: size, height: size, background: `color-mix(in oklab, ${a.color} 22%, #0b1318)`, color: a.color, border: `1px solid color-mix(in oklab, ${a.color} 40%, transparent)` }}
    >
      {a.symbol.slice(0, a.symbol.length > 4 ? 2 : 3)}
    </span>
  );
}

export function Sparkline({ data, w = 110, h = 34, positive }: { data: number[]; w?: number; h?: number; positive?: boolean }) {
  const up = positive ?? (data[data.length - 1] ?? 0) >= (data[0] ?? 0);
  const d = useMemo(() => {
    const min = Math.min(...data), max = Math.max(...data), r = max - min || 1;
    return data.map((v, i) => `${i ? "L" : "M"}${((i / (data.length - 1)) * w).toFixed(1)},${(h - 2 - ((v - min) / r) * (h - 4)).toFixed(1)}`).join(" ");
  }, [data, w, h]);
  const col = up ? "var(--primary)" : "var(--destructive)";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible transition-transform duration-300 group-hover:scale-105">
      <motion.path d={d} fill="none" stroke={col} strokeWidth={1.6} strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: "easeOut" }}
        style={{ transition: "d 0.6s ease" }} />
    </svg>
  );
}

export function Change({ v, className }: { v: number; className?: string }) {
  return (
    <span className={cn("num inline-block rounded px-1.5 py-0.5 text-xs font-semibold", v >= 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive", className)}>
      {v >= 0 ? "+" : ""}{v.toFixed(2)}%
    </span>
  );
}

const tabs = [
  { id: "hot", label: "All Hot" },
  { id: "gainers", label: "Top Gainers" },
  { id: "deriv", label: "100x Derivatives" },
  { id: "l1defi", label: "Layer 1 & DeFi" },
] as const;

type SortKey = "symbol" | "price" | "change24h" | "volume";

export function MarketTable({ limit, full }: { limit?: number; full?: boolean }) {
  const all = useMarkets();
  const loading = useFakeLoad(900);
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("hot");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ k: SortKey; dir: 1 | -1 }>({ k: "volume", dir: -1 });

  const rows = useMemo(() => {
    let r = all.filter((a) => a.symbol.toLowerCase().includes(q.toLowerCase()) || a.name.toLowerCase().includes(q.toLowerCase()));
    if (tab === "hot") r = r.filter((a) => full || a.category.includes("hot") || a.volume > 0);
    if (tab === "gainers") r = r.filter((a) => a.change24h > 0).sort((a, b) => b.change24h - a.change24h);
    if (tab === "deriv") r = r.filter((a) => a.lev >= 75);
    if (tab === "l1defi") r = r.filter((a) => a.category.includes("l1defi"));
    if (tab !== "gainers") r = [...r].sort((a, b) => (a[sort.k] > b[sort.k] ? 1 : -1) * sort.dir);
    return limit ? r.slice(0, limit) : r;
  }, [all, tab, q, sort, limit, full]);

  const th = (k: SortKey, label: string, cls = "") => (
    <th className={cn("px-4 py-3 font-semibold", cls)}>
      <button onClick={() => setSort((s) => ({ k, dir: s.k === k ? (-s.dir as 1 | -1) : -1 }))} className="inline-flex items-center gap-1 hover:text-foreground">
        {label} <ArrowUpDown size={11} className={sort.k === k ? "text-primary" : ""} />
      </button>
    </th>
  );

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border p-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn("relative shrink-0 rounded-md px-3 py-2 text-sm font-semibold transition-colors", tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
              {tab === t.id && <motion.span layoutId={`mt-tab-${full ? "f" : "h"}`} className="absolute inset-0 rounded-md border border-primary/30 bg-primary/10" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>
        <label className="relative flex items-center">
          <Search size={15} className="absolute left-3 text-dim" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search coin (e.g. BTC, ETH)" className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary/50 focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_15%,transparent)] md:w-64" />
        </label>
      </div>

      {/* desktop */}
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-dim">
            <tr>
              {th("symbol", "Asset")}
              {th("price", "Last Price", "text-right")}
              {th("change24h", "24h Change", "text-right")}
              <th className="px-4 py-3 text-center font-semibold">7D Trend</th>
              <th className="px-4 py-3 text-right font-semibold">24h High / Low</th>
              {full && th("volume", "Volume", "text-right")}
              <th className="px-4 py-3 text-right font-semibold">Quick Trade</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: limit ?? 10 }).map((_, i) => (
                  <tr key={i} className="border-t border-border"><td colSpan={full ? 7 : 6} className="px-4 py-3"><Skeleton className="h-8 w-full" /></td></tr>
                ))
              : rows.map((a) => (
                  <tr key={a.symbol} onClick={() => navigate({ to: "/trade/$pair", params: { pair: `${a.symbol}-USDT` } })}
                    className="group cursor-pointer border-t border-border transition-colors hover:bg-elevated [&>td:first-child]:border-l-2 [&>td:first-child]:border-l-transparent hover:[&>td:first-child]:border-l-primary">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3"><CoinIcon a={a} />
                        <div><div className="font-bold">{a.symbol}<span className="text-dim font-medium">/USDT</span></div><div className="text-xs text-muted-foreground">{a.name}</div></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold"><AnimatedNumber value={a.price} format={fmtPrice} /></td>
                    <td className="px-4 py-3 text-right"><Change v={a.change24h} /></td>
                    <td className="px-4 py-3"><div className="flex justify-center"><Sparkline data={a.sparkline} positive={a.change24h >= 0} /></div></td>
                    <td className="num px-4 py-3 text-right text-xs text-muted-foreground">{fmtPrice(a.high24h)}<br />{fmtPrice(a.low24h)}</td>
                    {full && <td className="num px-4 py-3 text-right text-muted-foreground">${fmtCompact(a.volume)}</td>}
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex gap-2">
                        <Link to="/trade/$pair" params={{ pair: `${a.symbol}-USDT` }} className="rounded-md border border-primary/25 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary opacity-80 transition group-hover:opacity-100 hover:bg-primary/15">Spot</Link>
                        <Link to="/futures" className="rounded-md border border-cyan/25 bg-cyan/5 px-3 py-1.5 text-xs font-bold text-cyan opacity-80 transition group-hover:opacity-100 hover:bg-cyan/15">Futures</Link>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* mobile */}
      <div className="grid gap-2 p-2 md:hidden">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)
          : rows.map((a) => (
              <Link key={a.symbol} to="/trade/$pair" params={{ pair: `${a.symbol}-USDT` }} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-lg border border-border bg-surface p-3 active:bg-elevated">
                <div className="flex min-w-0 items-center gap-2"><CoinIcon a={a} size={30} />
                  <div className="min-w-0"><div className="truncate font-bold">{a.symbol}</div><div className="num truncate text-xs text-muted-foreground">{fmtPrice(a.price)}</div></div>
                </div>
                <Sparkline data={a.sparkline} w={56} h={24} positive={a.change24h >= 0} />
                <div className="flex flex-col items-end gap-1"><Change v={a.change24h} /><span className="text-[11px] font-bold text-primary">Trade</span></div>
              </Link>
            ))}
      </div>
      {!loading && rows.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No markets match “{q}”.</div>}
    </div>
  );
}

export function OrderBook({ mid, base = "BTC", rows = 3, compact }: { mid: number; base?: string; rows?: number; compact?: boolean }) {
  const [book, setBook] = useState(() => mkBook(mid, rows));
  useEffect(() => { setBook(mkBook(mid, rows)); }, [mid, rows]);
  const max = Math.max(...book.bids.map((b) => b[1]), ...book.asks.map((b) => b[1]));
  const Row = ({ p, s, side }: { p: number; s: number; side: "b" | "a" }) => (
    <div className="relative flex justify-between px-2 py-1 text-xs num">
      <motion.div className={cn("absolute inset-y-0", side === "b" ? "right-0 bg-primary/10" : "left-0 bg-destructive/10")} animate={{ width: `${(s / max) * 100}%` }} transition={{ duration: 0.5 }} />
      <span className={cn("relative", side === "b" ? "text-primary" : "text-destructive")}>{fmtPrice(p)}</span>
      <span className="relative text-muted-foreground">{s.toFixed(3)} {base}</span>
    </div>
  );
  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface p-3">
        <div><div className="mb-2 px-2 text-[11px] font-bold tracking-wider text-primary">BIDS (BUY)</div>{book.bids.map(([p, s], i) => <Row key={i} p={p} s={s} side="b" />)}</div>
        <div><div className="mb-2 px-2 text-[11px] font-bold tracking-wider text-destructive">ASKS (SELL)</div>{book.asks.map(([p, s], i) => <Row key={i} p={p} s={s} side="a" />)}</div>
      </div>
    );
  }
  return (
    <div className="text-xs">
      <div className="flex justify-between px-2 py-2 text-dim"><span>Price (USDT)</span><span>Size</span></div>
      {[...book.asks].reverse().map(([p, s], i) => <Row key={`a${i}`} p={p} s={s} side="a" />)}
      <div className="my-1 border-y border-border px-2 py-2 text-base font-bold num text-primary">{fmtPrice(mid)}</div>
      {book.bids.map(([p, s], i) => <Row key={`b${i}`} p={p} s={s} side="b" />)}
    </div>
  );
}
function mkBook(mid: number, n: number) {
  const step = mid * 0.00003 + 0.0000001;
  return {
    bids: Array.from({ length: n }, (_, i) => [mid - step * (i + 1) * 1.5, Math.random() * 2.2 + 0.2] as [number, number]),
    asks: Array.from({ length: n }, (_, i) => [mid + step * (i + 1) * 1.5, Math.random() * 2.2 + 0.2] as [number, number]),
  };
}

export function CandleChart({ price, tf, height = 380 }: { price: number; tf: string; height?: number }) {
  const [candles, setCandles] = useState<Candle[] | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [my, setMy] = useState<number | null>(null);
  const base = useRef(price);
  useEffect(() => {
    setCandles(null);
    const vol = { "1m": 0.002, "5m": 0.003, "15m": 0.004, "1h": 0.006, "4h": 0.01, "1D": 0.02 }[tf] ?? 0.005;
    const t = setTimeout(() => setCandles(genCandles(base.current, 70, vol)), 450);
    return () => clearTimeout(t);
  }, [tf]);
  if (!candles) return <Skeleton className="w-full" />;
  const W = 800, H = height, pad = 50;
  const hi = Math.max(...candles.map((c) => c.h)), lo = Math.min(...candles.map((c) => c.l));
  const y = (v: number) => 10 + ((hi - v) / (hi - lo)) * (H - 60);
  const cw = (W - pad) / candles.length;
  const hc = hover != null ? candles[hover] : null;
  return (
    <div className="relative w-full" style={{ height: H }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full"
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width) * W; setHover(Math.min(candles.length - 1, Math.max(0, Math.floor(x / cw)))); setMy(((e.clientY - r.top) / r.height) * H); }}
        onMouseLeave={() => { setHover(null); setMy(null); }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const yy = 10 + (i * (H - 60)) / 4;
          return <g key={i}><line x1={0} x2={W - pad} y1={yy} y2={yy} stroke="rgba(255,255,255,0.05)" /><text x={W - pad + 4} y={yy + 4} fill="var(--dim)" fontSize={10} fontFamily="monospace">{fmtPrice(hi - (i * (hi - lo)) / 4)}</text></g>;
        })}
        {candles.map((c, i) => {
          const up = c.c >= c.o, col = up ? "var(--primary)" : "var(--destructive)";
          return (
            <motion.g key={i} initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} transition={{ delay: i * 0.008, duration: 0.3 }} style={{ transformOrigin: `${i * cw}px ${y(c.c)}px` }}>
              <line x1={i * cw + cw / 2} x2={i * cw + cw / 2} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth={1} />
              <rect x={i * cw + cw * 0.18} width={cw * 0.64} y={y(Math.max(c.o, c.c))} height={Math.max(1, Math.abs(y(c.o) - y(c.c)))} fill={col} rx={1} />
              <rect x={i * cw + cw * 0.18} width={cw * 0.64} y={H - 10 - c.v / 4} height={c.v / 4} fill={col} opacity={0.18} />
            </motion.g>
          );
        })}
        {hover != null && <line x1={hover * cw + cw / 2} x2={hover * cw + cw / 2} y1={0} y2={H} stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />}
        {my != null && <line x1={0} x2={W - pad} y1={my} y2={my} stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />}
      </svg>
      {hc && (
        <div className="num pointer-events-none absolute left-3 top-2 flex flex-wrap gap-3 rounded-md bg-background/80 px-2 py-1 text-[11px] backdrop-blur">
          <span className="text-muted-foreground">O <b className="text-foreground">{fmtPrice(hc.o)}</b></span>
          <span className="text-muted-foreground">H <b className="text-foreground">{fmtPrice(hc.h)}</b></span>
          <span className="text-muted-foreground">L <b className="text-foreground">{fmtPrice(hc.l)}</b></span>
          <span className="text-muted-foreground">C <b className={hc.c >= hc.o ? "text-primary" : "text-destructive"}>{fmtPrice(hc.c)}</b></span>
        </div>
      )}
    </div>
  );
}

export function TimeframeTabs({ value, onChange, options, id }: { value: string; onChange: (v: string) => void; options: string[]; id: string }) {
  return (
    <div className="flex gap-1">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} className={cn("relative rounded px-2.5 py-1 text-xs font-semibold", value === o ? "text-foreground" : "text-dim hover:text-foreground")}>
          {value === o && <motion.span layoutId={id} className="absolute inset-0 rounded bg-elevated" />}
          <span className="relative">{o}</span>
        </button>
      ))}
    </div>
  );
}

export function ActionButton({ label, variant, onDone }: { label: string; variant: "green" | "red"; onDone?: () => void }) {
  const [st, setSt] = useState<"idle" | "loading" | "ok">("idle");
  const click = () => {
    if (st !== "idle") return;
    setSt("loading");
    setTimeout(() => { setSt("ok"); toast.success("Paper order submitted", { description: "Simulated order — no real funds." }); onDone?.(); }, 800);
    setTimeout(() => setSt("idle"), 2000);
  };
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={click} data-cursor="button"
      className={cn("flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-bold transition-shadow", variant === "green" ? "bg-primary text-primary-foreground hover:shadow-[0_8px_30px_-10px_var(--primary)]" : "bg-destructive text-destructive-foreground hover:shadow-[0_8px_30px_-10px_var(--destructive)]")}>
      {st === "loading" ? <Loader2 size={16} className="animate-spin" /> : st === "ok" ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={18} /></motion.span> : label}
    </motion.button>
  );
}

export function TradingPanel({ symbol, price }: { symbol: string; price: number }) {
  const [type, setType] = useState("Limit");
  const [pct, setPct] = useState(25);
  const field = (label: string, val: string, unit: string) => (
    <label className="flex items-center rounded-md border border-border bg-surface px-3 py-2 text-sm transition focus-within:border-primary/50">
      <span className="w-14 text-dim">{label}</span>
      <input defaultValue={val} className="num min-w-0 flex-1 bg-transparent text-right outline-none" />
      <span className="ml-2 text-xs text-dim">{unit}</span>
    </label>
  );
  return (
    <div>
      <div className="mb-3 flex gap-4 border-b border-border text-sm">
        {["Limit", "Market", "Stop Limit"].map((t) => (
          <button key={t} onClick={() => setType(t)} className={cn("relative pb-2 font-semibold", type === t ? "text-foreground" : "text-dim")}>
            {t}{type === t && <motion.span layoutId="ot" className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />}
          </button>
        ))}
        <span className="ml-auto self-center"><span className="rounded border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[10px] font-bold text-warning">PAPER</span></span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(["Buy", "Sell"] as const).map((side) => (
          <div key={side} className="space-y-2">
            {type === "Stop Limit" && field("Stop", fmtPrice(price * (side === "Buy" ? 1.01 : 0.99)).replace(/,/g, ""), "USDT")}
            {type !== "Market" ? field("Price", fmtPrice(price).replace(/,/g, ""), "USDT") : <div className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-dim">Market price</div>}
            {field("Amount", (pct / 100).toFixed(4), symbol)}
            <input type="range" min={0} max={100} value={pct} onChange={(e) => setPct(+e.target.value)} className="w-full accent-[var(--primary)]" />
            <div className="flex justify-between text-xs text-dim"><span>Avail. 10,000.00 USDT</span><span className="num">{pct}%</span></div>
            <ActionButton label={`Paper ${side} ${symbol}`} variant={side === "Buy" ? "green" : "red"} />
          </div>
        ))}
      </div>
    </div>
  );
}
