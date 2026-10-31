# 1.2-bosqich: doimiy maktab IDsi

Sana: 2026-10-31. Holat: tahlil va loyiha hujjati; amalga oshirilmagan.

Maqsad: har bir maktabga platforma doirasida noyob, nomga bog‘liq bo‘lmagan doimiy ID biriktirish. Ushbu bosqichda kod, ombor yozuvlari va mavjud IDlar o‘zgartirilmaydi. Vakolatlar uchun [roles.md](roles.md) talablari amal qiladi.

## 1. Mavjud tuzilma

Tekshiruv repozitoriydagi kod va hujjatlarga asoslangan. Lokal yoki production Blobs ma’lumotlari o‘qilmadi; mavjud yozuvlar soni va haqiqiy egaligi aniqlangan deb hisoblanmaydi.

| Obyekt / oqim | Hozirgi holat | Loyihaga ta’siri |
| --- | --- | --- |
| Maktab | Alohida model, `schools` repository va maktab API yo‘q; `schoolId` maydoni aniqlanmadi | Yangi model kerak; sinf IDsi maktab IDsi sifatida ishlatilmaydi |
| Sinf va o‘quvchi | `classValid` yangi ID uchun `randomUUID()` ishlatadi; sinfda `id`, `name`, `students`; o‘quvchida `id`, ism/familiya, `accessCode` bor | Mavjud ID va shaxsiy kodlar saqlanadi; sinfga maktab bog‘lanishi qo‘shiladi |
| Test | `id`, `classIds`, eski `grades`, savollar, sozlamalar va jadval mavjud; yangi ID UUID yoki yaratish so‘rovi IDsi bo‘lishi mumkin | Test IDsi saqlanadi; barcha biriktirilgan sinflar bitta maktabniki bo‘lishi kerak |
| Eski format | `legacyClassId(name)` normalizatsiyalangan sinf nomi hashidan `legacy-*` hosil qiladi | Bu maktab identifikatori emas; bir xil sinf nomidan maktab egaligi chiqarilmaydi |
| Urinish va natija | Identifikatsiya kaliti test IDsi, sinf IDsi va ism/familiyaga asoslangan; natijalar urinishga bog‘langan | Mavjud kalitlar qayta hisoblanmaydi; maktab egaligi alohida bog‘lanadi |
| O‘quvchi kirishi | Umumiy sinflar → sinf testlari → shaxsiy kod yoki ochiq mashqdagi ism/familiya | Oqim boshiga maktab IDsi qo‘shilishi kerak |
| Admin | Bitta umumiy `admin` sessiyasi; maktab bo‘yicha cheklov yo‘q | ID qo‘shishdan tashqari rol va serverdagi maktab vakolati zarur |
| Saqlash | Blobs yozuvi kalit bilan olinadi; adapterda `onlyIfNew` va ETag asosidagi amallar bor | Maktabni atomik yaratish mavjud repository uslubiga mos loyihalanadi |
| Zaxira/tiklash | Zaxira v2 sinf, test va natijalarni saqlaydi; tiklash tanilgan maydonlarni qayta quradi | Yangi bog‘lanishlar tiklashda tushib qolmasligi uchun versiyalangan format kerak |

Dalillar: [validate.mjs](../../server/lib/validate.mjs), [legacy.mjs](../../server/migrations/legacy.mjs), [test-service.mjs](../../server/services/test-service.mjs), [attempt-service.mjs](../../server/services/attempt-service.mjs), [completion-service.mjs](../../server/services/completion-service.mjs), [home.js](../../public/js/student/home.js), [auth-service.mjs](../../server/services/auth-service.mjs), [blob-store.mjs](../../server/repositories/blob-store.mjs), [backup-validate.mjs](../../server/lib/backup-validate.mjs), [backup-service.mjs](../../server/services/backup-service.mjs), [arxitektura](../ARCHITECTURE.md).

## 2. ID formati va o‘zgarmasligi

**SID-01:** yangi maktabning `id` qiymati serverda `node:crypto` modulining `randomUUID()` funksiyasi bilan yaratiladigan UUID v4 bo‘ladi. Boshqa yozuvlarda u `schoolId` nomi bilan saqlanadi. Ichki va o‘quvchiga beriladigan maktab IDsi bitta qiymatdir.

