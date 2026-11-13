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
