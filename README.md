# Borç Takip App

Supabase tabanlı borç, kasa ve ödeme yönetimi uygulaması. Ana ekran; dashboard özetleri, risk görünümü, yaklaşan ödemeler, işlem geçmişi, arşiv, CSV export ve JSON yedekleme akışlarını tek sayfada toplar.

## Geliştirme

```bash
npm run dev
```

Gerekli ortam değişkenlerini `.env.local` içine ekleyin:

```bash
cp .env.example .env.local
```

Kalite komutları:

```bash
npm run lint
npm run test
npm run build
```

## Ana Yapı

- `app/page.tsx`: sayfa orkestrasyonu, özet veriler ve ana render akışı
- `hooks/useDebtManager.ts`: debt form state, CRUD, arama, sekme filtresi, aktif/kapanmış ayrımı
- `hooks/useCashManager.ts`: cash form state, CRUD ve arama
- `hooks/usePaymentManager.ts`: payment form state, create/update/delete rollback, filtreleme ve görünür liste yönetimi
- `lib/*Service.ts`: Supabase veri erişim katmanı
- `lib/paymentRules.ts`: payment validation ve rollback planı oluşturan saf iş kuralları
- `lib/payoffPlanner.ts`: ödeme stratejisi sıralaması ve senaryo analizi
- `lib/debtLifecycle.ts`: aktif/kapanmış debt durumu
- `lib/upcomingPayments.ts`: yaklaşan ödeme görünümü için saf hesaplama
- `lib/riskOverview.ts`: risk, öncelik ve aylık performans hesapları
- `lib/backup.ts`: JSON export/import preview doğrulama akışı
- `lib/dataHealth.ts`: operasyon özeti, veri sağlık kontrolü ve önerilen aksiyonlar
- `lib/auth.ts`: Supabase Auth session, magic link giriş ve logout yardımcıları
- `lib/formatCurrency.ts`: para birimi, tarih ve temel metin formatlama yardımcıları
- `lib/exportCsv.ts`: CSV dışa aktarma yardımcıları
- `supabase/migrations/20260331_add_user_scope_auth.sql`: `user_id` kolonları ve temel owner bazlı RLS başlangıcı
- `components/AuthGate.tsx`: session yokken çalışan login gate
- `components/OnboardingEmptyState.tsx`: yeni kullanıcı için ilk kurulum yönlendirmesi

## Kritik İş Kuralları

- Payment create/update/delete akışlarında debt ve cash etkisi rollback planları ile korunur.
- Payment silme veya düzenleme sonrası debt `remainingDebt` ve cash `balance` tutarlılığı korunur.
- Payment bağlı debt/cash kayıtları doğrudan silinemez.
- `remainingDebt <= 0` olan borçlar kapanmış kabul edilir ve arşive düşer.
- Yaklaşan ödeme ve risk alanları yalnızca aktif borçlar üzerinden hesaplanır.
- Payoff planner yalnızca öneri üretir; otomatik payment işlemi başlatmaz.
- Stratejiler: en yüksek faiz, en küçük borç ve en yakın vade öncelikli sıralama.
- Ayarlar paneli, görüntüleme para birimi ve kritik işlem onay davranışını saklar.
- Operations overview; borç, kasa, ödeme ve yaklaşan ödeme metriklerini tek yerde toplar.
- Veri sağlık kontrolleri negatif bakiye, bozuk ilişki ve geçersiz vade kayıtlarını raporlar.
- Servis katmanı opsiyonel `userId` scope desteği taşır; verilmezse mevcut tek kullanıcı davranışı korunur.
- Auth başlangıcı magic link tabanlıdır; session yoksa dashboard render edilmez.
- Hook ve servis zinciri aynı `userId` ile kullanıcı bazlı sorguya geçirilmiştir.
- Gerçek kullanıcı izolasyonu için migration dosyasındaki `user_id` alanları ve RLS politikaları uygulanmalıdır.
- Yeni kullanıcıda debt/cash/payment verisi yoksa onboarding paneli gösterilir.
- Logout veya kullanıcı değişiminde hook state ve kullanıcıya ait yerel activity kayıtları temizlenir.

## Yedekleme

- JSON export: debts, cash, payments ve metadata içerir.
- JSON import: önizleme + onaylı append modunda çalışır; mevcut verileri silmez.
- CSV export: cash, debt ve payment listeleri için ayrı ayrı mevcuttur.

## Dokümanlar

- `docs/PROJECT_HANDOFF.md`: devralma ve teknik özet
- `docs/manual-qa-checklist.md`: release öncesi manuel kontrol listesi

## Deploy Checklist

- `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` değerlerini production ortamına tanımlayın.
- `supabase/migrations/20260331_add_user_scope_auth.sql` migration dosyasını uygulayın.
- Giriş bağlantısı auth akışı için Supabase dashboard üzerinde site URL ve redirect ayarlarını doğrulayın.
- Deploy öncesi sırasıyla `npm run lint`, `npm run test` ve `npm run build` çalıştırın.
- `user_id` ve RLS politikalarının debts, cash ve payments tablolarında aktif olduğunu kontrol edin.
