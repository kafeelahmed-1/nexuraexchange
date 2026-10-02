import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  LockKeyhole,
  Menu,
  Pencil,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  adjustBalance,
  applyTradeManualPnl,
  createDemoUserByAdmin,
  deleteDemoUser,
  getAllDemoUsers,
  getAdminAccountState,
  saveAdminAccountState,
  setDemoUserSuspension,
  updateDemoUserProfile,
} from "@/lib/supabase-admin";
import {
  isAdminUser,
  loginDemoAdmin,
  logoutDemoUser,
  useDemoUser,
  type DemoAccountState,
  type DemoProfile,
} from "@/lib/supabase-auth";

function AdminSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await loginDemoAdmin(email, password);
      toast.success("Signed in to the admin panel.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid-bg flex min-h-[100svh] flex-col bg-background px-5 py-5">
      <div className="flex flex-1 items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur sm:p-6"
        >
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-primary">
              <span className="grid size-7 place-items-center rounded-sm border border-primary/20 bg-primary/[0.08]">
                <ShieldCheck size={15} />
              </span>
              ADMINISTRATOR ACCESS
            </div>
            <h1 className="text-3xl font-black tracking-tight">Admin sign in</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Sign in with an administrator account to continue.</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="text-sm font-semibold">Email address</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full rounded-md border border-input bg-background/70 px-4 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="text-sm font-semibold">Password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full rounded-md border border-input bg-background/70 px-4 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground shadow-[0_8px_24px_rgba(0,232,135,0.12)] transition hover:brightness-105 disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in to admin"}
          </button>
        </form>
      </div>
      <footer className="mx-auto w-full max-w-sm border-t border-border pt-3 text-center text-xs text-muted-foreground">
        Powered by <span className="font-semibold text-foreground">Black Rocks</span>
      </footer>
    </main>
  );
}

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — BR Trades" },
      { name: "description", content: "Administrator dashboard for user management, balances and trade override controls." },
      { property: "og:title", content: "Admin Panel — BR Trades" },
      { property: "og:description", content: "Manage users, balances and trade outcomes." },
    ],
  }),
  component: AdminPanel,
});

const formatUsd = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

type AdminWorkspace = "dashboard" | "users" | "kyc" | "blocked" | "reports" | "settings" | "support";
type UserDetailSection = "overview" | "balance" | "trades" | "funding" | "kyc" | "security" | "notes";

function isEditableAccountState(value: unknown, userId: string): value is DemoAccountState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<DemoAccountState>;
  const portfolio = state.portfolio;
  const assets = state.assets;
  return state.userId === userId
    && !!portfolio
    && [portfolio.totalBalance, portfolio.availableBalance, portfolio.unrealizedPnL, portfolio.realizedPnL].every(Number.isFinite)
    && !!assets
    && Object.values(assets).every(Number.isFinite)
    && ["USDT", "BTC", "ETH", "SOL", "BNB", "XRP", "DOGE"].every((symbol) => Number.isFinite(assets[symbol]))
    && !!state.orders
    && Array.isArray(state.orders.openOrders)
    && Array.isArray(state.orders.orderHistory)
    && Array.isArray(state.orders.tradeHistory)
    && Array.isArray(state.fundingHistory)
    && (state.positions === undefined || (!!state.positions && typeof state.positions === "object" && !Array.isArray(state.positions)
      && Object.values(state.positions).every((position) => Number.isFinite(position.quantity) && Number.isFinite(position.averageEntryPrice))))
    && Array.isArray(state.watchlist)
    && state.watchlist.every((item) => typeof item === "string");
}

