# O'quvchiga fan bo'yicha ball kartalari (2026-11-12)

Natija sahifasida umumiy natija va to'g'ri/javobsiz sonlardan keyin Har bir fan bo'yicha ballingiz bo'limi chiqadi. Har kartada bo'lim turi, fan nomi, olingan ball, saqlangan maksimal ball va to'g'ri javoblar soni ko'rsatiladi. Bir xil nomli fan mutaxassislik va majburiy bo'limlarda kelsa alohida qoladi. Oddiy testda fanlar mavjud bo'lmasa bo'sh panel chiqmaydi.

Mavjud sectionResultsMarkup o'qituvchi tafsiloti uchun saqlandi; yangi sectionScoreCards o'quvchiga kartalar chiqaradi. components/section-scores.css umumiy light/dark tokenlari bilan moslashadi. natija.html ichidagi subject-results olingan server xulosasidan to'ldiriladi; mijoz ballni qayta hisoblamaydi.

Server saqlangan result.sections ni birinchi o'rinda qaytaradi. Eski yozuvda u yo'q bo'lsa, faqat to'liq savol/javob snapshoti va scoringPolicy yoki mos eski scoringMode bilan sectionResults orqali tiklanadi. Joriy test savollari/koeffitsiyentlari eski natijani hisoblashda ishlatilmaydi. Snapshot yetishmasa yoki DTM tarkibi yaroqsiz bo'lsa taxminiy 0 ball chiqarilmaydi. Mavjud hideResults/showAnswers ruxsatlari o'zgarmadi; yashirilgan natija sections bermaydi.

Lokal dalillar:

- Node modul mocki: DTM 20/30 va 15/30, majburiy fanlarda 8/10 javob -> 62, 31.5, 8.8, 8.8, 8.8 ball; maksimum 93, 63, 11, 11, 11. Oddiy baholash, saqlangan sections, yetishmagan agregatni tiklash, javoblar yo'q bo'lsa hisoblamaslik, bir xil nomli fanlar ajralishi va yashirish tekshirildi. Public javobda savol/variant kaliti qo'shilmadi.
- Haqiqiy npm run dev localhost:8888 API: avvalgi faqat lokal QA maktabida yangi aralashtirilgan 90 savolli urinish boshlandi va yuborildi. Besh bo'lim natijasi jami 119.9/189 ball bo'ldi, review/answers/questions kalitlari yo'q.
- Chrome/Playwright shu haqiqiy urinish natijasini browserKey bilan resume orqali ochdi. Barcha beshta fan kartasi, maksimumlar, to'g'ri javoblar, light/dark va 390px ekran tekshirildi. JS xatosi va tashqi gorizontal overflow yo'q.
- Qo'shimcha lokal fixture: oddiy baholangan blok, oddiy sectionsiz test, hidden natija va HTML ko'rinishidagi fan nomini escape qilish o'tdi. Print yoki production deploy sinovi bajarilmadi.
- Skrinshotlar .local/subject-scores-light.png, .local/subject-scores-dark.png va ularning -390 variantlari. Lokal maxfiy urinish tokenlari faqat Gitga kirmaydigan .local ichida.
- npm run check, npm run build va git diff --check o'tdi. tests/ va audit skriptlari repoga qo'shilmadi. Push/deploy bajarilmadi.

Fayllar: public/natija.html, public/js/student/result.js, public/js/components/section-results.js, public/css/components/section-scores.css, public/css/styles.css, server/services/student-result-service.mjs, PLAN.md, docs/ARCHITECTURE.md va ushbu hisobot.
