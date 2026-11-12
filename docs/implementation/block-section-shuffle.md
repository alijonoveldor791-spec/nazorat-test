# Blok savollarini fan ichida aralashtirish (2026-11-12)

Test tahririda Blok test uchun Har bir fan bo'limi ichida savollarni aralashtirish tanlovi yoqiladi. U mavjud shuffleQuestions sozlamasidan foydalanadi; yangi format yoki majburiy default yo'q. Tanlov o'chirilgan eski testlar o'z tartibini saqlaydi.

Serverdagi presentation har bir ketma-ket section.id/type/subject bo'limini alohida seed bilan aralashtiradi. 1-mutaxassislik 30, 2-mutaxassislik 30 va majburiy fanlar 10/10/10 chegaralari o'zgarmaydi. Bir xil fan ikki bo'limda bo'lsa ham bo'limlar birlashtirilmaydi. Fanlar tartibi va sonlar o'zgarmaydi. Bo'limsiz oddiy testlarning to'liq shuffle algoritmi, bazadan tanlangan sourceOrder va variantlarni aralashtirish saqlangan.

sourceIndex/sourceOptions va answer yangicha savol tartibiga to'g'ri bog'langan. Seed urinish IDsi asosida bo'lgani uchun bir urinish qayta ochilganda tartib saqlanadi; yangi urinish boshqa tartib oladi. Mavjud boshlangan urinish snapshoti qayta aralashtirilmaydi. Ochiq start javobida answer/sourceIndex/sourceOptions yo'q.

UI'dagi block sababli disable/uncheck qoidalari, save xizmatidagi false override va restoreTest'dagi false override olib tashlandi. Oddiy sampled testdagi majburiy shuffle saqlandi. Saqlash tasdig'ida fan ichida aralashtirish alohida izohlanadi.

## Lokal dalillar

- 100 seed: deterministik tartib, 90 ta takrorlanmagan manba savoli, 30/30/10/10/10 bo'lim chegaralari, bir xil nomdagi fanlar ajralishi, variant javoblari va DTM 189 tekshirildi.
- O'chirilgan shuffle, oddiy test shuffle va explicit sampled sourceOrder mosligi tekshirildi. 90 savolli DTM restoreTest validatori shuffleQuestions=true qiymatini saqladi.
- Mavjud npm run dev localhost:8888 bilan haqiqiy lokal API: test yaratish/GET, faol kod bilan boshlash, barcha public savollarda kalit yo'qligi, qayta startda bir xil tartib, draft versiya/answers resume, to'liq 189 ball, takroriy submit idempotentligi, har fan bo'yicha 30/30/10/10/10 natija va shuffle o'chirilganda dastlabki tartib o'tdi.
- Haqiqiy admin backupidagi test restoreTest orqali tekshirilganda shuffle flag saqlandi.
- Chrome/Playwright haqiqiy lokal API bilan: Blok checkbox enabled, aniq label/hint, yoqish, saqlash tasdig'i, saqlangandan keyin qayta ochishda checked holati, oddiy sampled rejimda majburiy shuffle va blokka qaytganda qo'lda o'chira olish tekshirildi. JS xatosi yo'q. Skrinshot .local/block-shuffle-option.png.
- To'liq restore-preview/apply sinovi yakunlanmadi: mavjud Netlify Dev proxy restore-preview so'rovida HeadersOverflowError / Could not proxy request (500) berdi. Bu oqimda xavfsizlik/ruxsatlar kodi o'zgartirilmadi; to'liq tiklash muvaffaqiyati da'vo qilinmaydi. Restore flag validatori va backupdagi qiymat alohida o'tdi.
- Lokal sinov ma'lumotlari/skriptlari .local ichida; tests/ yoki audit skriptlari repoga qo'shilmadi. Parol bilan kirish faqat localhost'da bajarildi.
- npm run check, npm run build, git diff --check o'tdi. Push/deploy bajarilmadi.

## Fayllar

- server/lib/shuffle.mjs
- server/services/test-service.mjs
- server/lib/backup-validate.mjs
- public/js/teacher/question-bank-form.js
- public/js/teacher/test-audience.js
- public/js/teacher/test-form-view.js
- PLAN.md, docs/ARCHITECTURE.md, ushbu hisobot
