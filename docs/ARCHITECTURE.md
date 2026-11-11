# Arxitektura

## Umumiy panel kartalari (2026-11-05)

`teacher/class-card-view.js` va `pages/class-cards.css` sinf kartalarini ajratadi; `classes.js` sahifa va mavjud amallarni ulaydi. Menyu `components/card-menu.js` + `css/components/card-menu.css`, dekorativ SVG `components/card-icons.js`, sana `components/card-time.js` orqali test va sinf kartalarida umumiy. `card-overlay-*` hooklari karta fonini inert qilish, markaziy oyna va fokusni boshqaradi. Oldingi teacher/test-card-menu.js, teacher/test-card-icons.js va pages/test-card-menu.css shu umumiy joylarga ko'chirilgan. Roster/progress hisoblash va admin API/auth o'zgarmagan.

2026-11-05 yangilanish: foydalanuvchi so'rovi bilan menyuga joy ajratish o'rniga karta ustida markaziy oyna qo'llandi. Karta balandligi o'zgarmaydi; fon xiralashadi va shu kartadagi fon boshqaruvlari vaqtincha inert bo'ladi. Amallar oynasi non-modal dialog sifatida belgilangan, Tab/Shift+Tab fokusni oynada saqlaydi; Escape va tashqariga bosish yopadi. Menyu kerak bo'lsa viewportga olib kelinadi. 320/390/768/1280pxda markaz, o'zgarmagan karta balandligi, ko'rinish chegarasi, fokus va inert holatini qaytarish tekshirildi; JS xatosi yo'q. UI tekshiruvida admin API javoblari taqlid qilindi.

## O'qituvchi test kartalari (2026-11-05)

`teacher/tests.js` karta markupini `test-card-view.js`ga, dekorativ SVGni `test-card-icons.js`ga, menyu fokus/joylashuvini `test-card-menu.js`ga ajratadi. `test-codes.js` kod blokini va kod menyu amallarini beradi; handlerlari avvalgi admin APIga ulanadi. `pages/test-cards.css` va `test-card-menu.css` faqat ushbu komponent uchun import qilinadi. Eski teacher-cards.cssning testga xos qoidalari olib tashlandi; umumiy sinf kartasi qoidalari saqlanadi. Ochilgan menyu absolute, ammo header balandligida unga joy ajratiladi; kod doim ko'rinadi. Sana formatteri kartaga lokal, boshqa ekran formatlari o'zgarmagan. Public/API/server qatlamlari va ma'lumot sxemasi o'zgarmadi.

2026-11-05 joriy tanishuv: `entry-intro` yana `entry-main`ning birinchi elementi, `entry-layout` tashqarisida. Keng ekranda forma va yordam birinchi grid qatorida; oldingi o'ng ustundagi tanishuv joylashuvi foydalanuvchi so'rovi bilan bekor qilindi.

Wizardning joriy joylashuvi (2026-11-05): oldingi `entry-fields-scroll` o'rniga `entry-fields`, ichki overflow va viewport max-height yo'q. 600pxdan maydonlar/summary yonma-yon gridga joylashadi; keng ekranda ixcham oraliqlar formani sinovdan o'tgan viewportlarga sig'diradi. Legend accessibility uchun DOMda saqlanadi. Pastki amallar va mavjud barcha id/data-step/JS saqlangan; tarixiy ichki scroll tavsifi endi amalda emas.

Wizard formasi: `entry-fields-scroll` mavjud fieldset va xato bloklarini o'raydi, `entry-actions` uning tashqarisida qoladi. Mavjud id, data-step va JS handlerlari saqlangan. `entry-intro.css` keng ekranda karta/formani viewportga sig'diradi; ixcham ekranda amallar pastki panelda. Ichki scroll maydonlari klaviatura fokusi bilan ochiladi; backend va start mantig'i o'zgarmagan.

## Wizard tanishuv joylashuvi (2026-11-05)

`entry-intro` `test-kirish.html`dagi `entry-layout` ichida, forma oldida turadi. Faqat shu sahifaga ulangan `pages/entry-intro.css` 1024pxdan uni o'ng ustunda, formani chap ustunda joylaydi; ixcham ekranda DOM tartibida qoladi. Header, boshqa sahifa CSSi, wizard idlari va kirish mantig'i o'zgarmadi. Bu alohida tanishuv joylashuvi topshirig'i; to'liq 2-bosqich CSS konsolidatsiyasi hali bajarilmadi.

