import { createClient, type User } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const service = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type AccountState = {
  userId: string;
  portfolio: {
    totalBalance: number;
    availableBalance: number;
    unrealizedPnL: number;
    realizedPnL: number;
  };
  assets: Record<string, number>;
  positions?: Record<string, { quantity: number; averageEntryPrice: number }>;
  orders: { openOrders: unknown[]; orderHistory: unknown[]; tradeHistory: unknown[] };
  fundingHistory: unknown[];
  watchlist: string[];
};

type ProfileRow = {
  id: string;
  full_name: string;
  role: "user" | "admin";
  suspended: boolean;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function profileView(profile: ProfileRow, user: User) {
  return {
    id: profile.id,
    name: profile.full_name || "Nexora user",
    email: user.email ?? "",
    createdAt: user.created_at,
    accountType: profile.role === "admin" ? "admin" : "demo",
    role: profile.role,
    suspended: profile.suspended,
  };
}

function initialAccountState(userId: string): AccountState {
  return {
    userId,
    portfolio: { totalBalance: 0, availableBalance: 0, unrealizedPnL: 0, realizedPnL: 0 },
    assets: { USDT: 0, BTC: 0, ETH: 0, SOL: 0, BNB: 0, XRP: 0, DOGE: 0 },
    positions: {},
    orders: { openOrders: [], orderHistory: [], tradeHistory: [] },
    fundingHistory: [],
    watchlist: ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
  };
}

async function getTargetProfile(userId: string) {
  const { data, error } = await service
    .from("profiles")
    .select("id, full_name, role, suspended")
    .eq("id", userId)
    .single();
  if (error) throw error;
  if (data.role !== "user") throw new Error("Admin accounts cannot be managed here.");
  return data as ProfileRow;
}

async function getTargetUser(userId: string) {
  const profile = await getTargetProfile(userId);
  const { data, error } = await service.auth.admin.getUserById(userId);
  if (error) throw error;
  return { profile, user: data.user };
}

async function setUserSuspension(
  userId: string,
  profile: ProfileRow,
  user: User,
  suspended: boolean,
) {
  if (suspended === profile.suspended) return profileView(profile, user);

  if (suspended) {
    const { error } = await service.from("profiles").update({ suspended: true }).eq("id", userId);
    if (error) throw error;

    const { error: authError } = await service.auth.admin.updateUserById(userId, {
      ban_duration: "876000h",
    });
    if (authError) {
      const { error: rollbackError } = await service
        .from("profiles")
        .update({ suspended: false })
        .eq("id", userId);
      if (rollbackError)
        console.error("Failed to restore profile after Auth ban error:", rollbackError.message);
      throw authError;
    }
  } else {
    const { error: authError } = await service.auth.admin.updateUserById(userId, {
      ban_duration: "none",
    });
    if (authError) throw authError;

    const { error } = await service.from("profiles").update({ suspended: false }).eq("id", userId);
    if (error) {
      const { error: rollbackError } = await service.auth.admin.updateUserById(userId, {
        ban_duration: "876000h",
      });
      if (rollbackError)
        console.error("Failed to restore Auth ban after reactivation error:", rollbackError.message);
      throw error;
    }
  }

  return profileView({ ...profile, suspended }, user);
}

async function getAccountState(userId: string) {
  const { data, error } = await service
    .from("account_data")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data?.data as AccountState | undefined) ?? initialAccountState(userId);
}

