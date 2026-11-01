# Arxitektura

## O'quvchi kirish wizardi (2026-11-01)

`public/index.html` endi bitta formadagi to'rtta fieldsetdan iborat: kod, sinf, ism/familiya, tasdiqlash. Bir vaqtda faqat bittasi ko'rinadi va faol bo'ladi. `home.js` sahifani ulaydi; `entry-wizard.js` bosqichlar va busy holatini, `entry-view.js` accessibility/validatsiya/escape qilingan summaryni, `school-entry.js` server resolveri va uning eskirgan javoblarini boshqaradi. Kodlar faqat sahifa xotirasi va POST bodyda, URL/storagega yozilmaydi.

`entry-session.js` yangi startni saqlash va serverdan tekshirilgan davom etishni ajratadi. Urinish almashtirish tasdiq talab qiladi; eng yangi draft versiyasi saqlanadi. Banner faqat token va brauzer kaliti bilan server tekshiruvidan keyin ko'rsatiladi. Davom etishda server muddati va natija qayta olinadi; tugagan urinish natijaga o'tadi. Qurilmadan olib tashlash server yozuvini o'chirmaydi. Start va davom etish bir vaqtda ishga tushmaydi.

Sahifa kengligi/layout/responsive uslublari `student-entry.css`da; progress, fieldset, maydon xatolari va summary `student-wizard.css`da. Eski `.start-layout`/mobil `.tip-card` qoidalari yangi wizardga ta'sir qilmaydi. Umumiy token, input, button, card va dark theme qayta ishlatiladi. Eski maktabsiz oqim `public/eski-testlar.html` va `student/legacy-home.js`da saqlangan; `/?legacy=1` shu sahifaga yo'naltiriladi.

Server endpointlari o'zgarmadi: resolve faqat tegishli sinflarni beradi, start barcha kirish qiymatlarini qayta tekshiradi, draft/resume/submit imzolangan urinish va brauzer egaligiga bog'langan. Wizard bosqichi URLdan olinmaydi; DOMni o'zgartirish server tekshiruvini bekor qilmaydi. Bir martalik QA haqiqiy router/repositoryni xotira Blobs adapteri bilan alohida jarayonda ishlatadi; diskdagi yoki production ma'lumotlarni o'zgartirmaydi.

2026-11-01 tozalash: foydalanuvchi talabiga ko'ra `tests/` va test/audit/integratsiya skriptlari olib tashlandi. `scripts/`da faqat tuzilma tekshiruvi, lock normalizatsiyasi va mustaqil lokal ID migratsiyasi qolgan. Netlify build `npm run build` orqali `check`ni bajaradi. Quyidagi oldingi bosqichlar sinov natijalari tarixiy holatni bildiradi.

## Qisqa maktab IDsi va kodli kirish (2026-11-01)

Ichki `schools.id` va barcha `schoolId` bog'lanishlari o'zgarishsiz qoladi. Foydalanuvchiga alohida `public_school_id` (`SK-1001`, `SK-10000`, ...) ko'rsatiladi. Quyidagi oldingi A bosqichi tavsifidagi bitta ID haqidagi qaror endi faqat ichki UUIDga tegishli.

`lib/public-school-id` format va rezerv qoidalarini, `repositories/public-school-ids-repo` esa `public-school-ids/registry` global CAS yozuvini boshqaradi. `last`, `bySchool` va `byPublic` bir shartli yozuv bilan o'zgaradi. `onlyIfNew`/`onlyIfMatch` va qayta urinishlar workerlar orasidagi takror raqamni oldini oladi. Jarayon uzilganda UUIDga rezerv qilingan kod qayta ishlatiladi; maktab yo'qolsa ham rezerv o'chirilmaydi. Blobs atomikligi tufayli bu loyiha PostgreSQL sequence talab qilmaydi. Bu sequence kabi oraliq bo'sh raqamlarga yo'l qo'yadi.

