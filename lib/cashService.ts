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
  console.info("cashService.addCashItem insert payload", {
    insertPayload,
    userId: options.userId ?? null,
  });
  const { error } = await supabase.from("cash").insert(insertPayload);

  if (error) {
    console.error("cashService.addCashItem insert error", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }

  let query = supabase
    .from("cash")
    .select("*")
    .order("id", { ascending: false })
    .limit(1);

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  } else {
    query = query.eq("name", payload.name);
  }

  const { data: insertedCash, error: fetchError } = await query.maybeSingle();

  if (fetchError) {
    console.error("cashService.addCashItem fetch error", {
      message: fetchError.message,
      details: fetchError.details,
      hint: fetchError.hint,
      code: fetchError.code,
    });
    throw new Error(
      `Kasa kaydı eklendi ancak yeni kayıt okunamadı: ${fetchError.message}`,
    );
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
