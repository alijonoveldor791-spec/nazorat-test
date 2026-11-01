# 1.3-bosqich: o‘quvchining akkauntsiz kirishi

Sana: 2026-10-31. Holat: talab va loyiha hujjati; kodga tatbiq etilmagan.

## 1. Asosiy qoida va oldingi talablarni aniqlashtirish

**SA-01:** o‘quvchiga shaxsiy profil, login, parol yoki shaxsiy kirish kodi yaratilmaydi. Testda qatnashish uchun faqat quyidagi foydalanuvchi ma'lumotlari olinadi:

- maktab IDsi;
- test uchun barcha qatnashchilarga umumiy kod;
- sinfi;
- ismi va familiyasi.

Adminlarning hisob va sessiyalari bu qoidaga kirmaydi. O‘quvchining ism-familiyasi test ishtiroki yozuvidir; undan alohida profil yoki maktablararo shaxsiy tarix yaratilmaydi.

Ushbu yangi qoida [roles.md](roles.md) va [school-id.md](school-id.md) ichidagi maqsadli oqimda shaxsiy o‘quvchi kodi talab qilinishi, yangi kod yaratish va kodlarni boshqarish vakolatiga oid bandlarni almashtiradi. U hujjatlardagi amaldagi kod tavsifi tarixiy fakt bo‘lib qoladi. Doimiy maktab IDsi, maktablararo izolyatsiya va mavjud IDlarni saqlash talablari o‘z kuchida qoladi. Oldingi hujjatlar bu bosqichda tahrirlanmaydi.

## 2. Mavjud kirish tizimi

| Qism | Amaldagi xatti-harakat | Yangi talab bilan farqi |
| --- | --- | --- |
| O‘quvchi akkaunti | Ro‘yxatdan o‘tish, login va parol yo‘q | Akkauntsiz ishlash saqlanadi |
| Boshlang‘ich sahifa | Umumiy sinflar va sinfga tegishli faol testlar olinadi | Avval maktab IDsi va umumiy test kodi tekshirilishi kerak |
| Ro‘yxatli sinf | `hasRoster` rost bo‘lsa, ism/familiya yashiriladi va shaxsiy kod majburiy qilinadi | Barcha sinflarda ism/familiya kiritiladi; shaxsiy kod talab qilinmaydi |
| Ro‘yxatsiz sinf | Ism va familiya erkin kiritiladi | Bu usul faqat ro‘yxatsiz sinfga xos bo‘lmaydi; maktab va test kodi bilan chegaralanadi |
| Boshlash | Server kodni sinfdagi `accessCode` bilan solishtirib o‘quvchini tanlaydi | Roster orqali shaxsni tanlash o‘rniga kiritilgan ism/familiya ishtirok ma'lumoti bo‘ladi |
| Identifikatsiya | `hash(test.id + class.id + norm(familiya + ism))` urinishlarni guruhlaydi | Ism insonning noyob identifikatori emas; to‘qnashuv siyosati ochiq |
| Davom ettirish | Urinish tokeni, brauzer kaliti, draft versiyasi va server muddati ishlaydi | Texnik urinish himoyasi saqlanadi, shaxsiy kirish kodiga aylantirilmaydi |
| Natija | Urinishdan test/sinf/ism olinib serverda baholanadi; `schoolId` yo‘q | Natijaga server tasdiqlagan maktab bog‘lanishi ham qo‘shilishi kerak |

Manbalar: [home.js](../../public/js/student/home.js), [attempt-service.mjs](../../server/services/attempt-service.mjs), [attempt-access-service.mjs](../../server/services/attempt-access-service.mjs), [completion-service.mjs](../../server/services/completion-service.mjs), [public routes](../../server/routes/public/).

## 3. Shaxsiy kodga bog‘liq mavjud joylar

Quyidagi ro‘yxat kelajakdagi o‘zgarish doirasini ko‘rsatadi; hozir bu fayllar o‘zgartirilmaydi.

