# Refaktor hisobot — 2026-10-31

Bu oldingi refaktor bosqichining tarixiy hisoboti. Joriy xavfsizlik va ishonchlilik holati [audit hisobotida](AUDIT-KEYIN.md).

Avval yozilgan imkoniyatlar va dizayn saqlandi, eski monolit fayllar olib tashlandi. O’quvchi va o’qituvchi ekranlari alohida sahifa va ES modullarga bo’lindi. Server HTTP, xizmat va repository qatlamlariga ajratildi.

## Yangi tuzilma

```text
nazorat-test/
├─ public/
│  ├─ index.html, test.html, natija.html
│  ├─ teacher.html                 eski havola uchun yo’naltirish
│  ├─ oqituvchi/
│  │  ├─ kirish.html, index.html, sinflar.html
│  │  └─ testlar.html, test-tahrir.html, natijalar.html, sozlamalar.html
│  ├─ css/
│  │  ├─ styles.css, tokens.css, base.css, layout.css
│  │  └─ components/, pages/, motion.css, print.css
│  ├─ js/
│  │  ├─ core/, components/
│  │  └─ student/, teacher/
│  └─ namuna-test.txt
├─ server/
│  ├─ router.mjs
│  ├─ routes/public/, routes/admin/
│  └─ services/, repositories/, lib/, migrations/
├─ netlify/functions/api.mjs        4 qator
├─ samples/namuna-test.txt
├─ tests/, scripts/, docs/
└─ netlify.toml, package.json, README.md, AGENTS.md, PLAN.md
```

## Eng katta 10 fayl

Qatorlar formatlangan manba bo’yicha; node_modules, Git, lokal Blobs va sinov artefaktlari hisoblanmagan.

| Fayl | Qator |
| --- | ---: |
| scripts/browser-test.mjs | 219 |
| public/css/pages/mobile.css | 173 |
| public/js/teacher/results.js | 158 |
| public/css/pages/test-runner.css | 147 |
| public/namuna-test.txt | 139 |
| samples/namuna-test.txt | 139 |
| scripts/verify.mjs | 130 |
| public/css/pages/teacher.css | 126 |
| public/js/student/test.js | 122 |
| scripts/check-structure.mjs | 122 |

## Tekshiruv natijalari

- `npm test`: **29/29 o’tdi**, 0 xato. Parser, baholash, aralashtirish, HMAC/parol, eski modellar, repository navbati va tuzilma tekshiruvining xato holatlari.
- `npm run check`: o’tdi. Barcha manba fayllari 250 qatordan kam; HTMLda inline kod yo’q; Blobs importi faqat repository’da; public havolalari mavjud; API 20 qatordan kam.
- `npm run build`: o’tdi. Build kompilyatsiya emas, statik tuzilma tekshiruvi.
- `npm run verify`: **9 oqim tekshiruvi o’tdi**. Sinf → preview/upload → test → 20/20 → panel/tahlil; limit, qayta ruxsat, backup/restore, noto’g’ri ma’lumot va kalitni yashirish. Parallel bir xil o’quvchi boshlashlari hamda takroriy yuborish bitta urinish va bitta natija yaratdi.
- `npm run test:browser`: Chrome/Playwright, **9 responsive/a11y audit**, 390 va 1280 px, yorug’/qorong’i rejim. Fayl preview, qo’lda tanlash, klaviatura, flag, reload, offline retry, avtomatik yuborish, panel tafsiloti va tahlili ishladi; **0 JavaScript xato**.
- `npm run test:load`: **40 yuborish, 40 muvaffaqiyat, 40 saqlangan natija, 0 xato**. Lokal umumiy vaqt **3363 ms**, p50 **2458 ms**, p95 **3300 ms**. Bu production tezligi haqidagi kafolat emas.
- `git diff --check`: o’tdi. Bosqichlar alohida commitlarda saqlandi.

Sinov dalillari `artifacts/`da: `integration.json`, `load-test.json`, `browser-audit.json`, `unit-test.txt` va skrinshotlar. Bu papka Gitga kiritilmaydi.

## Muhim qarorlar

1. Tarqatiladigan yagona kod `public/`da. IDEdagi eski root HTMLlar ko’chirildi; endi `public/index.html`ni tahrirlang.
2. Header, sidebar, modal, toast, API va saqlash umumiy modullarda. Sahifalar orasida urinish `localStorage`, admin tokeni `sessionStorage` orqali saqlanadi.
3. Parser faqat serverda. Previewning asosiy yo’li `/api/admin/tests/preview`; eski `/api/admin/preview` ham ishlaydi.
4. `tests` va `results` nomlari o’zgarmadi. Migratsiya o’qishda bajariladi, eski natijaga mavjud bo’lmagan tafsilot qo’shilmaydi.
5. `samples/namuna-test.txt` asosiy fixture; public nusxasi yuklab olish uchun. Kod nusxalari yo’q.
6. Lock JSON avtomatik bir qatorda saqlanadi, `postinstall` buni takrorlaydi. Kodning o’zi minifikatsiya qilinmadi. Prettier faqat ishlab chiqish vositasi.
7. Netlify Dev emulyatoridagi parallel shartli yozish va Windows lock bandligi uchun repository darajasidagi lokal navbat qo’shildi. Production’da fayl lock ishlatilmaydi; Blobs atomik shartlari saqlanadi.

## Chegaralar va Netlify’da bajariladigan ishlar

Production deploy qilinmadi. Lighthouse alohida ishlatilmadi; Playwrightda label, tugma o’lchami, gorizontal chiqib ketish, tashqi resurslar va yuklanish vaqti tekshirildi. O’quvchi ro’yxatdan tanlashi to’liq shaxsiy autentifikatsiya emas. Ko’p yozuvli tiklash umumiy tranzaksiya emas.

Netlify’da mavjud site’ni saqlang, publish=`public`, functions=`netlify/functions`, build command bo’sh. `TEACHER_PASSWORD` va kamida 32 belgili `TOKEN_SECRET`ni Functions muhitiga kiriting. Git orqali deploy qilib, production’da sinf → test → natija oqimini bir marta tekshiring. Maxfiy `.env`, lokal `.netlify` va sinov artefaktlarini yuklamang.
