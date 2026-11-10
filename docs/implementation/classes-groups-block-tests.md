# Sinflar, yo'nalish guruhlari va blok testlar: umumiy hisobot

Sana: 2026-11-10. Tarmoq: `feature/classes-groups-block-tests`.

## Natija

Sinf va yo'nalish guruhlari, auditoriya bo'yicha test ro'yxatlari, qo'shimcha biriktirish, Word blok importi, bo'limli savollar xaritasi va fan natijalari amaldagi loyihaga qo'shildi. Eski sinflar `class`, eski testlar `ordinary` sifatida ishlaydi; `classIds`, `grades` va eski natija maydonlari saqlanadi.

- Sinf/guruh oynasi tur, nom, guruh yo'nalishi va ixtiyoriy roster bilan ishlaydi. Guruh kartasida yo'nalish ko'rsatiladi.
- Uchta auditoriya tugmasi qidiruv, holat va saralash bilan ishlaydi. Ikkala auditoriyaga biriktirilgan test tegishli ro'yxatlarda, umumiy ro'yxatda bir marta ko'rinadi.
- Test turi va auditoriya alohida tanlanadi. Test menyusidagi qo'shimcha biriktirish savollarni qayta yuklamaydi va eski biriktirishlarni atomik saqlaydi.
- Server test, sinf/guruh egaligi, yo'nalish mosligi va bo'limlar yaxlitligini tekshiradi. Biriktirilgan auditoriya tur/yo'nalishini almashtirishdan avval biriktirishlar tahrirlanadi.
- Preview hech narsa saqlamaydi. Alohida tasdiq oynasi test turi, fan bo'limlari, savollar soni, auditoriya, vaqt va urinish limitini ko'rsatadi.
- Blok savollari hujjat tartibida qoladi. Bo'lim metadata urinish va natija snapshotida saqlanadi. Koeffitsiyent kiritilmagani sabab amaldagi bir to'g'ri javobga bir ball qoidasi ishlaydi.
- Natijalar sinf/guruh bo'yicha filtrlanadi; o'quvchi va o'qituvchiga fanlar kesimidagi jadval ko'rsatiladi.
- Ikki variantli savolda chegara sabab o'chirilgan tugma saqlashni bloklaydigan mavjud modal xatosi tuzatildi; band amallar endi `aria-busy` bilan ajratiladi.

## Asl Word fayli

Manba: foydalanuvchining `Downloads/Blok_test_90_yangi_sarlavhalar.docx` fayli. U repozitoriyga qo'shilmadi. Lokal server previewi, saqlash, brauzer importi va o'quvchi oqimida shu fayl ishlatildi.

| Bo'lim | Fan | Savol |
| --- | --- | ---: |
| 1-mutaxassislik fani | Matematika | 30 |
| 2-mutaxassislik fani | Fizika | 30 |
| Majburiy fan | Matematika | 10 |
| Majburiy fan | Ona tili | 10 |
| Majburiy fan | O'zbekiston tarixi | 10 |
| Jami | | 90 |

Mutaxassislik va majburiy matematika alohida ID bilan saqlandi. `#B)`, `#B.` va `# B.` variantlari qo'shimcha vaqtinchalik DOCX bilan tekshirildi. Nol yoki bir nechta to'g'ri javobli import savol raqami bilan rad etildi. Loyihadagi boy Word namunasida OMML/MathML, rasm va jadval saqlanishi ham tekshirildi.

## Bajarilgan tekshiruvlar

Barcha yozadigan tekshiruvlar lokal Netlify Dev va vaqtinchalik maktab yozuvlari bilan bajarildi. Productionga so'rov yoki deploy bajarilmadi. Standart portlar band bo'lgani uchun o'z serverim `8899` portda, static server `4009`, functions server `8900` portda ishladi; mavjud serverga tegilmadi.

