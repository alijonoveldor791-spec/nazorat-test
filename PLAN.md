# Ish rejasi

## Sinf kartalari (2026-11-05)

Sinf kartalari test kartalariga moslashtirildi: 20px nom, SVGli meta, test chiplari, ixcham sana va karta ustidagi amallar oynasi. Mavjud progress, roster kodi, tahrir va o'chirish handlerlari saqlandi. Menyu/icons/sana components ichiga chiqarildi va test kartalari ham qayta ishlatadi. 12 responsive/theme holat, fokus/overlay, sinf amallari va test kartasi regressiyasi lokal mock admin API bilan o'tdi; check/build o'tdi. Hisobot: `docs/implementation/class-card-redesign.md`. Push/deploy yo'q.

2026-11-05 yangilanish: foydalanuvchi so'rovi bilan menyuga joy ajratish o'rniga karta ustida markaziy oyna qo'llandi. Karta balandligi o'zgarmaydi; fon xiralashadi va shu kartadagi fon boshqaruvlari vaqtincha inert bo'ladi. Amallar oynasi non-modal dialog sifatida belgilangan, Tab/Shift+Tab fokusni oynada saqlaydi; Escape va tashqariga bosish yopadi. Menyu kerak bo'lsa viewportga olib kelinadi. 320/390/768/1280pxda markaz, o'zgarmagan karta balandligi, ko'rinish chegarasi, fokus va inert holatini qaytarish tekshirildi; JS xatosi yo'q. UI tekshiruvida admin API javoblari taqlid qilindi.

## Test kartalari: yangi dizayn (2026-11-05)

Haqiqiy Testlar ro'yxati kartalariga yangi dizayn qo'llandi: ochiq 28px kod, 2 soniyalik copy tasdig'i, ixcham sana, fan/sinf chiplari, SVG meta, asosiy Tahrirlash va kontur To'xtatish. Menyu uchun joy ajratiladi, Escape/outside va yo'nalish boshqariladi. Chap menyu/sahifa tuzilishi/backend o'zgarmagan. View/icons/menu alohida modullarga ajratilgan; mavjud action idlari, kod holatlari va version payload saqlandi. 12 responsive/theme holat va amallar mock admin API bilan Chrome'da o'tdi; check/build o'tdi. Hisobot: `docs/implementation/test-card-redesign.md`. Push/deploy yo'q.

2026-11-05: foydalanuvchi so'roviga ko'ra tanishuv sarlavha/matni yana forma tepasiga qaytarildi; o'ngdagi rangli karta bezagi olib tashlandi. Ixcham maydonlar va ichki scrollsiz forma saqlandi. Chrome 600/1024/1920pxda matn forma ustida va gorizontal chiqishsiz tekshirildi; check/build o'tdi.

## Wizard ichki scrollsiz (2026-11-05)

Oldingi ichki scroll yechimi almashtirildi. `entry-fields` odatiy grid; overflow va karta max-height cheklovi olib tashlandi. 600pxdan kodlar ikki, shaxs maydonlari uch ustun, summary ikki ustun; takror legend ko'rinishdan yashirin, accessibility nomi saqlangan. Keng ekranda header/karta/progress oraliqlari qisqardi. Chrome UI tekshiruvida 1024x600, 1280x720, 1536x696, 1920x870da barcha 4 bosqich kartasi va Keyingi tugmasi sahifa scrollisiz ko'rindi; kod tasdiqlangandan keyingi tugma ham tekshirildi. 600/768pxda ichki scroll yo'q, uzun sahifa tabiiy aylanadi, amallar pastda qoladi. UI resolver javobi taqlid qilingan; backend o'zgarmagan. check/build o'tdi.

## Wizard amallari ekranda (2026-11-05)

Keyingi/Orqaga forma ichidagi scroll hududidan tashqariga ajratildi. 1024pxdan karta balandligi viewport bilan cheklangan; faqat maydonlar va summary ichkarida aylanadi. Ixcham ekranda tugmalar pastga mahkamlangan, forma oxirida ular uchun joy bor. Barcha 4 bosqichda 600x700, 768x768, 1024x600, 1280x720, 1536x696, 1920x870 holatlarida scrollY=0 paytida Keyingi/Testni boshlash ko'rinishi va bosish nuqtasi tekshirildi. Resolve javobi lokal UI tekshiruvida taqlid qilindi; JS xatosi yo'q, check/build o'tdi.

