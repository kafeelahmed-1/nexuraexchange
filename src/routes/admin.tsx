import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Activity, ArrowLeft, ArrowRight, CreditCard, Pencil, ShieldCheck, Trash2, UserPlus, Users, Wallet } from "lucide-react";
import { PageHeader } from "@/components/nx/motion";
import {
  adjustBalance,
  applyTradeManualPnl,
  createDemoUserByAdmin,
  deleteDemoUser,
  getAllDemoUsers,
  getDemoAccountState,
  isAdminUser,
  toggleDemoUserSuspension,
  updateDemoUserProfile,
  saveDemoAccountState,
  useDemoUser,
  type DemoAccountState,
  type DemoProfile,
} from "@/lib/demo-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — BR TRADES" },
      { name: "description", content: "Administrator dashboard for user management, balances and simulated trade override controls." },
      { property: "og:title", content: "Admin Panel — BR TRADES" },
      { property: "og:description", content: "Manage users, balances and trade outcomes." },
    ],
  }),
  component: AdminPanel,
});

const formatUsd = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

function isEditableAccountState(value: unknown, userId: string): value is DemoAccountState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<DemoAccountState>;
  const portfolio = state.portfolio;
  const assets = state.assets;
  return state.userId === userId
    && !!portfolio
    && [portfolio.totalBalance, portfolio.availableBalance, portfolio.unrealizedPnL, portfolio.realizedPnL].every(Number.isFinite)
    && !!assets
    && [assets.USDT, assets.BTC, assets.ETH, assets.SOL, assets.BNB, assets.XRP, assets.DOGE].every(Number.isFinite)
    && !!state.orders
    && Array.isArray(state.orders.openOrders)
    && Array.isArray(state.orders.orderHistory)
    && Array.isArray(state.orders.tradeHistory)
    && Array.isArray(state.fundingHistory)
    && Array.isArray(state.watchlist)
    && state.watchlist.every((item) => typeof item === "string");
}