function AdminPanel() {
  const { user, loaded } = useDemoUser();
  const navigate = useNavigate();
  const [users, setUsers] = useState<DemoProfile[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [userSearch, setUserSearch] = useState("");
  const [workspace, setWorkspace] = useState<AdminWorkspace>("users");
  const [detailSection, setDetailSection] = useState<UserDetailSection>("overview");
  const [showUserList, setShowUserList] = useState(true);
  const [userNavigationOpen, setUserNavigationOpen] = useState(true);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
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
    let active = true;
    if (loaded && user && !isAdminUser(user)) {
      void navigate({ to: "/account", replace: true });
      return () => { active = false; };
    }
    if (loaded && user) {
      void (async () => {
        try {
          const list = (await getAllDemoUsers()).filter((entry) => entry.role !== "admin");
          if (!active) return;
          setUsers(list);
          const nextSelected = list.some((entry) => entry.id === selected) ? selected : list[0]?.id ?? "";
          if (nextSelected !== selected) setSelected(nextSelected);
          if (!nextSelected) {
            setAccountState(null);
            return;
          }
          const [state, profile] = await Promise.all([
            getAdminAccountState(nextSelected),
            Promise.resolve(list.find((entry) => entry.id === nextSelected)),
          ]);
          if (!active) return;
          setAccountState(state);
          if (profile) {
            setProfileName(profile.name);
            setProfileEmail(profile.email);
          }
        } catch (error) {
          if (active) toast.error(error instanceof Error ? error.message : "Unable to load users.");
        }
      })();
    }
    return () => { active = false; };
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
  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLocaleLowerCase();
    if (!query) return users;
    return users.filter((entry) =>
      entry.name.toLocaleLowerCase().includes(query)
      || entry.email.toLocaleLowerCase().includes(query),
    );
  }, [users, userSearch]);
  const displayedUsers = useMemo(
    () => workspace === "blocked" ? filteredUsers.filter((entry) => entry.suspended) : filteredUsers,
    [filteredUsers, workspace],
  );
  const activeUserCount = users.filter((entry) => !entry.suspended).length;
  const blockedUserCount = users.length - activeUserCount;

  const openUserList = (filter: "all" | "blocked" = "all") => {
    setWorkspace(filter === "blocked" ? "blocked" : "users");
    setShowUserList(true);
  };

  const openDetailSection = (section: UserDetailSection) => {
    setWorkspace("users");
    setShowUserList(false);
    setDetailSection(section);
  };

  const openUserDetails = (userId: string) => {
    setSelected(userId);
    setWorkspace("users");
    setShowUserList(false);
    setDetailSection("overview");
  };

  if (!loaded) {
    return <main className="min-h-[45vh]" aria-busy="true" />;
  }
  if (!user) return <AdminSignIn />;
  if (!isAdminUser(user)) return <main className="min-h-[45vh]" aria-busy="true" />;

  const refreshAccount = async (userId: string) => {
    const [state, users] = await Promise.all([getAdminAccountState(userId), getAllDemoUsers()]);
    setAccountState(state);
    setUsers(users.filter((entry) => entry.role !== "admin"));
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
      const next = (await getAllDemoUsers()).filter((entry) => entry.role !== "admin");
      setUsers(next);
      setSelected(createdUser.id);
      setWorkspace("users");
      setShowUserList(false);
      setDetailSection("overview");
      toast.success("User account created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create user");
    }
  };

  const handleSuspend = async () => {
    if (!selectedUser) return;
    try {
      const next = await setDemoUserSuspension(selectedUser.id, !selectedUser.suspended);
      setUsers((current) => current.map((entry) => (entry.id === next.id ? next : entry)));
      toast.success(next.suspended ? "User suspended" : "User reactivated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update user status.");
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    if (selectedUser.role === "admin") {
      toast.error("Admin accounts cannot be removed here.");
      return;
    }
    if (!window.confirm(`Remove ${selectedUser.email} and all of their account data?`)) return;
    try {
      await deleteDemoUser(selectedUser.id);
      const next = users.filter((entry) => entry.id !== selectedUser.id);
      setUsers(next);
      setSelected(next[0]?.id ?? "");
      setShowUserList(next.length === 0);
      toast.success("User removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove user.");
    }
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

  const handleManualPnl = async (tradeId: string, pnl: number) => {
    if (!selectedUser) return;
    try {
      await applyTradeManualPnl(selectedUser.id, tradeId, pnl);
      await refreshAccount(selectedUser.id);
      toast.success("Trade outcome and user balance updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update trade P&L.");
    }
  };

  const handleBalanceAdjust = async () => {
    if (!selectedUser) return;
    const numeric = Number(delta);
    if (!Number.isFinite(numeric)) {
      toast.error("Enter a valid USDT adjustment.");
      return;
    }
    try {
      await adjustBalance(selectedUser.id, { deltaUSDT: numeric });
      await refreshAccount(selectedUser.id);
      toast.success("Available balance updated");
      setDelta("0");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update the user balance.");
    }
  };

  const handleSetBalance = async (field: "availableBalance" | "totalBalance" | "realizedPnL" | "unrealizedPnL", value: number) => {
    if (!selectedUser || !accountState || !Number.isFinite(value)) {
      toast.error("Enter a valid number.");
      return;
    }
    try {
      await adjustBalance(selectedUser.id, { [field]: value } as Partial<DemoAccountState["portfolio"]> & { deltaUSDT?: number });
      await refreshAccount(selectedUser.id);
      toast.success(`${field} updated`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update this account value.");
    }
  };

  const handleSaveAccountData = async () => {
    if (!selectedUser) return;
    try {
      const parsed: unknown = JSON.parse(accountJson);
      if (!isEditableAccountState(parsed, selectedUser.id)) {
        setAccountJsonError("The record must match this user and contain valid portfolio, asset, order, funding and watchlist data.");
        return;
      }
      await saveAdminAccountState(parsed);
      await refreshAccount(selectedUser.id);
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
  const balanceFields = [
    { label: "Available", field: "availableBalance" },
    { label: "Total equity", field: "totalBalance" },
    { label: "Unrealized P&L", field: "unrealizedPnL" },
    { label: "Realized P&L", field: "realizedPnL" },
  ] as const;

  const detailTabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "balance", label: "Account Balance", icon: Wallet },
    { id: "trades", label: "Trade Activity", icon: Activity },
    { id: "funding", label: "Deposit / Withdrawal History", icon: ArrowDownToLine },
    { id: "kyc", label: "KYC & Verification", icon: BadgeCheck },
    { id: "security", label: "Security Logs", icon: LockKeyhole },
    { id: "notes", label: "Notes", icon: FileText },
  ] as const;
  const isUserDirectory = (workspace === "users" && showUserList) || workspace === "blocked";
  const pageTitle = workspace === "dashboard" ? "Dashboard"
    : workspace === "reports" ? "P&L & Reports"
      : workspace === "settings" ? "Platform Settings"
      : workspace === "support" ? "Support"
        : workspace === "kyc" ? "KYC Verification"
          : isUserDirectory ? (workspace === "blocked" ? "Blocked Users" : "All Users")
            : "User Details";

  const panelClass = "rounded-xl border border-[#dce8e5] bg-white shadow-[0_8px_24px_-20px_rgba(10,54,45,0.4)]";
  const fieldClass = "min-h-10 w-full rounded-lg border border-[#d7e3e0] bg-white px-3 text-sm text-[#173a34] outline-none transition placeholder:text-[#91a29e] focus:border-[#00b887] focus:ring-2 focus:ring-[#00b887]/10";

  return (
    <div className="min-h-screen min-w-0 bg-[#f3f7f6] text-[#173a34] lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className={`relative z-30 flex min-w-0 flex-col overflow-hidden border-b border-[#123d37] bg-[#062a26] text-[#e7f4f1] ${mobileNavigationOpen ? "max-h-[85dvh]" : "h-[60px]"} lg:sticky lg:top-0 lg:h-screen lg:max-h-none lg:overflow-visible lg:border-b-0 lg:border-r`}>
        <div className="flex h-[60px] shrink-0 items-center gap-3 border-b border-white/[0.08] px-4 lg:h-[66px]">
          <span className="grid size-10 place-items-center rounded-lg border border-[#00e887]/20 bg-[#00e887]/[0.09] text-lg font-black tracking-tight text-[#00e887]">BR</span>
          <div>
            <div className="text-[15px] font-black tracking-[0.04em]">BR Trades</div>
            <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.17em] text-[#83aaa2]">Admin console</div>
          </div>
          <button type="button" onClick={() => setMobileNavigationOpen((open) => !open)} aria-label={mobileNavigationOpen ? "Close admin navigation" : "Open admin navigation"} aria-expanded={mobileNavigationOpen} className="ml-auto grid size-9 place-items-center rounded-lg border border-white/10 text-[#b5cbc6] transition hover:border-[#00e887]/30 hover:bg-white/[0.05] hover:text-white lg:hidden">
            {mobileNavigationOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        <nav
          aria-label="Admin navigation"
          onClickCapture={(event) => {
            const targetButton = (event.target as HTMLElement).closest("button");
            if (!targetButton?.textContent?.includes("User Management")) {
              setMobileNavigationOpen(false);
            }
          }}
          className={`${mobileNavigationOpen ? "flex max-h-[calc(85dvh-60px)] flex-col overflow-y-auto" : "hidden"} min-w-0 gap-1 p-2 lg:flex lg:max-h-none lg:flex-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:p-3`}
        >
          <button type="button" onClick={() => { setWorkspace("dashboard"); setShowUserList(false); }} aria-current={workspace === "dashboard" ? "page" : undefined} className={`flex min-h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-left text-[13px] font-semibold transition lg:w-full ${workspace === "dashboard" ? "bg-[#00e887]/15 text-white shadow-[inset_2px_0_0_#00e887]" : "text-[#b5cbc6] hover:bg-white/[0.06] hover:text-white"}`}>
            <LayoutDashboard size={16} className={workspace === "dashboard" ? "text-[#00e887]" : "text-[#89aaa3]"} /> Dashboard
          </button>
          <div className="min-w-0 shrink-0 lg:w-full">
            <button type="button" onClick={() => { setUserNavigationOpen((open) => !open); openUserList("all"); }} aria-expanded={userNavigationOpen} className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[13px] font-semibold transition ${workspace === "users" || workspace === "blocked" || workspace === "kyc" ? "bg-[#00e887]/15 text-white shadow-[inset_2px_0_0_#00e887]" : "text-[#b5cbc6] hover:bg-white/[0.06] hover:text-white"}`}>
              <Users size={16} className="text-[#89aaa3]" /> <span className="min-w-0 flex-1">User Management</span><ChevronDown size={14} className={`transition-transform ${userNavigationOpen ? "rotate-180" : ""}`} />
            </button>
            {userNavigationOpen && <div className="mt-1 space-y-0.5 border-l border-white/10 pb-1 pl-3 lg:ml-5">
              <button type="button" onClick={() => openUserList("all")} className={`flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-xs font-medium transition ${workspace === "users" && showUserList ? "bg-[#00e887]/10 text-[#71f0c2]" : "text-[#9db8b1] hover:bg-white/[0.05] hover:text-white"}`}><span className="size-1.5 rounded-full bg-current" /> All Users <span className="num ml-auto text-[10px] text-[#7fa29a]">{users.length}</span></button>
              <button type="button" onClick={() => { setWorkspace("kyc"); setShowUserList(false); }} className={`flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-xs font-medium transition ${workspace === "kyc" ? "bg-[#00e887]/10 text-[#71f0c2]" : "text-[#9db8b1] hover:bg-white/[0.05] hover:text-white"}`}><span className="size-1.5 rounded-full bg-current" /> KYC Verification</button>
              <button type="button" onClick={() => openUserList("blocked")} className={`flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-xs font-medium transition ${workspace === "blocked" ? "bg-[#00e887]/10 text-[#71f0c2]" : "text-[#9db8b1] hover:bg-white/[0.05] hover:text-white"}`}><span className="size-1.5 rounded-full bg-current" /> Blocked Users <span className="num ml-auto text-[10px] text-[#7fa29a]">{blockedUserCount}</span></button>
            </div>}
          </div>
          <button type="button" onClick={() => openDetailSection("trades")} aria-current={workspace === "users" && detailSection === "trades" && !showUserList ? "page" : undefined} className={`flex min-h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-left text-[13px] font-semibold transition lg:w-full ${workspace === "users" && detailSection === "trades" && !showUserList ? "bg-[#00e887]/15 text-white shadow-[inset_2px_0_0_#00e887]" : "text-[#b5cbc6] hover:bg-white/[0.06] hover:text-white"}`}><BarChart3 size={16} className="text-[#89aaa3]" /> Trade & Markets</button>
          <button type="button" onClick={() => openDetailSection("funding")} aria-current={workspace === "users" && detailSection === "funding" && !showUserList ? "page" : undefined} className={`flex min-h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-left text-[13px] font-semibold transition lg:w-full ${workspace === "users" && detailSection === "funding" && !showUserList ? "bg-[#00e887]/15 text-white shadow-[inset_2px_0_0_#00e887]" : "text-[#b5cbc6] hover:bg-white/[0.06] hover:text-white"}`}><CreditCard size={16} className="text-[#89aaa3]" /> Deposits & Withdrawals</button>
          <button type="button" onClick={() => { setWorkspace("reports"); setShowUserList(false); }} aria-current={workspace === "reports" ? "page" : undefined} className={`flex min-h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-left text-[13px] font-semibold transition lg:w-full ${workspace === "reports" ? "bg-[#00e887]/15 text-white shadow-[inset_2px_0_0_#00e887]" : "text-[#b5cbc6] hover:bg-white/[0.06] hover:text-white"}`}><TrendingUp size={16} className="text-[#89aaa3]" /> P&L & Reports</button>
          <button type="button" onClick={() => openDetailSection("security")} aria-current={workspace === "users" && detailSection === "security" && !showUserList ? "page" : undefined} className={`flex min-h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-left text-[13px] font-semibold transition lg:w-full ${workspace === "users" && detailSection === "security" && !showUserList ? "bg-[#00e887]/15 text-white shadow-[inset_2px_0_0_#00e887]" : "text-[#b5cbc6] hover:bg-white/[0.06] hover:text-white"}`}><LockKeyhole size={16} className="text-[#89aaa3]" /> Security</button>
          <button type="button" onClick={() => { setWorkspace("settings"); setShowUserList(false); }} aria-current={workspace === "settings" ? "page" : undefined} className={`flex min-h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-left text-[13px] font-semibold transition lg:w-full ${workspace === "settings" ? "bg-[#00e887]/15 text-white shadow-[inset_2px_0_0_#00e887]" : "text-[#b5cbc6] hover:bg-white/[0.06] hover:text-white"}`}><Settings2 size={16} className="text-[#89aaa3]" /> Platform Settings</button>
          <button type="button" onClick={() => { setWorkspace("support"); setShowUserList(false); }} aria-current={workspace === "support" ? "page" : undefined} className={`flex min-h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-left text-[13px] font-semibold transition lg:w-full ${workspace === "support" ? "bg-[#00e887]/15 text-white shadow-[inset_2px_0_0_#00e887]" : "text-[#b5cbc6] hover:bg-white/[0.06] hover:text-white"}`}><CircleHelp size={16} className="text-[#89aaa3]" /> Support</button>
        </nav>
        <div className="hidden shrink-0 p-3 lg:block">
          <div className="rounded-lg border border-[#00e887]/15 bg-[#00e887]/[0.06] p-3">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#8db9ae]"><Users size={13} className="text-[#00e887]" /> Total users</div>
            <div className="num mt-2 text-xl font-bold text-white">{users.length}</div>
            <div className="mt-1 text-[10px] text-[#87a7a0]">{activeUserCount} active · {blockedUserCount} blocked</div>
          </div>
          <div className="mt-3 text-[9px] font-medium uppercase tracking-[0.14em] text-[#64857e]">BR Trades · Admin</div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex min-h-[66px] flex-wrap items-center justify-between gap-3 border-b border-[#dce8e5] bg-white/95 px-4 py-2.5 backdrop-blur md:px-7">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <label className="flex min-h-10 w-full max-w-[420px] items-center gap-2 rounded-lg border border-[#dce8e5] bg-[#f6faf9] px-3 focus-within:border-[#00b887] focus-within:ring-2 focus-within:ring-[#00b887]/10">
              <Search size={15} className="shrink-0 text-[#79908a]" />
              <input type="search" value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search users by name or email" aria-label="Search users by name or email" className="min-w-0 flex-1 bg-transparent text-xs text-[#173a34] outline-none placeholder:text-[#92a39f]" />
              {userSearch && <button type="button" onClick={() => setUserSearch("")} aria-label="Clear user search" className="text-xs font-bold text-[#81938f] hover:text-[#008f69]">×</button>}
            </label>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-4">
            <span className="hidden text-right sm:block"><span className="block text-xs font-bold">{user.name}</span><span className="mt-0.5 block max-w-48 truncate text-[10px] text-[#768985]">Administrator</span></span>
            <span className="grid size-9 place-items-center rounded-full border border-[#a5e9d2] bg-[#e9faf4] text-[#008f69]"><ShieldCheck size={17} /></span>
            <button type="button" onClick={async () => { try { await logoutDemoUser(); await navigate({ to: "/admin", replace: true }); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to sign out."); } }} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#dce8e5] px-3 text-xs font-semibold text-[#536964] transition hover:border-[#00b887]/40 hover:bg-[#effaf6] hover:text-[#007b5c]"><LogOut size={14} /> Sign out</button>
          </div>
        </header>

        <main className="mx-auto min-h-[calc(100vh-66px)] w-full max-w-[1600px] px-4 py-5 md:px-7 md:py-7">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#009b70]">BR TRADES · ADMIN CONSOLE</div>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-[#163a34] sm:text-2xl">{pageTitle}</h1>
              <p className="mt-1 text-xs text-[#728681]">{isUserDirectory ? "Manage user access and review account records." : "Review account information and administrative activity."}</p>
            </div>
            {workspace === "users" && !showUserList && selectedUser && <button type="button" onClick={() => openUserList("all")} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#d5e5e0] bg-white px-3 text-xs font-semibold text-[#42665d] shadow-sm transition hover:border-[#00b887]/35 hover:text-[#007e5d]"><ChevronLeft size={14} /> Back to All Users</button>}
            {(workspace === "dashboard" || workspace === "users" || workspace === "blocked") && <span className="inline-flex items-center gap-2 rounded-full border border-[#b6ead7] bg-[#eafaf3] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#00875f]"><ShieldCheck size={12} /> Admin access</span>}
          </div>

          {workspace === "dashboard" && <section className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Total users", value: users.length, icon: Users },
                { label: "Active accounts", value: activeUserCount, icon: BadgeCheck },
                { label: "Blocked users", value: blockedUserCount, icon: LockKeyhole },
                { label: "Accounts created", value: users.filter((entry) => Date.now() - new Date(entry.createdAt).getTime() < 30 * 86400000).length, icon: Clock3 },
              ].map(({ label, value, icon: Icon }) => <div key={label} className={`${panelClass} flex items-center gap-3 p-4`}>
                <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-[#bcebd9] bg-[#ecfaf4] text-[#009b70]"><Icon size={18} /></span>
                <span><span className="block text-[11px] font-medium text-[#71857f]">{label}</span><span className="num mt-1 block text-xl font-bold text-[#173a34]">{value}</span></span>
              </div>)}
            </div>
            <section className={`${panelClass} overflow-hidden`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5eeeb] px-4 py-3.5 sm:px-5">
                <div><h2 className="text-sm font-bold">Recent users</h2><p className="mt-1 text-[11px] text-[#758781]">Select a user to review their account.</p></div>
                <button type="button" onClick={() => openUserList("all")} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008e67] hover:text-[#006f52]">All users <ArrowRight size={13} /></button>
              </div>
              <div className="divide-y divide-[#edf2f0]">
                {users.slice(0, 8).map((entry) => <button key={entry.id} type="button" onClick={() => openUserDetails(entry.id)} className="flex min-h-[62px] w-full items-center gap-3 px-4 text-left transition hover:bg-[#f6faf8] sm:px-5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e8f8f2] text-xs font-bold text-[#008e67]">{(entry.name || entry.email).slice(0, 1).toUpperCase()}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold">{entry.name || "Unnamed user"}</span><span className="mt-0.5 block truncate text-[11px] text-[#768984]">{entry.email}</span></span>
                  <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase ${entry.suspended ? "bg-amber-50 text-amber-700" : "bg-[#e9f9f2] text-[#00875f]"}`}>{entry.suspended ? "Blocked" : "Active"}</span><ChevronRight size={14} className="text-[#9aaba6]" />
                </button>)}
                {users.length === 0 && <p className="px-5 py-8 text-center text-sm text-[#778982]">No user accounts yet.</p>}
              </div>
            </section>
          </section>}

          {workspace === "reports" && <section className="space-y-4">
            {selectedUser ? <>
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-bold">Account performance</h2><p className="mt-1 text-[11px] text-[#758781]">Portfolio and trade results for {selectedUser.name || selectedUser.email}.</p></div><button type="button" onClick={() => openDetailSection("trades")} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#dce8e5] bg-white px-3 text-xs font-semibold text-[#42665d] hover:border-[#00b887]/40"><Activity size={14} /> View trades</button></div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
                { label: "Total balance", value: formatUsd(adminState.portfolio.totalBalance), icon: Wallet, tone: "green" },
                { label: "Available balance", value: formatUsd(adminState.portfolio.availableBalance), icon: CreditCard, tone: "cyan" },
                { label: "Realized P&L", value: formatUsd(adminState.portfolio.realizedPnL), icon: TrendingUp, tone: adminState.portfolio.realizedPnL >= 0 ? "green" : "red" },
                { label: "Unrealized P&L", value: formatUsd(adminState.portfolio.unrealizedPnL), icon: Activity, tone: adminState.portfolio.unrealizedPnL >= 0 ? "green" : "red" },
              ].map(({ label, value, icon: Icon, tone }) => <div key={label} className={`${panelClass} p-4`}><span className={`grid size-9 place-items-center rounded-lg ${tone === "green" ? "bg-[#e9f9f2] text-[#008e67]" : tone === "cyan" ? "bg-[#e9f7fa] text-[#18829b]" : "bg-[#fff0f1] text-[#bd4b55]"}`}><Icon size={17} /></span><div className="mt-3 text-[10px] font-medium text-[#758780]">{label}</div><div className="num mt-1 text-lg font-bold text-[#173a34]">{value}</div></div>)}</div>
              <section className={`${panelClass} overflow-hidden`}><div className="flex items-center justify-between border-b border-[#e5eeeb] px-4 py-3.5"><div><h3 className="text-sm font-bold">Trade P&amp;L records</h3><p className="mt-1 text-[10px] text-[#778983]">{tradeHistory.length} records</p></div><BarChart3 size={17} className="text-[#008e67]" /></div>{tradeHistory.length ? <div className="divide-y divide-[#edf2f0]">{tradeHistory.slice(0, 10).map((trade, index) => { const pnl = Number(trade["manualPnl"] ?? trade["pnl"] ?? trade["realizedPnL"] ?? 0); return <div key={String(trade["id"] ?? index)} className="flex items-center justify-between gap-3 px-4 py-3"><span className="min-w-0"><span className="block truncate text-xs font-semibold">{String(trade["pair"] ?? trade["symbol"] ?? "Trade")}</span><span className="mt-0.5 block text-[10px] text-[#84938f]">{String(trade["side"] ?? "Trade")}</span></span><span className={`num text-xs font-bold ${pnl >= 0 ? "text-[#008e67]" : "text-[#c34f57]"}`}>{formatUsd(pnl)}</span></div>; })}</div> : <p className="px-5 py-8 text-center text-xs text-[#778983]">No trade records are available for this account.</p>}</section>
            </> : <section className={`${panelClass} grid min-h-56 place-items-center p-6 text-center`}><div><BarChart3 size={22} className="mx-auto text-[#00966d]" /><h2 className="mt-3 text-sm font-bold">Select a user to view reports</h2><p className="mt-1 text-xs text-[#758780]">Choose an account from User Management first.</p><button type="button" onClick={() => openUserList("all")} className="mt-4 min-h-9 rounded-lg bg-[#00bd84] px-3 text-xs font-bold text-white">Open user list</button></div></section>}
          </section>}

          {isUserDirectory && <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(270px,0.7fr)]">
            <section className={`${panelClass} min-w-0 overflow-hidden`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5eeeb] px-4 py-4 sm:px-5">
                <div><h2 className="text-sm font-bold">{workspace === "blocked" ? "Blocked users" : "All users"}</h2><p className="mt-1 text-[11px] text-[#758781]">{displayedUsers.length} {displayedUsers.length === 1 ? "account" : "accounts"}</p></div>
                <label className="flex min-h-9 min-w-[210px] items-center gap-2 rounded-lg border border-[#dce8e5] bg-[#f8fbfa] px-2.5"><Search size={14} className="text-[#82938e]" /><input type="search" value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Filter name or email" className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#91a19c]" /></label>
              </div>
              <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(95px,0.6fr)_minmax(100px,0.8fr)] gap-3 border-b border-[#e9f0ee] bg-[#f8fbfa] px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#71847e] sm:grid"><span>User</span><span>Email</span><span>Status</span><span>Registered</span></div>
              <div className="divide-y divide-[#edf2f0]">
                {displayedUsers.map((entry) => <button key={entry.id} type="button" onClick={() => openUserDetails(entry.id)} className="grid min-h-[68px] w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-4 py-3 text-left transition hover:bg-[#f4faf7] sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(95px,0.6fr)_minmax(100px,0.8fr)] sm:gap-3 sm:px-5">
                  <span className="flex min-w-0 items-center gap-2.5"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e9f8f2] text-xs font-bold text-[#008c65]">{(entry.name || entry.email).slice(0, 1).toUpperCase()}</span><span className="min-w-0"><span className="block truncate text-xs font-bold">{entry.name || "Unnamed user"}</span><span className="mt-0.5 block truncate text-[10px] text-[#84938f] sm:hidden">{entry.email}</span></span></span>
                  <span className="hidden truncate text-xs text-[#536a64] sm:block">{entry.email}</span>
                  <span className={`col-start-2 row-start-1 justify-self-end rounded-full px-2 py-1 text-[9px] font-bold uppercase sm:col-auto sm:row-auto sm:justify-self-start ${entry.suspended ? "bg-amber-50 text-amber-700" : "bg-[#e9f9f2] text-[#00875f]"}`}>{entry.suspended ? "Blocked" : "Active"}</span>
                  <span className="col-start-1 row-start-2 pl-[46px] text-[10px] text-[#84938f] sm:col-auto sm:row-auto sm:pl-0">{new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </button>)}
                {displayedUsers.length === 0 && <p className="px-5 py-10 text-center text-sm text-[#778982]">{users.length ? "No users match this filter." : "No user accounts yet."}</p>}
              </div>
            </section>
            <form onSubmit={handleAddUser} className={`${panelClass} h-fit space-y-3 p-4 sm:p-5`}>
              <div className="flex items-center gap-2.5 border-b border-[#e5eeeb] pb-3"><span className="grid size-8 place-items-center rounded-lg bg-[#eaf9f3] text-[#00966d]"><UserPlus size={16} /></span><div><h2 className="text-sm font-bold">Add user</h2><p className="mt-0.5 text-[10px] text-[#7e908a]">Create a new account</p></div></div>
              <label className="block space-y-1.5 text-[10px] font-semibold text-[#627771]">Full name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" className={fieldClass} /></label>
              <label className="block space-y-1.5 text-[10px] font-semibold text-[#627771]">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className={fieldClass} /></label>
              <label className="block space-y-1.5 text-[10px] font-semibold text-[#627771]">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className={fieldClass} /></label>
              <button type="submit" className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#00c987] to-[#00b6a3] px-3 text-xs font-bold text-white shadow-sm transition hover:brightness-105">Create user <ArrowRight size={14} /></button>
            </form>
          </div>}

          {workspace === "users" && !showUserList && selectedUser && <section className="space-y-4">
            <div className={`${panelClass} flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5`}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-full border border-[#b9ead8] bg-[#e9f9f2] text-lg font-bold text-[#008e67]">{(selectedUser.name || selectedUser.email).slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-base font-bold">{selectedUser.name || "Unnamed user"}</h2><span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase ${selectedUser.suspended ? "bg-amber-50 text-amber-700" : "bg-[#e9f9f2] text-[#00875f]"}`}>{selectedUser.suspended ? "Blocked" : "Active"}</span></div><p className="mt-1 truncate text-xs text-[#71847e]">{selectedUser.email}</p><p className="mt-1 text-[10px] text-[#94a39f]">User ID · {selectedUser.id}</p></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handleSuspend} className="min-h-9 rounded-lg border border-[#d6e4e0] bg-white px-3 text-xs font-semibold text-[#47635c] transition hover:border-[#00b887]/40 hover:bg-[#f1faf6]">{selectedUser.suspended ? "Reactivate" : "Suspend"}</button>
                <button type="button" onClick={handleDelete} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#f1cfd2] bg-[#fff8f8] px-3 text-xs font-semibold text-[#b4474e] transition hover:bg-[#fff0f0]"><Trash2 size={13} /> Remove</button>
              </div>
            </div>
            <div className="overflow-x-auto border-b border-[#dce8e5]">
              <div className="flex min-w-max gap-1" role="tablist" aria-label="User details sections">
                {detailTabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={detailSection === id} onClick={() => setDetailSection(id)} className={`inline-flex min-h-10 items-center gap-2 border-b-2 px-3 text-[11px] font-semibold transition ${detailSection === id ? "border-[#00b887] text-[#007f5e]" : "border-transparent text-[#778983] hover:text-[#244b42]"}`}><Icon size={14} />{label}</button>)}
              </div>
            </div>

            {detailSection === "overview" && <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(270px,0.7fr)]">
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Total balance", value: formatUsd(adminState.portfolio.totalBalance), icon: Wallet },
                    { label: "Total trades", value: adminState.orders.tradeHistory.length.toLocaleString(), icon: Activity },
                    { label: "Total deposits", value: formatUsd(adminState.fundingHistory.reduce((total, item) => total + item.amount, 0)), icon: ArrowDownToLine },
                    { label: "Total withdrawals", value: "—", icon: CreditCard },
                  ].map(({ label, value, icon: Icon }) => <div key={label} className={`${panelClass} p-3.5`}><span className="grid size-8 place-items-center rounded-lg bg-[#e9f9f2] text-[#008e67]"><Icon size={16} /></span><div className="mt-3 text-[10px] font-medium text-[#758780]">{label}</div><div className="num mt-1 text-lg font-bold text-[#173a34]">{value}</div></div>)}
                </div>
                <section className={`${panelClass} overflow-hidden`}>
                  <div className="border-b border-[#e5eeeb] px-4 py-3.5"><h3 className="text-sm font-bold">Account overview</h3><p className="mt-1 text-[10px] text-[#778983]">Profile information and account access</p></div>
                  <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                    <label className="block space-y-1.5 text-[10px] font-semibold text-[#627771]">Full name<input value={profileName} onChange={(event) => setProfileName(event.target.value)} className={fieldClass} /></label>
                    <label className="block space-y-1.5 text-[10px] font-semibold text-[#627771]">Email address<input value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} className={fieldClass} /></label>
                    <label className="block space-y-1.5 text-[10px] font-semibold text-[#627771] sm:col-span-2">Password (optional)<input type="password" value={profilePassword} onChange={(event) => setProfilePassword(event.target.value)} placeholder="Set a new password" className={fieldClass} /></label>
                    <div className="flex flex-wrap items-center gap-2 sm:col-span-2"><button type="button" onClick={handleProfileSave} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#00bd84] px-3 text-xs font-bold text-white transition hover:bg-[#00a875]"><Pencil size={13} /> Save profile</button><span className="rounded-full border border-[#dce8e5] bg-[#f8fbfa] px-2.5 py-1 text-[10px] font-semibold text-[#667b74]">{selectedUser.role === "admin" ? "Admin role" : "User role"}</span><span className="text-[10px] text-[#899993]">Registered {new Date(selectedUser.createdAt).toLocaleDateString()}</span></div>
                  </div>
                </section>
              </div>
              <section className={`${panelClass} h-fit overflow-hidden`}>
                <div className="border-b border-[#e5eeeb] px-4 py-3.5"><h3 className="text-sm font-bold">Recent activity</h3><p className="mt-1 text-[10px] text-[#778983]">Most recent account records</p></div>
                {tradeHistory.slice(0, 5).length || adminState.fundingHistory.length ? <div className="divide-y divide-[#edf2f0]">
                  {adminState.fundingHistory.slice(0, 3).map((item) => <div key={item.id} className="flex items-center gap-3 px-4 py-3"><span className="grid size-8 place-items-center rounded-lg bg-[#eaf9f3] text-[#008f67]"><ArrowDownToLine size={14} /></span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold">Deposit received</span><span className="mt-0.5 block text-[10px] text-[#84938f]">{new Date(item.createdAt).toLocaleDateString()}</span></span><span className="num text-xs font-semibold">{formatUsd(item.amount)}</span></div>)}
                  {tradeHistory.slice(0, 3).map((trade, index) => <div key={String(trade["id"] ?? index)} className="flex items-center gap-3 px-4 py-3"><span className="grid size-8 place-items-center rounded-lg bg-[#eef6fb] text-[#2982a3]"><Activity size={14} /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{String(trade["side"] ?? "Trade")} {String(trade["pair"] ?? trade["symbol"] ?? "Market")}</span><span className="mt-0.5 block text-[10px] text-[#84938f]">Trade activity</span></span><span className="num text-xs font-semibold">{formatUsd(Number(trade["realizedPnL"] ?? 0))}</span></div>)}
                </div> : <p className="px-4 py-8 text-center text-xs text-[#778983]">No recent activity recorded.</p>}
              </section>
            </div>}

            {detailSection === "balance" && <section className={`${panelClass} p-4 sm:p-5`}>
              <div className="mb-4 flex items-center gap-2"><Wallet size={17} className="text-[#008e67]" /><div><h3 className="text-sm font-bold">Account balance</h3><p className="mt-1 text-[10px] text-[#778983]">Review or adjust portfolio values.</p></div></div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{balanceFields.map(({ label, field }) => <div key={field} className="rounded-lg border border-[#e0eae7] bg-[#f8fbfa] p-3"><label className="text-[10px] font-bold uppercase tracking-wider text-[#758780]">{label}</label><div className="mt-2 flex gap-2"><input type="number" step="any" value={balanceDrafts[field] ?? String(adminState.portfolio[field])} onChange={(event) => setBalanceDrafts((current) => ({ ...current, [field]: event.target.value }))} className="num min-w-0 flex-1 rounded-md border border-[#d7e3e0] bg-white px-2 py-2 text-sm font-bold outline-none focus:border-[#00b887]" /><button type="button" onClick={() => handleSetBalance(field, Number(balanceDrafts[field] ?? adminState.portfolio[field]))} className="rounded-md border border-[#d7e3e0] bg-white px-3 text-[10px] font-bold text-[#47635c] hover:border-[#00b887]/50">Save</button></div></div>)}</div>
              <div className="mt-5 flex flex-col gap-3 border-t border-[#e5eeeb] pt-4 sm:flex-row sm:items-end"><label className="block w-full max-w-xs space-y-1.5 text-[10px] font-semibold text-[#627771]">Manual USDT adjustment<input type="number" step="any" value={delta} onChange={(event) => setDelta(event.target.value)} className={fieldClass} /></label><button type="button" onClick={handleBalanceAdjust} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#00c987] to-[#00b6a3] px-4 text-xs font-bold text-white"><CreditCard size={14} /> Apply balance change</button></div>
            </section>}

            {detailSection === "trades" && <section className={`${panelClass} overflow-hidden`}>
              <div className="border-b border-[#e5eeeb] px-4 py-3.5 sm:px-5"><h3 className="text-sm font-bold">Trade activity</h3><p className="mt-1 text-[10px] text-[#778983]">{tradeHistory.length} recorded trades · edit realized P&amp;L where supported.</p></div>
              {tradeHistory.length === 0 ? <p className="px-5 py-10 text-center text-sm text-[#778983]">No recorded trades yet.</p> : <div className="divide-y divide-[#edf2f0]">{tradeHistory.map((trade, index) => {
                const tradeId = String(trade["id"] ?? `${String(trade["pair"] ?? "trade")}-${index}`);
                const pnl = Number(trade["manualPnl"] ?? trade["pnl"] ?? trade["realizedPnL"] ?? 0);
                return <div key={tradeId} className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(140px,0.5fr)_auto] sm:items-center sm:px-5"><div className="min-w-0"><div className="truncate text-xs font-bold">{String(trade["pair"] ?? trade["symbol"] ?? "Trade")}</div><div className="mt-1 text-[10px] uppercase text-[#82918c]">{String(trade["side"] ?? "Trade")} · {String(trade["type"] ?? "Market")}</div></div><div className="num text-xs font-bold text-[#008e67]">{formatUsd(pnl)}</div><div className="flex gap-2"><input type="number" step="any" value={tradeOverride[tradeId] ?? String(pnl)} onChange={(event) => setTradeOverride((current) => ({ ...current, [tradeId]: event.target.value }))} aria-label={`P&L for ${String(trade["pair"] ?? "trade")}`} className={`${fieldClass} min-w-0`} /><button type="button" onClick={() => handleManualPnl(tradeId, Number(tradeOverride[tradeId] ?? pnl))} className="rounded-lg bg-[#00bd84] px-3 text-xs font-bold text-white">Apply</button></div></div>;
              })}</div>}
            </section>}

            {detailSection === "funding" && <section className={`${panelClass} overflow-hidden`}>
              <div className="border-b border-[#e5eeeb] px-4 py-3.5 sm:px-5"><h3 className="text-sm font-bold">Deposit / withdrawal history</h3><p className="mt-1 text-[10px] text-[#778983]">Funding records available for this account.</p></div>
              {adminState.fundingHistory.length ? <div className="divide-y divide-[#edf2f0]">{adminState.fundingHistory.map((item) => <div key={item.id} className="grid gap-2 px-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(120px,0.7fr)_minmax(120px,0.7fr)] sm:items-center sm:px-5"><span className="flex items-center gap-2 text-xs font-semibold"><span className="grid size-8 place-items-center rounded-lg bg-[#eaf9f3] text-[#008e67]"><ArrowDownToLine size={14} /></span>Deposit</span><span className="text-xs text-[#657a74]">{item.method.replaceAll("-", " ")}</span><span className="num text-xs font-bold">{formatUsd(item.amount)} · {new Date(item.createdAt).toLocaleDateString()}</span></div>)}</div> : <p className="px-5 py-10 text-center text-sm text-[#778983]">No deposit records available.</p>}
              <div className="border-t border-[#e5eeeb] bg-[#f8fbfa] px-4 py-3 text-[10px] text-[#788a84] sm:px-5">Withdrawal history is not available in the current account records.</div>
            </section>}

            {detailSection === "kyc" && <section className={`${panelClass} grid min-h-56 place-items-center p-6 text-center`}><div><span className="mx-auto grid size-11 place-items-center rounded-full bg-[#edf8f4] text-[#00966d]"><BadgeCheck size={20} /></span><h3 className="mt-3 text-sm font-bold">KYC &amp; Verification</h3><p className="mt-1 max-w-sm text-xs leading-5 text-[#758780]">Verification records are not included in the current user account data.</p></div></section>}
            {detailSection === "security" && <section className={`${panelClass} grid min-h-56 place-items-center p-6 text-center`}><div><span className="mx-auto grid size-11 place-items-center rounded-full bg-[#edf8f4] text-[#00966d]"><LockKeyhole size={20} /></span><h3 className="mt-3 text-sm font-bold">Security logs</h3><p className="mt-1 max-w-sm text-xs leading-5 text-[#758780]">Security events are not included in the current user account data.</p></div></section>}
            {detailSection === "notes" && <section className={`${panelClass} grid min-h-56 place-items-center p-6 text-center`}><div><span className="mx-auto grid size-11 place-items-center rounded-full bg-[#edf8f4] text-[#00966d]"><FileText size={20} /></span><h3 className="mt-3 text-sm font-bold">Notes</h3><p className="mt-1 max-w-sm text-xs leading-5 text-[#758780]">No notes are stored for this user in the current account data.</p></div></section>}
          </section>}

          {workspace === "settings" && <section className={`${panelClass} overflow-hidden`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5eeeb] px-4 py-3.5 sm:px-5"><div><h2 className="text-sm font-bold">Complete account data</h2><p className="mt-1 text-[10px] text-[#778983]">Assets, balances, orders, trade history, funding records and watchlist.</p></div><div className="flex gap-2"><button type="button" onClick={() => { setAccountJson(JSON.stringify(accountState, null, 2)); setAccountJsonError(""); }} className="min-h-9 rounded-lg border border-[#dce8e5] bg-white px-3 text-xs font-semibold">Reset</button><button type="button" onClick={handleSaveAccountData} className="min-h-9 rounded-lg bg-[#00bd84] px-3 text-xs font-bold text-white">Save account data</button></div></div>
            {selectedUser ? <div className="p-4 sm:p-5"><p className="mb-3 text-xs text-[#74857f]">Editing {selectedUser.name} · {selectedUser.email}</p><textarea aria-label="Complete account data JSON" value={accountJson} onChange={(event) => { setAccountJson(event.target.value); setAccountJsonError(""); }} spellCheck={false} className="min-h-[360px] w-full resize-y rounded-lg border border-[#d7e3e0] bg-[#f8fbfa] p-3 font-mono text-xs leading-5 text-[#173a34] outline-none focus:border-[#00b887]" />{accountJsonError && <p role="alert" className="mt-2 text-xs text-red-600">{accountJsonError}</p>}</div> : <p className="px-5 py-10 text-center text-sm text-[#778983]">Select a user before editing account data.</p>}
          </section>}

          {workspace === "kyc" && <section className={`${panelClass} grid min-h-56 place-items-center p-6 text-center`}><div><span className="mx-auto grid size-11 place-items-center rounded-full bg-[#edf8f4] text-[#00966d]"><BadgeCheck size={20} /></span><h2 className="mt-3 text-sm font-bold">KYC verification</h2><p className="mt-1 max-w-sm text-xs leading-5 text-[#758780]">Verification records are not available from the current user data.</p></div></section>}
          {workspace === "support" && <section className={`${panelClass} grid min-h-56 place-items-center p-6 text-center`}><div><span className="mx-auto grid size-11 place-items-center rounded-full bg-[#edf8f4] text-[#00966d]"><CircleHelp size={20} /></span><h2 className="mt-3 text-sm font-bold">Support</h2><p className="mt-1 max-w-sm text-xs leading-5 text-[#758780]">Support records are not available from the current admin data.</p></div></section>}
        </main>
      </div>
    </div>
  );
}