## Wizard tanishuv kartasi (2026-11-05)

Foydalanuvchining aniqlashtirilgan topshirig'i: faqat kirish sarlavhasi/tushuntirishi o'ng tomonga ko'chirildi. 1024pxdan forma chapda, tanishuv kartasi va yordam o'ngda; ixcham ekranda tanishuv forma ustida. `entry-intro.css` faqat test-kirish.htmlga ulanadi. Barcha avvalgi id/data-step, JS va API saqlandi. To'liq 2-bosqich qayta dizayni bosqich nomlari bo'yicha ochiq savol bilan kutilmoqda. 600/768/1024/1280/1920px light/dark joylashuv va konsol tekshirildi; check/build o'tdi.

## O'quvchi test navbari (2026-11-05)

Faol test uchun alohida navbar: brend, test nomi, joriy savol, javob progressi, saqlash holati va rang rejimi. `mountStudentHeader({ testMode: true })` faqat test.jsda ishlaydi; wizard/natija umumiy headeri saqlandi. Mavjud DOM id va test/draft/taymer mantig'i saqlanadi. `student-navbar.css` faqat shu ko'rinishga tegishli; 90% kenglik saqlandi. Chrome 320/390/600/768/1024/1280/1920px light/dark: chiqish yo'q, 1/2 javobdan progress 50%, savol almashishi va theme tugmasi o'tdi, JS xatosi yo'q. Oqim UI tekshiruvida resume/draft javoblari vaqtinchalik taqlid qilindi; backend integratsiyasi qayta sinovdan o'tkazilmadi. `check` va `build` o'tdi.

## Ekranga mos tipografika (2026-11-04)

`components/responsive-type.css` yakuniy umumiy matn shkalasini beradi: asosiy/variant 15-16px, savol 16-18px, yordamchi 13-14px, sarlavha 24-32px, landing hero 32-56px (standart 16px rootda). 320-1280px orasida `clamp` bilan o'sadi; rem zoomni saqlaydi. Word savol/variant/natija ichidagi pt shriftlari faqat o'qish ko'rinishida bir xil o'lchamga keltiriladi, sub/sup va formulalar nisbati saqlanadi. Server va saqlangan content o'zgarmaydi. Chrome'da 320/390/600/768/1024/1280/1920px landing, wizard, login va test tekshirildi; katta import matni/variantlari chegaradan chiqmaydi, JS xatosi yo'q. `check`/`build` majburiy yakuniy tekshiruv.

### Landing yakuni

`/` endi formasiz tanishuv sahifasi; `landing.js` faqat mavzu, eski kirish havolalari mosligi va umumiy `initResume`ni ulaydi. `landing.css` tokenlar bilan 600px va keng ekranlarga mo'ljallangan. `schoolId`li eski ildiz havolasi wizardga, `legacy=1` eski testlarga boradi. Resume kodi nusxalanmadi; landingda qurilmadan olib tashlash amali yo'qligi uchun listener ixtiyoriy. Backend, autentifikatsiya va test mexanikasi o'zgarmadi.

Tekshiruv: `check` va `build`; Chrome'da 600/768/1024/1280px, light/dark, gorizontal chiqish, Tab, reduced-motion, ikkala CTA, wizard, start, draft, wizard/landing resume, submit, natija va qaytish. Frontend mavjud Netlify Dev :8888 orqali; API haqiqiy router/service/repository va faqat xotira Blobs adapterida, haqiqiy yozuvlarsiz. Hostingdagi ma'lumotlar bilan sinov/deploy bajarilmadi. Tafsilot: `docs/implementation/landing-stage-one.md`.

## Bosh sahifa: 1-bosqich (2026-11-04)

Wizard `public/test-kirish.html`ga ajratildi; kirish moduli `student/entry.js`. Urinishsiz test URLsi wizardga boradi. Natijadagi qaytish, adminlarning o'quvchi havolalari va header `/`da qoladi. Netlify redirect kerak emas. Keyingi commit: axborot bosh sahifasi va mavjud resume mantig'ini ulash. Backend o'zgarmaydi.

## 3-bosqich — zaxira, tiklash va admin xavfsizligi (2026-11-03)

