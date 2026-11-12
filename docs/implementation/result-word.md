# O'quvchining yakuniy test varaqasini Word'da yuklash

2026-11-12. Tarmoq: feature/student-result-word.

## Xulq

Natijalar -> Ko'rish -> Word (.docx) yuklab olish. Har bir yakuniy natija
uchun alohida haqiqiy DOCX yaratiladi. Fayl guruh, familiya va ism bilan
saqlanadi; fayl nomidagi yaroqsiz belgilar almashtiriladi.

Hujjatda o'quvchi, test va guruh nomi, Toshkent vaqti, sarflangan vaqt,
baholash turi, to'g'ri javoblar va jami ball bor. DTM uchun fanlar kesimidagi
bali va har savolning 3,1/2,1/1,1 hisobidagi bali keltiriladi. Har savolda
variantlar, o'quvchi tanlagani, to'g'ri javob va To'g'ri/Noto'g'ri/Javobsiz
holati yoziladi. Bu tanlangan variantlar sharhi; yechim bosqichlari tizimda
yozilmagani uchun o'ylab topilgan yechim berilmaydi.

Savollar faqat saqlangan result.questions/answers snapshotidan olinadi.
Shuffle, variantlar joyi, bankdan tanlangan 30/100 va keyingi test tahrirlari
Worddagi eski urinishni buzmaydi. Eski natijada savollar bo'lmasa umumiy
natija va batafsil savollar saqlanmagani haqida izoh chiqariladi.

## Ruxsat va paket

GET /api/admin/results/:id/word faqat school_admin uchun mavjud. Natija
findResult -> scoped repository orqali olinadi: boshqa maktab 404, login
bo'lmasa yoki o'quvchi tokenida 401, bosh adminning maktab endpointida 403.
Yakunlanmagan, natijasi hali yo'q urinish uchun fayl berilmaydi.

API no-store va nosniff bilan attachment DOCX qaytaradi. Token faqat
Authorization headerda; URL, fayl nomi yoki Wordga yozilmaydi. Student public
natijasi va uning yashirish siyosati o'zgarmaydi. O'quvchidan yashirilgan
natijani o'z maktab admini tekshirish uchun eksport qila oladi.

FFlate va mavjud XML/sanitizerdan foydalaniladi; yangi npm dependency yo'q.
Matn XML escape qilinadi. Boy content native Word paragraflari, jadvallar,
OMML formulalar va ichki PNG/JPEG/GIF/WEBP media sifatida paketlanadi.
MathML annotationdagi asl XML ko'chirilmaydi. Makros, altChunk, tashqi
relationship yoki media so'rovi yaratilmaydi. Media jami 10 MB bilan cheklangan.

## Fayllar

- server/routes/admin/results.mjs: admin download adapteri va xavfsiz header.
- server/services/result-word-service.mjs: egaligi tekshirilgan natijani olish.
- server/lib/result-word.mjs: savol/variant/javob va natija hujjati.
- server/lib/word-xml.mjs: XML text/run/paragraph/table.
- server/lib/word-rich.mjs: rich HTML va rowspan/colspanli jadvallar.
- server/lib/word-math.mjs: MathMLdan native OMML.
- server/lib/word-media.mjs: ichki rasmlar, o'lcham va deduplikatsiya.
- server/lib/word-package.mjs: DOCX parts, styles va ZIP.
- public/js/teacher/result-word.js: tokenli binary yuklama.
- teacher/results.js va result-detail.js: tugma va action.
- PLAN, ARCHITECTURE va o'qituvchi qo'llanmasi yangilandi.

## Tekshiruvlar

- Plain, 30-savolli bank, 90-savolli DTM, boy formula/rasm/jadval va eski
  savolsiz natija uchun 5 xil DOCX yaratildi. ZIP CRC/XML tekshirildi.
- Mustaqil python-docx reader barcha fayllarni ochdi. 30 va 90 savol soni,
  30/30 va 189/189 jami ball, 3,1/2,1/1,1 savol ballari tekshirildi.
- Microsoft Word COM orqali 5 fayl read-only ochildi. Boy hujjatda 7 native
  math obyekti, 1 jadval va 2 ichki rasm borligi tasdiqlandi.
- Real APIda aralashtirilgan rich testga correct/wrong/unanswered javoblar
  yuborildi; Word aynan shu urinishni berdi. Student natijasi yashirin edi.
- Keyin test savollari va kaliti o'zgartirildi; eski DOCX document.xml
  o'zgarmadi. Cross-school 404, no-token/student401, root403 va active404 o'tdi.
- Chrome'da Natijalar -> Ko'rish -> Word tugmasi orqali haqiqiy fayl yuklandi;
  guruh/o'quvchi fayl nomi va Authorization header tekshirildi. API va brauzer
  yuklagan DOCX mustaqil readerda ochildi.
- Literal scriptga o'xshash oddiy matn escape qilindi; paketlarda vba,
  altChunk, tashqi relationship va token yo'q. Unicode fayl nomi tekshirildi.

npm run check va npm run build: PASS. Yangi/o'zgargan JS/MJS sintaksisi
node --check orqali ham tekshirildi. Test/audit
va tests/ yaratilmagan. Harnesslar, Office/Python artefaktlari va lokal
tekshiruv vositalari .local/ ichida, Gitga kiritilmaydi.

## Cheklovlar

HTMLning barcha shriftlari va pikselga bir xil ko'rinishi va'da qilinmaydi;
rasmlar sahifaga sig'diriladi. WEBP ko'rinishi Word versiyasiga bog'liq.
Eski natijada savol/kalit yozilmagan bo'lsa ular qayta tiklanmaydi.

Brauzerning avvalgi MathJax loaderi cdn.jsdelivr.net dan mathjax-newcm-font
ololmasligi haqida xato chiqardi; bu mavjud renderer alohida masala.
Word yuklash va native OMML hujjatlari bunga bog'liq emas va tekshiruvdan
o'tdi.

Alohida production/deploy/main birlashtirish yoki GitHub push bajarilmadi.
