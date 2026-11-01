# Maktab IDsi: A bosqichi

Tekshiruv sanasi: 2026-11-01. Holat: lokal kod va oqimlar tekshirildi.

## Amalga oshirilgan imkoniyatlar

- Yangi maktab uchun server yaratadigan doimiy UUID v4; mavjud IDlar saqlanadi.
- `school-requests` rezervi orqali parallel yoki javobi yo'qolgan yaratish so'rovini bir xil `requestId` bilan davom ettirish. Boshqa payload 409 bilan rad etiladi.
- Band ID ustidan yozmaslik, arxiv yozuvini saqlash va IDni tahrirlashni rad etish.
- Bosh admin panelida maktab IDsi/nomi bilan qidirish, nom/hudud, holat va obunani boshqarish; IDni nusxalash.
- Haqiqiy yozuvlardan hisoblangan agregat monitoring; noma'lum maktabga bog'langan yozuvlar alohida hisoblanadi. Individual natijalar ochilmaydi.
- Maktab admini uchun o'z maktabi nomi va IDsi. Bloklash yangi login va mavjud sessiyani yopadi; qayta faollashtirish eski tokenni tiklamaydi. Logout server sessiyasini bekor qiladi.

## Tekshirish dalillari

Quyidagi buyruqlar lokal Netlify Dev va Node 22.23.4 bilan muvaffaqiyatli bajarildi:

| Buyruq | Natija |
| --- | --- |
| `npm test` | 113/113 test o'tdi |
| `npm run check` | 222 fayl: qator limitlari, qatlamlar, inline kod va public havolalari tekshirildi |
| `npm run verify` | 9 integratsiya oqimi o'tdi |
| `npm run test:schools:browser` | 9 tekshiruv; 320/390/1280 px; 0 JS xato |
| `npm run test:audit:api` | 7 xavfsizlik/recovery oqimi o'tdi |
| `npm run test:audit:auth` | Parol yangilash, eski sessiyalar va logout tekshirildi |
| `npm run test:audit:browser` | 8 tekshiruv; uzilish, draft, oynalar egaligi va XSS; 0 JS xato |
| `npm run test:browser` | Asosiy o'qituvchi/o'quvchi oqimi va 9 responsive/a11y tekshiruvi; 0 JS xato |

Maktab sinovining dalillari: `artifacts/schools-browser.json` va `artifacts/schools-{320,390,1280}.png`. Artefaktlar Gitga kiritilmaydi. Netlify Dev dastlab konfiguratsiya ruxsati va tashqi extension so'rovi sabab kechikdi; lokal server tayyor bo'lgach sinovlar qayta bajarildi.

## Qolgan doira

Bu hisobot A bosqichini yakunlaydi. B: barcha maktablararo izolyatsiya yo'llarini to'liq tekshirish; C: maktab IDsi va umumiy test kodi bilan o'quvchi kirishi; D: natijalar va yakuniy integratsiya hali alohida ishlar. Hozirgi tekshiruvlar ularning to'liq bajarilganini bildirmaydi. Eski yozuvlar migratsiyasi, push va deploy bajarilmadi.
