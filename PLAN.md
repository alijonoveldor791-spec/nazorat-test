# Ish rejasi

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

1. Umumiy dizayn: public/ tuzilma, styles.css, mavzu, modal, toast, qulaylik.
2. O’quvchi: qadamlarga ajratilgan boshlash, bitta savol, xarita, saqlash, taymer va natija.
3. O’qituvchi: bosh sahifa, sinflar, test tahrirlagich, natijalar/tahlil va sozlamalar.
4. Backend: parser, modellarni moslashtirish, REST, serverda urinish va baholash, metadata keshi.
5. Xavfsizlik: HMAC token, parol sozlash, Blobs rate limit, validatsiya va CSP.
6. Sifat: node:test, haqiqiy Netlify Dev oqimi, 40 parallel yuborish va mobil/desktop brauzer tekshiruvi.
7. Hujjatlar: README, AGENTS, muhit namunasi, o’qituvchi qo’llanmasi va yakuniy hisobot.

Har bosqich Netlify Dev bilan tekshiriladi va alohida commit qilinadi. Backendga bog’liq UI bosqichlarida server tayyor bo’lguncha sahifa/sintaksis tekshiriladi; to’liq oqim 6-bosqichda bajariladi.

Qarorlar: bitta maktab va umumiy admin roli; o’quvchi identifikatsiyasi sinf+ro’yxat ID yoki ism/familiya bilan. Savol va variantlar serverdagi imzolangan urinish tartibi orqali aralashtiriladi. Vaqt serverda tekshiriladi. Eski yozuvlar o’qishda moslashtiriladi, avtomatik o’chirilmaydi.
