# 1.1-bosqich: rollar va server vakolatlari hisoboti

Sana: 2026-10-31. Faqat 1.1 doirasi. 1.2–1.7 avtomatik boshlanmaydi.

## Tasdiqlangan qarorlar

- `group-1-acceptance.md` mavjud emas; foydalanuvchi 1.1 uchun `roles.md` mezonlarini qo‘llashni tasdiqladi.
- Bosh admin maktab adminini login/parol bilan yaratadi; bir maktabda bitta admin, bir admin faqat bitta maktabda.
- 1.1 uchun minimal maktab bog‘lanishi infratuzilmasi ruxsat etildi; eski yozuvlarni maktabga biriktirish, ID migratsiyasi va eski adminni avtomatik bosh adminga aylantirish bajarilmaydi.
- Push va Netlify deploy alohida ruxsatsiz bajarilmaydi.

## Qo‘shilgan imkoniyatlar

Serverda `super_admin`, `school_admin` va moslik uchun `legacy_admin` ajratildi. O‘quvchi hisob ochmaydi va admin APIga kira olmaydi; mavjud urinish tokeni/brauzer egaligi qoidalari saqlanadi. Yangi o‘quvchi umumiy kod oqimi 1.3–1.5 doirasida qoladi.

Bosh admin minimal panelida maktab yaratish/nomini tahrirlash, login/parolli maktab admini tayinlash va obuna muddati/holatini boshqarish bor. Bu obuna metadata'si; yangi startni obunaga bog‘lash 1.4–1.5 da bajariladi. Bosh admin o‘quvchi ro‘yxati, test javob kalitlari va individual natijalarni olmaydi.

Maktab admini sinf, test, natija, tahlil, eksport va backupni faqat o‘z `schoolId` doirasida oladi. Server mijoz yuborgan `schoolId`/rolni vakolat deb qabul qilmaydi. Begona ID bilan o‘qish, tahrirlash, nusxalash, o‘chirish, tahlil va retake rad etiladi. Restore/clear yangi adminlarga hali berilmagan; UI'da ham taklif qilinmaydi.

Hisob paroli scrypt hash bo‘lib saqlanadi. Token paroldan mustaqil tasodifiy versiya va server sessiyasiga bog‘langan; logout sessiyani bekor qiladi, parol o‘zgarishi shu hisobning eski sessiyalarini yaroqsiz qiladi. Login so‘rovlari IP va login bo‘yicha cheklanadi. Hisob va maktabdagi admin sloti har vakolat tekshiruvida mos bo‘lishi shart.

Repository adapteri maktab doirasini AsyncLocalStorage orqali oladi. O‘qishlar javob berishdan oldin filtrlab qaytariladi, yozishlar egalik va shartli yangilash bilan himoyalanadi. Scoped ro‘yxatlarda umumiy kesh ishlatilmaydi. Bitta so‘rov konteksti parallel boshqa so‘rovga ko‘chmaydi.

## Fayllar

| Yangi fayl | Vazifa |
| --- | --- |
| `server/lib/access-context.mjs` | Ishonchli so‘rov konteksti, rol/egalik va maktab shtampi |
| `server/repositories/accounts-repo.mjs` | Alohida admin hisoblari |
| `server/repositories/schools-repo.mjs` | Minimal maktab boshqaruv yozuvlari |
| `server/services/account-service.mjs` | Bootstrap/login, hisob sessiyasi, admin tayinlash va parol versiyasi |
| `server/services/school-service.mjs` | Bosh adminning maktab va obuna metadata amallari |
| `server/routes/admin/schools.mjs` | Faqat bosh admin uchun HTTP adapterlar |
| `public/bosh-admin/index.html` | Minimal bosh admin paneli |
| `public/js/super-admin/index.js` | Panel sessiyasi va formalar |
| `tests/roles.test.mjs` | 19 ta rol/egalik/router regressiyasi |
| `tests/roles-session.test.mjs` | 6 ta hisob/sessiya/rate-limit regressiyasi |
| `tests/helpers/memory-blobs.mjs` | Diskka tegmaydigan shartli yozish test adapteri |
| `tests/helpers/roles-loader.mjs` | Faqat test jarayonida SDK importini almashtirish |
| `tests/helpers/roles-fixture.mjs` | Izolyatsiyalangan A/B maktab va hisob fixturelari |
| `scripts/roles-browser.mjs` | Haqiqiy lokal API va yangi ekranlarni Chrome'da tekshirish |

