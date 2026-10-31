# Ish rejasi

## A — umumiy test kodi va maktab admini (2026-10-31)

Yangi topshiriq A/B/C tartibida; hozir faqat A. Test saqlash va ro‘yxat API’si maktabga bog‘langan testga 6 raqamli umumiy kod yaratadi/qaytaradi. Maktab admini kodni qayta ko‘radi, nusxalaydi, faollashtiradi, bekor qiladi va yangi kod oladi. Test holati va kod holati mustaqil. Fan hamda jadval kartada ko‘rsatiladi.

Kod registri maktab doirasida CAS bilan saqlanadi; bir maktabda band kod boshqa testga qayta berilmaydi. Kod qiymati AES-GCM bilan shifrlangan, rezerv HMAC bilan bog‘langan; TOKEN_SECRET’dan alohida maqsad kalitlari hosil qilinadi. Server kaliti o‘zgarsa registr bloklanadi, mavjud kod ustidan yangisi yaratilmaydi.

Eski maktab egasi yo‘q yozuvlar migratsiya qilinmaydi; mavjud maktab testlarining yetishmayotgan umumiy kodi admin o‘qishida bir marta to‘ldiriladi. Public kodli kirish, guessing rate limit, sinf/ism/confirmation va obuna bilan start nazorati B bosqichida; bosh admin dizayni C bosqichida. Ular foydalanuvchi tasdig‘isiz boshlanmaydi.

Sinovlar: format/crypto/holat siyosati, haqiqiy router-service-repository izolyatsiyasi, lokal Chrome’da saqlash/reload/clipboard/tahrir/faollik/320–1280 px. Yakuniy dalillar `docs/implementation/test-codes-stage-a.md`da. Push va deploy uchun alohida tasdiq kerak.

## 1.1 — Rollarni kodga joriy etish (2026-10-31)

Tasdiqlangan doira: `roles.md` qabul mezonlari; 1.7 hujjati hali mavjud emas.
Bosh admin maktab adminini login/parol bilan yaratadi; bitta maktabda bitta admin, bitta admin faqat bitta maktabga biriktiriladi.
Minimal maktab boshqaruv yozuvi 1.1 uchun infratuzilma; eski ma'lumotni avtomatik biriktirish va 1.2 migratsiyasi bajarilmaydi.

- Server rol tekshiruvi, hisobga bog‘langan sessiya, parol versiyasi va logout.
- Repository qatlamida asinxron so‘rov konteksti, egalik filtri va yozishni himoyalash.
- Alohida bosh admin paneli va maktab adminining tekshirilgan konteksti.
- Legacy kirish faqat `schoolId` yo‘q eski yozuvlarga; yangi maktab yoki bosh admin huquqi yo‘q.
- Yangi maktablar eski public o‘quvchi API orqali ochilmaydi; kirish oqimi 1.3–1.5 da joriy etiladi.
- Yangi adminlarda restore/clear vakolati hali berilmagan; scoped backup mavjud.
- Avtomatik router testlari, lokal rollar brauzer sinovi va mavjud auditlar; natijalar `docs/implementation/roles-stage-1.md`da.
- Push/deploy faqat foydalanuvchining yangi tasdig‘i bilan. 1.2 faqat `DAVOM ET`dan keyin.

Mahalliy parol tanlovi: foydalanuvchi so'roviga ko'ra lokal minimum 5 qilib sozlandi. Standart minimum 12 saqlandi; server va panel muhitdagi bir xil siyosatdan foydalanadi. Haqiqiy parol .env va Blobs'da, Gitga kiritilmaydi.

## Audit va tuzatish

Boshlang'ich audit kod o'zgarmasdan chatda va docs/AUDIT-OLDIN.md'da berildi (baza 8afe461).
S01–S05: admin sessiyalar, o'quvchi kodlari/egalik, javob siyosati, limit va body.
R01–R03: server draft, vaqt/tiklash, draft validatsiya va oynalar himoyasi.
T01–T02/B01/U01: yo'qolmaydigan editor, progress, restore va sekin tarmoq.
Har muhim tuzatishga regressiya testi; yakunda unit/check, API, 320/390/1280 brauzer va 40 parallel yuborish qayta bajariladi. Natija docs/AUDIT-KEYIN.md'da.

Yakun: S01–S05, R01–R03, T01–T02, B01, U01 va keyin tasdiqlangan M01/M02 tuzatildi. 48 unit test, 9 asosiy API oqimi, 10 maxsus API/auth tekshiruv, bazaviy va audit brauzer sinovlari, 40/40 parallel submit o'tdi. Boshlang'ich va yakuniy hisobotlar alohida saqlandi.

