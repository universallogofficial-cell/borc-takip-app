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
    <div className="relative mx-auto w-full max-w-[34rem]">
      <div className="absolute -bottom-14 left-1/2 h-28 w-[88%] -translate-x-1/2 rounded-full bg-[rgba(13,31,24,0.32)] blur-[42px]" />
      <div className="absolute -right-10 top-20 h-56 w-56 rounded-full bg-[rgba(255,255,255,0.22)] blur-[88px]" />
      <div className="absolute left-8 top-44 h-52 w-52 rounded-full bg-[rgba(188,211,198,0.12)] blur-[90px]" />
      <div className="relative translate-y-8 rotate-[9deg] scale-[1.08] md:translate-x-8 md:translate-y-12 md:scale-[1.16] xl:translate-x-12 xl:translate-y-16 xl:scale-[1.22]">
        <div className="relative rounded-[3.35rem] bg-[linear-gradient(145deg,#fbf8f0_0%,#d7d0c0_34%,#fffdf7_100%)] p-[0.46rem] shadow-[0_48px_110px_rgba(7,24,18,0.42),0_12px_24px_rgba(255,255,255,0.22)_inset]">
          <div className="relative overflow-hidden rounded-[2.85rem] border border-black/6 bg-[#f6f2e8]">
            <div className="absolute left-1/2 top-3 z-20 h-6 w-28 -translate-x-1/2 rounded-full bg-[#ebe3d7]" />
            <div className="absolute right-[0.28rem] top-28 h-14 w-1 rounded-full bg-[#c6bfb2]" />
            <div className="absolute right-[0.28rem] top-44 h-10 w-1 rounded-full bg-[#c6bfb2]" />
            <div className="absolute left-[0.28rem] top-32 h-16 w-1 rounded-full bg-[#c6bfb2]" />

            <div className="relative h-[41rem] bg-[linear-gradient(180deg,#12392d_0%,#214b3b_14%,#e8e1d3_42%,#f8f4eb_100%)] px-4 pb-5 pt-5">
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

              <div className="mt-6 rounded-[1.8rem] bg-[#f8f4ec] p-4 shadow-[0_24px_44px_rgba(15,37,29,0.18)] ring-1 ring-black/3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.72rem] text-[#6d766f]">Harcanabilir bakiyen</p>
                    <p className="mt-1 text-[2.15rem] font-semibold tracking-tight text-[#163328]">
                      € 8.750
                    </p>
                  </div>
                  <span className="rounded-full bg-[#dbe8de] px-3 py-1.5 text-[0.72rem] font-semibold text-[#2d6a50] shadow-[0_8px_18px_rgba(76,120,94,0.18)]">
                    + Ekle
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-[1.6rem] bg-[#fffaf2] p-4 shadow-[0_20px_38px_rgba(22,48,38,0.14)] ring-1 ring-black/3">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[0.8rem] text-[#48534d]">
                      <span>Toplam yükün</span>
                      <span className="font-semibold text-[#21372d]">€ 62.700</span>
                    </div>
                    <div className="mt-2.5 h-3 rounded-full bg-[#d7ddd5]">
                      <div className="h-3 w-[68%] rounded-full bg-[linear-gradient(90deg,#6c9e82_0%,#a2cdb6_100%)]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[0.8rem] text-[#48534d]">
                      <span>Nakitin</span>
                      <span className="font-semibold text-[#21372d]">€ 34.500</span>
                    </div>
                    <div className="mt-2.5 h-3 rounded-full bg-[#d7ddd5]">
                      <div className="h-3 w-[44%] rounded-full bg-[linear-gradient(90deg,#6e9f84_0%,#89b79c_100%)]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[0.8rem] text-[#48534d]">
                    <span>Durumun</span>
                    <span className="font-semibold text-[#b06259]">↳ -28.200</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[1.6rem] bg-[#fffaf2] p-4 shadow-[0_20px_38px_rgba(22,48,38,0.14)] ring-1 ring-black/3">
                <p className="text-[0.84rem] font-semibold text-[#23392f]">
                  Yaklaşan ödemeler
                </p>

                <div className="mt-3.5 space-y-3.5">
                  {[
                    ["Akbank kredi kartı", "26 Mayıs", "€ 20.000"],
                    ["Araç kredisi", "28 Mayıs", "€ 2.700"],
                    ["Vodafone fatura", "29 Mayıs", "€ 280"],
                  ].map(([title, date, amount]) => (
                    <div key={title} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dbe8de] shadow-[0_8px_18px_rgba(88,136,103,0.12)]">
                          <span className="h-3 w-3 rounded-[0.2rem] bg-[#4f7b61]" />
                        </span>
                        <div>
                          <p className="text-[0.75rem] font-medium text-[#2d3f36]">
                            {title}
                          </p>
                          <p className="text-[0.69rem] text-[#7d847e]">{date}</p>
                        </div>
                      </div>
                      <span className="text-[0.75rem] font-semibold text-[#2d3f36]">
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
    <main className="min-h-screen overflow-hidden bg-[#0f392d]">
      <div className="relative">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#0e382c_0%,#174838_24%,#2f6551_40%,#cad4ca_72%,#f4f1e8_100%)]" />
        <div className="absolute inset-x-0 top-0 h-[58rem] bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_82%_20%,rgba(255,255,255,0.15),transparent_20%),radial-gradient(circle_at_56%_34%,rgba(255,255,255,0.06),transparent_30%)]" />
        <div className="absolute right-[8%] top-[8rem] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(244,246,240,0.58)_0%,rgba(244,246,240,0.18)_34%,transparent_68%)] blur-[26px]" />
        <div className="absolute left-0 top-[20rem] h-[30rem] w-[56rem] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.06)_38%,transparent_72%)]" />
        <div className="absolute inset-x-0 top-[30rem] h-[38rem] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.86)_0%,rgba(255,255,255,0.34)_32%,transparent_70%)]" />

        <div className="relative mx-auto max-w-[82rem] px-4 pb-16 pt-7 md:px-8 md:pb-24 md:pt-10">
          <header className="mx-auto flex max-w-[69rem] items-center justify-between rounded-[1.45rem] border border-black/5 bg-[rgba(252,249,243,0.97)] px-5 py-2.5 shadow-[0_10px_26px_rgba(12,34,26,0.12)] backdrop-blur md:px-6">
            <Link href="/" className="shrink-0">
              <Image
                src="/logo-akca.png"
                alt="AKÇA"
                width={176}
                height={48}
                priority
                className="h-auto w-[128px] object-contain md:w-[144px]"
              />
            </Link>

            <nav className="hidden items-center gap-7 text-[0.92rem] text-[#55615a] md:flex">
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
                className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(180deg,#245944_0%,#143a2d_100%)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(21,57,43,0.16)]"
              >
                Ücretsiz başla
              </Link>
            </nav>
          </header>

          <section className="mx-auto grid min-h-[52rem] max-w-[69rem] gap-10 px-3 pb-32 pt-18 md:px-7 md:pb-48 md:pt-24 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start">
            <div className="max-w-[30rem] pt-12 text-[#f6f2ea] md:pt-16">
              <h1 className="font-display text-[4.2rem] leading-[0.9] tracking-[-0.06em] md:text-[5.9rem] xl:text-[6.25rem]">
                Paranın özüne dön.
              </h1>
              <p className="mt-8 max-w-[24rem] text-[1.24rem] leading-[1.78] text-white/80">
                Borçlarını, nakitini ve ödemelerini tek yerden yönet. Daha bilinçli
                kararlar ver.
              </p>
              <div className="mt-11">
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center rounded-[1rem] bg-[linear-gradient(180deg,#2c634c_0%,#143b2d_100%)] px-6 py-4 text-base font-semibold text-white shadow-[0_22px_42px_rgba(10,32,24,0.28)] transition hover:translate-y-[-1px]"
                >
                  Ücretsiz başla
                </Link>
              </div>
            </div>

            <div className="relative flex justify-center overflow-visible lg:justify-end">
              <PhoneMockup />
            </div>
          </section>

          <section
            id="ozellikler"
            className="relative z-10 mx-auto mt-4 grid max-w-[64rem] gap-6 md:mt-8 md:grid-cols-3"
          >
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-[1.9rem] border border-white/58 bg-[rgba(250,247,241,0.92)] px-9 py-9 text-center shadow-[0_30px_70px_rgba(28,43,34,0.11)] backdrop-blur"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(180deg,#edf3ed_0%,#dfe8df_100%)] text-[#6d897a] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  {feature.icon}
                </div>
                <h2 className="mt-6 text-[1.7rem] font-semibold tracking-[-0.03em] text-[#294137]">
                  {feature.title}
                </h2>
                <p className="mx-auto mt-4 max-w-[15rem] text-base leading-7 text-[#738078]">
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
