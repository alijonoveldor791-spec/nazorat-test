# Matematik formulalar va Word importi — A bosqichi

Sana: 2026-11-01. Baza: `977544e`. Holat: mavjud arxitektura tahlil qilindi; B–H boshlanmadi.

## 1. Asosiy xulosa

Hozir Word importi, formula renderer yoki rich-text editor yo'q. Ishlayotgan format — Aiken matni va `{ q: string, options: string[], answer: number }`. DOCXni shunchaki matnga aylantirish foydalanuvchi talabidagi formula, rasm, jadval va asl manbani saqlamaydi. Integratsiya modeldan boshlab preview, saqlash, urinish, natija va backupgacha o'tishi kerak.

Ushbu bosqichda dastur kodi, dependency, CSP, ombor yozuvlari va mavjud test/natijalar o'zgartirilmadi. Faqat ushbu hisobot va PLAN yangilandi. Push/deploy bajarilmadi.

## 2. Amaldagi arxitektura va dalillar

| Qism | Joriy holat | Asosiy manba |
| --- | --- | --- |
| Frontend | Toza HTML/CSS/ES modules; framework, CDN va tashqi shrift yo'q | `AGENTS.md`, `public/oqituvchi/test-tahrir.html` |
| Editor kirishi | Maktab sessiyasi → test formasi → savol editori | `public/js/teacher/test-editor.js`, `test-form.js` |
| Qo'lda tahrirlash | Savol textarea, variant input, to'g'ri javob radio; rich text/formula paneli yo'q | `public/js/teacher/question-editor.js` |
| Import UI | Faqat `.txt`; fayl 1,000,000 baytgacha; `file.text()` orqali o'qiladi | `public/js/teacher/test-import.js`, `test-form-view.js` |
| Import preview | JSON `{text}` → `POST /api/admin/tests/preview`; natija editorga olinadi, avtomatik saqlanmaydi | `server/routes/admin/tests.mjs`, `services/test-service.mjs` |
| Parser | Serverdagi Aiken; 1–200 savol, 2–6 variant, ANSWER/JAVOB majburiy | `server/lib/aiken-parser.mjs` |
| Model | Savol 2000, har variant 1000 belgigacha; qo'shimcha maydonlar validatorda tushib qoladi | `server/lib/validate.mjs:26` |
| Saqlash | JSON yozuvlar Netlify Blobsda; SQL jadval/ORM yo'q | `server/repositories/tests-repo.mjs`, `blob-store.mjs` |
| Yangi test holati | `saveTest` yangi testni odatda `active: true` bilan saqlaydi; test kodi alohida nofaol bo'ladi | `server/services/test-service.mjs:89` |
| Tartib/baholash | `answer` — 0 asosidagi indeks; shuffle `sourceIndex/sourceOptions`ni saqlaydi | `server/lib/shuffle.mjs`, `grade.mjs` |
| Urinish | Savollar nusxasi, server deadline, draft versiyasi va brauzer egaligi | `server/services/attempt-service.mjs`, `draft-service.mjs` |
| O'quvchi ko'rinishi | Savol `textContent`, variantlar escape qilingan HTML; formula satr bo'lib chiqadi | `public/js/student/question-map.js` |
| Natija/sharh | Server savol/variantlarni string ko'rinishida qaytaradi; o'quvchi/admin ularni escape qiladi | `server/services/student-result-service.mjs`, `public/js/student/result.js`, `teacher/result-detail.js` |
| Hisobot | Analitika savol matniga tayanadi; CSV/XLS eksport natija metrikalarini beradi, matematik hujjat emas | `public/js/teacher/analytics.js`, `results.js` |
| Backup/eksport | Backup validator eski savol modelini qayta quradi; test eksporti Aiken matni | `server/lib/backup-validate.mjs`, `services/backup-service.mjs`, `test-service.mjs` |
| HTTP | Router hozir faqat JSON body o'qiydi, limit 4,000,000 bayt; multipart 415 | `server/router.mjs:51`, `server/lib/http.mjs:20` |
| Hosting | Node ≥22.12, Netlify Functions v2, yupqa `api.mjs`; build kompilyatsiya qilmaydi | `package.json`, `netlify.toml`, `netlify/functions/api.mjs` |
| Dependency | Runtime faqat `@netlify/blobs`; dev: Netlify CLI va Prettier | `package.json` |

