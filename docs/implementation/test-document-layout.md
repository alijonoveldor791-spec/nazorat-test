# Word va PDF testning chop formati

2026-11-17. Muammo: eksport savol raqami va variant harfini alohida paragrafga chiqarar edi; importdagi p bloklari matnni keyingi qatorga surardi. Variantlar bitta uzun ustunda edi.

- test-document-layout.labeledWord raqam/harfni birinchi Word paragrafi ichiga kiritadi; savol matni qalin va birinchi paragraf keyingi blok bilan bog'langan. Murakkab kontent jadvaldan boshlansa raqam uchun alohida paragraf saqlanadi.
- wordOptionPairs chegarasiz, teng kenglikdagi ikki ustunli native Word jadvalini yaratadi: A/B bir qatorda, C/D keyingi qatorda; E/F ham shu usulda. Toq variantda oxirgi o'ng katak bo'sh. Qator w:cantSplit bilan sahifada bo'linishdan himoyalangan. Variant ichidagi rasm va jadvallar katak kengligiga moslanadi.
- PDF/chop HTMLda raqam va savol matni bitta flex qatorda; variantlar ikki ustunli grid. Variant harfi va p ichidagi matn bir qatorda turadi. Times New Roman 12pt, A4, 18mm print margin; brauzer PDF saqlash oqimi saqlanadi.
- Rasmlar, rich matn, ichki jadval va OMML/MathML saqlanadi. Savollar/variantlar tartibi o'zgarmaydi; o'quvchi nusxasiga javob kaliti qo'shilmaydi. Alohida kalit eksporti avvalgidek.

Tekshiruvlar faqat sintetik va mavjud sample DOCX bilan, .local/document-layout-verify.mjs orqali o'tdi; doimiy tests/ yaratilmagan.

- DOCX XML: 1. va savol, A. va variant bitta paragrafda; ikki qatorli A/B, C/D native jadval; toq variant, OMML, DrawingML va jadval saqlangan, kalit alohida.
- Chrome screen/print: barcha savollarda A/B va C/D y koordinatalari teng, B Aning o'ngida; raqam matn oldida. Haqiqiy PDF yaratildi.
- Haqiqiy Microsoft Word COM bilan yashirin ochildi: birinchi jadval 2x2, ustun kengliklari teng, A/B va C/D tegishli kataklarda; Worddan PDF eksporti muvaffaqiyatli. Yashirin Word oynasida ekrandagi koordinatalar olinmagani uchun Wordda jadvalning native qator/ustun va kenglik xossalari tekshirildi.
- Oldingi kutubxona API regressiyasi: kvotalar, boy DOCX, markerlar, backup/restore, kalit xavfsizligi, maktab ruxsatlari va idempotent baholash o'tdi.
- npm run check va npm run build o'tdi; tegishli kod Prettier bilan formatlandi.

Dalillar Gitdan chiqarilgan .local/library-evidence/layout.docx, layout-word.pdf, layout-chrome.pdf va layout-print.png ichida. Avval yuklangan fayllar avtomatik o'zgarmaydi; yangi format uchun qayta eksport qilinadi.
