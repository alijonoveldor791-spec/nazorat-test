# Natijalarni so'rov bilan yuklash (2026-11-12)

- Sahifa ochilganda sessiya, test/sinf tanlovlari va so'nggi testlarning qisqa xulosasi olinadi. Asosiy natijalar avtomatik olinmaydi.
- Test yoki sinf/guruh tanlash `/api/admin/results?testId=...&classId=...` orqali serverda filtrlangan natijalarni yuklaydi. Ikkala tanlov birga qo'llanadi. Barcha tanlovni tozalash jadvalni tozalaydi; Yangilash aniq so'rovi barcha yoki tanlangan natijalarni oladi.
- Qidirish, saralash, sahifalash va eksport yuklangan natijalarda bajariladi. Yangi tanlov eski so'rovni abort qiladi; kechikkan javob versiya bilan rad etiladi. Yuklash/xato holatida avvalgi tanlov natijasi yoki eksporti qolmaydi.
- `results-request.js` yuklash holatini, `recent-results.js` davriy qisqa xulosani boshqaradi. Umumiy shell'dagi 30 soniyalik barcha ma'lumotni qayta olish olib tashlandi; dashboard va sinflardagi eski yuklash saqlandi.
- Admin `/api/admin/results/recent` oxirgi topshirish vaqti bo'yicha eng yangi 10 test/guruhni qaytaradi: testId, classId, testTitle, grade, time, count. Savollar, javoblar va o'quvchi shaxsiy maydonlari yuborilmaydi. U maktabga tegishli summary repository va mavjud deadline yakunlash oqimidan foydalanadi; alohida saqlash indeksi qo'shilmagan.
- Faqat shu qisqa ro'yxat 60 soniyada yangilanadi. Yashirilgan sahifa yoki ochiq dialogda so'rov o'tkazib yuboriladi; pagehide taymerni bekor qiladi. Avtomatik yangilanish asosiy jadval va tanlovni almashtirmaydi.
- Excelda oddiy va blok natijalar Familiya ism ustunida chiqadi. CSV eski ikkita ustunni saqlaydi.

Lokal dalillar: `npm run dev -- --port 8897`, Chrome/Playwright va taqlid API bilan boshlang'ich to'liq so'rov yo'qligi, test/guruh URL filtrlari, qidirish/saralashda so'rov yo'qligi, soatni surib 60 soniyalik recent-only yangilanish va yashirin sahifada to'xtash, XSS matnini escape qilish, recent tanlash, xato/qayta urinish, filtrlangan XLSX va birlashtirilgan ism tekshirildi. JS xatosi yo'q.

Haqiqiy lokal API: ikkita vaqtinchalik maktab admini, sinf va guruhga bittadan topshirish. Unfiltered eski ro'yxat, birgalikdagi filtr, topilmagan test, faqat tegishli maktab natijalari, recent sxemasi/count va tokensiz 401 tekshirildi. Parol sinovlari faqat lokal bajarildi.

`npm run check`, `npm run build` va `git diff --check` o'tdi. Yangi tests/ yoki audit skriptlari qo'shilmadi; lokal sinov artefaktlari Gitga kirmaydi.
