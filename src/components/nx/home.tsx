import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ShieldCheck, Mail, ArrowRight, TrendingUp, Zap, Layers, Rocket, Pickaxe, Lock, KeyRound, Network, Activity, Apple, Smartphone, Monitor, ChevronDown, UserPlus, Search, MousePointerClick, Headset } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fmtPrice, useAsset } from "@/lib/market";
import { AnimatedNumber, MagneticButton, Modal, Reveal, SectionHead, TiltCard, useFinePointer, SimulatedBadge } from "./motion";
import { MarketTable, OrderBook, Sparkline, TimeframeTabs } from "./market";
import { news } from "@/lib/content";
import { SupportEntryButton } from "./support";
import { MockAppQr } from "./app-qr";

const wrap = "mx-auto max-w-7xl px-4 md:px-6";

export function HeroSection() {
  const fine = useFinePointer();
  const navigate = useNavigate();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yText = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const yWidget = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const yGlow = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });
  const g1x = useTransform(mx, (v) => v * 15), g1y = useTransform(my, (v) => v * 15);
  const wx = useTransform(mx, (v) => v * -6), wy = useTransform(my, (v) => v * -6);
  const gx = useTransform(mx, (v) => v * 8), gy = useTransform(my, (v) => v * 8);
  const [email, setEmail] = useState("");

  return (
    <section ref={ref} className="relative overflow-hidden"
      onMouseMove={(e) => { if (!fine) return; mx.set(e.clientX / window.innerWidth - 0.5); my.set(e.clientY / window.innerHeight - 0.5); }}>
      <motion.div style={{ x: gx, y: gy }} className="grid-bg pointer-events-none absolute -inset-10 opacity-60 [mask-image:radial-gradient(ellipse_at_30%_40%,black,transparent_70%)]" />
      <motion.div style={{ x: g1x, y: g1y, translateY: yGlow }} className="pointer-events-none absolute -left-40 top-0 h-[520px] w-[520px] animate-drift rounded-full bg-primary/12 blur-[120px]" />
      <motion.div style={{ x: wx, y: wy }} className="pointer-events-none absolute right-0 top-40 h-[420px] w-[420px] rounded-full bg-cyan/10 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="absolute bottom-0 h-1 w-1 rounded-full bg-primary/60" style={{ left: `${(i * 37) % 100}%`, animation: `rise ${9 + (i % 5) * 2}s linear ${i * 0.8}s infinite` }} />
        ))}
      </div>

      <div className={cn(wrap, "relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.1fr_1fr]")}>
        <motion.div className="min-w-0" style={{ y: yText }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-bold tracking-wider text-primary">
            <ShieldCheck size={14} /> SIMULATED PROOF-OF-RESERVES INTERFACE
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8, delay: 0.1 }} className="mt-6 text-[2rem] font-black leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Institutional-Grade<br /><span className="text-primary">Crypto</span> <span className="text-cyan">Exchange.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-6 max-w-xl text-lg text-muted-foreground">
            Explore 300+ simulated crypto pairs with a sub-millisecond-feel interface, deep order books, 0% maker fees, and paper trading on spot and 100x futures.
          </motion.p>
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            onSubmit={(e) => { e.preventDefault(); navigate({ to: "/register" }); if (email) toast.info("Account prefilled", { description: email }); }}
            className="mt-8 flex max-w-xl flex-col gap-2 rounded-xl border border-border bg-card p-2 sm:flex-row sm:items-center">
            <label className="flex flex-1 items-center gap-3 px-3"><Mail size={18} className="shrink-0 text-dim" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email to claim bonus" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" /></label>
            <MagneticButton type="submit" className="min-w-[220px] py-3.5">
              <span className="flex flex-col leading-none text-left">
                <span className="text-[1.8rem] font-black tracking-[-0.05em]">Claim $500</span>
                <span className="text-lg font-extrabold">Bonus</span>
              </span>
            </MagneticButton>
          </motion.form>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 flex flex-wrap gap-3">
            <Link to="/markets" className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-foreground hover:shadow-[0_0_20px_-8px_var(--primary)]">View Markets</Link>
            <Link to="/futures" className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-cyan/40 hover:text-foreground hover:shadow-[0_0_20px_-8px_var(--cyan)]">Trade Futures</Link>
          </motion.div>
        </motion.div>
        <motion.div className="min-w-0" style={{ y: yWidget, x: wx }} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}>
          <HeroTradingWidget />
        </motion.div>
      </div>
    </section>
  );
}

