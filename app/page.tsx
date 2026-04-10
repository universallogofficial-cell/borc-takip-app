import Link from "next/link";

const features = [
  {
    title: "Borç Takibi",
    description:
      "Borçlarını tek ekranda gör, kalan tutarı izle ve vadelerini kaçırmadan yönet.",
  },
  {
    title: "Kasa Yönetimi",
    description:
      "Kasalarını ayrı ayrı takip et, bakiyeni net gör ve ödemelerin etkisini anında izle.",
  },
  {
    title: "Ödeme Planı",
    description:
      "Yaklaşan ödemeleri takip et, ödeme geçmişini kaydet ve planını daha kontrollü ilerlet.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#eef6ff_0%,#f8fafc_38%,#edf2f7_100%)] px-4 py-5 md:px-6 md:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl flex-col justify-between gap-10">
        <section className="overflow-hidden rounded-[36px] border border-slate-200/80 bg-white/95 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid gap-10 px-6 py-8 md:px-10 md:py-12 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                Borç Takip
              </span>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                Borçlarını kontrol altına al
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
                Borçlarını, kasalarını ve ödeme planını tek yerden yönet. İlk bakışta
                nerede olduğunu anla, finansal düzenini daha sakin ve kontrollü kur.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Ücretsiz başla
                </Link>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Ücretsiz kullanım
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Verileriniz size özeldir
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[28px] bg-slate-950 px-6 py-6 text-white shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Güvenli Başlangıç
                </p>
                <p className="mt-3 text-2xl font-semibold">
                  Ne kadar borcun var, hangi kasada ne kaldı, hepsi net olsun.
                </p>
                <p className="mt-3 text-sm leading-6 text-white/75">
                  Sade arayüz, anlaşılır alanlar ve yönlendirilmiş akış sayesinde ilk
                  günden itibaren sistemi kullanmaya başlayabilirsin.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">
                    Verileriniz size özeldir
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Kayıtlar hesap bazında tutulur ve yalnızca size ait görünür.
                  </p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">
                    Kullanımı ücretsiz
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Hemen başlayabilir, ilk borç ve kasa kayıtlarını ücretsiz oluşturabilirsin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">{feature.title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {feature.description}
              </p>
            </article>
          ))}
        </section>

        <footer className="pb-2 text-center text-sm text-slate-500">
          © 2026 Borç Takip
        </footer>
      </div>
    </main>
  );
}