## Faol test navigatsiyasi (2026-11-05)

`components/student-header.js` odatiy header va `testMode` ko'rinishini ajratadi. `student/test.js` faol test ko'rinishini tanlaydi; ttl, prog, save-status, progress va test-nav-question-number idlari o'zgarmagan. `pages/student-navbar.css` oxirgi import sifatida faqat `.test-navbar`ni boshqaradi: 1024pxdan brend/meta/theme uch ustun, kichik ekranda meta alohida qatorda. Theme core moduli qayta ishlatiladi; yangi API va saqlash holati yaratilmagan. Taymer va yakunlash mavjud joyida qoladi.

## Umumiy matn shkalasi (2026-11-04)

`public/css/components/responsive-type.css` styles importlarining oxirida turadi. `--text-*` tokenlari matn vazifasini belgilaydi; rem va viewport qo'shilgan clamp 320-1280px orasida silliq o'sib, keyin yuqori chegarada qoladi. Savol 16-18px, variant/asosiy 15-16px, yordamchi 13-14px, bo'lim 18-22px, sarlavha 24-32px, hero 32-56px. Raqamlar standart 16px rootga tegishli; browser zoomi cheklanmagan. Worddan kelgan inline p/span shriftlarini faqat savol, variant va answer-detail ichida `font-size: inherit !important` me'yorlaydi; qolgan format, sub/sup, MathML va MathJax ichki o'lchamlari saqlanadi. Bu ko'rinish qatlamidagi o'zgarish; importer/model/API va mavjud contentga yozuv yo'q.

### Landing ulanishi

`public/index.html` ? axborot bosh sahifasi, forma yo'q. Kirishlar `/test-kirish.html` va `/oqituvchi/kirish.html`. `student/landing.js` wizardni yuklamaydi; `entry-session.js`dagi umumiy server tekshiruvli resume va core theme modulini ishlatadi. `discard` listeneri ixtiyoriy, tekshiruv/start/draft/egalik mantig'i o'zgarmagan. `css/pages/landing.css` `styles.css`ning oxirida, faqat landing selektorlari bilan ishlaydi. 600?1023px hero bitta, 1024pxdan ikki ustun; kartalar ikki/uch ustun. `/?schoolId=...` parametr bilan wizardga, `/?legacy=1` eski testlarga yo'naladi.

## Bosh sahifa va kirish (2026-11-04)

`/test-kirish.html` wizardning yangi manzili; `student/entry.js` uni ulaydi. Urinishsiz `/test.html` wizardga boradi. Natijadagi qaytish, adminlarning o'quvchi havolalari va header brendi `/`da qoladi. Maktab sahifasi `/oqituvchi/kirish.html` orqali ochiladi. API va Netlify qoidalari o'zgarmaydi. `/` axborot landing sifatida ajratilgan.

## 3-bosqich xavfsizlik yangilanishi (2026-11-03)

Tiklash previewi backup-previews omborida maktab doirasi, fayl SHA-256 xeshi, joriy ma'lumot izi va fayl bilan saqlanadi; tasdiqlash eskirgan holatda rad etiladi. Tiklashdan oldingi eksport backup-archives omborida saqlanadi; faol urinishlar bo'lsa tiklash rad etiladi va yozuvlar qisman hisobot bilan yuradi. Audit omboriga admin o'zgartirishlari va login holati yoziladi; uni ko'rsatadigan HTTP yo'li yo'q. ADMIN_SESSION_SECRET admin tokenlari, TEST_CODE_ENCRYPTION_KEY yangi test kodi shifrlashi uchun; TOKEN_SECRET eski imzolar va kodlar uchun moslikni saqlaydi. Batafsil: docs/backup-restore-security.md.

## Mahsulot siyosati uchun joriy manba (2026-11-03)

