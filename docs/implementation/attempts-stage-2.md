# 2-bosqich: urinishlar va baholashni mustahkamlash

Sana: 2026-11-03. Holat: **ochiq qarorlarga bog'liq bo'lmagan texnik tuzatishlar bajarildi; qatnashuvchi modeli bo'yicha qarorlar kutilmoqda**. Production, sirlar va mavjud lokal ma'lumotlar o'zgartirilmadi. Deploy va main bilan merge bajarilmadi.

## Asos va doira

`AGENTS.md`, README, PLAN, arxitektura, [1-bosqich qoidalari](../requirements/product-rules.md), [dalillar](../requirements/product-evidence.md) va [qarorlar reyestri](../requirements/product-decisions.md) qayta o'qildi. Q3 (ismdoshlar, qurilma almashish va inson darajasidagi limit) hali tasdiqlanmagan. Q2/Q4/Q5/Q6 ham ochiq. Ushbu bosqich ularni tasdiqlamaydi va eski P0/P1 rejaning barcha bandlari bajarilgan degani emas.

Yangi o'quvchi profili, login, parol yoki shaxsiy kirish kodi qo'shilmadi. Maktab IDsi + umumiy 6 raqamli kodli kirish saqlandi. Hozirgi texnik guruh test+sinf+normalizatsiyalangan ism-familiya+brauzer kalitidan olinadi; maktab doirasi serverda tekshiriladi. Bu shaxsni tasdiqlamaydi. Boshqa brauzerdagi ismdoshlar birlashtirilmaydi; ayni brauzer/sinf/test/ismdagi ikki haqiqiy odamni ajratish Q3ga bog'liq, hal qilingan deb ko'rsatilmaydi.

## Tuzatilgan poygalar

| Muammo | Amalga oshirilgan yechim | Asosiy fayl/funksiya |
| --- | --- | --- |
| Limit listdan hisoblanib, keyin alohida urinish yaratilardi | Guruhning `used`, `sequence`, oxirgi rezervi va start request bog'lanishi bitta `attempt-starts` yozuvida ETag/CAS bilan yangilanadi. Parallel instansiyalar bir hisoblagich uchun kurashadi. | `server/services/attempt-start-service.mjs` → `reserveAttempt`; `server/repositories/attempt-starts-repo.mjs` |
| Start rezervi va urinish yozuvi orasida uzilish | Rezerv o'zida urinishning asl private nusxasi va deadline'ni saqlaydi. Qayta so'rov shu IDni `onlyIfNew` bilan materializatsiya qiladi; limit ikkinchi marta sarflanmaydi. | `materialize`, `attempts-repo.create` |
| Start javobi yo'qolsa kech retry yangi urinish bo'lishi mumkin edi | Brauzer texnik `requestId`ni muvaffaqiyatli lokal savegacha saqlaydi. Ayni guruh/request eski yakunlangan urinishga ham bog'lanadi; yangi vaqt bermaydi. Lokal yozuvda kod/ism yo'q, fingerprint va operatsiya IDsi bor. | `public/js/student/start-request.js`; `school-entry.js`, `entry-session.js`, `legacy-home.js` |
| Draft va submit alohida yozilib, natijadan keyin draft o'tishi mumkin edi | Submit avval urinishning o'z CAS yozuvida `completion` qarorini va javoblarini muzlatadi. Draft ayni ETag uchun kurashadi, `completion`dan keyin yozolmaydi. | `completion-service.mjs` → `completeAttempt`; `draft-service.mjs` → `saveDraft` |
| Parallel/kech submit boshqa javobni baholashi mumkin edi | Birinchi muvaffaqiyatli `completion` o'zgarmaydi. Natija o'sha qarordan `onlyIfNew` bilan yaratiladi. Yangi mijoz versiya yuboradi; serverdagi draft versiyasi teng yoki yuqori bo'lsa server nusxasi olinadi. | `scoring-service.mjs`, `completion-service.mjs`, `submission.js` |
| Qisman yakunlashdan keyin tiklash | Muzlatishdan keyin result yozuvi uzilsa resume/submit uni yaratadi. Resultdan keyin finished belgisi uzilsa saqlangan result qaytarilib belgi tuzatiladi. Adminning scoped catch-upi ham muzlatilgan yozuvni tiklaydi. | `resumeAttempt`, `completeAttempt`, `finalizeExpiredAttempts` |
| Teng versiyadagi turli draftlar yoki eskirgan mijoz | Past versiya yangisini bosmaydi; teng versiyada boshqa javob 409. UI serverdagi yangi nusxani olib, javoblar va versiyani birga yangilaydi. Public javobda kalit yo'q. | `draft-service.mjs`, `public/js/student/draft-sync.js`, `test.js` |
| Retake so'rovi retryda ikki marta qo'shilishi | Admin UI bir mantiqiy amal uchun saqlangan requestId yuboradi. Retake CAS yozuvi requestni qayd qilib, +1ni bir marta qo'shadi. Turli requestlar yo'qolmasdan alohida +1 bo'ladi. | `retakes-repo.mjs`, `result-service.mjs`, `routes/admin/results.mjs`, `teacher/retake-request.js` |
| Yakunlashda storage xatosi yashirilardi | Yuborish xabarida haqiqiy `saveAttempt` natijasi ishlatiladi; joy yetmasa "qurilmada saqlandi" deyilmaydi. | `public/js/student/submission.js` |
| Vaqt sozlanmaganida UI cheksiz vaqt ko'rsatardi | Mavjud 24 soatlik `expires` start/resume DTOda deadline sifatida ham beriladi; tasdiqlash matni shu chegarani aytadi. | `attempt-service.mjs`, `draft-service.mjs`, `entry-view.js` |

