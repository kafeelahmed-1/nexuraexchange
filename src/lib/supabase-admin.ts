import { supabase } from "@/lib/supabase";
import {
  createInitialAccountState,
  type DemoAccountState,
  type DemoProfile,
} from "@/lib/supabase-auth";

type AdminReply<T> = { data?: T; error?: string };

async function adminRequest<T>(action: string, payload: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke<AdminReply<T>>("admin-user-management", {
    body: { action, ...payload },
  });
  if (error) {
    const context = "context" in error ? error.context : undefined;
    if (context instanceof Response) {
      const reply = (await context.clone().json().catch(() => null)) as AdminReply<T> | null;
      if (reply?.error) throw new Error(reply.error);
    }
    throw error;
  }
  if (!data || data.error || data.data === undefined)
    throw new Error(data?.error ?? "Admin request failed.");
  return data.data;
}

export function getAllDemoUsers() {
  return adminRequest<DemoProfile[]>("list-users");
}

export async function getAdminAccountState(userId: string) {
  return (
    (await adminRequest<DemoAccountState | null>("get-account", { userId })) ??
    createInitialAccountState(userId)
  );
}

export async function saveAdminAccountState(state: DemoAccountState) {
  return adminRequest<void>("save-account", { userId: state.userId, state });
}

export function createDemoUserByAdmin(name: string, email: string, password: string) {
  return adminRequest<DemoProfile>("create-user", { name, email, password });
}

export function updateDemoUserProfile(
  userId: string,
  changes: Partial<Pick<DemoProfile, "name" | "email" | "suspended">> & { password?: string },
) {
  return adminRequest<DemoProfile>("update-user", { userId, changes });
}

export function setDemoUserSuspension(userId: string, suspended: boolean) {
  return adminRequest<DemoProfile>("set-suspension", { userId, suspended });
}

export function deleteDemoUser(userId: string) {
  return adminRequest<void>("delete-user", { userId });
}

export async function applyTradeManualPnl(userId: string, tradeId: string, pnl: number) {
  return adminRequest<DemoAccountState>("adjust-trade-pnl", { userId, tradeId, pnl });
}

export async function adjustBalance(
  userId: string,
  changes: Partial<DemoAccountState["portfolio"]> & { deltaUSDT?: number },
) {
  return adminRequest<DemoAccountState>("adjust-balance", { userId, changes });
}
