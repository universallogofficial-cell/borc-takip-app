import { supabase } from "@/lib/supabase";

type AuthGateProps = {
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  message: string | null;
  messageType: "success" | "error" | null;
};

export default function AuthGate({
  email,
  onEmailChange,
  onSubmit,
  isSubmitting,
  message,
  messageType,
}: AuthGateProps) {
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          typeof window === "undefined" ? undefined : window.location.origin,
      },
    });

    if (error) {
      console.error("Google giriş hatası:", error);
      window.alert("Google ile giriş başlatılamadı.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Borç Takip Sistemi</h1>
          <p className="mt-2 text-sm text-gray-600">
            Uygulamayı kullanmak için e-posta adresinize gönderilen güvenli giriş
            bağlantısı ile oturum açın.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-600">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              disabled={isSubmitting}
              autoComplete="email"
              placeholder="ornek@mail.com"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 disabled:opacity-50"
            />
          </div>

          {message && (
            <div
              className={`rounded-xl border p-3 text-sm ${
                messageType === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Giriş bağlantısı gönderiliyor..."
              : "Giriş Bağlantısı Gönder"}
          </button>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Google ile giriş
          </button>
        </form>

        <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
          Veriler yalnızca oturum açılan hesap kapsamına göre gösterilir.
          Giriş yapılmadan uygulama ekranları açılmaz.
        </div>
      </section>
    </main>
  );
}
