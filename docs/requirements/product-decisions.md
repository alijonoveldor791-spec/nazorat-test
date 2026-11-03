# Qarorlar, ochiq savollar va 2-bosqich

Sana: 2026-11-03. [Asosiy qoidalar](product-rules.md), [kod dalillari](product-evidence.md), [vakolatlar](roles.md).

1-bosqich: **tahlil va hujjatlar tayyor, qarorlar kutilmoqda**. Quyidagi tavsiyalar kod yozish yoki productionga tatbiq etishga ruxsat emas.

## Qarorlar reyestri

| ID | Holat | Qaror / chegarasi |
| --- | --- | --- |
| D01 | Tasdiqlangan talab | Uch mahsulot roli; doimiy noyob maktab IDsi; faqat o'z maktabini boshqarish |
| D02 | Tasdiqlangan talab | O'quvchiga hisob yoki shaxsiy kod yo'q; bitta testga bitta umumiy 6 raqamli kod, sinf va ism-familiya |
| D03 | Tasdiqlangan talab | Server qabul qilgan oxirgi startda taymer; server baholashi; startda kalit yo'q |
| D04 | Tasdiqlangan talab | Kech javob baholanmaydi; owner, draft versiyasi, natija idempotentligi va eski formatlar saqlanadi |
| D05 | Koddagi joriy xatti-harakat | Bosh admin maktab/obuna/admin va agregatlarni boshqaradi; individual pedagogik ma'lumotga kirishi yopiq |
| D06 | Koddagi joriy xatti-harakat | Browser+test+sinf+ism guruhiga limit; bu inson shaxsining tasdig'i emas |
| D07 | Koddagi joriy xatti-harakat | Trial/grace/start obuna gate yo'q; qoralama yo'q; shaxsiy kod yaratish hali bor |
| D08 | Tavsiya | Oddiy yopish yangi startni cheklasin, qabul qilingan urinish nusxasi/deadline saqlansin |
| D09 | Tavsiya | Ballni almashtirish o'rniga auditli ism tuzatish, natijani bekor belgilash va qayta topshirish |

## Faqat sezilarli qaror talab qiladigan savollar