async function saveAccountState(userId: string, state: AccountState) {
  if (!state || state.userId !== userId || !state.portfolio || !state.assets || !state.orders) {
    throw new Error("Invalid account data.");
  }
  const { error } = await service.from("account_data").upsert(
    {
      user_id: userId,
      data: state,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

async function listUsers() {
  const users: User[] = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 100) break;
  }
  const { data: profiles, error: profileError } = await service
    .from("profiles")
    .select("id, full_name, role, suspended");
  if (profileError) throw profileError;

  const profileById = new Map((profiles as ProfileRow[]).map((profile) => [profile.id, profile]));
  const missingProfiles = users.filter((user) => !profileById.has(user.id));
  if (missingProfiles.length) {
    const { data: repairedProfiles, error } = await service
      .from("profiles")
      .upsert(
        missingProfiles.map((user) => ({
          id: user.id,
          full_name:
            typeof user.user_metadata?.["full_name"] === "string"
              ? user.user_metadata["full_name"]
              : "",
          suspended: true,
        })),
        { onConflict: "id" },
      )
      .select("id, full_name, role, suspended");
    if (error) throw error;
    for (const profile of repairedProfiles as ProfileRow[]) profileById.set(profile.id, profile);
  }

  return users.flatMap((user) => {
    const profile = profileById.get(user.id);
    return profile?.role === "user" ? [profileView(profile, user)] : [];
  });
}

async function handleAction(action: string, body: Record<string, unknown>) {
  if (action === "list-users") return listUsers();

  if (action === "create-user") {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
      throw new Error("Enter a name, valid email and password with at least 8 characters.");
    }
    const { data, error } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });
    if (error) throw error;
    const { profile, user } = await getTargetUser(data.user.id);
    return profileView(profile, user);
  }

  const userId = typeof body.userId === "string" ? body.userId : "";
  if (!userId) throw new Error("A user ID is required.");

  if (action === "get-account") {
    await getTargetProfile(userId);
    return await getAccountState(userId);
  }

  if (action === "save-account") {
    await getTargetProfile(userId);
    await saveAccountState(userId, body.state as AccountState);
    return null;
  }

  if (action === "update-user") {
    const { profile, user } = await getTargetUser(userId);
    const changes =
      body.changes && typeof body.changes === "object"
        ? (body.changes as Record<string, unknown>)
        : {};
    const authChanges: { email?: string; password?: string } = {};
    const profileChanges: { full_name?: string } = {};
    const suspended = typeof changes.suspended === "boolean" ? changes.suspended : undefined;
    if (typeof changes.name === "string" && changes.name.trim())
      profileChanges.full_name = changes.name.trim();
    if (typeof changes.email === "string" && changes.email.trim())
      authChanges.email = changes.email.trim().toLowerCase();
    if (typeof changes.password === "string" && changes.password.length > 0) {
      if (changes.password.length < 8) throw new Error("Password must have at least 8 characters.");
      authChanges.password = changes.password;
    }
    if (Object.keys(authChanges).length) {
      const { error } = await service.auth.admin.updateUserById(userId, authChanges);
      if (error) throw error;
    }
    if (Object.keys(profileChanges).length) {
      const { error } = await service.from("profiles").update(profileChanges).eq("id", userId);
      if (error) throw error;
    }
    if (suspended !== undefined && suspended !== profile.suspended) {
      await setUserSuspension(userId, profile, user, suspended);
    }
    const { profile: nextProfile, user: nextUser } = await getTargetUser(userId);
    return profileView(nextProfile, nextUser);
  }

  if (action === "set-suspension") {
    const { profile, user } = await getTargetUser(userId);
    const suspended = body.suspended;
    if (typeof suspended !== "boolean") throw new Error("A suspension status is required.");
    return setUserSuspension(userId, profile, user, suspended);
  }

  if (action === "delete-user") {
    await getTargetProfile(userId);
    const { error: deleteError } = await service.auth.admin.deleteUser(userId);
    if (deleteError) {
      if (!/database error deleting user|foreign key|constraint/i.test(deleteError.message)) {
        throw deleteError;
      }
      const { error: accountError } = await service.from("account_data").delete().eq("user_id", userId);
      if (accountError) throw accountError;
      const { error: profileError } = await service.from("profiles").delete().eq("id", userId);
      if (profileError) throw profileError;
      const { error } = await service.auth.admin.deleteUser(userId);
      if (error) throw error;
    }
    const { error: accountCleanupError } = await service
      .from("account_data")
      .delete()
      .eq("user_id", userId);
    if (accountCleanupError) throw accountCleanupError;
    const { error: profileCleanupError } = await service.from("profiles").delete().eq("id", userId);
    if (profileCleanupError) throw profileCleanupError;
    return null;
  }

  if (action === "adjust-balance") {
    await getTargetProfile(userId);
    const state = await getAccountState(userId);
    const changes =
      body.changes && typeof body.changes === "object"
        ? (body.changes as Record<string, unknown>)
        : {};
    const { deltaUSDT = 0, ...portfolioChanges } = changes;
    const hasAvailable = portfolioChanges.availableBalance !== undefined;
    const hasTotal = portfolioChanges.totalBalance !== undefined;
    const availableBalance = hasAvailable
      ? Number(portfolioChanges.availableBalance)
      : hasTotal
        ? state.portfolio.availableBalance +
          Number(portfolioChanges.totalBalance) -
          state.portfolio.totalBalance
        : state.portfolio.availableBalance + Number(deltaUSDT);
    const balanceDelta = availableBalance - state.portfolio.availableBalance;
    const totalBalance = hasTotal
      ? Number(portfolioChanges.totalBalance)
      : state.portfolio.totalBalance + balanceDelta;
    if (
      !Number.isFinite(availableBalance) ||
      availableBalance < 0 ||
      !Number.isFinite(totalBalance) ||
      totalBalance < 0
    ) {
      throw new Error("Account balances must be valid, non-negative amounts.");
    }
    const {
      availableBalance: _available,
      totalBalance: _total,
      ...otherChanges
    } = portfolioChanges;
    const next: AccountState = {
      ...state,
      portfolio: { ...state.portfolio, ...otherChanges, availableBalance, totalBalance },
      assets: { ...state.assets, USDT: availableBalance },
    };
    await saveAccountState(userId, next);
    return next;
  }

  if (action === "adjust-trade-pnl") {
    await getTargetProfile(userId);
    const pnl = Number(body.pnl);
    const tradeId = typeof body.tradeId === "string" ? body.tradeId : "";
    if (!Number.isFinite(pnl)) throw new Error("Enter a valid P&L amount.");
    const state = await getAccountState(userId);
    const tradeHistory = state.orders.tradeHistory.map((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return entry;
      const record = entry as Record<string, unknown>;
      if (record.id !== tradeId) return entry;
      return {
        ...record,
        manualPnl: pnl,
        pnl,
        realizedPnL: pnl,
        adjustedByAdmin: true,
        updatedAt: new Date().toISOString(),
      };
    });
    const matchedTrade = tradeHistory.find((entry) =>
      Boolean(
        entry &&
        typeof entry === "object" &&
        !Array.isArray(entry) &&
        (entry as Record<string, unknown>).id === tradeId,
      ),
    );
    if (!matchedTrade) throw new Error("The selected trade could not be found.");
    const original = state.orders.tradeHistory.find((entry) =>
      Boolean(
        entry &&
        typeof entry === "object" &&
        !Array.isArray(entry) &&
        (entry as Record<string, unknown>).id === tradeId,
      ),
    ) as Record<string, unknown>;
    const previousPnl = Number(original.manualPnl ?? original.realizedPnL ?? original.pnl ?? 0);
    const pnlDelta = pnl - previousPnl;
    const nextUsdt = Number(state.assets.USDT ?? 0) + pnlDelta;
    if (nextUsdt < -1e-8)
      throw new Error("This loss would make the user's available USDT balance negative.");
    const orderHistory = state.orders.orderHistory.map((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return entry;
      const record = entry as Record<string, unknown>;
      return record.id === tradeId
        ? {
            ...record,
            manualPnl: pnl,
            pnl,
            realizedPnL: pnl,
            adjustedByAdmin: true,
            updatedAt: new Date().toISOString(),
          }
        : entry;
    });
    const next: AccountState = {
      ...state,
      assets: { ...state.assets, USDT: Math.max(0, nextUsdt) },
      orders: { ...state.orders, tradeHistory, orderHistory },
      portfolio: {
        ...state.portfolio,
        totalBalance: state.portfolio.totalBalance + pnlDelta,
        availableBalance: Math.max(0, nextUsdt),
        realizedPnL: state.portfolio.realizedPnL + pnlDelta,
      },
    };
    await saveAccountState(userId, next);
    return next;
  }

  throw new Error("Unknown admin action.");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  if (!supabaseUrl || !anonKey || !serviceRoleKey)
    return json({ error: "Admin function is not configured." }, 500);

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer "))
      return json({ error: "Authentication required." }, 401);
    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const {
      data: { user },
      error: authError,
    } = await caller.auth.getUser();
    if (authError || !user) return json({ error: "Invalid session." }, 401);

    const { data: adminProfile, error: profileError } = await service
      .from("profiles")
      .select("role, suspended")
      .eq("id", user.id)
      .single();
    if (profileError || adminProfile?.role !== "admin" || adminProfile.suspended) {
      return json({ error: "Administrator access required." }, 403);
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || typeof body.action !== "string") {
      return json({ error: "Invalid request." }, 400);
    }
    const result = await handleAction(body.action, body as Record<string, unknown>);
    return json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Admin operation failed.";
    return json({ error: message }, 400);
  }
});
