import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ShieldCheck, Mail, ArrowRight, TrendingUp, Zap, Layers, Rocket, Pickaxe, Lock, KeyRound, Network, Activity, Apple, Smartphone, Monitor, ChevronDown, UserPlus, Search, MousePointerClick } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fmtPrice, useAsset } from "@/lib/market";
import { AnimatedNumber, MagneticButton, Modal, Reveal, SectionHead, TiltCard, useFinePointer, SimulatedBadge } from "./motion";
import { MarketTable, OrderBook, Sparkline, TimeframeTabs } from "./market";
import { news } from "@/lib/content";

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
        <motion.div style={{ y: yText }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-bold tracking-wider text-primary">
            <ShieldCheck size={14} /> SIMULATED PROOF-OF-RESERVES INTERFACE
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8, delay: 0.1 }} className="mt-6 text-[2.6rem] font-black leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
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
        <motion.div style={{ y: yWidget, x: wx }} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}>
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
      <div className="flex items-end justify-between gap-4 py-5">
        <div>
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
  { i: Layers, t: "Spot & Margin", d: "Deep simulated books across 300+ pairs with limit, market and stop orders.", to: "/trade/BTC-USDT" },
  { i: Zap, t: "Perpetual Futures", d: "Paper-trade perpetuals up to 100x with cross and isolated margin modes.", to: "/futures" },
  { i: Pickaxe, t: "Mining & Earn", d: "Explore yield products with transparent terms and capacity.", to: "/earn" },
  { i: Rocket, t: "Token Launchpad", d: "Browse simulated token launches and subscription mechanics.", to: "/launchpad" },
];
export function Ecosystem() {
  return (
    <section className={cn(wrap, "py-20")}>
      <SectionHead eyebrow="ECOSYSTEM" title="Built for Retail & Institutional Traders" desc="One interface for every trading workflow — simulated end to end." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {eco.map((e, i) => (
          <Reveal key={e.t} delay={i * 0.08}>
            <a href={e.to}>
              <TiltCard className="h-full p-6">
                <div className="mb-5 inline-flex rounded-xl border border-primary/20 bg-primary/10 p-3 text-primary transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-[-4deg]"><e.i size={22} /></div>
                <h3 className="text-lg font-bold">{e.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{e.d}</p>
                <div className="mt-6 flex items-center gap-1 text-sm font-bold text-primary">Explore <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></div>
              </TiltCard>
            </a>
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
      <div className="panel grid items-center gap-10 p-6 md:grid-cols-[1fr_1.4fr] md:p-10">
        <Reveal><Ring pct={100} label="RATIO" /></Reveal>
        <div>
          <Reveal><div className="flex items-center gap-2"><SimulatedBadge>SIMULATED</SimulatedBadge></div><h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Transparent by Design</h2><p className="mt-3 text-muted-foreground">How a reserve-transparency dashboard could look. Nothing here reflects real assets or audits.</p></Reveal>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {items.map(([v, l], i) => (
              <Reveal key={l} delay={i * 0.08} className="rounded-xl border border-border bg-surface p-4"><div className="text-xl font-black text-gradient">{v}</div><div className="mt-1 text-xs text-muted-foreground">{l}</div><div className="mt-2 text-[10px] font-bold text-warning">SIMULATED</div></Reveal>
            ))}
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
    <section className={cn(wrap, "py-20")}>
      <SectionHead eyebrow="SECURITY ARCHITECTURE" title="Enterprise Protection" desc="Layered security concepts with no real certifications claimed." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sec.map((s, i) => (
          <Reveal key={s.t} delay={i * 0.08}>
            <TiltCard className="h-full p-6">
              <motion.div whileInView={s.anim} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.2, duration: 0.8 }} className="mb-5 inline-flex rounded-xl border border-cyan/20 bg-cyan/10 p-3 text-cyan"><s.i size={22} /></motion.div>
              <h3 className="font-bold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </TiltCard>
          </Reveal>
        ))}
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
  return (
    <section className={cn(wrap, "py-20")}>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHead eyebrow="MULTI-PLATFORM" title="Trade Anywhere, Anytime" desc="A consistent terminal experience across desktop, tablet and mobile." />
          <Reveal className="flex flex-wrap gap-3">
            <MagneticButton variant="ghost" onClick={() => setModal("iOS")}><Apple size={16} />Download iOS</MagneticButton>
            <MagneticButton variant="ghost" onClick={() => setModal("Android")}><Smartphone size={16} />Download Android</MagneticButton>
            <MagneticButton variant="ghost" onClick={() => setModal("Desktop")}><Monitor size={16} />Desktop App</MagneticButton>
          </Reveal>
        </div>
        <Reveal className="relative h-[340px] md:h-[400px]">
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute left-0 top-6 w-[82%] animate-floaty rounded-xl border border-border bg-card p-3 shadow-2xl">
            <div className="mb-2 flex gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive/60" /><span className="h-2 w-2 rounded-full bg-warning/60" /><span className="h-2 w-2 rounded-full bg-primary/60" /></div>
            <div className="num text-xs text-muted-foreground">BTC/USDT</div><div className="num text-xl font-bold text-primary">{fmtPrice(btc.price)}</div>
            <Sparkline data={btc.sparkline} w={420} h={130} positive />
            <div className="mt-2 grid grid-cols-3 gap-2">{[1, 2, 3].map((k) => <div key={k} className="h-8 rounded bg-elevated" />)}</div>
          </div>
          <div className="absolute bottom-0 right-0 w-[34%] rounded-[1.6rem] border border-border bg-surface p-2.5 shadow-2xl" style={{ animation: "floaty 5s ease-in-out infinite reverse" }}>
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-border" />
            <div className="num text-[10px] text-muted-foreground">ETH/USDT</div>
            <div className="h-24"><Sparkline data={useAsset("ETH").sparkline} w={120} h={90} /></div>
            <div className="mt-2 grid grid-cols-2 gap-1"><div className="h-6 rounded bg-primary/80" /><div className="h-6 rounded bg-destructive/80" /></div>
          </div>
        </Reveal>
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={`${modal} app`}>
        <p className="text-sm text-muted-foreground">There is no real {modal} app to download here.</p>
        <button onClick={() => { setModal(null); toast.info("Added to waitlist"); }} className="mt-5 w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground">Join waitlist</button>
      </Modal>
    </section>
  );
}

export function NewsCard({ n }: { n: (typeof news)[number] }) {
  return (
    <Link to="/news" className="group block h-full panel overflow-hidden transition hover:-translate-y-1 hover:border-primary/30" data-cursor="card">
      <div className="relative h-36 overflow-hidden border-b border-border bg-surface">
        <div className="grid-bg absolute inset-0 opacity-60 transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute -bottom-10 left-10 h-40 w-40 rounded-full blur-3xl transition-transform duration-500 group-hover:translate-x-2" style={{ background: n.hue }} />
        <span className="absolute left-4 top-4 rounded border border-border bg-background/70 px-2 py-0.5 text-[10px] font-bold tracking-wider text-muted-foreground">{n.cat.toUpperCase()}</span>
      </div>
      <div className="p-5 transition-transform duration-300 group-hover:-translate-y-0.5">
        <div className="text-xs text-dim">{n.date}</div>
        <h3 className="mt-2 font-bold leading-snug">{n.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{n.excerpt}</p>
        <div className="mt-4 flex items-center gap-1 text-sm font-bold text-primary">Read <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></div>
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

export function useTick(ms: number) {
  const [t, setT] = useState(0);
  useEffect(() => { const i = setInterval(() => setT((x) => x + 1), ms); return () => clearInterval(i); }, [ms]);
  return t;
}