const pairs = ["BTC", "ETH", "SOL", "DOGE"];
export function HeroTradingWidget() {
  const [p, setP] = useState("BTC");
  const [tf, setTf] = useState("1m");
  const a = useAsset(p);
  const navigate = useNavigate();
  return (
    <div className="relative rounded-2xl border border-border bg-card/90 p-4 shadow-[0_40px_120px_-40px_color-mix(in_oklab,var(--primary)_35%,transparent)] backdrop-blur md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex flex-wrap gap-1.5">
          {pairs.map((x) => (
            <button key={x} onClick={() => setP(x)} className={cn("rounded-lg border px-3 py-1.5 text-xs font-bold transition", p === x ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>{x}/USDT</button>
          ))}
        </div>
        <TimeframeTabs id="hero-tf" value={tf} onChange={setTf} options={["1m", "15m", "1h", "1D"]} />
      </div>
      <div className="flex flex-col items-start justify-between gap-4 py-5 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={p} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <AnimatedNumber value={a.price} format={fmtPrice} className="text-4xl font-bold text-primary md:text-5xl" />
            </motion.div>
          </AnimatePresence>
          <div className="mt-1 text-xs text-muted-foreground">Index Price: <span className="num">{fmtPrice(a.price * 0.99992)}</span> USDT</div>
        </div>
        <div className="num flex gap-5 text-right text-xs"><div><div className="text-dim">24h High</div><div className="font-bold">{fmtPrice(a.high24h)}</div></div><div><div className="text-dim">24h Low</div><div className="font-bold">{fmtPrice(a.low24h)}</div></div></div>
      </div>
      <motion.div key={p + tf} initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }} animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }} transition={{ duration: 0.8 }} className="mb-4 hidden sm:block">
        <Sparkline data={a.sparkline} w={520} h={60} positive={a.change24h >= 0} />
      </motion.div>
      <OrderBook mid={a.price} base={p} compact />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <MagneticButton variant="green" onClick={() => navigate({ to: "/trade/$pair", params: { pair: `${p}-USDT` } })}><TrendingUp size={16} />Trade Spot</MagneticButton>
        <MagneticButton variant="red" onClick={() => navigate({ to: "/futures" })}><Zap size={16} />100x Futures</MagneticButton>
      </div>
    </div>
  );
}

