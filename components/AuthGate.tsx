import Image from "next/image";
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f8f4_0%,#eff1eb_100%)] p-4 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.04fr)_minmax(420px,0.96fr)] lg:items-center">
        <section className="finance-surface-strong hidden rounded-[36px] px-8 py-10 lg:block">
          <span className="finance-badge finance-badge-good">AKÇA</span>
          <h1 className="font-display mt-6 max-w-xl text-6xl leading-[0.95] tracking-[-0.05em] text-[#1f2924]">
            Finans düzenini sade bir yüzeyde topla.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#65716a]">
            Giriş yaptığında borçlarını, nakitini ve ödeme akışını aynı ritimde
            görebileceğin sessiz bir çalışma alanı açılır.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="finance-stat-card">
              <p className="text-sm font-semibold text-[#1f2924]">Sadece sana ait</p>
              <p className="mt-2 text-sm leading-6 text-[#65716a]">
                Hesabına ait veriler yalnızca sana görünür.
              </p>
            </div>
            <div className="finance-stat-card">
              <p className="text-sm font-semibold text-[#1f2924]">Sessiz ama güçlü</p>
              <p className="mt-2 text-sm leading-6 text-[#65716a]">
                Kritik rakamlar öne çıkar, geri kalanı geri çekilir.
              </p>
            </div>
            <div className="finance-stat-card">
              <p className="text-sm font-semibold text-[#1f2924]">Hızlı başlangıç</p>
              <p className="mt-2 text-sm leading-6 text-[#65716a]">
                Google, e-posta veya giriş bağlantısı ile hemen hazır.
              </p>
            </div>
          </div>
        </section>

        <section className="finance-surface-strong w-full rounded-[32px] p-6 md:p-8">
          <div className="mb-6">
            <div className="mb-6 flex justify-center">
              <Image
                src="/logo-akca.png"
                alt="AKÇA"
                width={180}
                height={52}
                priority
                className="h-auto w-[148px] object-contain"
              />
            </div>
            <h2 className="font-display mt-3 text-4xl tracking-tight text-[#1f2924]">
              {currentCopy.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#65716a]">{currentCopy.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="finance-badge finance-badge-neutral">Ücretsiz kullanım</span>
              <span className="finance-badge finance-badge-neutral">Verilerin sana özeldir</span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isBusy}
              className="finance-button-ghost w-full"
            >
              {localSubmitting ? "Yönlendiriliyor..." : "Google ile giriş"}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                veya e-posta ile devam et
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 rounded-[20px] bg-slate-100/80 p-1.5">
            <button
              type="button"
              onClick={() => switchMode("sign_in")}
              className={`rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                mode === "sign_in"
                  ? "bg-white text-slate-950 shadow-[0_12px_26px_rgba(15,23,42,0.08)]"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => switchMode("sign_up")}
              className={`rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                mode === "sign_up"
                  ? "bg-white text-slate-950 shadow-[0_12px_26px_rgba(15,23,42,0.08)]"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Kayıt Ol
            </button>
            <button
              type="button"
              onClick={() => switchMode("forgot_password")}
              className={`rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                mode === "forgot_password"
                  ? "bg-white text-slate-950 shadow-[0_12px_26px_rgba(15,23,42,0.08)]"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Şifremi Unuttum
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">E-posta</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => updateEmail(e.target.value)}
                disabled={isBusy}
                autoComplete="email"
                placeholder="ornek@mail.com"
                className="finance-field"
              />
            </div>

            {mode !== "forgot_password" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Şifre</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isBusy}
                  autoComplete={mode === "sign_up" ? "new-password" : "current-password"}
                  placeholder="En az 6 karakter"
                  className="finance-field"
                />
              </div>
            )}

            {visibleMessage && (
              <div
                className={`rounded-[20px] border p-3 text-sm ${
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
              className="finance-button-primary w-full"
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
              className="text-sm font-medium text-slate-600 underline-offset-4 transition hover:text-slate-900 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              Bunun yerine giriş bağlantısı gönder
            </button>
          </div>

          <div className="mt-5 rounded-[22px] bg-slate-50 px-4 py-4 text-xs leading-6 text-slate-500 ring-1 ring-slate-200/80">
            Veriler yalnızca oturum açılan hesap kapsamında görüntülenir. Giriş yapılmadan
            uygulama ekranları açılmaz ve tüm akış aynı güvenli tasarım diliyle ilerler.
          </div>
        </section>
      </div>
    </main>
  );
}
