import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type AuthGateProps = {
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  message: string | null;
  messageType: "success" | "error" | null;
};

type AuthMode = "sign_in" | "sign_up" | "forgot_password";

type LocalMessage = {
  text: string;
  type: "success" | "error";
} | null;

const modeCopy: Record<
  AuthMode,
  {
    title: string;
    description: string;
    submitLabel: string;
  }
> = {
  sign_in: {
    title: "Giriş Yap",
    description: "Hesabınıza e-posta ve şifre ile giriş yapın.",
    submitLabel: "Giriş Yap",
  },
  sign_up: {
    title: "Hesap Oluştur",
    description: "Yeni hesap açın ve verilerinizi kişisel oturumunuzda tutun.",
    submitLabel: "Hesap Oluştur",
  },
  forgot_password: {
    title: "Şifremi Unuttum",
    description: "Şifre yenileme bağlantısını e-posta adresinize gönderin.",
    submitLabel: "Sıfırlama Bağlantısı Gönder",
  },
};

export default function AuthGate({
  email,
  onEmailChange,
  isSubmitting,
  message,
  messageType,
}: AuthGateProps) {
  const [mode, setMode] = useState<AuthMode>("sign_in");
  const [formEmail, setFormEmail] = useState(email);
  const [password, setPassword] = useState("");
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [localMessage, setLocalMessage] = useState<LocalMessage>(null);

  useEffect(() => {
    setFormEmail(email);
  }, [email]);

  const isBusy = isSubmitting || localSubmitting;
  const currentCopy = modeCopy[mode];
  const visibleMessage = useMemo(
    () =>
      localMessage ??
      (message
        ? {
            text: message,
            type: messageType === "error" ? "error" : "success",
          }
        : null),
    [localMessage, message, messageType],
  );

  const updateEmail = (value: string) => {
    setFormEmail(value);
    onEmailChange(value);
  };

  const handleGoogleSignIn = async () => {
    setLocalSubmitting(true);
    setLocalMessage(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          typeof window === "undefined" ? undefined : window.location.origin,
      },
    });

    if (error) {
      console.error("Google giriş hatası:", error);
      setLocalMessage({
        text: "Google ile giriş başlatılamadı.",
        type: "error",
      });
      setLocalSubmitting(false);
      return;
    }
  };

  const handleMagicLink = async () => {
    const normalizedEmail = formEmail.trim().toLocaleLowerCase("tr-TR");

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setLocalMessage({
        text: "Geçerli bir e-posta adresi girin.",
        type: "error",
      });
      return;
    }

    setLocalSubmitting(true);
    setLocalMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo:
          typeof window === "undefined" ? undefined : window.location.origin,
      },
    });

    if (error) {
      console.error("Magic link giriş hatası:", error);
      setLocalMessage({
        text: "Giriş bağlantısı gönderilemedi.",
        type: "error",
      });
      setLocalSubmitting(false);
      return;
    }

    setLocalMessage({
      text: "Giriş bağlantısı e-posta adresinize gönderildi.",
      type: "success",
    });
    setLocalSubmitting(false);
  };

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedEmail = formEmail.trim().toLocaleLowerCase("tr-TR");

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setLocalMessage({
        text: "Geçerli bir e-posta adresi girin.",
        type: "error",
      });
      return;
    }

    if (mode !== "forgot_password" && password.trim().length < 6) {
      setLocalMessage({
        text: "Şifre en az 6 karakter olmalı.",
        type: "error",
      });
      return;
    }

    setLocalSubmitting(true);
    setLocalMessage(null);

    if (mode === "sign_in") {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        console.error("E-posta ile giriş hatası:", error);
        setLocalMessage({
          text: "Giriş yapılamadı. Bilgilerinizi kontrol edin.",
          type: "error",
        });
        setLocalSubmitting(false);
        return;
      }

      setLocalSubmitting(false);
      return;
    }

    if (mode === "sign_up") {
      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo:
            typeof window === "undefined" ? undefined : window.location.origin,
        },
      });

      if (error) {
        console.error("Kayıt olma hatası:", error);
        setLocalMessage({
          text: "Hesap oluşturulamadı.",
          type: "error",
        });
        setLocalSubmitting(false);
        return;
      }

      setLocalMessage({
        text: "Hesap oluşturuldu. E-posta doğrulamanızı kontrol edin.",
        type: "success",
      });
      setPassword("");
      setLocalSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo:
        typeof window === "undefined" ? undefined : window.location.origin,
    });

    if (error) {
      console.error("Şifre sıfırlama hatası:", error);
      setLocalMessage({
        text: "Şifre sıfırlama bağlantısı gönderilemedi.",
        type: "error",
      });
      setLocalSubmitting(false);
      return;
    }

    setLocalMessage({
      text: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
      type: "success",
    });
    setLocalSubmitting(false);
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setPassword("");
    setLocalMessage(null);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Borç Takip Sistemi</h1>
          <p className="mt-2 text-sm text-gray-600">
            Hesabınıza giriş yapın ve borç, kasa ve ödeme verilerinize güvenli
            şekilde erişin.
          </p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isBusy}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {localSubmitting ? "Yönlendiriliyor..." : "Google ile giriş"}
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              veya e-posta ile devam et
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => switchMode("sign_in")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === "sign_in"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => switchMode("sign_up")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === "sign_up"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Kayıt Ol
          </button>
          <button
            type="button"
            onClick={() => switchMode("forgot_password")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === "forgot_password"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Şifremi Unuttum
          </button>
        </div>

        <div className="mt-5 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {currentCopy.title}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{currentCopy.description}</p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-600">E-posta</label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => updateEmail(e.target.value)}
              disabled={isBusy}
              autoComplete="email"
              placeholder="ornek@mail.com"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 disabled:opacity-50"
            />
          </div>

          {mode !== "forgot_password" && (
            <div>
              <label className="mb-1 block text-sm text-gray-600">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isBusy}
                autoComplete={mode === "sign_up" ? "new-password" : "current-password"}
                placeholder="En az 6 karakter"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 disabled:opacity-50"
              />
            </div>
          )}

          {visibleMessage && (
            <div
              className={`rounded-xl border p-3 text-sm ${
                visibleMessage.type === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {visibleMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isBusy}
            className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy
              ? mode === "forgot_password"
                ? "Gönderiliyor..."
                : mode === "sign_up"
                  ? "Hesap oluşturuluyor..."
                  : "Giriş yapılıyor..."
              : currentCopy.submitLabel}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleMagicLink}
            disabled={isBusy}
            className="text-sm font-medium text-gray-600 underline-offset-4 transition hover:text-gray-900 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            Bunun yerine giriş bağlantısı gönder
          </button>
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
          Veriler yalnızca oturum açılan hesap kapsamına göre gösterilir.
          Giriş yapılmadan uygulama ekranları açılmaz.
        </div>
      </section>
    </main>
  );
}