| O‘zgartirilgan fayl | O‘zgarish |
| --- | --- |
| `server/router.mjs` | Server rol matritsasi, so‘rov konteksti va rol/maktab spoof himoyasi |
| `server/repositories/blob-store.mjs` | Scoped read/write/delete/clear va kesh chegarasi |
| `server/services/auth-service.mjs` | Yangi hisob sessiyasi va legacy doirasini ajratish |
| `server/services/class-service.mjs` | Yangi sinfga server maktab bog‘lanishi |
| `server/services/test-service.mjs` | Yangi testning maktab doirasi va requestId to‘qnashuvi himoyasi |
| `server/routes/admin/login.mjs` | Loginli hisob va eski parolli kirish |
| `server/routes/admin/settings.mjs` | Xavfsiz sessiya metadata'si |
| `server/routes/index.mjs` | Bosh admin yo‘llarini ulash |
| `public/oqituvchi/kirish.html` | Ixtiyoriy admin login maydoni; legacy uchun bo‘sh qoladi |
| `public/js/teacher/login.js` | Server roli bo‘yicha panelga yo‘naltirish |
| `public/js/teacher/shell.js` | Sessiya/rol tekshiruvi va maktab kontekstini ko‘rsatish |
| `public/js/teacher/data.js` | Sozlamalarga server roli metadata'sini uzatish |
| `public/js/teacher/settings.js` | Maktab adminida taqiqlangan restore/clear UI'sini bermaslik |
| `package.json` | `test:roles:browser` buyrug‘i |
| `.env.example` | Qiymatsiz bosh admin bootstrap o‘zgaruvchilari |
| `README.md`, `PLAN.md`, `docs/ARCHITECTURE.md` | Ishlatish, bosqich chegarasi va tuzilma |
| `docs/implementation/roles-stage-1.md` | Ushbu hisobot |

Oldingi ishda yaratilgan `student-flow.md` va `screens.md` mazmuni bu implementatsiya davomida o‘zgartirilmadi; ular alohida hujjat o‘zgarishlari sifatida saqlanadi.

## Tekshiruvlar

| Tekshiruv | Natija |
| --- | --- |
| `npm test` | 79/79 o‘tdi: 54 eski + 25 yangi |
| `npm run check` | O‘tdi: qator limiti, public havolalari, inline kod va qatlamlar |
| `npm run verify` | 9/9 lokal integratsiya oqimi o‘tdi |
| `npm run test:audit:api` | 7/7 xavfsizlik/recovery oqimi o‘tdi |
| `npm run test:audit:auth` | 3/3 parol/sessiya/logout oqimi; asl lokal parol tiklandi |
| `npm run test:audit:browser` | 8/8 audit oqimi, 0 JS xato |
| `npm run test:browser` | Mavjud asosiy UI oqimlari va 9 responsive/a11y audit o‘tdi |
| `npm run test:roles:browser` | 8/8 oqim o‘tdi; bosh admin/maktab admini UI va API, restore/clear chegarasi, 320/390/1280 px |
| `npm run build` va `git diff --check` | O‘tdi; build kompilyatsiya qilmaydi, tuzilmani tekshiradi |

Yangi router testlari haqiqiy router → service → repository kodini alohida xotira adapterida bajaradi. Brauzer sinovi haqiqiy Netlify Dev va lokal Blobs bilan ishlaydi. Productionga yozadigan test bajarilmadi. Eski audit skriptlari faqat o‘zi yaratgan vaqtinchalik sinf/test/natijalarni tozalaydi; mavjud biznes ma'lumotlarini migratsiya/tozalash bu ishning qismi emas. Yangi rollar brauzer sinovi `QA roles` maktablari va hisoblarini lokalda qoldiradi.

