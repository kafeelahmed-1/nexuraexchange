import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import {
  Home,
  BarChart3,
  CandlestickChart,
  Coins,
  User,
  Menu,
  X,
  Gift,
  LogIn,
  LogOut,
  Megaphone,
  Send,
  Mail,
  ShieldCheck,
  Headset,
  Bell,
  BellRing,
  CheckCheck,
  CircleDollarSign,
  Command,
  Search,
  Shield,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fmtPrice, useMarkets } from "@/lib/market";
import { CoinIcon, Change } from "./market";
import { useFinePointer } from "./motion";
import { SupportEntryButton } from "./support";
import { MockAppQr } from "./app-qr";
import { supportConfig, supportMailto } from "@/lib/support";
import { logoutDemoUser, useDemoUser } from "@/lib/demo-auth";
import { clearNotification, markAllNotificationsRead, markNotificationRead, useLocalFeatures } from "@/lib/local-features";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2", className)}>
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden>
        <defs>
          <linearGradient id="lg" x1="0" x2="1">
            <stop offset="0" stopColor="var(--primary)" />
            <stop offset="1" stopColor="var(--cyan)" />
          </linearGradient>
        </defs>
        <path
          d="M5 27V5l11 13V5M16 27l11-11M20 5h7v7"
          stroke="url(#lg)"
          strokeWidth="3.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-lg font-black tracking-tight">
        NEXORA
        <span className="ml-1 text-xs font-bold tracking-[0.2em] text-muted-foreground">
          EXCHANGE
        </span>
      </span>
    </Link>
  );
}

export function StatusBar() {
  return (
    <div className="hidden border-b border-border bg-surface text-[11px] text-dim md:block">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-6 py-1.5">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex shrink-0 items-center gap-1.5 font-semibold text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Matching Engine: 99.99% Operational
          </span>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <span className="hidden min-w-0 items-center gap-2 truncate sm:flex">
            <Megaphone size={13} className="shrink-0 text-primary" />
            Zero-Fee Maker Promotion is now active across all major pairs!
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-6">
          <span className="hidden sm:inline">24h Vol: <strong className="num text-foreground">$2,489,120,400</strong></span>
          <span>Reserves: <strong className="text-primary">100% Backed</strong></span>
        </div>
      </div>
    </div>
  );
}

const links = [
  { to: "/markets", label: "Markets" },
  { to: "/trade/$pair", label: "Spot", params: { pair: "BTC-USDT" } },
  { to: "/futures", label: "Futures", badge: "100X" },
  { to: "/earn", label: "Earn" },
  { to: "/launchpad", label: "Launchpad" },
  { to: "/news", label: "News" },
  { to: "/fees", label: "Fees" },
] as const;