Qisman implementatsiya: zaxira v3 envelope, maktab IDga bog'langan export/restore, file hash + server state fingerprint preview, stale preview rad etish, parallel restore claim, protected pre-restore backup, faol urinish guard, qisman natija hisoboti va admin audit yozuvlari. Parol 6–128 belgiga kengaydi; scrypt mosligi, login limitlari va session version orqali logout/password-change/block invalidatsiyasi saqlandi. Admin sessiya va test kodlari uchun alohida environment kalitlari qo'llanadi; eski token/test-code formatlari boshqariladigan previous key bilan o'qiladi. Egasi uchun target-site va dry-runli admin recovery CLI qo'shildi.

Cheklovlar ochiq: ko'p Blobs yozuvi tranzaksiya emas; partial restore takroran ko'rib chiqiladi. Test kodlari registry kiradi, ammo AES key eksport qilinmaydi. Avtomatik/tashqi zaxira va retention hali ulanmagan — hostingdan tashqari saqlash manzili hamda retention qarori kerak; hech narsa avtomatik o'chirilmaydi. Funksional/local isolation tekshiruvlari ushbu bo'limning yakuniy hisobotida alohida qayd qilinadi. Qo'llanma: `docs/backup-restore-security.md`.

## Takomillashtirish: 1-bosqich — mahsulot qoidalari (2026-11-03)

Holat: **tahlil va hujjatlar tayyor, qarorlar kutilmoqda**. Dastur kodi, sxema, sirlar va ma'lumotlar o'zgarmadi; migratsiya/deploy bajarilmadi.

Keyingi topshiriq (2026-11-03): foydalanuvchi GitHub va Netlifyga nashr qilishni buyurdi. Bo'sh build scripti asl qiymatiga tiklandi; `check` va `build` 212 faylda o'tdi. Bu nashr mahsulotning ochiq qarorlarini tasdiqlash yoki 2-bosqich implementatsiyasini boshlash emas.

- [Yagona mahsulot qoidalari](docs/requirements/product-rules.md): rollar, akkauntsiz kirish, urinish, test/kod o'tishlari, vaqt/natija, obuna va ma'lumotlar; har mavzuda joriy holat, muammo, qoida holati va qabul mezoni.
- [Kod dalillari va qayta tekshiruv](docs/requirements/product-evidence.md): fayl/funksiya, eski tahlillarning eskirgan xulosalari va bugungi farqlar.
- [Vakolatlar jadvali](docs/requirements/roles.md): joriy amallar, chegaralar va takliflar alohida.
- [Qarorlar va 2-bosqich](docs/requirements/product-decisions.md): Q1–Q8 savollari, tavsiya/sabab/muqobil; P0/P1 vazifalari va tekshiriladigan mezonlar.
- Asosiy qolgan farqlar: shaxsiy kod generatsiyasi/backfill, obunani startda tekshirmaslik, parallel revoke/start qabul tartibi, brauzer limitining shaxsni tasdiqlamasligi, tahrirning eski urinishga ta'siri. Ular tuzatildi deb belgilanmaydi.
- 2-bosqich boshlanmadi. Birinchi ish shaxsiy kod generatsiyasini to'xtatish; keyin atomik qabul va qarorlarga bog'liq obuna/urinish siyosati. Q3/Q6 javobisiz qat'iy inson limiti yoki trial/grace sonlari tasdiqlanmaydi.
- Tekshiruv: `npm run check` o'tdi. `npm run build` exit 0, ammo ish davomida tashqaridan bo'shatilgan build scripti sabab hech qanday tekshiruv bajarmadi; `package.json`ga ushbu vazifada tegilmadi. Tafsilot qarorlar hujjatida. Bu buyruqlar funksional oqim ishlashini tasdiqlamaydi; tarixiy test buyruqlari qayta yaratilmaydi.

Quyidagi avvalgi bosqichlar tarixiy qaydlardir; mahsulot qoidalarida yuqoridagi yagona hujjatga qaraladi.

## Word importi va karta metama'lumotlari (2026-11-03)

Amalga oshirildi: test/sinf uchun server boshqaradigan `createdAt`; tahrirlash vaqtni saqlaydi, nusxa yangi vaqt oladi; eski test/sinf sanasi noma'lum ko'rsatiladi. Test kartalarida sana bo'yicha saralash, test va sinflarda ikki asosiy amal hamda qo'shimcha amallar menyusi, mobilga mos balandlik va mavzu ranglari qo'shildi.