| Joy | Bog‘liqlik | Keyingi implementatsiya talabi |
| --- | --- | --- |
| [public/index.html](../../public/index.html) | `student-code` maydoni va rosterga oid kirish ko‘rsatmalari | Shaxsiy kod maydoni bo‘lmaydi; maktab IDsi, umumiy test kodi, sinf, ism/familiya ishlatiladi |
| [home.js](../../public/js/student/home.js) | `hasRoster` bo‘yicha maydonlar almashadi; `studentCode` start bodyga qo‘shiladi | Roster mavjudligi kirish usulini almashtirmaydi; `studentCode` yuborilmaydi |
| [attempt-service.mjs](../../server/services/attempt-service.mjs) | `identity()` ichida `codeMatches(payload.studentCode, s.accessCode)` | Shaxsiy kod va roster orqali kirishni tekshirish bekor qilinadi |
| [student-code.mjs](../../server/lib/student-code.mjs) | Shaxsiy kod yaratish, normalizatsiya va taqqoslash | Yangi kirish oqimida foydalanilmaydi; umumiy test kodi alohida tushuncha bo‘ladi |
| [validate.mjs](../../server/lib/validate.mjs) | `classValid()` ro‘yxatga `accessCode` yaratadi, saqlaydi va tekshiradi | Yangi o‘quvchi kodi yaratilmaydi; eski formatni o‘qish mosligi alohida saqlanadi |
| [student-access-service.mjs](../../server/services/student-access-service.mjs) | `withCodes()` va `adminClasses()` yetishmayotgan kodlarni admin o‘qishida avtomatik to‘ldiradi | Avtomatik kod yaratish/backfill bo‘lmaydi |
| [classes.js](../../public/js/teacher/classes.js), [student-codes.js](../../public/js/teacher/student-codes.js) | Admin shaxsiy kodlarni ko‘radi va tarqatadi | Yangi oqim uchun shaxsiy kod boshqaruvi/tarqatish bo‘lmaydi |
| [class-service.mjs](../../server/services/class-service.mjs) | Public sinflarda `hasRoster`; roster so‘rovida shaxsiy koddan foydalanish xabari | Roster yopiq qoladi; xabarlar yangi kirish qoidasiga moslanadi |
| [backup-service.mjs](../../server/services/backup-service.mjs), [backup-validate.mjs](../../server/lib/backup-validate.mjs) | Eski roster/kodlar eksport qilinadi; import `classValid()`dan foydalanadi | Eski zaxira mosligi kodni yangi kirish vositasi sifatida faollashtirmaydi yoki yangisini yaratmaydi |
| [class-progress.js](../../public/js/teacher/class-progress.js) | Topshirganlar `studentId` yoki ism orqali rosterga solishtiriladi | Erkin ismni tasdiqlangan roster shaxsi sifatida ko‘rsatmaslik; noaniq moslik alohida bo‘ladi |
| [verify.mjs](../../scripts/verify.mjs), [browser-test.mjs](../../scripts/browser-test.mjs), [audit-api.mjs](../../scripts/audit-api.mjs), [audit-browser.mjs](../../scripts/audit-browser.mjs) | Shaxsiy kod bilan boshlash va kod xatolari tekshiriladi | Keyingi bosqichda akkauntsiz umumiy kod oqimi uchun tekshiruvlar qayta ko‘riladi |
| [models.test.mjs](../../tests/models.test.mjs), [audit-security.test.mjs](../../tests/audit-security.test.mjs), [audit-client.test.mjs](../../tests/audit-client.test.mjs) | Roster, shaxsiy kod yoki rosterga mos progress taxminlari bor | Eski format mosligi va yangi kirish talablari ajratib tekshiriladi |

Hujjatlardagi eski ko‘rsatmalar ham keyin yangilanishi kerak: [README](../../README.md), [o‘qituvchi qo‘llanmasi](../OQITUVCHI-QOLLANMA.md), [arxitektura](../ARCHITECTURE.md), [roles.md](roles.md), [school-id.md](school-id.md). Eski audit hisobotlari tarixiy dalil sifatida saqlanadi.

## 4. Maqsadli akkauntsiz oqim

**SA-02:** maktab IDsi maktabni tanlaydi; umumiy test kodi shu maktabdagi testga qatnashish imkonini tekshiradi. Ularning hech biri individual o‘quvchi shaxsini tasdiqlamaydi.

