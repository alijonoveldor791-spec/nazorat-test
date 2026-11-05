# O'qituvchi test kartalari qayta dizayni

2026-11-05 yangilanish: foydalanuvchi so'rovi bilan menyuga joy ajratish o'rniga karta ustida markaziy oyna qo'llandi. Karta balandligi o'zgarmaydi; fon xiralashadi va shu kartadagi fon boshqaruvlari vaqtincha inert bo'ladi. Amallar oynasi non-modal dialog sifatida belgilangan, Tab/Shift+Tab fokusni oynada saqlaydi; Escape va tashqariga bosish yopadi. Menyu kerak bo'lsa viewportga olib kelinadi. 320/390/768/1280pxda markaz, o'zgarmagan karta balandligi, ko'rinish chegarasi, fokus va inert holatini qaytarish tekshirildi; JS xatosi yo'q. UI tekshiruvida admin API javoblari taqlid qilindi.

Sana: 2026-11-05. Faqat haqiqiy Testlar ro'yxatidagi kartalar qayta ishlangan.

- Holat rang va matn bilan, nom 20px/600, fan/sinf chiplar, metama'lumotlar inline SVG bilan beriladi.
- Kod doim ochiq: 28px monospace, 4px letter-spacing; nusxalashdan so'ng 2 soniya `Nusxalandi ✓` ko'rinadi. Boshidagi nollar string sifatida saqlanadi.
- Sanalar Asia/Tashkent bo'yicha `4-noyabr, 07:58`; to'liq sana/timezone bo'yicha eski format title ichida mavjud. Noma'lum tarixiy sanalar o'ylab topilmaydi.
- Tahrirlash asosiy, To'xtatish kontur tugma; qo'shimcha va kod holati amallari yuqoridagi menyuda. Eksport va eski code state amallari saqlangan.
- Menyu absolute bo'lsa ham header hududida uning balandligiga joy ajratiladi. Shu sabab karta ichidagi sarlavha/kod/amallar ustiga tushmaydi. Pastda joy kam bo'lsa yuqorida joy ajratiladi. Bir vaqtda bitta menyu, Escape fokusni qaytaradi, tashqariga bosish yopadi.
- Kartalar 1200pxdan kengda 3, 701–1200pxda 2, 700px va kichikda 1 ustun; telefonda pastki amallar to'liq kenglikda.
- Yangi CSS faqat test kartalariga tegishli. Eski teacher-cards.cssdan faqat shu kartalarga tegishli qoidalar olindi; sinf kartalari uchun umumiy qoidalar saqlandi.
- Framework, CDN, tashqi shrift qo'shilmadi; mavjud tizim shrifti ishlatiladi. Chap menyu, panel headeri, qidiruv/filtrlar va boshqa sahifalar o'zgarmagan.

## Tuzilma

- `teacher/tests.js`: mavjud sahifa va haqiqiy API amallari; karta ko'rinishini alohida moduldan oladi.
- `teacher/test-card-view.js`: escape qilingan kartalar va ixcham sana.
- `teacher/test-card-icons.js`: faqat o'zgarmas dekorativ SVGlar.
- `teacher/test-card-menu.js`: menyuni ochish/yopish, yo'nalish va fokus.
- `teacher/test-codes.js`: ochiq kod bloki, kod amallari markupi va avvalgi serverga bog'langan handlerlar; clipboard tasdig'i.
- `pages/test-cards.css`, `pages/test-card-menu.css`: karta va menyuning alohida vazifalari.
- `tokens.css`: light/dark warning tokenlari; `styles.css`: yangi uslublar importi.

## Tekshiruv

`npm run check`, `npm run build`, `git diff --check` bajarildi. Frontend mavjud Netlify Dev `localhost:8888`dan ochildi. `npm run dev` qayta ishga tushirishga urinish port oldindan bandligi bilan tugadi; mavjud server to'xtatilmadi.

Chrome'da 320/390/768/1024/1280/1920px, light/dark — 12 holat tekshirildi. Gorizontal chiqish yo'q; ustunlar soni, 20px sarlavha, 28px kod, ochiq kodlar va menyuning headerda ajratilgan joydan chiqmasligi tekshirildi. Nusxalash va 2 soniyalik qaytish, To'xtatish, kodni bekor qilishda cancel/confirm hamda version payload, kodni faollashtirish, nusxa, o'chirish, tahrirlash havolasi va bo'sh qidiruv holati tekshirildi. JavaScript xatosi: 0.

Admin API javoblari ushbu UI tekshiruvida vaqtinchalik xotira fixturelari bilan almashtirilgan; haqiqiy maktablar, testlar va kodlarga yozilmadi. Backend/API/autentifikatsiya kodi o'zgarmadi. Bu tekshiruv haqiqiy ombor bilan integratsiya qayta sinaldi degani emas. Test fixturelari public yoki Gitga qo'shilmadi. Gitdan tashqari dalillar: `.local/test-cards-review.json` va skrinshotlar.

Deploy yoki push bajarilmadi. Keyingi tekshiruv: nashrdan oldin alohida lokal/sinov maktabida haqiqiy API bilan amallarni tekshirish.
