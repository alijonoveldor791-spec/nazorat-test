# 1.4-bosqich: test uchun umumiy 6 xonali kod

Sana: 2026-10-31. Holat: tahlil va talablar loyihasi; amalga oshirilmagan.

Yangilanish (A topshirig‘i, 2026-10-31): foydalanuvchi kodni test saqlangandan keyin, testlar ro‘yxatida va reload’dan keyin o‘z maktabi adminiga qayta ko‘rsatishni talab qildi. Shu qoida oldingi faqat bir marta ko‘rsatish talabini almashtiradi. Kod qiymati shifrlangan saqlanadi, public javobga qo‘shilmaydi. A implementatsiyasi va bajarilmagan B/C qismlari [hisobotda](../implementation/test-codes-stage-a.md) ajratilgan.

## 1. Asosiy qoida

**TC-01:** bitta testning barcha qatnashchilari ayni paytda bitta umumiy koddan foydalanadi. O‘quvchiga alohida kod, profil, login yoki parol yaratilmaydi. Kirish ma'lumotlari: maktab IDsi, testning umumiy kodi, sinf, ism va familiya.

Ushbu hujjat [student-access.md](student-access.md) ichidagi umumiy kod formati va hayot sikliga oid ochiq savollarni aniqlashtiradi. [school-id.md](school-id.md) maktab IDsi qoidalari va [roles.md](roles.md) maktablararo izolyatsiya talablari saqlanadi. Ismdoshlar va inson darajasidagi urinish limiti 1.3-bosqichdagi ochiq qaror bo‘lib qoladi.

## 2. Mavjud mexanizmlar va zid joylar

| Manba | Amaldagi holat | Talabga zid yoki yetishmayotgan qism |
| --- | --- | --- |
| [student-code.mjs](../../server/lib/student-code.mjs) | Har o‘quvchiga 8 tasodifiy baytdan 16 belgili hex kod; bo‘sh joy/defislar olib tashlanadi | Umumiy 6 raqamli test kodi emas; format va kodning egasi boshqa |
| [validate.mjs](../../server/lib/validate.mjs) | Sinf rosterida `accessCode` yaratiladi yoki saqlanadi | O‘quvchi uchun yangi shaxsiy kod yaratish taqiqlanishi kerak |
| [student-access-service.mjs](../../server/services/student-access-service.mjs) | Admin sinflarni o‘qiganda yetishmayotgan shaxsiy kodlar to‘ldiriladi | O‘qish orqali ham shaxsiy kod yaratilmasligi kerak |
| [index.html](../../public/index.html), [home.js](../../public/js/student/home.js) | Rosterli sinf uchun shaxsiy kod talab qilinadi va `studentCode` yuboriladi | Barcha sinflarda umumiy test kodi va ism-familiya ishlatilishi kerak |
| [student-codes.js](../../public/js/teacher/student-codes.js), [classes.js](../../public/js/teacher/classes.js) | Admin shaxsiy kodlarni ko‘radi va tarqatadi | Yangi oqimda testning bitta umumiy kodi boshqariladi |
| [attempt-service.mjs](../../server/services/attempt-service.mjs) | Test IDsi bilan boshlaydi; roster bo‘lsa kod o‘quvchiga solishtiriladi | Maktab + umumiy kod orqali testni aniqlash va mustaqil kod holati yo‘q |
| [test-service.mjs](../../server/services/test-service.mjs), [public tests route](../../server/routes/public/tests.mjs) | Faol test savollari ID bilan olinadi; alohida test kodi modeli/API yo‘q | Test IDsi umumiy kod tekshiruvini chetlab o‘tmasligi kerak |
| [test-status.mjs](../../server/lib/test-status.mjs) | Test faolligi va jadvali tekshiriladi | Testning holati bilan kirish kodining holati ajratilmagan |
| [draft-service.mjs](../../server/services/draft-service.mjs), [scoring-service.mjs](../../server/services/scoring-service.mjs) | Draft/resume test faolligini talab qiladi; submit ham test faolligi/sinf biriktirilishini tekshiradi | Kodni bekor qilishni testni o‘chirish/to‘xtatish bilan bajarish boshlangan urinishni to‘sishi mumkin |
| [attempt-access-service.mjs](../../server/services/attempt-access-service.mjs) | Token va brauzer egaligi bor; joriy jadval tugashi urinish muddatini qisqartirishi mumkin | Kod bekor bo‘lishi bu tekshiruvlarga qo‘shilib, eski urinishni to‘xtatmasligi kerak |
| [rate-limit.mjs](../../server/lib/rate-limit.mjs), [attempt-service.mjs](../../server/services/attempt-service.mjs) | Start IP bo‘yicha 240 so‘rov/minut bilan cheklangan | 6 raqamli kodni tekshirish uchun maxsus xato hisoblagichlari, maktab doirasi va tarqoq hujum kuzatuvi yo‘q |