export function MainNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useDemoUser();
  const navigate = useNavigate();
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 20);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => setOpen(false), [path]);
  const active = (to: string) =>
    to === "/trade/$pair" ? path.startsWith("/trade") : path.startsWith(to);
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-border bg-background/85 backdrop-blur-xl"
          : "border-transparent bg-background/40 backdrop-blur-sm",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-300 md:px-6",
          scrolled ? "h-14" : "h-16",
        )}
      >
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              params={("params" in l ? l.params : {}) as never}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors",
                active(l.to) ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
              {"badge" in l && (
                <span className="rounded bg-cyan px-1 text-[9px] font-black text-primary-foreground">
                  {l.badge}
                </span>
              )}
              {active(l.to) && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-gradient-brand"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <button type="button" onClick={() => window.dispatchEvent(new Event("nexora:open-command"))} aria-label="Global search" title="Search (Ctrl+K)" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-foreground"><Search size={15} />Search <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px]">Ctrl K</kbd></button>
          <NotificationCenter />
          {user ? (
            <>
              <Link
                to="/account"
                title={user.email}
                className="flex max-w-44 items-center gap-1.5 truncate rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
              >
                <User size={15} />
                <span className="truncate">{user.name || user.email}</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logoutDemoUser();
                  void navigate({ to: "/" });
                }}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
              >
                <LogOut size={15} />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
              >
                <LogIn size={15} />
                Log in
              </Link>
              <Link
                to="/register"
                className="shine flex items-center gap-1.5 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-bold text-primary-foreground"
              >
                <Gift size={15} />
                Claim Bonus
              </Link>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("nexora:open-command"))}
          className="ml-auto rounded-md p-2 text-muted-foreground lg:hidden"
          aria-label="Global search"
        ><Search size={19} /></button>
        <NotificationCenter compact />
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-md p-2 text-muted-foreground lg:hidden"
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-background lg:hidden"
          >
            <div className="grid gap-1 p-4">
              {links.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  params={("params" in l ? l.params : {}) as never}
                  className="rounded-md px-3 py-2.5 font-semibold text-muted-foreground hover:bg-elevated hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/security"
                className="rounded-md px-3 py-2.5 font-semibold text-muted-foreground hover:bg-elevated"
              >
                Security
              </Link>
              <SupportEntryButton className="flex items-center gap-2 rounded-md px-3 py-2.5 text-left font-semibold text-muted-foreground hover:bg-elevated hover:text-foreground">
                <Headset size={16} />
                Support
              </SupportEntryButton>
              {user ? (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link to="/account" className="rounded-lg border border-border py-2.5 text-center font-semibold">
                    {user.name || "Account"}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logoutDemoUser();
                      void navigate({ to: "/" });
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg border border-border py-2.5 font-semibold"
                  >
                    <LogOut size={15} /> Log out
                  </button>
                </div>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    className="rounded-lg border border-border py-2.5 text-center font-semibold"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg bg-gradient-brand py-2.5 text-center font-bold text-primary-foreground"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      <CommandPalette />
    </header>
  );
}

function NotificationCenter({ compact = false }: { compact?: boolean }) {
  const { notifications } = useLocalFeatures();
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((item) => !item.read).length;
  const icons = { price: BellRing, order: CheckCheck, deposit: CircleDollarSign, trading: TrendingUp, security: Shield, system: Bell };
  return (
    <div className={compact ? "lg:hidden" : "hidden lg:block"}>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} aria-expanded={open} className="relative rounded-lg border border-border p-2 text-muted-foreground transition hover:border-primary/30 hover:text-foreground"><Bell size={17} />{unread > 0 && <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-black text-primary-foreground">{unread}</span>}</button>
      {open && <div className="fixed right-3 top-16 z-[90] flex max-h-[min(70vh,560px)] w-[min(390px,calc(100vw-24px))] flex-col border border-border bg-background shadow-2xl sm:right-6"><div className="flex items-center justify-between border-b border-border px-4 py-3"><div><h2 className="text-sm font-bold">Notifications</h2><p className="text-[10px] text-dim">{unread} unread</p></div><div className="flex items-center gap-3"><button onClick={markAllNotificationsRead} disabled={unread === 0} className="text-[11px] font-semibold text-primary disabled:text-dim">Mark all read</button><button aria-label="Close notifications" onClick={() => setOpen(false)} className="p-1 text-dim hover:text-foreground">×</button></div></div><div className="min-h-0 overflow-y-auto">{notifications.map((item) => { const Icon = icons[item.type]; return <div key={item.id} className={`flex gap-3 border-b border-border px-4 py-3 ${item.read ? "" : "bg-primary/[0.035]"}`}><Icon size={16} className={`mt-0.5 shrink-0 ${item.type === "security" ? "text-warning" : "text-primary"}`} /><button className="min-w-0 flex-1 text-left" onClick={() => markNotificationRead(item.id)}><span className="block text-xs font-bold">{item.title}{!item.read && <span className="ml-2 inline-block size-1.5 rounded-full bg-primary align-middle" />}</span><span className="mt-1 block text-[11px] leading-relaxed text-muted-foreground">{item.description}</span><time className="mt-1 block text-[10px] text-dim">{new Date(item.createdAt).toLocaleString()}</time></button><button aria-label="Clear notification" onClick={() => clearNotification(item.id)} className="h-fit p-1 text-dim hover:text-destructive"><Trash2 size={13} /></button></div>; })}{notifications.length === 0 && <div className="px-5 py-10 text-center"><Bell size={20} className="mx-auto text-dim" /><p className="mt-3 text-sm font-semibold">You're all caught up</p><p className="mt-1 text-xs text-muted-foreground">Price alerts and demo activity will appear here.</p></div>}</div></div>}
    </div>
  );
}

function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const markets = useMarkets();
  const navigate = useNavigate();
  useEffect(() => {
    const show = () => { setOpen(true); setQuery(""); setSelected(0); };
    const keys = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); show(); }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("nexora:open-command", show);
    window.addEventListener("keydown", keys);
    return () => { window.removeEventListener("nexora:open-command", show); window.removeEventListener("keydown", keys); };
  }, []);
  const staticItems = [
    { title: "Dashboard", detail: "Overview", to: "/account" },
    { title: "Markets", detail: "Browse simulated markets", to: "/markets" },
    { title: "Trade", detail: "Open spot terminal", to: "/trade/BTC-USDT" },
    { title: "Wallet", detail: "Demo portfolio", to: "/account#assets" },
    { title: "Orders", detail: "Order history", to: "/account#orders" },
    { title: "Settings", detail: "Demo profile", to: "/account#profile" },
    { title: "Account", detail: "Account overview", to: "/account" },
  ];
  const matchingMarkets = markets.filter((asset) => `${asset.symbol} ${asset.name} ${asset.symbol}/USDT`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6).map((asset) => ({ title: `${asset.symbol}/USDT`, detail: `${asset.name} · ${fmtPrice(asset.price)}`, to: `/trade/${asset.symbol}-USDT` }));
  const results = [...staticItems, ...matchingMarkets].filter((item) => !query.trim() || `${item.title} ${item.detail}`.toLowerCase().includes(query.trim().toLowerCase()));
  useEffect(() => setSelected((value) => Math.min(value, Math.max(0, results.length - 1))), [results.length]);
  const go = (to: string) => { setOpen(false); void navigate({ to: to as never }); };
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") { event.preventDefault(); setSelected((value) => Math.min(value + 1, results.length - 1)); }
    if (event.key === "ArrowUp") { event.preventDefault(); setSelected((value) => Math.max(0, value - 1)); }
    if (event.key === "Enter" && results[selected]) go(results[selected].to);
  };
  if (!open) return null;
  return <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/65 px-3 pt-[12vh] backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><div role="dialog" aria-modal="true" aria-label="Search Nexora" className="w-full max-w-xl overflow-hidden border border-border bg-background shadow-2xl"><div className="flex items-center gap-3 border-b border-border px-4"><Search size={18} className="text-primary" /><input autoFocus value={query} onChange={(event) => { setQuery(event.target.value); setSelected(0); }} onKeyDown={onKeyDown} placeholder="Search markets, pages, assets..." className="min-h-14 min-w-0 flex-1 bg-transparent text-sm outline-none" /><kbd className="rounded border border-border px-1.5 py-1 text-[10px] text-dim">ESC</kbd></div><div className="max-h-[min(55vh,420px)] overflow-y-auto p-2">{results.map((item, index) => <button key={`${item.title}-${item.to}`} onMouseEnter={() => setSelected(index)} onClick={() => go(item.to)} className={`flex min-h-12 w-full items-center gap-3 rounded px-3 py-2 text-left ${selected === index ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-elevated"}`}><Command size={15} className="shrink-0 text-primary" /><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.title}</span><span className="block truncate text-[10px] text-dim">{item.detail}</span></span><span className="text-xs text-dim">↵</span></button>)}{results.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">No results for “{query}”.</p>}</div><div className="flex justify-between border-t border-border px-4 py-2 text-[10px] text-dim"><span>Search Nexora</span><span>↑↓ Navigate · Enter Select</span></div></div></div>;
}

