# Mustaqil audit: tuzatishdan oldin

Sana: 2026-10-31. Baza: `8afe461`. Hisobot kodni o'zgartirishdan oldin o'qish orqali tuzildi va chatda taqdim etildi. Production infratuzilmasi, hisob sozlamalari va tashqi pentest bu tekshiruvga kirmaydi.

| ID | Jiddiylik | Qayerda va dalil | Tuzatish |
| --- | --- | --- | --- |
| S01 | Yuqori | `server/services/auth-service.mjs/authConfig`: `version: hash(password)` token payloadiga chiqadi; parol taxminlarini tez SHA-256 bilan oflayn tekshirish mumkin. | Tasodifiy sessiya versiyasi, server sessiyalari va eski tokenlarni bekor qilish. |
| S02 | Yuqori | `attempt-service.mjs/startAttempt` faol urinishni faqat ism/ochiq studentId asosida qaytaradi; `routes/public/grades.mjs` butun rosterga ochiq kirish beradi. | Shaxsiy o'quvchi kodi, yopiq roster va brauzer egalik kaliti. |
| S03 | Yuqori | `scoring-service.mjs` saqlangan `publicResult`ni amaldagi showAnswers siyosatisiz qaytaradi. | Har natija qaytarishda joriy ruxsatni tekshirish, saqlangan javob kalitini to'g'ridan-to'g'ri qaytarmaslik. |
| S04 | O'rta | `core/auth.js` logout faqat sessionStorage'ni tozalaydi; authConfig/parol tekshiruvi ayrim joylarda limitdan oldin qimmat scrypt hisoblaydi. | Server logout/sessiya, kuchli boshlang'ich parol siyosati va hisoblashdan oldingi cheklov. |
| S05 | O'rta | 80/min IP limiti maktab NAT'ida qayta yuborishlarga tor; 429 hamisha 900 soniya. readJson hajmni req.text'dan keyin tekshiradi. | IP va urinish limitlarini ajratish, aniq Retry-After, streaming bayt chegarasi. |
| R01 | O'rta | Javoblar faqat brauzerda; deadline+30 soniyadan keyin yuborish/hatto saqlangan natijani qayta olish bloklanadi. | Server draft, muddatda serverdagi snapshotni yakunlash, tiklash va retry. |
| R02 | O'rta | Eski bo'sh test requireAvailable'dan o'tadi; draft schema tekshirilmaydi; taymer Date.now qurilma soatiga bog'liq. | Savol/draft validatsiyasi, server vaqti va monotonic taymer. |
| R03 | O'rta | Bitta DRAFT_KEY yangi test bilan ustidan yoziladi; parallel oynalarda egalik nazorati yo'q. | Almashtirish tasdig'i, mavjud javoblarni ishlatish va tab guard. |
| T01 | O'rta | Modal confirm hodisasida forma POSTdan oldin olib tashlanadi; test recovery yozuvi hech qayerda o'qilmaydi. | Asinxron confirm: xatoda forma ochiq qolishi, inline xato va native submitni boshqarish. |
| T02 | O'rta | classes.js barcha test natijalarini bitta submitted Set'ga yig'adi; shell yangilashda butun contentni almashtirib fokusni uzadi. | Har test bo'yicha roster progress va yangilashda faol maydonni saqlash. |
| B01 | O'rta | Restore raw maydonlarni spread qiladi, sourceOptions'ni olib tashlaydi; yangi muhitda attemptId'li tiklangan natijalar limit hisobiga kirmaydi. | Allowlist, snapshot validatsiyasi va tarixiy natijalarni limitda hisoblash. |
| U01 | O'rta | API clientda timeout yo'q; har panel sahifasi classes/tests/results'ni to'liq so'raydi. | Chegaralangan kutish, JSON/HTTP xatolari va sahifaga mos yuklash. |
| L01 | Past | CSP style-src unsafe-inline; ko'rilgan markupda inline style qolmagan. | style-src self bilan cheklash. |
| L02 | Past | Variantlar qayta chizilganda radio fokusini yo'qotadi. | Fokusni qayta tiklash va klaviatura sinovi. |

## Tekshirilgan ijobiy jihatlar

Yangi testlar 1–200 savol, 2–6 variant bilan validatsiya qilinadi. HMAC timing-safe solishtiriladi, token role/exp tekshiriladi. Ochiq test savollarida answer maydoni yo'q. Asosiy foydalanuvchi matnlari escape qilinadi; shu bosqichda tasdiqlangan XSS ekspluatatsiyasi topilmadi. Bir xil natija kalitiga onlyIfNew yozuvi qo'llangan.

Mobilning 320 px, uzun ism/test nomi va sekin internetdagi holatlari tuzatish bosqichidagi brauzer tekshiruviga kiritiladi. Ro'yxatsiz erkin ism rejimi shaxsni tasdiqlamaydi; u nazoratli baholash sifatida talqin qilinmasligi kerak.

Mezonlar: [OWASP sessiyalar](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [autentifikatsiya](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [Netlify atomik yozish](https://docs.netlify.com/build/data-and-storage/netlify-blobs/). Bu to'liq tashqi xavfsizlik sertifikati emas.

## Dinamik tekshiruvdagi qo'shimcha topilma

M01 — **O'rta**. 320 px da bo'shliqsiz 98 belgili test nomi `public/test.html` sarlavhasi/flex qatorini gorizontal kengaytirdi. `scripts/audit-browser.mjs` bilan tasdiqlandi; dalil `artifacts/audit-overflow.json`. Tuzatish: min-width:0, uzun matnni o'rash va timer kengligini saqlash. Bu topilma boshlang'ich statik hisobotdan keyingi brauzer tekshiruvida, CSS tuzatilishidan oldin qayd etildi.

M02 — **O'rta**. `css/base.css`da `button, button:disabled` umumiy xiralik selektori qolgan; shrift, .hidden va focus qoidalari `components/form.css`ga ko'chgan, lekin styles.css uni import qilmagan. Dalil: audit skrinshotlarida serif matn, barcha tugmalar xira va roster yashirish qoidasi yo'q. Tuzatish: reset/typography'ni base'ga, faqat forma qoidalarini form.css'ga ajratish va importni ulash; brauzerda computed font/focus va yashirishni sinash.
