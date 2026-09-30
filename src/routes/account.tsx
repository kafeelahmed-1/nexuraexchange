import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import { getDemoAccountState, useDemoUser, type DemoAccountState } from "@/lib/demo-auth";
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

  useEffect(() => {
    if (loaded && !user) {
      void navigate({ to: "/login?next=%2Faccount" as never, replace: true });
    }
  }, [loaded, user, navigate]);

  useEffect(() => {
    if (!loaded || !user) return;
    try {
      setAccountState(getDemoAccountState(user.id));
      setLoadError("");
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load your account.");
    }
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
          detail: "Paper trade",
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

  if (!loaded || !user || (!accountState && !loadError)) {
    return (
      <main className="mx-auto min-h-[55vh] max-w-7xl px-4 py-8 md:px-6" aria-busy="true">
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
      <main className="mx-auto min-h-[55vh] max-w-7xl px-4 py-8 md:px-6">
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
    <main className="mx-auto min-h-[65vh] max-w-7xl px-4 pb-12 pt-6 md:px-6 md:pt-9">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
            <span className="size-1.5 rounded-full bg-primary" /> Account workspace
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Your portfolio and account activity, all in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 border border-warning/25 bg-warning/[0.06] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-warning">
            <ShieldCheck size={13} /> Demo account
          </span>
          <button
            type="button"
            onClick={() => setShowBalances((visible) => !visible)}
            aria-label={showBalances ? "Hide balances" : "Show balances"}
            title={showBalances ? "Hide balances" : "Show balances"}
            className="grid size-9 place-items-center border border-border text-muted-foreground transition hover:bg-elevated hover:text-foreground"
          >
            {showBalances ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
      </header>

      <section
        aria-label="Portfolio summary"
        className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-4"
      >
        <div className="bg-card p-4 sm:p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-muted-foreground">Total portfolio value</span>
            <Wallet size={16} className="text-primary" />
          </div>
          <div className="num mt-3 truncate text-3xl font-bold sm:text-4xl">
            {displayUsd(allocationTotal)}
          </div>
          <p className="mt-2 text-xs text-dim">Estimated value across your demo account</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/checkout"
              className="inline-flex min-h-10 items-center justify-center gap-2 bg-gradient-brand px-3.5 text-xs font-bold text-primary-foreground transition hover:brightness-110"
            >
              <ArrowDownToLine size={14} /> Add funds
            </Link>
            <Link
              to="/trade/$pair"
              params={{ pair: "BTC-USDT" }}
              className="inline-flex min-h-10 items-center justify-center gap-2 border border-border px-3.5 text-xs font-bold transition hover:border-primary/40 hover:text-primary"
            >
              Trade <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
        <SummaryMetric
          label="Available balance"
          value={displayUsd(accountState.portfolio.availableBalance)}
          note="Ready to use"
          icon={Wallet}
        />
        <SummaryMetric
          label="Unrealized P&L"
          value={displayUsd(liveUnrealizedPnL)}
          note="Open positions"
          icon={liveUnrealizedPnL >= 0 ? TrendingUp : TrendingDown}
          positive={liveUnrealizedPnL >= 0}
        />
      </section>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <SummaryMetric
          label="Realized P&L"
          value={displayUsd(accountState.portfolio.realizedPnL)}
          note="Closed trades"
          icon={Activity}
          positive={accountState.portfolio.realizedPnL >= 0}
        />
        <div className="flex min-h-[108px] items-center justify-between gap-4 border border-border bg-card px-4 py-4 sm:px-5">
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

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
        <section className="min-w-0 border border-border bg-card">
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
                Add demo funds or place a paper trade to see balances here.
              </p>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs sm:px-5">
            <span className="text-muted-foreground">Assets shown</span>
            <span className="num font-semibold">{holdings.length}</span>
          </div>
        </section>

        <div className="grid gap-6">
          <section className="border border-border bg-card">
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

          <section className="border border-border bg-card">
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

      <section className="mt-6 border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-sm font-bold">Open orders</h2>
            <p className="mt-1 text-xs text-muted-foreground">Your active simulated limit orders</p>
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
          <ShieldCheck size={13} className="text-warning" /> Demo environment. Balances and trades
          are simulated.
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