[Yagona mahsulot qoidalari](requirements/product-rules.md), [kod dalillari](requirements/product-evidence.md), [vakolatlar](requirements/roles.md) va [qarorlar/2-bosqich](requirements/product-decisions.md) talab bilan implementatsiyani ajratadi. Ushbu bosqichda qatlam, sxema va runtime o'zgarmadi. Quyidagi eski bosqich tavsiflari tarixiy kontekst: rollar, ID va kirish bo'yicha ularning keyingi yangilanishlari hisobga olinadi. Muhim joriy bo'shliqlar: shaxsiy kod yaratish qolgan, obuna startda tekshirilmaydi, revoke/start bitta atomik qabul emas, jadval/pauza eski urinishga ta'sir qiladi. Tavsiya etilgan qoralama holati, audit/retention va yangi obuna siyosati hali amalga oshirilmagan.

## Matematik content shartnomasi вЂ” B (2026-11-01)

`server/lib/content-model.mjs` content v1 uchun mustaqil AST validator va legacy text adapteridir. Text/paragraph/math/image/table/fallback allowlisti, nusxalash, tugun/chuqurlik/matn limitlari shu modulda. U sanitizer, asset avtorizatori yoki renderer emas va amaldagi savol APIlariga hali ulanmagan. Formula asl manbasi va private reference faqat xususiy modelda; public render DTOsi keyingi integratsiyada alohida tuziladi. To'liq shartnoma: `docs/implementation/math-import-stage-b.md`. Eski saqlash, shuffle, snapshot va backup hozircha o'z formatida qoladi.

## O'quvchi kirish wizardi (2026-11-01)

`public/test-kirish.html` endi bitta formadagi to'rtta fieldsetdan iborat: kod, sinf, ism/familiya, tasdiqlash. Bir vaqtda faqat bittasi ko'rinadi va faol bo'ladi. `entry.js` sahifani ulaydi; `entry-wizard.js` bosqichlar va busy holatini, `entry-view.js` accessibility/validatsiya/escape qilingan summaryni, `school-entry.js` server resolveri va uning eskirgan javoblarini boshqaradi. Kodlar faqat sahifa xotirasi va POST bodyda, URL/storagega yozilmaydi.

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

Frontend: `student/entry.js` sahifa kirishi, `student/school-entry.js` kod tekshirish va start adapteri. Bosh admin kartalari va maktab admini qisqa IDni ko'rsatadi/nusxalaydi. Eski maktabsiz test APIlari va `/?legacy=1` sahifasi moslik uchun saqlangan; ular maktab testlarini ochmaydi.

## Maktab ID topshirigвЂi: A implementatsiyasi

Maktabning ichki va koвЂrsatiladigan IDsi bir xil UUID v4. `school-create-service` `school-requests` repositorysida admin+requestId boвЂyicha payload hash va nomzod IDni rezerv qiladi, soвЂng maktabni `onlyIfNew` bilan yaratadi. Takror soвЂrov oвЂsha maktabni qaytaradi; begona band IDda yangi nomzod olinadi. `creationKey` public javobdan chiqariladi. IDni tahrirlash bodyвЂ™dagi barcha qoвЂllanadigan aliaslarda rad etiladi. Maktab oвЂchirish endpointi yoвЂq; arxiv yozuvi saqlanadi. Eski IDlar yoki faqat blob kaliti mavjud boвЂlsa, oвЂqishda moslashtiriladi; avtomatik yozish/migratsiya yoвЂq.

`school-service` ID/nom qidiruv, tafsilot, nom/hudud, holat va obunani boshqaradi. `school.mjs` xavfsiz DTO va serverdagi obuna faolligi hisobini beradi. `school-stats-service` faqat bosh admin uchun `school-stats-repo` orqali sanogвЂlarni oladi: global test/urinish va maktab kesimida sinf/test/urinish/natija. Repository individual yozuvni qaytarmaydi; maktabsiz yoki nomaвЂ™lum maktabga havolali yozuvlar alohida koвЂrsatiladi. Hozir sanash omborlarni pagination bilan oвЂqiydi, real-time counter tranzaksiyasi emas.

`school-access-service` login va har admin soвЂrovida maktab sloti, holati va server sessiyasidagi `schoolVersion`ni tekshiradi. Holat oвЂzgarishi yangi maktab sessiya versiyasi beradi; eski token unblockdan keyin ham rad etiladi. Faqat logout oвЂz hisob/sessiya dalili bilan maktab blokidan mustaqil bajarilib, server sessiyasini oвЂchiradi. Mavjud, holati/versiyasi yozilmagan maktablar aktiv deb oвЂqiladi va sessiyalar asossiz bekor qilinmaydi. OвЂquvchi tokeni/urinishlari bu A bosqichida oвЂzgarmaydi.

