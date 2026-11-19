# Sozlamalarda null backup-status xatosi (2026-11-12)

Rasmdagi manzil: https://nazoratt-test.netlify.app/oqituvchi/sozlamalar.html. Ochiq js/core/api-client.js va js/teacher/data.js 200 bilan olindi: joriy frontend null javobni rad etadi va settings backup-statusni Promise.all orqali yuklaydi. Production admin tokeni yoki paroli ishlatilmadi; jonli admin javobi va function loglari ko'rilmadi.

Aniqlangan qayta hosil qilinadigan sabab: jobs.find('latest') zaxira vazifasi hali mavjud bo'lmaganda null qaytaradi; /admin/backup-status uni 200 null sifatida uzatadi. Global API client nullni yaroqsiz shakl deb rad etadi. Sozlamalarning Promise.all chaqiruvi shu sabab butun sahifani xato matniga almashtirgan.

- backupJobStatus yo'q yozuv uchun endi {status:'not_started'} qaytaradi; running/success/partial yozuvlari o'zgarmaydi. Omborga soxta zaxira yozuvi yozilmaydi.
- Sozlamalar sessiyani majburiy tekshiradi, zaxira ro'yxati va holatidagi nosessiya xatolarini alohida xabar bilan ko'rsatadi. Bitta qo'shimcha ma'lumot xatosi parol va zaxira boshqaruvining qolgan ko'rinishini yopmaydi.
- Global API client null/noto'g'ri JSONni hanuz rad etadi. 401 xatosi yutilmaydi; boshlang'ich yuklash va Yangilashda haqiqiy logout oqimi ishlaydi.
- Avtomatik zaxira hali boshlanmagani, jarayoni, muvaffaqiyati va qisman bajarilishi o'zbekcha ko'rsatiladi. Qo'lda Yangilash qayta so'rov beradi; doimiy polling qo'shilmadi.

Lokal tekshiruv: mavjud npm run dev localhost:8888; Node modul mocki bilan null/undefined va running/success/partial, Chrome/Playwright bilan not_started, eski 200 null, yaroqsiz HTML/503, archives xatosi, qisman natija, qayta yangilash va 401 logout o'tdi. Brauzer JS xatosi yo'q. Backend va brauzerning shu ssenariylarida xizmat javoblari taqlid qilindi; haqiqiy parol, zaxira yozish yoki restore amali bajarilmadi. Skrinshot .local/settings-null-fixed.png. Script/artefaktlar Gitga kirmaydi.

npm run check, npm run build va git diff --check o'tdi. Tuzatish lokal; ushbu ishda push/deploy qilinmadi. Netlifyda kuchga kirishi uchun server va frontend o'zgarishlari birga deploy bo'lishi kerak.

Fayllar: server/services/backup-archive-service.mjs, public/js/teacher/data.js, public/js/teacher/settings.js, PLAN.md, docs/ARCHITECTURE.md va ushbu hisobot.
