# Arxitektura

## Bosh sahifa va kirish (2026-11-04)

`/test-kirish.html` wizardning yangi manzili; `student/entry.js` uni ulaydi. Urinishsiz `/test.html` wizardga boradi. Natijadagi qaytish, adminlarning o'quvchi havolalari va header brendi `/`da qoladi. Maktab sahifasi `/oqituvchi/kirish.html` orqali ochiladi. API va Netlify qoidalari o'zgarmaydi. Keyingi commitda `/` axborot landingga aylanadi.

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
