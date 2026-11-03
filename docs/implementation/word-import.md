# Word formulalari, rasmlari va jadvallari importi

Sana: 2026-11-03. Holat: **chegaralangan DOCX importi lokal amalga oshirildi va tekshirildi**. GitHub push, deploy yoki production ma'lumotlarini o'zgartirish bajarilmadi.

## O'qituvchi qanday ishlatadi

1. Word'da oddiy `.docx` hujjat yarating. Formulalarni **Insert → Equation** orqali yozing. PNG/JPEG rasmlarni hujjat ichiga joylang; tashqi havolaga bog'lamang. Jadval oddiy, birlashtirilmagan kataklardan iborat bo'lsin.
2. Har savol alohida paragraflarda: `1. Savol`, `A. Variant`, `B. Variant`, oxirida `ANSWER: A` yoki `JAVOB: A`. Formula, rasm va jadval savol yoki variantga tegishli keyingi paragraflarda bo'lishi mumkin. Markerlar oddiy matn bo'lsin; Word avtomatik ro'yxati qabul qilinmaydi.
3. Maktab admini **Testlar → Yangi test**da nom/sinf/vaqtni tanlaydi, **Word .docx yoki Aiken .txt**dan fayl yuklaydi va **Ko'rib chiqish**ni bosadi.
4. Formulalar, rasmlar, jadvallar va javobni tekshiradi. Javobi yozilmagan raqamlangan savol `manual-review` holatida chiqadi; admin radio orqali javobni tanlamaguncha saqlash rad etiladi. Hech qachon avtomatik A tanlanmaydi.
5. Savollarni o'chirish va to'g'ri variantni tanlash mumkin. Worddagi formula/matn/rasm/jadvalni o'zgartirish uchun asl DOCXni tahrirlab, qayta import qilish kerak; yangi vizual formula editori qo'shilmadi.
6. Yangi Word importi bilan saqlangan test to'xtatilgan bo'ladi, hatto mavjud testga yangi DOCX yuklansa ham. Admin uni va umumiy kodni alohida faollashtiradi. Import taymerni boshlamaydi.

Tayyor ikki savolli namuna: [word-formula-namuna.docx](../../samples/word-formula-namuna.docx). Namuna paket sifatida yaratilgan; foydalanuvchining haqiqiy Word/MathType fayli bilan keng qamrovli moslik sinovi deb talqin qilinmaydi.

## Qo'llanadigan kontent va chegaralar

| Qism | Amalga oshirilgan imkoniyat |
| --- | --- |
| Formulalar | Word OMML: kasr/ichma-ich kasr, daraja, indeks, ildiz, integral/ikki/uch integral, yig'indi, ko'paytma, limit, funksiya, matritsa, sistema, vektor aksenti, chiziq va ramka. Tanilgan tuzilma MathMLga aylanadi; tanilmagan tur importni aniq xabar bilan to'xtatadi. |
| Ko'rinish | Zamonaviy brauzerning native MathML rendereri; framework, CDN, tashqi shrift, raw HTML yoki MathJax qo'shilmadi. Chrome'da 360/1280 px tekshirildi. Word sahifasining shrift/layoutini pikselma-piksel ko'chirish yoki barcha brauzerlarda bir xil ko'rinish va'da qilinmaydi. |
| Rasmlar | Hujjat ichidagi PNG/JPEG. Har biri 300 KB, 16 megapikselgacha; haqiqiy signature va o'lcham tekshiriladi. WMF/EMF/SVG va Word diagrammasining o'zi qabul qilinmaydi; PNG/JPEGga aylantirish kerak. |
| Jadvallar | To'rtburchak, 50 qator × 20 ustungacha; katak ichida matn/formula/rasm bo'lishi mumkin. Birlashtirilgan kataklar rad etiladi. Savol va A/B markerlari layout jadvali ichida emas, oddiy paragraflarda bo'lishi kerak. |
| Word limiti | ZIP fayli 1,5 MB; 300 entry; bitta ochilgan entry 4 MB; jami ochilgan baytlar 12 MB; archive o'qish muddati 8 soniya. XML 60 daraja/60000 element bilan cheklangan. |
| Content limiti | B content validatorining tugun/chuqurlik/matn limitlari saqlangan. Bitta rich savol 1,5 MB, barcha savollar JSONi 2 MB; mavjud 4 MB HTTP JSON chegarasi kengaytirilmagan. |
| Import doirasi | Hozir faqat maktab admini. Legacy admin yoki bosh admin uchun Word import vakolati avtomatik berilmaydi. |

Eski `.doc`, `.docm`, MathType OLE/MTEF, avtomatik raqamlash, tashqi resurs, tracked changes, yashirin matn, text box, Word field va qo'llanmagan obyektlar uchun tushunarli rad javobi bor. OCR va PDF importi qo'shilmadi. Raw LaTeXni satrdan avtomatik formula qilish ham bu imkoniyat emas: manba Word Equation bo'lishi kerak.