Word importining birinchi ishlaydigan bosqichi qo'shildi: test editor `.doc/.docx` tanlaydi va auth bilan multipart previewga yuboradi; serverda ZIP/XML limitlari, tashqi relation/DTD/makros bloklari, DOCX savol/variant tahlili, `#B.` markerini olib tashlash, boy savol modeli va OMML→MathML parseri bor. Rasm (PNG/JPEG/GIF/WEBP), jadval, asosiy run formatlari va qo'llangan formulalar test/attempt/result/backup yozuvlarida qoladi. `contentFormat` public testga explicit allowlist bilan o'tadi; answer index ochiq urinish DTOsiga qo'shilmaydi. Sample DOCX va import qo'llanmasi qo'shildi.

Word import bosqichi: `.doc`/`.docx` tanlash, server preview va tahrir oqimi, ZIP/XML cheklovlari, rich-content sanitizatsiyasi, raster rasm/jadval va OMML→MathML konvertatsiyasi bajarildi. Lokal MathJax SVG renderer previewdan natija sharhigacha ishlatiladi. Haqiqiy `.doc` uchun `DOC_CONVERTER_URL/TOKEN`, MathType/OLE uchun `DOC_MATH_CONVERTER_URL/TOKEN` tashqi HTTPS service talab qilinadi. Header/footer, footnote, VML, SVG rasm va MathType/OLE konverter talab qiladigan obyektlar importerda aniq xatoga sabab bo'ladi; diagrammada DOCX raster preview talab etiladi. Word'ga pixel-bir xil ko'rinish va'da qilinmaydi. Netlify-hostlangan oqim va browser vizual tekshiruvi deploy muhitisiz bajarilmagan.

O'quvchi test oynasida nom/progress navbar'ga, taymer xarita ustiga joylashtirildi; keng ekranda xarita yon ustunda, tor ekranda yig'iladigan panel. Yakuniy savoldan mavjud tasdiqlash/yuborish oqimi ochiladi; uzun formula/jadval kontenti konteyner ichida aylantiriladi. Brauzer o'lchamlari bo'yicha vizual sinov muhit siyosati Chrome'ni ishga tushirishni rad etgani uchun ochiq qoldi.

Funksional lokal parser tekshiruvi: `samples/word-import-sample.docx`dan OMML, image, table, ranglar, `# B.` marker va content validator o'tdi. O'quvchi test HTML/CSS/JS lokal serverdan 200 bilan olindi; haqiqiy brauzerda timer/save/resume/submit va viewport sinovlari bajarilmadi. `npm run check` va `npm run build` o'tdi.

## Matematik content — B (2026-11-01)

Davom ettirish topshirig'i bilan B bajarildi: `server/lib/content-model.mjs` versiyalangan AST validatori va yo'qotishsiz legacy text adapterini beradi. Shartnoma, limitlar, savol envelope'i, private source/public DTO va backup/shuffle integratsiya mezonlari `docs/implementation/math-import-stage-b.md`da. Modul hali amaldagi API va omborga ulanmagan; DOCX/parser/renderer keyingi bosqichlarda. Eski testlar va ma'lumotlar o'zgarmadi. Push/deploy yo'q.

## Matematik formulalar va Word importi — A (2026-11-01)

Yangi topshiriq A–H bosqichlarda; hozir faqat A arxitektura tahlili. Natija: `docs/implementation/math-import-stage-a.md`. Amaldagi Aiken/string modeli, validatsiya/shuffle/backupdagi content yo'qolish nuqtalari, JSON upload cheklovi, renderer/hosting va MathType chegaralari tekshirildi. Dastur kodi va baza o'zgarmadi; 8 ta xotiradagi mavjud-xulq assertion, check va build o'tdi. B — versiyalangan content modeli — faqat foydalanuvchi tasdig'idan keyin. Push/deploy va production migratsiyasi yo'q.

## O'quvchi kirish wizardi (2026-11-01)

Foydalanuvchi topshirig'i: bitta asosiy forma, 4 bosqich, izchil spacing, mobil yordam bo'limi va serverda tekshirilgan davom etish. Mavjud maktab/test/natijalar saqlanadi; push/deploy bajarilmaydi.