`test-code`/`testCode` uchun alohida amaldagi mexanizm server kodida aniqlanmadi. Oldingi hujjatlar uni faqat talab sifatida tasvirlaydi. Mavjud audit va brauzer testlari shaxsiy kodga tayanadi: [audit-api.mjs](../../scripts/audit-api.mjs), [audit-browser.mjs](../../scripts/audit-browser.mjs), [verify.mjs](../../scripts/verify.mjs), [browser-test.mjs](../../scripts/browser-test.mjs). Keyingi implementatsiyada ular yangi oqimga moslanadi; eski auditlar tarixiy dalildir.

## 3. Format, yaratish va bog‘lanish

- **TC-02:** kod JSON va omborda son emas, satr bo‘ladi. Kanonik format `^[0-9]{6}$`; ASCII raqamlardan aniq 6 ta. `004271` yaroqli; boshidagi nollar saqlanadi. Son ko‘rinishidagi body, 5/7 raqam, harf, ichki bo‘sh joy, defis va boshqa yozuvdagi raqamlar rad etiladi. UI nusxalashdagi tashqi bo‘sh joyni olishi mumkin, server faqat kanonik satrni qabul qiladi.
- **TC-03:** server kriptografik tasodifiy butun sonni `0..999999` oralig‘ida yaratib, 6 belgiga nol bilan to‘ldiradi. `Math.random`, ketma-ket raqam, test nomi yoki eski shaxsiy koddan hosil qilish ishlatilmaydi. Bu yerda 1 000 000 ehtimol bor; kod mustaqil kuchli autentifikatsiya vositasi emas.
- **TC-04:** kod yozuvi o‘zgarmas `schoolId`, `testId`, texnik `codeId`, `version`, holat va server vaqtlariga bog‘lanadi. Kod `studentId`, ism yoki muayyan brauzerga bog‘lanmaydi. Bir test bir nechta sinfga biriktirilsa ham barcha qatnashchilarga ayni kod beriladi.
- **TC-05:** `(schoolId, kod)` bitta testni aniq topadi. Bir maktabda bir xil raqamli kod boshqa testga berilmaydi; bekor qilingan qiymat ham shu maktabda rezervda qoladi. Boshqa maktabda bir xil raqamlar bo‘lishi mumkin, chunki maktab IDsi majburiy.
- **TC-06:** rezerv atomik `onlyIfNew` yoki teng kuchli shart bilan olinadi. Parallel yaratish/aktivlashtirish bir kodni ikki testga yoki bitta testga ikki faol kodga aylantirmaydi. To‘qnashuvda qayta nomzod tanlanadi; cheklangan urinish tugasa xato beriladi, mavjud kod ustidan yozilmaydi. Maktabning kod maydoni tugasa yaratish rad etiladi; yashirin qayta foydalanish yo‘q.

Yaratish/takror yuborish idempotent bo‘ladi. Kod indeksi va testning joriy kod ko‘rsatkichi alohida yozuvlarda bo‘lsa, umumiy tranzaksiya mavjud deb hisoblanmaydi: rezerv, versiyalash va uzilishdan tiklash tartibi keyingi repository loyihasida aniq beriladi. Resolver faqat testning joriy versiyasiga mos, to‘liq yakunlangan faol bog‘lanishni qabul qiladi; yarim yozilgan rezerv kirish bermaydi.

## 4. Faollashtirish va bekor qilish

| Holat / o‘tish | Qoidasi | Yangi urinish | Boshlangan urinish |
| --- | --- | --- | --- |
| `inactive` | Kod yaratilgan, lekin admin faollashtirmagan | Taqiqlanadi | Ta'sir qilmaydi |
| `inactive → active` | Faqat o‘z maktabining admini; test/sinf/maktab bog‘lanishi va kod rezervi tekshiriladi | Test faolligi, jadvali va boshqa kirish shartlari bajarilsa ruxsat | Ta'sir qilmaydi |
| `active → revoked` | Admin bekor qiladi; `revokedAt` va yangi versiya serverda yoziladi | Bekor qilish kuchga kirgach taqiqlanadi | O‘z server muddatigacha davom etadi |
| Jadval tugashi | Faol kodning o‘zi jadvalni uzaytirmaydi | Taqiqlanadi | O‘z muddati bo‘yicha yakunlanadi |
| Kodni almashtirish | Eski kod bekor qilinadi; yangi qiymat barcha qatnashchilarga umumiy bo‘ladi | Faqat yangi faol kod bilan | Eski kod bilan boshlangan urinish saqlanadi |

