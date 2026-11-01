# Loyiha qoidalari

- Toza HTML/CSS/ES modules. Frontend framework, CDN va tashqi shrift qo'shmang.
- Faqat `public/` tarqatiladi. Rootga muqobil sahifa yoki katta umumiy JS yozmang.
- Kod fayli bitta vazifani bajarsin; 250 qatordan, `api.mjs` 20 qatordan oshmasin.
- Har JS/MJS/CSS fayl boshida vazifasini tushuntiruvchi qisqa izoh bo'lsin.
- HTMLda inline script, style va hodisa atributlari bo'lmasin.
- Brauzer kirishi: `public/js/<rol>/<sahifa>.js`; umumiy UI core/components ichida.
- Server: routes → services → repositories. Blobs faqat repositories'da.
- Aiken parser faqat serverda. Preview `/api/admin/tests/preview` orqali.
- UI matni o'zbek lotinida, apostrof `'`; foydalanuvchi matnini escape qiling.
- Test va natijalardagi eski formatlarga moslikni saqlang. Maxfiy javob kalitlarini ochiq endpointlarga qo'shmang.
- Fayl nomlari kichik harf/defis; funksiyalar camelCase; qiymat konstantalari UPPER_SNAKE_CASE.
- `.env`, `.netlify` va artefaktlar Gitga kirmasin.
- `npm run check` va `npm run build` majburiy. Zarur oqimlarni `npm run dev` bilan lokal tekshiring. Foydalanuvchi topshirig'i bilan tests/ va test/audit skriptlari olib tashlangan; ularni o'z-o'zidan qayta yaratmang.
- `npm run build` faqat tekshiruv; kompilyatsiya bosqichi yo'q. `npm run format` yagona formatni qo'llaydi.
- Tuzilmani o'zgartirganda PLAN va arxitektura hujjatini yangilang, tekshirilgan bosqichlarni alohida commit qiling.
- Ro'yxat va shaxsiy o'quvchi kodlarini public APIga chiqarmang. Admin tokeniga parolga bog'liq verifier qo'ymang; logout server sessiyasini bekor qilsin.
- Muddatdan keyin faqat serverga avval yetgan javoblar baholansin. Draft versiyasi, brauzer egaligi va natija idempotentligini saqlang.
- Xavfsizlik/recovery o'zgarsa tegishli ruxsat, egalik va tiklash oqimlarini lokal tekshiring; parol sinovi faqat lokal uchun.
