import { supabase } from "@/lib/supabase";
import type {
  DebtMutationInput,
  DebtRow,
  ServiceScopeOptions,
} from "@/types/finance";

function getErrorText(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "";
}

function isMissingUserIdColumnError(error: unknown) {
  const errorText = getErrorText(error).toLocaleLowerCase("en-US");

  return (
    errorText.includes("user_id") &&
    (errorText.includes("column") ||
      errorText.includes("schema cache") ||
      errorText.includes("could not find"))
  );
}

export async function fetchDebtItems(
  options: ServiceScopeOptions = {},
): Promise<DebtRow[]> {
  console.info("[debt-service] fetchDebtItems:start", {
    userId: options.userId ?? null,
  });
  let query = supabase.from("debts").select("*");

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  }

  const { data, error } = await query.order("id", { ascending: false });

  if (error) {
    if (options.userId && isMissingUserIdColumnError(error)) {
      console.warn(
        '[debt-service] fetchDebtItems: user_id kolonu bulunamadı, filtresiz sorguya düşülüyor.',
      );

      const fallbackResult = await supabase
        .from("debts")
        .select("*")
        .order("id", { ascending: false });

      if (fallbackResult.error) {
        console.error("[debt-service] fetchDebtItems:error", fallbackResult.error);
        throw fallbackResult.error;
      }

      console.info("[debt-service] fetchDebtItems:fallback-success", {
        count: fallbackResult.data?.length ?? 0,
      });

      return (fallbackResult.data ?? []) as DebtRow[];
    }

    console.error("[debt-service] fetchDebtItems:error", error);
    throw error;
  }

  console.info("[debt-service] fetchDebtItems:success", {
    count: data?.length ?? 0,
  });

  return (data ?? []) as DebtRow[];
}

export async function addDebtItem(
  payload: DebtMutationInput,
  options: ServiceScopeOptions = {},
) {
  const insertPayload = options.userId
    ? [{ ...payload, user_id: options.userId }]
    : [payload];
  const fallbackInsertPayload = [{ ...payload }];

  console.info("[debt-service] addDebtItem:insert", {
    payload: insertPayload,
    userId: options.userId ?? null,
  });

  const { data, error } = await supabase
    .from("debts")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    if (options.userId && isMissingUserIdColumnError(error)) {
      console.warn(
        '[debt-service] addDebtItem: user_id kolonu bulunamadı, user_id olmadan tekrar deneniyor.',
      );

      const fallbackResult = await supabase
        .from("debts")
        .insert(fallbackInsertPayload)
        .select("*")
        .single();

      if (fallbackResult.error) {
        console.error("[debt-service] addDebtItem:error", fallbackResult.error);
        throw fallbackResult.error;
      }

      console.info("[debt-service] addDebtItem:fallback-success", {
        id: fallbackResult.data.id,
      });

      return fallbackResult.data as DebtRow;
    }

    console.error("[debt-service] addDebtItem:error", error);
    throw error;
  }

  console.info("[debt-service] addDebtItem:success", {
    id: data.id,
  });

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
    if (options.userId && isMissingUserIdColumnError(error)) {
      const fallbackResult = await supabase.from("debts").update(payload).eq("id", id);

      if (fallbackResult.error) {
        console.error("[debt-service] updateDebtItem:error", fallbackResult.error);
        throw fallbackResult.error;
      }

      return;
    }

    console.error("[debt-service] updateDebtItem:error", error);
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
    if (options.userId && isMissingUserIdColumnError(error)) {
      const fallbackResult = await supabase.from("debts").delete().eq("id", id);

      if (fallbackResult.error) {
        console.error("[debt-service] deleteDebtItem:error", fallbackResult.error);
        throw fallbackResult.error;
      }

      return;
    }

    console.error("[debt-service] deleteDebtItem:error", error);
    throw error;
  }
}
