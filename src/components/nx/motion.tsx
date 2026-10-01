import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion, animate } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function useFinePointer() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    setOk(m.matches);
    const f = () => setOk(m.matches);
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  return ok;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function Reveal({ children, className, delay = 0, y = 40 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const rm = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={rm ? { opacity: 0 } : { opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

export function MagneticButton({
  children, className, onClick, variant = "brand", type = "button", disabled,
}: { children: ReactNode; className?: string; onClick?: () => void; variant?: "brand" | "ghost" | "green" | "red"; type?: "button" | "submit"; disabled?: boolean }) {
  const fine = useFinePointer();
  const x = useSpring(useMotionValue(0), { stiffness: 250, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 250, damping: 18 });
  const move = (e: MouseEvent<HTMLButtonElement>) => {
    if (!fine) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set(((e.clientX - r.left) / r.width - 0.5) * 8);
    y.set(((e.clientY - r.top) / r.height - 0.5) * 6);
  };
  const styles = {
    brand: "bg-gradient-brand text-primary-foreground shadow-[0_8px_30px_-8px_var(--primary)] shine",
    green: "bg-primary text-primary-foreground hover:shadow-[0_8px_30px_-10px_var(--primary)]",
    red: "bg-destructive text-destructive-foreground hover:shadow-[0_8px_30px_-10px_var(--destructive)]",
    ghost: "border border-border bg-elevated text-foreground hover:border-primary/40 hover:shadow-[0_0_20px_-8px_var(--primary)]",
  }[variant];
  return (
    <motion.button
      type={type}
      disabled={disabled}
      data-cursor="button"
      style={{ x, y }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseMove={move}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      onClick={onClick}
      className={cn("group inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold transition-shadow disabled:opacity-60", styles, className)}
    >
      {children}
    </motion.button>
  );
}

export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const fine = useFinePointer();
  const rx = useSpring(0, { stiffness: 200, damping: 20 });
  const ry = useSpring(0, { stiffness: 200, damping: 20 });
  const tx = useSpring(0, { stiffness: 200, damping: 20 });
  const ty = useSpring(0, { stiffness: 200, damping: 20 });
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  return (
    <motion.div
      data-cursor="card"
      style={{ rotateX: rx, rotateY: ry, x: tx, y: ty, transformPerspective: 900 }}
      onMouseMove={(e) => {
        if (!fine) return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry.set(px * 6); rx.set(-py * 6); tx.set(px * 6); ty.set(py * 6);
        setGlow({ x: (px + 0.5) * 100, y: (py + 0.5) * 100 });
      }}
      onMouseLeave={() => { rx.set(0); ry.set(0); tx.set(0); ty.set(0); }}
      className={cn("group relative overflow-hidden panel transition-colors hover:border-primary/30", className)}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(400px circle at ${glow.x}% ${glow.y}%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 60%)` }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

export function AnimatedNumber({ value, format, className, once = false }: { value: number; format: (n: number) => string; className?: string; once?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(once ? 0 : value);
  const done = useRef(false);
  const [dir, setDir] = useState<"up" | "down" | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (once && done.current) { el.textContent = format(value); return; }
    const from = prev.current;
    if (!once && from !== value) setDir(value > from ? "up" : "down");
    const c = animate(from, value, { duration: once ? 1.4 : 0.6, ease: "easeOut", onUpdate: (v) => (el.textContent = format(v)) });
    prev.current = value;
    done.current = true;
    const t = setTimeout(() => setDir(null), 900);
    return () => { c.stop(); clearTimeout(t); };
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return <span ref={ref} className={cn("num rounded-sm", dir === "up" && "flash-up", dir === "down" && "flash-down", className)}>{format(once ? 0 : value)}</span>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-md", className)} />;
}

export function useFakeLoad(ms = 700) {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), ms); return () => clearTimeout(t); }, [ms]);
  return loading;
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/70 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal
            initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.25, ease }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border bg-elevated p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">{title}</h3>
              <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"><X size={18} /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SimulatedBadge({ children = "LIVE" }: { children?: ReactNode }) {
  return <span className="rounded border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-warning">{children}</span>;
}

export function SectionHead({ eyebrow, title, desc, center }: { eyebrow?: string; title: ReactNode; desc?: string; center?: boolean }) {
  return (
    <Reveal className={cn("mb-10", center && "text-center")}>
      {eyebrow && <div className="mb-3 text-xs font-bold tracking-[0.2em] text-primary">{eyebrow}</div>}
      <h2 className="text-3xl font-black tracking-tight md:text-5xl">{title}</h2>
      {desc && <p className={cn("mt-4 max-w-2xl text-muted-foreground md:text-lg", center && "mx-auto")}>{desc}</p>}
    </Reveal>
  );
}

export function PageHeader({ title, desc, children }: { title: ReactNode; desc?: string; children?: ReactNode }) {
  return (
    <div className="relative overflow-hidden border-b border-border">
      <div className="grid-bg absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <Reveal>
          <h1 className="text-3xl font-black tracking-tight md:text-5xl">{title}</h1>
          {desc && <p className="mt-3 max-w-2xl text-muted-foreground">{desc}</p>}
          {children}
        </Reveal>
      </div>
    </div>
  );
}
