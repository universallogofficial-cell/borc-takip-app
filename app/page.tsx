import Link from "next/link";

const features = [
  {
    title: "Her şeyi gör",
    description:
      "Borçlarını, nakitini ve yaklaşan ödemelerini tek bakışta sakin bir düzende takip et.",
  },
  {
    title: "Dengede kal",
    description:
      "Harcanabilir bakiyeni öne çıkaran sade görünümle nakit akışındaki baskıyı erken fark et.",
  },
  {
    title: "Doğru karar ver",
    description:
      "Ödemelerini doğru sırada tamamla, gereksiz gürültü olmadan daha bilinçli hareket et.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f8f4_0%,#eff1eb_100%)] px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[40px] bg-[linear-gradient(135deg,#113f30_0%,#0d3227_55%,#173d30_100%)] px-6 py-6 text-white shadow-[0_28px_70px_rgba(15,61,46,0.18)] md:px-10 md:py-8 xl:px-14 xl:py-10">
          <header className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <span className="h-3 w-3 rounded-full bg-[#d5e5db]" />
              </span>
              <span className="text-lg font-semibold tracking-[0.18em]">AKÇA</span>
            </Link>

            <nav className="flex flex-wrap items-center gap-2 text-sm text-white/72">
              <a href="#ozellikler" className="rounded-full px-3 py-2 hover:bg-white/8 hover:text-white">
                Özellikler
              </a>
              <a href="#guvenlik" className="rounded-full px-3 py-2 hover:bg-white/8 hover:text-white">
                Güvenlik
              </a>
              <a href="#blog" className="rounded-full px-3 py-2 hover:bg-white/8 hover:text-white">
                Blog
              </a>
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-full bg-[#dfe9e2] px-5 py-3 font-semibold text-[#0f3d2e] transition hover:bg-white"
              >
                Ücretsiz başla
              </Link>
            </nav>
          </header>

          <div className="grid gap-12 py-14 md:py-18 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:items-center xl:py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/58">
                Kişisel finans alanı
              </p>
              <h1 className="font-display mt-6 text-6xl leading-[0.94] tracking-[-0.05em] text-[#f4f5f1] md:text-7xl xl:text-[6.2rem]">
                Paranın özüne dön.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/70 md:text-lg">
                Borçlarını, nakitini ve ödemelerini tek yerden yönet. Daha bilinçli
                kararlar ver.
              </p>
              <div className="mt-10">
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center rounded-full bg-[#f4f5f1] px-6 py-3.5 text-sm font-semibold text-[#0f3d2e] transition hover:bg-white"
                >
                  Ücretsiz başla
                </Link>
              </div>
            </div>

            <div className="flex justify-center xl:justify-end">
              <div className="relative w-full max-w-[28rem] rounded-[36px] border border-white/12 bg-white/6 p-4 backdrop-blur-sm">
                <div className="absolute inset-x-10 top-0 h-24 rounded-b-full bg-white/8 blur-3xl" />
                <div className="relative mx-auto aspect-[0.56] w-full max-w-[22rem] rounded-[34px] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.05))] p-4 shadow-[0_24px_60px_rgba(6,24,18,0.26)]">
                  <div className="mx-auto h-1.5 w-20 rounded-full bg-white/25" />
                  <div className="mt-6 flex h-[calc(100%-2.5rem)] items-center justify-center rounded-[26px] border border-dashed border-white/18 bg-black/6 text-center">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-white/38">
                        Telefon Mockup
                      </p>
                      <p className="mt-3 text-base text-white/55">
                        Placeholder
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="ozellikler"
          className="grid gap-5 px-1 py-10 md:grid-cols-3 md:py-14"
        >
          {features.map((feature) => (
            <article
              key={feature.title}
              className="finance-surface rounded-[28px] border border-[rgba(15,61,46,0.08)] p-7 text-center shadow-[0_18px_38px_rgba(20,36,28,0.05)]"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(15,61,46,0.08)]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0f3d2e]" />
              </div>
              <h2 className="mt-5 text-xl font-semibold tracking-tight text-[#1f2924]">
                {feature.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#65716a]">
                {feature.description}
              </p>
            </article>
          ))}
        </section>

        <section
          id="guvenlik"
          className="finance-surface mx-auto flex max-w-3xl items-center justify-center gap-4 rounded-[28px] border border-[rgba(15,61,46,0.08)] px-6 py-6 text-center"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(15,61,46,0.08)]">
            <span className="h-4 w-4 rounded-full border-2 border-[#0f3d2e]" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#1f2924]">
              Verilerin sadece sana aittir.
            </p>
            <p className="mt-1 text-sm text-[#65716a]">
              AKÇA hesabına ait kayıtlar yalnızca sana gösterilir.
            </p>
          </div>
        </section>

        <footer
          id="blog"
          className="px-1 py-8 text-sm text-[#7a867f] md:py-10"
        >
          AKÇA
        </footer>
      </div>
    </main>
  );
}
