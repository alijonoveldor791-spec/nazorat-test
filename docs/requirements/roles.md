# Rollar va vakolatlar

Sana: 2026-10-31. Loyiha: Nazorat-test.

Bu hujjat mavjud kod tekshiruvi va foydalanuvchi belgilagan uch rol asosidagi talablarni ajratadi. Talab yozilgani uning dasturda bajarilganini anglatmaydi. Ushbu bosqichda dastur kodi o‘zgartirilmaydi.

## 1. Mavjud holat va dalillar

| Yo‘nalish | Koddagi amaldagi holat | Manba |
| --- | --- | --- |
| Admin modeli | Bitta umumiy parol, `role: 'admin'`, 8 soatlik server sessiyasi mavjud. Bosh admin va maktab admini ajratilmagan; sessiyada maktab yoki alohida admin identifikatori yo‘q. | [auth-service.mjs](../../server/services/auth-service.mjs), [auth-token.mjs](../../server/lib/auth-token.mjs) |
| Ruxsat nazorati | Router `admin` belgili yo‘llarda umumiy admin sessiyasini tekshiradi. Maktabga egalik tekshiruvi yo‘q. | [router.mjs](../../server/router.mjs), [admin routes](../../server/routes/admin/) |
| Maktablar va obunalar | Maktab yaratish/boshqarish, obuna modeli va ularga tegishli API aniqlanmadi. PLAN eski qarorni bitta maktab va umumiy admin sifatida qayd etgan. | [PLAN.md](../../PLAN.md), [routes/index.mjs](../../server/routes/index.mjs) |
| Sinflar va ro‘yxatlar | Admin barcha sinflar va o‘quvchi kodlarini oladi; sinf yaratadi, tahrirlaydi, o‘chiradi. Yozuvlar `schoolId` bilan ajratilmagan. | [class-service.mjs](../../server/services/class-service.mjs), [student-access-service.mjs](../../server/services/student-access-service.mjs), [classes-repo.mjs](../../server/repositories/classes-repo.mjs) |
| Testlar | Admin yaratish, tahrirlash, o‘chirish, nusxalash, faollashtirish/to‘xtatish, Aiken preview/import/eksport amallarini bajaradi. Sinf, jadval, vaqt, urinish va javob ko‘rsatish siyosatini belgilaydi. | [test-service.mjs](../../server/services/test-service.mjs), [validate.mjs](../../server/lib/validate.mjs) |
| Kodlar | `accessCode` sinf ro‘yxatidagi o‘quvchiga tegishli shaxsiy kod. Alohida testga kirish kodi va uning hayot sikli aniqlanmadi; test IDsi test kodi o‘rnini bosmaydi. | [student-code.mjs](../../server/lib/student-code.mjs), [student-codes.js](../../public/js/teacher/student-codes.js), [attempt-service.mjs](../../server/services/attempt-service.mjs) |
| Natijalar | Admin umumiy natijalar ro‘yxati, tafsilot, o‘chirish, qayta topshirishga ruxsat va savollar tahliliga ega. CSV/Excel/chop etish brauzerda mavjud. | [result-service.mjs](../../server/services/result-service.mjs), [analytics-service.mjs](../../server/services/analytics-service.mjs), [results.js](../../public/js/teacher/results.js) |
| Zaxira va tozalash | Admin barcha sinf/test/natijalarni eksport va tiklash qiladi; umumiy tozalash ham mavjud. Bu amallar maktab bo‘yicha cheklanmagan. | [backup-service.mjs](../../server/services/backup-service.mjs) |
| O‘quvchi kirishi | Akkauntsiz: ro‘yxatli sinfda shaxsiy kod, ro‘yxatsiz sinfda ism/familiya. Test tanlangan sinfga biriktirilgan va ochiq bo‘lishi kerak. | [attempt-service.mjs](../../server/services/attempt-service.mjs), [home.js](../../public/js/student/home.js) |
| Ochiq ma'lumotlar | Sinf IDsi, nomi va ro‘yxat mavjudligi ochiq; test ro‘yxati sinf bo‘yicha olinadi. Faol test savollari ID orqali ham ochiladi, javob kaliti berilmaydi. Ochiq o‘quvchilar ro‘yxati endpointi 403 qaytaradi. | [class-service.mjs](../../server/services/class-service.mjs), [test-service.mjs](../../server/services/test-service.mjs), [public routes](../../server/routes/public/) |
| Urinish va natija | Urinish tokeni va brauzer egaligi tekshiriladi. O‘quvchi o‘z urinishini saqlaydi, davom ettiradi, yuboradi va natijasini oladi. Kalit faqat yakundan keyin amaldagi javob ko‘rsatish siyosati ruxsat etsa beriladi. | [attempt-access-service.mjs](../../server/services/attempt-access-service.mjs), [draft-service.mjs](../../server/services/draft-service.mjs), [student-result-service.mjs](../../server/services/student-result-service.mjs) |

