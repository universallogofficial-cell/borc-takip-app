import Link from "next/link";

type OnboardingEmptyStateProps = {
  email: string | null;
};

const onboardingSteps = [
  {
    title: "1. Kasa ekle",
    description:
      "Önce kullanacağınız ana nakit hesabını ekleyin. Tüm ödeme planları bu bakiye üzerinden ilerler.",
    href: "/cash",
    cta: "Kasa ekle",
    className: "bg-green-600 hover:bg-green-700",
  },
  {
    title: "2. Borç ekle",
    description:
      "Kurum, kalan borç, minimum ödeme ve son ödeme günü bilgilerini ekleyin.",
    href: "/debts",
    cta: "Borç ekle",
    className: "bg-gray-900 hover:bg-gray-800",
  },
  {
    title: "3. Ödeme yap",
    description:
      "Kasa ve borç kayıtları tamamlandığında ödeme ekranından düşüm ve takip akışını başlatın.",
    href: "/payments",
    cta: "Ödeme yap",
    className: "bg-blue-600 hover:bg-blue-700",
  },
];

export default function OnboardingEmptyState({
  email,
}: OnboardingEmptyStateProps) {
  return (
    <section className="rounded-2xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-gray-200">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium text-gray-500">İlk Kurulum</p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">
          Hoş geldiniz{email ? `, ${email}` : ""}.
        </h2>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Başlamak için ilk verilerinizi ekleyin. Önce bir kasa oluşturun, sonra
          borçlarınızı girin ve son olarak ödeme ekranı ile hareketleri işlemeye
          başlayın.
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
        {onboardingSteps.map((step) => (
          <div
            key={step.href}
            className="flex h-full flex-col rounded-2xl border border-gray-200 bg-gray-50 p-5 text-left"
          >
            <h3 className="text-base font-semibold text-gray-900">{step.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">
              {step.description}
            </p>
            <Link
              href={step.href}
              className={`mt-5 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white transition ${step.className}`}
            >
              {step.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