Frontend: `super-admin/index.js` navigatsiya/yuklash, `forms.js` formalar va yaratish retry dalili, `school-view.js` card/agregat koвЂrinish, `api.js` sessiyali soвЂrovlar. `core/clipboard.js` ikki admin panelida ID nusxalash uchun ishlaydi. `super-admin.css` mavjud layout/componentlarni kengaytiradi. Inline script/style va framework yoвЂq.

## A bosqichi: umumiy test kodi

`lib/test-code.mjs` xavfsiz 6 raqamli satr, HMAC rezerv va AES-256-GCM shifrlashni, `test-code-policy.mjs` noyoblik/versiya/holat qoidalarini bajaradi. `test-code-service` faqat joriy `school_admin` va uning testiga kod beradi. `test-codes-repo` alohida `test-codes` omborida maktab registrini saqlaydi; bu ombor ham `blob-store` egalik filtriga kiradi. Maktab registrining test yozuvi va band digestlari bitta shartli yozishda yangilanadi; parallel yaratish yoki replace yoвЂqolgan yangilanish bermaydi.

Kod test savollari bilan bir yozuvga aralashtirilmaydi. `test-service` admin create/detail/list/toggle/duplicate javobiga `testCode: {value,state,version}`ni qoвЂshadi; bazadagi test yoki public javobga shu maydon yozilmaydi. Eski `findTest` ichki xatti-harakati saqlangan, admin tafsiloti uchun `findAdminTest` alohida. Kodni boshqarish: `POST /api/admin/tests/:id/code`, bodyвЂ™da `action` (`activate`, `revoke`, `replace`) va joriy `version`. Faqat bekor kod almashtiriladi; nusxa test yangi nofaol kod oladi. Test savollari tahriri kodni almashtirmaydi; kod holati test revision/deadlineвЂ™ga tegmaydi.

HKDF maqsadlari alohida; admin tokenlari ADMIN_SESSION_SECRET bilan, test kodlari TEST_CODE_ENCRYPTION_KEY bilan shifrlanadi. Bo'sh kalitda TOKEN_SECRET moslik uchun ishlaydi. Test-code ciphertext keyVersion saqlaydi; v1 TOKEN_SECRET, v2 joriy yoki previous code key bilan o'qiladi. Backup v3 ciphertext registr va key ID ni olib yuradi, kalitni emas.

UI `teacher/test-codes.js` umumiy kod boвЂlimi va clipboard/holat amallarini, `pages/test-codes.css` raqam koвЂrinishini boshqaradi. `test-code` generatori shaxsiy `student-code` mexanizmidan mustaqil; legacy kirish A doirasida oвЂzgartirilmaydi. Kodni oвЂquvchi uchun tekshirish/start va guessing limitlari B bosqichiga qoldirilgan.

## 1.1 rol va maktab chegarasi

`account-service` login/parolli `super_admin` va `school_admin` hisoblarini boshqaradi. Hisoblar `admin-accounts`, minimal maktab yozuvlari `schools` omborida. Router umumiy sessiya yoвЂllari, maktab amallari va `/super-admin/` yoвЂllarini alohida tekshiradi. Tokenning imzolangan `accountLogin` qiymati server hisobi va sessiyasi bilan qayta tekshiriladi; rol/parol hashiga frontend orqali ishonilmaydi.

`lib/access-context.mjs` AsyncLocalStorage orqali soвЂrovning server tasdiqlagan rol/maktab kontekstini repositorylargacha olib boradi. `blob-store` sinf, test, natija, urinish, pending indeks va retake omborlari uchun oвЂqishni filtrlab, yangilash/oвЂchirishda egalikni tekshiradi; scoped yozuvni server `schoolId` bilan belgilaydi. Scoped oвЂqishlar umumiy keshdan foydalanmaydi. Kontekstsiz public oqim faqat egasi hali biriktirilmagan legacy yozuvlarni oladi; yangi maktab oвЂquvchi oqimi keyingi bosqichga qoladi.