Qo‘shimcha o‘qilgan hujjatlar: [README](../../README.md), [arxitektura](../ARCHITECTURE.md), [o‘qituvchi qo‘llanmasi](../OQITUVCHI-QOLLANMA.md). Kod amaldagi xatti-harakat uchun asos qilib olindi: PLAN ichidagi eski parol va identifikatsiya tavsiflari keyingi o‘zgarishlarni to‘liq aks ettirmaydi.

**Xulosa:** hozirgi umumiy adminni xavfsiz ko‘p maktabli tizimdagi maktab admini deb hisoblash mumkin emas. Maktablararo izolyatsiya hozir amalga oshirilmagan.

## 2. Maqsadli vakolatlar

Quyidagi jadvallar talabdir. Foydalanuvchi aniq belgilamagan qo‘shimcha vakolatlar sukut bo‘yicha berilmaydi; ochiq masalalar 4-bo‘limda keltirilgan.

### 2.1. Bosh admin

Vazifasi: maktablarni yaratish va boshqarish, obunalarni nazorat qilish.

| Amal | Ruxsat etilgan doira | Taqiq yoki chegara | Hozirgi holat |
| --- | --- | --- | --- |
| Maktab yaratish, ro‘yxatini va tafsilotini ko‘rish | Platformadagi maktablar | O‘quvchi roli orqali bajarish taqiqlanadi | Mavjud emas |
| Maktab ma'lumotlarini boshqarish | Maktabning boshqaruv ma'lumotlari | O‘chirish, arxivlash va bloklash oqibatlari aniqlanmaguncha cheklanadi | Mavjud emas |
| Obunani ko‘rish va boshqarish | Maktab obunasi, holati va muddati | To‘lov, tarif va limitlarni o‘zgartirish tartibi alohida aniqlanishi kerak | Mavjud emas |
| Maktab adminini tayinlash yoki kirishini tiklash | Hozircha berilmagan; qaror talab etiladi | Tasdiqlanmagan hisob boshqaruvi vakolati berilmaydi | Mavjud emas |
| Maktab sinflari, shaxsiy kodlari, test kalitlari va individual natijalarini o‘qish/o‘zgartirish | Hozircha berilmagan | Bosh admin nomining o‘zi cheklanmagan pedagogik ma'lumotlar kirishini bermaydi | Alohida rol yo‘q |
| Umumiy zaxira, tiklash yoki barcha ma'lumotlarni tozalash | Hozircha berilmagan | Mavjud umumiy admin vakolati avtomatik ko‘chirilmaydi | Umumiy adminda mavjud |

### 2.2. Maktab admini

Vazifasi: faqat o‘z maktabidagi sinflar, testlar, test kodlari va natijalarni boshqarish.