- A: `entry-main` va `entry-layout` uchun 24–32 px oraliqlar, 24/32 px padding va 1120 px maksimal konteyner. Mobil maslahatlar endi yashirilmaydi, formadan keyin chiqadi. Wizard va sahifa CSSi alohida.
- B: kodlar, sinf, ism/familiya va 8 maydonli tasdiqlash; bitta fieldset ko'rinadi, qolganlari hidden/disabled. Orqaga qaytish qiymatlarni saqlaydi; o'zgargan kod tekshiruvni bekor qiladi. Test dropdowni olib tashlandi.
- C: mavjud resolve/start APIlari qayta ishlatiladi. Server startda maktab/kod/sinf/ismni tekshiradi; taymer faqat tasdiqlashda yaratiladi. Resume banneri server tasdig'idan keyin ko'rinadi; davom etish yana tekshiradi. Eski oqim alohida `eski-testlar.html`ga ajratildi.
- D: alohida xotira Blobs adapteri va haqiqiy router/service/repository bilan Chrome avtomatlashtirildi. Haqiqiy lokal yoki production yozuvlari ishlatilmadi. 48 responsive/dark-light skrinshot, funksional va ruxsat/tiklash tekshiruvlari `.local/wizard-evidence`da; doimiy tests/ infratuzilmasi qayta yaratilmaydi.
- Yakuniy natijalar va fayllar: `docs/implementation/student-wizard.md`.

## Dasturchi sinov fayllari va QA ma'lumotlarini olib tashlash (2026-11-01)

Foydalanuvchi aniq tanlagan doira: `tests/`, test/audit/integratsiya skriptlari va namuna maktablar. Haqiqiy maktablarning yuklangan testlari o'chirilmaydi.

- `tests/`, 13 avtomatik sinov skripti va generatsiya qilingan sinov artefaktlari olib tashlandi; Playwright test dependency chiqarildi.
- `package.json`, format va Netlify build endi olib tashlangan test buyruqlariga murojaat qilmaydi. `check`, `build`, `dev`, lock normalizatsiyasi va lokal ID migratsiyasi saqlanadi.
- Lokal bazadan 21 QA maktab, ularga bog'langan 12 test, 16 sinf, 2 urinish, 2 natija, 19 admin hisobi, 7 sessiya va 12 kod registri o'chirildi. 15 yaratish so'rovi ham olib tashlandi. Ikki `60-maktab` yozuvi va ularga tegishli haqiqiy ma'lumotlar saqlandi.
- Qisqa ID registri o'chirilmaydi: oldin ishlatilgan kodlar boshqa maktabga qayta berilmaydi. Tiklash nusxasi Gitdan chiqarilgan `.local/cleanup-*`da.
- Quyidagi eski bosqichlardagi test natijalari tarixiy dalillardir; ularning skriptlari endi loyihada yo'q. Productionga tegilmadi.

## Qisqa maktab IDsi — SK-1001 (2026-11-01)

Foydalanuvchi topshirig'i: ichki UUID va barcha maktab bog'lanishlari saqlanadi; alohida `public_school_id` avtomatik ketma-ket beriladi. Bu topshiriq oldingi A bosqichidagi "ichki va ko'rsatiladigan ID bitta" qarorini almashtiradi va kodli o'quvchi kirishini ham qamraydi.

- `public-school-ids` global CAS registri raqam, maktab rezervi va o'chirilgandan keyin ham saqlanadigan ID bandligini bir atomik yozuvda yuritadi.
- Aniq chaqiriladigan dry-run/apply migratsiya mavjud qisqa IDlarni saqlaydi; qayta urinish va parallel yaratishga chidamli. Production apply HTTP orqali bloklangan, lokal skript faqat localhost uchun.
- Bosh admin kartalari/qidiruvi va maktab admini ko'rinishi/nusxalashi qisqa IDga o'tdi. UUIDlar ichki API bog'lanishlarida saqlanadi.
- O'quvchi qisqa ID + 6 raqamli umumiy kod orqali test/sinfni topadi; start qayta tekshiradi. Draft/resume/submit maktabni imzolangan urinishdan oladi. Eski testlarga `/?legacy=1` orqali moslik saqlanadi.
- 132/132 avtomatik test, check, verify, asosiy/maktab/kodli kirish brauzer sinovlari va uch audit o'tdi. Lokal 17 maktab migratsiya qilindi; qayta apply 0 o'zgarish berdi. Dalillar: `docs/implementation/public-school-id.md`.
- Push, deploy va production migratsiyasi bajarilmaydi. Eski egasiz test/natijalar ko'chirilmaydi.

Davom ettirish (2026-11-01): maktab IDsi A bosqichining qolgan lokal tekshiruvlari yakunlandi. 113/113 test, check, verify, maktab va asosiy brauzer sinovlari, API/auth/browser auditlari o'tdi. Yetishmayotgan hisobot `docs/implementation/school-id-stage-a.md`ga yozildi. B/C/D, migratsiya va deploy ushbu yakunlashga kirmaydi.

