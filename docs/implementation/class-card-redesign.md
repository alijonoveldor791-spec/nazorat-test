# Sinf kartalari

Sana: 2026-11-05. Test kartalarining vizual uslubi va karta ustidagi amallar oynasi sinflarga tatbiq qilindi.

- Sinf nomi 20px/600, o'quvchi va test sonlari SVGli meta, biriktirilgan testlar chiplar bilan ko'rsatiladi.
- Mavjud progress, topshirmaganlar tafsiloti, ochiq mashq izohi va bo'sh holat saqlangan. Hisoblash uchun avvalgi `classProgress` ishlatiladi.
- `Tahrirlash`, `Shaxsiy kirish kodlari` va `O'chirish` haqiqiy oldingi handlerlarga bog'langan. Roster bo'lmagan kartada shaxsiy kod amali ko'rsatilmaydi.
- Menyu karta ustida markazda ochiladi, fon xiralashadi, karta balandligi o'zgarmaydi. Inert fon, fokus aylanishi, Escape va tashqariga bosish umumiy komponent orqali ishlaydi.
- 3/2/1 ustun, light/dark tokenlari, ixcham Asia/Tashkent sanasi va noma'lum eski sanalar saqlanadi.
- Chap menyu, sahifa headeri, backend, autentifikatsiya, API va saqlangan yozuvlar o'zgarmagan.

## Modullar

`teacher/classes.js` sahifa va amallarni ulaydi, `teacher/class-card-view.js` escape qilingan kartalarni chizadi. Sinfga tegishli uslublar `pages/class-cards.css`da.

Avval testga xos bo'lgan menyu va SVG modullari `components/card-menu.js`, `components/card-icons.js`ga ko'chirildi; testlar ham shu umumiy modullarni ishlatadi. Menyu CSSi `components/card-menu.css`ga ko'chirildi, SVG uslubi mavjud `components/card.css`ga qo'shildi. Ikkala karta sanasi `components/card-time.js`da; boshqa sahifalarning sana formatlari o'zgarmagan.

## Tekshiruv

`npm run check`, `npm run build`, `git diff --check` bajarildi.

Mavjud lokal Netlify Dev :8888 orqali Chrome'da 320/390/768/1024/1280/1920px va light/dark — 12 holat tekshirildi. Gorizontal chiqish yo'q, ustunlar soni va sarlavha o'lchami mos. Menyu markazi, o'zgarmagan karta balandligi, fokus, Tab/Escape, inert holatini qaytarish tekshirildi.

Progress va topshirmaganlar, shaxsiy kodlar oynasi, tahrirlash PUT payloadi, o'chirish cancel/confirm, rostersiz sinf, testsiz sinf va bo'sh ro'yxat o'tdi. Test kartasida ko'rinadigan kod va umumiy menyu ishlashi regressiya sifatida tekshirildi. JavaScript xatosi: 0.

Admin API ushbu UI tekshiruvida xotira fixturelari bilan taqlid qilingan. Haqiqiy maktab ma'lumotlariga yozilmadi; backend bilan integratsiya qayta sinovdan o'tkazildi deb olinmaydi. Vaqtinchalik tekshiruv kodi Gitga kiritilmadi. Dalillar `.local/class-cards-review.json` va skrinshotlarda.

Push/deploy bajarilmadi.
