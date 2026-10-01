import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles, X } from "lucide-react";

const helpTopics = [
  {
    question: "How do I start trading?",
    answer:
      "Create an account or log in, then open Markets and choose a pair. Spot and futures screens are paper-trading simulations, so orders and balances are not real-money transactions.",
    to: "/register",
    action: "Create account",
  },
  {
    question: "How can I earn from trading?",
    answer:
      "Visit Earn to explore the platform's yield products, or use Spot and Futures to practice market orders. This app is a paper-trading demo; returns are not guaranteed and no real assets are credited.",
    to: "/earn",
    action: "Explore Earn",
  },
  {
    question: "How does the $200 login bonus work?",
    answer:
      "The platform advertises a $200 login bonus. Log in or create an account to check the current offer and its terms. In this paper-trading demo, displayed bonuses and balances are not withdrawable real funds.",
    to: "/login",
    action: "Log in",
  },
  {
    question: "What is paper trading?",
    answer:
      "Paper trading lets you practice with simulated orders and balances. It does not place orders on a live exchange or guarantee profits.",
    to: "/markets",
    action: "Browse markets",
  },
] as const;

export function PlatformChatWidget() {
  const [open, setOpen] = useState(false);
  const [activeTopic, setActiveTopic] = useState<(typeof helpTopics)[number] | null>(null);
  const [visibleCharacters, setVisibleCharacters] = useState(0);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  useEffect(() => {
    if (!activeTopic) return;
    setVisibleCharacters(0);
    let typingTimer: number | undefined;
    const startTimer = window.setTimeout(() => {
      typingTimer = window.setInterval(() => {
        setVisibleCharacters((count) => {
          if (count >= activeTopic.answer.length) {
            if (typingTimer !== undefined) window.clearInterval(typingTimer);
            return count;
          }
          return count + 1;
        });
      }, 14);
    }, 260);

    return () => {
      window.clearTimeout(startTimer);
      if (typingTimer !== undefined) window.clearInterval(typingTimer);
    };
  }, [activeTopic]);

  const answerReady = activeTopic !== null && visibleCharacters >= activeTopic.answer.length;

  return (
    <div className="fixed bottom-[88px] right-4 z-[77] md:bottom-6 md:right-6">
      <AnimatePresence>
        {open && (
          <motion.section
            id="platform-chat-panel"
            role="dialog"
            aria-label="BR Trades platform guide"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-16 right-0 flex max-h-[min(70dvh,540px)] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#071015]/95 shadow-[0_28px_90px_-24px_rgba(0,0,0,0.9),0_0_40px_-25px_rgba(8,217,245,0.5)] backdrop-blur-xl"
          >
            <header className="relative flex items-center justify-between gap-3 border-b border-white/[0.08] bg-[linear-gradient(115deg,rgba(0,232,135,0.08),rgba(8,217,245,0.06)_48%,transparent)] px-4 py-3.5">
              <span className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src="/platform-bot.svg"
                  alt=""
                  aria-hidden="true"
                  className="size-14 shrink-0 object-contain"
                />
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan">
                    Platform assistant
                  </p>
                  <h2 className="mt-0.5 truncate text-base font-bold">BR Trades Guide</h2>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Platform questions · instant answers
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close platform guide"
                className="rounded-lg border border-white/[0.08] p-2 text-muted-foreground transition hover:border-cyan/30 hover:bg-white/[0.04] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X size={16} />
              </button>
            </header>

            <div className="min-h-0 space-y-4 overflow-y-auto p-4 sm:p-5">
              <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border border-cyan/20 bg-cyan/[0.07] text-cyan">
                  <Sparkles size={14} />
                </span>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  What would you like to know? Choose a topic for a clear answer.
                </p>
              </div>
              <div className="grid gap-2.5">
                {helpTopics.map((topic, index) => (
                  <button
                    key={topic.question}
                    type="button"
                    onClick={() => setActiveTopic(topic)}
                    aria-pressed={activeTopic?.question === topic.question}
                    className={`group flex min-h-12 w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      activeTopic?.question === topic.question
                        ? "border-primary/35 bg-primary/[0.07] text-foreground shadow-[inset_0_0_24px_-18px_var(--primary)]"
                        : "border-white/[0.08] bg-white/[0.015] text-muted-foreground hover:border-cyan/25 hover:bg-white/[0.035] hover:text-foreground"
                    }`}
                  >
                    <span className="num shrink-0 text-[10px] text-dim">0{index + 1}</span>
                    <span className="min-w-0 flex-1">{topic.question}</span>
                    <ArrowRight
                      size={14}
                      className="shrink-0 text-dim transition group-hover:translate-x-0.5 group-hover:text-cyan"
                    />
                  </button>
                ))}
              </div>

              {activeTopic && (
                <div
                  aria-live="polite"
                  className="rounded-xl border border-cyan/20 bg-[linear-gradient(135deg,rgba(8,217,245,0.06),rgba(0,232,135,0.035))] p-4"
                >
                  <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-cyan">
                    <span className="size-1.5 rounded-full bg-primary" /> Quick answer
                  </p>
                  <p className="mt-2 min-h-12 text-xs leading-relaxed text-foreground">
                    {activeTopic.answer.slice(0, visibleCharacters)}
                    {!answerReady && <span className="ml-0.5 text-primary">|</span>}
                  </p>
                  {answerReady && (
                    <Link
                      to={activeTopic.to}
                      onClick={() => setOpen(false)}
                      className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-gradient-brand px-3.5 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      {activeTopic.action}
                      <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close platform guide" : "Open platform guide"}
        aria-expanded={open}
        aria-controls="platform-chat-panel"
        title="Platform guide"
        className="relative grid size-14 place-items-center rounded-full border border-cyan/45 bg-[#07131a] text-cyan shadow-[0_0_24px_-8px_var(--cyan)] transition-transform hover:scale-105 hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan md:size-13"
      >
        {open ? (
          <X size={20} />
        ) : (
          <img
            src="/platform-bot.svg"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none size-13 object-contain"
          />
        )}
      </button>
    </div>
  );
}