Eski `settings/auth` va parolli kirish `legacy_admin` sifatida saqlanadi: faqat `schoolId` yoвЂq yozuvlar, bosh admin vakolatisiz. Mavjud yozuvlarga avtomatik maktab biriktirilmaydi. Yangi adminlar uchun restore/clear siyosat aniqlanmaguncha rad etiladi; eski restore ham begona maktab yozuvini repository orqali bosolmaydi. KoвЂp yozuvli hisob tayinlash inactive hisob в†’ maktab sloti в†’ active hisob tartibida; bir xil login/parol bilan qayta yuborish uzilgan operatsiyani davom ettiradi. Parallel yutqazgan rezerv inactive qolishi mumkin, hech qanday sessiya olmaydi.

Bosh adminning bootstrap qiymatlari `SUPER_ADMIN_LOGIN` va `SUPER_ADMIN_PASSWORD` muhitidan olinadi, mavjud oвЂqituvchi paroli qayta ishlatilmaydi. Birinchi yaratilgach hash server hisobida saqlanadi; muhitdagi parolni oвЂzgartirish mavjud hisob parolini almashtirmaydi. Login/parol yaratish uchun minimal bosh admin UI `public/bosh-admin/index.html`, kirish moduli `public/js/super-admin/index.js`. ToвЂliq ID/migratsiya, monitoring va 1.3вЂ“1.6 funksiyalari hali keyingi bosqichlardir.

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
HTTP в†’ netlify/functions/api.mjs в†’ server/router.mjs
     в†’ routes/ в†’ services/ в†’ repositories/ в†’ Netlify Blobs

HTML в†’ js/<rol>/<sahifa>.js в†’ core/ + components/
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

`lib/password-policy.mjs` bootstrap, kirish va yangi parol uchun 6-128 belgi chegarasini belgilaydi. `/admin/session` shu chegaralarni panelga beradi. Parol hash scrypt bo'lib qoladi; almashtirish account/session versiyasini yangilab eski sessiyalarni bekor qiladi.

`POST /attempts/draft` muddat va monoton draftVersion'ni tekshiradi; `POST /attempts/resume` server vaqti, server drafti yoki tayyor natijani qaytaradi. Yangi modul chegaralari: attempt-access, draft, completion va student-result xizmatlari. Natija kaliti har javobda joriy test siyosatidan quriladi; eski publicResult bevosita qaytarilmaydi. Serverga yetmagan kechikkan javoblar bahoga qo'shilmaydi. Tugallanmagan urinish muddatdan keyingi natija/tiklash so'rovida yakunlanadi; alohida fon jadvali yo'q.

## Test va sinf sanalari, Word importi

Test/sinf `createdAt` qiymatini faqat server belgilaydi. Tahrirlash mavjud sanani saqlaydi, nusxa yangi sana oladi. Legacy adapter manba yozuvda sana bo'lmaganini `null` orqali ajratadi; UI buni 1970-yilga almashtirmaydi. Karta amallari sahifa handlerlari orqali ishlaydi; `details/summary` klaviaturada boshqariladi.

Eski admin Aiken preview endpointi moslik uchun qoladi, yangi UI Word `.doc/.docx` multipart upload ishlatadi. `/admin/tests/preview-document` admin route `readForm` hajm chegarasidan keyin server `fflate` ZIP entry budgetini, `@xmldom/xmldom` bilan DTD/entity va tashqi relationlarni tekshiradi. DOCX blocklaridan boy HTML/MathML kontent olinadi, `richHtml` allowlist sanitizatsiya qiladi, `questionsValid` legacy string yoki `rich-html-v1`ni qaytaradi. Javob serverda answer index sifatida qoladi; `publicTest`, attempt va review DTOlari `q/options/contentFormat` allowlistidan foydalanadi. Media savol matnida tekshirilgan data URI sifatida saqlanadi, shu sabab mavjud school-scoped test, backup va attempt snapshot egaligi bilan ko'chadi.

