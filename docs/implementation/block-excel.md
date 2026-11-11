# Blok test natijalarining Excel jadvali

2026-11-11, feature/dtm-189-complete. Namuna rasmga mos .xlsx eksport.

## Ko'rinish

- Birlashtirilgan katta sarlavha: testni bajargan guruh/sinf nomi.
- Ustunlar: No, Ism familiyasi, har bo'limdagi to'g'ri javoblar, Jami ball.
- Majburiy fan sarlavhalari katta harfda; bir xil fan ikki turdagi bo'limda
  bo'lsa alohida ustunlar saqlanadi. Fanlar bo'lim turi + nomi bilan ajratiladi.
- Jami ball kamayish tartibida, teng ball familiya bilan tartiblanadi.
- Kulrang ustun sarlavhalari, katak chegaralari, qalin jami ball, keng ism
  ustuni, mahkamlangan dastlabki ikki qator va landscape A4 chop etish.
- Har test/sinf alohida varaq. Oddiy natijalar Umumiy natijalar varag'ida.
- Mavjud qidiruv, test va sinf filtrlari eksportga tatbiq etiladi.
- Joriy sinf ro'yxatida bor, ammo eksportdagi testda natijasi yo'q o'quvchi
  oxirida Qatnashmadi deb ko'rsatiladi. Shaxsiy kodlar faylga kirmaydi.

## Fayllar

- public/js/teacher/results.js: Excel (.xlsx) tugmasi va eksportni ulash.
- public/js/teacher/block-excel.js: blok reytingi va fan ustunlari.
- public/js/core/xlsx-workbook.js: OOXML varaqlar va dizayn.
- public/js/core/zip-store.js: CRC32li siqilmagan ZIP konteyneri.
- PLAN.md va docs/ARCHITECTURE.md yangilandi.

Frontend framework, CDN yoki yangi dependency qo'shilmadi. Haqiqiy XLSX
ishlab chiqariladi; eski HTML faylga .xls nomi berish usuli almashtirildi.

## Dalillar

Lokal npm run dev serveri (8888) orqali Chrome/Playwrightda Excel tugmasi
bosildi. API manbalari 5 blok natija, 1 oddiy natija va 1 qatnashmagan
o'quvchili nazorat fixture bilan berildi. Filtrlangan blok eksportida 1,
aralash eksportda 2 varaq hosil bo'ldi. CSV eksporti ham tekshirildi.

Yuklangan fayllar Python openpyxl bilan ochildi; ZIP CRC tekshiruvi o'tdi.
Jami ball kataklari son turida 189, 119.9, 8.8, 0, 0; aralash natijadagi
fan javoblari 20, 15, 8, 8, 8 ekanligi tekshirildi. Tartib, merge, rang,
border, bold, ustun kengligi, freeze panes va landscape tekshirildi.
=SUM bilan boshlanuvchi ism formula emas, matn sifatida saqlandi.
Shaxsiy kod eksport ZIP qismlarida topilmadi. Brauzer JS xatolari yo'q.

npm run check va npm run build: PASS. Lokal sinovlar va namunaviy .xlsx
fayllar .local/ ichida, Gitga kiritilmadi; tests/ qayta yaratilmagan.

## Cheklovlar

Microsoft Excel desktop ilovasida qo'lda ochish bu muhitda bajarilmadi;
faylning haqiqiy XLSX ekanligi openpyxl va ZIP bilan tekshirildi. Ball
son sifatida saqlanadi; vergul/nuqta Excelning mintaqaviy sozlamasiga bog'liq.
Roster bo'lmasa qatnashmaganlarni aniqlab bo'lmaydi. Hech natija yo'q test
uchun fan tarkibi natijalar metadata manbasidan olinmaydi; bo'sh umumiy
varaq chiqariladi. Takroriy urinishlar mavjud topshirishlar sifatida qoladi.
Eski natijada bo'limning to'g'ri javoblar soni yo'q bo'lsa '-' chiqadi,
fan kesimida taxminiy natija hisoblanmaydi. Deploy/main birlashtirish yo'q.

## Guruh nomli yuklama

2026-11-11: bir guruh/sinf eksportida sarlavha va fayl nomi shu guruh
nomidan olinadi (masalan, Spets guruh.xlsx). Bir nechta guruh eksportida
guruhlar-natijalari.xlsx, har bir varaqda o'z guruh nomi chiqadi. Joriy
sinf yozuvi bo'lmasa natijadagi grade nusxasi ishlatiladi. Fayl nomidagi
Windows uchun yaroqsiz belgilar almashtiriladi.

Tekshiruv: brauzerdan 11-A.xlsx yuklandi; openpyxl bilan A1=11-A, 119.9 ball va Qatnashmadi qatori saqlangani tasdiqlandi. Bir/nechta guruh, o'chirilgan sinf nomi va yaroqsiz fayl belgilarining fallbacklari tekshirildi. npm run check va npm run build: PASS.
