import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAsset, fmtPrice } from "@/lib/market";
import { CandleChart, ActionButton, OrderBook } from "@/components/nx/market";
import { AnimatedNumber } from "@/components/nx/motion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/futures")({
  head: () => ({ meta: [{ title: "BTC Perpetual Futures — BR TRADES" }, { name: "description", content: "Paper-trade perpetual futures up to 100x with liquidation and PnL tracking." }, { property: "og:title", content: "Perpetual Futures — BR TRADES" }, { property: "og:description", content: "100x futures terminal." }] }),
  component: Futures,
});

const levs = [1, 5, 10, 25, 50, 75, 100];
function Futures() {
  const a = useAsset("BTC");
  const [lev, setLev] = useState(10);
  const [mode, setMode] = useState("Cross");
  const entry = 83500, size = 0.5;
  const pnl = (a.price - entry) * size;
  const liq = entry * (1 - 1 / lev + 0.005);
  const stats: [string, number, (n: number) => string, string?][] = [
    ["Position Size", size, (n) => `${n.toFixed(3)} BTC`],
    ["Entry Price", entry, fmtPrice],
    ["Mark Price", a.price, fmtPrice],
    ["Liquidation Price", liq, fmtPrice, "text-warning"],
    ["Unrealized PnL", pnl, (n) => `${n >= 0 ? "+" : ""}${n.toFixed(2)} USDT`, pnl >= 0 ? "text-primary" : "text-destructive"],
    ["ROE", (pnl / ((entry * size) / lev)) * 100, (n) => `${n.toFixed(2)}%`, pnl >= 0 ? "text-primary" : "text-destructive"],
  ];
  return (
    <div className="mx-auto max-w-[1600px] space-y-3 p-3 md:p-4">
      <div className="panel flex flex-wrap gap-x-8 gap-y-2 p-4 text-xs">
        <div className="text-lg font-black">BTC/USDT <span className="text-xs text-cyan">PERP</span></div>
        <div><div className="text-dim">Mark Price</div><AnimatedNumber value={a.price} format={fmtPrice} className="font-bold text-primary" /></div>
        <div><div className="text-dim">Index Price</div><span className="num">{fmtPrice(a.price * 0.9999)}</span></div>
        <div><div className="text-dim">Funding Rate</div><span className="num text-cyan">0.0100%</span></div>
        <div><div className="text-dim">24h Change</div><span className={cn("num", a.change24h >= 0 ? "text-primary" : "text-destructive")}>{a.change24h.toFixed(2)}%</span></div>
      </div>
      <div className="grid gap-3 lg:grid-cols-[1fr_340px]">
        <div className="panel p-3"><CandleChart price={a.price} tf="1h" /></div>
        <div className="panel space-y-4 p-4">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface p-1">{["Cross", "Isolated"].map((m) => <button key={m} onClick={() => setMode(m)} className={cn("rounded-md py-1.5 text-sm font-semibold", mode === m ? "bg-elevated text-foreground" : "text-dim")}>{m}</button>)}</div>
          <div><div className="mb-2 text-xs text-dim">Leverage</div><div className="grid grid-cols-7 gap-1">{levs.map((l) => <button key={l} onClick={() => setLev(l)} className={cn("rounded py-1.5 text-xs font-bold num", lev === l ? "bg-cyan text-primary-foreground" : "bg-surface text-muted-foreground")}>{l}x</button>)}</div></div>
          <div className="grid grid-cols-2 gap-2"><ActionButton label="Paper Long" variant="green" /><ActionButton label="Paper Short" variant="red" /></div>
          <div className="space-y-2 border-t border-border pt-3 text-xs">{stats.map(([l, v, f, c]) => <div key={l} className="flex justify-between"><span className="text-dim">{l}</span><AnimatedNumber value={v} format={f} className={c ?? ""} /></div>)}</div>
          <OrderBook mid={a.price} rows={4} />
        </div>
      </div>
    </div>
  );
}
