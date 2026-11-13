# Testni bir bosishda himoyalangan muhitda boshlash — 2026-11-13

## Sabab va o'zgarish

Oldingi boshlash oqimi `/test.html` ga to'liq navigatsiya qilgan. Yangi hujjatda tugma bosishining vaqtinchalik fullscreen ruxsati saqlanmaydi; `examGuard()` doim qaytish oynasidan boshlagan.

`exam-entry.js` boshlash yoki davom etish tugmasining bosish hodisasida fullscreen so'raydi, mavjud `/test.html` markupini mahalliy yuklaydi. Ruxsat va markup tayyor bo'lgach serverdan urinish olinadi/tekshiriladi. Mahalliy holat saqlangach shu hujjatning body qismi test markupiga almashtiriladi, URL `replaceState` bilan `/test.html` bo'ladi va mavjud `student/test.js` moduli ishga tushadi. Inline script, yangi frontend yoki server endpoint qo'shilmagan.

`test.js` avvalgidek egalikni oladi, server urinishini tiklaydi, draft/taymer/submissionni ulaydi. Faqat shu hujjat ichidagi boshlash belgisi bilan guard avtomatik kiradi. Belgini localStorage/URLga yozmaydi. To'g'ridan-to'g'ri `/test.html` ochish yoki reload qilishda oldingi fullscreen kirish oynasi saqlanadi.

Agar boshlash davomida fullscreen tark etilsa, avtomatik ochish himoyani chetlab o'tmaydi: qaytish oynasi chiqadi. Fullscreen qo'llanmaydigan brauzerda mavjud fokus/nusxalash himoyasi bilan boshlaydi. Fullscreen ruxsati rad etilsa serverga start yuborilmaydi; xato yoki bekor qilishda yangi fullscreen yopiladi.

Yangi va legacy boshlash bitta `beginEntry` oqimidan foydalanadi. Wizard va resume callbacklari almashtirilgan DOMga qayta murojaat qilmaydi. Oldingi draft versiyasi, browserKey, urinish egaligi, deadline va natija idempotentligi saqlanadi; server kodi o'zgarmagan.

## Tekshiruv

`npm run dev` avvaldan ishlayotgan http://localhost:8888 serverida Chrome/Playwright bilan, API javoblari mock qilinib tekshirildi. Fullscreen haqiqiy browser API orqali ishga tushdi.

- Yangi wizard: bir bosishda test va fullscreen ochildi, guard yashirin, main inert emas; hujjat almashmagan.
- Start javobi 5,5 soniya kechiksa ham fullscreen saqlandi va ortiqcha kirish tugmasi chiqmadi.
- Fullscreen qo'llanmaydigan brauzer: fokus himoyasi bilan darhol savollar ochildi.
- Ruxsat rad etilishi: o'zbekcha xato, 0 start so'rovi, kirish shakli ochiq.
- Start server xatosi: shakl saqlandi, fullscreen yopildi, qayta urinish mumkin.
- Davom etish: yangi server draftVersion=2 va javob tiklandi, fullscreen saqlandi.
- Boshqa oynadagi Web Lock: start yuborilmadi, eski urinish saqlandi.
- Legacy boshlash: bir bosishda fullscreen test ochildi.
- Javob qurilmaga yozildi; copy bloklandi; blur/fullscreen exit savollarni berkitdi; qaytish tugmasi qayta ochdi; online hodisasi eski entry DOMida xato bermadi.
- Yakunlash: 1 submission, natijaga o'tish va fullscreen/himoya tozalandi.
- Oldingi guard regressiyasi: copy/cut/context/select/drag, hotkey/simulated screenshot, print, klaviatura javobi, egalik, offline draft, fullscreen exit/blur, unsupported va muddat tugashi PASS. OS screenshotini to'liq bloklash kafolati qo'shilmagan.
- Browser pageerror: 0. `npm run check` va `npm run build`: PASS.
- Sinov skriptlari faqat ignored `.local/exam-start-qa.mjs`, `exam-start-errors-qa.mjs`, `exam-resume-qa.mjs`, `exam-legacy-start-qa.mjs`, `exam-content-guard.mjs` ichida. Real maktab urinishlari yaratilmagan; Firefox/Safari tekshirilmagan.
