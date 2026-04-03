# Manual QA Checklist

## Auth

- Login gate açılıyor mu
- Giriş bağlantısı mesajı doğru görünüyor mu
- Logout sonrası protected ekran kapanıyor mu
- Kullanıcı değişince eski veri görünmüyor mu

## Onboarding

- İlk kullanıcıda boş onboarding alanı görünüyor mu
- İlk kasa veya borç eklendikten sonra onboarding kalkıyor mu

## Debt

- Debt ekleme, düzenleme, silme çalışıyor mu
- Aktif/kapanmış ayrımı doğru mu
- Arama ve sekme filtreleri birlikte çalışıyor mu

## Cash

- Cash ekleme, düzenleme, silme çalışıyor mu
- Arama ve CSV export doğru mu

## Payment

- Payment ekleme, düzenleme ve silme çalışıyor mu
- Delete/update sonrası rollback doğru mu
- Filtre, arama ve min/max tutar alanları çalışıyor mu

## Dashboard ve Planlama

- Summary kartları doğru mu
- Upcoming payments doğru hesaplanıyor mu
- Risk overview ve payoff planner değerleri mantıklı mı
- Operations overview ve data health alanları güncel mi

## Export / Import

- Debt, cash ve payment CSV export dosyaları doğru mu
- JSON backup export oluşuyor mu
- JSON import preview, confirm ve append akışı doğru mu

## Güvenlik ve Kritik İşlemler

- Debt/cash/payment silmelerinde confirm davranışı doğru mu
- Payment bağlı debt/cash silme engeli çalışıyor mu
- Auth scope ile farklı kullanıcı verisi karışmıyor mu

## Mobil Temel Kontrol

- Ana bölümler taşmadan okunuyor mu
- Tablo ve aksiyon butonları mobilde kullanılabilir mi
