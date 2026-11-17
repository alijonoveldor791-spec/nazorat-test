# Maktab savollar bazasi va umumiy tayyor test banki

Sana: 2026-11-17. Tarmoq: `feature/school-question-library`. Faqat lokal ish; GitHub push va Netlify deploy bajarilmagan.

## Ishlaydigan oqimlar

- O'qituvchi: `/oqituvchi/savollar-bazasi.html`; bosh admin: `/bosh-admin/umumiy-bank.html`.
- Sinf/fan/chorak/mavzu yaratish, mavzu qidiruvi, savollarni qidirish, mavjud savol muharriri orqali tahrirlash, arxivlash/tiklash.
- Mavjud `/api/admin/tests/preview` Word parseri orqali preview; tanlangan savollar tasdiqlangach qo'shiladi. Oldingi savollar o'chirilmaydi. `#B.`, `# B.`, `#B)` markerlari parserda ajratiladi; xatolar savol raqami bilan qaytadi.
- `+` mavzuni bir marta tanlaydi, olib tashlash mavjud. Sinf/fan/chorak bir xil bo'lishi tekshiriladi. Har mavzuga aniq miqdor, jonli jami, 200 savollik chegara.
- Server tasodifiy tanlaydi. Mavzular orasida bir xil savol bo'lsa ham qayta taqsimlash kvotalarni saqlaydi; yetishmasa qaysi mavzu, so'ralgan va mavjud miqdor qaytadi. Qisman test yaratilmaydi.
- Qoralamada nom, to'liq ko'rish, shu mavzudan savol almashtirish va butun testni qayta tuzish mavjud. Saqlash savollar va kalitning mustaqil nusxasini yozadi. Mavzuning keyingi tahriri nusxaga ta'sir qilmaydi.
- Saqlangan testning `composition` maydonida tasdiqlangan kvotalar, mavzu nomlari va har savolning manbasi bor; saqlashda manbalar va kvotalar serverda tekshiriladi. Oddiy muharrir savollarni o'zgartirsa eski composition olib tashlanadi.
- Onlayn berishda sinf/guruh, daqiqa, urinishlar va ikkita shuffle tanlanadi. Mavjud registry kodi yaratiladi/faollashadi; o'quvchi maktab IDsi va 6 xonali kod bilan kiradi. Baholash mavjud urinish snapshoti tartibida bajariladi.
- DOCX va alohida DOCX javob kaliti mavjud Word XML/OMML/media rendererini qayta ishlatadi. O'quvchi nusxasida ism-familiya/sinf/sana maydoni bor; kalit kiritilmaydi. Eksport tartibni qayta aralashtirmaydi.
- PDF amali A4 chop nusxasini yangi oynada ochadi. O'qituvchi `PDF saqlash / Chop etish` orqali brauzerning PDF saqlash amalini ishlatadi. **HTTP endpoint hozir `application/pdf` emas, chop uchun HTML qaytaradi; serverda bevosita PDF konvertatsiyasi amalga oshirilmagan.**
- Mavzu promptida sinf, fan, chorak, mavzu, miqdor, qiyinlik va DOCX/variant/marker qoidalari bor; nusxalash mavjud.
- O'z maktabi testi ko'rib chiqishga yuboriladi; bosh admin savollarini ko'radi, tasdiqlaydi/rad etadi va tarif/maktab IDlarini belgilaydi. Manba o'quvchilar, natijalar va mavzular yuborilmaydi.
- Umumiy bank maktabga faqat tayyor test metama'lumotlarini beradi. `Testni olish` oluvchi maktabga auditoriyasiz, faol bo'lmagan mustaqil test yaratadi. Mavzular bazasiga umumiy savollarni bittalab olish endpointi yo'q.

## Saqlash va ruxsatlar