| ID / holat | Savol | Tavsiya etilgan variant va sabab | Muqobil va narxi |
| --- | --- | --- | --- |
| Q1 — Foydalanuvchi qarori kerak | Bosh adminga maktab test/natijalariga texnik yordam uchun kirish kerakmi? | Hozirgi metadata/agregat chegarasi saqlansin; zarur support keyin alohida muddatli, maktab ruxsatli va auditli bo'lsin. Maxfiylik va vakolat aniq qoladi. | Doimiy individual kirish yordamni tezlashtiradi, ammo test kaliti va o'quvchi ma'lumoti uchun keng vakolat beradi. |
| Q2 — Foydalanuvchi qarori kerak | Oddiy pauza, blok/arxiv va favqulodda to'xtatish faol urinishga qanday ta'sir qilsin? | Oddiy holatlar faqat yangi startni yopsin; faol urinish muddati saqlansin. Favqulodda uzish alohida sababli amal bo'lsin, avvalgi server javoblarini saqlasin. Arxiv eksporti alohida vakolatli jarayon orqali. | Har qanday blokda uzish oddiyroq, ammo o'quvchi ishini kutilmaganda to'sadi; barcha holatda davom ettirish favqulodda chorani bermaydi. |
| Q3 — Foydalanuvchi qarori kerak | Urinish nazorati uchun brauzer limiti yetarlimi yoki o'qituvchi tasdig'i kerakmi; ismdosh, ism xatosi va qurilma almashish qanday boshqarilsin? | Ochiq mashqda oshkora texnik limit; nazoratli ishda maktab admini panelidan aniq qatnashuvni o'qituvchi tasdiqlashi variantini tanlash. Ismdoshlar ajratilsin, ism tuzatish auditli bo'lsin, qurilma yo'qolganda yangi urinish tasdiqlansin. Shaxsiy kod talab qilmaydi. | Faqat texnik limit qulay, lekin inkognito/ism bilan chetlab o'tiladi. O'qituvchi tasdig'i yuk va kutish qo'shadi; insonni avtomatik tasdiqlamaydi, nazoratda bo'lmasa baribir aldash mumkin. Bir xil brauzerda ismdoshlarni ajratish uchun qatnashuv konteksti kerak bo'ladi. |
| Q4 — Foydalanuvchi qarori kerak | Yakunlangan test qayta ochiladimi; tahrir eski urinishga ta'sir qiladimi? | Qoralama/faol/to'xtatilgan/yakunlangan; yakunlanganni nusxalash. Revision, savol/sozlama/jadval faqat yangi urinishga o'tsin. Tarixiy baholash izchil qoladi. | Qayta ochish moslashuvchan, ammo eski/yangi qatnashuv, deadline va tahlil davrlarini ajratishni murakkablashtiradi. |
| Q5 — Foydalanuvchi qarori kerak | Ball, savol bo'yicha to'g'ri/noto'g'ri belgilari va kalitli sharh qachon ochilsin? | Ball yakunda, savol belgilari va kalitli sharh jadval oxiri + admin ruxsatidan keyin; jadvalsiz testda admin qo'lda ochsin. Erta tarqalish kamayadi. | Darhol sharh mashqda foydali, lekin hali ishlayotganlarga javob sizishi mumkin. Ballni ham yashirish alohida e'lon qilish oqimini talab qiladi. |
| Q6 — Foydalanuvchi qarori kerak | Trial davomiyligi, obunasiz maktab va imtiyozli muddat qanday bo'lsin? | Boshlang'ich taklif: bir marta 14 kun trial; obunasiz/tugaganda yangi start yopiq, boshlangan ish va eski natija/eksport ochiq. Avtomatik grace 0 kun, bosh admin sababli uzaytirsin. Sodda va oldindan tushunarli. | Trial/grace muddatini o'zgartirish mumkin; trialni doimiy qayta berish nazorati va avtomatik grace hisob-kitobi qo'shimcha siyosat talab qiladi. 14/0 kun tasdiqlanmagan. |
| Q7 — Foydalanuvchi qarori kerak | Natijani bekor/o'chirish, audit ko'rinishi va saqlash muddatlari qanday? | Maktab admini sababli bekor belgilasin, ball qo'lda o'zgarmasin. Taklif: natija/javob va audit 12 oy, yakunlangan urinishning texnik nusxasi 7 kunlik recoverydan keyin tozalashga nomzod; faol urinish o'chmasin. Audit maktab doirasida, bosh adminda boshqaruv amallari. | Muddatlar maktab ehtiyojiga qarab uzoqroq/qisqaroq bo'lishi mumkin; bular huquqiy norma emas, kelishiladigan mahsulot parametri. Fizik o'chirish tiklash va eksport nusxalarini ham qamrashi kerak. |
| Q8 — Foydalanuvchi qarori kerak | Kim backupni tiklaydi va to'liq falokatdan tiklash qanchalik tez kerak? | Maktab adminiga o'z eksporti, restore/clear hozircha yopiq. Tiklash vakolatli operatorga aniq maktab va tasdiqlangan lokal tekshiruv bilan. Taklif: kunlik shifrlangan to'liq zaxira, 30 kun saqlash, 24 soatgacha yo'qotish, 1 ish kuni ichida tiklash maqsadi. | Maktab adminiga self-service restore tezroq, ammo preview, dry-run, egalik, rollback va kod kalitlari rejasi talab qiladi. Oddiy backup v2 bu maqsadlarni bajarmaydi. Muddatlar tasdiqlanmagan. |

Q3dagi variantlar shaxsiy akkaunt/kodning yashirin o'rnini bosmaydi. Tasdiq navbati texnik urinishga bog'lanadi, o'quvchiga qo'lda kiritiladigan individual sir berilmaydi. O'qituvchi nazoratisiz qat'iy inson boshiga limit kafolati berilmaydi. Bir xil ismli ikki o'quvchi uchun ismni sun'iy o'zgartirish tavsiya etilmaydi.

## 2-bosqich: ustuvor ishlar va qabul mezonlari

Bu ro'yxat bajarilgan ish emas. P0 — avval, P1 — undan keyin. Qaror bilan bog'liq ish tanlov qayd etilgach boshlanadi. Mustaqil tayyorgarlik uchun mezonlar hozirdan tayyor.

