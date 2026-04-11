import Image from "next/image";
import Link from "next/link";

const features = [
  {
    title: "Her şeyi gör",
    description: "Tüm finansal durumunu tek ekranda takip et.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
        <path
          d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3.1" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    title: "Dengede kal",
    description: "Harcanabilir bakiyeni bil, risk alma.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
        <path
          d="M12 4v14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M5 8h14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="m6.5 8 3.3 5.3H3.2L6.5 8Zm11 0 3.3 5.3h-6.6L17.5 8Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Doğru karar ver",
    description: "Yaklaşan ödemeleri önceden gör.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
        <rect
          x="4"
          y="5"
          width="16"
          height="15"
          rx="2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M8 3.8v3.1M16 3.8v3.1M4 9.5h16M9.2 14l1.8 1.8 3.8-4.1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[27rem]">
      <div className="absolute -bottom-10 left-1/2 h-20 w-[78%] -translate-x-1/2 rounded-full bg-[rgba(27,44,35,0.22)] blur-2xl" />
      <div className="absolute right-2 top-14 h-44 w-44 rounded-full bg-[rgba(255,255,255,0.18)] blur-3xl" />
      <div className="relative translate-y-4 rotate-[8deg]">
        <div className="relative rounded-[3.2rem] bg-[linear-gradient(145deg,#f7f3ea_0%,#d8d2c4_38%,#fdfbf4_100%)] p-[0.42rem] shadow-[0_34px_70px_rgba(11,28,22,0.34)]">
          <div className="relative overflow-hidden rounded-[2.85rem] border border-black/6 bg-[#f6f2e8]">
            <div className="absolute left-1/2 top-3 z-20 h-6 w-28 -translate-x-1/2 rounded-full bg-[#ebe3d7]" />
            <div className="absolute right-[0.28rem] top-28 h-14 w-1 rounded-full bg-[#c6bfb2]" />
            <div className="absolute right-[0.28rem] top-44 h-10 w-1 rounded-full bg-[#c6bfb2]" />
            <div className="absolute left-[0.28rem] top-32 h-16 w-1 rounded-full bg-[#c6bfb2]" />

            <div className="relative h-[37.5rem] bg-[linear-gradient(180deg,#163d31_0%,#234d3d_16%,#ece7dc_46%,#f7f3ea_100%)] px-4 pb-5 pt-5">
              <div className="flex items-center justify-between px-2 pt-1 text-[0.6rem] font-semibold tracking-[0.08em] text-white/84">
                <span>8:31</span>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/55" />
                  <span className="rounded-full border border-white/60 px-1 text-[0.44rem] leading-[0.7rem]">
                    100
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between text-white">
                <button
                  type="button"
                  aria-label="Menü"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8"
                >
                  <span className="space-y-1">
                    <span className="block h-[2px] w-4 rounded-full bg-white" />
                    <span className="block h-[2px] w-4 rounded-full bg-white/80" />
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/28 bg-white/10 text-[0.62rem] font-semibold">
                    A
                  </span>
                  <span className="text-[1.06rem] font-semibold tracking-[0.14em]">
                    AKÇA
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Bildirimler"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-white/95" />
                </button>
              </div>

              <div className="mt-6 rounded-[1.7rem] bg-[#f4efe6] p-4 shadow-[0_18px_30px_rgba(22,48,38,0.16)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.72rem] text-[#6d766f]">Harcanabilir bakiyen</p>
                    <p className="mt-1 text-[2rem] font-semibold tracking-tight text-[#19382d]">
                      € 8.750
                    </p>
                  </div>
                  <span className="rounded-full bg-[#dbe8de] px-3 py-1.5 text-[0.72rem] font-semibold text-[#2d6a50]">
                    + Ekle
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-[1.5rem] bg-[#faf6ee] p-4 shadow-[0_18px_28px_rgba(22,48,38,0.12)]">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[0.78rem] text-[#505a55]">
                      <span>Toplam yükün</span>
                      <span className="font-semibold text-[#2c3f36]">€ 62.700</span>
                    </div>
                    <div className="mt-2 h-2.5 rounded-full bg-[#dde4dc]">
                      <div className="h-2.5 w-[68%] rounded-full bg-[linear-gradient(90deg,#7eb092_0%,#9dc7b2_100%)]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[0.78rem] text-[#505a55]">
                      <span>Nakitin</span>
                      <span className="font-semibold text-[#2c3f36]">€ 34.500</span>
                    </div>
                    <div className="mt-2 h-2.5 rounded-full bg-[#dde4dc]">
                      <div className="h-2.5 w-[44%] rounded-full bg-[linear-gradient(90deg,#7fb394_0%,#6f9d84_100%)]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[0.78rem] text-[#505a55]">
                    <span>Durumun</span>
                    <span className="font-semibold text-[#b06b60]">↳ -28.200</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[1.5rem] bg-[#faf6ee] p-4 shadow-[0_18px_28px_rgba(22,48,38,0.12)]">
                <p className="text-[0.82rem] font-semibold text-[#2b4035]">
                  Yaklaşan ödemeler
                </p>

                <div className="mt-3 space-y-3">
                  {[
                    ["Akbank kredi kartı", "26 Mayıs", "€ 20.000"],
                    ["Araç kredisi", "28 Mayıs", "€ 2.700"],
                    ["Vodafone fatura", "29 Mayıs", "€ 280"],
                  ].map(([title, date, amount]) => (
                    <div key={title} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dbe8de]">
                          <span className="h-3 w-3 rounded-[0.2rem] bg-[#588867]" />
                        </span>
                        <div>
                          <p className="text-[0.74rem] font-medium text-[#33443b]">
                            {title}
                          </p>
                          <p className="text-[0.68rem] text-[#808781]">{date}</p>
                        </div>
                      </div>
                      <span className="text-[0.74rem] font-semibold text-[#33443b]">
                        {amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-black/24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#0d3a2d_0%,#184c3b_30%,#dfe4dc_74%,#f5f3eb_100%)]">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-[48rem] bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.09),transparent_26%),radial-gradient(circle_at_78%_26%,rgba(255,255,255,0.17),transparent_24%),radial-gradient(circle_at_50%_64%,rgba(255,255,255,0.08),transparent_38%)]" />
        <div className="absolute inset-x-0 top-[22rem] h-[34rem] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.76)_0%,rgba(255,255,255,0.22)_38%,transparent_68%)]" />

        <div className="relative mx-auto max-w-[78rem] px-4 pb-12 pt-7 md:px-8 md:pb-16 md:pt-10">
          <header className="mx-auto flex max-w-[69rem] items-center justify-between rounded-[1.6rem] border border-black/5 bg-[rgba(252,249,243,0.96)] px-6 py-3.5 shadow-[0_12px_30px_rgba(12,34,26,0.14)] backdrop-blur md:px-7">
            <Link href="/" className="shrink-0">
              <Image
                src="/logo-akca.png"
                alt="AKÇA"
                width={160}
                height={44}
                priority
                className="h-auto w-[118px] object-contain md:w-[132px]"
              />
            </Link>

            <nav className="hidden items-center gap-7 text-[0.95rem] text-[#55615a] md:flex">
              <a href="#ozellikler" className="hover:text-[#173d30]">
                Özellikler
              </a>
              <a href="#guvenlik" className="hover:text-[#173d30]">
                Güvenlik
              </a>
              <a href="#blog" className="hover:text-[#173d30]">
                Blog
              </a>
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(180deg,#245944_0%,#143a2d_100%)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(21,57,43,0.18)]"
              >
                Ücretsiz başla
              </Link>
            </nav>
          </header>

          <section className="mx-auto grid max-w-[69rem] gap-12 px-3 pb-24 pt-16 md:px-7 md:pb-36 md:pt-20 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:items-center">
            <div className="max-w-[28rem] pt-8 text-[#f6f2ea]">
              <h1 className="font-display text-[3.7rem] leading-[0.94] tracking-[-0.055em] md:text-[5.2rem]">
                Paranın özüne dön.
              </h1>
              <p className="mt-7 max-w-[23rem] text-[1.18rem] leading-[1.7] text-white/78">
                Borçlarını, nakitini ve ödemelerini tek yerden yönet. Daha bilinçli
                kararlar ver.
              </p>
              <div className="mt-10">
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center rounded-[1rem] bg-[linear-gradient(180deg,#295f48_0%,#143b2d_100%)] px-6 py-4 text-base font-semibold text-white shadow-[0_18px_34px_rgba(10,32,24,0.24)] transition hover:translate-y-[-1px]"
                >
                  Ücretsiz başla
                </Link>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <PhoneMockup />
            </div>
          </section>

          <section
            id="ozellikler"
            className="relative z-10 mx-auto -mt-8 grid max-w-[64rem] gap-5 md:grid-cols-3"
          >
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-[1.7rem] border border-white/58 bg-[rgba(250,247,241,0.92)] px-8 py-8 text-center shadow-[0_24px_50px_rgba(28,43,34,0.12)] backdrop-blur"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(180deg,#edf3ed_0%,#dfe8df_100%)] text-[#6d897a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  {feature.icon}
                </div>
                <h2 className="mt-6 text-[1.7rem] font-semibold tracking-[-0.03em] text-[#294137]">
                  {feature.title}
                </h2>
                <p className="mx-auto mt-3 max-w-[15rem] text-base leading-7 text-[#738078]">
                  {feature.description}
                </p>
              </article>
            ))}
          </section>

          <section
            id="guvenlik"
            className="mx-auto flex max-w-[64rem] items-center justify-center gap-3 px-4 py-10 text-center text-[1rem] text-[#617066] md:py-12"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5 shrink-0 text-[#6e897b]"
            >
              <path
                d="M12 3.5 5.5 6v5.7c0 4.1 2.7 7.8 6.5 8.8 3.8-1 6.5-4.7 6.5-8.8V6L12 3.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="font-medium">Verilerin sadece sana aittir.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
