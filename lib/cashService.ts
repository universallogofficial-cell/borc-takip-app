import { supabase } from "@/lib/supabase";
import type {
  CashItem,
  CashMutationInput,
  ServiceScopeOptions,
} from "@/types/finance";

export async function fetchCashItems(
  options: ServiceScopeOptions = {},
): Promise<CashItem[]> {
  console.info("[cash-service] fetchCashItems:start", {
    userId: options.userId ?? null,
  });
  let query = supabase.from("cash").select("*");

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  }

  const { data, error } = await query.order("id", { ascending: true });

  if (error) {
    console.error("[cash-service] fetchCashItems:error", error);
    throw error;
  }

  console.info("[cash-service] fetchCashItems:success", {
    count: data?.length ?? 0,
  });

  return (data ?? []) as CashItem[];
}

export async function addCashItem(
  payload: CashMutationInput,
  options: ServiceScopeOptions = {},
  returnInsertedCash = false,
) {
  const insertPayload = options.userId
    ? [{ ...payload, user_id: options.userId }]
    : [payload];

  console.info("[cash-service] addCashItem:insert", {
    payload: insertPayload,
    returnInsertedCash,
  });

  if (!returnInsertedCash) {
    const { error } = await supabase.from("cash").insert(insertPayload);

    if (error) {
      console.error("[cash-service] addCashItem:error", error);
      throw error;
    }

    console.info("[cash-service] addCashItem:success-no-return");

    return null;
  }

  const { data, error } = await supabase
    .from("cash")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    console.error("[cash-service] addCashItem:error", error);
    throw error;
  }

  console.info("[cash-service] addCashItem:success-with-return", {
    id: data.id,
  });

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
