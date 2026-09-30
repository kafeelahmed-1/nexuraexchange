import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/nx/motion";
import {
  Activity,
  ArrowDownLeft,
  ArrowDownToLine,
  ArrowUpRight,
  ChartNoAxesCombined,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Download,
  FileSpreadsheet,
  Headset,
  LayoutDashboard,
  ListOrdered,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  UserRound,
  Wallet,
} from "lucide-react";
import { SupportEntryButton } from "@/components/nx/support";
import { getDemoAccountState, useDemoUser, type DemoAccountState } from "@/lib/demo-auth";
import { useMarkets } from "@/lib/market";
import { toast } from "sonner";
import { toggleFavorite, useLocalFeatures } from "@/lib/local-features";
import { PriceAlertsPanel } from "@/components/nx/trading-features";

type ReportRange = "today" | "7d" | "30d" | "all";
type HistoryRecord = Record<string, unknown>;

function exportCsv(name: string, rows: unknown[]) {
  const records = rows.filter((row): row is HistoryRecord => !!row && typeof row === "object" && !Array.isArray(row));
  if (records.length === 0) {
    toast.info("No records to export yet.");
    return;
  }
  const headers = [...new Set(records.flatMap((row) => Object.keys(row)))];
  const csv = [headers, ...records.map((row) => headers.map((header) => row[header]))]
    .map((line) => line.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `nexora-${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
  toast.success("CSV export prepared");
}

function recordNumber(record: HistoryRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return null;
}

function recordDate(record: HistoryRecord) {
  const value = record.createdAt ?? record.timestamp ?? record.time ?? record.date;
  if (typeof value === "number") return new Date(value < 10_000_000_000 ? value * 1000 : value);
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (Number.isFinite(parsed.getTime())) return parsed;
  }
  return null;
}

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account Overview — BR TRADES" },
      { name: "description", content: "Balances, PnL and orders." },
      { property: "og:title", content: "Account Overview — BR TRADES" },
      { property: "og:description", content: "Balances, PnL and orders." },
    ],
  }),
  component: AccountOverview,
});

function AccountOverview() {
  const markets = useMarkets();
  const { user, loaded } = useDemoUser();
  const { favorites } = useLocalFeatures();
  const navigate = useNavigate();
  const [accountState, setAccountState] = useState<DemoAccountState | null>(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [watchQuery, setWatchQuery] = useState("");
  const [reportRange, setReportRange] = useState<ReportRange>("all");

  useEffect(() => {
    if (loaded && !user) {
      void navigate({ to: "/login?next=%2Faccount" as never, replace: true });
    }
  }, [loaded, user, navigate]);

  useEffect(() => {
    if (!user) return;
    try {
      setAccountState(getDemoAccountState(user.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load your demo portfolio.");
      setAccountState({
        userId: user.id,
        portfolio: { totalBalance: 0, availableBalance: 0, unrealizedPnL: 0, realizedPnL: 0 },
        assets: { USDT: 0, BTC: 0, ETH: 0, SOL: 0, BNB: 0, XRP: 0, DOGE: 0 },
        orders: { openOrders: [], orderHistory: [], tradeHistory: [] },
        fundingHistory: [],
        watchlist: ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
      });
    }
  }, [user]);

  if (!loaded || !user || !accountState) {
    return <main className="min-h-[45vh]" aria-busy="true" />;
  }

  const assetSymbols = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE"] as const;
  const holdings = assetSymbols.map((symbol) => {
    const asset = markets.find((market) => market.symbol === symbol);
    const price = asset?.price ?? 0;
    const amount = accountState.assets[symbol];
    return { symbol, amount, name: asset?.name ?? symbol, price, change: asset?.change24h ?? 0, value: amount * price };
  });
  const cashBalance = accountState.assets.USDT;
  const totalBalance = accountState.portfolio.totalBalance;
  const formatUsd = (value: number) =>
    value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const metrics = [
    { label: "Available balance", value: formatUsd(accountState.portfolio.availableBalance), detail: `${cashBalance.toLocaleString()} USDT available` },
    { label: "Unrealized PnL", value: formatUsd(accountState.portfolio.unrealizedPnL), detail: "Open simulated positions", positive: accountState.portfolio.unrealizedPnL >= 0 },
    { label: "Realized PnL", value: formatUsd(accountState.portfolio.realizedPnL), detail: "Closed simulated trades", positive: accountState.portfolio.realizedPnL >= 0 },
    { label: "Open orders", value: String(accountState.orders.openOrders.length), detail: "Currently active" },
  ];
  const sidebarItems = [
    { label: "Overview", target: "overview", icon: LayoutDashboard },
    { label: "Portfolio", target: "assets", icon: Wallet },
    { label: "Deposit", target: "deposit", icon: ArrowDownToLine },
    { label: "Open orders", target: "orders", icon: ListOrdered, count: accountState.orders.openOrders.length },
    { label: "Activity", target: "activity", icon: Activity },
    { label: "Watchlist", target: "watchlist", icon: Star, count: favorites.length },
    { label: "Profile", target: "profile", icon: UserRound },
  ];
  const watchlist = favorites.map((symbol) => {
    const pair = `${symbol}/USDT`;
    const asset = markets.find((market) => market.symbol === symbol);
    return { pair, symbol, price: asset?.price ?? 0, change: asset?.change24h ?? 0 };
  }).filter(({ pair, symbol }) => `${pair} ${symbol}`.toLowerCase().includes(watchQuery.toLowerCase()));
  const allocation = [...holdings.map(({ symbol, value }) => ({ symbol, value })), { symbol: "USDT", value: cashBalance }].filter((item) => item.value > 0);
  const allocationTotal = allocation.reduce((total, item) => total + item.value, 0);
  const tradeRecords = accountState.orders.tradeHistory.filter((row): row is HistoryRecord => !!row && typeof row === "object" && !Array.isArray(row));
  const rangeStart = reportRange === "today" ? new Date(new Date().setHours(0, 0, 0, 0)) : reportRange === "7d" ? new Date(Date.now() - 7 * 86400000) : reportRange === "30d" ? new Date(Date.now() - 30 * 86400000) : null;
  const reportTrades = tradeRecords.filter((record) => {
    if (!rangeStart) return true;
    const date = recordDate(record);
    return date !== null && date >= rangeStart;
  });
  const reportPnls = reportTrades.map((record) => recordNumber(record, ["realizedPnL", "realizedPnl", "pnl", "profit"])).filter((value): value is number => value !== null);
  const reportVolume = reportTrades.reduce((total, record) => total + (recordNumber(record, ["volume", "quoteQty", "notional", "value", "total"]) ?? 0), 0);
  const reportFees = reportTrades.reduce((total, record) => total + (recordNumber(record, ["fee", "fees", "commission"]) ?? 0), 0);
  const winningTrades = reportPnls.filter((value) => value > 0).length;
  const reportBest = reportPnls.length ? Math.max(...reportPnls) : null;
  const reportWorst = reportPnls.length ? Math.min(...reportPnls) : null;

  return (
    <>
      <PageHeader title="Account Overview" desc="Your demo portfolio, orders and market activity." />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-9">
          <aside className="min-w-0 lg:border-r lg:border-border lg:pr-6">
            <div className="mb-5 hidden items-center gap-3 lg:flex">
              <span className="grid size-10 shrink-0 place-items-center rounded-md border border-primary/20 bg-primary/10 text-sm font-black text-primary">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{user.name}</div>
                <div className="truncate text-xs text-dim">{user.email}</div>
              </div>
            </div>
            <div className="mb-2 hidden px-3 text-[10px] font-bold tracking-[0.16em] text-dim lg:block">ACCOUNT MENU</div>
            <nav aria-label="Dashboard sections" className="flex gap-1 overflow-x-auto pb-2 lg:grid lg:overflow-visible lg:pb-0">
              {sidebarItems.map(({ label, target, icon: Icon, count }) => (
                <a
                  key={target}
                  href={`#${target}`}
                  onClick={() => setActiveSection(target)}
                  aria-current={activeSection === target ? "location" : undefined}
                  className={`flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-semibold transition hover:bg-elevated hover:text-foreground ${activeSection === target ? "bg-primary/[0.08] text-primary" : "text-muted-foreground"}`}
                >
                  <Icon size={16} className={`shrink-0 ${activeSection === target ? "text-primary" : "text-dim"}`} />
                  <span>{label}</span>
                  {count !== undefined && <span className="ml-auto text-xs text-dim">{count}</span>}
                </a>
              ))}
            </nav>
            <div className="mt-6 hidden border-t border-border pt-5 lg:block">
              <div className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                <ShieldCheck size={15} className="mt-0.5 shrink-0 text-warning" />
                <span>Demo account only. No real funds, deposits, or withdrawals.</span>
              </div>
              <SupportEntryButton className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-primary">
                <CircleHelp size={15} /> Get support
              </SupportEntryButton>
            </div>
          </aside>

          <div className="min-w-0 space-y-8">
            <section id="overview" className="scroll-mt-24">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold tracking-[0.16em] text-primary">DEMO ACCOUNT</div>
                  <h2 className="mt-1 text-2xl font-black">Good to see you, {user.name.split(" ")[0]}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Portfolio and simulated exchange activity at a glance.</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded border border-warning/25 bg-warning/[0.06] px-2.5 py-1.5 text-[10px] font-bold tracking-[0.12em] text-warning">
                  <span className="size-1.5 rounded-full bg-warning" /> SIMULATED
                </span>
              </div>

              <div className="border-y border-border bg-surface/60 px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex flex-wrap items-end justify-between gap-5">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground">Estimated portfolio value</div>
                    <div className="num mt-2 text-4xl font-black tracking-tight sm:text-5xl">{formatUsd(totalBalance)}</div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-dim">
                      <span className="inline-flex items-center gap-1 text-primary"><ArrowUpRight size={13} /> {formatUsd(accountState.portfolio.realizedPnL + accountState.portfolio.unrealizedPnL)}</span>
                      <span>total simulated PnL</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to="/markets" className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-xs font-bold transition hover:border-primary/40 hover:text-primary">
                      Explore markets <ChevronRight size={14} />
                    </Link>
                    <Link to="/trade/$pair" params={{ pair: "BTC-USDT" }} className="inline-flex items-center gap-2 rounded-md bg-gradient-brand px-3 py-2.5 text-xs font-bold text-primary-foreground">
                      Paper trade <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>

              <section aria-label="Portfolio metrics" className="grid grid-cols-2 divide-x divide-y divide-border border-b border-border sm:grid-cols-4 sm:divide-y-0">
                {metrics.map(({ label, value, detail, positive }) => (
                  <div key={label} className="min-w-0 px-4 py-4 first:pl-0 sm:px-4">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className={`num mt-2 truncate text-lg font-bold ${positive ? "text-primary" : "text-foreground"}`}>{value}</div>
                    <div className="mt-1 truncate text-[10px] text-dim">{detail}</div>
                  </div>
                ))}
              </section>
            </section>

            <section id="deposit" className="scroll-mt-24 border-y border-border py-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ArrowDownToLine size={17} className="text-primary" />
                    <h2 className="text-lg font-bold">Add test balance</h2>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Credit a local USDT balance to try the paper-trading interface.</p>
                </div>
                <span className="rounded border border-warning/25 bg-warning/[0.06] px-2 py-1 text-[9px] font-bold tracking-[0.1em] text-warning">LOCAL TEST ONLY</span>
              </div>
              <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
                <div className="border border-border bg-surface/50 p-4">
                  <div className="text-xs font-semibold text-muted-foreground">Available test balance</div>
                  <div className="num mt-2 text-2xl font-black">{formatUsd(accountState.assets.USDT)}</div>
                  <div className="mt-1 text-[10px] text-dim">USDT balance stored in this browser profile</div>
                </div>
                <div className="flex flex-col items-start justify-center gap-2">
                  <p className="text-xs text-muted-foreground">Add a local test balance through the checkout preview.</p>
                  <Link to="/checkout" className="inline-flex h-11 items-center gap-2 rounded-md bg-gradient-brand px-4 text-xs font-bold text-primary-foreground transition hover:brightness-110">
                    <ArrowDownToLine size={15} /> Continue to checkout <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
              <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-warning">
                <ShieldCheck size={14} className="mt-0.5 shrink-0" />
                This is a local paper-trading credit, not a blockchain deposit. No funds are sent, received, or withdrawable.
              </p>
            </section>

            <section id="assets" className="scroll-mt-24">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Portfolio assets</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Balances belong to this local demo profile.</p>
                </div>
                <a href="/markets" className="text-xs font-semibold text-primary hover:underline">All markets</a>
              </div>
              <div className="overflow-x-auto border-y border-border">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="bg-surface text-[10px] font-bold tracking-[0.1em] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">ASSET</th>
                      <th className="px-4 py-3 text-right font-semibold">MARKET PRICE</th>
                      <th className="px-4 py-3 text-right font-semibold">24H CHANGE</th>
                      <th className="px-4 py-3 text-right font-semibold">BALANCE</th>
                      <th className="px-4 py-3 text-right font-semibold">VALUE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {holdings.map((holding) => (
                      <tr key={holding.symbol} className="transition hover:bg-surface/60">
                        <td className="px-4 py-3.5">
                          <div className="font-bold">{holding.symbol}<span className="ml-2 text-xs font-normal text-dim">{holding.name}</span></div>
                        </td>
                        <td className="num px-4 py-3.5 text-right">{formatUsd(holding.price)}</td>
                        <td className={`num px-4 py-3.5 text-right ${holding.change >= 0 ? "text-primary" : "text-destructive"}`}>{holding.change >= 0 ? "+" : ""}{holding.change.toFixed(2)}%</td>
                        <td className="num px-4 py-3.5 text-right">{holding.amount} {holding.symbol}</td>
                        <td className="num px-4 py-3.5 text-right font-semibold">{formatUsd(holding.value)}</td>
                      </tr>
                    ))}
                    <tr className="transition hover:bg-surface/60">
                      <td className="px-4 py-3.5 font-bold">USDT<span className="ml-2 text-xs font-normal text-dim">Tether</span></td>
                      <td className="num px-4 py-3.5 text-right">$1.00</td>
                      <td className="num px-4 py-3.5 text-right text-dim">0.00%</td>
                      <td className="num px-4 py-3.5 text-right">{cashBalance.toLocaleString()} USDT</td>
                      <td className="num px-4 py-3.5 text-right font-semibold">{formatUsd(cashBalance)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-4 border-y border-border py-5">
              <div><h2 className="text-lg font-bold">Portfolio allocation</h2><p className="mt-1 text-xs text-muted-foreground">Calculated from this demo profile's current simulated balances.</p></div>
              {allocation.length === 0 ? <p className="py-5 text-sm text-muted-foreground">No assets to allocate yet. Add test balance or complete a paper trade to see your portfolio mix.</p> : <div className="space-y-3">{allocation.map(({ symbol, value }) => <Link key={symbol} to="/trade/$pair" params={{ pair: `${symbol === "USDT" ? "BTC" : symbol}-USDT` }} className="grid grid-cols-[72px_minmax(0,1fr)_64px] items-center gap-3 text-sm"><span className="font-semibold">{symbol}</span><span className="h-2 overflow-hidden rounded-full bg-elevated"><span className="block h-full rounded-full bg-gradient-brand" style={{ width: `${Math.max(0, Math.min(100, value / allocationTotal * 100))}%` }} /></span><span className="num text-right text-muted-foreground">{(value / allocationTotal * 100).toFixed(1)}%</span></Link>)}</div>}
            </section>

            <section className="space-y-4 border-y border-border py-5">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-bold">Trading report</h2><p className="mt-1 text-xs text-muted-foreground">Summary from recorded local trades only.</p></div><div className="flex flex-wrap gap-1" aria-label="Report date range">{([{ id: "today", label: "Today" }, { id: "7d", label: "7 Days" }, { id: "30d", label: "30 Days" }, { id: "all", label: "All Time" }] as const).map(({ id, label }) => <button key={id} onClick={() => setReportRange(id)} aria-pressed={reportRange === id} className={`rounded border px-2.5 py-1.5 text-[11px] font-semibold ${reportRange === id ? "border-primary/30 bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{label}</button>)}</div></div>
              {reportTrades.length === 0 ? <div className="border-y border-border py-5"><p className="text-sm font-semibold">No trades in this date range.</p><p className="mt-1 text-xs text-muted-foreground">Your report will populate from completed paper trades.</p></div> : <div className="grid grid-cols-2 gap-4 border-y border-border py-4 sm:grid-cols-4"><div><span className="block text-[10px] text-dim">TOTAL VOLUME</span><span className="num text-sm font-bold">{reportVolume ? formatUsd(reportVolume) : "Not recorded"}</span></div><div><span className="block text-[10px] text-dim">TOTAL TRADES</span><span className="num text-sm font-bold">{reportTrades.length}</span></div><div><span className="block text-[10px] text-dim">REALIZED P&amp;L</span><span className="num text-sm font-bold">{reportPnls.length ? formatUsd(reportPnls.reduce((sum, value) => sum + value, 0)) : "Not recorded"}</span></div><div><span className="block text-[10px] text-dim">FEES</span><span className="num text-sm font-bold">{reportFees ? formatUsd(reportFees) : "Not recorded"}</span></div><div><span className="block text-[10px] text-dim">WIN RATE</span><span className="num text-sm font-bold">{reportPnls.length ? `${(winningTrades / reportPnls.length * 100).toFixed(1)}%` : "Not recorded"}</span></div><div><span className="block text-[10px] text-dim">BEST TRADE</span><span className="num text-sm font-bold">{reportBest === null ? "Not recorded" : formatUsd(reportBest)}</span></div><div><span className="block text-[10px] text-dim">WORST TRADE</span><span className="num text-sm font-bold">{reportWorst === null ? "Not recorded" : formatUsd(reportWorst)}</span></div><div><span className="block text-[10px] text-dim">RANGE</span><span className="text-sm font-bold">{reportRange === "all" ? "All Time" : reportRange === "today" ? "Today" : reportRange === "7d" ? "7 Days" : "30 Days"}</span></div></div>}
              <div className="flex flex-wrap gap-2"><button onClick={() => exportCsv("trade-history", accountState.orders.tradeHistory)} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-xs font-bold transition hover:border-primary/35"><Download size={14} />Trade history CSV</button><button onClick={() => exportCsv("order-history", accountState.orders.orderHistory)} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-xs font-bold transition hover:border-primary/35"><FileSpreadsheet size={14} />Order history CSV</button><button onClick={() => exportCsv("transactions", accountState.fundingHistory)} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-xs font-bold transition hover:border-primary/35"><Download size={14} />Transactions CSV</button></div>
            </section>

            <section className="space-y-4 border-y border-border py-5">
              <div><h2 className="text-lg font-bold">Trading statistics</h2><p className="mt-1 text-xs text-muted-foreground">Calculated from recorded local paper trades.</p></div>
              {accountState.orders.tradeHistory.length === 0 ? <div className="border-y border-border py-5"><p className="text-sm font-semibold">No trading statistics yet.</p><p className="mt-1 text-xs text-muted-foreground">Complete your first paper trade to start building your statistics.</p></div> : <div className="grid grid-cols-2 gap-4 border-y border-border py-4 sm:grid-cols-4"><div><span className="block text-xs text-dim">Total Trades</span><span className="num text-lg font-bold">{accountState.orders.tradeHistory.length}</span></div><div><span className="block text-xs text-dim">Realized P&amp;L</span><span className="num text-lg font-bold">{formatUsd(accountState.portfolio.realizedPnL)}</span></div><div><span className="block text-xs text-dim">Total P&amp;L</span><span className="num text-lg font-bold">{formatUsd(accountState.portfolio.realizedPnL + accountState.portfolio.unrealizedPnL)}</span></div><div><span className="block text-xs text-dim">Win Rate</span><span className="num text-lg font-bold">Not available</span></div></div>}
            </section>

            <section className="panel p-4 sm:p-5"><PriceAlertsPanel /></section>

            <div className="grid gap-8 xl:grid-cols-2">
              <section id="watchlist" className="min-w-0 scroll-mt-24">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">Watchlist</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Your saved market pairs · {favorites.length}</p>
                  </div>
                  <Star size={16} className="text-warning" />
                </div>
                <label className="mb-2 flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2"><Search size={14} className="text-dim" /><input value={watchQuery} onChange={(event) => setWatchQuery(event.target.value)} placeholder="Search favorites" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>
                <div className="divide-y divide-border border-y border-border">
                  {watchlist.map(({ pair, symbol, price, change }) => (
                    <div key={pair} className="flex items-center gap-3 py-3 transition hover:bg-surface/50">
                    <Link to="/trade/$pair" params={{ pair: `${symbol}-USDT` }} className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-surface text-[10px] font-black">{symbol.slice(0, 1)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold">{pair}</span>
                        <span className="block text-[10px] text-dim">Simulated spot market</span>
                      </span>
                      <span className="text-right">
                        <span className="num block text-sm font-semibold">{formatUsd(price)}</span>
                        <span className={`num block text-[10px] ${change >= 0 ? "text-primary" : "text-destructive"}`}>{change >= 0 ? "+" : ""}{change.toFixed(2)}%</span>
                      </span>
                    </Link><button type="button" onClick={() => toggleFavorite(symbol)} aria-label={`Remove ${symbol} from favorites`} className="rounded border border-border p-2 text-dim transition hover:border-destructive/40 hover:text-destructive"><Trash2 size={14} /></button></div>
                  ))}
                  {watchlist.length === 0 && <p className="py-5 text-sm text-muted-foreground">{favorites.length === 0 ? "Your watchlist is empty. Add markets with the star control." : "No favorites match your search."}</p>}
                </div>
              </section>

              <section id="activity" className="min-w-0 scroll-mt-24">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">Recent activity</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Trade history for this demo profile</p>
                  </div>
                  <Activity size={16} className="text-dim" />
                </div>
                <div className="divide-y divide-border border-y border-border">
                  {accountState.orders.tradeHistory.length === 0 ? (
                    <div className="flex items-center gap-3 py-5 text-sm text-muted-foreground">
                      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-surface text-dim"><ArrowDownLeft size={16} /></span>
                      No simulated trades recorded yet.
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 py-5 text-sm text-muted-foreground">
                      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-surface text-primary"><ArrowUpRight size={16} /></span>
                      {accountState.orders.tradeHistory.length} simulated trades recorded.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <section id="orders" className="scroll-mt-24">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Open orders</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Active simulated limit orders</p>
                </div>
                <span className="text-xs text-dim">{accountState.orders.openOrders.length} active</span>
              </div>
              <div className="overflow-x-auto border-y border-border">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-surface text-[10px] font-bold tracking-[0.1em] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">PAIR</th>
                      <th className="px-4 py-3 font-semibold">SIDE / TYPE</th>
                      <th className="px-4 py-3 text-right font-semibold">LIMIT PRICE</th>
                      <th className="px-4 py-3 text-right font-semibold">FILLED / AMOUNT</th>
                      <th className="px-4 py-3 text-right font-semibold">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {accountState.orders.openOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                          <ClipboardList size={18} className="mx-auto mb-2 text-dim" />
                          No open simulated orders.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="profile" className="scroll-mt-24 border-y border-border py-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-md border border-border bg-surface"><UserRound size={18} className="text-muted-foreground" /></span>
                  <div>
                    <h2 className="text-sm font-bold">Demo profile</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{user.name} · {user.email}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning"><ShieldCheck size={14} /> Local demo account</span>
              </div>
            </section>

            <SupportEntryButton className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-primary lg:hidden">
              <Headset size={15} /> Customer Support
            </SupportEntryButton>
          </div>
        </div>
      </main>
    </>
  );
}
