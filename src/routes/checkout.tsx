import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/nx/motion";
import { getDemoAccountState, saveDemoAccountState, useDemoUser, type DemoAccountState } from "@/lib/demo-auth";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Add Funds Preview — BR TRADES" },
      { name: "description", content: "Preview a local test-balance checkout." },
    ],
  }),
  component: CheckoutPage,
});

const presets = [25, 100, 250, 500];

function formatUsd(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

function CheckoutPage() {
  const { user, loaded } = useDemoUser();
  const navigate = useNavigate();
  const [accountState, setAccountState] = useState<DemoAccountState | null>(null);
  const [amount, setAmount] = useState(100);
  const [receiptId, setReceiptId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loaded && !user) void navigate({ to: "/login?next=%2Fcheckout" as never, replace: true });
  }, [loaded, user, navigate]);

  useEffect(() => {
    if (!user) return;
    try {
      setAccountState(getDemoAccountState(user.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load this account.");
      void navigate({ to: "/account", replace: true });
    }
  }, [user, navigate]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !accountState || submitting) return;
    if (!Number.isFinite(amount) || amount < 5 || amount > 10_000) {
      toast.error("Choose an amount between $5 and $10,000.");
      return;
    }

    setSubmitting(true);
    try {
      const receipt = {
        id: `TEST-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        amount,
        asset: "USDT" as const,
        createdAt: new Date().toISOString(),
        method: "sandbox-card" as const,
        status: "completed" as const,
      };
      const updated: DemoAccountState = {
        ...accountState,
        assets: { ...accountState.assets, USDT: accountState.assets.USDT + amount },
        portfolio: {
          ...accountState.portfolio,
          totalBalance: accountState.portfolio.totalBalance + amount,
          availableBalance: accountState.portfolio.availableBalance + amount,
        },
        fundingHistory: [receipt, ...(accountState.fundingHistory ?? [])],
      };
      saveDemoAccountState(updated);
      setAccountState(updated);
      setReceiptId(receipt.id);
      toast.success("Test balance added to your local account.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to complete the local test checkout.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!loaded || !user || !accountState) return <main className="min-h-[45vh]" aria-busy="true" />;

  return (
    <>
      <PageHeader title="Add Funds" desc="Review a local balance credit for your account." />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <Link to="/account" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
          <ArrowLeft size={16} /> Back to account
        </Link>

        {receiptId ? (
          <section className="mx-auto max-w-xl border-y border-primary/30 py-10 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary"><Check size={25} /></span>
            <div className="mt-5 text-xs font-bold tracking-[0.16em] text-primary">LOCAL CHECKOUT COMPLETE</div>
            <h1 className="mt-2 text-3xl font-black">Test balance added</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{formatUsd(amount)} in test USDT was added to {user.name}'s account in this browser.</p>
            <div className="mx-auto mt-6 max-w-sm border-y border-border py-4 text-left text-sm">
              <div className="flex justify-between gap-3"><span className="text-muted-foreground">Receipt</span><span className="num font-semibold">{receiptId}</span></div>
              <div className="mt-3 flex justify-between gap-3"><span className="text-muted-foreground">Updated available balance</span><span className="num font-semibold">{formatUsd(accountState.portfolio.availableBalance)}</span></div>
            </div>
            <p className="mx-auto mt-5 max-w-sm text-xs leading-5 text-warning">No payment was processed. This local receipt has no cash value and is not a deposit confirmation.</p>
            <Link to="/account" className="mt-7 inline-flex items-center gap-2 rounded-md bg-gradient-brand px-5 py-3 text-sm font-bold text-primary-foreground">Return to account <ArrowRight size={16} /></Link>
          </section>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section>
              <div className="mb-7">
                <div className="text-xs font-bold tracking-[0.16em] text-primary">ACCOUNT FUNDING</div>
                <h1 className="mt-2 text-3xl font-black">Add test balance</h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Choose a test amount to preview the account funding flow. No payment details are requested or stored.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-7">
                <fieldset>
                  <legend className="text-sm font-bold">1. Select amount</legend>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {presets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset)}
                        aria-pressed={amount === preset}
                        className={`h-12 rounded-md border text-sm font-bold transition ${amount === preset ? "border-primary/60 bg-primary/10 text-primary" : "border-border bg-surface text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
                      >
                        ${preset}
                      </button>
                    ))}
                  </div>
                  <label className="mt-3 block space-y-2 text-xs font-semibold text-muted-foreground">
                    Custom amount (USD)
                    <input
                      type="number"
                      min="5"
                      max="10000"
                      step="1"
                      value={amount}
                      onChange={(event) => setAmount(Number(event.target.value))}
                      className="h-12 w-full rounded-md border border-input bg-surface px-4 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
                    />
                  </label>
                </fieldset>

                <fieldset>
                  <legend className="text-sm font-bold">2. Funding method preview</legend>
                  <div className="mt-3 flex items-center gap-3 border border-primary/35 bg-primary/[0.04] p-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary"><CreditCard size={18} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">Card checkout preview</span>
                      <span className="mt-1 block text-xs text-muted-foreground">Sandbox flow only. No card fields.</span>
                    </span>
                    <span className="size-4 rounded-full border-[5px] border-primary" aria-label="Selected" />
                  </div>
                </fieldset>

                <div className="flex items-start gap-3 border border-warning/20 bg-warning/[0.04] p-4 text-xs leading-5 text-muted-foreground">
                  <ShieldCheck size={17} className="mt-0.5 shrink-0 text-warning" />
                  <p><strong className="text-warning">Preview mode:</strong> confirming adds a non-cash test balance to this browser profile. It does not contact a bank or payment processor.</p>
                </div>

                <button type="submit" disabled={submitting || amount < 5 || amount > 10000} className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-gradient-brand text-sm font-bold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
                  {submitting ? "Processing preview..." : `Continue · ${formatUsd(amount)}`}
                  <ArrowRight size={16} />
                </button>
              </form>
            </section>

            <aside className="h-fit border-y border-border bg-surface/50">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-bold">Order summary</h2>
              </div>
              <div className="space-y-4 px-5 py-5 text-sm">
                <div className="flex justify-between gap-3"><span className="text-muted-foreground">Test balance credit</span><span className="num font-semibold">{formatUsd(amount)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-muted-foreground">Processing fee</span><span className="num font-semibold">$0.00</span></div>
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between gap-3 font-bold"><span>Total preview</span><span className="num">{formatUsd(amount)}</span></div>
                  <p className="mt-2 text-[11px] leading-5 text-dim">This is a display-only estimate. No charge will be made.</p>
                </div>
                <div className="border-t border-border pt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 font-semibold"><Wallet size={15} className="text-primary" /> Destination account</div>
                  <div className="mt-2 pl-[23px]">{user.name}<br /><span className="text-dim">{user.email}</span></div>
                </div>
              </div>
              <div className="flex items-start gap-2 border-t border-border px-5 py-4 text-[10px] leading-4 text-dim">
                <LockKeyhole size={13} className="mt-0.5 shrink-0" /> No card number, expiry, or security code is collected or saved.
              </div>
            </aside>
          </div>
        )}

        <p className="mx-auto mt-10 flex max-w-2xl items-start justify-center gap-2 text-center text-[10px] leading-5 text-dim">
          <CircleHelp size={13} className="mt-1 shrink-0" /> BR Trades currently provides a simulated exchange interface. This checkout preview cannot accept real payments or add withdrawable funds.
        </p>
      </main>
    </>
  );
}