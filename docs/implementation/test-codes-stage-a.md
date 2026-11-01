# A bosqichi — umumiy test kodi va maktab admini

Sana: 2026-10-31. Bajarilgan doira: A. B/C tasdiq kutiladi.

## Asl sabab va qaror

Mavjud `test-service` testni saqlagan, lekin umumiy test kodi modeli, generatori, repositorysi yoki admin javobidagi maydon mavjud bo‘lmagan. `student-code.mjs` esa rosterdagi o‘quvchining shaxsiy 16 belgili kodiga tegishli. Shu sabab test kartasi hech qayerdan 6 raqamli umumiy kod ola olmagan. Bu UI’da yashirilgan qiymat emas, server funksiyasi yetishmasligi edi.

Yangi foydalanuvchi topshirig‘i admin kodni saqlashdan keyin, ro‘yxatda va reload’dan keyin ham ko‘rishini talab qildi. Bu oldingi bir martalik ko‘rsatish qoidasini almashtiradi. Ochiq qiymat faqat tegishli maktab adminining yopiq javobiga qo‘shiladi; omborda shifrlangan saqlanadi.

## Bajarildi

- `randomInt(1_000_000)` orqali aynan 6 raqamli satr; boshlang‘ich nollar saqlanadi.
- Maktab registri bitta CAS yozuvida testga bog‘langan shifrlangan kod va HMAC rezervlarini saqlaydi. Bir maktabda band qiymat boshqa testga berilmaydi; parallel yaratish va almashtirish versiya bilan himoyalangan.
- Test saqlash, ro‘yxat, admin tafsiloti va tahrir javoblari `testCode: {value,state,version}`ni beradi. Bazadan o‘qilganda o‘sha qiymat qaytadi. Yetishmayotgan kod faqat o‘z maktabiga tegishli eski test uchun bir marta to‘ldiriladi; egasiz legacy testga maktab taxmin qilinmaydi.
- Kod dastlab `inactive`; admin `activate`, `revoke`, `replace` amallarini bajaradi. Bekor kod qayta faollashtirilmaydi; replace boshqa nofaol qiymat yaratadi. Test nusxasi boshqa kod oladi. Mavjud testni tahrirlash qiymatni almashtirmaydi.
- Kod holati testning faolligi, savollar revision’i, natija yoki urinish muddatini o‘zgartirmaydi. Testni to‘xtatish va kodni bekor qilish alohida amallar.
- Test kartasi nom, fan, sinf, savol soni, davomiylik, kod, test/kod holati va jadvalni ko‘rsatadi. Clipboard muvaffaqiyati va rad etilishi uchun xabar bor; bekor qilish/almashtirish tasdiqlanadi.
- Fan formasi qo‘shildi, eski testlar uchun ixtiyoriy. Tahrir va zaxira formatiga mosligi saqlandi.
- Maktab adminining kod amallari IP+maktab bo‘yicha 60/minut bilan cheklangan. Boshqa maktab, bosh admin, anonim va legacy hisoblar kodni boshqarmaydi.

`TOKEN_SECRET`dan HKDF bilan alohida shifrlash, rezerv va kalit identifikatori kalitlari hosil qilinadi. AES-256-GCM kodi maktab/testga AAD bilan bog‘laydi. Kalit mos kelmasa 503 va tushunarli xabar beriladi; mavjud kod yo‘qotilmaydi yoki yashirin yangilanmaydi. Kalitni almashtirish oldidan alohida registr migratsiyasi/re-encryption kerak. Maxfiy kalit UI, Git yoki oddiy backupga chiqarilmaydi.

## Fayllar

| Yangi fayl | Vazifa |
| --- | --- |
| `server/lib/test-code.mjs` | Generator, format, HMAC va shifrlash |
| `server/lib/test-code-policy.mjs` | Rezerv/noyoblik va holat/versiya siyosati |
| `server/repositories/test-codes-repo.mjs` | Maktabning atomik kod registri |
| `server/services/test-code-service.mjs` | O‘z maktabi kodi va admin amallari |
| `public/js/teacher/test-codes.js` | Kod kartasi, clipboard va tasdiqlashlar |
| `public/css/pages/test-codes.css` | Kodning responsive ko‘rinishi |
| `tests/test-code.test.mjs` | 7 ta generator/crypto/format/holat/zaxira sinovi |
| `tests/test-code-api.test.mjs` | 13 ta router/egalik/persistence/parallel/rate-limit sinovi |
| `scripts/test-codes-browser.mjs` | Lokal Chrome’da 8 ta kod oqimi |
| `docs/implementation/test-codes-stage-a.md` | Ushbu hisobot |