`attempt-starts` ombori `blob-store`ning maktab bo'yicha yopiq omborlariga qo'shildi. Snapshotdagi javob kaliti faqat serverda; public start `q/options`ni beradi. Legacy clear yangi texnik rezervlarni ham tozalaydi, aks holda eski hisoblagich qolib ketardi. Backup formati yoki restore vakolati kengaytirilmadi.

## Aniq qabul va baholash tartibi

1. **Start:** serverdagi oxirgi validatsiyadan o'tgan CAS rezerv qabul nuqtasi. Deadline shu g'olib rezervdagi server vaqtidan hisoblanadi; urinishni alohida yozish/retry yangi vaqt bermaydi. Eski yozuvlar birinchi kirishda guruh hisobiga olinadi; ularning ID, ball va savollari qayta yozilmaydi.
2. **Vaqt:** start + limit va jadval oxirining eng ertasi; ikkalasi yo'q bo'lsa 24 soat. Brauzer vaqti server ruxsati emas. Jadvalni keyin qisqartirishning avvalgi xatti-harakati saqlandi; Q4siz yangi siyosat tanlanmadi.
3. **Draft:** payload tekshirilgan, muddatdan oldin server CAS callbackida tasdiqlangan va yozilishi muvaffaqiyatli tugagan yangilanish qabul qilingan hisoblanadi. `acceptedAt` shu g'olib urinishdagi server vaqtidir. CAS to'qnashsa callback qayta ishlaydi va vaqt qayta tekshiriladi. HTTP so'rov yuborilgan/yetgan vaqt yoki lokal save o'zicha yetarli emas. Server tasdiqlamagan tarmoq xatosida yozuv holati noma'lum bo'lishi mumkin; resume/retry aniqlaydi.
4. **Chegara:** muvaffaqiyatli CAS taklifidagi server tekshiruvi `now >= deadline` bo'lsa yangi javob olinmaydi. Tarmoqdagi Blobs yozuvining tugash vaqti aynan deadline bo'lishi kafolatlanmaydi: muddat ichida tekshirilgan va keyin tasdiqlangan write qabul qilingan hisoblanadi. Mijoz soati va yuborish timestampi ishlatilmaydi.
5. **Final:** deadlinegacha server draftidan yuqori versiyali submit o'z javobini muzlatadi. Teng/past versiyali submit oxirgi server draftini oladi. Submit oldin muzlatsa keyingi draft 409; draft oldin o'tsa submit qayta CASda uni ko'radi. Deadline o'tsa submitning yangi javobi emas, o'sha paytgacha qabul qilingan server drafti muzlatiladi.
6. **Natija:** `completion → results onlyIfNew → finished`. Uch yozuv umumiy tranzaksiya deb olinmaydi; oraliq holatlar qayta so'rov bilan tiklanadi. Bitta urinishga bitta natija IDsi. Ball/javoblar qayta submitda almashtirilmaydi; sharh har qaytarishda avvalgi joriy ruxsat siyosatidan filtrlanadi.
7. **Moslik:** eski mijozdagi requestId/version yo'qligi format xatosiga aylantirilmadi. Versiyasiz yakuniy yuborish avvalgi kabi o'z payloadi bilan, deadline ichida CAS orqali muzlatiladi. RequestIdsiz eski mijoz uchun yakundan keyingi kech startni asl startdan ajratib bo'lmaydi; yangi adapterlar requestId yuboradi. Eski requestIdsiz retake har chaqiriqda +1; retry kafolati yangi IDli amalda mavjud.

