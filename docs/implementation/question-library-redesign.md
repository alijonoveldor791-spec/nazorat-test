# Savollar bazasi: rasm asosidagi ko'rinish

2026-11-17. Mahalliy o'zgarish; push va deploy bajarilmadi.

- Mavzular va tanlangan mavzular ikki ustunda; tor ekranda bitta ustun.
- Sarlavhada jami savollar, saqlangan va faol testlar soni; mavjud sinf/fan/chorak filtrlari saqlangan.
- Tanlov panelida test nomi, har mavzuning mavjud soni, bevosita raqam kiritish va minus/plus, jonli jami. Noto'g'ri, kasr, manfiy yoki mavjuddan ko'p miqdor hamda jami 200 dan ortiq bo'lsa tuzish yopiladi; server kvotalarni qayta tekshiradi.
- Test qoralamasi mavjud review, almashtirish, qayta tuzish va tasdiqlab saqlash oqimini ishlatadi.
- Saqlangan testlar uchun nom/kod qidiruvi, Barchasi/Qoralama/Faol filtri va 4/8/20 tadan lokal sahifalash.
- Word importi, savol muharriri, prompt, publish, eksport, umumiy bank olish va moderatsiyaga yuborish saqlangan. O'chirish tasdiqdan keyin mavjud maktab doirasidagi DELETE endpointini ishlatadi.
- Difficulty va yangilanish sanasi mavzu DTOsida yo'q; rasmga o'xshatish uchun soxta qiymat qo'yilmadi.
- library-view va library-icons ko'rinishga javobgar; bosh modul sahifa holati va hodisalarni boshqaradi. CSS vazifasi bo'yicha ikki faylda; tashqi shrift/dependency qo'shilmadi. Server saqlash va ruxsat mantig'i o'zgarmadi.

Lokal dalillar: mavjud .local/wizard-server xotira Blobs fixture va haqiqiy router/services/repositories. .local/library-redesign.mjs bir martalik vosita, Gitga kirmaydi; tests/ yoki audit infratuzilmasi yaratilmagan.

Chrome: ikki mavzuda 30 tadan savol, tanlov 10+10, plus bilan 21, noto'g'ri 300 rad etilishi, nom berib 20 savollik qoralama tuzish va saqlash, qidiruv, holat filtri, keyingi sahifa va mavzuni chiqarish o'tdi. 390/965/1440px light/dark: gorizontal chiqish va JS xatosi yo'q. PNGlar .local/library-evidence/redesign-* ichida. Haqiqiy maktab ma'lumotlariga yozilmadi.

npm run dev urinishi Netlify global config yozuviga EPERM sabab to'xtadi; o'rniga yuqoridagi izolyatsiyalangan lokal server bilan oqim tekshirildi. npm run check va npm run build yakunda o'tdi. Tegishli kod Prettier orqali formatlandi.
