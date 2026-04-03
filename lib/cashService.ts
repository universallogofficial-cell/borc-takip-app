import { supabase } from "@/lib/supabase";
import type {
  CashItem,
  CashMutationInput,
  ServiceScopeOptions,
} from "@/types/finance";

export async function fetchCashItems(
  options: ServiceScopeOptions = {},
): Promise<CashItem[]> {
  let query = supabase.from("cash").select("*");

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  }

  const { data, error } = await query.order("id", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as CashItem[];
}

export async function addCashItem(
  payload: CashMutationInput,
  options: ServiceScopeOptions = {},
) {
  const insertPayload = options.userId
    ? [{ ...payload, user_id: options.userId }]
    : [payload];
  const { data, error } = await supabase
    .from("cash")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as CashItem;
}

export async function updateCashItem(
  id: number,
  payload: CashMutationInput,
  options: ServiceScopeOptions = {},
) {
  let query = supabase.from("cash").update(payload).eq("id", id);

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  }

  const { error } = await query;

  if (error) {
    throw error;
  }
}

export async function deleteCashItem(
  id: number,
  options: ServiceScopeOptions = {},
) {
  let query = supabase.from("cash").delete().eq("id", id);

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  }

  const { error } = await query;

  if (error) {
    throw error;
  }
}
