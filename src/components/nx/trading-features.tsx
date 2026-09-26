import { useEffect, useState } from "react";
import { BellRing, Calculator, RotateCcw, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { fmtPrice, useMarkets } from "@/lib/market";
import { addLocalNotification, addPriceAlert, markAllNotificationsRead, markNotificationRead, removePriceAlert, updatePriceAlert, useLocalFeatures } from "@/lib/local-features";

export function PriceAlertMonitor() {
  const markets = useMarkets();
  const { alerts } = useLocalFeatures();
  useEffect(() => {
    alerts.filter((alert) => !alert.triggeredAt).forEach((alert) => {
      const current = markets.find((asset) => asset.symbol === alert.symbol)?.price;
      if (current === undefined) return;
      const reached = alert.direction === "above" ? current >= alert.target : current <= alert.target;
      if (!reached) return;
      const triggeredAt = new Date().toISOString();
      updatePriceAlert(alert.id, { triggeredAt });
      const description = `${alert.symbol}/USDT reached ${fmtPrice(current)} (target ${fmtPrice(alert.target)}).`;
      addLocalNotification({ type: "price", title: "Price alert triggered", description });
      toast.success(`${alert.symbol} price alert`, { description });
    });
  }, [alerts, markets]);
  return null;
}

export function PriceAlertsPanel() {
  const markets = useMarkets();
  const { alerts } = useLocalFeatures();
  const [symbol, setSymbol] = useState("BTC");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const selected = markets.find((asset) => asset.symbol === symbol) ?? markets[0];
  const [target, setTarget] = useState("");
  const active = alerts.filter((alert) => !alert.triggeredAt);
  const triggered = alerts.filter((alert) => alert.triggeredAt);
  const add = () => {
    const numericTarget = Number(target);
    if (!Number.isFinite(numericTarget) || numericTarget <= 0) {
      toast.error("Enter a valid target price.");
      return;
    }
    addPriceAlert(symbol, direction, numericTarget);
    setTarget("");
    toast.success("Price alert added");
  };
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2"><BellRing size={17} className="text-primary" /><div><h2 className="text-lg font-bold">Price alerts</h2><p className="text-xs text-muted-foreground">Alerts run against simulated market prices in this browser.</p></div></div>
      <div className="grid gap-2 rounded-md border border-border bg-surface/50 p-3 sm:grid-cols-[1fr_120px_1fr_auto]">
        <select aria-label="Alert market" value={symbol} onChange={(event) => setSymbol(event.target.value)} className="min-h-11 rounded-md border border-border bg-background px-3 text-sm">{markets.map((asset) => <option key={asset.symbol} value={asset.symbol}>{asset.symbol}/USDT</option>)}</select>
        <select aria-label="Alert direction" value={direction} onChange={(event) => setDirection(event.target.value as "above" | "below")} className="min-h-11 rounded-md border border-border bg-background px-3 text-sm"><option value="above">Above</option><option value="below">Below</option></select>
        <input aria-label="Target price" type="number" min="0" step="any" value={target} onChange={(event) => setTarget(event.target.value)} placeholder={selected ? fmtPrice(selected.price) : "Target price"} className="min-h-11 min-w-0 rounded-md border border-border bg-background px-3 text-sm" />
        <button onClick={add} className="min-h-11 rounded-md bg-gradient-brand px-4 text-sm font-bold text-primary-foreground">Add alert</button>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {[{ title: "Active Alerts", entries: active }, { title: "Triggered Alerts", entries: triggered }].map(({ title, entries }) => (
          <div key={title}>
            <h3 className="mb-2 text-sm font-bold">{title} <span className="text-xs font-normal text-dim">{entries.length}</span></h3>
            <div className="divide-y divide-border border-y border-border">
              {entries.map((alert) => <div key={alert.id} className="flex items-center gap-3 py-3"><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{alert.symbol}/USDT <span className="text-muted-foreground">{alert.direction} {fmtPrice(alert.target)}</span></span><span className="text-[10px] text-dim">{alert.triggeredAt ? `Triggered ${new Date(alert.triggeredAt).toLocaleString()}` : `Created ${new Date(alert.createdAt).toLocaleString()}`}</span></span><button title={alert.triggeredAt ? "Reactivate alert" : "Remove alert"} onClick={() => alert.triggeredAt ? updatePriceAlert(alert.id, { triggeredAt: null }) : removePriceAlert(alert.id)} className="rounded border border-border px-2.5 py-1.5 text-xs font-semibold hover:border-primary/40">{alert.triggeredAt ? "Reactivate" : <Trash2 size={14} />}</button>{alert.triggeredAt && <button aria-label="Remove alert" onClick={() => removePriceAlert(alert.id)} className="p-2 text-dim hover:text-destructive"><Trash2 size={14} /></button>}</div>)}
              {entries.length === 0 && <p className="py-4 text-xs text-muted-foreground">{title === "Active Alerts" ? "No price alerts yet. Add an alert to follow a simulated market target." : "No triggered alerts yet."}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TradingCalculator() {
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [leverage, setLeverage] = useState("1");
  const [fee, setFee] = useState("0.1");
  const [side, setSide] = useState<"Long" | "Short">("Long");
  const entryPrice = Math.max(0, Number(entry) || 0);
  const exitPrice = Math.max(0, Number(exit) || 0);
  const amount = Math.max(0, Number(quantity) || 0);
  const multiplier = Math.min(125, Math.max(1, Number(leverage) || 1));
  const feeRate = Math.min(10, Math.max(0, Number(fee) || 0)) / 100;
  const positionSize = entryPrice * amount;
  const grossPnl = (exitPrice - entryPrice) * amount * (side === "Long" ? 1 : -1);
  const estimatedFees = (entryPrice + exitPrice) * amount * feeRate;
  const netPnl = grossPnl - estimatedFees;
  const roi = positionSize > 0 ? (netPnl / (positionSize / multiplier)) * 100 : 0;
  const reset = () => { setEntry(""); setExit(""); setQuantity(""); setLeverage("1"); setFee("0.1"); setSide("Long"); };
  const inputClass = "min-h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary/50";
  const metrics = [["Position Size", positionSize], ["Gross P&L", grossPnl], ["Estimated Fees", estimatedFees], ["Net P&L", netPnl]] as const;
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2"><Calculator size={17} className="text-primary" /><div><h2 className="text-lg font-bold">Trading calculator</h2><p className="text-xs text-muted-foreground">Illustrative estimates only. Fees apply to entry and exit notional.</p></div></div>
      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          {[{ label: "Entry Price", value: entry, set: setEntry }, { label: "Exit Price", value: exit, set: setExit }, { label: "Quantity", value: quantity, set: setQuantity }, { label: "Leverage", value: leverage, set: setLeverage }, { label: "Trading Fee (%)", value: fee, set: setFee }].map((field) => <label key={field.label} className="space-y-1.5 text-xs font-semibold text-muted-foreground">{field.label}<input className={inputClass} type="number" min="0" step="any" value={field.value} onChange={(event) => field.set(event.target.value)} /></label>)}
          <label className="space-y-1.5 text-xs font-semibold text-muted-foreground">Position Side<div className="grid grid-cols-2 gap-1 rounded-md border border-border bg-surface p-1">{(["Long", "Short"] as const).map((value) => <button key={value} onClick={() => setSide(value)} className={`min-h-9 rounded text-sm font-bold ${side === value ? value === "Long" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive" : "text-dim"}`}>{value}</button>)}</div></label>
        </div>
        <div className="border-y border-border px-4 py-2">
          {metrics.map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b border-border py-3 text-sm last:border-0"><span className="text-muted-foreground">{label}</span><span className={`num font-semibold ${label === "Estimated Fees" ? "text-muted-foreground" : value >= 0 ? "text-primary" : "text-destructive"}`}>{label === "Estimated Fees" ? "−" : value > 0 ? "+" : ""}{value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })}</span></div>)}
          <div className="flex items-center justify-between py-3 text-sm"><span className="text-muted-foreground">ROI</span><span className={`num font-bold ${Number.isFinite(roi) && roi >= 0 ? "text-primary" : "text-destructive"}`}>{Number.isFinite(roi) ? roi.toFixed(2) : "0.00"}%</span></div>
          <button onClick={reset} className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-xs font-bold transition hover:border-primary/35"><RotateCcw size={14} /> Reset</button>
        </div>
      </div>
    </section>
  );
}

export function FavoriteLabel({ symbol }: { symbol: string }) {
  const { favorites } = useLocalFeatures();
  return <span className="inline-flex items-center gap-1 text-[10px] text-warning"><Star size={12} fill={favorites.includes(symbol) ? "currentColor" : "none"} /></span>;
}

export function NotificationActions() {
  const { notifications } = useLocalFeatures();
  return <button type="button" onClick={markAllNotificationsRead} className="text-xs font-semibold text-primary hover:underline" disabled={!notifications.some((item) => !item.read)}>Mark all read</button>;
}