| Amal | Ruxsat etilgan doira | Taqiq yoki chegara | Hozirgi holat |
| --- | --- | --- | --- |
| Sinf yaratish, ko‘rish, tahrirlash, o‘chirish | Faqat o‘z maktabi | Boshqa maktab sinfiga kirish yoki test biriktirish taqiqlanadi | Umumiy CRUD bor; izolyatsiya yo‘q |
| O‘quvchilar ro‘yxati va shaxsiy kodlarini boshqarish | Faqat o‘z maktabining sinflari | Kodlar va ro‘yxatni public APIga chiqarish taqiqlanadi | Ro‘yxat/kod ko‘rish bor; maktab chegarasi yo‘q |
| Test yaratish, tahrirlash, nusxalash, o‘chirish | O‘z maktabining testlari | Boshqa maktab testini ID orqali ham olish/o‘zgartirish taqiqlanadi | Amallar bor; maktab chegarasi yo‘q |
| Aiken preview, import va eksport | O‘z maktabi testlari; preview serverda | Javob kalitini ochiq endpointga qo‘shish taqiqlanadi | Mavjud |
| Test jadvali, vaqt, urinishlar, faollik va javob siyosati | O‘z maktabi testlari | Server muddati va yakunlangan urinish yaxlitligini buzish taqiqlanadi | Mavjud; maktab chegarasi yo‘q |
| Testga kirish kodini boshqarish | O‘z maktabi/testi; kod qoidalari aniqlanishi kerak | Boshqa maktab kodi va shaxsiy o‘quvchi kodini egallash taqiqlanadi | Alohida test kodi mavjud emas |
| Natijalarni ko‘rish, tahlil, eksport va chop etish | Faqat o‘z maktabi | Umumiy ro‘yxat/eksport orqali boshqa maktab natijasini olish taqiqlanadi | Mavjud; maktab chegarasi yo‘q |
| Natijani o‘chirish, qayta topshirishga ruxsat | Faqat o‘z maktabi | Ballni qo‘lda almashtirish vakolati berilmaydi; o‘chirishning o‘zi yangi urinish bermaydi | O‘chirish/retake bor |
| O‘z kirish parolini almashtirish va chiqish | Faqat o‘z admin hisobi/sessiyasi | Boshqa admin parolini yoki platforma kalitlarini boshqarish taqiqlanadi | Hozir parol umumiy; logout serverda bor |
| Zaxira va tiklash | Agar saqlansa, faqat o‘z maktabi doirasida | Boshqa maktab yozuvini tiklash/ustidan yozish taqiqlanadi; vakolatni saqlash qarori ochiq | Hozir umumiy |
| Maktab yaratish, boshqa maktabni boshqarish, obunani o‘zgartirish | Ruxsat yo‘q | Bosh admin vazifasini bajarish yoki rolini oshirish taqiqlanadi | Alohida rollar yo‘q |
| Butun platformani tozalash | Ruxsat yo‘q | Umumiy `clear` maktab adminiga berilmasligi kerak | Umumiy adminda mavjud |

### 2.3. O‘quvchi

Vazifasi: akkaunt yaratmasdan ruxsat berilgan testni ishlash va o‘z natijasini ko‘rish.

| Amal | Ruxsat etilgan doira | Taqiq yoki chegara | Hozirgi holat |
| --- | --- | --- | --- |
| Testga kirish | Tegishli maktab/sinf/test konteksti; kirish siyosati bajarilganda | Admin akkaunti yoki o‘quvchi akkaunti yaratish talab etilmaydi; begona kod bilan kirish taqiqlanadi | Shaxsiy kod yoki ochiq mashq bor; test kodi yo‘q |
| Savollarni ko‘rish va javob berish | Ruxsat etilgan faol test | Yakunlashdan oldin maxfiy javob kalitini olish taqiqlanadi | Faol test savollari ID orqali ham ochiq |
| Draft saqlash va davom ettirish | Faqat o‘z urinish tokeni va brauzer egaligi bilan | Begona urinishni egallash, eski draft bilan yangisini bosish taqiqlanadi | Mavjud |
| Yakuniy yuborish | Server muddati va urinish limitlari ichida | Muddatdan keyin yangi javobni bahoga qo‘shish yoki limitni aylanib o‘tish taqiqlanadi | Mavjud |
| Natijani ko‘rish | Faqat o‘z urinishining balli va ruxsat etilgan sharhi | Boshqa o‘quvchi natijasi, umumiy natijalar ro‘yxati yoki taqiqlangan kalitni olish mumkin emas | O‘z urinish oqimida mavjud |
| Qayta topshirish | Test limiti yoki admin bergan qo‘shimcha ruxsat doirasida | O‘ziga qo‘shimcha urinish berish taqiqlanadi | Mavjud |
| Sinf/test/natija/obuna boshqaruvi, zaxira va eksport | Ruxsat yo‘q | Admin API va boshqa o‘quvchilarning ro‘yxati/kodlariga kirish taqiqlanadi | Admin API sessiya bilan yopilgan; roster 403 |

## 3. Majburiy maktablararo izolyatsiya talabi

**ISO-01:** bitta maktab admini boshqa maktabning ma'lumotlarini ko‘ra olmasligi, yaratmasligi, o‘zgartirmasligi, o‘chirmasligi va eksport qila olmasligi shart. Bu talab faqat UI filtriga tayanmasdan serverda bajarilishi kerak.

