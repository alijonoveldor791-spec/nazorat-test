# Natijalar sahifasining yangi ko'rinishi (2026-11-12)

## Ko'rinish va oqim

Mavjud HTML/CSS/ES modules, sidebar, heading, rowsTable, modal, resultScore, dateTime, CSV va XLSX modullari saqlandi. To'q ko'k/binafsha uslub faqat natijalar sahifasida qo'llanadi. Biriktirilgan rasm sessiyada mavjud bo'lmagani sabab yozma talablar asos qilib olindi.

- Uchta karta: maktabdagi joriy testlar, barcha topshirishlar va sinf/guruhlar soni. Qotirilgan sinov qiymatlari frontendga qo'shilmagan.
- Asosiy jadval chapda, oxirgi topshirish bo'yicha eng yangi 5 ta noyob test o'ngda; bir testning barcha sinf/guruhlaridagi topshirishlar jamlanadi.
- Barcha natijali testlar modalda qidiriladi, shu jumladan o'chirilgan testning tarixiy natijalari. Test bosilganda test filtri o'rnatilib, sinf filtri tozalanadi va 1-sahifa ochiladi; o'quvchi qidiruvi saqlanadi.
- Boshlanishida faqat birinchi 20 ta yozuv va maktab xulosasi olinadi. Davriy so'rov yo'q. Yangilash aniq amali joriy sahifa/xulosani yangilaydi.
- Tor ekranda filtrlar bo'linadi, yon panel pastga tushadi; jadval faqat o'z konteynerida aylanadi. Pastki mavjud mobil navigatsiya saqlandi.

## API va modullar

`GET /api/admin/results?page=1&pageSize=20&search=...&testId=...&classId=...&sort=time` qaytaradi: items, total, page, pageSize, pages. Saralash time/name/score (mavjud foiz mezoni). Qidiruv barcha mos yozuvlarda familiya/ism bo'yicha bajariladi; teng qiymatlar ID bilan barqaror tartiblanadi. pageSize 1-200; noto'g'ri parametr 400, ortiqcha sahifa oxirgi mavjud sahifaga cheklanadi. Javoblar va savollar yangi jadval javobiga kirmaydi. pagesiz eski API va recent endpointi moslik uchun saqlandi.

`GET /api/admin/results/overview`: counts, recent (5), catalogue (faqat natijali testlar metama'lumoti). Barcha amallar mavjud school_admin autentifikatsiyasi va maktabga tegishlilik tekshiruvi orqali o'tadi.

`result-query-service.mjs` qidirish/sahifalash/xulosani, `results-request.js` so'rov holati va eski javobni bekor qilishni, `results-view.js` markupni, `recent-results.js` yon panel/modalni, `results-export.js` mavjud eksport formatlarini boshqaradi. results.js faqat hodisalarni bog'laydi. results.css va results-controls.css asosiy uslub va responsive/navigatsiya vazifalariga ajratilgan.

CSV/Excel/chop etish joriy qidiruv, test, guruh va saralashga mos barcha yozuvlarni 200 tadan ketma-ket oladi. Excelda Familiya ism bitta katakda; blok test varaqlari va mavjud hisoblash qoidalari saqlangan. Print alohida vaqtinchalik DOM bilan barcha mos yozuvlarni chiqaradi, afterprintda tozalanadi. Eksportlar bir paytda takroran boshlanmaydi.

Saqlash cheklovi: Blobs repository server ichida summary yozuvlarini hali skan qiladi; yangi DB indeksi yoki yuklama sig'imi da'vosi yo'q. Brauzer jadvaliga minglab topshirishlar bir javobda yuborilmaydi. Aniq eksport foydalanuvchi so'rovi bo'lganda yakuniy fayl uchun mos yozuvlar paketlab yig'iladi; eksport davomida natijalar o'zgarsa tranzaksion snapshot kafolati yo'q.

## Lokal tekshiruv

- Mavjud npm run dev localhost:8888 qayta ishga tushirilmasdan ishlatildi. Preview: http://localhost:8888/oqituvchi/natijalar.html.
- Chrome/Playwright: 128 test, 8 sinf/guruh va 4 860 topshirishli lokal fixture. API taqlidi haqiqiy queryResultRows server funksiyasini ishlatdi; fixturelar faqat Gitga kirmaydigan .local ichida.
- 20 ta yozuv, 243 sahifa, 1-20 va 21-40 oraliqlari, so'nggi sahifa, birinchi sahifada bo'lmagan o'quvchini qidirish, test+guruh filtrlari, filtrda 1-sahifaga qaytish va foiz bo'yicha saralash o'tdi.
- Eng yangi 5 ta test, 128 ta testli modal qidiruvi, Ko'rish tafsiloti, oddiy/DTM ballari, 4861 qatorli CSV, XLSXda birinchi/oxirgi o'quvchi, barcha 4860 qatorli print DOM tekshirildi. Eksportning har javobi <=200 yozuv.
- Loading, bo'sh qidiruv, 503 xato/qayta urinish va 390 px ekran tekshirildi. Butun sahifada gorizontal overflow yo'q; yon panel jadval ostida. 1600 px va 390 px skrinshotlar .local ichida.
- Haqiqiy lokal API: ikki vaqtinchalik maktab, 2 topshirish bilan eski/paged API mosligi, search/test/class filtri, haqiqiy counts, testning noyob jamlanishi, maktablararo ajratish, savol/javob yo'qligi, 200 yozuv chegarasi va tokensiz 401 o'tdi.
- Bu 4860 yozuvli real Netlify Blobs yuklama sinovi emas; UI va query mantiqi fixture bilan tekshirildi. Print dialogi testda taqlid qilindi, tayyor print DOM tekshirildi.
- npm run check, npm run build va git diff --check bajarildi. GitHub push va Netlify deploy bajarilmadi.

## O'zgargan fayllar

- public/oqituvchi/natijalar.html
- public/css/pages/results.css
- public/css/pages/results-controls.css
- public/js/teacher/results.js
- public/js/teacher/results-view.js
- public/js/teacher/results-request.js
- public/js/teacher/results-export.js
- public/js/teacher/recent-results.js
- public/js/components/table.js
- server/routes/admin/results.mjs
- server/services/result-query-service.mjs
- PLAN.md
- docs/ARCHITECTURE.md
- docs/implementation/results-redesign.md