## Tuzilmani ajratish (joriy vazifa)

Funksionallik va dizayn saqlanadi. Oldingi kengaytirish ishining yozilgan imkoniyatlari yo'qotilmaydi.

| Eski joy | Yangi fayl/papka |
| --- | --- |
| public/assets/styles.css | public/css/tokens.css, base.css, layout.css, components/*, pages/* |
| public/assets/common.js | public/js/core/*, public/js/components/* |
| public/assets/student.js | public/js/student/home.js, test.js, result.js, test-state.js, timer.js, question-map.js |
| public/assets/teacher.js | public/js/teacher/{login,dashboard,classes,tests,test-editor,results,analytics,settings}.js |
| public/index.html ichidagi uch ekran | public/index.html, test.html, natija.html |
| public/teacher.html ichidagi login va panel | public/oqituvchi/{kirish,index,sinflar,testlar,test-tahrir,natijalar,sozlamalar}.html |
| netlify/functions/api.mjs | server/router.mjs va routes/public/*, routes/admin/* |
| api.mjs biznes mantiqi | server/services/* |
| lib/store.mjs | server/repositories/* |
| lib/model.mjs | server/lib/validate.mjs, migrations/legacy.mjs |
| lib/parser.mjs, grading.mjs, security.mjs | server/lib/* va services/auth-service.mjs |
| tests/core.test.mjs | tests/{aiken-parser,scoring,auth-token,models}.test.mjs |
| namuna-test.txt | samples/namuna-test.txt (yuklash uchun public/namuna-test.txt saqlanadi) |
| README va eski verify.mjs | README, docs/ARCHITECTURE.md, scripts/* |

Tartib: (a) CSS, (b) frontend modullar, (c) HTML sahifalar, (d) server qatlamlari, (e) yo'llar/check/hujjatlar.
Har qadamda Netlify Dev va tegishli oqim tekshiriladi, so'ng alohida commit qilinadi.
Brauzer preview parseri faqat POST /api/admin/tests/preview dan foydalanadi.

Yakun: CSS, frontend modullari, HTML sahifalari va server qatlamlari ajratildi. Eski katta fayllar olib tashlandi. `api.mjs` 4 qator. `check`, `build` va 29 unit test o'tdi; Netlify Dev integratsiya, Playwright va 40 parallel submit tekshirildi. Yakuniy dalillar `docs/REFACTOR-HISOBOT.md`da.

1. Umumiy dizayn: public/ tuzilma, styles.css, mavzu, modal, toast, qulaylik.
2. O'quvchi: qadamlarga ajratilgan boshlash, bitta savol, xarita, saqlash, taymer va natija.
3. O'qituvchi: bosh sahifa, sinflar, test tahrirlagich, natijalar/tahlil va sozlamalar.
4. Backend: parser, modellarni moslashtirish, REST, serverda urinish va baholash, metadata keshi.
5. Xavfsizlik: HMAC token, parol sozlash, Blobs rate limit, validatsiya va CSP.
6. Sifat: node:test, haqiqiy Netlify Dev oqimi, 40 parallel yuborish va mobil/desktop brauzer tekshiruvi.
7. Hujjatlar: README, AGENTS, muhit namunasi, o'qituvchi qo'llanmasi va yakuniy hisobot.

Har bosqich Netlify Dev bilan tekshiriladi va alohida commit qilinadi. Backendga bog'liq UI bosqichlarida server tayyor bo'lguncha sahifa/sintaksis tekshiriladi; to'liq oqim 6-bosqichda bajariladi.

Qarorlar: bitta maktab va umumiy admin roli; o'quvchi identifikatsiyasi sinf+ro'yxat ID yoki ism/familiya bilan. Savol va variantlar serverdagi imzolangan urinish tartibi orqali aralashtiriladi. Vaqt serverda tekshiriladi. Eski yozuvlar o'qishda moslashtiriladi, avtomatik o'chirilmaydi.

Parol yangilanishi: kirish va sozlamalarda umumiy password-field komponenti; ko'rsatish/berkitish tugmalari. Server va brauzer 6–12 belgi qoidasini qo'llaydi. Parol faqat muhit/Blobs'da; repozitoriyda standart parol yoki token kaliti saqlanmaydi. Chegaralar unit/API, forma va kirish brauzer bilan tekshiriladi.

Deploy tekshiruvi: Netlify buildda unit va tuzilma tekshiruvlari, mos Node versiyasi, barcha .env nusxalarini Git'dan chiqarish. Yozadigan sinovlar alohida lokal Blobs omborida; production uchun faqat GET smoke tekshiruvi. Commit va push faqat foydalanuvchi tasdiqlagach bajariladi.
