# Matematik content — B bosqichi

2026-11-03: foydalanuvchi Word importini buyurdi. Validator amaldagi savollarning orqaga mos `rich` maydoniga ulandi; native MathML, inline raster snapshot, scoped original va v3 backup tanlovi [yangi hisobotda](word-import.md). Quyidagi "APIga ulanmagan" qaydi B yakunlangan sanadagi tarixiy holat. Taklif etilgan envelope to'liq almashtirilmadi; real integratsiya farqlari yangi hujjatda ochiq yozilgan.

Sana: 2026-11-01. A dan keyingi davom ettirish topshirig'i asosida.

## Doira va holat

`server/lib/content-model.mjs` mustaqil content validator va eski matn adapterini beradi. Hozircha amaldagi API, ombor, editor, shuffle yoki backup formatiga ulanmagan. DOCX parseri, renderer va migratsiya bu bosqichga kirmaydi. Production ma'lumoti o'zgarmaydi. Quyidagi yangi savol envelope'i integratsiya shartnomasi; uni amaldagi save endpointiga yuborish hali qo'llanmaydi.

## Content v1

Content `{version: 1, nodes: [...]}`. Tugunlarning tartibi saqlanadi. Noma'lum versiya, tugun yoki maydon rad etiladi; jimgina kesish yo'q. Validator yangi obyekt yaratadi, kirish obyektini o'zgartirmaydi.

| Tur | Maydonlar | Vazifa |
| --- | --- | --- |
| `text` | `text` | Unicode, whitespace va delimiterni o'zgartirmasdan saqlash |
| `paragraph` | `children` | Text, inline math, image, fallback ketma-ketligi |
| `math` | `format`, `source`, `display`, `alt`, ixtiyoriy `sourceRef` | `latex`, `mathml`, `omml`; original manba satri |
| `image` | `assetId`, `alt` | Immutable xususiy assetga ID; URL emas |
| `table` | `rows` | To'rtburchak rows → cells → nodes tuzilmasi |
| `fallback` | `sourceRef`, `alt`, `reason`, ixtiyoriy `previewAssetId` | Konvertatsiya qilinmagan original va ko'rish nusxasi |

Har content uchun 2000 tugun, 100000 jami UTF-16 belgi, rekursiya chuqurligi 8. Oddiy matn 10000, formula 30000, alt 2000, fallback sababi 1000 belgigacha. Jadval 1–50 qator va 1–20 ustun; qator kengligi bir xil. Reference 1–160 lotin harfi/raqam/defis/pastki chiziq. Formula va fallback sababi bo'sh bo'lmaydi. Bo'sh content modeli tahrir drafti uchun mumkin; publish validatori savol/variant mazmunini alohida tekshirishi kerak.

Validator formula sintaksisi yoki XML sanitizatori emas. Raw source hech qachon `innerHTML`ga berilmaydi. OMML originali admin/private ma'lumotdir; o'quvchi DTOsi alohida xavfsiz render modeliga aylantiriladi. Reference'ning formatdan o'tishi egalik huquqini bermaydi: import/asset repository maktab va snapshot bog'lanishini keyingi bosqichda tekshiradi. Bu modul asset olish yoki public DTO yaratish funksiyasini bermaydi.

## Savol va eski format shartnomasi

Kelajakdagi structured savol: `{contentVersion: 1, prompt: Content, options: Content[], answer: number}`. Variantlar 2–6 ta, answer 0 asosidagi indeks va contentdan tashqarida. Testdagi eski va yangi savollarni adapter orqali bir xil ichki ko'rinishga keltirish kerak; eski `{q, options: string[], answer}` yozuvlari majburan qayta yozilmaydi.

`contentFromLegacy(string)` bitta text tugun beradi: trim, Unicode normalizatsiyasi, LaTeX delimiter parsing yoki HTML parsing qilmaydi. `legacyTextFromContent` faqat yuqori darajadagi text tugunlarini birlashtiradi; formula, rasm, paragraf yoki jadvalni matnga tushirishni rad etadi. Shu sabab eksport yo'qotishini yashirmaydi. Amaldagi 2000/1000 belgili legacy savol/variant limitlari o'zgarmadi.

## Keyingi integratsiya uchun majburiy shartlar

1. Save, duplicate va restore bir xil savol validatorini ishlatsin. Eski backup o'qilsin; yangi backup versiyasi content va immutable asset manifestini saqlasin. Noma'lum backup/content versiyasi yozishdan oldin rad etilsin.
2. Shuffle promptni saqlasin, har option contentini indeks bilan ko'chirsin; answer, sourceIndex va sourceOptions hozirgi semantikasini saqlasin. Attempt va result nusxalari keyingi test tahriridan mustaqil bo'lsin.
3. Start, public test va review DTOlari explicit allowlist bo'lsin. Answer faqat mavjud showAnswers siyosatida; original DOCX, sourceRef, raw OMML va import diagnostikasi public javobga qo'shilmasin.
4. Frontend draft validatori eski string va yangi versiyalangan contentni ajratsin. Formula renderer tayyor bo'lmaguncha structured savol nashri ochilmasin.
5. Import diagnostikasi contentdan alohida: `status` complete/partial/fallback/manual-review/failed va `warnings` (code, location, message). Asl DOCX/OMML/OLE private immutable source yozuvida saqlansin. Warning raw documentni nusxalamasin. Topilmagan answer `null`; administrator aniqlamaguncha publish/confirm bloklansin.
6. Assetlar va original manbalar uchun scoped repository, ruxsatlar, snapshot va backup oqimi bo'lmaguncha assetId/sourceRef mavjudligini va izolyatsiyasini ishlaydi deb hisoblamaslik kerak.

## Tekshiruv

Doimiy tests/ yoki audit skripti qo'shilmadi. Xotiradagi 19 assertion o'tdi: legacy roundtrip, barcha tugunlar, nusxa mustaqilligi, noma'lum maydon/versiya, noto'g'ri reference, jadval, rekursiya va hajm limitlari. `npm run check` va `npm run build` o'tdi (209 fayl). Modul HTTPga ulanmagani uchun yangi brauzer/API oqimi yo'q; DOCX, render sifati va asset izolyatsiyasi hali tekshirilmagan.

Boshlang'ich ishchi holatda `public/namuna-test.txt` o'chirilgan edi. Fayl tiklanmadi; unga qolgan ishlamaydigan editor havolasi olib tashlandi. Bu o'zgarish content modelidan alohida commit qilinadi.
