# Project Handoff

## Uygulama Özeti

Borç Takip App; kullanıcı bazlı borç, kasa ve ödeme yönetimi yapar. Auth, dashboard, risk analizi, payoff planner, export/import ve operasyon özeti tek sayfada toplanır.

## Ana Klasör Yapısı

- `app/`: layout, ana sayfa orkestrasyonu ve global stiller
- `components/`: form, liste, dashboard ve auth bileşenleri
- `hooks/`: debt, cash ve payment state/orchestration katmanı
- `lib/`: saf iş kuralları, service katmanı, auth, export/import ve yardımcılar
- `types/`: ortak tip tanımları
- `supabase/migrations/`: auth scope ve RLS hazırlık SQL dosyaları

## Ana Hooklar

- `useDebtManager`: debt CRUD, filtreleme, aktif/kapanmış ayrımı
- `useCashManager`: cash CRUD ve arama
- `usePaymentManager`: payment CRUD, rollback, filtre ve görünür liste

## Service Katmanı

- `debtService`, `cashService`, `paymentService`: Supabase veri erişimi
- Tüm service fonksiyonları opsiyonel `userId` ile scope edilebilir

## Auth Akışı

- Giriş bağlantısı ile oturum açma
- Session yoksa `AuthGate`, session varsa protected app görünür
- Logout veya kullanıcı değişiminde kullanıcıya bağlı local state temizlenir

## Export / Import

- CSV export: cash, debt, payment listeleri
- JSON backup: preview + confirm ile append import
- Import ilişkileri parse aşamasında doğrulanır

## Test ve Komutlar

- `npm run dev`
- `npm run lint`
- `npm run test`
- `npm run build`

## Env Gereksinimleri

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Deploy Öncesi Kısa Checklist

- `.env.local` değerlerini doğrula
- Supabase auth redirect ayarlarını kontrol et
- `supabase/migrations/20260331_add_user_scope_auth.sql` uygulansın
- `npm run lint && npm run test && npm run build` temiz geçsin

## Kritik İş Kuralları

- Payment create/update/delete akışında debt ve cash etkisi rollback planı ile korunur
- `remainingDebt <= 0` olan borç kapanmış kabul edilir
- Payment bağlı debt/cash kayıtları doğrudan silinemez
- Auth sonrası veri erişimi kullanıcı scope’una göre çalışır