- ISO-02: adminning maktab doirasi server tasdiqlagan hisob/sessiyadan olinadi. URL, body yoki query ichidagi `schoolId` mustaqil ruxsat dalili bo‘la olmaydi.
- ISO-03: sinflar, o‘quvchilar, shaxsiy kodlar, testlar, test kodlari, urinishlar, draftlar, natijalar va qayta topshirish ruxsatlari maktabga bir ma'noli bog‘lanadi. Bog‘langan obyektlar bir maktabga tegishli bo‘lishi tekshiriladi.
- ISO-04: ro‘yxat, alohida ID bilan olish, qidiruv, statistika, nusxalash, eksport, zaxira, tiklash va tozalash bir xil maktab chegarasini saqlaydi. Begona yozuv mavjudligi yoki shaxsiy metama'lumoti xato javobida ham oshkor qilinmaydi.
- ISO-05: repository so‘rovlari, kesh kalitlari va atomik yozish kalitlari maktablar ma'lumotini aralashtirmaydi. Admin so‘roviga begona maktab ma'lumoti qaytarilmaydi.
- ISO-06: o‘quvchi uchun maktab/sinf/test tanlash yoki kodni aniqlash oqimi to‘g‘ri maktabga bog‘lanadi. Ochiq endpointlar roster, shaxsiy kod va maxfiy javob kalitlarini bermaydi.
- ISO-07: eski `schoolId` yo‘q yozuvlar avtomatik barcha maktablarga ochilmaydi. Migratsiyada ularning egasi aniq belgilanadi; eski test va natija formatlari saqlanadi.
- ISO-08: berilmagan rol/amallar sukut bo‘yicha rad etiladi. Bosh admin uchun ham maktab ichki ma'lumotlariga kirish alohida qarorga bog‘liq.
- ISO-09: logout server sessiyasini bekor qilishni davom ettiradi; tokenlarda parolga bog‘liq verifier bo‘lmaydi. Draft versiyasi, brauzer egaligi, server muddati va natija idempotentligi saqlanadi.

### Keyingi amalga oshirish uchun qabul mezonlari

Quyidagilar rejalashtirilgan tekshiruvlar; ushbu hujjat bosqichida bajarilgan deb hisoblanmaydi.

| Ssenariy | Kutiladigan natija |
| --- | --- |
| A maktab admini ro‘yxat, tahlil va eksport oladi | Faqat A maktab ma'lumotlari qaytadi |
| A admin B maktab sinf/test/natija IDsi bilan GET, PUT, DELETE, nusxalash yoki retake yuboradi | So‘rov rad etiladi; B ma'lumotlari oshkor bo‘lmaydi va o‘zgarmaydi |
| A admin body/query orqali B `schoolId` qiymatini yuboradi | Begona maktab vakolati hosil bo‘lmaydi |
| A admin B sinfiga test bog‘laydi yoki B yozuvlarini zaxiradan tiklaydi | Amal rad etiladi; B yozuvlari o‘zgarmaydi |
| A va B da bir xil sinf nomi, o‘quvchi ismi yoki lokal kod mavjud | Qidiruv, urinish limiti, natija va kesh maktablar orasida aralashmaydi |
| O‘quvchi admin API, roster/kodlar yoki begona urinish/natijani so‘raydi | Kirish rad etiladi; maxfiy ma'lumot qaytmaydi |
| Maktab admini maktab/obuna yaratish yoki rolini oshirishni so‘raydi | Amal rad etiladi |
| Chiqish, draft poygasi, muddatdan keyingi yuborish va takror submit | Bekor qilingan sessiya ishlamaydi; mavjud yaxlitlik qoidalari saqlanadi |

## 4. Yetishmayotgan talablar va ochiq savollar