- `school-topics`: maktab egaligi `blob-store` scoped-store filtri bilan. Har mavzuda UUID, grade/subject/quarter/name, version va id/archived bilan savollar bor. Qo'shimcha import CAS versiyasi eski bo'lsa 409. Bir mavzuda 2000 savol, bir importda 200 savol.
- `shared-tests`: serverning alohida ombori. Pending/approved/rejected snapshot; sourceSchoolId/sourceTestId faqat bosh admin ko'rinishida. Maktab ro'yxat DTOsi title/subject/count/status/id bilan cheklangan.
- `bank-policies`: `tariff-<id>` va `school-<uuid>` yozuvlari. Maktab tariffId orqali tarifga ulanadi; berilgan maktab booleanlari tarifni ustidan belgilaydi. UI'dagi `Tarifdan` maydonni yubormaydi.
- Ruxsatlar: view/take/docx/pdf/key/rerunExpired. view yopiq bo'lsa hamma amal yopiq. Faol obuna yangi olish va eksport uchun shart. rerunExpired alohida qoida.
- Umumiy bank nusxasi `origin: { type: 'shared', sharedId }` bilan; oddiy maktab testi `type: 'school'`. Dublikat, urinish, natija va restore kelib chiqishni saqlaydi.
- Nusxadagi fayl amallari alohida ruxsatlarni qayta tekshiradi. Oddiy test muharriri orqali umumiy nusxaning savollarini olish/tahrirlash rad etiladi; onlayn sozlamalar alohida publish orqali beriladi. Umumiy nusxada showAnswers yoqilmaydi.
- `shared-origins` scoped registri test o'chirilganda ham kelib chiqishi va savollar fingerprintini saqlaydi. Restore eski IDni maktab testi deb qayta yozolmaydi, savollarni almashtira olmaydi yoki showAnswersni yoqolmaydi.
- Eski Aiken eksporti docx va key ruxsatlarini tekshiradi. Natija tafsiloti/Wordi va ochiq zaxira orqali kalit chiqarish ham tekshiriladi. Test o'chirilsa ham yangi natijadagi origin ruxsatni saqlaydi.
- Ichki avtomatik/himoyalangan zaxiralar to'liq qoladi. Cheklangan umumiy test bor maktabda ochiq JSON zaxira yuklash barcha docx/pdf/key ruxsatlari bo'lmasa rad etiladi; ayrim savollar yashirilgan noto'liq zaxira yaratilmaydi.
- Mavzular mavjud 3-format zaxirada ixtiyoriy `topics` maydoniga kiritiladi; eski zaxira bu maydonsiz ishlaydi. Restore egalik, faol urinish va fingerprint guardlaridan o'tadi. Mavzular fingerprintga kiradi.
- Mavjud umumiy nusxani restore orqali savollarini almashtirish rad etiladi; kelib chiqishi yo'qotilmaydi.
- Obuna tugashi yangi urinishni yopadi (rerunExpired yoqilmasa); mavjud faol urinishning resume/draft/submit yo'llariga yangi tarif guardi qo'yilmagan. Natijalar o'chirilmaydi.

## Amalda o'tkazilgan lokal tekshiruvlar

Haqiqiy router/services/repositories va faqat xotiradagi Blobs adapteri bilan tekshirildi. Haqiqiy maktab yozuvlariga sinov ma'lumoti kiritilmadi. Bir martalik vosita va dalillar Gitdan chiqarilgan `.local/library-*` ichida; doimiy tests/ yoki audit infratuzilmasi yaratilmagan.

