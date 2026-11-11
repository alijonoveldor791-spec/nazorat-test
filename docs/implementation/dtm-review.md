# DTM, kirish va tungi rejimni qayta tekshirish

2026-11-11. feature/dtm-189-complete.

## Sabab va o'zgarishlar

Rasmdagi 2/90 va bo'limlarda 1/30 ball normal rejimga mos.
Serverdagi DTM grade va sectionResults 31/21/11 birliklarni allaqachon
to'g'ri hisoblaydi. Muammo yangi/import qilingan blokda muharrirning
normal rejimni tanlab qolishida edi.

- Yangi blok turiga o'tish va bo'limli Word importi avtomatik DTM tanlaydi.
- Yangi blokni API orqali scoringMode bermasdan saqlash ham DTM beradi.
- Mavjud test rejimi va explicit normal tanlovi saqlanadi. Oddiy rejimning
  har savoli 1 ball ekani muharrirda alohida tushuntiriladi.
- DTM yonida 3,1 / 2,1 / 1,1 va 189 ball izohi bor.
- Eski natija yoki boshlangan urinish qayta baholanmaydi. Oldingi normal
  blok uchun muharrirda DTM tanlab saqlang va yangi urinish boshlang.
- Ota ismi maydoni, majburiy validatsiyasi, summary va ismga qo'shish olib
  tashlandi. Serverga ism va familiya yuboriladi. Eski ism yozuvlari saqlanadi.
- Tungi hover jadval va tugmalarda oq; fan jadvalining oq fon/qora matn
  override'i mavzu ranglariga moslandi. Mobil DTM natijasi ekran tashqarisiga
  chiqmaydi; keng fan jadvali o'z konteynerida suriladi.

## O'zgargan fayllar

server/services/test-service.mjs; public/js/teacher/test-form.js;
public/js/teacher/test-form-view.js; public/test-kirish.html;
public/js/student/entry-view.js; public/js/student/entry-wizard.js;
public/css/components/dark-hover.css; public/css/styles.css;
public/css/pages/student-responsive.css; PLAN.md; docs/ARCHITECTURE.md.

## Lokal tekshiruv

Mavjud npm run dev 8888 serveri ishlatildi; begona server to'xtatilmadi.
Blok_test_90_yangi_sarlavhalar.docx import, save/read, start, submit, admin
natija, repeated/parallel submit va restoreResult yo'llari qayta bajarildi.

| Holat | To'g'ri | DTM ball |
| --- | --- | --- |
| Hammasi to'g'ri | 90 | 189 |
| 20 + 15 + 8 + 8 + 8 | 59 | 119,9 |
| Faqat majburiy matematika | 8 | 8,8 |
| Hammasi noto'g'ri | 0 | 0 |
| Hammasi javobsiz | 0 | 0 |
| 2-fan 1 ta + majburiy matematika 1 ta | 2 | 3,2 |

Bo'lim maksimumlari 93/63/11/11/11 tekshirildi. Variantlar aralashgan;
savollar teskari tartibida ham bir xil ball. Keyingi test tahriri oldingi
urinishga ta'sir qilmagan. Takroriy yuborishda ikkinchi natija yo'q.

Chrome/Playwrightda real maktab/test kodlari -> sinf -> faqat ism/familiya
-> tasdiqlash -> test kirishi o'tdi. Ota ismi DOMda ham, summaryda ham yo'q.
Yangi blok va Word importida DTM tanlovi, normal rejim ogohlantirishi
tekshirildi. Explicit dark va OS darkda hover computed color oq; lightda
oq emas. 390px tungi natija rasmi ko'rib chiqildi. JS xatolari chiqmadi.

npm run check va npm run build: PASS. Sinovlar/rasmlar .local/ ichida;
doimiy tests/ yaratilmagan. Deploy/main birlashtirish bajarilmadi.
