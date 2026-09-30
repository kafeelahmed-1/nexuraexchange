import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, ArrowUpRight, Calculator, Clock3, Search, ShieldCheck } from "lucide-react";
import { launchpad, news } from "@/lib/content";
import { PageHeader, SimulatedBadge } from "@/components/nx/motion";
import { cn } from "@/lib/utils";

const wrap = "mx-auto max-w-7xl px-4 md:px-6";

const earnProducts = [
  {
    asset: "USDT",
    name: "USD Tether",
    apy: 8.4,
    term: "Flexible",
    minimum: "10 USDT",
    capacity: "72%",
  },
  {
    asset: "BTC",
    name: "Bitcoin",
    apy: 3.2,
    term: "30 days",
    minimum: "0.001 BTC",
    capacity: "48%",
  },
  {
    asset: "ETH",
    name: "Ethereum",
    apy: 4.6,
    term: "60 days",
    minimum: "0.01 ETH",
    capacity: "86%",
  },
  { asset: "SOL", name: "Solana", apy: 6.8, term: "Flexible", minimum: "0.1 SOL", capacity: "35%" },
];

export function EarnPage() {
  const [term, setTerm] = useState("All terms");
  const products = earnProducts.filter((product) => term === "All terms" || product.term === term);

  return (
    <>
      <PageHeader
        title="Mining & Earn"
        desc="Explore illustrative yield products with transparent terms and capacity."
      />
      <main className={cn(wrap, "py-10")}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Available products</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              APY and availability are simulated and may change.
            </p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Filter products by term">
            {["All terms", "Flexible", "30 days", "60 days"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTerm(option)}
                aria-pressed={term === option}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm font-semibold transition",
                  term === option
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="hidden grid-cols-[1.5fr_0.8fr_0.9fr_1fr_1fr_auto] gap-4 bg-surface px-5 py-3 text-xs font-bold uppercase tracking-wider text-dim md:grid">
            <span>Asset</span>
            <span>Est. APY</span>
            <span>Term</span>
            <span>Minimum</span>
            <span>Capacity</span>
            <span />
          </div>
          {products.map((product) => (
            <div
              key={product.asset}
              className="grid gap-4 border-t border-border bg-card px-5 py-4 md:grid-cols-[1.5fr_0.8fr_0.9fr_1fr_1fr_auto] md:items-center"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-xs font-black text-primary">
                  {product.asset.slice(0, 3)}
                </span>
                <div>
                  <div className="font-bold">{product.asset}</div>
                  <div className="text-xs text-muted-foreground">{product.name}</div>
                </div>
              </div>
              <div>
                <span className="mr-2 text-xs text-dim md:hidden">APY</span>
                <span className="num font-bold text-primary">{product.apy.toFixed(1)}%</span>
              </div>
              <div className="text-sm">{product.term}</div>
              <div className="num text-sm">{product.minimum}</div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-dim">Filled</span>
                  <span>{product.capacity}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: product.capacity }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  toast.info("Demo product", {
                    description:
                      "This simulated product does not accept deposits or create subscriptions.",
                  })
                }
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:brightness-110"
              >
                Details <ArrowRight size={15} />
              </button>
            </div>
          ))}
          {products.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No products match this term.
            </p>
          )}
        </div>
        <div className="mt-6 flex items-start gap-3 border-l-2 border-warning/60 bg-warning/[0.06] p-4 text-sm text-muted-foreground">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-warning" />
          <p>
            Simulation only. APY values are illustrative; no assets can be deposited and no yield is
            generated.
          </p>
        </div>
      </main>
    </>
  );
}

type LaunchStatus = "All" | "Live" | "Upcoming" | "Ended";