Repozitoriyda `.docx`, `.doc`, `.tex` fixture yoki MathType test hujjati topilmadi. `tests/` va npm test/audit buyruqlari oldingi foydalanuvchi topshirig'i bilan olib tashlangan; bu bosqichda qayta yaratilmadi.

## 3. Format va formulalarning hozirgi haqiqiy darajasi

| Manba | Hozir ishlaydigan qismi | Yetishmayotgan qismi |
| --- | --- | --- |
| Aiken `.txt` | Savol/variant/javob parsing, preview, tahrir, saqlash | Strukturali formula va media |
| Unicode `∫`, `α`, `x²` | Satr ichida saqlanadi va matn sifatida chiqadi | Matematik semantika yoki professional joylashtirish kafolati yo'q |
| `$...$`, `$$...$$`, `\(...\)`, `\[...\]` | Belgilar oddiy satr sifatida saqlanishi mumkin | Delimiter parsing va matematik rendering yo'q |
| `.tex` | Alohida import rejimi yo'q | TeX hujjati parseri, muhit va buyruq siyosati |
| DOCX/OMML | Qo'llanmaydi | ZIP, namespace-aware XML, munosabatlar, math konvertatsiyasi |
| MathML | Raw matn escape qilinadi | Xavfsiz strukturali validatsiya va renderer |
| MathType OLE/MTEF | Qo'llanmaydi | Obyekt/preview aniqlash, manbani saqlash, sinovdan o'tgan konvertor |
| Rasm/jadval/diagramma | Savol modelida yo'q | Asset, jadval tugunlari va maktab doirasidagi yetkazish |
| Eski `.doc` | Qo'llanmaydi | Ishonchli server konvertori aniqlanmagan |

Kasrlar, ichma-ich kasr, daraja/indeks, ildiz, log/trigonometriya, limit, hosila, integral turlari, differensial tenglama, matritsa/determinant, vektor, sistema/cases, yig'indi/ko'paytma, kombinatorika, ehtimollar/statistika, to'plam/mantiq, kompleks va geometrik ifodalar uchun hozir professional rendering tasdiqlanmagan. Ularning yozuvi satrda mavjudligi ishlaydigan math importi degani emas.

## 4. Ma'lumot yo'qolishi mumkin bo'lgan nuqtalar

1. `questionsValid` faqat `q/options/answer`ni qaytaradi; shunchaki `content`, `mathml` yoki `sourceOmml` qo'shish saqlashda yo'qoladi.
2. `presentation` savolni qayta quradi; yangi model validatordan o'tsa ham rich content urinish nusxasiga ko'chmaydi.
3. Public test, start va result DTOlari string savollarni ajratib beradi. Ular yangi strukturaga moslashtirilishi kerak; raw DOCX/OMML/OLE va javob kalitlari public DTOga qo'shilmaydi.
4. Brauzer `validAttempt/validReview` string variantlarni talab qiladi; yangi strukturali option eski draftni yaroqsiz qilmasligi kerak.
5. Backup restore ham savolni qayta validatsiya qiladi. Yangi model uchun versiyalangan backup va asset manifesti kerak.
6. Aiken eksporti formula/jadval/rasmni to'liq ifodalay olmaydi. Uni yo'qotishsiz Word eksporti deb ko'rsatib bo'lmaydi; aniq ogohlantirish yoki alohida boy format zarur.
7. Oddiy saqlash yangi testni faol qiladi. Word importi uchun preview/draft va nashr holati alohida belgilanishi kerak; faqat kodning nofaolligiga tayanilmaydi.

## 5. Renderer bo'yicha dastlabki tavsiya

| Mezon | MathJax | KaTeX |
| --- | --- | --- |
| Kirish | TeX va MathMLni to'g'ridan-to'g'ri qabul qiladi | Asosiy API TeX satriga mo'ljallangan; MathML chiqishi OMML importini o'zi hal qilmaydi |
| Chiqish | CHTML, SVG, MathML | HTML/MathML; qo'llanadigan TeX buyruqlari rasmiy ro'yxat bilan chegaralangan |
| Accessibility | Maxsus accessibility vositalari bor; tanlangan integratsiyada alohida tekshiriladi | MathML chiqishi yordam beradi; yakuniy ekran o'quvchi testi baribir zarur |
| Tezlik | Ushbu loyihada o'lchanmagan | Ushbu loyihada o'lchanmagan; taxminiy benchmark raqami berilmaydi |
| Xavfsizlik | `ui/safe` qo'shimcha himoya; parser/sanitizer va resurs limitini almashtirmaydi | `trust`, `maxExpand`, `maxSize`; error matnini ham escape qilish kerak |
| Litsenziya | Apache-2.0 | MIT |