CAS Netlify Blobsning `onlyIfNew`/`onlyIfMatch` shartlariga tayanadi. Jarayon ichidagi navbat yoki lokal lock yagona himoya emas. Bir nechta scoped yozuvni atomik o'zgartirish da'vo qilinmaydi. Legacy yozuvlar uchun boshlang'ich sanash mavjud listingga tayanadi; eski va yangi writerlarni bir vaqtda turli versiyada uzoq ishlatish xavfsiz migratsiya usuli emas.

## Internet, oynalar va kechikkan yakunlash

UI har javobni lokal saqlashga urinadi, keyin 1,2 soniyalik tanaffus bilan serverga yuboradi. Offline status lokal va server saqlashini ajratadi. Internet tiklanganda draft yoki pendingSubmit qayta yuboriladi; reload/resume server nusxasini versiya bilan kelishtiradi. Fresh sahifani oflayn yuklash uchun PWA yaratilmagan.

Web Locks himoyasi saqlandi. `localStorage` lease fallbacki atomik emas; u ikki zararli mijozni serverda ajratadigan oyna identifikatori emas. Owner, monoton versiya, completion va bitta result serverda alohida himoya bo'lib qoladi. Yangi qurilmaga ism+kod bilan eski urinish berilmaydi.

Yangi cron yoki global huquqli scheduler qo'shilmadi. Mavjud HTTPga bog'liq yakunlash yetarli: o'z urinishining resume/submiti va maktab adminining natijalar ro'yxati deadline o'tganini tekshiradi. Admin catch-up faqat o'sha maktabning pending/attempt/test yozuvlarini oladi; parallel ishga tushish bir completion/resultni qayta yozmaydi. Muzlatilgan, resulti yetishmayotgan urinish deadlinegacha ham tiklanadi.

Bu real vaqtda result paydo bo'lishini kafolatlamaydi: so'rov kelmasa yozuv keyingi tegishli so'rovgacha kutiladi. Bahoga qo'shiladigan javoblar chegarasi o'zgarmaydi, `time` timeoutda deadline bo'ladi. Fon jadvali yoki SLA zarur bo'lsa, alohida topshiriqda hosting ruxsati va maktablar bo'yicha doirasi bilan loyihalanadi. Pending indeks write bilan umumiy tranzaksiya emas; indeks yozuvi uzilgan holatni egasining resume/submiti tiklay oladi, adminsiz darhol yakunlash kafolati yo'q.

## Bajarilgan lokal tekshiruvlar

4 ta alohida Node worker instansiya haqiqiy router → services → repositories orqali ishladi. Umumiy izolyatsiyalangan localhost HTTP ombori ETag CASni bajardi. Har workerning modul keshi va jarayon ichki qulflari alohida; bazaga yozish faqat shu xotira serverida. Qo'shimcha Chrome sinovlari boshqa xotira adapterida haqiqiy sahifa/modullar bilan bajarildi. Bu production infratuzilmasining yuklama yoki tarmoq kafolatlari bo'yicha sertifikat emas.