`DOC_CONVERTER_URL/TOKEN` haqiqiy `.doc`→DOCX HTTPS service, `DOC_MATH_CONVERTER_URL/TOKEN` MathType/OLE→OMML converter uchun. Endpoint 10 s timeout, bearer token, HTTPS va 4 MB output limit qo'llaydi. DOCX pipeline OMML'ni MathMLga aylantiradi; shared `content-renderer.js` allowlistdan keyin local `mathjax` dependency TeX/MathML→SVG chiqaradi (`tex-mml-svg-nofont.js`, alohida font yuklanmaydi). MathJax fayli `public/vendor/mathjax/` ichida npm dependency versiyasidan vendored va litsenziyasi bilan tarqatiladi. TeX paketlari xavfsiz asosiy/AMS buyruqlari bilan cheklangan. Word header/footer/footnote, VML va converter talab qiladigan MathType obyektlari importni to'xtatadi; diagrammada DOCX raster preview talab etiladi. Tafsilot: [Word import qo'llanmasi](import-word.md).

## O'quvchi UI moslashuvi (2026-11-04)

public/css/pages/student-redesign.css o'quvchi kirish, faol test va natija sahifalariga mobile-first layout beradi. Test desktopda 780px gacha bo'lgan asosiy ustun va yon xaritani, 1024px va kichik oynalarda yig'iladigan xaritani ishlatadi. Rasm, jadval va MathJax bloklari konteynerda qoladi. Javob yuborish, timer, draft va API oqimlari o'zgartirilmagan. Amaldagi server identifikatsiyasi faqat ism va familiyani qabul qiladi; ekran bu APIga mos qoladi.

## Sinf, yo'nalish guruhi va blok testlar (2026-11-10)

`classes` ombori saqlanadi: `kind: class | group`, guruh uchun `direction`; eski yozuvlar `class` deb olinadi. `classIds` ikkala auditoriya turini bog'laydi. Eski kirish, roster, natija filtrlari va legacy `grades` mosligi saqlanadi. Bir xil guruh nomi boshqa yo'nalishda bo'lishi mumkin. Test biriktirilgan auditoriyaning tur/yo'nalishini almashtirishdan avval biriktirishlar tahrirlanadi.

Testda `testType: ordinary | block` va `direction` bor. Har blok savolining `section: { id, type, subject }` qiymati bo'limni bildiradi; bir xil fan nomi boshqa bo'lim IDsi bilan ajratiladi. `test-classification.mjs` tur, auditoriya yo'nalishi, ketma-ket bo'limlar va sarlavha mosligini tekshiradi. `/admin/tests/:id/assign` service orqali repository atomik update yordamida mavjud `classIds`ga qo'shadi; maktab egaligi scoped repository qoidalariga tayanadi.

`/admin/tests/preview` JSON Aiken yoki multipart Word preview qabul qiladi; eski `/preview-document` moslik uchun qoladi. `docx-part` XML qismlari, `docx-renderer` boy kontent, `docx-questions` bo'lim/savol/javobni ajratish uchun javobgar. Preview yozmaydi; UI bo'limlar, son, auditoriya, vaqt va urinish limitini alohida tasdiqlatgach CRUD chaqiradi.

Bo'lim metadata savol bilan validatsiya, presentation va attempt snapshotdan o'tadi. Blok savollari aralashtirilmaydi; variantlar aralashishi mumkin. Ochiq DTO javob kalitlarini bermasdan `section`ni uzatadi. Server `section-results` amaldagi bir savolga bir ball qoidasini bo'limlar bo'yicha hisoblaydi. Natija shu xulosani saqlaydi; frontenddagi umumiy komponent jadval chiqaradi. Backup validator test turi/yo'nalishini saqlaydi va bo'lim ballarini savol snapshotidan qayta hisoblaydi. Draft versiyasi, brauzer egaligi, muddat va idempotent yakunlash siyosati saqlangan.

## Testlar ko'rinishi va belgilash

`test-list-controls.js` karta/ro'yxat tanlovini localStorage'da, tanlangan test IDlarini sahifa xotirasida saqlaydi. Qidiruv/auditoriya/holat/saralash o'zgarsa tanlov tozalanadi; ko'rinish almashganda saqlanadi. Barchasini tanlash faqat filtrdagi testlarni qamraydi. `test-list.css` mavjud karta markupidan ixcham ro'yxat chiqaradi. Ommaviy o'chirish tasdiqdan keyin mavjud school-scoped DELETE endpointini har ID uchun chaqiradi; muvaffaqiyatli IDlar tanlovdan olinadi, xatoli IDlar qayta urinish uchun qoladi. Backend va eski natijalar formati o'zgarmaydi.

## Sinflar ko'rinishi va belgilash

