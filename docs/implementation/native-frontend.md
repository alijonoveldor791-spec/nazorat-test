# HTML/CSS/JavaScript frontend

Sana: 2026-11-18.

## Natija

15 sahifa joriy React interfeysidagi maket, ranglar, maydonlar, navigatsiya,
SVG belgilar va rasmlar bilan oddiy HTML/CSS/JavaScript ES modullariga ko'chirildi.
O'quvchi kirishi, test, natija, o'qituvchi kabineti va bosh admin sahifalari mavjud.
Tashqi shrift so'rovlari olib tashlandi; tizim shriftlari ishlatiladi.

React, React DOM, React Router, Lucide React, Tailwind, Vite va TypeScript paketlari
kerak emas. JSX, TSX, kompilyatsiya bosqichi va root HTML sahifasi yo'q.
SVG belgilar mahalliy statik ta'riflarda, rasmlar `public/assets/images/` ichida.
Build faqat tuzilmani tekshiradi. Netlify avvalgidek `public/` ni tarqatadi;
bosh sahifa endi shu papkadagi `index.html` da mavjud.

## Tuzilma

- `public/*.html`, `public/oqituvchi/`, `public/bosh-admin/`: sahifa hujjatlari.
- `public/js/<rol>/<sahifa>.js`: har sahifaning alohida brauzer kirish nuqtasi.
- Sahifa papkalaridagi `part-*.js`: holat, so'rovlar va amallarni tayyorlash.
- Sahifa papkalaridagi `view*.js`: alohida ko'rinish qismlari.
- `public/js/core/dom.js`: mahalliy DOM elementlari va ularni yangilash.
- `public/js/core/properties.js`: atributlar, forma qiymatlari, hodisalar va ref.
- `public/js/core/state.js`: sahifa qismlari holati, hisoblashlar va tozalash.
- `public/js/core/navigation.js`: oddiy HTML havolalari va URL parametrlari.
- `public/js/core/lifecycle.js`: sahifa o'tishida eski DOM yangilanishini to'xtatish.
- `public/js/components/`: umumiy kabinet, modal, tema, bildirishnoma va savol UI.
- `public/css/styles.css`: mahalliy CSS qismlarining kirish fayli.
- `server.mjs`: lokal `public/` HTTP serveri va mavjud API adapteri; Vite ishlatmaydi.

DOM matni `createTextNode` bilan joylanadi. Rich HTML avvalgi sanitizer orqali
tozalanadi; statik SVG belgilar foydalanuvchi HTML'ini qabul qilmaydi.
Forma va hodisalar JavaScript orqali ulanadi; HTML ichida inline kod yo'q.
DOM yangilanishida fokus, fayl tanlovi va kiritilgan qiymatlar saqlanadi.
Sahifa olib tashlanganda taymer va hodisa obunalari tozalanadi.

## Moslik

API manzillari va payloadlari, brauzer kaliti, sessiya tokeni, qoralama/natija
saqlash nomlari o'zgarmadi. Draft versiyasi, brauzer egaligi, server taymeri,
takroriy yuborish, natijani tiklash va legacy kirish mantiqi saqlandi.
Serverdagi parser, ruxsatlar va baholash qatlamlari o'zgartirilmadi.
MathJax mavjud mahalliy `public/vendor/` fayllaridan yuklanadi.
Ichki sahifalar haqiqiy `.html` fayllar; lokal server kengaytmasiz manzilni
tegishli HTML'ga bog'laydi. Mavjud bo'lmagan resurs 404 qaytaradi.

## Tekshiruv

`npm run check` va `npm run build` majburiy. Lokal Chrome'da bosh sahifa,
kirish, ochiq testlar va kabinetning barcha sahifalari ochildi. Kabinetning
bo'sh holatlari mahalliy API javoblari bilan tekshirildi; JavaScript xatosi yo'q.
Tema, parolni ko'rsatish, matn kiritish va 390px kabinet maketi tekshirildi.
Haqiqiy lokal API bilan sinf yaratish, savol va variant tahriri, testni saqlash
va uni qayta yuklash ishladi. Test artefaktlari Gitga kiritilmaydi.

Haqiqiy lokal API bilan to'rt bosqichli o'quvchi kirishi, javob va draft
versiyasini serverga yuborish, ikkinchi oynani bloklash, yakunlash va 1/1 natijani
qayta ochish tekshirildi. Yakunlashda eski sahifaning kechikkan chizilishi yangi
manzilni bosib ketmasligi uchun navigatsiya boshlanishida chizish to'xtatiladi.
Word preview serverda 1 savol qaytardi, tanlangan fayl qayta chizishda saqlandi.
Natijalardan Excel eksporti haqiqiy XLSX berdi; rich HTML sanitizatsiyasi va
320/390/768px ko'rinishlar tekshirildi. Brauzer JavaScript xatosi kuzatilmadi.
Haqiqiy maktablar bilan bosh admin kartalari ham tekshirildi. Logoutdan so'ng
oldingi token serverda 401 qaytardi. 15 statik HTML manzili 200, yo'q resurs 404
qaytardi. Yakuniy `npm run check` va `npm run build` muvaffaqiyatli o'tdi.

Lokal serverning mavjud in-memory saqlash adapteri o'zgartirilmadi; bunday
lokal ma'lumotlar jarayon yopilganda yo'qoladi. Production Blobs adapterini
alohida ko'rib chiqish bu frontend ko'chirishining doirasiga kirmaydi.
