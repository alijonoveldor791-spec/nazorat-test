# Word importi

O'qituvchi test muharririda `.docx` yoki `.doc` faylni tanlab, **Word faylni tahlil qilish va ko'rib chiqish** tugmasini bosadi. Fayl brauzerda matn sifatida ochilmaydi; autentifikatsiyalangan `/api/admin/tests/preview-document` endpointiga yuboriladi. Preview savol/variantlarni ajratadi, `#B.` yoki `# B.` markeridan javobni oladi va markerning o'zini kontentdan olib tashlaydi. O'qituvchi editor ichida boy matnni tuzatadi. Mavjud test faqat yakuniy **Testni saqlash** bosilganda yangilanadi.

DOCX parser savol/variant matnini, bold/italic/underline, rang, shrift o'lchami, paragraf tekislashini, raster rasmlarni, jadvallarni va qo'llab-quvvatlangan OMML formulalarni tartib bilan o'qiydi. OMML formulalarining original XML'i MathML `<annotation encoding="application/omml+xml">` ichida qoladi; kasr, ildiz, daraja, integral/yig'indi, limit, matritsa va tenglamalar tizimi strukturali MathMLga aylanadi. Rasm faqat ichki PNG/JPEG/GIF/WEBP data-uri sifatida saqlanadi. HTML/MathML allowlist bilan qayta quriladi; URL, SVG, script, tashqi resurs, makros, DTD/entity va xavfli ZIP kirishlari rad etiladi. Test/urinish/natija/zaxira yozuvlarida kontent test yozuvining o'zida qoladi, shuning uchun maktab scope, duplicate va backup restore joriy test ruxsatlarini saqlaydi.

Word bilan pikselma-piksel teng ko'rinish va'da qilinmaydi. Murakkab chart/SmartArt uchun Word ichidagi rasm fallback bo'lishi kerak. Header/footer, izoh/footnote, VML va tanilmagan OMML obyekti yo'qotilmasligi uchun importni to'xtatadi. MathType/OLE fayli quyida ko'rsatilgan maxsus converter xizmati talab qiladi.

## `.doc` va MathType uchun Netlify sozlamalari

Netlify Functions ichida LibreOffice o'rnatilgan deb hisoblanmaydi. Haqiqiy binar `.doc`ni `.docx`ga aylantiradigan ishonchli HTTPS service kerak. Netlify Site configuration → Environment variables bo'limida `DOC_CONVERTER_URL` va `DOC_CONVERTER_TOKEN` belgilang. Xizmat `multipart/form-data` dagi `file` maydonini qabul qiladi, `Authorization: Bearer <token>` bilan tekshiradi va 10 soniya ichida 4 MB dan kichik, haqiqiy DOCX bytes (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`) qaytaradi. Fayl kengaytmasini almashtirish konvertatsiya emas. Sozlama yo'q bo'lsa server `.doc` uchun aniq xabar va kerakli kalit nomlarini ko'rsatadi.

MathType/OLE obyektlari bo'lgan DOCX/DOC uchun `DOC_MATH_CONVERTER_URL` va `DOC_MATH_CONVERTER_TOKEN` ham kerak. Bu service DOCXni qabul qilib, OLE formulasini rasmdan taxmin qilmasdan, asl formulani OMML yoki MathML annotation sifatida saqlab, qayta DOCX qaytarishi shart. Xizmat bo'lmasa import aniq xato bilan to'xtaydi. Converter endpointlari faqat egasi boshqaradigan HTTPS serverlari bo'lsin; yuklangan maktab hujjati shu xizmatga yuboriladi.

## Hozirgi cheklovlar

Yangi importda TXT/Aiken tanlash olib tashlandi; eski Aiken formatidagi testlar o'zgarishsiz ishlaydi. Umumiy `content-renderer.js` eski matnni escape qiladi va rich HTML/MathMLni allowlistdan o'tkazadi. Lokal `mathjax` npm dependency'ning `tex-mml-svg-nofont.js` komponenti `public/vendor/mathjax/` orqali tarqatilib, MathML va chegaralangan LaTeXni SVGga o'tkazadi. SVG formulalarni kattalashtirganda tiniq saqlaydi; `nofont` build alohida shrift fayllarini yuklashga tayanmaydi. Xavfsizlik uchun TeX paketlari `base`, `ams`, `newcommand`, `noundefined` bilan cheklangan; HTML havola va uslub kirituvchi TeX buyruqlari yoqilmagan. MathJax komponenti va litsenziyasi dependency versiyasi bilan birga yangilanishi kerak.

Sinov namuna: `samples/word-import-sample.docx` (OMML, savol va variant ichidagi rasm, jadval, `# B.` marker). `node scripts/create-word-import-sample.mjs` namuna DOCXni qayta yaratadi. Kod/formula tahlili serverda; open test/attempt DTOlariga javob indeksi qo'shilmaydi.