**TC-07:** bekor qilish qaytmas: `revoked → active` o‘tishi yo‘q. Yangi kirish uchun yangi qiymat yaratiladi va faollashtiriladi. Test nusxalanganda eski kod nusxalanmaydi; nusxa uchun alohida nofaol kod kerak. Jadval boshlanmaganida yoki test yopiq bo‘lsa, kod `active` bo‘lishining o‘zi kirish bermaydi.

**TC-08:** kodni bekor qilish testni o‘chirish, savollarni almashtirish, sinfni uzish, tokenlarni bekor qilish yoki testni to‘xtatish orqali bajarilmaydi. Bu mustaqil kirish amali. Testni favqulodda to‘xtatish va maktabni bloklashning faol urinishlarga ta'siri alohida siyosat bo‘lib qoladi; UI ularni kodni bekor qilish bilan aralashtirmaydi.

## 5. Yangi va oldin boshlangan urinish chegarasi

**TC-09:** yangi urinishni qabul qilishda server maktab IDsi, joriy kod qiymati/versiyasi/holati, test jadvali, test–sinf–maktab mosligi va ism-familiyani tekshiradi. Oldindan kodni muvaffaqiyatli tekshirish yoki savollarni ko‘rish keyin bekor qilingan kod bilan yangi urinishga ruxsat bermaydi.

Bekor qilish bilan start parallel kelganda qat'iy tartib kerak: serverdagi bitta atomik qabul nuqtasi kodning joriy versiyasi va urinish rezervini birgalikda tekshiradi. Bekor qilish shu nuqtadan oldin yakunlansa start rad etiladi; start oldin qabul qilingan bo‘lsa u boshlangan urinishdir. Faqat kodni o‘qib, keyin mustaqil urinish yozish bu talabni bajarmaydi. Lokal lock yetarli emas; production workerlar orasida shartli yangilash/CAS va idempotent rezervga asoslangan protokol talab qilinadi. Bekor qilish javobi qaytgach, eski versiya bilan yangi qabul sodir bo‘lmaydi.

**TC-10:** qabul qilingan urinishda `schoolId`, `testId`, `classId`, `codeId`/versiya, `acceptedAt`, server deadline, savollar nusxasi va brauzer egaligi saqlanadi. Raqamli kod urinish/natija yoki token tarkibiga ko‘chirilmaydi. Bekor qilish ushbu dalil va deadline'ni o‘zgartirmaydi.

- Draft/resume/submit faqat urinish tokeni, brauzer egaligi va saqlangan maktab bog‘lanishi orqali tekshiriladi; umumiy kodni qayta kiritish talab qilinmaydi.
- Mavjud urinishning idempotent qayta javobi yangi urinish yaratmaydi; u faqat o‘sha texnik egaga beriladi. Kod bekor qilingandan keyin umumiy kod va ism bilan begona urinishni topish mumkin emas.
- Urinish muddati boshlash paytida test vaqt limiti va jadval tugashining eng ertasi sifatida belgilanadi; ikkalasi ham yo‘q bo‘lsa mavjud 24 soatlik server chegarasi saqlanadi. Kodni bekor qilish bu muddatni qisqartirmaydi yoki uzaytirmaydi.
- Muddatdan keyin yangi javoblar bahoga qo‘shilmaydi; faqat serverga avval yetgan oxirgi draft yakunlanadi. Recovery tokenining uzoqroq muddati test vaqtini uzaytirmaydi.
- Tayyor natijani olish va takror submit bitta natijani qaytarishda davom etadi; kodni bekor qilish natijani o‘chirmaydi. Kalit faqat amaldagi natija ko‘rsatish siyosatiga muvofiq beriladi.

## 6. Taxmin qilish va ma'lumot sizishiga qarshi talablar

**TC-SEC-01:** kodni tekshirish va start serverda cheklanadi; brauzer hisoblagichi yetarli emas. Har bir talabdagi `schoolId` o‘zgarishi umumiy IP hisoblagichini yangidan boshlamaydi. Resolver va start alohida cheklanadi, shu bilan birga ikkalasi umumiy noto‘g‘ri urinish hisoblagichini ishlatadi.

Boshlang‘ich, keyingi yuklama sinovida tekshiriladigan konfiguratsiya:

