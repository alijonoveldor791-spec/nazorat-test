# Natijalarni so'rov bilan yuklash (2026-11-12)

- Sahifa ochilganda sessiya va test/sinf tanlovlari olinadi. Asosiy natijalar va so'nggi testlarning qisqa xulosasi avtomatik olinmaydi.
- Test yoki sinf/guruh tanlash `/api/admin/results?testId=...&classId=...` orqali serverda filtrlangan natijalarni yuklaydi. Ikkala tanlov birga qo'llanadi. Barcha tanlovni tozalash jadvalni tozalaydi; Yangilash aniq so'rovi barcha yoki tanlangan natijalarni oladi.
- Qidirish, saralash, sahifalash va eksport yuklangan natijalarda bajariladi. Yangi tanlov eski so'rovni abort qiladi; kechikkan javob versiya bilan rad etiladi. Yuklash/xato holatida avvalgi tanlov natijasi yoki eksporti qolmaydi.
- `results-request.js` yuklash holatini, `recent-results.js` faqat qo'lda olinadigan qisqa xulosani boshqaradi. Umumiy shell'dagi 30 soniyalik barcha ma'lumotni qayta olish olib tashlandi; dashboard va sinflardagi eski yuklash saqlandi.
- Admin `/api/admin/results/recent` oxirgi topshirish vaqti bo'yicha eng yangi 10 test/guruhni qaytaradi: testId, classId, testTitle, grade, time, count. Savollar, javoblar va o'quvchi shaxsiy maydonlari yuborilmaydi. U maktabga tegishli summary repository va mavjud deadline yakunlash oqimidan foydalanadi; alohida saqlash indeksi qo'shilmagan.
- Qisqa ro'yxatdagi alohida Yangilash tugmasi faqat xulosani oladi; u asosiy natijalar jadvali yoki tanlovni almashtirmaydi. Dastlabki avtomatik so'rov, 60 soniyalik taymer va xatodan keyingi avtomatik qayta urinish olib tashlandi. Natija o'chirilganda ham qisqa ro'yxat qo'lda yangilanadi.
- Excelda oddiy va blok natijalar Familiya ism ustunida chiqadi. CSV eski ikkita ustunni saqlaydi.

Avvalgi lokal dalillar: `npm run dev -- --port 8897`, Chrome/Playwright va taqlid API bilan boshlang'ich to'liq so'rov yo'qligi, test/guruh URL filtrlari, qidirish/saralashda so'rov yo'qligi, eski davriy recent yangilanishi, XSS matnini escape qilish, recent tanlash, xato/qayta urinish, filtrlangan XLSX va birlashtirilgan ism tekshirildi. JS xatosi yo'q.

Haqiqiy lokal API: ikkita vaqtinchalik maktab admini, sinf va guruhga bittadan topshirish. Unfiltered eski ro'yxat, birgalikdagi filtr, topilmagan test, faqat tegishli maktab natijalari, recent sxemasi/count va tokensiz 401 tekshirildi. Parol sinovlari faqat lokal bajarildi.

`npm run check`, `npm run build` va `git diff --check` o'tdi. Yangi tests/ yoki audit skriptlari qo'shilmadi; lokal sinov artefaktlari Gitga kirmaydi.

Qo'lda yangilash va retry (2026-11-12): ishlayotgan `npm run dev` localhost:8888 bilan Chrome/Playwright virtual soati ostida dastlabki va 10 daqiqalik fon so'rovlari yo'qligi, qo'lda yangilash, xatoda avtomatik so'rov yo'qligi va recent orqali tanlangan natijalar tekshirildi. Draft xatosida 5/10/20/30 soniyalik asosiy kutishga 0-1 soniya tasodifiy kechikish qo'shiladi; Retry-After bundan uzun bo'lsa unga rioya qilinadi. Yangi javob yoki online hodisasi mavjud kutish muddatini chetlab o'tmaydi. Muvaffaqiyatda kutish tiklanadi; o'zgargan javobning odatiy 1,2 soniyalik saqlanishi qoladi.

Draft sinovlari: ketma-ket xatolar, yangi javob bilan cooldown saqlanishi, muvaffaqiyatdan keyin boshlang'ich intervalga qaytish, 429 Retry-After, lokal oxirgi javob saqlanishi va stop tekshirildi. Submission ortib boradigan kutishiga ham 0-1 soniya kechikish qo'shildi; yangi yuborish avvalgi retry taymerini bekor qiladi. Alohida virtual soat sinovida qo'lda qayta yuborishda eski taymer bekor qilinishi, 429 Retry-After, pending draft saqlanishi va yakuniy bitta natijaga o'tish tekshirildi. Egalik, fullscreen, oddiy yakunlash va muddat tugaganda bitta natijaga o'tish oqimi qayta o'tdi. APIlar bu brauzer sinovlarida taqlid qilindi; server protokoli o'zgarmadi.