export function LaunchpadPage() {
  const [status, setStatus] = useState<LaunchStatus>("All");
  const projects =
    status === "All" ? launchpad : launchpad.filter((project) => project.status === status);

  return (
    <>
      <PageHeader
        title="Token Launchpad"
        desc="Discover simulated token launches and explore their subscription mechanics."
      />
      <main className={cn(wrap, "py-10")}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-foreground">Project lineup</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Fictional projects and illustrative allocations.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card/60 p-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]" aria-label="Filter projects by status">
            {(["All", "Live", "Upcoming", "Ended"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatus(option)}
                aria-pressed={status === option}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-200",
                  status === option
                    ? "border border-primary/30 bg-primary/10 text-primary shadow-[0_0_0_1px_rgba(0,232,135,0.15)]"
                    : "border border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.sym}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-[linear-gradient(180deg,rgba(13,19,25,0.96),rgba(9,14,18,0.98))] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_40px_-22px_rgba(0,232,135,0.35)]"
            >
              <div
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70"
                aria-hidden="true"
              />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-12 w-12 place-items-center rounded-xl border border-border text-sm font-black shadow-inner shadow-black/20"
                    style={{ color: project.color, background: `linear-gradient(135deg, ${project.color}22, rgba(255,255,255,0.02))` }}
                  >
                    {project.sym.slice(0, 2)}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{project.name}</h3>
                    <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{project.sym}</span>
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
                    project.status === "Live"
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : project.status === "Upcoming"
                        ? "border-cyan/30 bg-cyan/10 text-cyan"
                        : "border-warning/30 bg-warning/10 text-warning",
                  )}
                >
                  {project.status}
                </span>
              </div>
              <p className="mt-5 min-h-10 text-sm leading-6 text-muted-foreground">{project.desc}</p>
              <div className="mt-5 grid grid-cols-2 gap-4 border-y border-border/80 py-4">
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-dim">Token price</div>
                  <div className="num mt-1 text-lg font-bold text-foreground">${project.price}</div>
                </div>
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-dim">Allocation</div>
                  <div className="num mt-1 text-lg font-bold text-foreground">
                    {project.alloc} {project.sym}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-dim">Sale window</div>
                  <div className="mt-1 flex items-center gap-1 text-sm text-foreground">
                    <Clock3 size={13} className="text-dim" />
                    {project.start} – {project.end}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-medium uppercase tracking-[0.14em] text-dim">
                    <span>Raised</span>
                    <span>{project.raised}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-elevated">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${project.raised}%`, backgroundColor: project.color }}
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                disabled={project.status !== "Live"}
                onClick={() =>
                  toast.info("Launchpad preview", {
                    description: "This fictional project has no real token sale or allocation.",
                  })
                }
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface/70 px-4 py-2.5 text-sm font-bold text-foreground transition-all duration-200 enabled:hover:border-primary/40 enabled:hover:bg-primary/5 enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
              >
                {project.status === "Live"
                  ? "View project"
                  : project.status === "Ended"
                    ? "Sale ended"
                    : "Coming soon"}
                <ArrowUpRight size={15} />
              </button>
            </article>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-2 text-xs text-warning">
          <SimulatedBadge /> All projects and sale metrics are fictional.
        </div>
      </main>
    </>
  );
}

const newsCategories = ["All", ...new Set(news.map((item) => item.cat))];

export function NewsPage() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const articles = useMemo(
    () =>
      news.filter((item) => {
        const matchesCategory = category === "All" || item.cat === category;
        const search = `${item.title} ${item.excerpt} ${item.cat}`.toLowerCase();
        return matchesCategory && search.includes(query.trim().toLowerCase());
      }),
    [category, query],
  );

  return (
    <>
      <PageHeader
        title="BR Trades News"
        desc="Platform notes, security concepts, product updates and simulated market recaps."
      />
      <main className={cn(wrap, "py-10")}>
        <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" aria-label="Filter news by category">
            {newsCategories.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCategory(option)}
                aria-pressed={category === option}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm font-semibold transition",
                  category === option
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {option}
              </button>
            ))}
          </div>
          <label className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 lg:w-72">
            <Search size={16} className="shrink-0 text-dim" />
            <span className="sr-only">Search news</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search updates"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-dim"
            />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.title}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_50px_-30px_var(--primary)]"
            >
              <div className="relative h-48 overflow-hidden border-b border-border bg-surface">
                <img src={article.image} alt={article.title} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-background/20" />
                <div
                  className="absolute -bottom-16 left-8 h-40 w-40 rounded-full blur-3xl transition-transform duration-500 group-hover:translate-x-2"
                  style={{ background: article.hue }}
                />
                <span className="absolute left-4 top-4 rounded border border-white/15 bg-background/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur">
                  {article.cat}
                </span>
                <span className="absolute bottom-4 left-4 text-[10px] font-bold tracking-[0.12em] text-white/80">BR TRADES JOURNAL</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <time className="text-xs font-medium text-dim">{article.date}</time>
                <h2 className="mt-2 text-lg font-bold leading-snug">{article.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {article.excerpt}
                </p>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 text-xs font-semibold text-primary">
                  BR Trades editorial · Simulation notes
                  <ArrowRight size={14} className="shrink-0 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </article>
          ))}
        </div>
        {articles.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No updates match your search.
          </p>
        )}
      </main>
    </>
  );
}

const feeRates = {
  Spot: { maker: 0, taker: 0.08 },
  Futures: { maker: 0.02, taker: 0.05 },
} as const;