| Doira | Taklif etilgan cheklov / amal |
| --- | --- |
| IP bo‘yicha barcha kod tekshirish/start so‘rovlari | 240/minut umumiy kirish chegarasi; muvaffaqiyatlilar ham hisoblanadi |
| IP + maktab bo‘yicha noto‘g‘ri kod urinishlari | 10 ta / 5 minut; keyin shu doirada oynaning qolgan vaqtiga 429 |
| IP bo‘yicha maktablararo noto‘g‘ri urinishlar | 30 ta / 5 minut; maktab IDsini almashtirish bilan chetlab o‘tilmaydi |
| Maktab bo‘yicha ko‘p IPdan xatolar | 300 ta / 5 minutda admin uchun ogohlantirish va qo‘shimcha manba bo‘yicha sekinlashtirish; test/kodni avtomatik butunlay bloklamaydi |
| Rad etilgan so‘rov | `Retry-After` va tushunarli kutish xabari; umumiy hisoblagichlarni tozalash uchun ism/brauzer qiymati yetarli emas |

Bu qiymatlar inson darajasidagi urinish limiti emas. Maktabdagi ko‘p o‘quvchi bitta tashqi IPdan kirishi mumkin: muvaffaqiyatli ommaviy kirish va NAT sharoiti sinovdan o‘tishi shart. Oddiy muvaffaqiyatli so‘rov hujumchining xato hisoblagichini nolga tushirmaydi. IP manbasi ishonchli platforma kontekstidan olinadi; mijozning ixtiyoriy headeriga ishonilmaydi. Hisoblagichlar atomik va muddati cheklangan; tasodifiy maktab IDlari bilan omborni cheksiz ko‘paytirish ham cheklanadi.

- **TC-SEC-02:** tarqoq yoki sekin hujumni bitta IP limiti to‘liq to‘xtatmaydi. Xato tezligi kuzatiladi, admin zaruratda umumiy kodni bekor qilib yangisini beradi; bu allaqachon boshlangan urinishlarni uzmaydi.
- **TC-SEC-03:** kod faqat POST body orqali TLS bilan yuboriladi; URL, analytics, log, xato matni va ommaviy test metadata'siga qo‘shilmaydi. Xato holatlari umumiy xabar bilan javoblanadi; maktab/test borligi yoki kodning bir qismi ochilmaydi.
- **TC-SEC-04:** oddiy hash 6 raqamni ombor nusxasidan tekshirib chiqishga yo‘l qo‘yishi mumkin. Serverdagi maxfiy kalit bilan maktab doirasiga bog‘langan HMAC indeks/verifier taklif etiladi; kalit ombor va Gitdan tashqarida saqlanadi. Kod mavjudligi tekshiruvi vaqt farqlarini imkon qadar kamaytiradi. Verifier admin paroli yoki token verifieri sifatida ishlatilmaydi.
- **TC-SEC-05:** kod o‘z maktabi adminiga saqlashdan keyin, testlar ro‘yxatida va reload’dan keyin ko‘rsatiladi/nusxalanadi; omborda shifrlangan saqlanadi. Boshqa rol yoki public API ochiq kodni olmaydi. Kalitni almashtirish uchun indeks va shifrlangan qiymat migratsiyasi alohida bajariladi; mavjud qiymatlar kalit xatosida qayta yaratilmaydi.
- **TC-SEC-06:** maktab admini faqat o‘z maktabi test kodini yaratadi, faollashtiradi va bekor qiladi. Bosh adminning maktab boshqaruvi avtomatik ravishda barcha test kodlarini olish vakolatini bermaydi. Auditda admin, maktab/test, amal va vaqt bor; kod/token yo‘q.
- **TC-SEC-07:** kod testda qatnashishga ruxsat beradi, shaxsni tasdiqlamaydi. U roster, shaxsiy kodlar, admin API, boshqa qatnashchi urinishlari yoki natijalarini ochmaydi. Savollarni ID bilan olishning eski yo‘llari yangi tekshiruvni chetlab o‘tmaydi.

## 7. Eski ma'lumotlar va ochiq qarorlar

Mavjud IDlar, shaxsiy kodlar, urinishlar va natijalar ushbu bosqichda o‘chirilmaydi yoki o‘zgartirilmaydi. Keyingi migratsiyada eski `accessCode` umumiy kodga aylantirilmaydi va yangi shaxsiy kod yaratilmaydi. Eski testga maktab egaligi aniq bog‘langach alohida nofaol umumiy kod beriladi; admin faollashtiradi. Eski boshlangan urinishlar ishonchli bog‘lanishi va token/egalik dalili bilan davom etadi, yangi umumiy kod ulardan talab qilinmaydi.