export function MarketTicker() {
  const all = useMarkets();
  const items = all.slice(0, 16);
  return (
    <div className="ticker-wrap overflow-hidden border-b border-border bg-surface/60">
      <div className="animate-ticker flex w-max">
        {[...items, ...items].map((a, i) => (
          <Link
            key={i}
            to="/trade/$pair"
            params={{ pair: `${a.symbol}-USDT` }}
            className="flex shrink-0 items-center gap-2.5 px-6 py-2.5 text-sm hover:bg-elevated"
          >
            <CoinIcon a={a} size={18} />
            <span className="font-bold">{a.symbol}/USDT</span>
            <TickPrice v={a.price} />
            <Change v={a.change24h} />
          </Link>
        ))}
      </div>
    </div>
  );
}
function TickPrice({ v }: { v: number }) {
  const prev = useRef(v);
  const [c, setC] = useState("");
  useEffect(() => {
    if (v !== prev.current) {
      setC(v > prev.current ? "flash-up" : "flash-down");
      prev.current = v;
      const t = setTimeout(() => setC(""), 900);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [v]);
  return (
    <span key={v} className={cn("num rounded px-1 text-foreground", c)}>
      {fmtPrice(v)}
    </span>
  );
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return (
    <motion.div
      style={{ scaleX: x }}
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-brand"
    />
  );
}

const steps = [
  "Initializing market engine...",
  "Loading market data...",
  "Preparing trading interface...",
  "Securing session...",
  "Interface ready.",
];
export function PageLoader() {
  const [show, setShow] = useState(false);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (sessionStorage.getItem("nx-intro")) return;
    sessionStorage.setItem("nx-intro", "1");
    setShow(true);
    const iv = setInterval(() => setI((x) => Math.min(x + 1, steps.length - 1)), 380);
    const t = setTimeout(() => setShow(false), 1900);
    return () => {
      clearInterval(iv);
      clearTimeout(t);
    };
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        >
          <div className="grid-bg absolute inset-0 opacity-40 [mask-image:radial-gradient(circle,black,transparent_60%)]" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative drop-shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_50%,transparent)]"
          >
            <Logo className="pointer-events-none scale-150" />
          </motion.div>
          <div className="relative mt-10 text-sm font-semibold text-muted-foreground">
            Initializing Trading Interface
          </div>
          <div className="relative mt-4 h-[2px] w-64 overflow-hidden rounded-full bg-elevated">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.7, ease: "easeInOut" }}
              className="h-full bg-gradient-brand"
            />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="num relative mt-3 text-[11px] text-dim"
            >
              {steps[i]}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CustomCursor() {
  const fine = useFinePointer();
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return window.localStorage.getItem("nexora-animated-cursor") !== "off";
    } catch {
      return true;
    }
  });
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!fine || !enabled) return;
    let mx = -100,
      my = -100,
      rx = -100,
      ry = -100,
      raf = 0,
      mode = "";
    const move = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const t = (e.target as HTMLElement).closest("[data-cursor], a, button, input, img");
      mode = t
        ? (t as HTMLElement).dataset["cursor"] ||
          (t.tagName === "A"
            ? "link"
            : t.tagName === "BUTTON"
              ? "button"
              : t.tagName === "IMG"
                ? "img"
                : "")
        : "";
    };
    const loop = () => {
      rx += (mx - rx) * 0.28;
      ry += (my - ry) * 0.28;
      if (dot.current) dot.current.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
      if (ring.current) {
        const s = mode === "button" ? 1.7 : mode === "link" ? 0.6 : mode === "card" ? 1.3 : 1;
        ring.current.style.transform = `translate3d(${rx - 16}px, ${ry - 16}px, 0) scale(${s})`;
        ring.current.style.boxShadow =
          mode === "card"
            ? "0 0 24px color-mix(in oklab, var(--primary) 40%, transparent)"
            : "none";
        ring.current.style.borderColor = mode
          ? "var(--primary)"
          : "color-mix(in oklab, var(--cyan) 50%, transparent)";
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, [enabled, fine]);
  useEffect(() => {
    try {
      window.localStorage.setItem("nexora-animated-cursor", enabled ? "on" : "off");
    } catch {
      // Storage may be unavailable in private browsing.
    }
  }, [enabled]);
  if (!fine) return null;
  return (
    <>
      {enabled && (
        <>
          <div
            ref={dot}
            className="custom-cursor pointer-events-none fixed left-0 top-0 z-[90] h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)] will-change-transform"
          />
          <div
            ref={ring}
            className="custom-cursor pointer-events-none fixed left-0 top-0 z-[90] h-8 w-8 rounded-full border transition-[box-shadow,border-color] duration-200 will-change-transform"
          />
        </>
      )}
      <button
        type="button"
        aria-label={`${enabled ? "Disable" : "Enable"} animated cursor`}
        aria-pressed={enabled}
        title={`${enabled ? "Disable" : "Enable"} animated cursor`}
        onClick={() => setEnabled((value) => !value)}
        className="fixed bottom-[148px] right-4 z-[95] flex h-7 w-12 items-center rounded-full border border-border bg-elevated/90 p-1 shadow-lg backdrop-blur-md transition hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:bottom-20 md:right-6"
      >
        <span
          aria-hidden
          className={cn(
            "h-5 w-5 rounded-full transition-transform duration-200",
            enabled ? "translate-x-5 bg-gradient-brand" : "translate-x-0 bg-dim",
          )}
        />
      </button>
    </>
  );
}

