# Qoidabuzarlik nazorati

2026-11-13: foydalanuvchi tasdiqlagan reja asosida.

- `migrations/exam-violations.mjs`: idempotent read-time Blobs migratsiyasi. Eski test settings.violationLimit=2; urinish/natija violationCount=0, violationLog=[], terminatedViolation=false. Eski yozuvlar ommaviy qayta yozilmaydi; keyingi atomik yozishda maydonlar saqlanadi.
- `violation-service`: token, brauzer/maktab egaligi, server muddati, allowlist, draft versiyasi, hodisa IDsi va fokus hodisalarining 1500ms birlashtirilishi. Hisob va log bitta CAS yozuvida. Chegara settings snapshotidan olinadi.
- Chegarada finished va terminationTime atomik saqlanadi. completeAttempt birinchi completionSnapshotni rezerv qilib mavjud grade orqali hisoblaydi. Parallel submit/draft boshqa snapshotni almashtirmaydi. Resume/submit yarim qolgan yakunni tiklaydi; natija bitta ID bilan yaratiladi.
- Pending indeks natija saqlangach resultStored bilan tozalanadi. Admin natija so'rovi muddati yetgan yarim qolgan yakunni ham tiklaydi.
- violation-sync lokal navbat va retry; exam-guard faqat testga kirilgandan keyin hodisa yuboradi. Dastlabki fullscreen va guard.stop qoidabuzarlik emas.
- Mavjud hideResults/showAnswers va savol/variant shuffle siyosatlari saqlanadi. Yashirilgan natija faqat yakunlanish xabarini beradi; maxfiy javoblar qo'shilmaydi.
- Admin jadvalida son/belgi, tafsilotda log. Backup allowlist metama'lumotlarni tekshiradi. Watermark ism va mavjud studentId yoki attemptId bilan.
- OS screenshotlari to'liq aniqlanmaydi; clipboard tozalash brauzer ruxsatiga bog'liq. Offline hodisa serverga yetguncha server uni hisoblay olmaydi.

## Qo'lda tekshirish

1. Qoidabuzarliksiz testni tugatish: avvalgi ball va javoblar.
2. Bir marta tabdan chiqish: bitta ogohlantirish; blur+visibility birga ikki sanalmasin.
3. Ikkinchi alohida hodisa: avtomatik yakun, so'nggi yetgan javoblar baholansin.
4. hideResults=false: natija va qoidabuzarlik sababi ko'rinsin.
5. hideResults=true: ball/kalitsiz Test yakunlandi va sabab.
6. Tugagan urinishga resume/submit: faqat o'sha natija; draft rad etilsin.
7. Birinchi hodisadan keyin refresh: server hisobi saqlansin.
8. Bir hodisa IDsi retry, parallel yakun/draft, noto'g'ri token/brauzer/maktab, muddatdan keyingi javob va backup restore.
9. Haqiqiy qurilmada PrintScreen, Ctrl+P/S/U, F12, Ctrl+Shift+I/J, fullscreen chiqishi; clipboard ruxsati rad etilsa test ishlasin.

## Bajarilgan tekshiruvlar

- npm run check va npm run build o'tdi; lokal npm run dev test.html va /api/tests 200 qaytardi.
- Haqiqiy service/repository modullari ajratilgan xotira Blobs adapterida: oddiy/noto'g'ri submit, 1/2 hodisa, ID dedupe, fokus birlashtirish, parallel retry, resume sanog'i, ikki natija ruxsati, draft bloklash, begona brauzer/maktab, muddat, uzilgan yakun, backup metama'lumoti va migratsiya o'tdi. Production yoki lokal saqlangan ma'lumotlarga yozilmadi.
- Lokal Chrome headless, API javoblari mock: dastlabki kirishda hisob yo'q, javob tanlash, copy/cut/context/select/drag cheklovi, watermark, blur ogohlantirishi, refresh, PrintScreen keyup, avtomatik natijaga o'tish va ikki natija ko'rinishi o'tdi. JS xatosi yo'q.
- Haqiqiy OS PrintScreen, telefon ilova almashtirish va production Netlify concurrency sinovi bajarilmadi. Qo'lda qurilma tekshiruvi yuqorida.
- Bir martalik tekshiruvlar stdin orqali bajarildi; test/audit fayllari repoga qo'shilmadi.