| O‘zgartirilgan fayl | Vazifa |
| --- | --- |
| `server/services/test-service.mjs` | Admin javobiga kod, yaratish retry va fan |
| `server/repositories/blob-store.mjs` | `test-codes`ga maktab egaligi filtri |
| `server/routes/admin/tests.mjs` | Admin tafsiloti va `/admin/tests/:id/code` POST |
| `server/lib/backup-validate.mjs` | Ixtiyoriy fan maydonini eski formatga mos tiklash |
| `public/js/teacher/tests.js` | Kodli kartalar, fan/jadval va amallar |
| `public/js/teacher/test-form-view.js` | Fan maydoni va kod bo‘yicha izoh |
| `public/js/teacher/test-form.js` | Fanni serverga yuborish |
| `public/css/styles.css` | Maxsus kod CSS importi |
| `package.json` | `test:test-codes:browser` buyrug‘i |
| `README.md`, `PLAN.md`, `docs/ARCHITECTURE.md` | Ishlatish, tuzilma va A/B/C chegarasi |
| `docs/requirements/test-code.md` | Qayta ko‘rsatish talabining yangilanishi |

## Tekshiruvlar

| Buyruq / mezon | Natija |
| --- | --- |
| `npm test` | 99/99: 79 mavjud + 20 yangi |
| `npm run check` | O‘tdi: 250 qator, import/inline kod va qatlamlar |
| `npm run build` | O‘tdi; bu tuzilma tekshiruvi |
| `npm run verify` | 9/9 mavjud API oqimi |
| `npm run test:audit:api` | 7/7 xavfsizlik/recovery oqimi |
| `npm run test:audit:auth` | 3/3; asl lokal parol tiklandi |
| `npm run test:audit:browser` | 8/8; qidiruv/fokus, offline/reload va 0 JS xato |
| `npm run test:browser` | Mavjud asosiy UI oqimlari va 9 responsive/a11y audit o‘tdi |
| `npm run test:test-codes:browser` | 8/8 yangi oqim, real clipboard va 320/390/1280 px |

Yangi avtomatik tekshiruvlar: aniq 6 raqam va boshlang‘ich nol; shifrlash/AAD; maktab/test doirasi; to‘qnashuv qayta urinish; yaratish idempotentligi; parallel replace; API/reload’da qiymat bir xilligi; test tahriri/nusxasi; state/version radlari; code amallarining test/natijani o‘zgartirmasligi; public/backup orqali kod sizmasligi; kalit almashganda fail-closed; eski backup bilan fan mosligi. Browser tekshiruvida test textarea qiymati uchun dastlab noto‘g‘ri matcher ishlatilgan, `toHaveValue`ga tuzatildi; ilova xatosi yashirilmagan.

Router testlari xotira Blobs adapterida, brauzer esa haqiqiy Netlify Dev + lokal Blobs’da bajarildi. QA maktab/testlar yaratildi, mavjud biznes ma’lumotlari tozalanmadi. Productionga yozish yoki deploy bajarilmadi. Artefaktlar `artifacts/test-codes-browser.json` va `test-codes-320/390/1280.png`; Gitga kirmaydi.

## Qolgan ishlar va chegaralar

1. **B hali bajarilmagan:** maktab IDsi + umumiy kodni public API’da tekshirish, guessing cheklovlari, sinf/ism/tasdiqlash/start va natijani maktabga bog‘lash. A’dagi admin rate limit public guessing himoyasi deb ko‘rsatilmaydi. O‘quvchi yangi umumiy kod bilan hali kira olmaydi.
2. **C hali bajarilmagan:** bosh admin navigatsiyasi, monitoring, umumiy statistika va maktab boshqaruv dizayni.
3. Legacy `student-code` kirishi A doirasida o‘zgarmadi; umumiy kod registri har bir o‘quvchiga alohida kod yaratmaydi. Shaxsiy kodga bog‘liq eski kirish B’da qayta ishlanadi.
4. Egasi tasdiqlanmagan sinf/test/natijaga avtomatik maktab biriktirilmadi. Mavjud IDlar va baholar qayta yaratilmagan. Oddiy backup test registrining shifrlangan kodlarini eksport qilmaydi; to‘liq disaster recovery va kalit migratsiyasi alohida jarayon bo‘lishi kerak.
5. Registr hozir maktab bo‘yicha bitta CAS hujjat: barcha kodlar atomik boshqariladi. Juda katta maktab hajmlari uchun indeks/registrni bo‘lish alohida yuklama tekshiruvini talab qiladi.
6. Topshiriqda tilga olingan `group-1-acceptance.md` hanuz mavjud emas. A mezonlari yangi topshiriq va mavjud olti talab hujjatidan olindi.

Boshlanishida ishchi papkada avvalgi apostrof/format o‘zgarishlari mavjud edi; ular o‘chirilmadi va umumiy reset qilinmadi. A uchun o‘zgartirilgan fayllar yuqorida ajratildi. Lokal server `http://127.0.0.1:8888`da ishlaydi. B faqat foydalanuvchi tasdig‘idan keyin; GitHub push va Netlify deploy bajarilmaydi.