function AdminPanel() {
  const { user, loaded } = useDemoUser();
  const navigate = useNavigate();
  const [users, setUsers] = useState<DemoProfile[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [accountState, setAccountState] = useState<DemoAccountState | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [delta, setDelta] = useState("0");
  const [tradeOverride, setTradeOverride] = useState<Record<string, string>>({});
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [accountJson, setAccountJson] = useState("");
  const [accountJsonError, setAccountJsonError] = useState("");
  const [balanceDrafts, setBalanceDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (loaded && !user) {
      void navigate({ to: "/login?next=%2Fadmin" as never, replace: true });
      return;
    }
    if (loaded && user && !isAdminUser(user)) {
      void navigate({ to: "/account", replace: true });
      return;
    }
    if (loaded && user) {
      const list = getAllDemoUsers().filter((entry) => entry.role !== "admin");
      setUsers(list);
      if ((!selected || !list.some((entry) => entry.id === selected)) && list.length > 0 && list[0]) setSelected(list[0].id);
      if (selected) {
        const state = getDemoAccountState(selected);
        setAccountState(state);
        const profile = list.find((entry) => entry.id === selected);
        if (profile) {
          setProfileName(profile.name);
          setProfileEmail(profile.email);
        }
      }
    }
  }, [loaded, user, selected, navigate]);

  useEffect(() => {
    if (!accountState) return;
    setAccountJson(JSON.stringify(accountState, null, 2));
    setAccountJsonError("");
    setBalanceDrafts({
      totalBalance: String(accountState.portfolio.totalBalance),
      availableBalance: String(accountState.portfolio.availableBalance),
      unrealizedPnL: String(accountState.portfolio.unrealizedPnL),
      realizedPnL: String(accountState.portfolio.realizedPnL),
    });
  }, [accountState]);

  const selectedUser = useMemo(
    () => users.find((entry) => entry.id === selected) ?? null,
    [users, selected],
  );

  if (!loaded || !user || !isAdminUser(user)) {
    return <main className="min-h-[45vh]" aria-busy="true" />;
  }

  const refreshAccount = (userId: string) => {
    setAccountState(getDemoAccountState(userId));
    setUsers(getAllDemoUsers().filter((entry) => entry.role !== "admin"));
  };

  const handleAddUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Name, email and password are required.");
      return;
    }
    try {
      const createdUser = await createDemoUserByAdmin(name.trim(), email.trim(), password.trim());
      setName("");
      setEmail("");
      setPassword("");
      const next = getAllDemoUsers().filter((entry) => entry.role !== "admin");
      setUsers(next);
      setSelected(createdUser.id);
      toast.success("User account created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create user");
    }
  };

  const handleSuspend = () => {
    if (!selectedUser) return;
    const next = toggleDemoUserSuspension(selectedUser.id);
    if (next) {
      setUsers((current) => current.map((entry) => (entry.id === next.id ? next : entry)));
      toast.success(next.suspended ? "User suspended" : "User reactivated");
    }
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    if (selectedUser.role === "admin") {
      toast.error("Admin accounts cannot be removed here.");
      return;
    }
    if (!window.confirm(`Remove ${selectedUser.email} and all of their local account data?`)) return;
    deleteDemoUser(selectedUser.id);
    const next = getAllDemoUsers().filter((entry) => entry.role !== "admin");
    setUsers(next);
    setSelected(next[0]?.id ?? "");
    toast.success("User removed");
  };

  const handleProfileSave = async () => {
    if (!selectedUser) return;
    try {
      const next = await updateDemoUserProfile(selectedUser.id, {
        name: profileName,
        email: profileEmail,
        ...(profilePassword ? { password: profilePassword } : {}),
      });
      setUsers((current) => current.map((entry) => (entry.id === next.id ? next : entry)));
      if (selectedUser.id === user.id) {
        toast.success("Your admin profile was updated");
      }
      toast.success("User profile updated");
      setProfilePassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update user");
    }
  };

  const tradeHistory = (accountState?.orders.tradeHistory ?? []) as Array<Record<string, unknown>>;

  const handleManualPnl = (tradeId: string, pnl: number) => {
    if (!selectedUser) return;
    applyTradeManualPnl(selectedUser.id, tradeId, pnl);
    refreshAccount(selectedUser.id);
    toast.success("Trade P&L override saved");
  };

  const handleBalanceAdjust = () => {
    if (!selectedUser) return;
    const numeric = Number(delta) || 0;
    adjustBalance(selectedUser.id, { deltaUSDT: numeric });
    refreshAccount(selectedUser.id);
    toast.success("Balance updated");
    setDelta("0");
  };

  const handleSetBalance = (field: "availableBalance" | "totalBalance" | "realizedPnL" | "unrealizedPnL", value: number) => {
    if (!selectedUser || !accountState || !Number.isFinite(value)) {
      toast.error("Enter a valid number.");
      return;
    }
    const changes = field === "totalBalance"
      ? { availableBalance: value - accountState.portfolio.unrealizedPnL - accountState.portfolio.realizedPnL }
      : { [field]: value };
    adjustBalance(selectedUser.id, changes as Partial<DemoAccountState["portfolio"]> & { deltaUSDT?: number });
    refreshAccount(selectedUser.id);
    toast.success(`${field} updated`);
  };

  const handleSaveAccountData = () => {
    if (!selectedUser) return;
    try {
      const parsed: unknown = JSON.parse(accountJson);
      if (!isEditableAccountState(parsed, selectedUser.id)) {
        setAccountJsonError("The record must match this user and contain valid portfolio, asset, order, funding and watchlist data.");
        return;
      }
      saveDemoAccountState(parsed);
      refreshAccount(selectedUser.id);
      toast.success("Account data saved");
    } catch (error) {
      setAccountJsonError(error instanceof Error ? error.message : "Account data is not valid JSON.");
    }
  };

  const adminState = accountState ?? {
    userId: selectedUser?.id ?? "",
    portfolio: { totalBalance: 0, availableBalance: 0, unrealizedPnL: 0, realizedPnL: 0 },
    assets: { USDT: 0, BTC: 0, ETH: 0, SOL: 0, BNB: 0, XRP: 0, DOGE: 0 },
    orders: { openOrders: [], orderHistory: [], tradeHistory: [] },
    fundingHistory: [],
    watchlist: [],
  };

  return (
    <>
      <PageHeader title="Admin Panel" desc="Manage users, balances, account states and simulated P&L outcomes." />
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link to="/account" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary">
            <ArrowLeft size={14} /> Back to account
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            <ShieldCheck size={12} /> Admin access
          </span>
        </div>

        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-5 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-primary" />
              <h2 className="text-lg font-black">Users</h2>
            </div>
            <div className="space-y-2">
              {users.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSelected(entry.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${selected === entry.id ? "border-primary/40 bg-primary/8" : "border-border bg-surface hover:border-border/80"}`}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold">{entry.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{entry.email}</div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] ${entry.suspended ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}>
                    {entry.suspended ? "Suspended" : "Active"}
                  </span>
                </button>
              ))}
              {users.length === 0 && <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">No user accounts yet.</p>}
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <UserPlus size={16} className="text-primary" />
                <h3 className="text-sm font-bold">Add user</h3>
              </div>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/50" />
              <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/50" />
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/50" />
              <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground">
                Create user <ArrowRight size={14} />
              </button>
            </form>
          </aside>

          <div className="space-y-6">
            {selectedUser && (
              <>
                <section className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Selected user</div>
                      <h2 className="mt-2 text-2xl font-black">{selectedUser.name}</h2>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={handleSuspend} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
                        {selectedUser.suspended ? "Reactivate" : "Suspend"}
                      </button>
                      <button type="button" onClick={handleDelete} className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2 text-sm font-semibold text-destructive">
                        <span className="inline-flex items-center gap-2"><Trash2 size={14} /> Remove</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <label className="block text-sm">
                      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-dim">Name</span>
                      <input value={profileName} onChange={(event) => setProfileName(event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary/50" />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-dim">Email</span>
                      <input value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary/50" />
                    </label>
                    <label className="block text-sm md:col-span-2">
                      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-dim">Password (optional)</span>
                      <input type="password" value={profilePassword} onChange={(event) => setProfilePassword(event.target.value)} placeholder="Set a new password" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary/50" />
                    </label>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={handleProfileSave} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground">
                      <Pencil size={14} /> Save profile
                    </button>
                    <span className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground">
                      <Activity size={14} /> {selectedUser.role === "admin" ? "Admin role" : "User role"}
                    </span>
                  </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Wallet size={18} className="text-primary" />
                      <h3 className="text-lg font-black">Account balance</h3>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        ["Available", "availableBalance", adminState.portfolio.availableBalance],
                        ["Total", "totalBalance", adminState.portfolio.totalBalance],
                        ["Unrealized P&L", "unrealizedPnL", adminState.portfolio.unrealizedPnL],
                        ["Realized P&L", "realizedPnL", adminState.portfolio.realizedPnL],
                      ].map(([label, value]) => (
                        <div key={String(value)} className="rounded-xl border border-border bg-surface p-3">
                          <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-dim">{label}</label>
                          <div className="mt-2 flex gap-2">
                            <input
                              type="number"
                              step="any"
                              value={balanceDrafts[String(value)] ?? ""}
                              onChange={(event) => setBalanceDrafts((current) => ({ ...current, [String(value)]: event.target.value }))}
                              className="num min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm font-bold outline-none focus:border-primary/50"
                            />
                            <button type="button" onClick={() => handleSetBalance(String(value) as "availableBalance" | "totalBalance" | "realizedPnL" | "unrealizedPnL", Number(balanceDrafts[String(value)]))} className="rounded-md border border-border px-2 text-[10px] font-bold hover:border-primary/40">Save</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 space-y-3">
                      <label className="block text-sm">
                        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-dim">Manual USDT adjustment</span>
                        <input value={delta} onChange={(event) => setDelta(event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-primary/50" />
                      </label>
                      <button type="button" onClick={handleBalanceAdjust} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-brand px-3 py-2.5 text-sm font-bold text-primary-foreground">
                        <CreditCard size={14} /> Apply balance change
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <ShieldCheck size={18} className="text-primary" />
                      <h3 className="text-lg font-black">Trade P&L control</h3>
                    </div>
                    {tradeHistory.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No recorded trades yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {tradeHistory.map((trade, index) => {
                          const tradeId = String(trade["id"] ?? `${String(trade["pair"] ?? "trade")}-${index}`);
                          const pnl = Number(trade["manualPnl"] ?? trade["pnl"] ?? trade["realizedPnL"] ?? 0);
                          return (
                            <div key={tradeId} className="rounded-xl border border-border bg-surface p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div className="text-sm font-bold">{String(trade["pair"] ?? trade["symbol"] ?? "Trade")}</div>
                                  <div className="text-[10px] uppercase tracking-[0.12em] text-dim">{String(trade["side"] ?? "Trade")}</div>
                                </div>
                                <div className="num text-sm font-bold text-primary">{formatUsd(pnl)}</div>
                              </div>
                              <div className="mt-3 flex items-center gap-2">
                                <input
                                  value={tradeOverride[tradeId] ?? String(pnl)}
                                  onChange={(event) => setTradeOverride((current) => ({ ...current, [tradeId]: event.target.value }))}
                                  className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm outline-none focus:border-primary/50"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleManualPnl(tradeId, Number(tradeOverride[tradeId] ?? pnl))}
                                  className="rounded-lg bg-primary px-2.5 py-2 text-xs font-bold text-primary-foreground"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-2xl border border-border bg-card p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black">Complete account data</h3>
                      <p className="mt-1 text-xs text-muted-foreground">Assets, balances, orders, trade history, funding records and watchlist.</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setAccountJson(JSON.stringify(accountState, null, 2)); setAccountJsonError(""); }} className="rounded-lg border border-border px-3 py-2 text-xs font-bold">Reset</button>
                      <button type="button" onClick={handleSaveAccountData} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">Save account data</button>
                    </div>
                  </div>
                  <textarea
                    aria-label="Complete account data JSON"
                    value={accountJson}
                    onChange={(event) => { setAccountJson(event.target.value); setAccountJsonError(""); }}
                    spellCheck={false}
                    className="min-h-[360px] w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-xs leading-5 outline-none focus:border-primary/50"
                  />
                  {accountJsonError && <p role="alert" className="mt-2 text-xs text-destructive">{accountJsonError}</p>}
                </section>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
