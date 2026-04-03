import { supabase } from "@/lib/supabase";
import type {
  DebtMutationInput,
  DebtRow,
  ServiceScopeOptions,
} from "@/types/finance";

export async function fetchDebtItems(
  options: ServiceScopeOptions = {},
): Promise<DebtRow[]> {
  let query = supabase.from("debts").select("*");

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  }

  const { data, error } = await query.order("id", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as DebtRow[];
}

export async function addDebtItem(
  payload: DebtMutationInput,
  options: ServiceScopeOptions = {},
) {
  const insertPayload = options.userId
    ? [{ ...payload, user_id: options.userId }]
    : [payload];
  const { data, error } = await supabase
    .from("debts")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as DebtRow;
}

export async function updateDebtItem(
  id: number,
  payload: DebtMutationInput,
  options: ServiceScopeOptions = {},
) {
  let query = supabase.from("debts").update(payload).eq("id", id);

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  }

  const { error } = await query;

  if (error) {
    throw error;
  }
}

export async function deleteDebtItem(
  id: number,
  options: ServiceScopeOptions = {},
) {
  let query = supabase.from("debts").delete().eq("id", id);

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  }

  const { error } = await query;

  if (error) {
    throw error;
  }
}
