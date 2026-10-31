# Arxitektura

Framework, CDN, tashqi shrift va frontend build yo’q. Netlify statik `public/`ni tarqatadi, v2 Function server routerini chaqiradi.

## Papkalar vazifasi

| Papka | Vazifa |
| --- | --- |
| `public/` | Faqat brauzerga beriladigan HTML/CSS/JS va statik fayllar |
| `public/css/` | `styles.css` importlari: tokens, base, layout, komponent va sahifa uslublari |
| `public/js/core/` | API client, sessiya, DOM escape, format, saqlash, mavzu |
| `public/js/components/` | Mustaqil modal, toast, jadval, sidebar va boshqa umumiy UI |
| `public/js/student/` | Home, test runner, natija, taymer, xarita, saqlangan urinish |
| `public/js/teacher/` | Har sahifa kirishi, ma’lumot va UI boshqaruvi |
| `server/routes/` | HTTP usuli, URL, body va javob statusini xizmatga moslashtirish |
| `server/services/` | Ruxsat, jadval, urinish, baholash, CRUD va tahlil qoidalari |
| `server/repositories/` | Netlify Blobs o’qish/yozish, pagination, kesh va atomik amallar |
| `server/lib/` | Aiken parser, HMAC, parol, validatsiya va HTTP yordamchilari |
| `server/migrations/` | Eski yozuvlarni o’qishda buzmasdan moslashtirish |
| `tests/` | Parser, baholash, aralashtirish, token, parol va moslik regressiya testlari |
| `scripts/` | Tuzilma tekshiruvi, integratsiya, brauzer va yuklama sinovlari |
| `samples/` | Asosiy namuna test fayli |

```text
HTTP → netlify/functions/api.mjs → server/router.mjs
     → routes/ → services/ → repositories/ → Netlify Blobs

HTML → js/<rol>/<sahifa>.js → core/ + components/
```

`api.mjs` 20 qatordan, boshqa loyiha fayllari 250 qatordan oshmaydi. `node_modules`, Git, `.netlify`, maxfiy `.env` va sinov artefaktlari loyiha manba kodi hisoblanmaydi. Avtomatik lock JSON bir qatorda saqlanadi; kodni qisqartirib limitdan qochish uchun minifikatsiya ishlatilmaydi.

## Qatlamlar qoidasi

- Route’da Blobs, baholash yoki yozuvlarni o’zgartirish mantiqi bo’lmaydi. U xizmatga uzatadi.
- Service faqat repository interfeysini chaqiradi; `getStore` yoki pastki `blob-store.mjs` adapterini import qilmaydi.
- `@netlify/blobs` importi faqat `repositories/`da. `onlyIfNew` natijani takror yozishdan, ETag shartlari hisoblagichlardagi yo’qolgan yangilanishlardan saqlaydi.
  API shartlari: [Netlify Blobs rasmiy yo’riqnomasi](https://docs.netlify.com/build/data-and-storage/netlify-blobs/).
- Netlify Dev shartli yozish emulyatoridagi parallel poyga uchun repository lokal workerlar orasida vaqtinchalik fayl lock ishlatadi. Bu faqat `NETLIFY_DEV=true` holatida; production’da Blobs atomik shartlari ishlaydi.
- Javoblar bilan savollar faqat admin va serverda. Ochiq test hamda boshlash javobida kalit yo’q.
- Aiken parser brauzerga ko’chirilmaydi: `POST /api/admin/tests/preview`.
- Eski `/api/admin/preview` va `/teacher.html` havolalari moslik uchun saqlangan.
- Markupda inline script, style va event atributi yo’q. JS hodisa tinglovchilarini modul ichida ulaydi.
- Umumiy UI copy-paste qilinmaydi. Sahifa fayli faqat o’z vazifasini boshqaradi.
- Mutlaq qiymat konstantalari `UPPER_SNAKE_CASE`, funksiyalar `camelCase`, kod fayllari kichik harf va defis bilan yoziladi.

## Yangi sahifa qo’shish

1. Tegishli `public/` yoki `public/oqituvchi/`da markup fayli yarating.
2. `public/js/<rol>/<sahifa>.js` kirish modulini ulang; umumiy qismlarni core/components’dan import qiling.
3. Faqat zarur sahifa uslubini `css/pages/`ga qo’shib, `styles.css`ga import yozing.
4. Panel sahifasi bo’lsa `components/sidebar.js` navigatsiyasini yangilang.
5. Brauzer sinovi hamda `npm test` va `npm run check`ni bajaring.

## Yangi endpoint qo’shish

1. `routes/public/` yoki `routes/admin/`da HTTP adapter yarating va `routes/index.mjs`ga ulang.
2. Biznes qoidalarini bitta xizmat moduliga yozing.
3. Yangi ombor bo’lsa repository yarating; bor repositoryni qayta ishlating.
4. Yangi endpoint odatda `routes/ + services/ + repositories/` bo’ylab o’tadi, biroq bor xizmat/repository uchun nusxa yaratilmaydi.
5. Muhim qoida uchun unit test, haqiqiy HTTP oqimi uchun `scripts/verify.mjs` tekshiruvini qo’shing.

## Ma’lumotlar va cheklovlar

Omborlar: `tests`, `classes`, `results`, `attempts`, `retakes`, `settings`, `limits`. Test/sinf o’qishlari 5 soniya keshga olinadi; baholash va ruxsatda yangisi olinadi. Savollar nusxasi urinishda, javoblar va tartib natijada saqlanadi. Ko’p yozuvli tiklash/tozalash tranzaksiya emas. O’quvchilar uchun alohida hisob/parol hozirgi modelga kirmaydi.
