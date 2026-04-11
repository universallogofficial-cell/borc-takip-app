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
  shortLabel: string;
};

function StepCard({
  step,
  index,
}: {
  step: OnboardingStep;
  index: number;
}) {
  return (
    <div
      className={`flex h-full flex-col rounded-[24px] border p-5 text-left shadow-sm transition ${
        step.done
          ? "border-emerald-200 bg-emerald-50/70"
          : step.unlocked
            ? "border-sky-200 bg-white"
            : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Adım {index + 1}
          </p>
          <p className="mt-1 text-base font-semibold text-gray-900">{step.title}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
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
  const hasAnyName = Boolean(firstName.trim() || lastName.trim());
  const greetingName = hasProfile
    ? `${firstName.trim()} ${lastName.trim()}`
    : hasAnyName
      ? `${firstName.trim()} ${lastName.trim()}`.trim()
      : "hoş geldin";
  const steps: OnboardingStep[] = [
    {
      title: "Profil oluştur",
      description:
        "İsim ve soyisim ekleyin. Uygulama sizi tanısın ve özetleri kişisel şekilde sunsun.",
      cta: hasProfile ? "Profil tamamlandı" : "Adınızı kaydedin",
      done: hasProfile,
      unlocked: true,
      shortLabel: "Profil",
    },
    {
      title: "İlk kasanı ekle",
      description:
        "Tüm planlama ve güvenli bakiye görünümü bu adımdan sonra anlamlı hale gelir.",
      cta: "Kasalar sayfasına git",
      href: "/app/cash",
      done: hasCash,
      unlocked: hasProfile,
      shortLabel: "Kasa",
    },
    {
      title: "İlk borcunu ekle",
      description:
        "Borç, vade ve asgari ödeme bilgileri ödeme akışını ve bakiye özetini netleştirir.",
      cta: "Borçlar sayfasına git",
      href: "/app/debts",
      done: hasDebt,
      unlocked: hasProfile && hasCash,
      shortLabel: "Borç",
    },
    {
      title: "İlk ödemeni yap",
      description:
        "Ödeme kaydı ile hareket geçmişi, ay görünümü ve durum takibi gerçek veriye dönüşür.",
      cta: "Ödemeler sayfasına git",
      href: "/app/payments",
      done: hasPayment,
      unlocked: hasProfile && hasCash && hasDebt,
      shortLabel: "Ödeme",
    },
  ];
  const completedStepCount = steps.filter((step) => step.done).length;
  const completionRate = Math.round((completedStepCount / steps.length) * 100);
  const currentStep =
    steps.find((step) => step.unlocked && !step.done) ?? steps[steps.length - 1];
  const currentStepIndex = steps.findIndex((step) => step.title === currentStep.title);

  return (
    <section className="finance-panel px-5 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="finance-surface-strong rounded-[28px] px-5 py-8 text-center md:px-8">
          <span className="finance-badge finance-badge-good">AKÇA başlangıç</span>
          <h2 className="font-display mt-4 text-4xl tracking-tight text-gray-900 md:text-5xl">
            {hasProfile ? `${greetingName}, hazırsın.` : "Hoş geldin"}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600 md:text-base">
            İlk dört adım tamamlandığında genel durum ekranı gerçek borç, nakit ve
            ödeme akışını net şekilde göstermeye başlar.
          </p>
          <div className="mx-auto mt-6 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
            <div className="finance-stat-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                İlerleme
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {completedStepCount}/{steps.length}
              </p>
              <p className="mt-1 text-sm text-gray-500">adım tamamlandı</p>
            </div>
            <div className="finance-stat-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Şu An
              </p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {currentStep.shortLabel}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Adım {currentStepIndex + 1} aktif
              </p>
            </div>
            <div className="finance-stat-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Hesap
              </p>
              <p className="mt-2 truncate text-lg font-semibold text-gray-900">
                {email || "Bu oturum"}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                İlerleme yalnızca bu hesapta görünür
              </p>
            </div>
          </div>
          <div className="mx-auto mt-6 max-w-2xl">
            <div className="h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-[linear-gradient(90deg,#0f3d2e_0%,#5e8f76_100%)] transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">%{completionRate} tamamlandı</p>
          </div>
        </div>

        {!hasProfile ? (
          <div className="finance-surface-muted mx-auto max-w-3xl rounded-[28px] p-5 shadow-sm md:p-6">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Adım 1
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-900">
                İlk olarak seni tanıyalım
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                İsim ve soyisim bilgisi eklendiğinde onboarding akışı kişisel hale gelir
                ve sonraki adımlar açılır.
              </p>
            </div>
            <form onSubmit={onSaveProfile} className="mt-6 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-600">İsim</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => onFirstNameChange(e.target.value)}
                  className="finance-field"
                  placeholder="Örn: Emre"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">Soyisim</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => onLastNameChange(e.target.value)}
                  className="finance-field"
                  placeholder="Örn: Yılmaz"
                />
              </div>
              <div className="sm:col-span-2 flex justify-center">
                <button
                  type="submit"
                  className="finance-button-primary w-full sm:w-auto"
                >
                  Profili Kaydet ve Devam Et
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl rounded-[28px] border border-sky-200 bg-sky-50/70 p-5 text-center shadow-sm md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              Sıradaki Adım
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-gray-900">
              {currentStep.done ? "Kurulum tamamlandı" : currentStep.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {currentStep.done
                ? "Temel kurulum tamamlandı. Artık dashboard normal görünümüyle çalışıyor."
                : currentStep.description}
            </p>
            {currentStep.href && !currentStep.done ? (
              <Link
                href={currentStep.href}
                className="finance-button-primary mt-5"
              >
                {currentStep.cta}
              </Link>
            ) : (
              <div className="mt-5 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-gray-600 ring-1 ring-gray-200">
                Tüm temel adımlar tamamlandı
              </div>
            )}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {steps.map((step, index) => (
            <StepCard key={step.title} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