1. O‘quvchi maktab IDsini va testning umumiy kodini kiritadi. IDli havola maktab maydonini oldindan to‘ldirishi mumkin; umumiy kod URLga joylanmaydi.
2. Server ID formatini, maktab holatini, shu maktabga tegishli test kodini, test holatini va jadvalini tekshiradi. Noto‘g‘ri kombinatsiya himoyalangan tafsilotlarni bermaydigan xabar bilan rad etiladi.
3. Tekshirilgan maktab/test doirasida faqat test biriktirilgan sinflar tanlash uchun beriladi. Boshqa maktab yoki testga tegishli sinf tanlanmaydi.
4. O‘quvchi sinfini tanlaydi, ism va familiyasini kiritadi. Bu barcha sinflarda bir xil; roster borligi qo‘shimcha shaxsiy kod yoki profil talabini tug‘dirmaydi.
5. Boshlash so‘rovida server barcha kirish shartlarini qayta tekshiradi. Oldingi UI tekshiruvi yoki mijoz yuborgan `testId` mustaqil ruxsat dalili emas. Kod testni maktab doirasida yagona aniqlashi kerak; to‘qnashuvda server testni taxminan tanlamaydi.
6. Server alohida urinish yaratadi va uning maktab/sinf/test bog‘lanishini saqlaydi. So‘rov qayta yuborilishi shu boshlash operatsiyasi uchun dublikat urinish yaratmaydi.
7. O‘quvchi javob beradi, draftni saqlaydi va yakunlaydi. Server muddati, monoton draft versiyasi va brauzer egaligi tekshiriladi.
8. Server baholaydi va shu urinishga bitta yakuniy natija saqlaydi. O‘quvchi faqat o‘z urinish natijasini va ruxsat berilgan sharhni oladi.

Urinish uchun avtomatik yaratiladigan token, ichki `attemptId` va brauzer egaligi kaliti texnik himoya vositalaridir: ular o‘quvchiga beriladigan shaxsiy kod, login yoki profil emas, qo‘lda kiritilmaydi va bir nechta test bo‘yicha shaxsni aniqlash uchun ishlatilmaydi. Ularning amal qilish doirasi/muddati cheklangan bo‘lishi kerak. Boshqa qurilmaga o‘tish uchun yangi shaxsiy kod joriy etilmaydi; bunday tiklash siyosati ochiq qarordir.

## 5. Natijani maktab, sinf va testga bog‘lash

**SA-03:** yakuniy bog‘lanish foydalanuvchi yuborgan nomlardan yoki submit bodydan emas, serverda tasdiqlangan urinishdan olinadi.

| Maydon | Ishonchli manba va qoida |
| --- | --- |
| `schoolId` | Kod tekshirilgan maktab yozuvining o‘zgarmas IDsi; urinishda saqlanadi |
| `testId` | Umumiy kod bilan shu maktabda aniqlangan test; `test.schoolId === schoolId` bo‘lishi shart |
| `classId` | Shu maktabga tegishli va testga biriktirilgan sinf; sinf nomi asosiy kalit emas |
| `name`, `surname` | Boshlashda tekshirilgan, tashqi bo‘sh joylari olingan ishtirok matni; tasdiqlangan shaxs deb belgilanmaydi |
| `attemptId` | Serverdagi urinish IDsi; har bir alohida urinishni ismga bog‘lamasdan ajratadi |
| Natija `id`si | Bitta urinishga bitta natija; takror submit o‘sha natijani qaytaradi |
| Test/sinf nomi nusxasi | Tarixiy ko‘rsatish uchun; keyingi nom o‘zgarishi ID va eski ballni o‘zgartirmaydi |
| Ball, javoblar, savollar tahriri, vaqt | Urinish nusxasi, serverga yetgan javoblar va server vaqtidan hisoblanadi |
| `studentId` / `identityKey` | Yangi ishtirok uchun shaxsiy profil yaratilmaydi; eski maydonlar tarixiy moslik uchun saqlanishi mumkin, ism orqali majburiy rosterga bog‘lanmaydi |

Draft, resume, submit va natijani olishda maktab/sinf/test foydalanuvchi body qiymati bilan almashtirilmaydi. Bog‘lanishlarda ziddiyat bo‘lsa amal rad etiladi. Maktab adminining ro‘yxat, tahlil va eksportlari server tasdiqlagan `schoolId` bilan chegaralanadi; ism-familiya faqat ko‘rsatish/qidirish matnidir.

## 6. Bir xil ism-familiya va boshqa ochiq qarorlar

**SA-04 — ochiq qaror:** bir maktabning bir sinfida bir xil ism-familiyali ikki o‘quvchi bo‘lishi mumkin. Ularni bitta inson deb birlashtirish, boshqa o‘quvchining urinishini qaytarish yoki natijasini ochish taqiqlanadi. Har bir urinish alohida texnik IDga ega bo‘ladi; ammo bu ID insonning kimligini tasdiqlamaydi.