`school-id-migration-service` faqat maktab yozuviga maydon qo'shadi, mavjud kodlarni oldin rezervlaydi va raqamni eng katta band qiymatdan davom ettiradi. Dry-run yozmaydi; ikki nusxadagi kod yoki rezerv ziddiyatida jarayon rad etiladi. Rezerv va maktab yozuvi orasidagi uzilish qayta apply bilan tiklanadi. HTTP apply faqat `NETLIFY_DEV=true`; skript localhostdan tashqariga yozishni rad etadi. Production migratsiya alohida tasdiq va boshqariladigan ishga tushirishni talab qiladi.

`POST /school-entry/resolve` va `/school-entry/start` qisqa IDni UUIDga aylantiradi, shu UUID doirasidagi faol kod, test, jadval va sinfni tekshiradi. Javob maktab UUIDsi, roster va javob kalitini bermaydi. Kodlar faqat POST bodyda, URL/storagega yozilmaydi; IP va IP+maktab limitlari bor. Bir xil umumiy raqam ikki maktabda bo'lishi mumkin: u har doim maktab doirasida talqin qilinadi.

`school_student` faqat xizmat ichida yaratiladigan access kontekstidir; admin avtorizatsiyasi uni qabul qilmaydi. Urinish tokenidagi imzolangan `schoolId` draft/resume/submit kontekstini belgilaydi; brauzer egaligi, muddat, draft versiyasi va bitta natija qoidalari saqlanadi. Kirishda shaxsiy kod talab qilinmaydi; ism/familiya rosterga majburan bog'lanmaydi. Urinish limiti maktab/test/sinf/ism/brauzer doirasida; insonning tasdiqlangan shaxsi sifatida talqin qilinmaydi.

Frontend: `student/home.js` sahifa kirishi, `student/school-entry.js` kod tekshirish va start adapteri. Bosh admin kartalari va maktab admini qisqa IDni ko'rsatadi/nusxalaydi. Eski maktabsiz test APIlari va `/?legacy=1` sahifasi moslik uchun saqlangan; ular maktab testlarini ochmaydi.

## Maktab ID topshirig‘i: A implementatsiyasi

Maktabning ichki va ko‘rsatiladigan IDsi bir xil UUID v4. `school-create-service` `school-requests` repositorysida admin+requestId bo‘yicha payload hash va nomzod IDni rezerv qiladi, so‘ng maktabni `onlyIfNew` bilan yaratadi. Takror so‘rov o‘sha maktabni qaytaradi; begona band IDda yangi nomzod olinadi. `creationKey` public javobdan chiqariladi. IDni tahrirlash body’dagi barcha qo‘llanadigan aliaslarda rad etiladi. Maktab o‘chirish endpointi yo‘q; arxiv yozuvi saqlanadi. Eski IDlar yoki faqat blob kaliti mavjud bo‘lsa, o‘qishda moslashtiriladi; avtomatik yozish/migratsiya yo‘q.

`school-service` ID/nom qidiruv, tafsilot, nom/hudud, holat va obunani boshqaradi. `school.mjs` xavfsiz DTO va serverdagi obuna faolligi hisobini beradi. `school-stats-service` faqat bosh admin uchun `school-stats-repo` orqali sanog‘larni oladi: global test/urinish va maktab kesimida sinf/test/urinish/natija. Repository individual yozuvni qaytarmaydi; maktabsiz yoki noma’lum maktabga havolali yozuvlar alohida ko‘rsatiladi. Hozir sanash omborlarni pagination bilan o‘qiydi, real-time counter tranzaksiyasi emas.

`school-access-service` login va har admin so‘rovida maktab sloti, holati va server sessiyasidagi `schoolVersion`ni tekshiradi. Holat o‘zgarishi yangi maktab sessiya versiyasi beradi; eski token unblockdan keyin ham rad etiladi. Faqat logout o‘z hisob/sessiya dalili bilan maktab blokidan mustaqil bajarilib, server sessiyasini o‘chiradi. Mavjud, holati/versiyasi yozilmagan maktablar aktiv deb o‘qiladi va sessiyalar asossiz bekor qilinmaydi. O‘quvchi tokeni/urinishlari bu A bosqichida o‘zgarmaydi.

