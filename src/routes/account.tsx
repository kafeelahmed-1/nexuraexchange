import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Eye,
  EyeOff,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  getDemoAccountState,
  isAdminUser,
  useDemoUser,
  type DemoAccountState,
} from "@/lib/supabase-auth";
import { useMarkets } from "@/lib/market";

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
  const { user, loaded } = useDemoUser();
  const navigate = useNavigate();
  const markets = useMarkets();
  const [accountState, setAccountState] = useState<DemoAccountState | null>(null);
  const [loadError, setLoadError] = useState("");
  const [showBalances, setShowBalances] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [performancePeriod, setPerformancePeriod] = useState<"7d" | "30d" | "all">("30d");
  const [activeSection, setActiveSection] = useState<"performance" | "assets" | "activity" | "orders">("performance");

  useEffect(() => {
    if (!loaded) return;
    if (user && isAdminUser(user)) {
      void navigate({ to: "/admin", replace: true });
    } else if (!user) {
      void navigate({ to: "/login?next=%2Faccount" as never, replace: true });
    }
  }, [loaded, user, navigate]);

  useEffect(() => {
    if (!loaded || !user || isAdminUser(user)) return;
    let active = true;
    const refreshAccount = async () => {
      try {
        const state = await getDemoAccountState(user.id);
        if (!active) return;
        setAccountState(state);
        setLoadError("");
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : "Unable to load your account.");
      }
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refreshAccount();
    };
    void refreshAccount();
    const refreshInterval = window.setInterval(refreshWhenVisible, 15_000);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      active = false;
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [loaded, user, reloadKey]);

  const holdings = useMemo(() => {
    if (!accountState) return [];
    return Object.entries(accountState.assets)
      .map(([symbol, amount]) => {
        const market = markets.find((item) => item.symbol === symbol);
        const price = symbol === "USDT" ? 1 : (market?.price ?? 0);
        return {
          symbol,
          name: symbol === "USDT" ? "Tether" : (market?.name ?? symbol),
          amount,
          price,
          change: market?.change24h ?? 0,
          value: amount * price,
          color: market?.color ?? "#00e887",
        };
      })
      .filter((asset) => asset.amount > 0)
      .sort((a, b) => b.value - a.value);
  }, [accountState, markets]);

  const activity = useMemo(() => {
    if (!accountState) return [];
    const funding = accountState.fundingHistory.map((entry, index) => ({
      id: entry.id || `funding-${index}`,
      title: "Funds added",
      detail: `${entry.asset} · ${entry.method.replaceAll("-", " ")}`,
      amount: entry.amount,
      date: entry.createdAt,
      kind: "funding" as const,
    }));
    const trades = accountState.orders.tradeHistory.flatMap((entry, index) => {
      const record = toRecord(entry);
      if (!record) return [];
      const symbol = textFrom(record, ["pair", "symbol", "market"], "Spot market");
      const side = textFrom(record, ["side", "type"], "Trade");
      return [
        {
          id: textFrom(record, ["id"], `trade-${index}`),
          title: `${side} ${symbol}`,
          detail: "Simulated trade",
          amount: numberFrom(record, ["value", "notional", "total", "quoteQty"]),
          date: textFrom(record, ["createdAt", "timestamp", "time", "date"], ""),
          kind: "trade" as const,
        },
      ];
    });
    return [...funding, ...trades]
      .sort((a, b) => dateValue(b.date) - dateValue(a.date))
      .slice(0, 5);
  }, [accountState]);

  const openOrders = useMemo(() => {
    if (!accountState) return [];
    return accountState.orders.openOrders.flatMap((entry, index) => {
      const record = toRecord(entry);
      if (!record) return [];
      return [
        {
          id: textFrom(record, ["id"], `order-${index}`),
          pair: textFrom(record, ["pair", "symbol", "market"], "—"),
          side: textFrom(record, ["side"], "—"),
          type: textFrom(record, ["type", "orderType"], "Limit"),
          price: numberFrom(record, ["price", "limitPrice"]),
          amount: numberFrom(record, ["amount", "quantity", "qty", "origQty"]),
          status: textFrom(record, ["status"], "Open"),
        },
      ];
    });
  }, [accountState]);

  const tradePerformance = useMemo(() => {
    const now = Date.now();
    const cutoff = performancePeriod === "7d"
      ? now - 7 * 24 * 60 * 60 * 1000
      : performancePeriod === "30d"
        ? now - 30 * 24 * 60 * 60 * 1000
        : 0;
    const trades = (accountState?.orders.tradeHistory ?? [])
      .flatMap((entry) => {
        const record = toRecord(entry);
        if (!record) return [];
        const pnl = numberFrom(record, ["realizedPnL", "realized_pnl"]);
        const date = textFrom(record, ["createdAt", "timestamp", "time", "date"], "");
        const timestamp = dateValue(date);
        if (pnl === null || !timestamp || timestamp < cutoff) return [];
        return [{
          pnl,
          timestamp,
          market: textFrom(record, ["pair", "symbol", "market"], "Other"),
        }];
      })
      .filter((trade) => trade.pnl !== 0)
      .sort((a, b) => a.timestamp - b.timestamp);
    let cumulativePnl = 0;
    const chartData = trades.map((trade) => {
      cumulativePnl += trade.pnl;
      return {
        date: new Date(trade.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        pnl: cumulativePnl,
      };
    });
    const marketTotals = new Map<string, number>();
    trades.forEach((trade) =>
      marketTotals.set(trade.market, (marketTotals.get(trade.market) ?? 0) + trade.pnl),
    );
    const markets = [...marketTotals.entries()]
      .map(([market, pnl]) => ({ market, pnl }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 4);
    const wins = trades.filter((trade) => trade.pnl > 0).length;
    return {
      realizedPnl: trades.reduce((total, trade) => total + trade.pnl, 0),
      winRate: trades.length ? (wins / trades.length) * 100 : 0,
      closedTrades: trades.length,
      chartData: [{ date: "Start", pnl: 0 }, ...chartData],
      markets,
    };
  }, [accountState, performancePeriod]);

  if (!loaded || !user || (!accountState && !loadError)) {
    return (
      <main className="account-dashboard mx-auto min-h-[55vh] max-w-7xl px-4 py-8 md:px-6" aria-busy="true">
        <div className="shimmer h-8 w-48 rounded" />
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="shimmer h-28 rounded-md" />
          ))}
        </div>
        <div className="shimmer mt-6 h-72 rounded-md" />
      </main>
    );
  }

  if (loadError || !accountState) {
    return (
      <main className="account-dashboard mx-auto min-h-[55vh] max-w-7xl px-4 py-8 md:px-6">
        <div role="alert" className="border border-destructive/30 bg-destructive/5 p-5 sm:p-6">
          <h1 className="text-lg font-bold">Account data is unavailable</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {loadError || "Your account data could not be loaded."}
          </p>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="mt-4 rounded-sm border border-border px-3 py-2 text-sm font-semibold hover:bg-elevated"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const formatUsd = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const displayUsd = (value: number) => (showBalances ? formatUsd(value) : "••••••");
  const allocationTotal = holdings.reduce((sum, asset) => sum + asset.value, 0);
  const liveUnrealizedPnL = Object.entries(accountState.positions ?? {}).reduce(
    (total, [symbol, position]) => {
      const markPrice =
        markets.find((market) => market.symbol === symbol)?.price ?? position.averageEntryPrice;
      return total + position.quantity * (markPrice - position.averageEntryPrice);
    },
    0,
  );
  const formatAmount = (value: number) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 8 });

  return (
    <main className="account-dashboard mx-auto min-h-[65vh] max-w-7xl px-4 pb-28 pt-5 md:px-6 md:pb-12 md:pt-8">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
            <span className="size-1.5 rounded-full bg-primary" /> Account workspace
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center gap-1.5 border border-warning/25 bg-warning/[0.06] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-warning">
            <ShieldCheck size={13} /> User account
          </span>
        </div>
      </header>

      {accountState.welcomeBonusGranted && (
        <section
          aria-label="Welcome bonus"
          className="mb-4 flex flex-col gap-1 rounded-xl border border-primary/25 bg-primary/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <div>
            <h2 className="text-sm font-bold text-primary">
              Your $200 welcome bonus has been credited
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              $200 USDT was added to your available balance.
            </p>
          </div>
          <span className="num text-lg font-bold text-primary">+$200.00</span>
        </section>
      )}

      <section
        aria-label="Total assets and profit and loss"
        id="overview"
        className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
      >
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              Total assets
              <button
                type="button"
                onClick={() => setShowBalances((visible) => !visible)}
                aria-label={showBalances ? "Hide balances" : "Show balances"}
                title={showBalances ? "Hide balances" : "Show balances"}
                className="grid size-7 place-items-center text-muted-foreground transition hover:text-foreground"
              >
                {showBalances ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
            </div>
            <div className="num mt-1 truncate text-3xl font-bold sm:text-4xl">
              {displayUsd(allocationTotal)}
            </div>
            <p className="mt-1 text-xs text-dim">Estimated portfolio value</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              to="/checkout"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-brand px-6 text-sm font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ArrowDownToLine size={15} /> Deposit
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px border-t border-border bg-border">
          <div className="min-w-0 bg-card px-4 py-3 sm:px-6">
            <div className="text-[11px] font-medium text-muted-foreground sm:text-xs">Realized P&amp;L</div>
            <div className={`num mt-1 truncate text-sm font-bold sm:text-base ${accountState.portfolio.realizedPnL >= 0 ? "text-primary" : "text-destructive"}`}>
              {displayUsd(accountState.portfolio.realizedPnL)}
            </div>
          </div>
          <div className="min-w-0 bg-card px-4 py-3 sm:px-6">
            <div className="text-[11px] font-medium text-muted-foreground sm:text-xs">Unrealized P&amp;L</div>
            <div className={`num mt-1 truncate text-sm font-bold sm:text-base ${liveUnrealizedPnL >= 0 ? "text-primary" : "text-destructive"}`}>
              {displayUsd(liveUnrealizedPnL)}
            </div>
          </div>
        </div>
      </section>

      <nav
        aria-label="Account shortcuts"
        className="my-5 grid grid-cols-4 gap-1 rounded-xl border border-border bg-card p-2 shadow-[0_12px_28px_rgba(0,0,0,0.14)] sm:gap-2 sm:p-3"
      >
        <Link
          to="/checkout"
          className="group flex min-h-24 min-w-0 flex-col items-center justify-center gap-2 rounded-lg border border-transparent px-1 py-3 text-center transition duration-200 hover:-translate-y-0.5 hover:border-primary/15 hover:bg-primary/[0.035] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <span className="grid size-12 place-items-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 to-cyan/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_rgba(0,232,135,0.06)] transition-all duration-200 group-hover:border-primary/40 group-hover:from-primary/20 group-hover:to-cyan/15 group-hover:shadow-[0_0_24px_rgba(0,232,135,0.12)] sm:size-14">
            <ArrowDownToLine size={20} strokeWidth={2.2} />
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground transition-colors group-hover:text-foreground sm:text-xs">Add funds</span>
        </Link>
        <Link
          to="/trade/$pair"
          params={{ pair: "BTC-USDT" }}
          className="group flex min-h-24 min-w-0 flex-col items-center justify-center gap-2 rounded-lg border border-transparent px-1 py-3 text-center transition duration-200 hover:-translate-y-0.5 hover:border-cyan/15 hover:bg-cyan/[0.035] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <span className="grid size-12 place-items-center rounded-2xl border border-cyan/20 bg-gradient-to-br from-cyan/15 to-primary/10 text-cyan shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_rgba(8,217,245,0.06)] transition-all duration-200 group-hover:border-cyan/40 group-hover:from-cyan/20 group-hover:to-primary/15 group-hover:shadow-[0_0_24px_rgba(8,217,245,0.12)] sm:size-14">
            <ArrowUpRight size={20} strokeWidth={2.2} />
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground transition-colors group-hover:text-foreground sm:text-xs">Trade</span>
        </Link>
        <Link
          to="/markets"
          className="group flex min-h-24 min-w-0 flex-col items-center justify-center gap-2 rounded-lg border border-transparent px-1 py-3 text-center transition duration-200 hover:-translate-y-0.5 hover:border-primary/15 hover:bg-primary/[0.035] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <span className="grid size-12 place-items-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 to-cyan/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_rgba(0,232,135,0.06)] transition-all duration-200 group-hover:border-primary/40 group-hover:from-primary/20 group-hover:to-cyan/15 group-hover:shadow-[0_0_24px_rgba(0,232,135,0.12)] sm:size-14">
            <TrendingUp size={20} strokeWidth={2.2} />
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground transition-colors group-hover:text-foreground sm:text-xs">Markets</span>
        </Link>
        <a
          href="#orders"
          className="group flex min-h-24 min-w-0 flex-col items-center justify-center gap-2 rounded-lg border border-transparent px-1 py-3 text-center transition duration-200 hover:-translate-y-0.5 hover:border-cyan/15 hover:bg-cyan/[0.035] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <span className="grid size-12 place-items-center rounded-2xl border border-cyan/20 bg-gradient-to-br from-cyan/15 to-primary/10 text-cyan shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_rgba(8,217,245,0.06)] transition-all duration-200 group-hover:border-cyan/40 group-hover:from-cyan/20 group-hover:to-primary/15 group-hover:shadow-[0_0_24px_rgba(8,217,245,0.12)] sm:size-14">
            <Clock3 size={20} strokeWidth={2.2} />
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground transition-colors group-hover:text-foreground sm:text-xs">Orders</span>
        </a>
      </nav>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border shadow-sm">
        <SummaryMetric
          label="Available balance"
          value={displayUsd(accountState.portfolio.availableBalance)}
          note="Ready to use"
          icon={Wallet}
        />
        <div className="flex min-h-[108px] items-center justify-between gap-4 bg-card px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <div className="text-xs font-medium text-muted-foreground">Open orders</div>
            <div className="num mt-2 text-xl font-bold">{openOrders.length}</div>
            <div className="mt-1 text-[11px] text-dim">Currently active</div>
          </div>
          <div className="grid size-9 shrink-0 place-items-center border border-border bg-surface text-cyan">
            <Clock3 size={16} />
          </div>
        </div>
      </div>

      {holdings.length > 0 && (
        <section aria-label="Your leading assets" className="mt-7">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold">Your assets</h2>
              <p className="mt-1 text-xs text-muted-foreground">Live value and 24h movement</p>
            </div>
            <a href="#assets" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
              All assets <ArrowRight size={13} />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {holdings.slice(0, 4).map((asset) => (
              <a key={asset.symbol} href="#assets" className="min-w-0 rounded-lg border border-border bg-card p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-4">
                <span className="block truncate text-xs font-semibold text-muted-foreground">{asset.name}</span>
                <span className="mt-2 block truncate text-sm font-bold">{asset.symbol}</span>
                <span className="num mt-3 block truncate text-xs font-semibold">{displayUsd(asset.value)}</span>
                <span className={`mt-1 block text-[11px] font-semibold ${asset.change >= 0 ? "text-primary" : "text-destructive"}`}>
                  {asset.symbol === "USDT" ? "0.00%" : `${asset.change > 0 ? "+" : ""}${asset.change.toFixed(2)}%`}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      <nav aria-label="Dashboard sections" className="sticky top-0 z-20 mt-7 flex gap-5 overflow-x-auto border-b border-border bg-background/95 text-xs font-semibold shadow-[0_1px_0_rgba(29,66,49,0.04)] backdrop-blur md:static">
        {([ ["performance", "Performance"], ["assets", "Assets"], ["activity", "Activity"], ["orders", "Orders"] ] as const).map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={activeSection === id ? "location" : undefined}
            onClick={() => setActiveSection(id)}
            className={`shrink-0 border-b-2 py-3 transition-colors ${activeSection === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {label}
          </a>
        ))}
      </nav>

      <section id="performance" className="mt-4 scroll-mt-16 overflow-hidden rounded-xl border border-border bg-card shadow-sm" aria-label="Trade performance">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-sm font-bold">Trade performance</h2>
            <p className="mt-1 text-xs text-muted-foreground">Realized results from completed trades</p>
          </div>
          <div
            className="inline-flex border border-border bg-surface p-0.5"
            aria-label="Performance period"
          >
            {([ ["7d", "7D"], ["30d", "30D"], ["all", "All"] ] as const).map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={performancePeriod === value}
                  onClick={() => setPerformancePeriod(value)}
                  className={`min-h-8 min-w-10 px-2 text-xs font-semibold transition ${performancePeriod === value ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </div>
        <div className="grid gap-px border-b border-border bg-border sm:grid-cols-3">
          <PerformanceMetric
            label="Realized P&L"
            value={displayUsd(tradePerformance.realizedPnl)}
            positive={tradePerformance.realizedPnl >= 0}
          />
          <PerformanceMetric label="Win rate" value={`${tradePerformance.winRate.toFixed(1)}%`} />
          <PerformanceMetric label="Completed trades" value={String(tradePerformance.closedTrades)} />
        </div>
        {tradePerformance.closedTrades ? (
          <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(180px,0.7fr)]">
            <div className="min-w-0">
              <h3 className="mb-3 text-xs font-semibold text-muted-foreground">Cumulative realized P&L</h3>
              <div
                className="h-56 w-full"
                role="img"
                aria-label="Chart of cumulative realized profit and loss"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={tradePerformance.chartData}
                    margin={{ top: 6, right: 8, bottom: 0, left: 0 }}
                  >
                    <defs>
                      <linearGradient id="trade-performance-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                      minTickGap={24}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={58}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                      tickFormatter={(value: number) =>
                        showBalances
                          ? `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                          : "••••"
                      }
                    />
                    <Tooltip
                      formatter={(value) => [
                        showBalances ? formatUsd(Number(value)) : "••••••",
                        "Realized P&L",
                      ]}
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 4,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pnl"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      fill="url(#trade-performance-fill)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold text-muted-foreground">By market</h3>
              <div className="divide-y divide-border border-y border-border">
                {tradePerformance.markets.map(({ market, pnl }) => (
                  <div
                    key={market}
                    className="flex items-center justify-between gap-3 py-3 text-xs"
                  >
                    <span className="min-w-0 truncate font-semibold">{market}</span>
                    <span
                      className={`num shrink-0 font-semibold ${pnl >= 0 ? "text-primary" : "text-destructive"}`}
                    >
                      {displayUsd(pnl)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            Completed trade results will appear here when available for this period.
          </p>
        )}
      </section>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
        <section id="assets" className="min-w-0 scroll-mt-16 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-sm font-bold">Your assets</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Balances and live market valuations
              </p>
            </div>
            <Link
              to="/markets"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              All markets <ArrowRight size={13} />
            </Link>
          </div>
          <div className="hidden grid-cols-[minmax(0,1fr)_minmax(90px,0.7fr)_minmax(90px,0.7fr)_minmax(100px,0.8fr)] gap-3 border-b border-border bg-surface/70 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-dim sm:grid sm:px-5">
            <span>Asset</span>
            <span className="text-right">Balance</span>
            <span className="text-right">Price / 24h</span>
            <span className="text-right">Value</span>
          </div>
          {holdings.length ? (
            <div className="divide-y divide-border">
              {holdings.map((asset) => (
                <div
                  key={asset.symbol}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-4 py-3.5 transition hover:bg-surface/60 sm:grid-cols-[minmax(0,1fr)_minmax(90px,0.7fr)_minmax(90px,0.7fr)_minmax(100px,0.8fr)] sm:gap-3 sm:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-surface text-[10px] font-black"
                      style={{ color: asset.color }}
                    >
                      {asset.symbol.slice(0, 1)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{asset.symbol}</span>
                      <span className="block truncate text-[11px] text-dim">{asset.name}</span>
                    </span>
                  </div>
                  <div className="num col-start-1 row-start-2 text-xs text-muted-foreground sm:col-auto sm:row-auto sm:text-right">
                    {formatAmount(asset.amount)} {asset.symbol}
                  </div>
                  <div className="col-start-2 row-start-2 text-right sm:col-auto sm:row-auto">
                    <div className="num text-[11px] text-muted-foreground">
                      {formatUsd(asset.price)}
                    </div>
                    <div
                      className={`num mt-0.5 text-[10px] ${asset.change >= 0 ? "text-primary" : "text-destructive"}`}
                    >
                      {asset.symbol === "USDT"
                        ? "0.00%"
                        : `${asset.change > 0 ? "+" : ""}${asset.change.toFixed(2)}%`}
                    </div>
                  </div>
                  <div className="num col-start-2 row-start-1 text-right text-sm font-semibold sm:col-auto sm:row-auto">
                    {displayUsd(asset.value)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <Wallet size={20} className="mx-auto text-dim" />
              <p className="mt-3 text-sm font-semibold">No assets yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add funds or place a simulated trade to see balances here.
              </p>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs sm:px-5">
            <span className="text-muted-foreground">Assets shown</span>
            <span className="num font-semibold">{holdings.length}</span>
          </div>
        </section>

        <div className="grid gap-6">
          <section id="allocation" className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5">
              <div>
                <h2 className="text-sm font-bold">Asset allocation</h2>
                <p className="mt-1 text-xs text-muted-foreground">By current market value</p>
              </div>
              <Wallet size={16} className="text-cyan" />
            </div>
            <div className="p-4 sm:p-5">
              {allocationTotal > 0 ? (
                <>
                  <div
                    className="flex h-2 overflow-hidden bg-elevated"
                    aria-label="Asset allocation chart"
                  >
                    {holdings.map((asset) => (
                      <span
                        key={asset.symbol}
                        style={{
                          width: `${(asset.value / allocationTotal) * 100}%`,
                          backgroundColor: asset.color,
                        }}
                      />
                    ))}
                  </div>
                  <div className="mt-4 space-y-3">
                    {holdings.slice(0, 5).map((asset) => (
                      <div key={asset.symbol} className="flex items-center gap-2.5 text-xs">
                        <span
                          className="size-2 shrink-0"
                          style={{ backgroundColor: asset.color }}
                        />
                        <span className="min-w-0 flex-1 truncate font-medium">{asset.symbol}</span>
                        <span className="num text-muted-foreground">
                          {((asset.value / allocationTotal) * 100).toFixed(1)}%
                        </span>
                        <span className="num w-24 text-right font-semibold">
                          {displayUsd(asset.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="py-4 text-sm text-muted-foreground">
                  Allocation will appear when your account has assets.
                </p>
              )}
            </div>
          </section>

          <section id="activity" className="scroll-mt-16 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5">
              <div>
                <h2 className="text-sm font-bold">Recent activity</h2>
                <p className="mt-1 text-xs text-muted-foreground">Latest account movements</p>
              </div>
              <Activity size={16} className="text-primary" />
            </div>
            {activity.length ? (
              <div className="divide-y divide-border">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                    <span
                      className={`grid size-8 shrink-0 place-items-center border ${item.kind === "funding" ? "border-primary/20 bg-primary/[0.06] text-primary" : "border-cyan/20 bg-cyan/[0.06] text-cyan"}`}
                    >
                      {item.kind === "funding" ? (
                        <ArrowDownToLine size={14} />
                      ) : (
                        <ArrowUpRight size={14} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold">{item.title}</span>
                      <span className="mt-1 block truncate text-[10px] capitalize text-dim">
                        {item.detail} · {formatActivityDate(item.date)}
                      </span>
                    </span>
                    <span className="num shrink-0 text-xs font-semibold">
                      {item.amount === null ? "—" : displayUsd(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                No account activity yet.
              </p>
            )}
          </section>
        </div>
      </div>

      <section id="orders" className="mt-6 scroll-mt-16 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-sm font-bold">Open orders</h2>
            <p className="mt-1 text-xs text-muted-foreground">Your active limit orders</p>
          </div>
          <span className="border border-border bg-surface px-2 py-1 text-[10px] font-semibold text-muted-foreground">
            {openOrders.length} active
          </span>
        </div>
        {openOrders.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="bg-surface/70 text-[10px] uppercase tracking-wider text-dim">
                <tr>
                  <th className="px-4 py-3 font-semibold sm:px-5">Market</th>
                  <th className="px-4 py-3 font-semibold">Side / type</th>
                  <th className="px-4 py-3 text-right font-semibold">Price</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 text-right font-semibold sm:px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {openOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface/50">
                    <td className="px-4 py-3.5 font-semibold sm:px-5">{order.pair}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={
                          order.side.toLowerCase() === "buy" ? "text-primary" : "text-destructive"
                        }
                      >
                        {order.side}
                      </span>
                      <span className="text-muted-foreground"> · {order.type}</span>
                    </td>
                    <td className="num px-4 py-3.5 text-right">
                      {order.price === null ? "—" : formatUsd(order.price)}
                    </td>
                    <td className="num px-4 py-3.5 text-right">
                      {order.amount === null ? "—" : formatAmount(order.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-right sm:px-5">
                      <span className="border border-warning/20 bg-warning/[0.05] px-2 py-1 text-[10px] font-semibold text-warning">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center px-5 py-9 text-center">
            <Clock3 size={19} className="text-dim" />
            <p className="mt-3 text-sm font-semibold">No open orders</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Orders you place will be listed here.
            </p>
            <Link
              to="/markets"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Explore markets <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </section>

      <footer className="mt-5 flex flex-col gap-2 border-t border-border pt-4 text-[11px] text-dim sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-warning" /> User environment. Balances and trades
          are recorded securely.
        </span>
        <span>{user.email}</span>
      </footer>
    </main>
  );
}

function SummaryMetric({
  label,
  value,
  note,
  icon: Icon,
  positive,
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof Wallet;
  positive?: boolean;
}) {
  return (
    <div className="flex min-h-[108px] items-center justify-between gap-4 bg-card px-4 py-4 sm:px-5">
      <div className="min-w-0">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div
          className={`num mt-2 truncate text-xl font-bold ${positive === undefined ? "text-foreground" : positive ? "text-primary" : "text-destructive"}`}
        >
          {value}
        </div>
        <div className="mt-1 text-[11px] text-dim">{note}</div>
      </div>
      <div className="grid size-9 shrink-0 place-items-center border border-border bg-surface text-muted-foreground">
        <Icon size={16} />
      </div>
    </div>
  );
}

function PerformanceMetric({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-card px-4 py-3.5 sm:px-5">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div
        className={`num mt-2 text-lg font-bold ${positive === undefined ? "text-foreground" : positive ? "text-primary" : "text-destructive"}`}
      >
        {value}
      </div>
    </div>
  );
}

type DataRecord = Record<string, unknown>;

function toRecord(value: unknown): DataRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as DataRecord) : null;
}

function textFrom(record: DataRecord, keys: string[], fallback: string) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return fallback;
}

function numberFrom(record: DataRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value)))
      return Number(value);
  }
  return null;
}

function dateValue(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatActivityDate(value: string) {
  const parsed = dateValue(value);
  return parsed
    ? new Date(parsed).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Date unavailable";
}
