# 500 faol o'quvchi: ish rejasi

Tarmoq: `perf/500-active-students`. Boshlang'ich commit: `654ee63`.

- [x] AGENTS va server/draft/rate-limit/Blobs qatlamlari o'qildi.
- [x] Ishlab turgan saytga so'rov yuborishni taqiqlovchi target guard qo'shildi.
- [x] Alohida lokal baseline va tuzatilgan Netlify Dev nusxalari tayyorlandi.
- [x] k6 v2.3.0 portativ tarqatmasi rasmiy dl.k6.io manbasidan olindi.
- [x] 50/200/500 mustaqil VU, oddiy va boy 90 savolli blok ssenariylari yozildi.
- [x] Boshlang'ich diagnostika va k6 baseline o'tkazildi; SLO o'tmadi.
- [x] NAT hisoblagichi, ortiqcha scan, pending indeks va natija hajmi bo'yicha tuzatishlar kiritildi.
- [ ] Yangi koddagi protokol/egalik/muddat/tiklash tekshiruvlari.
- [ ] Bir xil boshlang'ich dataset va k6 parametrlari bilan paired baseline/retest.
- [ ] 500 faol sessiyani 1200 soniya ushlab turish: faqat haqiqiy peak/plato va natija dalili bilan.
- [ ] Alohida staging'da real Functions/Blobs qabul sinovi.
- [ ] Ko'p maktabli 500 sessiya sinovi va saqlangan javoblarning to'liq verifikatsiyasi.
- [ ] Yakuniy check/build va dalillar hisoboti.

## Tashqi to'siq

`netlify status --json`: NOT_LOGGED_IN, linked=false. Staging URL, region va ajratilgan sinov hisobi yo'q. Foydalanuvchidan mavjud staging manzili/hisobi so'raldi. Deployga ruxsat berilmagan; masofaviy muhit yaratilmaydi va production yuklanmaydi. Lokal emulyator real platforma sig'imini tasdiqlamaydi.

## Sinov kodi uchun ruxsat

Foydalanuvchi ushbu topshiriqda k6/Artillery bilan takrorlanadigan sinovni aniq talab qildi. `scripts/load/` shu ruxsatga asoslanadi. Eski `tests/` va test/audit skriptlari qayta yaratilmaydi; barcha tokenlar, fixturelar va xom k6 artefaktlari `.local/load/`da qoladi.

## Qabul qarori

500 sessiya, kamida 1200 soniya to'liq plato, draft p95 <2s, start/submit p95 <3s, 5xx/timeout <1%, qonuniy NAT foydalanuvchilari rad etilmasligi va 500 yagona/to'g'ri natija birgalikda o'tmasa, sig'im tasdiqlanmaydi. Burst start/finish yoyilishi va p95 alohida ko'rsatiladi. Nol namunali endpoint p95 qiymati 0 deb talqin qilinmaydi.