| Xususiyat | Qoida |
| --- | --- |
| Kanonik format | Kichik lotin harflari va raqamlar, defisli 36 belgi: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`, `y` — `8`, `9`, `a` yoki `b` |
| Misol | `7bde8492-4e85-4bf0-9a4c-30c1e8b75026` — faqat hujjat namunasi, haqiqiy maktabga biriktirilmagan |
| Tekshirish | Yangi UUID uchun `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$` |
| Kiritish | Tashqi bo‘sh joylar olib tashlanadi, ASCII katta harflar kichikka o‘tkaziladi; keyin format tekshiriladi. Ichki bo‘sh joy, qisqartirish yoki o‘xshash belgilarni taxminan tuzatish yo‘q |
| Hosil qilish | Nom, hudud, telefon, tartib raqami, vaqt yoki ularning hashidan olinmaydi; brauzer tanlagan IDga ishonilmaydi |
| Barqarorlik | Maktab nomi, manzili, admini, obunasi yoki holati o‘zgarganda ID o‘zgarmaydi |
| Qayta ishlatish | Arxivlangan/o‘chirilgan maktab IDsi boshqa maktabga berilmaydi; minimal rezerv yozuvi saqlanadi |
| Ko‘rsatish | UI to‘liq IDni nusxalash va IDli havolani berishi mumkin; qisqartirilgan ko‘rinish qidiruv yoki API identifikatori bo‘lmaydi |

UUID v4 tasodifiy nomzod yaratadi. **Noyoblikni faqat tasodifga tayanib emas, ombordagi atomik band qilish bilan ta’minlash shart.** Nom bir xil bo‘lishi ID bir xil bo‘lishini anglatmaydi; maktab dublikatini biznes ma’nosida aniqlash alohida masaladir.

**SID-02:** barcha rollar uchun mavjud `id`ni tahrirlash taqiqlanadi. Update body ichidagi `id`/egalikni almashtiruvchi `schoolId` rad etiladi. Maktabni qayta nomlash faqat `name` va yangilanish vaqtiga ta’sir qiladi.

Kelajakdagi inventarizatsiyada oldindan mavjud haqiqiy maktab IDsi topilsa, u avtomatik yangi UUIDga almashtirilmaydi. Yangi format qoidasi yangi maktablarga tegishli; eski format uchun aniq moslik qoidasi yoki o‘zgarmas IDga bog‘langan kirish aliasi alohida loyihalanadi. Sinf/test IDlari bu istisno bilan maktab IDlariga aylantirilmaydi.

## 3. Model va yaratish qoidasi

Quyidagi tuzilma taklif etiladi; yangi repository faqat keyingi amalga oshirish bosqichida yaratiladi.

| Joy | Maydon / kalit | Talab |
| --- | --- | --- |
| `schools` ombori | Kalit — to‘liq maktab IDsi | Maktab yozuvi shu kalit bilan yagona olinadi; nom bo‘yicha asosiy kalit yo‘q |
| Maktab yozuvi | `schemaVersion`, `id`, `name`, `status`, `createdAt`, `updatedAt` | `id` va `createdAt` o‘zgarmas; nom va holat boshqariladi; vaqt serverdan olinadi |
| Sinf, test, natija, urinish | `schoolId` | Yangi yozuvlar uchun majburiy; mavjud `id`, havolalar va baholash ma’lumotlari saqlanadi |
| Ichki o‘quvchi / draft | Ota sinf / urinish orqali maktab bog‘lanishi | Alohida nusxa maydon qo‘shilsa, ota obyekt bilan mosligi tekshiriladi |
| Admin hisobi/sessiyasi | Server tekshiradigan maktab a’zoligi | Maktab adminining doirasi mijoz yuborgan IDdan olinmaydi |
| Retake, kesh, indeks, limit va idempotentlik | Maktab doirasi | Maktablar orasida kalit to‘qnashuvi yoki ma’lumot almashuvi bo‘lmaydi; eski kalitlar uchun moslik xaritasi saqlanadi |

Yaratish ketma-ketligi:

1. Server bosh admin vakolatini tekshiradi va maktab ma’lumotlarini validatsiya qiladi.
2. Takror yuborishni tanish uchun `requestId` olinadi. U maktab IDsi bo‘lmaydi; bir so‘rovga doim bitta maktab javobi bog‘lanadi.
3. Server UUID v4 nomzod yaratadi va `schools/<id>` yozuvini faqat yangi kalit bo‘lsa atomik yaratadi. Ro‘yxatni oldin o‘qib, keyin shartsiz yozish yetarli emas.
4. Nomzod band bo‘lsa, boshqa nomzod bilan cheklangan qayta urinish bajariladi; masalan, 5 urinishdan so‘ng mavjud yozuvga tegmasdan server xatosi qaytariladi. Tarmoq/ombor xatosi ID to‘qnashuvi deb talqin qilinmaydi.
5. Yaratish natijasi so‘rovga mustahkam bog‘lanadi; javob yo‘qolib, qayta yuborilganda o‘sha ID qaytariladi. Bir `requestId` boshqa payload bilan qaytsa 409 beriladi.

Blobs’da bir nechta yozuvni o‘zgartirish umumiy tranzaksiya emas. Shu sabab keyingi implementatsiyada yaratish so‘rovi yozuvida nomzod ID oldindan atomik rezerv qilinishi, parallel workerlar o‘sha nomzodni ishlatishi va uzilishdan keyin uning egasi tekshirilishi kerak. Maktab yozuvi va so‘rov yozuvi orasidagi uzilish dublikat maktab yaratmasligi shart. Nomzod to‘qnashuvida uni almashtirish ham shartli yangilash bilan bajariladi.

## 4. O‘quvchining testga kirishi

**SID-03:** maktab IDsi testga kirishning majburiy maktab konteksti bo‘ladi. O‘quvchi uni qo‘lda kiritadi yoki IDli havoladan oladi; akkaunt yaratmaydi. Tavsiya etilgan havola: `/?schoolId=<id>`; bu hozir mavjud endpoint shartnomasi emas.

1. O‘quvchi maktab IDsini kiritadi yoki havolani ochadi. Server format va maktabning kirish holatini tekshiradi.
2. Javob faqat kirish uchun zarur maktab IDsi va nomini beradi; admin kontaktlari, obuna tafsilotlari, roster, kodlar va natijalar berilmaydi.
3. Sinflar va testlar faqat shu maktab kontekstida olinadi. Maktab tanlash umumiy maktablar ro‘yxatini ommaga chiqarishni talab qilmaydi.
4. Testni boshlashda server `schoolId → classId → testId` tegishliligini va testning sinfga biriktirilganini tekshiradi. Ro‘yxatli sinfda shaxsiy o‘quvchi kodi ham tekshiriladi.
5. Alohida test kodi keyin joriy etilsa, u shu maktab/test bilan tekshiriladi. Maktab IDsi, test kodi va shaxsiy o‘quvchi kodi turli vazifalarni bajaradi; biri boshqasining o‘rnini bosmaydi.
6. Urinish yaratilganda maktab egaligi serverda saqlanadi. Draft, resume, submit va natijada egalik saqlangan urinishdan olinadi; body/query orqali almashtirilmaydi. Token va brauzer egaligi nazorati davom etadi.

Maktab IDsini bilish boshqa o‘quvchining shaxsini tasdiqlamaydi. Ochiq mashq rejimi saqlansa, uning ommaviy savollari va anonim ishtiroki alohida ruxsat siyosati bo‘ladi; bu roster yoki individual natijalarga kirish bermaydi. Savollarni test IDsi bilangina olish imkoniyati yangi maktab kontekstini chetlab o‘tmasligi kerak.

## 5. Bosh admin qidiruvi va ruxsat chegarasi

**SID-04:** bosh admin to‘liq maktab IDsi bilan aniq qidiruv qilib, maktabning boshqaruv yozuvini topa oladi. Taklif etilgan API: `GET /api/super-admin/schools/:schoolId`; yo‘l nomi keyingi API loyihasida yakunlanadi. U bosh admin sessiyasi bilan yopiladi; repository kalit bo‘yicha qidiradi. Nom o‘zgarsa ham eski IDli qidiruv shu maktabni qaytaradi.

**SID-05:** maktab IDsi ommaviy identifikator, ruxsat tokeni yoki parol emas. Tasodifiy format taxmin qilishni qiyinlashtiradi, lekin kirish nazoratining o‘rnini bosmaydi.

- Maktab adminining serverdagi a’zoligi har so‘rovda tekshiriladi. A admin B maktab IDsini yuborsa, B yozuvlari o‘qilmaydi va o‘zgarmaydi; begona va mavjud bo‘lmagan obyektlar uchun bir xil 404 javobi tavsiya etiladi.
- Bosh admin qidiruvi maktabni boshqarish metama’lumotlarini beradi. Ichki o‘quvchi kodlari, javob kalitlari yoki individual natijalarni o‘qish vakolati avtomatik berilmaydi.
- O‘quvchi resolveri bilan bosh admin qidiruvi turli javob doirasiga ega. Maktab IDsini almashtirish faqat ommaviy kirish kontekstini tanlashi mumkin; himoyalangan ma’lumotga ruxsat yaratmaydi.
- Noto‘g‘ri format omborga so‘rovsiz rad etiladi. Topilmagan/kirishga yopiq maktab uchun ommaviy javob yagona bo‘ladi; ommaviy resolver so‘rovlari tezligi serverda cheklanadi.
- Maktabga tegishli ro‘yxat, ID bilan olish, tahlil, eksport, tiklash va tozalash bir xil egalik tekshiruvidan o‘tadi. UI filtri yetarli emas.
- Kesh va saqlangan brauzer holatlari maktablar orasida aralashmaydi. Maktabni almashtirish boshlangan urinish egasini o‘zgartirmaydi.

## 6. Migratsiya talablari

Bu reja kelajak uchun; ushbu bosqichda migratsiya ishga tushirilmaydi.

1. **Inventarizatsiya:** ombor kalitlari, mavjud IDlar, eski formatlar, test–sinf–natija bog‘lanishlari, urinishlar va retake yozuvlari ro‘yxatga olinadi. Asl nusxa va tekshiriladigan migratsiya hisoboti tayyorlanadi. Oddiy v2 eksport tugallanmagan urinish va sessiyalarni qamramasligi hisobga olinadi.
2. **Egalik xaritasi:** joriy bitta maktabli o‘rnatmaning egasi aniq tasdiqlanib, unga maktab yozuvi bir marta yaratiladi. Faqat tasdiqlangan yozuvlar shu IDga bog‘lanadi. Nom/hudud/`grade` o‘xshashligi egalik dalili emas. Noaniq yoki uzilgan bog‘lanishlar alohida hisobotga olinib, kirishi yopiq qoladi.
3. **Faqat qo‘shimcha bog‘lanish:** `schoolId` va versiya metama’lumoti qo‘shiladi. Sinf, o‘quvchi, test, natija va urinish IDlari, blob kalitlari, `classIds`, `attemptId`, shaxsiy kodlar, javoblar, ball va vaqtlar o‘zgartirilmaydi. Mavjud to‘g‘ri `schoolId` ustidan yozilmaydi; ziddiyatda jarayon to‘xtaydi.
4. **Eski kalitlar mosligi:** `legacy-*` sinf IDlari va mavjud `identityKey`/retake/urinish kalitlari qayta hisoblanmaydi. Egalik uchun maktabga bog‘langan indeks yoki moslik xaritasi yaratiladi. Bir xil eski ID turli manba o‘rnatmalarda uchrasa, ular maktab/manba doirasi bilan ajratiladi; bir-birining ustidan yozilmaydi.
5. **Idempotent bajarish:** migratsiya manifesti o‘rnatma → maktab IDsi va yozuvlar holatini saqlaydi. Qayta ishga tushirish yangi maktab yoki yangi obyekt IDlari yaratmaydi. Parallel yozish ETag shartlari bilan himoyalanadi; eski writerlar yangi `schoolId`ni tushirib qoldirmasligi uchun moslik davri boshqariladi.
6. **Faol urinishlar:** mavjud tokenlar, owner hash, draft versiyasi, deadline va yakuniy natija idempotentligi saqlanadi. Maktab urinishning ishonchli test/sinf bog‘lanishidan aniqlanadi; eski tokenda maydon yo‘qligi barcha maktablarga kirish bermaydi. Xavfsiz bog‘lab bo‘lmagan urinish qo‘lda tekshiriladi; yangi ID bilan qayta yaratilmaydi.
7. **Eski havolalar:** maktab konteksti yo‘q eski URL faqat obyektning tekshirilgan egaligi orqali yangi oqimga olib boriladi yoki maktab tanlashni so‘raydi. Barcha yozuvni bitta standart maktabga tushiradigan doimiy fallback bo‘lmaydi. Eski `grades` mosligi saqlanadi, lekin maktabni nomdan taxmin qilmaydi.
8. **Zaxira:** keyingi versiya maktab IDlari va egalik bog‘lanishlarini saqlaydi. v2 import uchun nishon maktab ochiq tanlanib, vakolat va ID ziddiyatlari oldindan tekshiriladi. Begona maktab yozuvi ustidan yozish, mavjud IDni almashtirish yoki `schoolId`ni sezdirmasdan olib tashlash taqiqlanadi.
9. **Tekshirish va tiklanish:** oldin/keyin IDlar, yozuvlar soni, bog‘lanishlar, ball va kodlar solishtiriladi. Jarayon bosqichma-bosqich va uzilishdan davom etadigan bo‘ladi. Orqaga qaytishda yangi yozuvlar yo‘qotilmaydi va maktab chegarasini bilmaydigan eski dastur ko‘p maktabli ma’lumotlarga ochilmaydi. Band qilingan maktab IDlari qayta tarqatilmaydi.

## 7. Qabul mezonlari

Quyidagilar keyingi implementatsiyaning majburiy tekshiruvlari; hozir bajarilgan testlar emas.

| Talab | Tekshiruv | Kutiladigan natija |
| --- | --- | --- |
| Noyoblik | Generator ataylab bir xil nomzod beradi; parallel create yuboriladi | Faqat bitta yozuv shu IDni oladi; boshqasi qayta yaratadi yoki xavfsiz xato beradi; overwrite yo‘q |
| Takror so‘rov | Javob uzilishi va bir `requestId` bilan parallel/qayta yuborish | Bir xil payload o‘sha maktab IDsini oladi; boshqa payload 409; dublikat yo‘q |
| Doimiylik | Nom/admin/obuna/holat o‘zgaradi | ID va bog‘langan sinf/test/natijalar o‘zgarmaydi |
| Qayta ishlatmaslik | Maktab arxivlanadi, so‘ng o‘sha ID nomzod qilinadi | ID band qoladi va yangi maktabga berilmaydi |
| O‘quvchi oqimi | Maktab IDsi bilan kirish; boshqa maktab sinf/test/kodi aralashtiriladi | To‘g‘ri bog‘lanish ishlaydi; aralash so‘rov rad etiladi |
| Admin qidiruvi | Bosh admin ID bilan qayta nomlangan maktabni qidiradi | Shu maktab topiladi; oddiy admin uchun begona maktab yopiq |
| IDni almashtirish | A admin B IDsi bilan GET/PUT/DELETE/eksport/tiklash yuboradi | B ma’lumoti va mavjudligi oshkor bo‘lmaydi; yozuv o‘zgarmaydi |
| O‘quvchi maxfiyligi | Faqat maktab IDsi bilan roster, kodlar, kalit yoki begona natija so‘raladi | Himoyalangan ma’lumot berilmaydi |
| Migratsiya | Eski formatlar, uzilish, qayta ishga tushirish, ziddiyat va faol urinishlar | Asl ID/kalitlar va natijalar saqlanadi; egaliksiz yozuvlar yopiq; dublikat yo‘q |
| Tiklash | Yangi zaxira round-trip va eski v2 import | ID/egalik saqlanadi; maktablararo overwrite rad etiladi |

## 8. Ochiq qarorlar va bosqich chegarasi

- Joriy o‘rnatmaning qaysi maktabga tegishliligini tasdiqlash va migratsiya paytidagi parallel ishlash tartibi hali belgilanmagan.
- Maktab holatlari, obuna tugaganda kirish siyosati, test kodi talabi va ochiq mashq rejimi alohida talablar sifatida yakunlanadi.
- Maktab birlashishi/bo‘linishi uchun ID almashtirishga yo‘l qo‘yilmaydi; bunday biznes jarayon va ma’lumot ko‘chirish alohida loyihalanadi.
- Alohida qisqa kirish kodi hozir taklif qilinmaydi. Keyinchalik kerak bo‘lsa, u doimiy IDni almashtirmaydigan alias bo‘ladi va o‘z noyoblik qoidalariga ega bo‘ladi.

Faqat ushbu hujjat qo‘shildi. PLAN va amaldagi arxitektura o‘zgartirilmadi: tuzilma yoki dastur implementatsiyasi bajarilmadi. Mavjud IDlar o‘chirilmagan yoki o‘zgartirilmagan. Keyingi bosqich avtomatik boshlanmaydi.

## 9. Tekshirish natijalari

- Hujjatdagi mahalliy manba havolalari tekshirildi: barchasi mavjud. Hujjat 250 qatordan kam.
- `git diff --check` va yangi hujjat uchun `git diff --no-index --check -- NUL docs/requirements/school-id.md` xatosiz yakunlandi.
- `npm.cmd test` va `npm.cmd run check` ishga tushirishga urinildi, lekin `npm.cmd` muhitda topilmadi. Shu sabab majburiy testlar bajarilmadi va o‘tgan deb belgilanmaydi.
- Runtime, migratsiya, brauzer va xavfsizlik auditlari bajarilmadi; dastur yoki recovery kodi o‘zgarmadi. 7-bo‘lim sinov loyihasi bo‘lib qoladi.

Push oldidan qayta tekshiruv (2026-10-31): vaqtinchalik papkadagi Node 22 topilib, PATH shu jarayon uchun sozlandi. `npm test` — 54/54 o‘tdi; `npm run check` — o‘tdi. Yuqoridagi npm topilmagani haqidagi qayd avvalgi urinish holatini bildiradi.
