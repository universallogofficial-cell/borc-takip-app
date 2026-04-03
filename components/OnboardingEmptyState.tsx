type OnboardingEmptyStateProps = {
  email: string | null;
};

export default function OnboardingEmptyState({
  email,
}: OnboardingEmptyStateProps) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="max-w-3xl">
        <h2 className="text-xl font-semibold text-gray-900">
          Hoş geldiniz{email ? `, ${email}` : ""}.
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Hesabınızda henüz kayıt görünmüyor. En hızlı başlangıç için önce kasa,
          sonra borç ekleyin. Son adımda ödeme ekranı ile düşüm ve takip akışını
          kullanabilirsiniz.
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-900">1. Önce Kasa Ekle</p>
          <p className="mt-1 text-sm text-gray-600">
            Kullanacağınız ana nakit hesabını ekleyin. Ödeme planları bu bakiye
            üzerinden hesaplanır.
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-900">2. Borçları Girin</p>
          <p className="mt-1 text-sm text-gray-600">
            Kurum, kalan borç, minimum ödeme ve vade günü bilgilerini ekleyin.
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-900">3. Ödeme Akışını Kullan</p>
          <p className="mt-1 text-sm text-gray-600">
            Kasa ve borç tanımlandıktan sonra ödeme ekranı ile düşüm, planlama ve
            dashboard alanları aktif hale gelir.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
        Elinizde mevcut veri varsa, aşağıdaki JSON yedek içe aktarma alanı ile
        güvenli ekleme yapabilirsiniz.
      </div>
    </section>
  );
}