## Maktab ID topshirig‘i — A: ID va bosh admin (2026-10-31)

Yangi topshiriq tartibi A/B/C/D. Hozir faqat A: doimiy UUID v4, yaratish requestId rezervi va retry, maktab ID/nom qidiruvi, hudud/holat, ID nusxalash, obuna va haqiqiy agregat monitoring.

`school-requests` rezervi maktab yaratishni uzilishdan keyin davom ettiradi; mavjud yoki arxivlangan maktab IDsi boshqa yozuv bilan bosilmaydi. Eski IDlar saqlanadi, o‘qishda yangi maydonlar virtual default bilan qaytariladi. Fizik o‘chirish yo‘q; arxiv yozuvi IDni band saqlaydi. Maktab admini o‘z ID/nomini server sessiyasidan oladi.

Bloklash maktab adminining yangi kirishini yopadi; sessiya versiyasi o‘zgargani uchun unblock eski tokenni qayta yaroqli qilmaydi. Logout bloklangan maktabning ham o‘z sessiyasini bekor qila oladi. Test/kod/urinish/natijalar o‘zgartirilmaydi.

Admin UI mavjud panel/CSS, modal, parol va toast komponentlari bilan olti bo‘limga ajratildi. Statistikalar serverda real yozuvlar sanog‘i, individual ma’lumotsiz. Testlar va lokal Chrome dalillari `docs/implementation/school-id-stage-a.md`da.

Keyingi B — izolyatsiyani to‘liq tekshirish; C — o‘quvchi kodli kirishi; D — natijalar va yakuniy integratsiya. Ular tasdiqsiz boshlanmaydi. Push/deploy uchun ham alohida tasdiq kerak.

## A — umumiy test kodi va maktab admini (2026-10-31)

Yangi topshiriq A/B/C tartibida; hozir faqat A. Test saqlash va ro‘yxat API’si maktabga bog‘langan testga 6 raqamli umumiy kod yaratadi/qaytaradi. Maktab admini kodni qayta ko‘radi, nusxalaydi, faollashtiradi, bekor qiladi va yangi kod oladi. Test holati va kod holati mustaqil. Fan hamda jadval kartada ko‘rsatiladi.

Kod registri maktab doirasida CAS bilan saqlanadi; bir maktabda band kod boshqa testga qayta berilmaydi. Kod qiymati AES-GCM bilan shifrlangan, rezerv HMAC bilan bog‘langan; TOKEN_SECRET’dan alohida maqsad kalitlari hosil qilinadi. Server kaliti o‘zgarsa registr bloklanadi, mavjud kod ustidan yangisi yaratilmaydi.

Eski maktab egasi yo‘q yozuvlar migratsiya qilinmaydi; mavjud maktab testlarining yetishmayotgan umumiy kodi admin o‘qishida bir marta to‘ldiriladi. Public kodli kirish, guessing rate limit, sinf/ism/confirmation va obuna bilan start nazorati B bosqichida; bosh admin dizayni C bosqichida. Ular foydalanuvchi tasdig‘isiz boshlanmaydi.

Sinovlar: format/crypto/holat siyosati, haqiqiy router-service-repository izolyatsiyasi, lokal Chrome’da saqlash/reload/clipboard/tahrir/faollik/320–1280 px. Yakuniy dalillar `docs/implementation/test-codes-stage-a.md`da. Push va deploy uchun alohida tasdiq kerak.

## 1.1 — Rollarni kodga joriy etish (2026-10-31)

Tasdiqlangan doira: `roles.md` qabul mezonlari; 1.7 hujjati hali mavjud emas.
Bosh admin maktab adminini login/parol bilan yaratadi; bitta maktabda bitta admin, bitta admin faqat bitta maktabga biriktiriladi.
Minimal maktab boshqaruv yozuvi 1.1 uchun infratuzilma; eski ma'lumotni avtomatik biriktirish va 1.2 migratsiyasi bajarilmaydi.

