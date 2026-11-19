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

## O'qiladigan savol va javob formati (2026-11-12)

Muammo: variant harfi/holati va variant mazmuni ikkita alohida paragraf bo'lgan. Rich HTMLdagi p elementlari bilan ular orasida katta uzilish hosil bo'lgan.

Endi har savoldan keyin Variant / Javob matni / Belgi ustunli native Word jadvali bor. Harf va matn bir qatorda, tanlangan variant va to'g'ri javob matn bilan belgilangan. To'g'ri variant och yashil, tanlangan noto'g'ri variant och qizil; kalit yo'q bo'lsa tanlov neytral rangda. Har savoldan keyingi To'g'ri/Noto'g'ri/Javobsiz xulosasi va balli alohida ajraladi. Ranglar yagona belgi emas.

QuestionText va OptionText paragraf uslublari shrift/oraliqlarni tartiblaydi. Variant qatorlariga cantSplit, takrorlanuvchi jadval sarlavhasi va 650/6050/2300 twip ustunlar berildi. Uzun kontent bitta sahifadan katta bo'lsa Word tabiiy davom ettirishi mumkin; butun savol doim bitta sahifaga sig'adi degan kafolat yo'q. Rasmli variantlar 380px kenglik, ichki jadvallar 5700 twip chegarasiga moslanadi. Savol ichidagi boy matn, native formula, rasm va jadvallar saqlanadi.

Lokal tekshiruvlar:

- Foydalanuvchi yuborgan 10 savol, 4 to'g'ri/6 noto'g'ri, 4/10 ball, 50 savolli baza va 559 soniya bilan .local/formatted-student-sheet.docx tayyorlandi. Shaxsiy ma'lumotlar faqat Gitga kirmaydigan .local fixture va hujjatda.
- XMLda 10 variant jadvali, har birida A-D matni bilan bir qator, bittadan tanlangan va to'g'ri belgi, 4 ta yashil va 6 ta noto'g'ri xulosa tekshirildi. Natija qayta baholanmadi.
- Microsoft Word COM orqali aynan shu hujjat readonly ochildi: 10 jadval, 3 sahifa; birinchi savolda C tanlangan/to'g'ri, ikkinchisida A tanlangan va D to'g'ri ekanligi tekshirildi.
- Oddiy, sampled30, DTM90, formula/rasm/jadval va eski savolsiz beshta fixture XML/ZIP va Microsoft Word ochilishidan o'tdi. Rich hujjatda 7 native formula va 2 rasm saqlandi. Kalitsiz eski savol noto'g'ri deb qizil belgilanmasligi ham tekshirildi.
- Haqiqiy npm run dev localhost:8888 API: yakuniy aralashtirilgan boy test -> DOCX, tugamagan urinish404, tokensiz401, o'quvchi401, boshqa maktab404, bosh admin403, yashirin o'quvchi natijasining admin eksporti va keyingi test tahriri hujjat snapshotini o'zgartirmasligi o'tdi.
- PDF eksporti mahalliy Word avtomatizatsiyasida kutilib qolganligi sabab tugatilmadi; PDF tayyor deb da'vo qilinmaydi. O'zimiz yaratgan avtomatizatsiya jarayonlari to'xtatildi; foydalanuvchining oldindan ochiq Word jarayoniga tegilmadi. DOCXning Wordda ochilishi va obyektlari alohida muvaffaqiyatli tekshirildi.
- npm run check, npm run build va git diff --check o'tdi. Yangi tests/audit yoki npm dependency qo'shilmadi; push/deploy qilinmadi.

O'zgargan kod: server/lib/result-word.mjs, word-xml.mjs, word-rich.mjs, word-package.mjs, word-media.mjs. Arxitektura va PLAN ushbu bosqichga yangilandi.