Yangi kod bilan bog‘liq saqlash/zaxira formati versiyalanadi; rezerv va bekor qilingan holat saqlanadi. Eski zaxirani tiklash bekor qilingan kodni qayta faollashtirmaydi. Kodning xom qiymati oddiy zaxiraga kiritilmaydi; kalitga bog‘liq verifier/indeksni boshqa muhitga ko‘chirish tartibi alohida hal qilinadi.

Ochiq qarorlar: test/maktabni favqulodda bloklash va jadvalni keyin o‘zgartirishning faol urinishlarga ta'siri; HMAC kalitini aylantirish va disaster recovery; maktab miqyosidagi uzoq muddatli kod rezervlari sig‘imi; NAT uchun limitlarni yuklama sinovidan keyin yakunlash; 1.3-bosqichdagi ismdoshlar va akkauntsiz qayta topshirish siyosati. Bular kodni bekor qilishning TC-09/TC-10 kafolatlarini o‘zgartirmaydi.

## 8. Keyingi implementatsiya uchun qabul mezonlari

| Ssenariy | Kutiladigan natija |
| --- | --- |
| `004271`, son `4271`, 5/7 belgi, harf, defis va boshqa raqam yozuvi | Faqat aniq 6 ta ASCII raqamdan iborat satr qabul qilinadi |
| Bir testga turli sinf va ko‘p qatnashchi kiradi | Bitta umumiy kod ishlaydi; shaxsiy kod yaratilmaydi/so‘ralmaydi |
| Boshqa maktab/sinf/test IDsi aralashtiriladi | Begona ma'lumot ochilmaydi; start rad etiladi |
| Bir maktabda parallel kod yaratish/to‘qnashuv | Kod ikki testga berilmaydi; bitta testda ikki faol kod bo‘lmaydi |
| Nofaol kod, jadvaldan oldin/keyin, yopiq test | Yangi urinish yo‘q |
| Kod tekshirildi, keyin bekor qilindi, so‘ng start yuborildi | Oldingi tekshiruv startga ruxsat bermaydi |
| Start va bekor qilish parallel bajarildi | Atomik qabul tartibi saqlanadi; bekor qilish yakunidan keyin yangi eski-versiyali qabul yo‘q |
| Kod bekor qilindi/almashtirildi, eski egasi draft/resume/submit qildi | Qabul qilingan urinish belgilangan muddatigacha ishlaydi; eski kod bilan yangi urinish yo‘q |
| Muddat tugadi yoki submit qayta yuborildi | Faqat serverdagi avvalgi javoblar baholanadi; bitta natija |
| Kodlar ko‘p IP yoki ko‘p maktab bilan taxmin qilindi | Limit/kuzatuv ishlaydi; 429 + Retry-After; hujum barcha sinfni doimiy bloklamaydi |
| Bir IPdan sinfning to‘g‘ri kodli ommaviy kirishi | Yuklama/NAT sinovida asosli sig‘im tekshiriladi; xato limiti muvaffaqiyatli so‘rov bilan tozalanmaydi |
| Public API, log, oddiy zaxira va begona admin so‘rovi | Kod, verifier, roster, javob kaliti va begona natija sizmaydi |
| Eski zaxira va oldin boshlangan urinish tiklandi | ID/ball/muddat/egalik saqlanadi; bekor qilingan kod qayta ochilmaydi |

Bu mezonlar hali bajarilgan testlar emas. Dastur kodi o‘zgarmadi; ushbu bosqich faqat talab hujjatini tayyorlaydi.

## 9. Ushbu bosqich tekshiruvlari

- `npm test`: 54/54 test o‘tdi; `npm run check`: o‘tdi. Bular mavjud dastur tekshiruvlari, yangi kod mexanizmi ishlayotganini bildirmaydi.
- Hujjatdagi mahalliy manba havolalari mavjud; yangi faylning `git diff --no-index --check` tekshiruvi bo‘sh joy xatolarisiz o‘tdi. Hujjat 250 qatordan kam.
- Avval ishga tushirilgan lokal loyiha http://localhost:8888 manzilida tekshirildi: HTTP 200. Server ishlab turibdi.
- Faqat `docs/requirements/test-code.md` qo‘shildi. Mavjud IDlar, kodlar va dastur fayllari o‘zgartirilmadi. Xavfsizlik/recovery kodi o‘zgarmagani uchun API/auth/brauzer auditlari bajarilmadi; keyingi implementatsiyada ular talab etiladi.