| Masala | Hozirgi xavf / hal qilinadigan qaror |
| --- | --- |
| Ismdoshlar | Mavjud hash ikkisini bitta guruhga tushiradi; roster validatsiyasi bir xil ismni ham rad etadi. Alohida qatnashuvlarni ko‘rsatish va admin tomonidan ajratish tartibi belgilanmagan |
| Urinish limiti | Faqat ism bo‘yicha limit ismdoshni bloklashi mumkin; faqat brauzer bo‘yicha limit esa yangi brauzer bilan chetlab o‘tilishi mumkin. Hisobsiz model uchun qoida hali tanlanmagan |
| Qayta topshirish | Ruxsatni ismga emas, aniq natija/urinishga bog‘lash kerak; ruxsatdan qayta kirishda qanday foydalanish shaxsiy kodsiz hal qilinishi zarur |
| Ismni boshqacha yozish | Apostrof, registr, bo‘sh joy va xato yozish qidiruvda normalizatsiya qilinishi mumkin, ammo bu tasdiqlangan yagona shaxsga birlashtirishga asos bo‘lmaydi |
| Boshqa shaxs nomidan qatnashish | Umumiy kod va erkin ism buni ishonchli oldini olmaydi. O‘qituvchi nazorati va shubhali takrorlarni ko‘rib chiqish tartibi kerak |
| Qurilma almashish | Token/egalik yo‘qolsa tiklash yoki yangi urinishga ruxsat berish tartibi aniqlanmagan; ism-familiya orqali natija ochilmaydi |
| Umumiy test kodi | Format, uzunlik, yaratish, bir maktabda noyoblik, muddat, almashtirish/bekor qilish va mavjud urinishlarga ta'siri keyingi kod siyosatida belgilanadi |
| Roster va progress | Ro‘yxat zarurligi, topshirmaganlarni hisoblash va noaniq ism mosliklarini ko‘rsatish aniqlashtiriladi; roster kirish sharti bo‘lmaydi |

Bu masalalar shaxsiy profil yoki shaxsiy kodni yashirin qayta joriy etish orqali hal qilinmaydi. Urinish limiti siyosati tanlanmaguncha yangi model uchun limit inson darajasida kafolatlangan deb aytilmaydi.

## 7. Ma'lumotlar xavfsizligi talablari

- **SA-SEC-01:** barcha ruxsatlar serverda bajariladi. Maktab, test, sinf va urinish IDlarini taxmin qilish/almashtirish boshqa maktab yoki qatnashchi ma'lumotiga ruxsat bermaydi.
- **SA-SEC-02:** testning umumiy kodi faqat ishtirok etish uchun ishlaydi; admin vakolati, roster, umumiy natijalar yoki begona urinishni bermaydi. U bilan butun sinfning natijalarini olish mumkin emas.
- **SA-SEC-03:** umumiy kodlar adminning o‘z maktabi doirasida boshqariladi. Ular GET URL, analytics, konsol yoki server logiga yozilmaydi. Serverda kriptografik verifier saqlash va kodni tekshirish talablari alohida kod siyosatida belgilanadi; qayta ko‘rsatish zarurati ochiq qaror.
- **SA-SEC-04:** kod tekshirish/start so‘rovlariga tezlik cheklovi qo‘yiladi; maktab/test bo‘yicha hujum va bir maktabdagi umumiy IPdan ko‘p o‘quvchi kirishi hisobga olinadi. Xato javoblar kod yoki shaxsiy ma'lumotni oshkor qilmaydi.
- **SA-SEC-05:** ism/familiya matni serverda turi va uzunligi bo‘yicha tekshiriladi; mavjud 60 belgilik chegaralar boshlang‘ich moslik sifatida saqlanishi mumkin. UI matnni escape qiladi; eksportda formula kiritishdan himoya saqlanadi. UI o‘zbek lotinida va `'` apostrofi bilan yoziladi.
- **SA-SEC-06:** ochiq API roster, eski shaxsiy kodlar, natijalar ro‘yxati yoki testning javob kalitini bermaydi. Savollarni olishning eski IDli yo‘llari ham yangi kirish nazoratini chetlab o‘tmaydi.
- **SA-SEC-07:** urinish tokeni va brauzer egaligi draft/resume/submit/natijada tekshiriladi. Maktab IDsi + umumiy kod + ism-familiyani qayta kiritish begona saqlangan urinishni qaytarmaydi. Shaxsni aniqlovchi matn token yoki URLga qo‘shilmaydi.
- **SA-SEC-08:** muddatdan keyin faqat serverga avval yetgan javoblar baholanadi; eski draft yangisini bosmaydi; parallel/takror submit bitta natija beradi. Mavjud server sessiyasi logout va paroldan mustaqil admin tokeni qoidalari saqlanadi.
- **SA-SEC-09:** o‘quvchiga kalit faqat yakundan keyin testning amaldagi ruxsat siyosati bo‘yicha beriladi. Brauzerdagi mahalliy natija/draft ruxsat dalili emas; server natijasi asosiy hisoblanadi.
- **SA-SEC-10:** umumiy qurilmada oldingi qatnashchining ismi, javoblari va natijasini keyingisiga ko‘rsatmaslik uchun yakunlash va mahalliy ma'lumotni tozalash oqimi kerak. Tozalash serverdagi natijani o‘chirmaydi; saqlash muddati va avtomatik tozalash chegaralari aniqlashtiriladi.
- **SA-SEC-11:** maktab doirasi repository so‘rovlari, kesh, indeks, eksport va zaxirada ham saqlanadi. Natijalarni saqlash muddati, admin audit loglari va o‘chirish tartibi alohida qaror; loglarda kod/token va to‘liq javoblar bo‘lmaydi.