1. 15 mavzu, har biriga 8 savol; qayta import oldingi savollarni saqladi; eski version 409.
2. To'rt mavzudan 5+4+6+5=20: har kvota, savol noyobligi va 20 so'ralib 8 mavjudligi xabari tekshirildi.
3. Bazada arxivlash saqlangan test savollarini o'zgartirmadi.
4. DOCX XMLdagi savollar tartibi, o'quvchi nusxasida kalit yo'qligi, alohida kalit va A4 HTML tartibi solishtirildi.
5. Uch marker ko'rinishini DOCX parser bilan o'qish va mavjud formulali/rasmli/jadvalli namuna importi tekshirildi.
6. Mavzularli zaxira export → restore-preview → restore: 15 mavzu saqlandi.
7. Faol 6 xonali kod bilan o'quvchi kirishi, ikkala shuffle, 20/20 baho va takror submitning bir xil natijasi tekshirildi.
8. Ikki maktab: birida faqat onlayn, ikkinchisida faqat PDF. Bank va olingan nusxa eksportlari, Aiken, dublikat va ochiq backup orqali chetlashish 403; boshqa maktab mavzusi/natijasi 404.
9. Obuna tugagach yangi olish/publish 403; avval boshlangan urinishning draft/submit ishladi; rerunExpired qoidasidan so'ng publish ishladi.
10. Chrome: `+` bilan to'rt mavzu, miqdorlar va jonli jami 20, qoralama saqlash, prompt; 390/1280px gorizontal chiqishsiz, JS xatosiz.
11. Chrome: savol almashtirish/qayta tuzish, DOCX previewdan 3 savolning faqat 2 tasini tanlab yozish, qidirish/tahrirlash va bosh admin moderatsiya oynasi o'tdi.
12. Chrome A4 nusxadan haqiqiy `%PDF` fayl yaratdi; chop oynasida CSS yuklanishi tekshirildi. Dalil: `.local/library-evidence/test.pdf`.
13. Boy DOCX eksportida native OMML, media va Word jadvali; kesishuvchi ikki mavzuda kvotalar 50 tasodifiy takrorlashda tekshirildi.
14. Tarifdan meros, maktab istisnosi, view=false, maktab/super rol cheklovlari va o'chirilgan umumiy nusxa provenance guardi tekshirildi.
15. `npm run check` va `npm run build` o'tdi. `npm run format` ishlatildi; topshiriqqa aloqasiz format o'zgarishlari qaytarildi, yangi va tegishli kod fayllari Prettier bilan formatlandi. Eski ixcham backup-service formati 250 qator chegarasi uchun saqlandi.

## O'zgargan modullar

- `server/routes/admin/library.mjs`, routes index: mavzu/chorak/bank/policy/document/publish adapterlari.
- `server/services/topic-service.mjs`, `quarter-test-service.mjs`, `shared-bank-service.mjs`, `bank-policy-service.mjs`, `library-online-service.mjs`, `test-document-service.mjs`, `bank-backup-service.mjs`.
- `server/repositories/library-repo.mjs`, `topics-repo.mjs`, `test-origin-repo.mjs`, tests-repo va scoped blob store; `server/lib/topic-sampler.mjs`, `topic-backup.mjs`, `quarter-composition.mjs`, `test-document.mjs`.
- Mavjud test/attempt/completion/result-word/backup xizmatlari va backup/result route guardlari, backup validator.
- `public/js/teacher/library-{topics,compose,prompt,actions}.js`, `savollar-bazasi.js`, `test-print.js`; o'qituvchi sahifasi, sidebar va A4 CSS.
- `public/bosh-admin/umumiy-bank.html`, `public/js/super-admin/umumiy-bank.js`, bosh panel havolasi; PLAN va arxitektura havolasi.

## Qolgan chegaralar

- Serverdan tayyor PDF fayli yuklab olish hali yo'q; yuqoridagi brauzer PDF usuli bor. Server PDF konvertori kerak bo'lsa keyingi implementatsiya talab qilinadi.
- Avtomatik umumiy son taqsimoti qo'shilmagan: asosiy talabdagi har mavzuga aniq miqdor usuli ishlaydi.
- Ruxsat modeli mavjud school_admin roliga tayangan; loyihada alohida o'qituvchi hisoblari/ruxsatlari hozir mavjud emas.
- Mavzularni ro'yxatlash maktab doirasida butun mavzu yozuvlarini o'qiydi; katta bazalar uchun indeks va sahifalash keyin talab qilinishi mumkin.
- Xom Word manbasi saqlanmaydi; mavjud importer/Word renderer qo'llaydigan rich-html-v1/MathML modeli ishlatiladi. Mavjud MathType/OLE converter cheklovi saqlangan.
- Tarif cheklovlari ilovadagi eksport amallarini boshqaradi. O'quvchiga berilgan savol matnini qurilmada nusxalashni texnik taqiqlash ko'zda tutilmagan.

2026-11-17 UI yangilanishi: tanlangan mavzular accent rangidagi panel va kartalar bilan ajratiladi. Olib tashlash tugmasi o'rnida native checked checkbox bor; belgisini olish tanlovdan chiqaradi, karta rangi va + tugmasi qaytadi. Alohida question-library.css sahifaga ulangan. Chrome light/dark 390/1280px, tanlash/chiqarish va asosiy oqimlar tekshirildi; check/build o'tdi.