| Talab / ssenariy | Haqiqiy natija |
| --- | --- |
| 1. Bitta startni parallel yuborish | 12 so'rov, 4 instansiya: bitta attemptId va bitta yozuv; startda kalit yo'q |
| 2. Limitdagi oxirgi urinish | +1 ruxsatdan keyin 12 parallel start: bitta qo'shimcha urinish; limitsiz uchinchi urinish yo'q |
| 3. Takroriy/parallel submit | 12 so'rov: bitta natija, ball bir xil; past versiyali submit serverdagi yangiroq draftni bosmadi |
| 4. Draft teskari tartibi | v2 keyin v1: v2 saqlandi; teng v2 boshqa javobga 409 |
| 5. Draft/submit poygasi | 8 takror: completion bilan muzlatilgan javob saqlandi, yakundan keyin draft rad |
| 6. Deadline oldin/keyin | Oldingi server drafti baholandi; keyingi draft 409, kech submit javobi qo'shilmadi; jadval limitdan oldin bo'lsa jadval olindi |
| 7. Internet/reload/resume | Chrome: offline lokal save, online server save, reloadda javob saqlandi; offline submit online bo'lgach bitta natijaga yetdi |
| 8. Token/egalik | Noto'g'ri token 401, boshqa browserKey 403 |
| 9. Maktab doirasi | B admin A natijasini ololmadi (404); B startiga A sinfi 403; catch-up A ni yakunlab B ni o'zgartirmadi |
| 10. Retake | Ayni request 12 marta: +1; 8 boshqa parallel request: +8, yo'qolgan yangilanish yo'q |
| Yozuvlar orasidagi uzilish | Start rezervidan keyin attempt create; completiondan keyin result create; resultdan keyin finished write sun'iy xatosi: keyingi request asl ID/qarorni tikladi |
| Ikki oyna | Chrome Web Locks: ikkinchi oynada test yozishi yopildi |
| Saqlash xatosi | Chrome QuotaExceededError: draft/yakunlashda yolg'on "qurilmada saqlandi" xabari yo'q |
| UI operatsiya IDsi | Chrome: start ID reload/retryda saqlandi, tasdiqdan keyin yangilandi; lokal yozuvda ism yo'q. Admin retake 503dan keyin ayni requestId bilan qaytdi va muvaffaqiyatda uni olib tashladi. |
| Qurilma soati | Chrome Date.now 10 soatga siljiganda performance asosidagi taymer keskin o'zgarmadi |
| Moslik va cheklov | Versiyasiz submit ishladi; boshqa brauzerdagi ismdoshlar alohida; vaqt sozlanmagan startda DTO 24 soat |
| Sessiya | Lokal logoutdan keyin eski admin tokeni 401 |
| O'chirilgan natija | Yakunlangan urinish natijasini admin o'chirgach resume 409; natija qayta yaratilmaydi. Shu himoyadagi parallel submitning oraliq poygasi qayta result o'qish bilan tuzatilib, 12 submit sinovi qayta o'tdi. Bir vaqtdagi admin o'chirish/submit siyosati bu bosqichda kengaytirilmadi. |
| Netlify Dev | `npm run dev -- --port 8890 --internal-disable-edge-functions` offline ishga tushdi; `/`, `/test.html`, yangi start-request moduli HTTP 200; yozadigan request yuborilmadi |

Bir martalik yordamchilar va dalillar `.local/stage2-*`da Gitdan tashqarida. `tests/`, doimiy audit skripti, yangi test dependency yoki package test buyrug'i qo'shilmadi. Sun'iy uzilishdagi 500lar kutilgan dalil; ularning keyingi tiklanishi alohida tekshirildi. Dastlab QA kutgan 201 o'rniga idempotent 200 va noto'g'ri modal selektori tuzatilib sinovlar qayta bajarildi; ular mahsulotdagi muvaffaqiyat sifatida yashirilmagan.

`npm run check` va `npm run build`: 217 faylda o'tdi. O'zgargan kod Prettier bilan formatlandi; JS/MJS sintaksisi va whitespace alohida tekshirildi. `check/build` funksional sinov o'rnida berilmaydi.

## Qolgan qarorlar va 3-bosqichga tayyorlik

- Texnik start/limit/draft/submit/recovery bo'yicha yuqoridagi 10 ssenariy lokal o'tdi. Mahsulotning barcha 2-bosqich mezonlari to'liq yopildi deb belgilanmaydi: Q3ning ayni qurilmadagi ismdoshlar, o'qituvchi tasdig'i, ism tuzatish va qurilma almashtirish qismlari ochiq. Hozirgi brauzer guruh limiti inson boshiga qat'iy limit emas.
- Oddiy blok/pauza, keyingi jadval tahriri, yakunlangan testni ochish, obuna gate va sharh e'loni uchun Q2/Q4/Q5/Q6 kutiladi. Ushbu topshiriq ular uchun yangi siyosat yaratmadi.
- Start/revoke registri bilan attempt rezervi umumiy CAS emas; 1-bosqich E10/TC-09 bo'shlig'i qolgan. Ushbu tuzatish ayni guruhning start limiti va retry izchilligiga tegishli, kodni bekor qilishning atomik qabul kafolati deb talqin qilinmaydi.
- Avvaldan qolgan shaxsiy kod generatsiyasi/backfill va legacy kirish yangi kod tizimi sifatida kengaytirilmadi; uni olib tashlash alohida P0-1 doirasidir. Eski format mosligi saqlandi.
- Request bog'lanishlari va texnik rezervlar uchun avtomatik retention hali yo'q (Q7); ularni o'chirish retry/limit tarixini yo'qotmasligi kerak. Full backup, restore, DOCX, to'lov va production migratsiyasi qo'shilmadi.
- 3-bosqich uchun lokal tekshirilgan atomik rezerv/freeze mexanizmi, versiyali DTO va yuqoridagi qabul dalillari tayyor. Modelga bog'liq ish boshlanishidan oldin Q3, zaruratiga ko'ra Q2/Q4 qarori yozilishi kerak. Deploy alohida buyruqsiz bajarilmaydi.