## 8. Eski ma'lumotlar bilan moslik va qabul mezonlari

Mavjud `accessCode`, `studentId`, `identityKey`, sinf/test/urinish/natija IDlari bu bosqichda o‘chirilmaydi yoki o‘zgartirilmaydi. Keyingi implementatsiyada eski shaxsiy kodlar yangi kirish uchun talab qilinmaydi va avtomatik yaratilmaydi; eski test/natijalar hamda zaxiralarni o‘qish mosligi saqlanadi. Umumiy test kodi eski shaxsiy koddan hosil qilinmaydi. Maktabga bog‘lash [school-id.md](school-id.md) migratsiya qoidalariga muvofiq bajariladi.

Quyidagi tekshiruvlar keyingi amalga oshirish uchun; hozir bajarilgan deb hisoblanmaydi.

| Ssenariy | Kutiladigan natija |
| --- | --- |
| Rosterli va rostersiz sinfga kirish | Ikkalasida ham maktab IDsi, umumiy test kodi, sinf va ism-familiya yetarli; profil/login/parol/shaxsiy kod yo‘q |
| Admin sinflarni o‘qiydi yoki yangi roster saqlaydi | O‘quvchi shaxsiy kodi yashirin yoki avtomatik yaratilmaydi |
| A maktab kodi bilan B maktab sinf/testi yuboriladi | Amal rad etiladi; begona ma'lumot oshkor bo‘lmaydi |
| Ikki qatnashchi bir xil ism-familiya kiritadi | Begona urinish/natija qaytmaydi; ajratish va limit xatti-harakati 6-bo‘lim qaroridan keyin tekshiriladi |
| Ism yoki kod orqali begona natija so‘raladi | Natija ochilmaydi; faqat urinishga tegishli texnik ruxsat ishlaydi |
| Start/submit parallel yoki qayta yuboriladi | Bitta boshlash operatsiyasiga dublikat urinish, bir urinishga dublikat natija yaratilmaydi |
| Eski draft, boshqa brauzer va kech yuborish | Versiya, egalik va server muddati qoidalari saqlanadi |
| UI/exportga zararli ism matni kiritiladi | Script yoki jadval formulasi sifatida bajarilmaydi |
| Eski zaxira/test/natija o‘qiladi | Eski ID va ballar saqlanadi; shaxsiy kod talabi qayta yoqilmaydi |

## 9. Tekshirish natijalari va ish chegarasi

Mavjud kirish modullari, shaxsiy kod ishlab chiqarish va tekshirish joylari, urinish/natija xizmatlari, tegishli testlar hamda oldingi talab hujjatlari statik tekshirildi. Runtime va haqiqiy Blobs yozuvlari tekshirilmadi. Faqat ushbu hujjat qo‘shildi; kod, eski hujjatlar va mavjud IDlarga tegilmadi. Keyingi bosqich boshlanmaydi.

- Mahalliy manba havolalarining barchasi mavjud; hujjat 250 qatordan kam.
- Yangi fayl uchun `git diff --no-index --check -- NUL docs/requirements/student-access.md` bo‘sh joy xatolarisiz yakunlandi.
- Majburiy `npm test` va `npm run check` mos ravishda `npm.cmd test` va `npm.cmd run check` orqali ishga tushirishga urinildi. Muhitda `npm.cmd` topilmagani uchun ular bajarilmadi; o‘tgan deb hisoblanmaydi.
- Xavfsizlik/recovery kodi o‘zgarmadi; API, auth va brauzer auditlari bajarilmadi. 8-bo‘lim kelajakdagi qabul mezonlari bo‘lib qoladi.

Push oldidan qayta tekshiruv (2026-10-31): vaqtinchalik papkadagi Node 22 topilib, PATH shu jarayon uchun sozlandi. `npm test` — 54/54 o‘tdi; `npm run check` — o‘tdi. Yuqoridagi npm topilmagani haqidagi qayd avvalgi urinish holatini bildiradi.
