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
  const { error } = await supabase.from("cash").insert(insertPayload);

  if (error) {
    throw error;
  }

  let query = supabase
    .from("cash")
    .select("*")
    .eq("name", payload.name)
    .eq("balance", payload.balance)
    .order("id", { ascending: false })
    .limit(1);

  if (payload.note === null) {
    query = query.is("note", null);
  } else {
    query = query.eq("note", payload.note);
  }

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  }

  const { data: insertedCash, error: fetchError } = await query.maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (!insertedCash) {
    throw new Error("Kasa kaydı eklendi ancak yeni kayıt doğrulanamadı.");
  }

  return insertedCash as CashItem;
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
