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
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Project lineup</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fictional projects and illustrative allocations.
            </p>
          </div>
          <div className="flex gap-2" aria-label="Filter projects by status">
            {(["All", "Live", "Upcoming", "Ended"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatus(option)}
                aria-pressed={status === option}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm font-semibold transition",
                  status === option
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
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
              className="panel flex h-full flex-col p-5 transition hover:border-primary/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-12 w-12 place-items-center rounded-xl border border-border bg-surface text-sm font-black"
                    style={{ color: project.color }}
                  >
                    {project.sym.slice(0, 2)}
                  </span>
                  <div>
                    <h3 className="font-bold">{project.name}</h3>
                    <span className="text-xs text-muted-foreground">{project.sym}</span>
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
                    project.status === "Live"
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-surface text-muted-foreground",
                  )}
                >
                  {project.status}
                </span>
              </div>
              <p className="mt-5 min-h-10 text-sm text-muted-foreground">{project.desc}</p>
              <div className="mt-5 grid grid-cols-2 gap-4 border-y border-border py-4">
                <div>
                  <div className="text-xs text-dim">Token price</div>
                  <div className="num mt-1 font-bold">${project.price}</div>
                </div>
                <div>
                  <div className="text-xs text-dim">Allocation</div>
                  <div className="num mt-1 font-bold">
                    {project.alloc} {project.sym}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-dim">Sale window</div>
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <Clock3 size={13} className="text-dim" />
                    {project.start} – {project.end}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-dim">
                    <span>Raised</span>
                    <span>{project.raised}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-elevated">
                    <div
                      className="h-full rounded-full"
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
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-bold transition enabled:hover:border-primary/40 enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
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
        title="NEXORA News"
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
              className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/30"
            >
              <div className="relative h-32 overflow-hidden border-b border-border bg-surface">
                <div className="grid-bg absolute inset-0 opacity-60 transition-transform duration-500 group-hover:scale-105" />
                <div
                  className="absolute -bottom-16 left-8 h-40 w-40 rounded-full blur-3xl"
                  style={{ background: article.hue }}
                />
                <span className="absolute left-4 top-4 rounded border border-border bg-background/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {article.cat}
                </span>
              </div>
              <div className="p-5">
                <time className="text-xs text-dim">{article.date}</time>
                <h2 className="mt-2 text-lg font-bold leading-snug">{article.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {article.excerpt}
                </p>
                <div className="mt-5 border-t border-border pt-3 text-xs font-semibold text-primary">
                  NEXORA editorial · Simulation notes
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
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Fee schedule</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Illustrative rates by 30-day trading volume.
                </p>
              </div>
              <SimulatedBadge />
            </div>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-surface text-xs uppercase tracking-wider text-dim">
                  <tr>
                    <th className="px-5 py-3 font-bold">Tier</th>
                    <th className="px-5 py-3 font-bold">30D volume (USDT)</th>
                    <th className="px-5 py-3 font-bold">Maker</th>
                    <th className="px-5 py-3 font-bold">Taker</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((tier) => (
                    <tr key={tier.level} className="border-t border-border bg-card">
                      <td className="px-5 py-4 font-semibold">{tier.level}</td>
                      <td className="num px-5 py-4 text-muted-foreground">{tier.volume}</td>
                      <td className="num px-5 py-4 text-primary">{tier.maker}</td>
                      <td className="num px-5 py-4">{tier.taker}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-bold">Market rates</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(["Spot", "Futures"] as const).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => setMarket(kind)}
                    aria-pressed={market === kind}
                    className={cn(
                      "rounded-lg border p-4 text-left transition",
                      market === kind
                        ? "border-primary/40 bg-primary/[0.06]"
                        : "border-border bg-card hover:border-primary/30",
                    )}
                  >
                    <span className="font-bold">{kind}</span>
                    <span className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">
                        Maker{" "}
                        <b className="num ml-1 text-foreground">
                          {feeRates[kind].maker.toFixed(3)}%
                        </b>
                      </span>
                      <span className="text-muted-foreground">
                        Taker{" "}
                        <b className="num ml-1 text-foreground">
                          {feeRates[kind].taker.toFixed(3)}%
                        </b>
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>
          <aside className="h-fit rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <Calculator size={17} className="text-primary" />
              <h2 className="font-bold">Fee estimator</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Estimate a single order at the selected base rates.
            </p>
            <div className="mt-5 flex gap-2" aria-label="Choose market type">
              {(["Spot", "Futures"] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setMarket(kind)}
                  aria-pressed={market === kind}
                  className={cn(
                    "flex-1 rounded-md border px-3 py-2 text-sm font-semibold",
                    market === kind
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {kind}
                </button>
              ))}
            </div>
            <label className="mt-5 block text-xs font-semibold text-muted-foreground">
              Order value (USDT)
              <input
                type="number"
                min="0"
                step="any"
                value={volume}
                onChange={(event) => setVolume(event.target.value)}
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </label>
            <div className="mt-5 space-y-3 border-t border-border pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Maker fee</span>
                <span className="num font-bold">{makerFee.toFixed(4)} USDT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taker fee</span>
                <span className="num font-bold">{takerFee.toFixed(4)} USDT</span>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-dim">
              Estimate only. Actual costs may depend on tier, order type and promotions. No real
              orders are placed.
            </p>
          </aside>
        </div>
      </main>
    </>
  );
}