- Server rol tekshiruvi, hisobga bog‘langan sessiya, parol versiyasi va logout.
- Repository qatlamida asinxron so‘rov konteksti, egalik filtri va yozishni himoyalash.
- Alohida bosh admin paneli va maktab adminining tekshirilgan konteksti.
- Legacy kirish faqat `schoolId` yo‘q eski yozuvlarga; yangi maktab yoki bosh admin huquqi yo‘q.
- Yangi maktablar eski public o‘quvchi API orqali ochilmaydi; kirish oqimi 1.3–1.5 da joriy etiladi.
- Yangi adminlarda restore/clear vakolati hali berilmagan; scoped backup mavjud.
- Avtomatik router testlari, lokal rollar brauzer sinovi va mavjud auditlar; natijalar `docs/implementation/roles-stage-1.md`da.
- Push/deploy faqat foydalanuvchining yangi tasdig‘i bilan. 1.2 faqat `DAVOM ET`dan keyin.

Mahalliy parol tanlovi: foydalanuvchi so'roviga ko'ra lokal minimum 5 qilib sozlandi. Standart minimum 12 saqlandi; server va panel muhitdagi bir xil siyosatdan foydalanadi. Haqiqiy parol .env va Blobs'da, Gitga kiritilmaydi.

## Audit va tuzatish

Boshlang'ich audit kod o'zgarmasdan chatda va docs/AUDIT-OLDIN.md'da berildi (baza 8afe461).
S01–S05: admin sessiyalar, o'quvchi kodlari/egalik, javob siyosati, limit va body.
R01–R03: server draft, vaqt/tiklash, draft validatsiya va oynalar himoyasi.
T01–T02/B01/U01: yo'qolmaydigan editor, progress, restore va sekin tarmoq.
Har muhim tuzatishga regressiya testi; yakunda unit/check, API, 320/390/1280 brauzer va 40 parallel yuborish qayta bajariladi. Natija docs/AUDIT-KEYIN.md'da.

Yakun: S01–S05, R01–R03, T01–T02, B01, U01 va keyin tasdiqlangan M01/M02 tuzatildi. 48 unit test, 9 asosiy API oqimi, 10 maxsus API/auth tekshiruv, bazaviy va audit brauzer sinovlari, 40/40 parallel submit o'tdi. Boshlang'ich va yakuniy hisobotlar alohida saqlandi.

## Tuzilmani ajratish (joriy vazifa)

Funksionallik va dizayn saqlanadi. Oldingi kengaytirish ishining yozilgan imkoniyatlari yo'qotilmaydi.

