import Link from "next/link";

type OnboardingEmptyStateProps = {
  email: string | null;
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onSaveProfile: (e: React.FormEvent<HTMLFormElement>) => void;
  hasProfile: boolean;
  hasCash: boolean;
  hasDebt: boolean;
  hasPayment: boolean;
};

type OnboardingStep = {
  title: string;
  description: string;
  cta: string;
  href?: string;
  done: boolean;
  unlocked: boolean;
};

function StepCard({
  step,
  index,
}: {
  step: OnboardingStep;
  index: number;
}) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-gray-50 p-5 text-left">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900">
          {index + 1}. {step.title}
        </p>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            step.done
              ? "bg-emerald-100 text-emerald-800"
              : step.unlocked
                ? "bg-sky-100 text-sky-800"
                : "bg-gray-200 text-gray-600"
          }`}
        >
          {step.done ? "Tamam" : step.unlocked ? "Sıradaki" : "Bekliyor"}
        </span>
      </div>
      <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">
        {step.description}
      </p>
      {step.href ? (
        <Link
          href={step.unlocked ? step.href : "#"}
          aria-disabled={!step.unlocked}
          className={`mt-5 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition ${
            step.unlocked
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "cursor-not-allowed bg-gray-200 text-gray-500"
          }`}
        >
          {step.cta}
        </Link>
      ) : (
        <div className="mt-5 rounded-xl bg-white px-4 py-2 text-center text-sm font-medium text-gray-500 ring-1 ring-gray-200">
          {step.cta}
        </div>
      )}
    </div>
  );
}

export default function OnboardingEmptyState({
  email,
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  onSaveProfile,
  hasProfile,
  hasCash,
  hasDebt,
  hasPayment,
}: OnboardingEmptyStateProps) {
  const steps: OnboardingStep[] = [
    {
      title: "Profil oluştur",
      description:
        "İsim ve soyisim ekleyin. Uygulama sizi tanısın ve özetleri kişisel şekilde sunsun.",
      cta: hasProfile ? "Profil tamamlandı" : "Adınızı kaydedin",
      done: hasProfile,
      unlocked: true,
    },
    {
      title: "İlk kasanı ekle",
      description:
        "Tüm planlama ve güvenli bakiye görünümü bu adımdan sonra anlamlı hale gelir.",
      cta: "Kasalar sayfasına git",
      href: "/cash",
      done: hasCash,
      unlocked: hasProfile,
    },
    {
      title: "İlk borcunu ekle",
      description:
        "Borç, vade ve asgari ödeme bilgileri risk görünümü ile öncelik motorunu besler.",
      cta: "Borçlar sayfasına git",
      href: "/debts",
      done: hasDebt,
      unlocked: hasProfile && hasCash,
    },
    {
      title: "İlk ödemeni yap",
      description:
        "Ödeme kaydı ile hareket geçmişi, ay görünümü ve durum takibi gerçek veriye dönüşür.",
      cta: "Ödemeler sayfasına git",
      href: "/payments",
      done: hasPayment,
      unlocked: hasProfile && hasCash && hasDebt,
    },
  ];

  return (
    <section className="rounded-[32px] bg-white px-6 py-8 shadow-sm ring-1 ring-gray-200 md:px-8 md:py-10">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            Karşılama
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
            Başlamak için ilk verilerinizi ekleyin
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            Bu kurulum akışı tamamlandığında uygulama size sadece kayıtları değil,
            paranın yönünü, risk durumunu ve öncelikli adımları gösterecek.
          </p>
          <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-900">
              {hasProfile
                ? `${firstName} ${lastName}, hoş geldiniz.`
                : "İlk olarak kısa profilinizi tamamlayın."}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {email || "Bu oturum"} için kayıtlı ilerleme yalnızca bu hesapta görünür.
            </p>
          </div>

          {!hasProfile && (
            <form onSubmit={onSaveProfile} className="mt-5 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-600">İsim</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => onFirstNameChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none transition focus:border-gray-500"
                  placeholder="Örn: Emre"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">Soyisim</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => onLastNameChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 outline-none transition focus:border-gray-500"
                  placeholder="Örn: Yılmaz"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  Profili Kaydet
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {steps.map((step, index) => (
            <StepCard key={step.title} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
