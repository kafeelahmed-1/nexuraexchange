import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/nx/motion";
import { ArrowDownLeft, ArrowUpRight, ChartNoAxesCombined, CircleDollarSign, Clock3, Headset, Wallet } from "lucide-react";
import { SupportEntryButton } from "@/components/nx/support";
import { useMarkets } from "@/lib/market";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account Overview — NEXORA EXCHANGE" },
      { name: "description", content: "Balances, PnL and orders." },
      { property: "og:title", content: "Account Overview — NEXORA EXCHANGE" },
      { property: "og:description", content: "Balances, PnL and orders." },
    ],
  }),
  component: AccountOverview,
});

const demoHoldings = [
  { symbol: "BTC", amount: 0.042, basis: 81240 },
  { symbol: "ETH", amount: 0.85, basis: 2592 },
  { symbol: "SOL", amount: 18, basis: 116.2 },
];

const demoOrders = [
  { pair: "BTC/USDT", side: "Buy", type: "Limit", price: 82400, filled: "0.012 / 0.020 BTC", status: "Open" },
  { pair: "ETH/USDT", side: "Sell", type: "Limit", price: 2810, filled: "0.00 / 0.40 ETH", status: "Open" },
];

function AccountOverview() {
  const markets = useMarkets();
  const cashBalance = 6250;
  const holdings = demoHoldings.map((holding) => {
    const asset = markets.find((market) => market.symbol === holding.symbol);
    const price = asset?.price ?? holding.basis;
    return { ...holding, name: asset?.name ?? holding.symbol, price, change: asset?.change24h ?? 0, value: holding.amount * price };
  });
  const totalBalance = cashBalance + holdings.reduce((total, holding) => total + holding.value, 0);
  const formatUsd = (value: number) =>
    value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const metrics = [
    { label: "Total balance", value: formatUsd(totalBalance), detail: "Across demo assets", icon: Wallet },
    { label: "Today's PnL", value: "+$284.16", detail: "+2.04% today", icon: ChartNoAxesCombined, positive: true },
    { label: "Available balance", value: formatUsd(cashBalance), detail: "USDT ready to trade", icon: CircleDollarSign },
    { label: "Open orders", value: "2", detail: "Spot limit orders", icon: Clock3 },
  ];

  return (
    <>
      <PageHeader title="Account Overview" desc="Balances, PnL and orders." />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Portfolio</h2>
            <p className="mt-1 text-xs text-muted-foreground">Sample account values · market prices update live</p>
          </div>
          <span className="rounded border border-warning/30 bg-warning/10 px-2 py-1 text-[10px] font-bold tracking-wider text-warning">
            SIMULATED ACCOUNT
          </span>
        </div>

        <section aria-label="Account summary" className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, detail, icon: Icon, positive }) => (
            <div key={label} className="min-w-0 bg-surface p-5">
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{label}</span>
                <Icon size={16} className={positive ? "text-primary" : "text-dim"} aria-hidden="true" />
              </div>
              <div className={`num mt-3 truncate text-2xl font-black ${positive ? "text-primary" : "text-foreground"}`}>{value}</div>
              <div className={`mt-1 text-xs ${positive ? "text-primary" : "text-dim"}`}>{detail}</div>
            </div>
          ))}
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
          <section className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Your assets</h2>
              <a href="/markets" className="text-xs font-semibold text-primary hover:underline">Explore markets</a>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-surface text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Asset</th>
                    <th className="px-4 py-3 text-right font-medium">Price</th>
                    <th className="px-4 py-3 text-right font-medium">24h</th>
                    <th className="px-4 py-3 text-right font-medium">Balance</th>
                    <th className="px-4 py-3 text-right font-medium">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {holdings.map((holding) => (
                    <tr key={holding.symbol} className="bg-background/60">
                      <td className="px-4 py-4">
                        <div className="font-bold">{holding.symbol}<span className="ml-2 text-xs font-normal text-dim">{holding.name}</span></div>
                      </td>
                      <td className="num px-4 py-4 text-right">{formatUsd(holding.price)}</td>
                      <td className={`num px-4 py-4 text-right ${holding.change >= 0 ? "text-primary" : "text-destructive"}`}>{holding.change >= 0 ? "+" : ""}{holding.change.toFixed(2)}%</td>
                      <td className="num px-4 py-4 text-right">{holding.amount} {holding.symbol}</td>
                      <td className="num px-4 py-4 text-right font-semibold">{formatUsd(holding.value)}</td>
                    </tr>
                  ))}
                  <tr className="bg-background/60">
                    <td className="px-4 py-4 font-bold">USDT<span className="ml-2 text-xs font-normal text-dim">Tether</span></td>
                    <td className="num px-4 py-4 text-right">$1.00</td>
                    <td className="num px-4 py-4 text-right text-dim">0.00%</td>
                    <td className="num px-4 py-4 text-right">{cashBalance.toLocaleString()} USDT</td>
                    <td className="num px-4 py-4 text-right font-semibold">{formatUsd(cashBalance)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Recent activity</h2>
              <span className="text-xs text-dim">Demo history</span>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {[
                { title: "Bought SOL", amount: "+4.00 SOL", date: "Today, 14:32", icon: ArrowDownLeft, positive: true },
                { title: "Sold ETH", amount: "−0.15 ETH", date: "Today, 11:08", icon: ArrowUpRight },
                { title: "USDT credited", amount: "+$500.00", date: "Yesterday, 18:46", icon: ArrowDownLeft, positive: true },
              ].map((activity) => (
                <div key={activity.title} className="flex items-center gap-3 py-4">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-md ${activity.positive ? "bg-primary/10 text-primary" : "bg-white/[0.05] text-muted-foreground"}`}>
                    <activity.icon size={17} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{activity.title}</div>
                    <div className="mt-1 text-xs text-dim">{activity.date}</div>
                  </div>
                  <div className={`num text-right text-sm font-semibold ${activity.positive ? "text-primary" : "text-foreground"}`}>{activity.amount}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Open orders</h2>
            <span className="text-xs text-dim">2 active · simulated</span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-surface text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Pair</th>
                  <th className="px-4 py-3 font-medium">Side / type</th>
                  <th className="px-4 py-3 text-right font-medium">Limit price</th>
                  <th className="px-4 py-3 text-right font-medium">Filled / amount</th>
                  <th className="px-4 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {demoOrders.map((order) => (
                  <tr key={order.pair} className="bg-background/60">
                    <td className="px-4 py-4 font-bold">{order.pair}</td>
                    <td className="px-4 py-4"><span className={order.side === "Buy" ? "text-primary" : "text-destructive"}>{order.side}</span><span className="ml-2 text-xs text-dim">{order.type}</span></td>
                    <td className="num px-4 py-4 text-right">{formatUsd(order.price)}</td>
                    <td className="num px-4 py-4 text-right text-muted-foreground">{order.filled}</td>
                    <td className="px-4 py-4 text-right"><span className="rounded border border-cyan/20 bg-cyan/[0.07] px-2 py-1 text-xs font-semibold text-cyan">{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <SupportEntryButton className="inline-flex items-center gap-2 rounded-md border border-primary/25 bg-primary/[0.06] px-4 py-2.5 text-sm font-bold text-primary transition hover:border-primary/50 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan">
          <Headset size={16} />
          Customer Support
        </SupportEntryButton>
      </main>
    </>
  );
}
