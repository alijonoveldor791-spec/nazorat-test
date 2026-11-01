# O'quvchi interfeysi: 4 bosqichli wizard

Sana: 2026-11-01. Ish lokal manba kodda bajarildi; GitHub push va Netlify deploy bajarilmadi.

## Dastlabki muammolar

- Kod formasi `.start-layout` grididan tashqarida bo'lib, keyingi kartaga oraliqsiz tutashgan.
- Kod tekshirilgach sinf, ism-familiya va test tanlovi bir vaqtda ko'ringan.
- Kod bitta testni aniqlasa ham test dropdowni ko'rsatilgan.
- Mobil CSS `.tip-card`ni butunlay yashirgan; yangi oqim uchun izchil responsive konteyner yo'q edi.
- Resume banneri faqat localStorage mavjudligiga qarab ochilgan, server tasdig'i keyingi sahifaga qoldirilgan.

## O'zgartirilgan fayllar

| Fayl | Vazifa |
| --- | --- |
| `public/index.html` | Bitta forma, 4 fieldset, progress, banner, maslahat va yordam |
| `public/css/styles.css` | Yangi sahifa CSS modullarini ulash |
| `public/css/pages/student-entry.css` | 1120 px konteyner, grid, 24–32 px spacing va responsive layout |
| `public/css/pages/student-wizard.css` | Progress, forma, xatoliklar, tugmalar va tasdiqlash |
| `public/js/student/home.js` | Sahifa kirishi, mavzu va modul integratsiyasi |
| `public/js/student/entry-wizard.js` | Bosqichlar, oldinga/orqaga, loading va start |
| `public/js/student/entry-view.js` | Maydon validatsiyasi, aria holati, fokus va escape qilingan summary |
| `public/js/student/school-entry.js` | Kod verifikatsiyasi, invalidatsiya va eski javobni rad etish |
| `public/js/student/entry-session.js` | Urinishni saqlash, versiya va server tasdiqli resume |
| `public/eski-testlar.html` | Eski maktabsiz oqim markupini saqlash |
| `public/js/student/legacy-home.js` | Eski sinf/test/shaxsiy kod oqimiga moslik |
| `PLAN.md`, `docs/ARCHITECTURE.md`, `README.md` | Amaldagi tuzilma va ishlash tartibi |

Yangi framework, CDN, tashqi shrift yoki dependency qo'shilmadi. Backend endpointlari va mavjud ma'lumotlar o'zgartirilmadi.

## Yangi xatti-harakatlar

1. Kodlar serverda tekshirilmaguncha Keyingi ishlamaydi. Loading paytida takror tekshirish va navigatsiya yopiladi; API xatosidan keyin qayta urinish mumkin.
2. Faqat resolver qaytargan testga tegishli sinflar chiqadi. Tanlovsiz keyingi bosqichga o'tilmaydi.
3. Ism va familiya majburiy; xabarlar maydon ostida, `aria-describedby` va `aria-invalid` bilan. Fokus xato maydonga yoki yangi bosqich sarlavhasiga o'tadi.
4. Tasdiqlash maktab nomi/IDsi, sinf, ism, familiya, test nomi, savollar soni va davomiylikni ko'rsatadi. Foydalanuvchi matni HTML sifatida bajarilmaydi.
5. Orqaga qaytish qiymatlarni saqlaydi. Kod o'zgarishi sinf/test kontekstini va tasdiqni bekor qiladi; eski so'rov javobi yangi qiymatlarga qo'llanmaydi.
6. Faqat yakuniy tugma start APIga murojaat qiladi. Server kod/maktab/sinf/ismni qayta tekshiradi; brauzerda bosqichni o'zgartirish server ruxsati bermaydi.
7. Davom etish banneri server tasdig'idan keyin ochiladi; begona brauzer kaliti banner bermaydi. Tugagan test natijaga o'tadi. Qurilmadan o'chirish tasdiq talab qiladi va server urinishini saqlaydi.
8. Mobil maslahat/yordam formadan keyin, desktopda yon panelda. Binafsha aksent, dark theme va tanlangan mavzuni saqlash ishlaydi.

## Tekshirish

Avval olib tashlangan `tests/` va doimiy test skriptlari qayta kiritilmadi. Mavjud lokal Playwright/Chrome yordamida bir martalik `.local/wizard-qa.mjs` ishlatildi. U haqiqiy router → services → repositories zanjirini alohida xotira Blobs adapteriga ulaydi. Mavjud lokal yoki production maktab/test/natijalardan fixture sifatida foydalanilmaydi.

| Tekshiruv | Natija |
| --- | --- |
| `npm run check` | 250 qator, qatlamlar, inline kod va public havolalari o'tdi |
| `npm run build` | Statik loyiha tekshiruvi o'tdi |
| Responsive/light/dark | 360, 390, 768, 1024, 1366, 1920 px × 2 mavzu × 4 bosqich = 48 skrinshot |
| Layout/accessibility | Scroll, overlap, kesilgan input yoki label yo'q; padding ≥24 px, kartalar oralig'i ≥24 px, controls ≥44 px |
| Navigatsiya | Bir fieldset, 4 bosqich, klaviatura, orqaga saqlash, kod invalidatsiyasi va deep-linkni e'tiborsiz qoldirish |
| Xatolik/loading | Bo'sh/noto'g'ri kod, begona maktab kodi, API 503, qayta urinish, disabled/busy holati |
| Validatsiya va XSS | Sinf/ism/familiya, 8 maydonli summary va zararli matnni escape qilish |
| Start/taymer | Tasdiqlashgacha 0 urinish; keyin 1 urinish, 10 daqiqali muddat va kamayuvchi taymer; parallel retry shu urinishni qaytardi |
| Recovery | Server drafti, o'sha urinishga davom etish, begona brauzerni rad etish va expired natija |
| Bekor qilish | Yo'q javobi draftni saqlaydi; Ha faqat mahalliy draftni olib tashlaydi |
| Server tekshiruvlari | Begona maktab/sinf va bo'sh ism bilan to'g'ridan-to'g'ri start rad etildi |
| Moslik | Eski havola `/eski-testlar.html`ga o'tadi; eski forma saqlangan |
| Brauzer xatolari | 0 JavaScript xato |

Dalillar: `.local/wizard-evidence/report.json` va shu papkadagi 48 PNG. Bu Gitdan chiqarilgan lokal artefaktlar. 13 ta tekshiruv guruhi o'tdi. Asosiy lokal sayt `http://localhost:8888/`da yangilangan markup bilan HTTP 200 qaytardi.

## Qolgan holatlar

Tekshirilgan oqimlarda ochiq xato aniqlanmadi. Vizual tekshiruv Chrome bilan bajarildi; Safari/Firefox alohida sinovdan o'tkazilmadi. Production sayti ushbu lokal o'zgarishlar bilan yangilanmagan.