| Navbat | Vazifa / bog'liqlik | Tekshiriladigan qabul mezonlari |
| --- | --- | --- |
| P0-1 | Shaxsiy kod yaratish/backfill/tarqatishni to'xtatish; D02, E05 | Yangi roster, admin list va backup import yangi `accessCode` yaratmaydi; asosiy kirishda shaxsiy kod maydoni yo'q; eski formatdagi ID/ball/kod yozuvlari buzilmasdan o'qiladi. Legacy yangi start va eski resume chegarasi alohida belgilanadi, mavjud urinish recovery saqlanadi. |
| P0-2 | Startni kod revoke bilan izchil qabul qilish; E10 | Parallel activate/revoke/replace/start production workerlar doirasida tekshiriladi; revoke javobidan keyin eski versiya bilan yangi qabul yo'q; retry bir urinish, begona maktab/kod/sinf rad; qabul qilingan urinishda kodning texnik versiya dalili, xom kodsiz. |
| P0-3 | Obuna server gate va davom etish siyosati; Q6 | Resolve/start obuna muddatini qayta tekshiradi; aniq chegara `now === endsAt`; oldin boshlangan ish yakunlanadi; eski natija/CSV/XLS/backup ochiq; legacy yo'l yangi maktab cheklovini chetlab o'tmaydi. |
| P0-4 | Ismdoshlar, urinish limiti va qayta ruxsat; Q3 | Bir xil ism bir/boshqa qurilmada begona javobni olmaydi; limit qaysi doiraga tegishli ekani UIga mos; +1 ruxsat aniq qatnashuvga, retry takror grant bermaydi; ism tuzatish ball/deadline/limitni o'zgartirmaydi. |
| P1-1 | Test holati va tahrir nusxasini barqaror qilish; Q2/Q4 | Qoralama va terminal holatlarda start rad; oddiy pauza/blok va jadval tahriri tanlangan siyosatga mos; test/sinf o'chirish eski urinishni yo'qotmaydi; oldingi/yangi revision baholashi to'g'ri. |
| P1-2 | Natija e'loni va kalit ochish; Q5 | Ochilishgacha review va tanlangan savol belgilari yo'q; ball tanlangan vaqtda; joriy ruxsat o'chirilgach kalit keyingi javobdan olib tashlanadi; eski format natijalari saqlanadi. |
| P1-3 | Audit va sababli tuzatish/bekor qilish; Q1/Q7 | Actor/maktab/obyekt/vaqt/sabab/operatsiya ID qaydi; secret va to'liq javob logda yo'q; faqat o'z maktabi vakolati; bekor natija asl ballni saqlaydi va qayta urinish bermaydi. |
| P1-4 | Retention va tiklash loyihasi; Q7/Q8 | Dry-run/egalik/ruxsat va qisman uzilishdan qayta tiklash lokal tekshiriladi; eski ID/ball va bekor kod rezervi saqlanadi; sirlar uchun alohida tiklash rejasi; o'chirilgan yozuv backupdan yashirin qaytmaydi. |
| Har o'zgarishda | Mavjud yaxlitlikni saqlash; T01–T07 | Boshqa maktab GET/PUT/DELETE/export rad, logout server revokatsiyasi, offline/late/stale draft, boshqa owner, ikki oyna va parallel submit lokal tekshiriladi. Javob kaliti startda yo'q. `check/build` bajariladi; tests/ va audit skriptlari o'z-o'zidan qayta yaratilmaydi. |

2-bosqichning birinchi amaliy ishi P0-1; P0-2 undan mustaqil xavfsiz qabul protokoli sifatida loyihalanadi. Q6 tasdiqlanmaguncha trial/grace raqamlari kodga yozilmaydi. Q3 tasdiqlanmaguncha qat'iy shaxs nazorati bajarildi deb ko'rsatilmaydi.

## Tekshiruv

Keyingi nashr topshirig'i (2026-11-03): foydalanuvchi GitHub va Netlifyga yuklashga ruxsat berdi. Bo'sh `build` buyrug'i asl `npm run check` qiymatiga qaytarildi; `npm run check` va `npm run build` qayta bajarilib, ikkalasi ham 212 faylda o'tdi. Quyidagi bo'sh build haqidagi qayd dastlabki hujjatlashtirish paytidagi holatdir. Mahsulot qarorlari hamon kutilmoqda; nashr ularni tasdiqlamaydi.

- Hozirgi bosqichda faqat Markdown hujjatlari o'zgartiriladi; runtime, sxema, parol, kalit, lokal/production ma'lumotlariga yozish va deploy yo'q.
- `npm run check`: o'tdi (212 fayl). Node 22.23.4 vaqtinchalik o'rnatmasi shu jarayon PATHiga qo'shilib, Windowsda `npm.cmd run check` ishlatildi.
- `npm run build`: bajarildi, exit 0, ammo tekshiruv ishlamadi. Ish boshlanishida `build: "npm run check"` edi; ish davomida muallif tashqarisidagi o'zgarishda `package.json`dagi qiymat ikki bo'sh joyga aylangan. Bu o'zgarish ushbu hujjat vazifasida kiritilmadi yoki qaytarilmadi. Buyruqning muvaffaqiyatli chiqishi build tekshiruvi o'tganini bildirmaydi.
- Tuzilma mustaqil `check` bilan tekshirildi; kompilyatsiya bosqichi yo'q. Bu tekshiruv funksional ishlashni, ruxsat yoki parallel so'rov kafolatlarini tasdiqlamaydi. `git diff --check`, yangi fayllarning `--no-index --check` tekshiruvi va asosiy to'rtta hujjatdagi mahalliy havolalar tekshiruvi xatosiz o'tdi.
- Frontend/backend yoki recovery kodi o'zgarmagani uchun `npm run dev`, login/parol, runtime va brauzer sinovlari bu hujjat bosqichida bajarilmaydi. Tarixiy test natijalari bugungi tekshiruv sifatida berilmaydi.