export function FeesPage() {
  const [market, setMarket] = useState<keyof typeof feeRates>("Spot");
  const [volume, setVolume] = useState("1000");
  const rates = feeRates[market];
  const volumeValue = Number(volume) || 0;
  const makerFee = (volumeValue * rates.maker) / 100;
  const takerFee = (volumeValue * rates.taker) / 100;
  const tiers = [
    { level: "Regular", volume: "< 50,000", maker: "0.000%", taker: "0.080%" },
    { level: "VIP 1", volume: "50,000+", maker: "0.000%", taker: "0.070%" },
    { level: "VIP 2", volume: "250,000+", maker: "0.000%", taker: "0.060%" },
    { level: "VIP 3", volume: "1,000,000+", maker: "0.000%", taker: "0.050%" },
  ];

  return (
    <>
      <PageHeader
        title="Trading Fees"
        desc="Review illustrative spot and futures rates, VIP tiers and estimated order costs."
      />
      <main className={cn(wrap, "py-10")}>
        <div className="grid gap-8 lg:grid-cols-[1.3fr_360px]">
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-[clamp(1.4rem,2vw,2rem)] font-black tracking-tight text-foreground">
                  Fee schedule
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Illustrative rates by 30-day trading volume.
                </p>
              </div>
              <SimulatedBadge />
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-[linear-gradient(180deg,rgba(13,19,25,0.96),rgba(10,14,18,0.98))] shadow-[0_18px_45px_-28px_rgba(0,232,135,0.2)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="bg-surface/80 text-[10px] uppercase tracking-[0.16em] text-dim">
                    <tr>
                      <th className="px-5 py-3 font-bold">Tier</th>
                      <th className="px-5 py-3 font-bold">30D volume</th>
                      <th className="px-5 py-3 font-bold">Maker</th>
                      <th className="px-5 py-3 font-bold">Taker</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiers.map((tier) => (
                      <tr key={tier.level} className="border-t border-border bg-card/30">
                        <td className="px-5 py-4 font-semibold text-foreground">{tier.level}</td>
                        <td className="num px-5 py-4 text-muted-foreground">{tier.volume}</td>
                        <td className="num px-5 py-4 text-primary">{tier.maker}</td>
                        <td className="num px-5 py-4 text-foreground">{tier.taker}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-8">
              <h2 className="text-[clamp(1.2rem,1.5vw,1.7rem)] font-black tracking-tight text-foreground">
                Market rates
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(["Spot", "Futures"] as const).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => setMarket(kind)}
                    aria-pressed={market === kind}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition-all duration-200",
                      market === kind
                        ? "border-primary/40 bg-primary/[0.06] shadow-[0_0_0_1px_rgba(0,232,135,0.18)]"
                        : "border-border bg-card/40 hover:border-primary/30 hover:bg-card",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-lg font-bold text-foreground">{kind}</span>
                      {market === kind && <span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-primary">Selected</span>}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg border border-border bg-surface/50 p-2.5">
                        <div className="text-[10px] uppercase tracking-[0.14em] text-dim">Maker</div>
                        <div className="num mt-1 text-base font-bold text-primary">{feeRates[kind].maker.toFixed(3)}%</div>
                      </div>
                      <div className="rounded-lg border border-border bg-surface/50 p-2.5">
                        <div className="text-[10px] uppercase tracking-[0.14em] text-dim">Taker</div>
                        <div className="num mt-1 text-base font-bold text-foreground">{feeRates[kind].taker.toFixed(3)}%</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
          <aside className="h-fit rounded-2xl border border-border bg-[linear-gradient(180deg,rgba(14,23,29,0.96),rgba(11,17,22,0.98))] p-5 shadow-[0_18px_45px_-28px_rgba(0,232,135,0.2)]">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                <Calculator size={16} />
              </div>
              <h2 className="text-xl font-black text-foreground">Fee estimator</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Estimate the cost of a single order using the selected market and fee tier.
            </p>
            <div className="mt-5 flex gap-2 rounded-xl border border-border bg-surface/60 p-1" aria-label="Choose market type">
              {(["Spot", "Futures"] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setMarket(kind)}
                  aria-pressed={market === kind}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition",
                    market === kind
                      ? "bg-primary text-primary-foreground shadow-[0_8px_18px_-12px_rgba(0,232,135,0.8)]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {kind}
                </button>
              ))}
            </div>
            <label className="mt-5 block text-[11px] font-bold uppercase tracking-[0.14em] text-dim">
              Order value (USDT)
              <input
                type="number"
                min="0"
                step="any"
                value={volume}
                onChange={(event) => setVolume(event.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base text-foreground outline-none transition focus:border-primary/50"
              />
            </label>
            <div className="mt-5 space-y-3 rounded-xl border border-border bg-surface/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Maker fee</span>
                <span className="num font-bold text-primary">{makerFee.toFixed(4)} USDT</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Taker fee</span>
                <span className="num font-bold text-foreground">{takerFee.toFixed(4)} USDT</span>
              </div>
            </div>
            <div className="mt-5 rounded-xl border border-border bg-surface/50 p-3 text-xs leading-5 text-dim">
              Estimate only. Actual costs may depend on tier, order type and promotions. No real
              orders are placed.
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