`class-list-controls.js` sinf/guruh ko'rinishini test sahifasidan mustaqil localStorage kalitida, tanlovni sahifa xotirasida saqlaydi. `class-list.css` shu karta markupini ixcham ro'yxatga joylaydi. Barchasini tanlash sahifadagi sinf/guruhlarni qamraydi; tasdiqda nomlar, son va ta'sirlanadigan testlar soni chiqadi. Ommaviy o'chirish mavjud school-scoped classes DELETE endpointini chaqiradi: testlar va eski natijalar saqlanadi, biriktirishlar olinadi. Qisman xatoda o'chmagan yozuvlar tanlanganicha qoladi.

Sinf sahifasidagi nom/tur/yo'nalish filtrlari `classes.js` xotirasida saqlanadi va ko'rinish hamda data refresh orasida qoladi. Eski yozuv `class` sifatida filtrlanadi. Filtr o'zgarishi tanlovni tozalaydi; belgilash va ommaviy o'chirish faqat `visibleClasses()` natijalarini oladi. Faol yo'nalish oxirgi guruh o'chirilganda ham tanlovda ko'rinadi; alohida tozalash tugmasi boshlang'ich ro'yxatni qaytaradi.

## Fanlar xaritasi akkordeoni

`student/section-map.js` bo'lim metadata asosida savollarni guruhlaydi. Har fan sarlavhasi bo'lim turi, fan nomi va javoblar sonini doim ko'rsatadi. Tugmalar `aria-expanded/aria-controls` bilan bitta ochiq panelni boshqaradi; holat WeakMap orqali renderlar orasida saqlanadi. Savol almashganda joriy fan avtomatik ochiladi; javob/flag yangilanishida foydalanuvchi ochgan panel saqlanadi. Bo'limsiz eski test tekis xarita bilan qoladi. `section-map.css` ichki div panellar ishlatadi, shu sabab mobil tashqi details/offcanvas qoidalari ichki panellarga ta'sir qilmaydi. Backend, draft va baholash o'zgarmaydi.

## DTM 189 baholash

Serverdagi `lib/scoring-policy.mjs` bo'lim turini 1-mutaxassislik, 2-mutaxassislik yoki majburiy sifatida aniqlaydi; fan nomi va ID prefiksi koeffitsiyentni belgilamaydi. `saveTest` 30/30/10/10/10 tarkibini tekshiradi. Word importidagi `section.id` savolda saqlanadi. `startAttempt` rejim, versiya, scale va har IDning 31/21/11 koeffitsiyentini alohida `scoringPolicy` snapshotiga yozadi.

`grade.mjs` va `section-results.mjs` shu snapshot bilan butun birliklarni yig'ib, yakunda 10 ga bo'ladi. Natijadagi `score` avvalgidek to'g'ri javoblar soni; `correctCount`, `dtmScore`, `maxScore`, `scoringMode` va siyosat nusxasi alohida saqlanadi. Oddiy/eski natijada DTM maydonlari talab qilinmaydi. Natija keyingi test tahriridan qayta hisoblanmaydi; mavjud atomik result create va draft/muddat qoidalari saqlanadi. Zaxira tiklash DTM balli va siyosatini tekshiradi.

Brauzerdagi `core/result-score.js` sonlarni vergulli matnga aylantiradi; umumiy bo'lim jadvali to'g'ri javoblar va ballni alohida ko'rsatadi. CSV/Excel bo'limlar uchun alohida ustunlar beradi. Javob kalitlari o'quvchiga beriladigan siyosatga qo'shilmaydi.

`settings.hideResults` barcha testlarda natijaning joriy ko'rinish ruxsatidir. `studentResult` test mavjud bo'lsa uning joriy sozlamasini, aks holda natijadagi zaxira flagni qo'llaydi. Tugallangan urinishni ham ochish/yopish mumkin, baholash snapshoti o'zgarmaydi. `test-state.js` yakuniy natija bilan urinish tokenini saqlaydi; `student/result-refresh.js` sahifa ochilishi yoki yangilash tugmasida mavjud resume endpointi va brauzer egaligi orqali ruxsatni tekshiradi. Xatoda keshlangan ballni ko'rsatmaydi. Fan jadvali answeredCount, correctCount, score va maxScore ni ajratadi. Admin natijasi to'liq qoladi.
