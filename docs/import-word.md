# Word importi holati

Joriy versiyada yangi savol importi Aiken `.txt` matnini o'qiydi va serverdagi `/api/admin/tests/preview` orqali tekshiradi. DOCX/Word importi hali mavjud emas. `.doc` faylni `.docx` deb qayta nomlash ishlamaydi; haqiqiy DOC formatini faqat Word yoki LibreOffice kabi mos dasturda DOCXga konvertatsiya qilib so'ng ishlatish mumkin, ammo ushbu ilova hozircha DOCXni ham qabul qilmaydi.

Word qo'llab-quvvatlashi tayyor bo'lmaguncha formulali/jadval/rasmli DOCXni Aiken matniga ko'chirish orqali saqlamang: bu format obyektlari va tartibni yo'qotishi mumkin. Hozir saqlash uchun admin muharririda savol/variantlarni qo'lda kiriting. Eski Aiken testlar saqlangan va o'quvchi oqimida ishlashda davom etadi.

Maqsadli arxitektura serverdagi DOCX → OMML → MathML tahlili, xususiy assetlar, tahrirlanadigan preview va lokal MathJax renderidan iborat. Xavfsiz DOC konvertatsiyasi Netlify Functions muhitida mavjud bo'lmasa, administratorga Word yoki LibreOffice orqali haqiqiy konvertatsiya talabi aniq ko'rsatiladi; extension almashtirish konvertatsiya emas. Ushbu bosqichlar hozircha bajarilmagan, batafsil holat [PLAN](../PLAN.md)da qayd etilgan.
