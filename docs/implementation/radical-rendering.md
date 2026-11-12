# Ildiz formulalarini to'liq chizish — 2026-11-12

## Sabab

- `math-renderer.js` oldingi `tex-mml-svg-nofont.js` komponentini yuklagan, lekin SVG belgilarining mahalliy manzilini bermagan.
- MathJax 4.1.3 `@mathjax/mathjax-newcm-font/svg.js` ni jsDelivr orqali so'ragan. Amaldagi `script-src 'self'` buni bloklagan.
- Scriptning `load` hodisasi MathJax startup tugaganini anglatmaydi. Oldingi chaqiruvda `typesetPromise is not a function` takrorlandi; 3 MathML formula uchun SVG soni 0 edi.
- Startup tuzatilgandan keyin tayyor to'plamning dinamik style/a11y qismlari ham CSP xatolarini berdi. Siyosatni bo'shashtirish o'rniga faqat zarur komponentlar va tashqi mahalliy stylesheet ishlatildi.

## Yechim

- Mavjud MathJax 4.1.3 dependency ichidagi `startup.js`, `core.js`, `input/mml.js`, `input/mml/`, `output/svg.js` mahalliy `public/vendor/mathjax/` ga ko'chirildi.
- Mavjud transitive `@mathjax/mathjax-newcm-font` 4.1.3 paketining `svg.js` va `svg/dynamic/*.js` belgi koordinatalari `fonts/mathjax-newcm-font/` ichida. Ular kerak bo'lganda mahalliy yuklanadi; tashqi shrift yoki CDN qo'shilmagan.
- SVG outputning standart `styleSheet` natijasi `svg.css` sifatida saqlandi. Uning bo'sh o'lchov belgisi `MJX-ZERO` data-URL o'rniga mahalliy `zero.woff` ga chiqarildi. Apache-2.0 litsenziyasi vendor ichida saqlangan.
- Renderer faqat MathML input va SVG output yuklaydi. Oldin ham kirish tekshiruvi `<math>` talab qilgan; oddiy matn/TeXni avtomatik talqin qilish qo'shilmagan.
- Startup promise va stylesheet yuklanishi kutiladi. Chizishlar ketma-ket bajariladi, o'chirilgan formulalar registrdan tozalanadi, bitta stylesheet qayta ishlatiladi.
- Parser, sanitizatsiya, baholash, saqlangan savollar va xavfsizlik headerlari o'zgarmadi. Root ustki chizig'i radikand kengligi bo'yicha SVG rect bilan chiziladi.

## Lokal tekshiruv

Ishlayotgan `npm run dev` serveri: http://localhost:8888.

- `npm run check`: PASS.
- `npm run build`: PASS.
- Chrome, 1100 va 390 px, light/dark: 4 ko'rinish PASS. Haqiqiy `question-map.js`/`content-renderer.js` orqali sinov savollari chizildi.
- Oddiy kvadrat ildiz, ichma-ich kasrli ildiz, kub ildiz: ustki chiziqlar SVG chegarasida, balandligi 1 px dan katta, mavzuga mos rangda.
- Har ko'rinishda 12 marta savol/javob qayta chizildi. Oxirida 2 SVG va 2 MathItem qoldi; takror yoki eskirgan element yo'q.
- 390 px ekranda 40 hadli uzun ildiz: 1969 px kontent faqat 300 px formula konteynerida aylanadi, sahifa kengaymaydi. Oxirigacha aylantirganda ildiz chizig'ining oxiri ko'rinadi.
- Dinamik maxsus belgilar ham mahalliy yuklandi. Tashqi tarmoq so'rovi, CSP yoki JS xatosi yo'q; bitta stylesheet ishlatilgan.
- OMML ichma-ich ildizni `toMathml` orqali o'tkazishda ikki `msqrt` va barcha hadlar saqlandi.
- Hisobot va skrinshotlar ignored `.local/radical-qa.json`, `.local/radical-{light,dark}-{1100,390}.png`; sinov skriptlari `.local/` ichida, Gitga kiritilmaydi.
- Chrome tekshirildi; Firefox/Safari va foydalanuvchining muammoli asl Word fayli tekshirilmadi. Oddiy matnda `√` belgisi bilan yozilgan formula uchun radikand chegarasini avtomatik taxmin qilmaydi.

## Yangilash

MathJax versiyasi yangilanganda yuqoridagi komponentlar va ayni versiyadagi SVG belgilari birga almashtiriladi. `svg.css` tegishli versiya `startup.output` prototipidagi `styleSheet(startup.document).textContent` natijasidan olinadi, data font mahalliy faylga ajratiladi. CSP o'zgartirilmaydi. Mobil, takroriy chizish va tashqi so'rov tekshiruvi qayta bajariladi.

Manbalar: [MathJax local font hosting](https://docs.mathjax.org/en/stable/output/fonts.html), [komponentlarni lokal joylashtirish](https://docs.mathjax.org/en/latest/web/hosting.html).
