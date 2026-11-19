# Natijalar bo'yicha filtrlangan statistika

2026-11-13.

- `server/lib/result-summary.mjs` barcha filtrlangan natijalardan test/sinf/topshirish soni, takrorlanmas qatnashchilar, o'rtacha foiz va so'nggi testlarni hisoblaydi.
- `result-query-service.mjs` mavjud paged APIga qo'shimcha `summary` beradi. Test, sinf/guruh va ism qidiruvi statistikaga ham bir xil qo'llanadi. Eski items/total/page/pages va sahifalanmagan endpoint o'zgarmagan; DB migratsiyasi kerak emas.
- Qatnashchilar sinf + studentId bo'yicha; studentId bo'lmagan eski/kodli kirishda sinf + me'yorlangan ism/familiya bo'yicha ajratiladi. Bir xil ismli IDsiz odamlarni mavjud ma'lumotdan ishonchli ajratib bo'lmaydi. Qayta topshirishlar topshirish sonida qoladi.
- O'rtacha natija jadval foizi kabi score/total asosida, barcha mos topshirishlarning arifmetik o'rtachasi. Yaroqli natija bo'lmasa chiziq ko'rsatiladi, nollar uydirilmaydi.
- `results-request.js` bitta javobdagi jadval va statistikani birga yangilaydi. Yangi so'rovda eski statistika yashiriladi; eskirgan javoblar avvalgi version/AbortController bilan rad etiladi.
- `results-view.js` tanlov nomi, testlar/sinflar, qatnashchilar/topshirishlar va o'rtacha foizni ko'rsatadi. `recent-results.js` ro'yxat va modalni shu natijalarga bog'laydi. `results.js` so'nggi test tanlanganda sinf filtrini saqlaydi, sidebar yangilash jadvalni ham yangilaydi.

## Tekshiruv

- Haqiqiy queryResultRows bilan 25 yozuv: sahifalashdan mustaqil sonlar, qayta topshirishlar, birgalikdagi test/sinf filtri, bo'sh natija va ism qidiruvi o'tdi.
- npm run dev orqali lokal Chrome, admin API mock: umumiy va filtrlangan kartalar, 2-sahifada o'zgarmagan statistika, tanlangan sinfni so'nggi test bosilganda saqlash, bo'sh natija, guruh/test kombinatsiyasi va 390px ekran tekshirildi; JS xatosi yo'q.
- Bir martalik tekshiruv stdin orqali bajarildi; tests/ yoki audit skripti yaratilmagan.

## Natijani ro'yxatdan o'chirish

2026-11-13: Natijalar jadvalida har bir yozuv yonida O'chirish amali. Mavjud admin DELETE endpointi ishlatiladi; tasdiqlashda ism va test nomi escape qilinadi. Bekor qilish hech narsani o'chirmaydi. Muvaffaqiyatdan keyin jadval, statistika va so'nggi testlar yangilanadi; eksportda amallar yo'q.

Natija repositorysi savol/javob/shaxsiy ma'lumotlarni olib tashlab, faqat id, maktab doirasi va o'chirish vaqtli tombstone qoldiradi. Bu parallel retry natijani qayta yaratishining oldini oladi. Urinishga resultDeleted belgisi yoziladi; resume/submit yakunlash orqali o'chirilgan natijani tiklamaydi. Eski urinishsiz natijalarni ham o'chirish mumkin. O'chirish urinish limitini qaytarmaydi. DB ommaviy migratsiyasi talab qilinmaydi; eski yozuvlar o'z holicha o'qiladi.

O'chirish tekshiruvi: lokal Chrome/API mock bilan tugma, escape qilingan ism, bekor qilishda DELETE yo'qligi, tasdiqlangan DELETE, statistika/sidebar yangilanishi, filtr saqlanishi va chop etishda amallar yo'qligi o'tdi; JS xatosi yo'q. Haqiqiy lokal admin DELETE tokensiz 401 qaytardi. Service/repository modullari xotira Blobs adapterida maktab egaligi, natija/summary yo'qolishi, resume/submit rad etilishi, eski natijani o'chirish va parallel recreate bloklanishini tasdiqladi. npm run check, npm run build va git diff --check o'tdi. Haqiqiy o'quvchi yozuvlari o'chirilmadi.