export function StatStrip() {
  const s = [
    { v: 300, f: (n: number) => `${Math.round(n)}+`, l: "Simulated markets" },
    { v: 0.4, f: (n: number) => `<${n.toFixed(1)}ms`, l: "Matching latency" },
    { v: 100, f: (n: number) => `${Math.round(n)}x`, l: "Max paper leverage" },
    { v: 24, f: (n: number) => `${Math.round(n)}/7`, l: "Simulated uptime" },
  ];
  return (
    <section className={cn(wrap, "py-6")}>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
        {s.map((x, i) => (
          <Reveal key={x.l} delay={i * 0.08} className="bg-card p-6">
            <AnimatedNumber once value={x.v} format={x.f} className="text-3xl font-bold text-gradient md:text-4xl" />
            <div className="mt-1 text-sm text-muted-foreground">{x.l}</div>
          </Reveal>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-dim">All figures are illustrative values.</p>
    </section>
  );
}

export function MarketScanner() {
  return (
    <section className={cn(wrap, "py-20")}>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHead eyebrow="LIVE MARKET SCANNER" title="Explore 300+ Crypto Markets" desc="Real-time simulated market interface with professional price tracking." />
        <Reveal className="mb-10"><Link to="/markets" className="group inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-bold hover:border-primary/40">View Full Market Overview <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></Link></Reveal>
      </div>
      <Reveal><MarketTable limit={10} /></Reveal>
    </section>
  );
}

const eco = [
  { i: Layers, t: "Spot & Margin", d: "Deep simulated books across 300+ pairs with limit, market and stop orders.", to: "/trade/BTC-USDT", label: "SPOT MARKET", preview: "BTC/USDT", detail: "300+ pairs" },
  { i: Zap, t: "Perpetual Futures", d: "Paper-trade perpetuals up to 100x with cross and isolated margin modes.", to: "/futures", label: "PERPETUALS", preview: "BTC-PERP", detail: "Cross · Isolated" },
  { i: Pickaxe, t: "Mining & Earn", d: "Explore yield products with transparent terms and capacity.", to: "/earn", label: "EARN PRODUCTS", preview: "Flexible terms", detail: "Capacity shown" },
  { i: Rocket, t: "Token Launchpad", d: "Browse simulated token launches and subscription mechanics.", to: "/launchpad", label: "TOKEN LAUNCHES", preview: "Subscriptions", detail: "Preview listings" },
];
export function Ecosystem() {
  const btc = useAsset("BTC");
  return (
    <section className={cn(wrap, "py-20")}>
      <SectionHead eyebrow="ECOSYSTEM" title="Built for Retail & Institutional Traders" desc="One interface for every trading workflow — simulated end to end." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {eco.map((e, i) => (
          <Reveal key={e.t} delay={i * 0.08}>
            <Link to={e.to as never} className="block h-full">
              <TiltCard className="h-full min-h-[330px] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex rounded-lg border border-primary/20 bg-primary/10 p-2.5 text-primary transition-transform duration-300 group-hover:-translate-y-0.5"><e.i size={20} /></span>
                  <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.14em] text-dim"><span className="size-1.5 rounded-full bg-warning" /> SIMULATED</span>
                </div>
                <div className="mt-5 text-[10px] font-bold tracking-[0.16em] text-primary">{e.label}</div>
                <h3 className="mt-1 text-lg font-bold">{e.t}</h3>
                <p className="mt-2 min-h-[60px] text-sm leading-5 text-muted-foreground">{e.d}</p>
                <div className="mt-4 border-y border-border/80 bg-background/30 px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold">{e.preview}</div>
                      <div className="mt-1 text-[10px] text-dim">{e.detail}</div>
                    </div>
                    {i < 2 ? (
                      <div className="flex shrink-0 items-center gap-2">
                        <Sparkline data={btc.sparkline} w={56} h={22} positive={btc.change24h >= 0} />
                        <span className={`num text-[10px] font-semibold ${btc.change24h >= 0 ? "text-primary" : "text-destructive"}`}>{btc.change24h > 0 ? "+" : ""}{btc.change24h.toFixed(2)}%</span>
                      </div>
                    ) : <ArrowRight size={15} className="shrink-0 text-dim transition-transform group-hover:translate-x-1 group-hover:text-primary" />}
                  </div>
                  {i < 2 && <div className="num mt-2 text-[11px] font-semibold text-foreground">{fmtPrice(btc.price)} <span className="font-normal text-dim">USDT</span></div>}
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm font-bold text-primary">Explore <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></div>
              </TiltCard>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Ring({ pct, label }: { pct: number; label: string }) {
  const c = 2 * Math.PI * 52;
  return (
    <div className="relative mx-auto h-40 w-40">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <defs><linearGradient id="rg"><stop offset="0" stopColor="var(--primary)" /><stop offset="1" stopColor="var(--cyan)" /></linearGradient></defs>
        <circle cx="60" cy="60" r="52" stroke="var(--elevated)" strokeWidth="8" fill="none" />
        <motion.circle cx="60" cy="60" r="52" stroke="url(#rg)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }} whileInView={{ strokeDashoffset: c * (1 - pct / 100) }} viewport={{ once: true }} transition={{ duration: 1.8, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center"><AnimatedNumber once value={pct} format={(n) => `${Math.round(n)}%`} className="text-3xl font-bold" /><span className="text-[10px] text-dim">{label}</span></div>
    </div>
  );
}
export function Verification() {
  const items = [["100%", "Reserve Verification"], ["1:1", "Asset Accounting"], ["Audited", "UI Verification"], ["Multi-Layer", "Security Model"]];
  return (
    <section className={cn(wrap, "py-20")}>
      <div className="panel relative isolate overflow-hidden p-6 md:p-10">
        <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-40" />
        <div className="pointer-events-none absolute -left-24 top-1/2 -z-10 h-72 w-72 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="grid items-center gap-10 md:grid-cols-[.8fr_1.5fr]">
          <Reveal>
            <div className="relative mx-auto max-w-xs text-center md:mx-0">
              <div className="absolute inset-8 rounded-full bg-primary/10 blur-2xl" />
              <Ring pct={100} label="RATIO" />
              <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.16em] text-dim">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
                RESERVE INDEX · LIVE MODEL
              </div>
            </div>
          </Reveal>
        <div>
          <Reveal>
            <div className="flex flex-wrap items-center gap-3"><SimulatedBadge>SIMULATED</SimulatedBadge><span className="text-[10px] font-bold tracking-[0.14em] text-dim">VERIFICATION LAYER 01</span></div>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Transparent by Design</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">How a reserve-transparency dashboard could look. Nothing here reflects real assets or audits.</p>
          </Reveal>
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map(([v, l], i) => (
              <Reveal key={l} delay={i * 0.08} className="group rounded-xl border border-border bg-surface/80 p-4 transition-colors duration-300 hover:border-primary/35 hover:bg-elevated/80">
                <div className="flex items-start justify-between gap-3"><div className="text-xl font-black text-gradient">{v}</div><span className="num text-[10px] font-bold text-dim">0{i + 1}</span></div>
                <div className="mt-1 text-xs text-muted-foreground">{l}</div>
                <div className="mt-3 flex items-center gap-2 text-[10px] font-bold tracking-[0.1em] text-warning"><span className="h-1.5 w-1.5 rounded-full bg-warning" /> SIMULATED</div>
              </Reveal>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-4 text-[10px] font-bold tracking-[0.12em] text-dim">
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> HASH CONSISTENCY 100%</span>
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan" /> LAST CHECK JUST NOW</span>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

const sec = [
  { i: ShieldCheck, t: "MPC Cold Storage", d: "Illustrative multi-party computation custody model.", anim: { scale: [1, 1.12, 1] } },
  { i: KeyRound, t: "Hardware 2FA & FIDO2", d: "Passkey and hardware security key concepts.", anim: { rotate: [0, -12, 0] } },
  { i: Network, t: "Anti-DDoS Shielding", d: "Conceptual edge-shielding architecture overview.", anim: { x: [0, 3, -3, 0] } },
  { i: Activity, t: "Risk Engine", d: "Simulated real-time margin and liquidation monitoring.", anim: { y: [0, -3, 0] } },
];
export function SecuritySection() {
  return (
    <section className={cn(wrap, "relative py-20")}>
      <div className="pointer-events-none absolute inset-x-0 top-24 -z-10 mx-auto h-64 max-w-5xl bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--cyan)_8%,transparent),transparent_68%)]" />
      <SectionHead eyebrow="SECURITY ARCHITECTURE" title="Enterprise Protection" desc="Layered security concepts with no real certifications claimed." />
      <div className="relative">
        <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-10 hidden h-px overflow-hidden bg-border lg:block">
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: "easeOut" }} className="h-full origin-left bg-gradient-to-r from-primary/20 via-cyan to-primary/20" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sec.map((s, i) => (
          <Reveal key={s.t} delay={i * 0.08}>
            <TiltCard className="group/card h-full border-border/80 bg-card/80 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan/40 hover:shadow-[0_18px_50px_-28px_color-mix(in_oklab,var(--cyan)_55%,transparent)]">
              <div className="mb-6 flex items-center justify-between">
                <motion.div whileInView={s.anim} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.2, duration: 0.8 }} className="relative inline-flex rounded-xl border border-cyan/25 bg-cyan/[0.09] p-3 text-cyan shadow-[0_0_24px_-12px_var(--cyan)]">
                  <span className="pointer-events-none absolute inset-0 rounded-xl bg-cyan/10 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
                  <s.i size={22} className="relative" />
                </motion.div>
                <span className="num text-xs font-bold tracking-[0.14em] text-dim">0{i + 1}</span>
              </div>
              <h3 className="font-bold transition-colors group-hover/card:text-cyan">{s.t}</h3>
              <p className="mt-2 min-h-10 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              <div className="mt-5 flex items-center gap-2 border-t border-border/70 pt-4 text-[10px] font-bold tracking-[0.12em] text-dim">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                CONCEPTUAL LAYER
              </div>
            </TiltCard>
          </Reveal>
        ))}
        </div>
      </div>
    </section>
  );
}

export function OnboardingSteps() {
  const st = [
    { n: "01", i: UserPlus, t: "Create Account", d: "Register in seconds — no real identity required." },
    { n: "02", i: Search, t: "Explore Markets", d: "Scan 300+ simulated pairs and study the charts." },
    { n: "03", i: MousePointerClick, t: "Execute Paper Trade", d: "Place spot or futures orders with simulated balance." },
  ];
  return (
    <section className={cn(wrap, "py-20")}>
      <SectionHead center eyebrow="ONBOARDING" title="Start Trading in 3 Simple Steps" />
      <div className="relative grid gap-6 md:grid-cols-3">
        <div className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-border md:block">
          <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, delay: 0.3, ease: "easeInOut" }} className="h-full origin-left bg-gradient-brand" />
        </div>
        {st.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.5} className="relative text-center">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-card text-primary shadow-[0_0_30px_-10px_var(--primary)]"><s.i size={24} /></div>
            <div className="num mt-4 text-xs font-bold text-primary">{s.n}</div>
            <h3 className="mt-1 text-lg font-bold">{s.t}</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">{s.d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function DeviceSection() {
  const [modal, setModal] = useState<string | null>(null);
  const btc = useAsset("BTC");
  const eth = useAsset("ETH");
  return (
    <section className={cn(wrap, "py-16 md:py-20")}>
      <div className="relative overflow-hidden rounded-[28px] border border-border bg-[#08110f] px-5 py-8 sm:px-8 md:px-10 md:py-12 lg:px-14">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_70%_50%,rgba(0,232,135,0.08),transparent_70%)]" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
          <div className="min-w-0">
            <div className="text-xs font-bold tracking-[0.12em] text-primary">TRADE ANYWHERE, ANYTIME</div>
            <h2 className="mt-4 max-w-xl text-3xl font-black leading-tight sm:text-4xl">Trade on Any Device with Full Power</h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Access your trading terminal, market charts, and portfolio tools across iOS, Android, macOS, and Windows.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <MagneticButton variant="ghost" onClick={() => setModal("iOS")} className="min-w-[150px] flex-1 justify-start gap-3 px-3.5 py-3 text-left sm:flex-none">
                <Apple size={23} className="shrink-0 text-primary" />
                <span><span className="block text-[9px] font-medium uppercase tracking-wider text-dim">Download for</span><span className="block text-sm">App Store / iOS</span></span>
              </MagneticButton>
              <MagneticButton variant="ghost" onClick={() => setModal("Android")} className="min-w-[150px] flex-1 justify-start gap-3 px-3.5 py-3 text-left sm:flex-none">
                <Smartphone size={22} className="shrink-0 text-primary" />
                <span><span className="block text-[9px] font-medium uppercase tracking-wider text-dim">Download for</span><span className="block text-sm">Android APK</span></span>
              </MagneticButton>
              <MagneticButton variant="ghost" onClick={() => setModal("Desktop")} className="min-w-[150px] flex-1 justify-start gap-3 px-3.5 py-3 text-left sm:flex-none">
                <Monitor size={22} className="shrink-0 text-primary" />
                <span><span className="block text-[9px] font-medium uppercase tracking-wider text-dim">Desktop client</span><span className="block text-sm">Windows &amp; Mac</span></span>
              </MagneticButton>
            </div>
          </div>

          <Reveal className="min-w-0">
            <div className="grid items-center gap-7 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="relative mx-auto w-full max-w-[420px] pb-10 pr-[8%]" aria-label="Nexora trading app on desktop and mobile">
                <div className="rounded-xl border border-white/10 bg-[#0d171b] p-3 shadow-2xl sm:p-4">
                  <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2"><span className="text-sm font-black text-primary">N</span><span className="text-[10px] font-bold tracking-widest text-muted-foreground">NEXORA</span></div>
                    <span className="text-[9px] text-dim">MARKETS　 TRADE　 WALLET</span>
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <div><div className="text-[10px] text-muted-foreground">BTC / USDT</div><div className="num mt-1 text-lg font-bold text-primary">{fmtPrice(btc.price)}</div></div>
                    <div className="text-right"><div className="text-[9px] text-dim">24H CHANGE</div><div className="num text-xs text-primary">+2.84%</div></div>
                  </div>
                  <div className="mt-2"><Sparkline data={btc.sparkline} w={380} h={86} positive /></div>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">{["ETH", "SOL", "XRP"].map((symbol, index) => <div key={symbol} className="rounded-md bg-white/[0.035] px-2 py-1.5"><div className="text-[8px] text-dim">{symbol}/USDT</div><div className={`num mt-1 text-[9px] ${index === 1 ? "text-destructive" : "text-primary"}`}>{index === 0 ? fmtPrice(eth.price) : index === 1 ? "$182.40" : "$0.62"}</div></div>)}</div>
                </div>
                <div className="mx-auto h-3 w-[24%] bg-[#182328]" />
                <div className="mx-auto h-2 w-[38%] rounded-b-md bg-[#243238]" />

                <div className="absolute bottom-0 right-0 w-[29%] min-w-[92px] max-w-[126px] rounded-[1.35rem] border border-white/15 bg-[#05090c] p-1.5 shadow-2xl sm:p-2" style={{ animation: "floaty 5s ease-in-out infinite reverse" }}>
                  <div className="rounded-[1rem] bg-[#0b1418] px-2 pb-2 pt-1.5">
                    <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-white/15" />
                    <div className="flex items-center justify-between"><span className="text-[8px] font-bold text-primary">NEXORA</span><span className="text-[7px] text-dim">•••</span></div>
                    <div className="mt-3 text-[8px] text-muted-foreground">BTC/USDT</div>
                    <div className="num mt-0.5 text-[11px] font-bold">{fmtPrice(btc.price)}</div>
                    <div className="mt-1"><Sparkline data={eth.sparkline} w={104} h={38} positive /></div>
                    <div className="mt-1.5 grid grid-cols-2 gap-1"><div className="rounded bg-primary py-1 text-center text-[7px] font-bold text-primary-foreground">BUY</div><div className="rounded bg-destructive py-1 text-center text-[7px] font-bold">SELL</div></div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-self-center sm:justify-self-auto">
                <MockAppQr platform="App" />
                <div className="mt-3 text-center">
                  <div className="text-xs font-bold">Scan to Install App</div>
                  <div className="mt-1 text-[11px] text-dim">Compatible with iOS &amp; Android</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={`${modal} app`}>
        {modal === "iOS" || modal === "Android" ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Scan this mock code with your {modal === "iOS" ? "iPhone" : "Android device"} camera.</p>
            <MockAppQr platform={modal} />
            <p className="text-xs text-muted-foreground">Preview only. The app is not available for download yet.</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">There is no real {modal} app to download here.</p>
        )}
        <button onClick={() => { setModal(null); toast.info("Added to waitlist"); }} className="mt-5 w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground">Join waitlist</button>
      </Modal>
    </section>
  );
}

export function NewsCard({ n }: { n: (typeof news)[number] }) {
  return (
    <Link to="/news" className="group block h-full overflow-hidden rounded-xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_50px_-30px_var(--primary)]" data-cursor="card">
      <div className="relative h-48 overflow-hidden border-b border-border bg-surface">
        <img src={n.image} alt={n.title} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-background/20" />
        <div className="absolute -bottom-10 left-10 h-40 w-40 rounded-full blur-3xl transition-transform duration-500 group-hover:translate-x-2" style={{ background: n.hue }} />
        <span className="absolute left-4 top-4 rounded border border-white/15 bg-background/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur">{n.cat}</span>
        <span className="absolute bottom-4 left-4 text-[10px] font-bold tracking-[0.12em] text-white/80">NEXORA JOURNAL</span>
      </div>
      <div className="p-5 transition-transform duration-300 group-hover:-translate-y-0.5">
        <time className="text-xs font-medium text-dim">{n.date}</time>
        <h3 className="mt-2 text-lg font-bold leading-snug">{n.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{n.excerpt}</p>
        <div className="mt-5 flex items-center gap-2 text-sm font-bold text-primary">Read story <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></div>
      </div>
    </Link>
  );
}
export function NewsSection() {
  return (
    <section className={cn(wrap, "py-20")}>
      <SectionHead eyebrow="NEWSROOM" title="Latest from NEXORA" />
      <div className="grid gap-4 md:grid-cols-3">{news.slice(0, 3).map((n, i) => <Reveal key={n.title} delay={i * 0.08}><NewsCard n={n} /></Reveal>)}</div>
    </section>
  );
}

const faqs = [
  ["Is NEXORA EXCHANGE a real exchange?", "No. All prices, balances, orders and statistics are simulated."],
  ["Can I deposit real crypto?", "No. Deposit addresses are placeholders. Never send real funds to any address shown here."],
  ["How are prices generated?", "A local mock engine applies controlled random variation to seed prices every few seconds."],
  ["What does 100x leverage mean here?", "It shows how a leverage selector and liquidation calculations could look. No positions are real."],
  ["Is my KYC data stored?", "No documents are uploaded or stored. The KYC flow is purely visual."],
];
export function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 md:px-6">
      <SectionHead center eyebrow="FAQ" title="Frequently Asked Questions" />
      <div className="space-y-3">
        {faqs.map(([q, a], i) => (
          <Reveal key={q} delay={i * 0.05} className="panel overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold">
              {q}<motion.span animate={{ rotate: open === i ? 180 : 0 }} className="shrink-0 text-muted-foreground"><ChevronDown size={18} /></motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                  <p className="px-5 pb-5 text-sm text-muted-foreground">{a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function CustomerServiceSection() {
  return (
    <section className="border-y border-border bg-surface">
      <div className={cn(wrap, "flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center md:py-12")}>
        <div className="max-w-xl">
          <div className="mb-2 text-xs font-bold tracking-[0.18em] text-primary">CUSTOMER SERVICE</div>
          <h2 className="text-2xl font-black">Questions about your account or trades?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Reach our support team for help with the NEXORA demo experience.</p>
        </div>
        <SupportEntryButton className="inline-flex shrink-0 items-center gap-2 rounded-md border border-primary/30 bg-primary/[0.08] px-5 py-3 text-sm font-bold text-primary transition hover:border-primary/60 hover:bg-primary/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan">
          <Headset size={17} aria-hidden="true" />
          Contact Support
        </SupportEntryButton>
      </div>
    </section>
  );
}

export function useTick(ms: number) {
  const [t, setT] = useState(0);
  useEffect(() => { const i = setInterval(() => setT((x) => x + 1), ms); return () => clearInterval(i); }, [ms]);
  return t;
}