| ID | Yetishmayotgan talab / qaror | Aniqlashtiriladigan savol |
| --- | --- | --- |
| GAP-01 | Uch rolga mos hisob va ruxsat modeli yo‘q | Bosh admin qanday yaratiladi? Maktab adminini kim tayinlaydi, bir maktabda nechta admin bo‘ladi, bir admin bir nechta maktabga biriktiriladimi? |
| GAP-02 | Maktab modeli va hayot sikli yo‘q | Majburiy maydonlar, noyob identifikator, bloklash/arxivlash/o‘chirish va ma'lumot saqlash muddati qanday? |
| GAP-03 | Obuna modeli va ijro qoidalari yo‘q | Tarif, muddat, limitlar, to‘lovni tasdiqlash tartibi qanday? Obuna tugaganda yangi va davom etayotgan testlar, natijalarni o‘qish va eksportga nima bo‘ladi? |
| GAP-04 | Mustaqil test kodi yo‘q | Kod testga, sinfga yoki sessiyaga tegishlimi? Muddati, qayta yaratish/bekor qilish va urinish limitlari qanday? Shaxsiy o‘quvchi kodi bilan birga talab qilinadimi? |
| GAP-05 | O‘quvchining maktabni aniqlash oqimi yo‘q | Maktab havolasi yoki test kodi ishlatiladimi? Sinflar/testlarning umumiy ochiq ro‘yxati saqlanadimi? Faol savollarni kodsiz ID orqali ko‘rish mumkin bo‘ladimi? |
| GAP-06 | Bosh adminning ichki ma'lumotlarga kirishi belgilanmagan | Faqat obuna/boshqaruv metama'lumoti yetarlimi? Texnik yordam uchun kirish kerak bo‘lsa, kim ruxsat beradi va qanday qayd etiladi? |
| GAP-07 | Admin paroli va tiklash alohida hisobga ajratilmagan | Login identifikatori, taklif, bloklash va parolni tiklash tartibi qanday? Eski umumiy paroldan kimga qanday o‘tiladi? |
| GAP-08 | Xavfli amallar doirasi to‘liq belgilanmagan | Maktab adminida zaxira/tiklash va maktabni tozalash qoladimi? Natija/test o‘chirish uchun saqlash, tasdiqlash va audit talablari qanday? |
| GAP-09 | Ko‘p maktabga migratsiya talabi yo‘q | Mavjud sinf/test/natija va eski `grades` yozuvlari qaysi maktabga biriktiriladi? Eski URL, urinish va kodlar qanday saqlanadi? |
| GAP-10 | Kuzatuv va maxfiylik siyosati aniqlanmagan | Kim, qachon, qaysi maktabda qaysi amalni bajargani qancha muddat saqlanadi? Kodlar va parollar logga yozilmasligi qanday tekshiriladi? |
| GAP-11 | O‘quvchi natijasini qayta ko‘rish doirasi ochiq | Hozirgi brauzer/token bilan tiklash yetarlimi yoki boshqa qurilmada xavfsiz ko‘rish ham kerakmi? Ochiq mashq rejimi saqlanadimi? |

Bu savollar yangi vakolat berish uchun asos emas. Hozircha 2-bo‘limdagi chegaralar va ISO talablari amal qiladi; amalga oshirish keyingi alohida bosqichdir.

## 5. Ushbu bosqichdagi tekshiruv natijalari

- Kod, yo‘llar, xizmatlar, repositorylar, UI modullari va yuqoridagi loyiha hujjatlari statik tekshirildi. Jadvaldagi mavjud holat shu tekshiruvga asoslangan.
- Faqat `docs/requirements/roles.md` qo‘shildi; dastur kodi va mavjud arxitektura o‘zgartirilmadi.
- `git diff --check` xatosiz yakunlandi. Yangi fayl alohida ko‘rib chiqildi; 250 qator chegarasidan oshmaydi.
- Majburiy `npm test` va `npm run check` mos ravishda `npm.cmd test` va `npm.cmd run check` orqali ishga tushirishga urinildi. Ikkalasi ham bajarilmadi: muhitda `npm.cmd` topilmadi; `node` va `npm` ham PATH orqali aniqlanmadi. Bu testlar o‘tgan deb hisoblanmaydi.
- Runtime, brauzer va yangi rollar izolyatsiyasi sinovlari bajarilmadi. Xavfsizlik/recovery kodi o‘zgarmagani uchun qo‘shimcha audit sinovlari ishga tushirilmadi. 3-bo‘limdagi qabul mezonlari keyingi amalga oshirish uchun saqlandi.

Push oldidan qayta tekshiruv (2026-10-31): vaqtinchalik papkadagi Node 22 topilib, PATH shu jarayon uchun sozlandi. `npm test` — 54/54 o‘tdi; `npm run check` — o‘tdi. Yuqoridagi npm topilmagani haqidagi qayd avvalgi urinish holatini bildiradi.