Dastlabki tanlov: MathJax — OMMLdan MathMLga o'tish va LaTeXni bir rendererda birlashtirish uchun. Bu tavsiya, o'rnatilgan yoki sifat sinovidan o'tgan integratsiya emas. Kutubxona OMML/MTEF parseri ham, to'liq TeX kompilyatori ham emas. Yakuniy versiya, paketlar, CSP va yuklama E bosqichida sinov bilan tanlanadi. [MathJax kirishlari](https://docs.mathjax.org/en/latest/basic/mathematics.html), [konvertatsiya API](https://docs.mathjax.org/en/latest/web/convert.html), [accessibility](https://docs.mathjax.org/en/latest/basic/accessibility.html), [litsenziya](https://docs.mathjax.org/en/latest/misc/faq.html); [KaTeX API](https://katex.org/docs/api), [buyruqlar](https://katex.org/docs/supported), [xavfsizlik](https://katex.org/docs/security), [litsenziya](https://github.com/KaTeX/KaTeX).

Amaldagi CSP `script-src/style-src/font-src 'self'`, inline script/style yo'q. CDN kodi qo'shilmaydi. Renderer assetlari lokal bo'lishi, dinamik style va lokal font talablari esa oldindan tekshirilishi kerak. SVG chiqishi nomzod, lekin uning o'zi CSP/accessibility muammosini avtomatik hal qilmaydi. `unsafe-inline` yoki `unsafe-eval`ni umumiy yoqish tavsiya etilmaydi. MathJax safe filtri to'liq XML/HTML sanitizatsiyasi emas. [Safe filtri](https://docs.mathjax.org/en/latest/options/safe.html).

Bir xil content renderer admin preview/editor, o'quvchi savoli, variantlar, review va natija/analitikada ishlatilishi kerak. Uzun formula o'z konteynerida scroll qiladi; butun sahifa kengaymaydi. Renderer xatosida manba escape qilingan fallback va aniq holat ko'rsatiladi.

## 6. DOCX/OMML/MathType bo'yicha xulosa

DOCXni faqat ZIP magic yoki kengaytma bilan tanish yetarli emas: `[Content_Types].xml`, package relationships va `word/document.xml`ning mosligi tekshiriladi. XML namespace URI bo'yicha o'qiladi; `m:` prefiksining o'ziga tayanilmaydi. `document.xml`, rels, media, embeddings, styles va jadvallar birga tahlil qilinadi. Hujjatdagi matn → formula → rasm → matn ketma-ketligi saqlanadi. OMML ichida kasr, daraja/indeks, ildiz, n-ary, limit va matritsa tuzilmalari bor; ularni alohida mapping talab qiladi. [Microsoft OfficeMath](https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.math.officemath?view=openxml-3.0.1).

Mammoth umumiy DOCX→HTML yordamchisi sifatida baholandi, ammo hujjati sanitizatsiya qilmasligini aytadi; ko'rilgan READMEda equation konvertatsiyasi kafolati topilmadi. Uni yo'qotishsiz OMML/MTEF parseri o'rnida tanlashga dalil yetarli emas. Hozir dependency sifatida qo'shilmadi. [Mammoth manbasi va xavfsizlik izohi](https://github.com/mwilliamson/mammoth.js).

MathType uchun OLE/embedding va rels bog'lanishi aniqlanib, asl ikkilik manba saqlanishi kerak. Wiris WMF tasvir va MTEF ma'lumoti hatto bir-biriga nomos bo'lib qolishi mumkinligini hujjatlashtiradi; preview semantik to'g'rilikning kafolati emas. Litsenziyasi, sifati va fixture mosligi tasdiqlangan MTEF parseri hali tanlanmagan. [Wiris izohi](https://docs.wiris.com/interface-and-usability/a-different-equation-opens-in-mathtype-than-the-one-double-clicked-in-word).

Tavsiya etilgan darajalar: tanilgan OMML → strukturali math; qo'llanmagan OMML → asl manba + ogohlantirish; MathType → tekshirilgan konvertor bo'lsa math, aks holda foydalaniladigan preview + original. Preview vektor formati brauzerda ochilmasa, alohida xavfsiz konvertatsiya yoki aniq qo'lda tekshirish holati zarur. Preview ham yo'q bo'lsa placeholder va bloklovchi ogohlantirish bo'ladi. Hech qanday obyekt jimgina tashlanmaydi.

Haqiqiy MathType DOCX yo'q. Uning aniqlanishi, rendering, tahrirlash yoki universal konvertatsiyasi ishlaydi deb belgilanmadi.

## 7. Hosting va eski DOC

Netlify hujjatida standart synchronous limit 60 soniya, buffered payload 6 MB, binary so'rov uchun base64 overhead sabab samarali chegara taxminan 4.5 MB. Bu platforma hujjatidagi limitlar; mazkur akkaunt konfiguratsiyasi yoki real throughput o'lchanmadi. Ilovaning hozirgi JSON limiti bundan mustaqil — 4,000,000 bayt. [Netlify Functions konfiguratsiyasi](https://docs.netlify.com/build/functions/configuration/).

Multipart/binary import uchun alohida cheklangan body reader kerak; legacy JSON parserini olib tashlash kerak emas. Dastlab kichik DOCXlar, qat'iy ochilgan ZIP hajmi/element soni/vaqt limitlari bilan ishlash, katta faylni tushunarli rad etish tavsiya qilinadi. Katta import keyinchalik alohida job + asset omboriga o'tishi mumkin; background request limiti 256 KB bo'lgani uchun faylni job bodyga tiqish yechim emas. ZIP metadata hajmiga ishonish yetarli emas, real oqimdagi baytlar ham sanaladi.

Repozitoriyda LibreOffice/Pandoc binarysi yoki DOC konvertori yo'q; lokal PATH tekshiruvida ham ular topilmadi. Bu production tizimida barcha binarylar yo'q degan dalil emas, ammo ishonchli DOC konvertatsiyasi mavjudligini tasdiqlamaydi. Hozirgi tavsiya: `.doc` uchun Word/LibreOffice'da DOCX qilib saqlash ko'rsatmasi. LibreOffice headless konvertatsiyani qo'llaydi, lekin uni serverda ishga tushirish alohida sandbox/vaqt/makro siyosati va hosting tekshiruvini talab qiladi. [LibreOffice rasmiy parametrlari](https://help.libreoffice.org/latest/en-US/text/shared/guide/start_parameters.html).

Yangi pullik servis tanlanmadi, xarid/o'rnatish bajarilmadi. `.doc` konvertatsiyasi va MTEF uchun keyinchalik pullik yechim zarur bo'lsa, uning narxi/litsenziyasi/muqobillari avval foydalanuvchiga taqdim etiladi.

## 8. Keyingi bosqichlar uchun integratsiya yo'nalishi

Bu bandlar taklif, tayyor model yoki amalga oshirilgan endpoint emas.

- B: versiyalangan content AST: text, inline/block math, image, table, preview va warnings. Formula asl OMML/LaTeX/MathML manbasini yo'qotmasin. Savol va variantlar bir xil content turidan foydalansin; to'g'ri javob contentdan alohida tursin. Eski indeksli javob va string variantlarga o'qish adapteri saqlansin.
- C: serverdagi xavfsiz ZIP/XML reader → OOXML tartibli traversal → OMML mapping → savol/variant segmentlash. Regex butun XML parseri o'rnini bosmasin. Shablon va savol/variant/ANSWER markerlari aniq hujjatlashtirilsin; noaniq tuzilma yo'qolmasdan warningga aylansin.
- D: LaTeX delimiterlari va muhitlarini cheklangan math sintaksisi sifatida qabul qilish; TeX/shell kompilyatori ishga tushirilmaydi. MathType holati har obyekt uchun qayd qilinadi; original va fallback saqlanadi. `.txt` Aiken va `.tex` import rejimlari aralashib ketmasin.
- E: umumiy math/content renderer, sanitizer, accessibility, CSP va mobil overflow tekshiruvlari. Buyruq/makro kengayishi va nesting budjeti bo'lsin; tashqi resurs yuklovchi buyruqlar o'chirilsin.
- F: maktabga bog'langan import drafti va assetlar; previewda complete/partial/fallback/manual-review/failed holatlari. Javobi topilmagan savolga avtomatik A belgilanmasin; admin tanlamaguncha confirm yopiq. Tasdiqlash idempotent bo'lsin, dastlab nashr etilmagan test yaratsin.
- G: avval LaTeX maydoni + jonli preview + kasr/integral/matritsa/sistema snippetlari. MathLive vizual editor nomzodi, lekin to'liq rich-text hujjat editori o'rnini avtomatik bosmaydi; CSP, mobil, manba roundtrip va litsenziya Gda tekshiriladi. [MathLive manbasi](https://github.com/arnog/mathlive).
- H: foydalanuvchi sanagan kamida 20 holat: parser → saqlash → preview → o'quvchi renderi → tahrirdan keyingi roundtrip. Haqiqiy Word/MathType fixture va zararli ZIP/XML/OLE namunalarisiz to'liq qo'llab-quvvatlash da'vosi bo'lmaydi. Yangi topshiriq bu bosqichda avtomatik testlarni yaratishga ruxsat beradi, lekin A doirasida hali yaratilmaydi.

## 9. Xavfsizlik va moslik uchun majburiy nuqtalar

- ZIP traversal/absolyut yo'l/symlink, shifrlangan yoki buzilgan ZIP, ZIP bomb, real ochilgan hajm, XML chuqurligi va element soni tekshirilsin. DOCTYPE/entity va tashqi resurslar o'chiriladi. `.docm`, makro/OLE ijrosi va OCR yo'q.
- Raw HTML/MathML/SVG to'g'ridan-to'g'ri `innerHTML`ga o'tmasin; element/atribut allowlist, URL siyosati va tasvirning haqiqiy MIME/pixel limiti kerak. Sanitizer original manbani buzmaydi: original faqat xususiy omborda qoladi.
- Yangi imports/assets omborlari hozirgi `SCOPED_STORES` ro'yxatida yo'q; ular qo'shilib, serverdagi maktab sessiyasi bilan himoyalanishi kerak. UUID yoki asset IDni bilish ruxsat bo'lmaydi.
- Asl DOCXda javoblar bor: original fayl va admin import diagnostikasi o'quvchiga berilmaydi. O'quvchi faqat o'z urinishidagi xavfsiz content va zarur assetlarni oladi; javob kaliti amaldagi showAnswers siyosatida qoladi.
- Private assetni JS orqali avtorizatsiya bilan fetch qilib object URLda ko'rsatish nomzodi mavjud CSPda `img-src blob:` uchun alohida tor o'zgarishni talab qiladi; assetlarni `public/`ga joylash bilan izolyatsiya buzilmasin.
- Savolni tahrirlash eski urinish/natijadagi formula yoki tasvirni almashtirmasin. Assetlar immutable/revisionli, snapshot va backup bilan bog'langan bo'lsin; orphan cleanup eski natija ishlatayotgan assetni o'chirmasin.
- Test drafti, import drafti va urinish drafti alohida tushunchalar; import tasdig'i test taymerini boshlamasin. Mavjud deadline, draftVersion, brauzer egaligi va natija idempotentligi saqlansin.
- Natija CSV/XLS eksporti formula-injection himoyasini saqlaydi; rich contentni eksport qilish alohida format/ogohlantirish talab qiladi. Eski Aiken va eski backup o'qilishi davom etadi; production migratsiya/reset yo'q.

## 10. A bosqichi tekshirish natijalari

8 ta disksiz/serverga yozmaydigan assertion bajarildi:

1. Eski Aiken → model → Aiken roundtrip saqlandi.
2. Unicode va LaTeX manbasi oddiy string sifatida saqlanishi tasdiqlandi; formula rendering deb hisoblanmadi.
3. Hozirgi validator qo'shimcha `content`ni olib tashlashi ko'rsatildi.
4. Shuffle/urinish taqdimoti ham qo'shimcha `content`ni ko'chirmasligi ko'rsatildi.
5. Savol uchun 2000 belgi cheklovi ishladi.
6. Mavjud `esc` raw MathMLni matnga aylantirdi.
7. Mavjud HTTP body parser multipartni 415 bilan rad etdi.
8. Mavjud HTTP body parser 4,000,000 baytdan katta e'lon qilingan JSON bodyga 413 qaytardi.

`npm run check` va `npm run build` o'tdi. Bu yangi DOCX/OMML/MathType/renderer testlari emas. Browser formula sifati, 30 matematik mavzu, 20 end-to-end holat, ZIP bomb va ikki maktabning yangi asset izolyatsiyasi hali sinovdan o'tmagan. Yangi imkoniyatlarning hech biri A bosqichida ishlaydi deb belgilanmadi.

## 11. Keyingi qaror

A yakunlandi. B — strukturali matematik content modeli va eski formatlar bilan moslik shartnomasini ishlab chiqish. Foydalanuvchi tasdig'isiz Bga o'tilmaydi.
