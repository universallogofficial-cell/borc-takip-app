import { supabase } from "@/lib/supabase";
import type {
  CashItem,
  CashMutationInput,
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
    if (options.userId && isMissingUserIdColumnError(error)) {
      console.warn(
        '[cash-service] fetchCashItems: user_id kolonu bulunamadı, filtresiz sorguya düşülüyor.',
      );

      const fallbackResult = await supabase
        .from("cash")
        .select("*")
        .order("id", { ascending: true });

      if (fallbackResult.error) {
        console.error("[cash-service] fetchCashItems:error", fallbackResult.error);
        throw fallbackResult.error;
      }

      console.info("[cash-service] fetchCashItems:fallback-success", {
        count: fallbackResult.data?.length ?? 0,
      });

      return (fallbackResult.data ?? []) as CashItem[];
    }

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
  const fallbackInsertPayload = [{ ...payload }];

  console.info("[cash-service] addCashItem:insert", {
    payload: insertPayload,
    returnInsertedCash,
  });

  if (!returnInsertedCash) {
    const { error } = await supabase.from("cash").insert(insertPayload);

    if (error) {
      if (options.userId && isMissingUserIdColumnError(error)) {
        console.warn(
          '[cash-service] addCashItem: user_id kolonu bulunamadı, user_id olmadan tekrar deneniyor.',
        );

        const fallbackResult = await supabase
          .from("cash")
          .insert(fallbackInsertPayload);

        if (fallbackResult.error) {
          console.error("[cash-service] addCashItem:error", fallbackResult.error);
          throw fallbackResult.error;
        }

        console.info("[cash-service] addCashItem:fallback-success-no-return");
        return null;
      }

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
    if (options.userId && isMissingUserIdColumnError(error)) {
      console.warn(
        '[cash-service] addCashItem: user_id kolonu bulunamadı, select ile user_id olmadan tekrar deneniyor.',
      );

      const fallbackResult = await supabase
        .from("cash")
        .insert(fallbackInsertPayload)
        .select("*")
        .single();

      if (fallbackResult.error) {
        console.error("[cash-service] addCashItem:error", fallbackResult.error);
        throw fallbackResult.error;
      }

      console.info("[cash-service] addCashItem:fallback-success-with-return", {
        id: fallbackResult.data.id,
      });

      return fallbackResult.data as CashItem;
    }

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
    if (options.userId && isMissingUserIdColumnError(error)) {
      const fallbackResult = await supabase.from("cash").update(payload).eq("id", id);

      if (fallbackResult.error) {
        throw fallbackResult.error;
      }

      return;
    }

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
    if (options.userId && isMissingUserIdColumnError(error)) {
      const fallbackResult = await supabase.from("cash").delete().eq("id", id);

      if (fallbackResult.error) {
        throw fallbackResult.error;
      }

      return;
    }

    throw error;
  }
}