| Eski joy | Yangi fayl/papka |
| --- | --- |
| public/assets/styles.css | public/css/tokens.css, base.css, layout.css, components/*, pages/* |
| public/assets/common.js | public/js/core/*, public/js/components/* |
| public/assets/student.js | public/js/student/home.js, test.js, result.js, test-state.js, timer.js, question-map.js |
| public/assets/teacher.js | public/js/teacher/{login,dashboard,classes,tests,test-editor,results,analytics,settings}.js |
| public/index.html ichidagi uch ekran | public/index.html, test.html, natija.html |
| public/teacher.html ichidagi login va panel | public/oqituvchi/{kirish,index,sinflar,testlar,test-tahrir,natijalar,sozlamalar}.html |
| netlify/functions/api.mjs | server/router.mjs va routes/public/*, routes/admin/* |
| api.mjs biznes mantiqi | server/services/* |
| lib/store.mjs | server/repositories/* |
| lib/model.mjs | server/lib/validate.mjs, migrations/legacy.mjs |
| lib/parser.mjs, grading.mjs, security.mjs | server/lib/* va services/auth-service.mjs |
| tests/core.test.mjs | tests/{aiken-parser,scoring,auth-token,models}.test.mjs |
| namuna-test.txt | samples/namuna-test.txt (yuklash uchun public/namuna-test.txt saqlanadi) |
| README va eski verify.mjs | README, docs/ARCHITECTURE.md, scripts/* |

Tartib: (a) CSS, (b) frontend modullar, (c) HTML sahifalar, (d) server qatlamlari, (e) yo'llar/check/hujjatlar.
Har qadamda Netlify Dev va tegishli oqim tekshiriladi, so'ng alohida commit qilinadi.
Brauzer preview parseri faqat POST /api/admin/tests/preview dan foydalanadi.

Yakun: CSS, frontend modullari, HTML sahifalari va server qatlamlari ajratildi. Eski katta fayllar olib tashlandi. `api.mjs` 4 qator. `check`, `build` va 29 unit test o'tdi; Netlify Dev integratsiya, Playwright va 40 parallel submit tekshirildi. Yakuniy dalillar `docs/REFACTOR-HISOBOT.md`da.

1. Umumiy dizayn: public/ tuzilma, styles.css, mavzu, modal, toast, qulaylik.
2. O'quvchi: qadamlarga ajratilgan boshlash, bitta savol, xarita, saqlash, taymer va natija.
3. O'qituvchi: bosh sahifa, sinflar, test tahrirlagich, natijalar/tahlil va sozlamalar.
4. Backend: parser, modellarni moslashtirish, REST, serverda urinish va baholash, metadata keshi.
5. Xavfsizlik: HMAC token, parol sozlash, Blobs rate limit, validatsiya va CSP.
6. Sifat: node:test, haqiqiy Netlify Dev oqimi, 40 parallel yuborish va mobil/desktop brauzer tekshiruvi.
7. Hujjatlar: README, AGENTS, muhit namunasi, o'qituvchi qo'llanmasi va yakuniy hisobot.

Har bosqich Netlify Dev bilan tekshiriladi va alohida commit qilinadi. Backendga bog'liq UI bosqichlarida server tayyor bo'lguncha sahifa/sintaksis tekshiriladi; to'liq oqim 6-bosqichda bajariladi.

Qarorlar: bitta maktab va umumiy admin roli; o'quvchi identifikatsiyasi sinf+ro'yxat ID yoki ism/familiya bilan. Savol va variantlar serverdagi imzolangan urinish tartibi orqali aralashtiriladi. Vaqt serverda tekshiriladi. Eski yozuvlar o'qishda moslashtiriladi, avtomatik o'chirilmaydi.

Parol yangilanishi: kirish va sozlamalarda umumiy password-field komponenti; ko'rsatish/berkitish tugmalari. Server va brauzer 6–12 belgi qoidasini qo'llaydi. Parol faqat muhit/Blobs'da; repozitoriyda standart parol yoki token kaliti saqlanmaydi. Chegaralar unit/API, forma va kirish brauzer bilan tekshiriladi.

Deploy tekshiruvi: Netlify buildda unit va tuzilma tekshiruvlari, mos Node versiyasi, barcha .env nusxalarini Git'dan chiqarish. Yozadigan sinovlar alohida lokal Blobs omborida; production uchun faqat GET smoke tekshiruvi. Commit va push faqat foydalanuvchi tasdiqlagach bajariladi.

## O'quvchi interfeysi � 2026-11-04

- [x] Wizard, test va natija sahifalariga mobile-first moslashuvchan layout qo'shildi.
- [x] Keng ekranda yon xarita, kichik ekranda yig'iladigan panel.
- [x] Javob, timer, draft tiklash va topshirish oqimlari saqlandi.
- [x] Natijada to'g'ri va noto'g'ri/javobsiz soni ko'rsatiladi.
- [ ] 320�1920px va 200% zoom ko'rinishini haqiqiy brauzerda qo'lda tekshirish.

## Sinflar, guruhlar va blok testlar (2026-11-10)

Ushbu topshiriq AGENTS.md talabiga binoan tekshirilgan bosqichlarni lokal commit qilishni nazarda tutadi. Deploy va main bilan birlashtirish alohida tasdiqdan keyin bajariladi.

- [x] `feature/classes-groups-block-tests` alohida tarmog'i ochildi.
- [x] Sinf/guruh modeli va eski sinflar uchun standart `class` turi qo'shildi.
- [x] Maktab egaligi tekshiriladigan atomik qo'shimcha biriktirish qo'shildi.
- [x] Word importi bo'limlar, javob markerlari va raqamli xatolarni qo'llaydi.
- [x] Asl 90 savolli faylda 30+30+10+10+10 bo'limlar tekshirildi.
- [x] Auditoriya filtrlari, import tasdig'i, bo'limli xarita va natijalar qo'shildi.
- [x] Lokal API/brauzer, maktablararo rad etish, draft va tiklash oqimlari tekshirildi.
- [ ] Deploy va main bilan birlashtirish: alohida foydalanuvchi tasdig'i kutiladi.

Yakuniy dalillar: `docs/implementation/classes-groups-block-tests.md`.

## Testlar ko'rinishi va ommaviy o'chirish (2026-11-10)

- [x] Karta/ro'yxat tanlovi, brauzerda saqlash, bitta va filtrdagi barchasini belgilash.
- [x] Tasdiqli ommaviy o'chirish, qisman xatoda tanlovni saqlab qayta urinish.
- [x] Lokal Chrome: bekor qilish, filtr, mobil, natijalar saqlanishi va maktab egaligi tekshirildi.
