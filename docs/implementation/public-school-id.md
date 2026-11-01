# Qisqa maktab IDsi: yakuniy hisobot

Sana: 2026-11-01. Ichki UUIDlar saqlandi; yangi foydalanuvchi identifikatori `public_school_id`.

## Amalga oshirilgan o'zgarishlar

- Avtomatik `SK-1001`, `SK-1002`, ...; `SK-9999`dan keyin `SK-10000`.
- Bitta global Blobs CAS registri raqam va UUIDga rezervni atomik saqlaydi. Parallel yaratish va yo'qolgan javobdan keyingi retry takror ID bermaydi. Nomni o'zgartirish IDga ta'sir qilmaydi; arxiv/o'chirishdan keyin rezerv saqlanadi. Uzilishlar sabab ketma-ketlikda bo'sh raqam qolishi mumkin.
- Dry-run/apply migratsiya mavjud kodlarni almashtirmaydi, faqat yetishmagan maydonni qo'shadi. Test, natija, sinf, admin, obuna va urinish bog'lanishlari UUIDda qoladi. Konfliktli eski kodlar jim almashtirilmaydi.
- Bosh admin kartasida qisqa ID, nusxalash, nom, admin, holat, obuna va boshqaruv bor; qisqa ID qidiruvi ishlaydi. Maktab admini sessiyadan o'z qisqa IDsini oladi va nusxalaydi. Oddiy interfeysda maktab UUIDsi ko'rsatilmaydi.
- O'quvchi `SK-1001` va 6 raqamli kod bilan testni topadi, tegishli sinf va ism/familiya bilan boshlaydi. Server startda kod va maktab/sinf/test bog'lanishini qayta tekshiradi. Noto'g'ri kombinatsiya tushunarli umumiy xabar bilan rad etiladi.
- Roster hamda kalitlar public APIga chiqmaydi; admin vakolati server sessiyasidan olinadi. Urinish egaligi, server muddati, monoton draft versiyasi va idempotent natija saqlanadi.

## Migratsiyani ishlatish

Lokal server: `npm run dev`. Lokal bosh admin kirish ma'lumotlari Gitdan chiqarilgan `.local/roles-dev.json`da saqlanadi; skript ularni konsolga chiqarmaydi.

```text
npm run migrate:school-ids
npm run migrate:school-ids -- --apply
```

Birinchi buyruq faqat reja beradi. Ikkinchisi faqat lokal Netlify Dev omboriga yozadi; localhost tekshiruvi va serverdagi `NETLIFY_DEV=true` talabi bor. Hisobot `artifacts/school-id-migration.json`ga yoziladi va Gitga kirmaydi.

Ushbu ishda lokal bazadagi 17 eski maktabga ID berildi. Ikkinchi apply: 17 maktab, 0 yangi ID. Keyingi test maktablari yaratishda avtomatik ID oldi. Production omboriga ulanilmadi va migratsiya bajarilmadi. Production uchun avval zaxira, dry-run va foydalanuvchi tasdig'i bilan alohida boshqariladigan migratsiya talab qilinadi; lokal apply yo'lini productionga ochish bu ishga kirmaydi.

## Qabul mezonlari va dalillar

| Talab | Tekshiruv |
| --- | --- |
| Birinchi va keyingi ID | Router testi: SK-1001 va SK-1002; UUID o'zgarmaydi |
| ID takrorlanmasligi | 20 parallel router create va 2 parallel haqiqiy lokal HTTP create |
| Nom o'zgarishida saqlanish | Router va bosh admin brauzer testi |
| Eski maktablarga ID | Migratsiya router/service testi va 17 lokal yozuv |
| Qayta migratsiyada saqlanish | Takror apply, uzilgan rezerv va parallel migratsiya testlari |
| Oldindan mavjud ID | SK-9000 saqlanadi; keyingi raqam band maksimumdan olinadi |
| Bosh admin qisqa IDsi | Qidiruv va haqiqiy clipboard brauzerda tekshirildi |
| Maktab admini qisqa IDsi | Sessiya, badge va haqiqiy clipboard; 320 px |
| O'quvchi qisqa ID bilan kirishi | Kod, sinf, ism/familiya, reload va 1/1 natija brauzerda |
| Boshqa maktab kodi | Router va brauzerda rad; UUID kiritish ham rad |
| Eski test/natijalar | Migratsiyada ombor snapshotlari o'zgarmaydi; verify va eski oqim brauzerda o'tdi |
| Ruxsat va recovery | Begona sinf, brauzer, eski draft, parallel submit va kech javob regressiyalari |

| Buyruq | Natija |
| --- | --- |
| `npm test` | 132/132 o'tdi |
| `npm run check` | Fayl limitlari, qatlamlar, inline kod va public havolalari o'tdi |
| `npm run verify` | 9 integratsiya oqimi o'tdi |
| `npm run test:schools:browser` | 9 tekshiruv, 320/390/1280 px, 0 JS xato |
| `npm run test:school-entry:browser` | 4 tekshiruv, 320/390/1280 px, 0 JS xato |
| `npm run test:browser` | Asosiy eski oqim, 20/20 va 9 responsive/a11y tekshiruvi o'tdi |
| `npm run test:audit:api` | 7 xavfsizlik/recovery oqimi o'tdi |
| `npm run test:audit:auth` | 3 parol/sessiya/logout tekshiruvi o'tdi |
| `npm run test:audit:browser` | 8 xavfsizlik/recovery tekshiruvi, 0 JS xato |

Dalillar: `artifacts/schools-browser.json`, `artifacts/school-entry-browser.json`, `artifacts/school-entry-{320,390,1280}.png`. Faqat lokal Chrome va lokal Netlify Dev ishlatildi. GitHub push va Netlify deploy bajarilmadi.