Tekshiruv paytida topilgan va tuzatilgan regressiya: sessiya tekshiruvini DOM yaratilishidan oldin kutish natija qidiruvi hodisa tinglovchisining ulanmay qolishiga sabab bo‘ldi. DOM yaratilishi saqlanib, sessiya tekshiruvi ma'lumot yuklashdan oldinga ko‘chirildi; auditda qidiruv va fokus qayta o‘tdi. Auth auditi bilan ustma-ust boshlangan dastlabki brauzer kirishi vaqtinchalik parol tufayli rad etilgan; yakuniy auditlar ketma-ket bajariladi.

Ko‘p marta qaytarilgan localhost login sinovlari amaldagi 20 so‘rov/15 daqiqa limitiga yetdi (429). Limit o‘chirilmagan yoki hisoblagich tozalanmagan; yakuniy brauzer auditi alohida IPv4 localhost (`TEST_BASE_URL=http://127.0.0.1:8888`) orqali o‘tdi. Bu muhit ham faqat lokal Blobs'dan foydalanadi.

Ish davomida `public/index.html`da agent bajarmagan formatlash o‘zgarishi paydo bo‘ldi. Mazmuniy kirish oqimi o‘zgarmagan ko‘rinadi; fayl saqlandi va 1.1 commitiga qo‘shilmaydi.

## Ishlatish va qolgan chegaralar

Kirish: `http://localhost:8888/oqituvchi/kirish.html`; bosh admin paneli: `http://localhost:8888/bosh-admin/index.html`. Bosh adminni yaratish uchun server muhitida `SUPER_ADMIN_LOGIN` va `SUPER_ADMIN_PASSWORD` kerak. Mavjud o‘qituvchi paroli avtomatik bosh admin hisobiga aylantirilmaydi. Bootstrap hisob mavjud bo‘lgach muhit parolini almashtirish uning saqlangan parolini o‘zgartirmaydi.

Lokal brauzer sinovining tasodifiy QA bootstrap qiymatlari faqat Gitga kirmaydigan `.local/roles-dev.json`da; haqiqiy production paroli tayinlanmadi. `.env`, `.netlify`, `.local`, tokenlar, parol hashlari va artefaktlar commitga kiritilmaydi.

- Eski yozuvlar `schoolId` olmagan, IDlari qayta yaratilmagan. Ularni maktabga biriktirish 1.2 uchun alohida, egasi tasdiqlanadigan migratsiyadir.
- Yangi maktab ma'lumotlari eski public o‘quvchi API orqali chiqmaydi. Yangi maktabda o‘quvchi kirishi, umumiy kod va to‘liq ekranlar 1.3–1.6 gacha ochiq emas; eski o‘quvchi oqimi saqlangan.
- Maktab adminini qayta tayinlash/tiklash UI'si, monitoring va tarif/to‘lov avtomatizatsiyasi hali bajarilmagan. 1.1 minimal obuna metadata'sini boshqaradi.
- Parallel admin tayinlashda yutqazgan login rezervi inactive qolishi mumkin; u login yoki sessiya olmaydi. Bir xil login/parol bilan qayta yuborish maktab sloti o‘sha hisobniki bo‘lsa davom etadi. Yetim rezervlarni boshqarish keyingi recovery siyosatiga tegishli.
- Scoped o‘qishlar hozir ombor yozuvlarini server ichida filtrlab oladi; katta hajm uchun maktab bo‘yicha fizik indeks/bo‘lish va production workerlaridagi yuklama alohida tekshiriladi.
- 1.1 uchun lokal tekshiruvlar yakunlangach 1.2 ga o‘tish mumkin; faqat foydalanuvchi `DAVOM ET` deganidan so‘ng. Push va deploy qilinmagan.