Parser hujjatning asosiy body qismini o'qiydi. Header/footer va kommentlar test savoli sifatida import qilinmaydi; barcha savol, rasm va javob markerini asosiy hujjat ichiga joylang. Word uslublari, shrift va sahifa layouti ko'chirilmaydi. Saqlashdan oldingi preview shuning uchun majburiy amaliy qadamdir.

## Qatlamlar va fayllar

| Joy | Vazifa |
| --- | --- |
| `server/routes/admin/tests.mjs` | Mavjud `/api/admin/tests/preview`: `{text}` Aiken yoki `{docx: base64}` Word. |
| `server/services/docx-import-service.mjs` | Rol/tezlik, DOCX package/rels, parser, source yozish, source egaligini tekshirish. |
| `server/lib/docx-archive.mjs` | `yauzl` bilan ZIPni ketma-ket, diskka chiqarmasdan, real baytlarni sanab o'qish. |
| `server/lib/docx-xml.mjs` | `saxes` namespace-aware XML; DTD/entity, chuqurlik va tugun budjeti. |
| `server/lib/docx-math.mjs` | OMML → cheklangan MathML. Prefiks nomiga emas, namespace URIga tayanadi. |
| `server/lib/docx-content.mjs`, `docx-questions.mjs` | Matn/formula/rasm/jadval tartibi va Aiken uslubidagi segmentlash; diagnostics. |
| `server/lib/rich-content.mjs` | Content AST, MathML element/atribut allowlisti, raster signature/o'lcham/hash va hajm tekshiruvi; public question DTO. |
| `server/repositories/import-sources-repo.mjs` | Asl DOCX uchun yangi scoped `import-sources`; Blobs faqat repositoryda. |
| `public/js/components/rich-content.js` | Umumiy DOM renderer; elementlar DOM orqali allowlistdan qayta quriladi, raw MathML `innerHTML`ga uzatilmaydi. |
| `teacher/test-import.js`, `rich-question-editor.js` | Fayl/preview, warning, boy savol va javob tanlovi. |
| `student/question-map.js`, `student/result.js`, `teacher/result-detail.js`, `teacher/analytics.js` | Savol/variant, o'quvchi sharhi, admin tafsiloti va tahlilda bir renderer. |

Runtime dependencylar aniq versiyalangan: `saxes@6.0.0`, `yauzl@3.4.0`. Ular brauzerga import qilinmaydi; Netlify Function bilan paketlanadi. Eski Aiken parseri faqat serverda qoladi.

## B content shartnomasining amaliy integratsiyasi

Eski `{q, options: string[], answer}` maydonlari saqlandi. Yangi savolda qo'shimcha `rich: {version:1, prompt:Content, options:Content[], images:{sha256:dataUrl}}` bor. `Content` avvalgi `content-model.mjs` orqali validatsiya qilinadi. Bu B hujjatidagi kelajak `contentVersion/prompt` envelope'ini birdan almashtirish o'rniga orqaga mos qo'shimcha modeldir. Oddiy savollar majburan qayta yozilmaydi.

Tasvirlar alohida public URL yoki umumiy asset IDsi orqali olinmaydi: tekshirilgan kichik raster baytlari savolning maktabga yopiq yozuvida saqlanadi va faqat shu savolning ruxsatli DTOsiga kiradi. Bu dastlabki alohida asset servisiga muqobil, hajmi cheklangan yechim. `assetId` SHA-256ga tengligi tekshiriladi. Snapshotdagi tasvir/formula testning keyingi tahriridan mustaqil; begona maktabdan asset ID bilan o'qish endpointi yo'q. CSP kengaytirilmagan, mavjud `img-src data:` yetarli.

Asl DOCX (jumladan javoblar) alohida private `import-sources`da. Test/urinish/natijada private `importSourceId` izchillik uchun saqlanadi, student start/review DTOga bu ID yoki original kiritilmaydi. Saqlashda boshqa maktab source IDsi rad etiladi. Originalni yuklab olish uchun yangi public endpoint yoki yangi support vakolati yaratilmagan.

`questionsValid`, shuffle, test create/edit/duplicate, attempt snapshot, result/review va restore boy contentni saqlaydi. Shuffle rich optionlarni string variantlar bilan ayni tartibda ko'chiradi; answer/sourceOptions semantikasi o'zgarmaydi. Answer faqat admin yoki amaldagi yakuniy sharh ruxsatida. Start/draftda kalit yo'q; 2-bosqich CAS/deadline/idempotentlik himoyalari saqlangan.

## Zaxira va eksport

