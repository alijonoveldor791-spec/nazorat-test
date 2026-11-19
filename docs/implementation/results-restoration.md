# Natijalar sahifasini tiklash va holat filtrlari

Sana: 2026-11-18.

Eski ishlagan `39c4fee` versiyasidagi natijalar sahifasi bilan solishtirildi.
Yangi ko'rinishdagi amallar saqlandi; API formatlari va ma'lumotlar ombori nomlari
o'zgarmadi. Mavjud natijalarni o'chirish yoki migratsiya qilish bajarilmadi.

## Tuzatilgan muammolar

- API katalogidagi `testId/testTitle` maydonlari UI'dagi `id/title` bilan moslashtirildi.
- Natijasiz testlar va tarixiy natijali testlar bitta test tanlovida birlashtirildi.
- So'nggi test tugmalari haqiqiy test ID bilan ishlaydi.
- Jadval, statistika, so'nggi testlar va katalog bitta server filtriga amal qiladi.
- Qidiruv ism/familiya, sinf/guruh va test nomidan so'zlar bo'yicha ishlaydi.
  Apostrof va ortiqcha bo'shliqlar normallashtiriladi; so'zlar tartibi erkin.
- Eski so'rov AbortController va versiya bilan bekor qilinadi. Qidiruv 250ms
  kechiktiriladi; kechikkan javob yangi jadvalni bosib ketmaydi.
- Filtr almashtirilsa sahifa 1 ga qaytadi; sahifa raqamlari va qator raqami saqlandi.
- Familiya, vaqt va foiz bo'yicha ikki yo'nalishli saralash qo'shildi.
- Filtrlarni tozalash, yangilash, qidiriladigan test katalogi va statistika qaytdi.
- Chop etish faqat ko'rinayotgan sahifani emas, barcha filtrlangan sahifalarni oladi.
- Savollar tahlili tanlangan test, sinf, qidiruv va topshirish holatini hisobga oladi.

## Holatlar

- Topshirganlar: barcha saqlangan topshirishlar, shu jumladan qoidabuzarlik bilan.
- Qoidabuzarliksiz topshirganlar: qoidabuzarlik qayd etilmagan natijalar.
- Qoidabuzarlik qayd etilgan: sanog'i bor yoki avtomatik yakunlangan natijalar.
- Qoidabuzarlik bilan yakunlangan: server avtomatik yakunlagan natijalar.
- Barcha ishtirokchilar: natijalar, davom etayotgan urinishlar va boshlamaganlar.
- Topshirmaganlar: ilgari natijasi yo'q davom etayotgan yoki boshlamagan o'quvchilar.
- Davom etayotganlar: serverda hali tugamagan faol urinishlar.
- Boshlamaganlar: testga biriktirilgan sinf/guruh ro'yxatida bor, urinish/natijasi yo'q.

Oxirgi to'rtta holat uchun test tanlanishi shart. Sinf/guruhda o'quvchilar ro'yxati
bo'lmasa, boshlamaganlarni taxmin qilish o'rniga tushuntirish chiqariladi.
Ism va studentId mosligi bilan ro'yxatdagi topshirganlar qayta boshlamagan deb
sanalmaydi. Qayta urinishdagi avvalgi natija mavjudligi hisobga olinadi.

## Arxitektura va xavfsizlik

`server/lib/result-filters.mjs` qidiruv/saralash/holat qoidalarini birlashtiradi.
`result-participation-service.mjs` faqat tanlangan, egasi ruxsatli testning
ro'yxati va pending urinish holatlarini o'qiydi. Savollar snapshotlari yuklanmaydi.
API javobi ruxsat etilgan maydonlardan tuziladi; browserKey, ownerHash, token,
accessCode, savol va javob kalitlari qo'shilmaydi. Yangi imkoniyatlar admin
sessiyasini talab qiladi; boshqa maktabning testi uchun 404 qaytariladi.

Synthetic qatorlarda `hasResult: false` bo'ladi; ularga ball, Word/natija tafsiloti
yoki o'chirish amali berilmaydi. Statistika faqat yakunlangan natijalarni baholaydi.
XLSX/CSV va chop etishda holat ko'rsatiladi; tugallanmagan natija 0% deb yozilmaydi.
Blok testlarning fanlar kesimidagi eksporti saqlandi; faol filtrga aloqasiz
qatnashmaganlar eksportga yashirincha qo'shilmaydi.

## Lokal tekshiruv

Ikki alohida maktab, sinf, guruh, uchta test, 25 yakunlangan natija, davom etayotgan
urinish va ro'yxatdagi boshlamaganlar bilan haqiqiy lokal API sinovdan o'tdi.
Holatlar, test/sinf kesishmasi, ismning teskari tartibi, foiz saralashi, statistika,
filtrlangan savol tahlili va maktablar orasidagi izolyatsiya tekshirildi.
401/404 himoyasi va javobda maxfiy maydonlar yo'qligi tasdiqlandi.

Chrome'da 20+4 qatorli sahifalash, qator raqami, 24 yozuvni to'liq chop etish,
26 holatli qatorni XLSX qilish, katalogdan test tanlash va kechikkan qidiruv javobini
rad etish tekshirildi. 320/390/768pxda sahifa gorizontal chiqmaydi; jadval ichida
gorizontal aylantirish saqlandi. JavaScript xatosi kuzatilmadi.
Sinov artefaktlari Gitga kiritilmaydi; tests/ yoki audit skriptlari yaratilmaydi.
Blok testning fan/ball XLSX tuzilmasi va eski eksport chaqiruvlari alohida
tekshirildi. `npm run check`, `npm run build` va `git diff --check` o'tdi.
