import { supabase } from "@/lib/supabase";
import type { Payment, ServiceScopeOptions } from "@/types/finance";

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
  console.info("[payment-service] fetchPaymentItems:start", {
    userId: options.userId ?? null,
  });
  let query = supabase.from("payments").select("*");

  if (options.userId) {
    query = query.eq("user_id", options.userId);
  }

  const { data, error } = await query.order("id", { ascending: false });

  if (error) {
    if (options.userId && isMissingUserIdColumnError(error)) {
      console.warn(
        '[payment-service] fetchPaymentItems: user_id kolonu bulunamadı, filtresiz sorguya düşülüyor.',
      );

      const fallbackResult = await supabase
        .from("payments")
        .select("*")
        .order("id", { ascending: false });

      if (fallbackResult.error) {
        console.error(
          "[payment-service] fetchPaymentItems:error",
          fallbackResult.error,
        );
        throw fallbackResult.error;
      }

      console.info("[payment-service] fetchPaymentItems:fallback-success", {
        count: fallbackResult.data?.length ?? 0,
      });

      return (fallbackResult.data ?? []) as Payment[];
    }

    console.error("[payment-service] fetchPaymentItems:error", error);
    throw error;
  }

  console.info("[payment-service] fetchPaymentItems:success", {
    count: data?.length ?? 0,
  });

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
  const fallbackInsertPayload = [{ ...payload }];

  console.info("[payment-service] createPaymentItem:insert", {
    payload: insertPayload,
    userId: options.userId ?? null,
  });

  const { data, error } = await supabase
    .from("payments")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    if (options.userId && isMissingUserIdColumnError(error)) {
      console.warn(
        '[payment-service] createPaymentItem: user_id kolonu bulunamadı, user_id olmadan tekrar deneniyor.',
      );

      const fallbackResult = await supabase
        .from("payments")
        .insert(fallbackInsertPayload)
        .select("*")
        .single();

      if (fallbackResult.error) {
        console.error(
          "[payment-service] createPaymentItem:error",
          fallbackResult.error,
        );
        throw fallbackResult.error;
      }

      console.info("[payment-service] createPaymentItem:fallback-success", {
        id: fallbackResult.data.id,
      });

      return fallbackResult.data as Payment;
    }

    console.error("[payment-service] createPaymentItem:error", error);
    throw error;
  }

  console.info("[payment-service] createPaymentItem:success", {
    id: data.id,
  });

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
    if (options.userId && isMissingUserIdColumnError(error)) {
      const fallbackResult = await supabase.from("payments").delete().eq("id", id);

      if (fallbackResult.error) {
        console.error("[payment-service] deletePaymentItem:error", fallbackResult.error);
        throw fallbackResult.error;
      }

      return;
    }

    console.error("[payment-service] deletePaymentItem:error", error);
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
    if (options.userId && isMissingUserIdColumnError(error)) {
      const fallbackResult = await supabase
        .from("payments")
        .update(payload)
        .eq("id", id)
        .select("*")
        .single();

      if (fallbackResult.error) {
        console.error("[payment-service] updatePaymentItem:error", fallbackResult.error);
        throw fallbackResult.error;
      }

      return fallbackResult.data as Payment;
    }

    console.error("[payment-service] updatePaymentItem:error", error);
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
    if (options.userId && isMissingUserIdColumnError(error)) {
      const fallbackResult = await supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq(column, id);

      if (fallbackResult.error) {
        console.error(
          "[payment-service] countPaymentsByColumn:error",
          fallbackResult.error,
        );
        throw fallbackResult.error;
      }

      return fallbackResult.count ?? 0;
    }

    console.error("[payment-service] countPaymentsByColumn:error", error);
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
