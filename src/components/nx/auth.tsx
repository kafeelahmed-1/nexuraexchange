import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/nx/chrome";
import { Button } from "@/components/ui/button";

type AuthPageProps = { mode: "login" | "register" };

export function AuthPage({ mode }: AuthPageProps) {
  const isRegister = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (isRegister && form.get("password") !== form.get("confirmPassword")) {
      toast.error("Your passwords don't match.");
      return;
    }

    setSuccess(true);
  }

  return (
    <main className="relative isolate flex min-h-screen overflow-hidden bg-background">
      <div className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-25 [mask-image:radial-gradient(ellipse_at_20%_20%,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -left-48 top-[-10rem] -z-10 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-64 right-[-8rem] -z-10 h-[34rem] w-[34rem] rounded-full bg-cyan/10 blur-[130px]" />

      <section className="hidden w-full flex-col lg:flex lg:min-h-screen lg:w-[54%] lg:border-r lg:border-border">
        <header className="flex h-20 items-center justify-between px-5 sm:px-8 lg:px-12">
          <Logo />
          <span className="inline-flex items-center gap-2 rounded-full border border-warning/20 bg-warning/5 px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-warning">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" /> SIMULATED ENVIRONMENT
          </span>
        </header>

        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 pb-10 pt-6 sm:px-8 lg:px-12 lg:py-16">
          <div className="max-w-xl">
            <div className="mb-6 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-primary">
              <Sparkles size={14} /> YOUR MARKET, IN FOCUS
            </div>
            <h1 className="max-w-lg text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl xl:text-6xl">
              Trade with <span className="text-gradient">clarity.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
              Explore a trading interface built for fast decisions and a calmer view of the market.
            </p>

            <div className="mt-10 border-y border-border">
              <div className="flex items-center justify-between border-b border-border py-3 text-[10px] font-bold tracking-[0.16em] text-dim">
                <span>MARKET SNAPSHOT</span>
                <span className="num">SIMULATED</span>
              </div>
              <div className="grid grid-cols-3 gap-3 py-5 sm:gap-6">
                {[
                  { symbol: "BTC", pair: "BTC / USDT", price: "67,420.80", change: "+2.41%" },
                  { symbol: "ETH", pair: "ETH / USDT", price: "3,512.64", change: "+1.86%" },
                  { symbol: "SOL", pair: "SOL / USDT", price: "184.32", change: "+4.08%" },
                ].map((asset, index) => (
                  <div
                    key={asset.symbol}
                    className="min-w-0"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                      <span className="grid h-7 w-7 place-items-center rounded-full border border-primary/20 bg-primary/5 text-[10px] text-primary">
                        {asset.symbol.slice(0, 1)}
                      </span>
                      {asset.pair}
                    </div>
                    <div className="num mt-3 truncate text-sm font-semibold text-foreground sm:text-base">
                      ${asset.price}
                    </div>
                    <div className="num mt-1 text-xs font-semibold text-primary">
                      {asset.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-dim">
              <ShieldCheck size={15} className="shrink-0 text-cyan" />
              <span>Paper trading only. No deposits, accounts, or real funds.</span>
            </div>
          </div>
        </div>
        <footer className="hidden px-12 pb-7 text-[11px] text-dim lg:block">
          NEXORA EXCHANGE <span className="mx-2 text-border">/</span> SIMULATED TRADING EXPERIENCE
        </footer>
      </section>

      <section className="flex min-h-screen flex-1 flex-col items-center px-5 py-7 sm:px-8 lg:justify-center lg:px-12 lg:py-12">
        <header className="flex w-full max-w-[420px] items-center justify-between lg:hidden">
          <Logo />
          <span className="inline-flex items-center gap-2 rounded-full border border-warning/20 bg-warning/5 px-2.5 py-1.5 text-[9px] font-bold tracking-[0.12em] text-warning">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" /> DEMO
          </span>
        </header>
        <div className="my-auto w-full max-w-[420px] py-8 lg:my-0 lg:py-0">
          <div className="mb-8">
            <div className="mb-3 text-xs font-bold tracking-[0.2em] text-primary">
              {isRegister ? "GET STARTED" : "WELCOME BACK"}
            </div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              {isRegister ? "Create your profile" : "Log in to NEXORA"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {isRegister
                ? "Set up a local profile to explore the exchange."
                : "Enter your details below to continue exploring."}
            </p>
          </div>

          {success && (
            <div
              role="status"
              className="mb-5 flex items-start gap-3 rounded-md border border-primary/25 bg-primary/5 px-4 py-3"
            >
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-bold text-primary">
                  {isRegister ? "Account created successfully" : "Login successful"}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Demo only. No account was saved and no authentication took place.
                </p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} onChange={() => setSuccess(false)}>
            {isRegister && (
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-semibold">
                  Full name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Alex Morgan"
                  className="h-12 w-full rounded-md border border-input bg-surface px-4 text-sm outline-none transition placeholder:text-dim focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="h-12 w-full rounded-md border border-input bg-surface px-4 text-sm outline-none transition placeholder:text-dim focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="password" className="text-sm font-semibold">
                  Password
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => toast.info("Password recovery is not enabled here.")}
                    className="text-xs font-semibold text-primary transition hover:text-cyan"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  required
                  minLength={isRegister ? 8 : undefined}
                  placeholder={isRegister ? "At least 8 characters" : "Enter your password"}
                  className="h-12 w-full rounded-md border border-input bg-surface px-4 pr-12 text-sm outline-none transition placeholder:text-dim focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 top-0 grid h-12 w-12 place-items-center text-muted-foreground transition hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-semibold">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="Re-enter your password"
                    className="h-12 w-full rounded-md border border-input bg-surface px-4 pr-12 text-sm outline-none transition placeholder:text-dim focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                    className="absolute right-0 top-0 grid h-12 w-12 place-items-center text-muted-foreground transition hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            )}

            {isRegister ? (
              <label className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-muted-foreground">
                <input
                  name="acknowledgement"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 shrink-0 accent-primary"
                />
                <span>
                  I understand this is a simulated experience. No real account or authentication
                  will be created.
                </span>
              </label>
            ) : (
              <label className="flex cursor-pointer items-center gap-3 text-sm text-muted-foreground">
                <input name="rememberMe" type="checkbox" className="h-4 w-4 accent-primary" />
                Remember me on this device
              </label>
            )}

            <Button
              type="submit"
              className="h-12 w-full rounded-md bg-gradient-brand text-sm font-bold text-primary-foreground shadow-[0_8px_28px_color-mix(in_oklab,var(--primary)_16%,transparent)] transition hover:brightness-110"
            >
              {isRegister ? "Create profile" : "Log in"}
              <ArrowUpRight size={17} />
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[10px] font-bold tracking-[0.16em] text-dim">
            <span className="h-px flex-1 bg-border" />
            <LockKeyhole size={13} /> ACCESS
            <span className="h-px flex-1 bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {isRegister ? "Already explored with us?" : "New here?"}{" "}
            <Link
              to={isRegister ? "/login" : "/register"}
              className="font-bold text-primary transition hover:text-cyan"
            >
              {isRegister ? "Log in" : "Create a profile"}
            </Link>
          </p>
          <p className="mt-6 text-center text-[11px] leading-5 text-dim">
            For interface exploration only. Never enter a real password or sensitive information.
          </p>
        </div>
      </section>
    </main>
  );
}