- Oddiy testlar uchun backup v2 saqlanadi. Boy savol/natija bo'lsa v3: `assetStorage: inline-raster-v1`, `sourceFilesIncluded: false`. Rasmlar savol bilan JSON ichida, tashqi manifest servisi talab qilinmaydi.
- V2 restore eski formatlarni, v3 restore tegishli manifestni tekshiradi. Restore vakolatlari o'zgarmadi: maktab/bosh adminga yangi restore huquqi berilmadi. Importdagi limitlar restoreda ham amal qiladi. Katta umumiy zaxira uchun mavjud 4 MB restore chegarasi saqlangan.
- Asl Word fayllari oddiy zaxiraga kirmaydi; admin o'z originalini alohida saqlashi kerak. Restore ko'rinadigan formula/rasm/jadval va eski ID/ballni saqlaydi, ammo original source IDni tiklamaydi. Bu to'liq falokatdan tiklash yechimi emas.
- Boy testni Aiken `.txt`ga eksport qilish aniq rad etiladi: rasmlar/jadvallar/formulani yo'qotib yuboradigan eksport "muvaffaqiyatli" deb berilmaydi. Natija CSV/XLS ball metrikalari avvalgidek ishlaydi.
- Source preview yozuvlari uchun avtomatik retention/cleanup hozir yo'q; mavjud original va snapshotga ishlatilayotgan manbani o'chirish siyosati alohida qoladi.

## Lokal dalillar

Doimiy `tests/`, audit buyruqlari va repo test dependencylari qayta yaratilmadi. Bir martalik helperlar, sintetik DOCXlar, JSON loglar va Chrome skrinshotlar `.local/word-evidence`da Gitdan tashqarida. Brauzer vositasi faqat `.local/word-qa-tools`ga o'rnatildi. Mavjud diskdagi maktablar yoki production omborlari ishlatilmadi.

| Tekshiruv | Natija |
| --- | --- |
| DOCX → server preview | 20 OMML tuzilma, integral/ikki/uch integral, kasr, ildiz, daraja/indeks, limit, matritsa/sistema/vektor, rasm va jadval o'qildi. Namespace prefiksi `x:` bo'lsa ham ishladi. |
| UI import → save → edit → student → result | Haqiqiy Chrome: upload/preview, to'xtatilgan test save, qayta ochish va to'g'ri javobni o'zgartirish; student render va 1/1 ball; student/admin sharhida kontent saqlandi. |
| Ko'rinish | 360 va 1280 pxda sahifa overflowi yo'q; native MathML elementlari real o'lcham bilan chizildi; PNG `naturalWidth > 0`; jadval ko'rindi. Skrinshotlar ko'z bilan ham tekshirildi. |
| Maktab/kalit | Begona sourceId va test 403/404; sessiyasiz preview 401. Startda rich content bor, `answer`, original DOCX va sourceId yo'q. |
| Javob va shuffle | Rich optionlar answer/sourceOptions bilan birga ko'chdi; javobsiz savol manual-review/null, save rad; avtomatik A yo'q. |
| Xavfli paketlar | 9 holat: traversal, OLE, tashqi rasm, DTD/entity, SVGni PNG deb berish, noma'lum OMML, merged table, ochilgan hajm va duplicate entry rad. |
| MathML/XSS | Server save hodisa atributini rad etdi; client renderer ham raw hodisa atributini chiqarmadi. |
| Zaxira | Savol/natija validatorida va ruxsatli legacy restore oqimining alohida xotira omborida v3 roundtrip o'tdi; buzilgan/v2 rich manifest rad; originalning chiqarilmagani tekshirildi. Maktab adminiga yangi restore huquqi berilmadi. |
| Namuna | `samples/word-formula-namuna.docx`: ikki savol, integral, jadval va ko'rinadigan PNG diagramma parserdan o'tdi. |
| Oldingi oqim | 2-bosqichning 4 workerli parallel start/submit, draft poygasi, vaqt/egalik/maktab/retake va uzilishdan tiklash lokal tekshiruvlari qayta o'tdi. |
| Netlify Dev | Offline `npm run dev -- --port 8891 --internal-disable-edge-functions`: editor/renderer/CSS GET 200, sessiyasiz admin API 401; yangi server dependencylar yuklandi. |

Sintetik namunalar haqiqiy foydalanuvchi Word fayllarining barcha variantini qamramaydi. Word ilovasida hujjatni ochib qayta saqlash, turli Word versiyalari, MathType/MTEF yoki boshqa brauzerlarda universal sifat tasdiqlanmadi. Noma'lum tuzilma rad qilinadi, jimgina tashlanmaydi.

`npm run check` va `npm run build` 229 faylda o'tdi. O'zgargan JS/MJS/CSS/HTML Prettier bilan formatlandi, JS/MJS sintaksisi va whitespace tekshirildi. Bu buyruqlar yuqoridagi funksional sinovlarning o'rni emas. Productionga chiqarish alohida topshiriqda.

Texnik manbalar: [yauzl ZIP limitlari](https://github.com/thejoshwolfe/yauzl), [saxes XML parseri](https://github.com/lddubeau/saxes), [MathML elementi](https://developer.mozilla.org/en-US/docs/Web/MathML/Reference/Element/math). Native MathML tanlovi oldingi MathJax tavsiyasini ushbu chegaralangan DOCX oqimida almashtirdi; LaTeX va to'liq vizual editor uchun yakuniy tanlov deb olinmaydi.