const mob = [
  { to: "/", label: "Home", icon: Home },
  { to: "/markets", label: "Markets", icon: BarChart3 },
  { to: "/trade/$pair", label: "Trade", icon: CandlestickChart, params: { pair: "BTC-USDT" } },
  { to: "/earn", label: "Earn", icon: Coins },
  { to: "/account", label: "Account", icon: User },
] as const;
export function MobileNavbar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) =>
    to === "/"
      ? path === "/"
      : to === "/trade/$pair"
        ? path.startsWith("/trade") || path === "/futures"
        : path.startsWith(to);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      {mob.map((m) => {
        const a = isActive(m.to);
        return (
          <Link
            key={m.label}
            to={m.to}
            params={("params" in m ? m.params : {}) as never}
            className={cn(
              "relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors",
              a ? "text-foreground" : "text-dim",
            )}
          >
            {a && (
              <motion.span
                layoutId="mob-ind"
                className="absolute top-0 h-0.5 w-8 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]"
              />
            )}
            <m.icon
              size={20}
              className={a ? "text-primary drop-shadow-[0_0_6px_var(--primary)]" : ""}
            />
            {m.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Footer() {
  const cols = [
    {
      h: "Products",
      l: [
        ["Spot Trading", "/trade/BTC-USDT"],
        ["Perpetual Futures", "/futures"],
        ["Mining & Earn", "/earn"],
        ["Launchpad", "/launchpad"],
      ],
    },
    {
      h: "Platform",
      l: [
        ["Markets", "/markets"],
        ["Fees", "/fees"],
        ["Security", "/security"],
        ["News", "/news"],
      ],
    },
    {
      h: "Account",
      l: [
        ["Dashboard", "/account"],
        ["Deposit", "/deposit"],
        ["KYC", "/kyc"],
        ["Affiliate", "/affiliate"],
      ],
    },
  ];
  return (
    <footer className="relative mt-24 border-t border-border bg-surface pb-24 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-3 md:px-6 lg:grid-cols-[1.25fr_1fr_1fr_1fr_1fr_1.35fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            An institutional-grade trading interface with simulated data across every workflow.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={supportConfig.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
            >
              <Send size={16} />
              Telegram
            </a>
            <a
              href={supportMailto()}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
            >
              <Mail size={16} />
              Email
            </a>
          </div>
        </motion.div>
        {cols.map((c, i) => (
          <motion.div
            key={c.h}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 * (i + 1) }}
          >
            <div className="mb-4 text-sm font-bold">{c.h}</div>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {c.l.map(([n, h]) => (
                <li key={n}>
                  <a href={h} className="transition-colors hover:text-primary">
                    {n}
                  </a>
                </li>
              ))}
              {c.h === "Account" && (
                <li>
                  <SupportEntryButton className="transition-colors hover:text-primary">
                    Customer Support
                  </SupportEntryButton>
                </li>
              )}
            </ul>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.32 }}
        >
          <div className="flex flex-col items-start sm:items-center">
            <MockAppQr platform="App" align="start" />
            <div className="mt-3 max-w-[180px] text-left text-sm font-bold sm:text-center">Scan QR to Download the app Now</div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="mb-4 text-sm font-bold">Newsletter</div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Preferences saved");
              (e.target as HTMLFormElement).reset();
            }}
            className="flex gap-2"
          >
            <input
              required
              type="email"
              placeholder="you@example.com"
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary/60 focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_18%,transparent)]"
            />
            <button className="rounded-lg bg-primary px-3 text-sm font-bold text-primary-foreground">
              Join
            </button>
          </form>
        </motion.div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-dim md:flex-row md:justify-between md:px-6">
          <span>© 2026 NEXORA EXCHANGE — Not a real exchange.</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={13} />
            No real funds, licenses, reserves or customers are represented.
          </span>
        </div>
      </div>
    </footer>
  );
}
