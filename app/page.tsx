import Link from "next/link";

const features = [
  {
    title: "Borç Takibi",
    description:
      "Borçlarını tek ekranda izle, vadeleri takip et ve kapanan kayıtları arşivle.",
  },
  {
    title: "Kasa Yönetimi",
    description:
      "Kasalarını ayrı ayrı yönet, bakiyeni kontrol et ve ödemelerin etkisini gör.",
  },
  {
    title: "Akıllı Analiz",
    description:
      "Risk görünümü, yaklaşan ödemeler ve öncelik önerileriyle ne yapman gerektiğini anla.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-6 md:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col justify-center gap-8">
        <section className="overflow-hidden rounded-[36px] border border-gray-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
          <div className="grid gap-10 px-6 py-10 md:px-10 md:py-14 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                Kişisel Finans Kontrolü
              </span>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-gray-950 md:text-5xl">
                Borçlarını kontrol altına al
              </h1>
              <p className="mt-5 text-base leading-7 text-gray-600 md:text-lg">
                Borçlarını, nakit durumunu ve ödeme hareketlerini tek merkezden yönet.
                Sade arayüz ve anlaşılır analizlerle ilk günden ne durumda olduğunu gör.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Hemen başla
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[28px] bg-gray-950 px-6 py-6 text-white shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Net Görünüm
                </p>
                <p className="mt-3 text-2xl font-semibold">
                  Borç, kasa ve ödeme akışın aynı çerçevede.
                </p>
                <p className="mt-3 text-sm leading-6 text-white/75">
                  İlk kayıttan sonra dashboard sana kalan yükü, ödeme ritmini ve güvenli
                  nakit alanını birlikte gösterir.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-gray-200 bg-gray-50 p-5">
                  <p className="text-sm font-semibold text-gray-900">Tek merkez</p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Dağınık notlar yerine düzenli finans kaydı.
                  </p>
                </div>
                <div className="rounded-[24px] border border-gray-200 bg-gray-50 p-5">
                  <p className="text-sm font-semibold text-gray-900">Hızlı başlangıç</p>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    İlk kullanımda adım adım yönlendirme ile boş ekran yok.
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
              className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-semibold text-gray-900">{feature.title}</p>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {feature.description}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