Frontend: `super-admin/index.js` navigatsiya/yuklash, `forms.js` formalar va yaratish retry dalili, `school-view.js` card/agregat ko‘rinish, `api.js` sessiyali so‘rovlar. `core/clipboard.js` ikki admin panelida ID nusxalash uchun ishlaydi. `super-admin.css` mavjud layout/componentlarni kengaytiradi. Inline script/style va framework yo‘q.

## A bosqichi: umumiy test kodi

`lib/test-code.mjs` xavfsiz 6 raqamli satr, HMAC rezerv va AES-256-GCM shifrlashni, `test-code-policy.mjs` noyoblik/versiya/holat qoidalarini bajaradi. `test-code-service` faqat joriy `school_admin` va uning testiga kod beradi. `test-codes-repo` alohida `test-codes` omborida maktab registrini saqlaydi; bu ombor ham `blob-store` egalik filtriga kiradi. Maktab registrining test yozuvi va band digestlari bitta shartli yozishda yangilanadi; parallel yaratish yoki replace yo‘qolgan yangilanish bermaydi.

Kod test savollari bilan bir yozuvga aralashtirilmaydi. `test-service` admin create/detail/list/toggle/duplicate javobiga `testCode: {value,state,version}`ni qo‘shadi; bazadagi test yoki public javobga shu maydon yozilmaydi. Eski `findTest` ichki xatti-harakati saqlangan, admin tafsiloti uchun `findAdminTest` alohida. Kodni boshqarish: `POST /api/admin/tests/:id/code`, body’da `action` (`activate`, `revoke`, `replace`) va joriy `version`. Faqat bekor kod almashtiriladi; nusxa test yangi nofaol kod oladi. Test savollari tahriri kodni almashtirmaydi; kod holati test revision/deadline’ga tegmaydi.

HKDF maqsadlari shifrlash, rezerv va kalit identifikatori uchun ajratilgan; sir manbai `TOKEN_SECRET`. Uni almashtirishdan oldin kodlarni qayta shifrlash/kalit migratsiyasi kerak. Registr `keyId` mos kelmasa 503 bilan yopiladi, kod qayta yaratilmaydi. Oddiy zaxira kod registri yoki ochiq kodni eksport qilmaydi; maktab admini qiymatni faqat o‘z yopiq panelida qayta oladi. Bu yangi foydalanuvchi topshirig‘i oldingi bir martalik ko‘rsatish talabini almashtiradi.

UI `teacher/test-codes.js` umumiy kod bo‘limi va clipboard/holat amallarini, `pages/test-codes.css` raqam ko‘rinishini boshqaradi. `test-code` generatori shaxsiy `student-code` mexanizmidan mustaqil; legacy kirish A doirasida o‘zgartirilmaydi. Kodni o‘quvchi uchun tekshirish/start va guessing limitlari B bosqichiga qoldirilgan.

## 1.1 rol va maktab chegarasi

`account-service` login/parolli `super_admin` va `school_admin` hisoblarini boshqaradi. Hisoblar `admin-accounts`, minimal maktab yozuvlari `schools` omborida. Router umumiy sessiya yo‘llari, maktab amallari va `/super-admin/` yo‘llarini alohida tekshiradi. Tokenning imzolangan `accountLogin` qiymati server hisobi va sessiyasi bilan qayta tekshiriladi; rol/parol hashiga frontend orqali ishonilmaydi.

`lib/access-context.mjs` AsyncLocalStorage orqali so‘rovning server tasdiqlagan rol/maktab kontekstini repositorylargacha olib boradi. `blob-store` sinf, test, natija, urinish, pending indeks va retake omborlari uchun o‘qishni filtrlab, yangilash/o‘chirishda egalikni tekshiradi; scoped yozuvni server `schoolId` bilan belgilaydi. Scoped o‘qishlar umumiy keshdan foydalanmaydi. Kontekstsiz public oqim faqat egasi hali biriktirilmagan legacy yozuvlarni oladi; yangi maktab o‘quvchi oqimi keyingi bosqichga qoladi.