| Tekshiruv | Natija |
| --- | --- |
| `npm run check` | O'tdi: fayl chegarasi, inline kod, qatlamlar va public havolalari |
| `npm run build` | O'tdi; loyihadagi amaldagi check buyrug'ini bajaradi |
| O'zgargan JS/MJS fayllariga `node --check` | O'tdi |
| `npm run format`, so'ng o'zgargan fayllarni Prettier bilan formatlash | Bajarildi; aloqasiz format o'zgarishlari olib tashlandi |
| `git diff --check` | O'tdi |
| Sinf va yo'nalishli guruh yaratish, rostersiz saqlash | API va Chrome brauzerda o'tdi |
| Mavjud oddiy testni guruhga qo'shimcha biriktirish | Oldingi sinf va savollar saqlandi |
| Asl 90 savolli blok testni sinfga biriktirish | O'tdi: 30+30+10+10+10 |
| Blok testni qo'shimcha guruhga biriktirish | Oldingi sinf saqlandi |
| Qo'shimcha biriktirish oynasi | Chrome orqali biriktirildi; eski IDlar saqlandi |
| Auditoriya tugmalari, qidiruv, holat va saralash | Chrome orqali o'tdi; test umumiy ro'yxatda takrorlanmadi |
| Word preview, tasdiqni bekor qilish va tasdiqlab saqlash | Chrome orqali o'tdi; bekor qilinganda tahrir ma'lumotlari saqlandi |
| Blok turida savollarni aralashtirish | Server va UI cheklovi tekshirildi |
| Maktab IDsi + umumiy 6 xonali koddan natijagacha | API va Chrome orqali o'tdi |
| Bo'limli xarita va javoblar soni | 5 bo'lim; bir javobdan keyin birinchi bo'lim 1/30 |
| Umumiy va fan bo'yicha ball | API: 89/90, bo'limlar 29/30, 30/30, 10/10, 10/10, 10/10 |
| O'qituvchi natijalarini guruhga filtrlash va fan tafsiloti | Chrome orqali o'tdi |
| 390px mobil kirish, xarita va natija | O'tdi; gorizontal sahifa toshishi kuzatilmadi |
| Boshqa maktab testini o'qish/biriktirish va begona auditoriya | 404/400 bilan rad etildi; begona natijalar ro'yxatda chiqmagan |
| Mos kelmagan yo'nalish, yo'nalishsiz guruh | 400 bilan rad etildi |
| Ochiq kirish/urinish/natija javoblari | Roster va maxfiy javob kalitlari berilmagan |
| Boshqa brauzerdan urinishni tiklash | 403 bilan rad etildi |
| Draft saqlash/tiklash va eski versiya | Saqlandi; past versiya yangi javobni almashtirmadi |
| Muddatdan keyin yuborish | Faqat oldin server qabul qilgan draft baholandi; bo'lim ballari ham mos |
| Takroriy submit va urinish limiti | Bir xil natija qaytdi; limitdan keyingi start 403 |
| Zaxira preview/tiklash/idempotent takrorlash | Guruh turi, yo'nalish, bo'limlar va fan natijalari saqlandi |
| Boshqa maktab zaxirasini tiklash | 403 bilan rad etildi |
| Legacy Aiken, standart sinf va eski natija modeli | Moslik tekshirildi |

Chrome avtomatlashtirish vositasi va vaqtinchalik tekshiruvlar `.local/` ichida ishlatildi; loyiha dependencylari va Gitga qo'shilmadi. `tests/` yoki doimiy test/audit skriptlari qayta yaratilmadi.

## O'zgargan fayllar

Quyidagi ro'yxat ikkala amalga oshirish bosqichini va ushbu hisobotni qamrab oladi.

- `PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/implementation/classes-groups-block-tests.md`
- `public/css/pages/test-cards.css`
- `public/css/pages/test-runner.css`
- `public/js/components/modal.js`
- `public/js/components/section-results.js`
- `public/js/core/busy.js`
- `public/js/student/entry-view.js`
- `public/js/student/entry-wizard.js`
- `public/js/student/question-map.js`
- `public/js/student/result.js`
- `public/js/student/school-entry.js`
- `public/js/teacher/class-card-view.js`
- `public/js/teacher/class-editor.js`
- `public/js/teacher/classes.js`
- `public/js/teacher/question-editor.js`
- `public/js/teacher/result-detail.js`
- `public/js/teacher/results.js`
- `public/js/teacher/test-assignment.js`
- `public/js/teacher/test-audience.js`
- `public/js/teacher/test-card-view.js`
- `public/js/teacher/test-form-view.js`
- `public/js/teacher/test-form.js`
- `public/js/teacher/test-import.js`
- `public/js/teacher/tests.js`
- `public/test-kirish.html`
- `server/lib/backup-validate.mjs`
- `server/lib/docx-part.mjs`
- `server/lib/docx-questions.mjs`
- `server/lib/docx-renderer.mjs`
- `server/lib/section-results.mjs`
- `server/lib/shuffle.mjs`
- `server/lib/test-classification.mjs`
- `server/lib/validate.mjs`
- `server/repositories/tests-repo.mjs`
- `server/routes/admin/tests.mjs`
- `server/services/attempt-service.mjs`
- `server/services/class-service.mjs`
- `server/services/completion-service.mjs`
- `server/services/docx-import-service.mjs`
- `server/services/school-entry-service.mjs`
- `server/services/student-result-service.mjs`
- `server/services/test-assignment-service.mjs`
- `server/services/test-service.mjs`

## Tarmoq va commitlar

- Server/model/import bosqichi: `e5ee397` (`feat: add school-scoped groups and block test model`).
- Interfeys va umumiy hisobot bosqichi: `feat: add group audiences and section results to teacher and student UI` lokal commiti.
- Push, deploy va `main`ga birlashtirish bajarilmadi.

## Qolgan masalalar

So'ralgan funksiyalar bo'yicha ma'lum ochiq xato qolmadi. Deploy va `main`ga birlashtirish uchun foydalanuvchining alohida tasdig'i kerak. Lokal tekshiruvlar production muhitidagi yakuniy qabul sinovini almashtirmaydi.

