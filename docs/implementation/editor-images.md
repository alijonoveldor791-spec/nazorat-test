# Savol tahrirlagichi: variant va rasmlar — 2026-11-13

## Muammo va yechim

- Rich variant `contenteditable` maydoni flex qatorida bo'sh bo'lganda qisqarib qolgan. Radio va tahrirlash maydoni bitta `label` ichida bo'lgani uchun bosish fokusni radioga olib ketishi mumkin edi. Qator endi 20px / 16px / minmax(0,1fr) grid; rich/input maydoni to'liq kenglikda, radio alohida aria-label bilan.
- `editor-images.js` faqat bitta tanlangan rasm uchun boshqaruv chiqaradi: 1–1600 px kenglik, asl o'lcham, o'chirish va darhol qaytarish. Balandlik mutanosib saqlanadi, tor ekranda rasm konteynerdan chiqmaydi. Enter kenglikni qo'llaydi, testni yubormaydi.
- O'chirilgan oxirgi variantlar WeakMap ichida savolga bog'lanadi; bitta savol uchun ko'pi bilan 4 ta yozuv. Qaytarishda matn/rasm va o'chirilgan to'g'ri javob belgisi tiklanadi. Dialog yopilganda yoki import bilan savollar almashganda eski obyektlar GCga o'tadi; tarix serverga yoki storagega yozilmaydi.
- Rasm uchun bitta undo yozuvi DOM tuguni va pozitsiyasini ushlab turadi; boshqa rasm tanlanganda yoki savollar qayta chizilganda tozalanadi. Bu cheksiz undo tarixi emas.
- Rich maydon o'zgarishi XMLSerializer orqali saqlanadi: img/br XML fragment sifatida yopiladi va MathML saqlanadi. Tahrirlash ichida MathJax SVG bilan almashtirish olib tashlandi: aks holda keyingi input SVGni savol ma'lumotiga yozib, server allowlistiga mos kelmasdi. Tahrirlashda native MathML; o'quvchi, preview va natija chiqarishidagi MathJax o'zgarmagan.
- Frontend va server sanitizatori img `width` atributining faqat 1–1600 butun qiymatini saqlaydi. Inline CSS/JS yoki tashqi rasm manbasi qo'shilmagan. Word media ham xavfsiz widthni hisobga oladi va konteyner limitini saqlaydi.

## Resurslar

Yangi dependency, interval, MutationObserver, rasmni canvasda qayta kodlash yoki avtomatik API so'rovi yo'q. Input faqat tegishli maydon holatini yangilaydi; rasm resize faqat tanlangan img atributini o'zgartiradi. Barcha savollar faqat oldingi qo'shish/o'chirish amallarida qayta chiziladi. Bitta rasm boshqaruvi va chegaralangan tarix ishlatiladi.

## Lokal tekshiruv

http://localhost:8888 da Chrome/Playwright; admin API mock qilingan, saqlashda haqiqiy `questionsValid`/`richHtml` ishlatilgan. Real maktab ma'lumoti o'zgartirilmagan.

- Bo'sh D maydonini bosish, matn kiritish, caret fokusining qolishi; matn yozishda API so'rovi va umumiy redraw = 0.
- Dni o'chirish/qaytarish: matn va to'g'ri javob belgisi saqlandi.
- Savol va variant rasmida resize, aspect ratio, delete, undo, asl o'lcham; Enter saqlashni ishga tushirmadi.
- Haqiqiy server validatsiyasi orqali saqlash va qayta ochish: D matni, image width, MathML va answer saqlandi; SVG yozilmadi.
- 1280/390 px, light/dark: maydon keng, sahifa gorizontal kengaymagan; brauzer xatosi 0.
- 200 savol: dastlabki DOM render ushbu lokal kompyuterda taxminan 21 ms; yozishda umumiy redraw yo'q. 4 variantni o'chirib qaytarish, F kaliti va boshqa savolning o'zgarmasligi tekshirildi. Bu universal tezlik kafolati emas.
- Word: 400x200 rasm width=160 bo'lganda DOCX 160x80 o'lchamga chiqdi.
- Width=0/1601/manfiy/kasr/CSS/foiz tashlandi; onerror/style ham tashlandi. Width=1600 saqlandi.
- `npm run check` va `npm run build`: PASS. `git diff --check`: PASS.
- Ignored sinovlar: `.local/editor-rich-qa.mjs`, `.local/editor-image-server-qa.mjs`, `.local/editor-200-qa.mjs`; skrinshotlar `.local/editor-rich-{light,dark}-{1280,390}.png`.
- Firefox/Safari, production hisobida saqlash va Word dasturida vizual ochish tekshirilmagan; Word o'lchami XML orqali tekshirildi.