Eski `settings/auth` va parolli kirish `legacy_admin` sifatida saqlanadi: faqat `schoolId` yo‘q yozuvlar, bosh admin vakolatisiz. Mavjud yozuvlarga avtomatik maktab biriktirilmaydi. Yangi adminlar uchun restore/clear siyosat aniqlanmaguncha rad etiladi; eski restore ham begona maktab yozuvini repository orqali bosolmaydi. Ko‘p yozuvli hisob tayinlash inactive hisob → maktab sloti → active hisob tartibida; bir xil login/parol bilan qayta yuborish uzilgan operatsiyani davom ettiradi. Parallel yutqazgan rezerv inactive qolishi mumkin, hech qanday sessiya olmaydi.

Bosh adminning bootstrap qiymatlari `SUPER_ADMIN_LOGIN` va `SUPER_ADMIN_PASSWORD` muhitidan olinadi, mavjud o‘qituvchi paroli qayta ishlatilmaydi. Birinchi yaratilgach hash server hisobida saqlanadi; muhitdagi parolni o‘zgartirish mavjud hisob parolini almashtirmaydi. Login/parol yaratish uchun minimal bosh admin UI `public/bosh-admin/index.html`, kirish moduli `public/js/super-admin/index.js`. To‘liq ID/migratsiya, monitoring va 1.3–1.6 funksiyalari hali keyingi bosqichlardir.

Framework, CDN, tashqi shrift va frontend build yo'q. Netlify statik `public/`ni tarqatadi, v2 Function server routerini chaqiradi.

Netlify build tuzilma tekshiruvini bajarib, keyin Functions'ni yig'adi. Node minimumi Blobs talabiga mos: 22.12.0. Lokal ID migratsiyasi skripti localhostdan tashqariga yozishni rad etadi.

## Papkalar vazifasi

| Papka | Vazifa |
| --- | --- |
| `public/` | Faqat brauzerga beriladigan HTML/CSS/JS va statik fayllar |
| `public/css/` | `styles.css` importlari: tokens, base, layout, komponent va sahifa uslublari |
| `public/js/core/` | API client, sessiya, DOM escape, format, saqlash, mavzu |
| `public/js/components/` | Mustaqil modal, toast, jadval, sidebar va boshqa umumiy UI |
| `public/js/student/` | Home, test runner, natija, taymer, xarita, saqlangan urinish |
| `public/js/teacher/` | Har sahifa kirishi, ma'lumot va UI boshqaruvi |
| `server/routes/` | HTTP usuli, URL, body va javob statusini xizmatga moslashtirish |
| `server/services/` | Ruxsat, jadval, urinish, baholash, CRUD va tahlil qoidalari |
| `server/repositories/` | Netlify Blobs o'qish/yozish, pagination, kesh va atomik amallar |
| `server/lib/` | Aiken parser, HMAC, parol, validatsiya va HTTP yordamchilari |
| `server/migrations/` | Eski yozuvlarni o'qishda buzmasdan moslashtirish |
| `scripts/` | Tuzilma tekshiruvi, lock normalizatsiyasi va lokal maktab ID migratsiyasi |
| `samples/` | Asosiy namuna test fayli |

```text
HTTP → netlify/functions/api.mjs → server/router.mjs
     → routes/ → services/ → repositories/ → Netlify Blobs

HTML → js/<rol>/<sahifa>.js → core/ + components/
```

`api.mjs` 20 qatordan, boshqa loyiha fayllari 250 qatordan oshmaydi. `node_modules`, Git, `.netlify`, maxfiy `.env` va sinov artefaktlari loyiha manba kodi hisoblanmaydi. Avtomatik lock JSON bir qatorda saqlanadi; kodni qisqartirib limitdan qochish uchun minifikatsiya ishlatilmaydi.

## Qatlamlar qoidasi

