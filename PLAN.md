# Ish rejasi

Mahalliy parol tanlovi: foydalanuvchi so’roviga ko’ra lokal minimum 5 qilib sozlandi. Standart minimum 12 saqlandi; server va panel muhitdagi bir xil siyosatdan foydalanadi. Haqiqiy parol .env va Blobs’da, Gitga kiritilmaydi.

## Audit va tuzatish

Boshlang’ich audit kod o’zgarmasdan chatda va docs/AUDIT-OLDIN.md’da berildi (baza 8afe461).
S01–S05: admin sessiyalar, o’quvchi kodlari/egalik, javob siyosati, limit va body.
R01–R03: server draft, vaqt/tiklash, draft validatsiya va oynalar himoyasi.
T01–T02/B01/U01: yo’qolmaydigan editor, progress, restore va sekin tarmoq.
Har muhim tuzatishga regressiya testi; yakunda unit/check, API, 320/390/1280 brauzer va 40 parallel yuborish qayta bajariladi. Natija docs/AUDIT-KEYIN.md’da.

Yakun: S01–S05, R01–R03, T01–T02, B01, U01 va keyin tasdiqlangan M01/M02 tuzatildi. 48 unit test, 9 asosiy API oqimi, 10 maxsus API/auth tekshiruv, bazaviy va audit brauzer sinovlari, 40/40 parallel submit o’tdi. Boshlang’ich va yakuniy hisobotlar alohida saqlandi.

## Tuzilmani ajratish (joriy vazifa)

Funksionallik va dizayn saqlanadi. Oldingi kengaytirish ishining yozilgan imkoniyatlari yo’qotilmaydi.

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

Tartib: (a) CSS, (b) frontend modullar, (c) HTML sahifalar, (d) server qatlamlari, (e) yo’llar/check/hujjatlar.
Har qadamda Netlify Dev va tegishli oqim tekshiriladi, so’ng alohida commit qilinadi.
Brauzer preview parseri faqat POST /api/admin/tests/preview dan foydalanadi.

Yakun: CSS, frontend modullari, HTML sahifalari va server qatlamlari ajratildi. Eski katta fayllar olib tashlandi. `api.mjs` 4 qator. `check`, `build` va 29 unit test o’tdi; Netlify Dev integratsiya, Playwright va 40 parallel submit tekshirildi. Yakuniy dalillar `docs/REFACTOR-HISOBOT.md`da.

1. Umumiy dizayn: public/ tuzilma, styles.css, mavzu, modal, toast, qulaylik.
2. O’quvchi: qadamlarga ajratilgan boshlash, bitta savol, xarita, saqlash, taymer va natija.
3. O’qituvchi: bosh sahifa, sinflar, test tahrirlagich, natijalar/tahlil va sozlamalar.
4. Backend: parser, modellarni moslashtirish, REST, serverda urinish va baholash, metadata keshi.
5. Xavfsizlik: HMAC token, parol sozlash, Blobs rate limit, validatsiya va CSP.
6. Sifat: node:test, haqiqiy Netlify Dev oqimi, 40 parallel yuborish va mobil/desktop brauzer tekshiruvi.
7. Hujjatlar: README, AGENTS, muhit namunasi, o’qituvchi qo’llanmasi va yakuniy hisobot.

Har bosqich Netlify Dev bilan tekshiriladi va alohida commit qilinadi. Backendga bog’liq UI bosqichlarida server tayyor bo’lguncha sahifa/sintaksis tekshiriladi; to’liq oqim 6-bosqichda bajariladi.

Qarorlar: bitta maktab va umumiy admin roli; o’quvchi identifikatsiyasi sinf+ro’yxat ID yoki ism/familiya bilan. Savol va variantlar serverdagi imzolangan urinish tartibi orqali aralashtiriladi. Vaqt serverda tekshiriladi. Eski yozuvlar o’qishda moslashtiriladi, avtomatik o’chirilmaydi.
