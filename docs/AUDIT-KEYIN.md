# Mustaqil audit: tuzatishdan keyingi hisobot

Sana: 2026-10-31. Dastlabki holat: `8afe461`. [Tuzatishdan oldingi hisobot](AUDIT-OLDIN.md) avval chatda berildi, keyin alohida `87d92ea` commitida saqlandi. M01/M02 dinamik tekshiruv vaqtida, tegishli CSS tuzatilishidan oldin qayd etilgan.

Natija: **3 ta yuqori, 11 ta o’rta topilma tuzatildi**. Dastlabki ikki past topilma ham tuzatildi. Quyidagi xulosa lokal kod va Netlify Dev sinovlariga tegishli; production konfiguratsiyasi yoki tashqi pentest bo’yicha sertifikat emas.

## Har topilmaning yakuniy holati

| ID / daraja | Qayerda | Nima tuzatildi | Dalil |
| --- | --- | --- | --- |
| S01 / yuqori | `services/auth-service.mjs`, `repositories/sessions-repo.mjs` | JWTga o’xshash token ichida parol SHA-256 izi yo’q. Tasodifiy version/jti va server sessiyasi ishlaydi; eski tokenlar rad etiladi. | audit-api S01, token/parol unit testlari |
| S02 / yuqori | `lib/student-code.mjs`, `student-access-service.mjs`, `attempt-service.mjs`, student home | Ochiq roster yopildi. Ro’yxatli sinf shaxsiy 64-bit tasodifiy kod bilan kiradi; faol urinish boshqa brauzer kalitiga berilmaydi. Kodlar faqat admin panelida. | audit-api: ID/kod/egalik; audit-browser: noto’g’ri kod, yopiq panel |
| S03 / yuqori | `services/student-result-service.mjs` | Saqlangan publicResult qaytarilmaydi. Har retry/resume hozirgi showAnswers siyosatini tekshiradi, kalit faqat ruxsat bilan quriladi. | Kalitni o’chirib replay/resume qilish sinovi |
| S04 / o’rta | auth-service, login-policy, password, core/auth | Server logout va parol o’zgarganda revokatsiya. Boshlang’ich parol 12–200 belgi. Asinxron scrypt; cheklov qimmat hisoblashdan oldin. | audit-auth: yangi/eski parol, eski token, logout; 5 urinish/15 daqiqa unit testi |
| S05 / o’rta | rate-limit, http, router | IP va urinish limitlari ajratildi. Submit 600/min/IP va 20/min/urinish; haqiqiy Retry-After. JSON oqimi bayt bilan 4 MB’da to’xtatiladi. | 429 header API sinovi, UTF-8 hajm/JSON/tur testlari, 40 parallel yuborish |
| R01 / o’rta | draft, completion, attempt-access, submission xizmat/modullari | Monoton server drafti, qat’iy muddat, server snapshot bilan yakunlash, 7 kunlik natija tiklash, qayta yuborish va qisman yozuvni tiklash. Joy yetmasa saqlash holati yolg’on yashil bo’lmaydi. | API: kech/stale draft, muddat, expired token; browser: offline/reload/retry; quota unit testi |
| R02 / o’rta | test-service, draft-validate, server-clock, timer | Bo’sh eski test ochilmaydi; buzilgan draft/natija filtrlanadi. Taymer server vaqti va performance.now asosida. | Bo’sh test/draft/result unitlari; 10 daqiqa noto’g’ri soat bilan brauzer sinovi |
| R03 / o’rta | tab-guard, test-state, home, attempts repository | Bir oynaga egalik, eski draft almashtirilishini tasdiqlash, faol boshqa oynada yangi draftni bloklash. Bir kalitda atomik create; turli parallel javoblardan bitta natija. | 4 start/2 turli submit API; ikki oyna va draft ustiga yozish brauzer testi |
| T01 / o’rta | components/modal, class-editor, test-form, test-import | Forma server muvaffaqiyatigacha ochiq. Xatoda maydonlar saqlanadi; native Enter boshqariladi, preview almashtirishi tasdiqlanadi. Test yaratish requestId bilan idempotent. | Server commitidan keyin javobni uzish → formani saqlash → retry → bitta test; sinf dublikat xatosi |
| T02 / o’rta | class-progress, classes, teacher/shell | Har test uchun topshirmaganlar alohida. Avtoyangilash qidiruv qiymati, kursor va fokusni saqlaydi. | Per-test unit; DOM yangilashda qidiruv/fokus brauzer testi |
| B01 / o’rta | lib/backup-validate, backup-service, attempt-service | Allowlist; null, ball/tartib va takror kodlar tekshiruvi. sourceOptions saqlanadi. Yangi muhitga tiklangan yakuniy natija ham urinish limitiga kiradi. | Restore/re-take API; injected publicResult, noto’g’ri ball/tartib/kod unitlari |
| U01 / o’rta | core/api-client, teacher/data, home | 15 s timeout, noto’g’ri JSON xatosi, qayta yuklash tugmasi va saqlanadigan editor. Test/sozlama sahifasi to’liq natijalar tarixini yuklamaydi. | Timeout/HTML200 unitlari; 200 ms kechikish, 128/64 KB/s bilan brauzer; settings request tekshiruvi |
| M01 / o’rta | css/pages/content-fit.css | Uzun uzluksiz test nomi va matn 320 px’dan gorizontal chiqmaydi. Flex min-width va matn o’ralishi tuzatildi. | 98 belgili nom, savol/variantdagi HTML matni, overflow sinovi |
| M02 / o’rta | css/base.css, components/form.css, styles.css | Bazaviy shrift/.hidden/fokus qaytarildi; forma importi ulandi. Faqat disabled tugma xira. | Computed system-ui/.hidden/opacity va fokus; yorug’/qorong’i skrinshotlar |
| L01 / past | netlify.toml | style-src unsafe-inline olib tashlandi. | CSP va ishlayotgan to’liq UI |
| L02 / past | student/test.js, question-map | Tanlangan radio qayta chizilgach fokus tiklanadi. | ActiveElement va 3 px outline brauzer tekshiruvi |