- Route'da Blobs, baholash yoki yozuvlarni o'zgartirish mantiqi bo'lmaydi. U xizmatga uzatadi.
- Service faqat repository interfeysini chaqiradi; `getStore` yoki pastki `blob-store.mjs` adapterini import qilmaydi.
- `@netlify/blobs` importi faqat `repositories/`da. `onlyIfNew` natijani takror yozishdan, ETag shartlari hisoblagichlardagi yo'qolgan yangilanishlardan saqlaydi.
  API shartlari: [Netlify Blobs rasmiy yo'riqnomasi](https://docs.netlify.com/build/data-and-storage/netlify-blobs/).
- Netlify Dev shartli yozish emulyatoridagi parallel poyga uchun repository lokal workerlar orasida vaqtinchalik fayl lock ishlatadi. Bu faqat `NETLIFY_DEV=true` holatida; production'da Blobs atomik shartlari ishlaydi.
- Javoblar bilan savollar faqat admin va serverda. Ochiq test hamda boshlash javobida kalit yo'q.
- Aiken parser brauzerga ko'chirilmaydi: `POST /api/admin/tests/preview`.
- Eski `/api/admin/preview` va `/teacher.html` havolalari moslik uchun saqlangan.
- Markupda inline script, style va event atributi yo'q. JS hodisa tinglovchilarini modul ichida ulaydi.
- Umumiy UI copy-paste qilinmaydi. Sahifa fayli faqat o'z vazifasini boshqaradi.
- Mutlaq qiymat konstantalari `UPPER_SNAKE_CASE`, funksiyalar `camelCase`, kod fayllari kichik harf va defis bilan yoziladi.

## Yangi sahifa qo'shish

1. Tegishli `public/` yoki `public/oqituvchi/`da markup fayli yarating.
2. `public/js/<rol>/<sahifa>.js` kirish modulini ulang; umumiy qismlarni core/components'dan import qiling.
3. Faqat zarur sahifa uslubini `css/pages/`ga qo'shib, `styles.css`ga import yozing.
4. Panel sahifasi bo'lsa `components/sidebar.js` navigatsiyasini yangilang.
5. Sahifani lokal brauzerda tekshiring; `npm run check` va `npm run build`ni bajaring.

## Yangi endpoint qo'shish

1. `routes/public/` yoki `routes/admin/`da HTTP adapter yarating va `routes/index.mjs`ga ulang.
2. Biznes qoidalarini bitta xizmat moduliga yozing.
3. Yangi ombor bo'lsa repository yarating; bor repositoryni qayta ishlating.
4. Yangi endpoint odatda `routes/ + services/ + repositories/` bo'ylab o'tadi, biroq bor xizmat/repository uchun nusxa yaratilmaydi.
5. Muhim ruxsat va xato holatlarini lokal HTTP oqimida tekshiring; olib tashlangan test infratuzilmasini alohida topshiriqsiz qaytarmang.

## Ma'lumotlar va cheklovlar

Omborlar: `tests`, `classes`, `results`, `attempts`, `retakes`, `settings`, `limits`. Test/sinf o'qishlari 5 soniya keshga olinadi; baholash va ruxsatda yangisi olinadi. Savollar nusxasi urinishda, javoblar va tartib natijada saqlanadi. Ko'p yozuvli tiklash/tozalash tranzaksiya emas. O'quvchilar uchun alohida hisob/parol hozirgi modelga kirmaydi.

Auditdan keyin `sessions` server logout uchun, `pending-attempts` yakunlash indeksi uchun ishlaydi. Adminning token versiyasi tasodifiy, parolga bog'lanmagan. Ro'yxatli o'quvchi shaxsiy kod bilan, urinish esa brauzer kaliti bilan tekshiriladi. Ochiq `/classes/:id/students` endi roster bermaydi.

`lib/password-policy.mjs` bootstrap, kirish va yangi parol uchun 6–12 belgi chegarasini belgilaydi. `/admin/session` ikkala chegarani panelga beradi. `components/password-field.js` kirish va sozlamalarda parolni ko'rsatish/berkitishni boshqaradi; tugma formani yubormaydi va klaviaturada ishlaydi. Eski muhit minimumi qo'llanmaydi.

`POST /attempts/draft` muddat va monoton draftVersion'ni tekshiradi; `POST /attempts/resume` server vaqti, server drafti yoki tayyor natijani qaytaradi. Yangi modul chegaralari: attempt-access, draft, completion va student-result xizmatlari. Natija kaliti har javobda joriy test siyosatidan quriladi; eski publicResult bevosita qaytarilmaydi. Serverga yetmagan kechikkan javoblar bahoga qo'shilmaydi. Tugallanmagan urinish muddatdan keyingi natija/tiklash so'rovida yakunlanadi; alohida fon jadvali yo'q.
