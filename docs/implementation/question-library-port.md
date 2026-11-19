# Savollar bazasini yangi GitHub repoga qo'shish

2026-11-17. Manzil: etirofxm-gif/nazorat-test, boshlang'ich main 422ef5f. Foydalanuvchi faqat bazani qo'shishni so'radi.

Izolyatsiyalangan port/question-library worktree yangi repo mainidan ochildi. Oldingi repodan faqat 113adf1, b314062, 69dc8d1, 18973d1, b687bfe, 4d91987 va 093f746 commitlarining baza patchlari olindi. Boshqa tarmoqlarning umumiy merge tarixi, secret-policy, login o'zgarishlari, formatlash va konfiguratsiya o'zgarishlari ko'chirilmadi.

- Mavzular bazasi va savollar CRUD/importi; barcha choraklardan tanlov va aniq kvotalar.
- Chorak/yuklangan sana tartibi, ikki ustunli sahifa, qidiruv/filtr/sahifalash.
- Testlar muharriri bilan bir xil Word import maydoni va handleri; yangi reponing mavjud rasmli savol muharriri qayta ishlatiladi.
- Saqlangan qoralama, onlayn berish, Word/PDF va alohida kalit; raqam savol boshida, variantlar A/B va C/D yonma-yon.
- Tayyor umumiy bank/moderatsiya/tarif ruxsatlari va zaxiradagi mavzular.
- Zarur mavjud test/attempt/result/backup modullariga faqat library origin va ruxsat integratsiyasi qo'shildi.

Yangi repodagi o'quvchi nazorati, server qoidabuzarliklari, natija o'chirish tombstonelari, matematik renderer/fontlar, qo'shimcha Word javob markerlari, rasm muharriri va natijalar UI fayllari saqlandi. PLAN/ARCHITECTURE ziddiyatlari yangi reponing mavjud qaydlarini saqlab hal qilindi; ushbu baza qaydi ularga qo'shildi. Haqiqiy baza yozuvlari yoki .env/.netlify ko'chirilmadi.

Tekshiruvlar yangi repo worktree ichida: npm run check va npm run build o'tdi. Faqat xotira Blobs va haqiqiy router/services/repositories bilan 15 mavzuli API oqimi, kvotalar, takroriy import/CAS, markerlar/rich DOCX, backup/restore, 20/20 idempotent baholash, tariflar va maktablararo ruxsatlar o'tdi. Chrome: 4 chorak compose/save, filtrlar orasidagi tanlov, sanalar, umumiy tahrirlanadigan import, 390/1280px light/dark va formulasiz/formulali eksport o'tdi. Word XML va haqiqiy Chrome PDFda A/B C/D joylashuvi tekshirildi. Bir martalik vositalar .local ichida, doimiy tests/ yaratilmagan.

GitHubga yangi repo maini asosidagi faqat bitta baza commiti yuboriladi; force push yoki eski repo mainini yangi repoga to'liq merge qilish ishlatilmaydi.

Yakuniy tekshiruv: 245 JS/MJS fayl node --check orqali o'tdi; aloqasiz student/core/vendor, rasm muharriri, yangi marker parseri, natijalar va config fayllari boshlang'ich main bilan bir xil. Alohida Netlify Dev urinishi mavjud lokal 3999 porti bandligi sabab to'xtadi; funksional tekshiruvlar yuqoridagi izolyatsiyalangan xotira serverida bajarildi.