## Qayta bajarilgan tekshiruvlar

| Buyruq | Natija |
| --- | --- |
| `npm test` | **48/48**, 0 xato |
| `npm run check` | O’tdi: barcha manba fayllari ≤250 qator; API 4 qator; qatlam va inline/havola qoidalari |
| `npm run build` | O’tdi; statik tekshiruv, kompilyatsiya yo’q |
| `npm run verify` | **9 ta asosiy oqim**, jumladan 20/20 va panel/tahlil |
| `npm run test:audit:api` | **7 ta audit oqimi**, kalit, kod, limit, tiklash va parallel yozish |
| `npm run test:audit:auth` | **3 ta parol/revokatsiya tekshiruvi**; vaqtinchalik parol asl holiga qaytarildi |
| `npm run test:browser` | **9 responsive/a11y audit**, 390/1280, light/dark, 0 JS xato |
| `npm run test:audit:browser` | **8 audit oqimi, 8 skrinshot**; 320/390/1280, slow/offline, XSS, ikki oyna, forma xatosi; 0 JS xato |
| `npm run test:load` | **40/40 muvaffaqiyat, 40 saqlangan natija, 0 xato** |
| `git diff --check` | O’tdi |

So’nggi lokal yuklama: umumiy **4306 ms**, p50 **3283 ms**, p95 **4243 ms**. Bu production tezligi kafolati emas. Dalillar `artifacts/audit-unit.txt`, `audit-api.json`, `audit-auth.json`, `audit-browser.json`, `browser-audit.json`, `integration.json`, `load-test.json` va skrinshotlarda; Gitga kiritilmaydi.

XSS uchun `<img onerror>` va `<svg onload>` savol/variant sifatida ko’rsatildi: matn bo’lib qoldi, script ishlamadi. Bu barcha mumkin bo’lgan XSS yo’llari mutlaq yo’qligini isbotlamaydi.

## Muhim amaliy o’zgarishlar

1. Eski admin tokenlari yaroqsiz: qayta kiring. TEACHER_PASSWORD 12–200, TOKEN_SECRET kamida 32 belgi bo’lsin. **Chiqish** endi serverdan ham chiqaradi.
2. Ro’yxatli sinflar uchun **Sinflar → Shaxsiy kirish kodlari**dan kodlarni alohida tarqating. Avvalgi ism tanlash o’rniga shaxsiy kod kiritiladi. Ochiq mashq sinfi shaxsni tasdiqlamaydi.
3. Internet uzilsa UI qayerda saqlanganini aytadi. Faqat serverga muddatida yetgan javoblar yakuniy bahoga kiradi. Lokal nusxa va tiklash imzosi test vaqtini uzaytirmaydi.
4. Test saqlash xatosida formani yopmang: xatoni tuzatib qayta saqlang. Test yaratishda takror so’rov yangi nusxa chiqarmaydi.
5. O’quvchi kodlari sinf zaxirasida bor, shuning uchun JSONni maxfiy saqlang. Sessiyalar va tugallanmagan urinishlar zaxiraga kirmaydi. Tayyor natijalarning limit hisobi tiklashda saqlanadi.

## Chegaralar va qolgan xavflar

- Production deploy, Netlify hisob ruxsatlari, tashqi WAF va distributed pentest bajarilmadi. Lokal funksional/xavfsizlik regressiyasi tekshirildi.
- Server hech qachon olmagan oflayn javoblarni muddatdan keyin ishonchli baholash mumkin emas; ular qurilmada qoladi. Muddatdagi yakunlash navbatdagi natija/tiklash so’rovida, online klientda esa taymer so’rovida bajariladi; alohida background scheduler yo’q.
- Oldin ruxsat bilan berilgan javobni keyinchalik foydalanuvchi xotirasi/nusxasidan qaytarib bo’lmaydi; yangi API so’rovlarida qayta berilishi to’xtatiladi.
- Ro’yxatsiz erkin ism rejimi nazoratli shaxsiy imtihon emas. Boshqa brauzerda davom ettirish avtomatik yoqilmagan. Qurilmadagi ma’lumotlarni begonaga bermang.
- Ko’p yozuvli restore umumiy tranzaksiya emas, 4 MB import chegarasi bor. Katta hajm, brauzerlarning barcha versiyalari va production tarmoq yuklamasi alohida tekshirilishi kerak.
- Tekshiruvda paydo bo’lgan bo’sh, ulanmagan root `css/styles.css` yo’qotilmadi: `.local/unreferenced-css/styles.css`ga saqlandi. Ishlaydigan yagona CSS kirishi `public/css/styles.css`.

Tasdiqlangan yuqori/o’rta topilmalar bo’yicha ochiq qoldirilgan ish yo’q. Bu chegaralar yakuniy xulosani “har qanday sharoitda mutlaq xavfsiz” deb talqin qilmaslik uchun yozildi.
