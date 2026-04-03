import { supabase } from "@/lib/supabase";
import type { Payment, ServiceScopeOptions } from "@/types/finance";

type CreatePaymentInput = {
  user_id?: string | null;
  debt_id: number;
  cash_id: number;
  amount: number;
  note: string | null;
};

type UpdatePaymentInput = {
  user_id?: string | null;
  debt_id: number;
  cash_id: number;
  amount: number;
  note: string | null;
};

export async function fetchPaymentItems(
  options: ServiceScopeOptions = {},
): Promise<Payment[]> {
  let query = supabase.from("payments").select("*");

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  }

  const { data, error } = await query.order("id", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Payment[];
}

export async function createPaymentItem(
  payload: CreatePaymentInput,
  options: ServiceScopeOptions = {},
) {
  const insertPayload =
    options.userId && !payload.user_id
      ? [{ ...payload, user_id: options.userId }]
      : [payload];
  const { data, error } = await supabase
    .from("payments")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Payment;
}

export async function deletePaymentItem(
  id: number,
  options: ServiceScopeOptions = {},
) {
  let query = supabase.from("payments").delete().eq("id", id);

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  }

  const { error } = await query;

  if (error) {
    throw error;
  }
}

export async function updatePaymentItem(
  id: number,
  payload: UpdatePaymentInput,
  options: ServiceScopeOptions = {},
) {
  let query = supabase.from("payments").update(payload).eq("id", id);

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  }

  const { data, error } = await query.select("*").single();

  if (error) {
    throw error;
  }

  return data as Payment;
}

async function countPaymentsByColumn(
  column: "debt_id" | "cash_id",
  id: number,
  options: ServiceScopeOptions = {},
) {
  let query = supabase
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq(column, id);

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function countPaymentsByDebtId(
  id: number,
  options: ServiceScopeOptions = {},
) {
  return countPaymentsByColumn("debt_id", id, options);
}

export async function countPaymentsByCashId(
  id: number,
  options: ServiceScopeOptions = {},
) {
  return countPaymentsByColumn("cash_id", id, options);
}