## Qo'shimcha: karta/ro'yxat va tanlab o'chirish

Testlar sahifasida Kartalar va Ro'yxat tugmalari, har testda belgilash, filtrdagi barchasini tanlash hamda tanlanganlarni o'chirish qo'shildi. Ko'rinish brauzerda saqlanadi. O'chirishda testlar soni va nomlari tasdiqlanadi. Filtr o'zgarsa tanlov tozalanadi. Qisman xatoda o'chmagan testlar belgilanganicha qoladi.

Bu bosqich fayllari: `public/js/teacher/tests.js`, `public/js/teacher/test-card-view.js`, yangi `public/js/teacher/test-list-controls.js`, yangi `public/css/pages/test-list.css`, `public/css/styles.css`, `PLAN.md`, `docs/ARCHITECTURE.md` va ushbu hisobot.

Lokal Chrome sinovlari o'tdi: ko'rinish almashishi/saqlanishi, yakka/barcha/qisman tanlov, tasdiqni bekor qilish, faqat tanlanganlarni o'chirish, filtrda tanlovni tozalash, 403 xatodan keyin qayta urinish, eski natijalar va tanlanmagan test saqlanishi, begona maktab testini o'chirish rad etilishi, 390px ekranda gorizontal toshish yo'qligi. `npm run check` va `npm run build` ham o'tdi. Deploy/main birlashtirish bajarilmadi.

## Qo'shimcha: sinf/guruh karta-ro'yxati va tanlab o'chirish

Sinflar sahifasiga Kartalar/Ro'yxat, yakka/barcha tanlov va tasdiqli o'chirish qo'shildi. Ko'rinish testlar sahifasidan mustaqil saqlanadi. Tasdiq sinf/guruh nomlari, soni va biriktirilgan testlar sonini ko'rsatadi. Testlar/natijalar saqlanadi, biriktirishlar olinadi. Qisman xatoda muvaffaqiyatsiz tanlov qoladi.

Fayllar: `public/js/teacher/classes.js`, `public/js/teacher/class-card-view.js`, yangi `public/js/teacher/class-list-controls.js`, yangi `public/css/pages/class-list.css`, `public/css/styles.css`, PLAN, arxitektura va ushbu hisobot.

Lokal Chrome: karta/ro'yxat, reload va test ko'rinishidan mustaqillik, yakka/barcha/qisman tanlov, bekor qilish, qisman 403 xato/qayta urinish, barcha sinflar o'chirilgandagi bo'sh holat, 390px ekran tekshirildi. Biriktirilgan test va tarixiy natija saqlandi; begona maktab sinfini o'chirish 404 bilan rad etildi. `npm run check`, `npm run build` va JS sintaksis tekshiruvlari o'tdi. Deploy/main birlashtirish bajarilmadi.

## Qo'shimcha: sinf filtrlari

`public/js/teacher/classes.js` va `class-list-controls.js`ga nom bo'yicha qidiruv, sinf/guruh turi, yo'nalish va filtrlarni tozalash qo'shildi. Natijalar soni ko'rinadi. Filtr o'zgarsa tanlov tozalanadi; barchasini tanlash/o'chirish faqat ko'rinayotgan yozuvlarga tegishli. Ko'rinish almashganda va ma'lumotlar yangilanganda filtrlar saqlanadi.

Netlify Dev orqali lokal Chrome, vaqtinchalik mock API bilan: birgalikdagi filtrlar, eski sinf, bo'sh natija, reset, tanlovni tozalash, faqat filtrlangan yozuvni o'chirish, refreshdan keyingi yo'nalish, escape va 390px ekran tekshirildi. Haqiqiy ma'lumot o'chirilmadi. `npm run check`, `npm run build`, JS sintaksisi va `git diff --check` o'tdi. Deploy/main birlashtirish bajarilmadi.

## Qo'shimcha: fanlar xaritasi akkordeoni

Savollar xaritasida har mutaxassislik va majburiy fan alohida ochilib-yopiladi. Bo'lim turi, fan nomi va javoblar soni yopiq panelda ham ko'rinadi. Birini ochish boshqalarini yopadi; boshqa fan savoliga o'tish tegishli panelni ochadi. Eski bo'limsiz testlar xaritasi saqlandi.

Fayllar: yangi `public/js/student/section-map.js`, yangi `public/css/pages/section-map.css`, `question-map.js`, `test.js`, `styles.css`, eski sarlavha uslubi olib tashlangan `test-runner.css`, PLAN, arxitektura va ushbu hisobot. Lokal Netlify Dev/Chrome va vaqtinchalik resume/draft mocklari bilan asl 90 savolning 5 bo'limi, yagona ochiq panel, sarlavhalar, javob/flag holati, avtomatik fan almashishi, Enter tugmasi, 390px va oddiy test tekshirildi. `check`, `build`, JS sintaksisi va `git diff --check` o'tdi. Deploy/main birlashtirish bajarilmadi.
