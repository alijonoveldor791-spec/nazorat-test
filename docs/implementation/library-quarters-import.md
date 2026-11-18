# Barcha choraklar va yagona Word importi

2026-11-17. Foydalanuvchi turli chorak mavzularidan birga test tuzish, chorak/yuklangan vaqt tartibi va Testlar bo'limidagi import imkoniyatlarini so'radi.

## Natija

- Frontend tanlovi, server compose va save endi bir xil sinf/fandagi turli 1-4-chorak mavzularini qabul qiladi. Sinf/fan, maktab egaligi, noyob savollar, aniq kvotalar va jami 200 savol cheklovi saqlanadi.
- Chorak filtri faqat ko'rinadigan mavzularni o'zgartiradi; boshqa chorakdan tanlanganlar panelda qoladi. Avtomatik nom tanlangan choraklarni sanaydi, foydalanuvchi yozgan nomga tegmaydi.
- Mavzular 1-, 2-, 3-, 4-chorak guruhlarida; ichida eng yangi yuklangan birinchi. Teng sanada nom/ID bilan barqaror tartib. Sana bo'lmagan yozuvlar uchun soxta sana yaratilmaydi.
- Server yangi mavzuga createdAt/updatedAt, muvaffaqiyatli importga lastUploadedAt/updatedAt beradi. Foydalanuvchi yuborgan createdAt e'tiborga olinmaydi; savol tahriri lastUploadedAtni almashtirmaydi. Eski mavzu qayta import qilinsa uning yuklash vaqti shu paytdan ma'lum bo'ladi.
- Mavzu kartasida yuklangan vaqt Asia/Tashkent bo'yicha, sanasiz eski yozuvda Sana noma'lum. Saqlangan testlar chorak va yaratilgan vaqt bilan tartiblanadi; test nusxasining composition.topics.quarter qiymatini server manbadan belgilaydi. Eski composition choraksiz o'qiladi, UI mavjud mavzudan topa oladi.
- restoreTopics ixtiyoriy uch sanani tekshirib saqlaydi, eski sanasiz backup o'qiladi. compositionValid chorak maydonini zaxira va test nusxasida saqlaydi.
- Testlar va savollar bazasi test-import-view markup va bindTestImport handleridan foydalanadi: .doc/.docx, 4 MB, server /api/admin/tests/preview, ogohlantirishlar, almashtirish tasdig'i. Oldin yaroqli fayldan keyin noto'g'ri fayl tanlansa eski fayl importga qolib ketishi ham tuzatildi.
- Mavzu importida question-editor orqali rich matn/formula/rasm preview, savol/variant va to'g'ri javobni tahrirlash, savol/variant qo'shish/o'chirish mavjud. Checkboxlar qaysi savollar qo'shilishini belgilaydi, qayta chizishda belgi saqlanadi. Mavjud mavzu savollari almashtirilmaydi; append versiyasi o'zgarsa server 409 qaytaradi.
- library-import va library-order alohida vazifalarga ajratildi; sahifaning yashirin file inputi olib tashlandi. Tashqi dependency, framework, CDN yoki public javob kaliti qo'shilmadi.

## Lokal dalillar

Haqiqiy router/services/repositories, xotiradagi Blobs va Chrome bilan .local/library-quarters-verify.mjs bir martalik tekshiruv. tests/ yoki audit infratuzilmasi yaratilmagan, real maktab ma'lumotlariga yozilmagan.

- 4 chorakdan compose/save, har chorak kvotasi va snapshot; boshqa sinfni rad etish.
- 1-4-chorak sarlavhalari, bir chorakdagi ikki sana, sanasiz legacy tartibi, filterlar orasida saqlangan tanlov va avtomatik/custom nom.
- Sanali va sanasiz mavzular backup -> preview -> restore; client createdAtni e'tiborga olmaslik.
- Word tanlangach faqat Tahlil qilish bilan preview; uch savoldan birini chiqarish, birini tahrirlash, variant/to'g'ri javob qo'shish, savol o'chirish va yangi savol kiritish; oldingi 8 savol saqlanib faqat 2 yangi savol qo'shilishi.
- Savollar bazasi va Testlar oynalarida bir xil import markup hamda sample DOCXdagi MathML/rasm preview. 390/1280px light/dark, gorizontal chiqish va JS xatosi yo'q. PNGlar .local/library-evidence/quarters-*.
- Oldingi 15 mavzuli API oqimlari: DOCX/markerlar, aniq kvotalar, boy kontent, backup/restore, kod bilan kirish va idempotent submit, bank tariflari/maktablararo ruxsatlar ham o'tdi.
- Ishlayotgan npm run dev localhost:8888 serverida sahifa, login/session/logout smoke tekshiruvi o'tdi. npm run check va npm run build o'tdi; tegishli fayllar Prettier bilan formatlandi.

Eski mavzularda avvalgi yuklash sanasi saqlanmagan bo'lsa uni orqaga qarab tiklash mumkin emas. Word .doc va MathType uchun mavjud tashqi converter cheklovlari o'zgarmaydi.
