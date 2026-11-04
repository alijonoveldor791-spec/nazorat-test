# Bosh sahifa: 1-bosqich

Sana: 2026-11-04. Faqat lokal implementatsiya va ikkita commit; push/deploy bajarilmadi.

## Natija

- `/` forma maydonlarisiz platformani tushuntiradi: hero, uch qadam, uch qulaylik, ruhlantirish, yakuniy chaqiriq va footer.
- `Testga o'tish` → `/test-kirish.html`; `Maktab sahifasiga o'tish` → `/oqituvchi/kirish.html`.
- Eski wizard to'liq saqlandi; `home.js` o'rniga `entry.js` ulanadi.
- Landing va wizard `entry-session.js`dagi bir xil resume oqimini ishlatadi. Landingda `discard` tugmasi yo'q; shu listener ixtiyoriy qilindi.
- Testga urinishsiz kirish wizardga boradi. Natijadagi qaytish, header va adminlarning o'quvchi havolalari bosh sahifada qoladi. Netlify redirectlari o'zgarmadi.
- `/?legacy=1` eski testlarga; `/?schoolId=...` parametrlarini saqlagan holda wizardga boradi.
- CSS faqat landingga tegishli, token ranglari bilan yozilgan, 249 qator. 600–1023px hero bitta ustun, 1024pxdan ikki; qadam/kartalar ikki/uch ustun. 600pxdan kichik uchun yangi qoida yo'q.
- Backend, API, autentifikatsiya, baholash va test/natija/panel dizaynlari o'zgarmadi.

## Fayllar

| Fayl | O'zgarish |
| --- | --- |
| `public/index.html` | Yangi semantik landing, title/description, skip-link |
| `public/test-kirish.html` | Avvalgi wizard |
| `public/js/student/entry.js` | Ko'chirilgan wizard kirishi |
| `public/js/student/landing.js` | Mavzu, resume va eski kirish havolalari |
| `public/js/student/entry-session.js` | `discard` listeneri ixtiyoriy |
| `public/js/student/test.js` | Urinishsiz yo'naltirish wizardga |
| `public/css/pages/landing.css` | Mustaqil landing dizayni |
| `public/css/styles.css` | Landing importi |
| `PLAN.md`, `docs/ARCHITECTURE.md` | Sahifa tuzilmasi va tekshiruvlar |
| `docs/requirements/screens.md`, `student-flow.md` | Joriy navigatsiya va modul havolalari |
| `docs/requirements/test-code.md`, `product-evidence.md` | Ko'chirilgan fayllarga havolalar |

`public/css/pages/student-responsive.css`dagi avvaldan mavjud foydalanuvchi o'zgarishi bu ish commitlariga kiritilmadi.

## Tekshiruv dalillari

- `npm run check` va `npm run build`: PASS. Build faqat tuzilma tekshiruvi ekanligi saqlandi.
- `git diff --check`: bo'sh joy xatolari yo'q.
- Tegishli frontend fayllari loyiha Prettier vositasi bilan formatlandi.
- `npm run dev` ishga tushirildi, lekin 8888 port oldindan band edi. Shu manzildagi mavjud Netlify Dev ishlatildi; wizard HTTP 200, public classes API HTTP 200 berdi. Avvaldan ishlayotgan server to'xtatilmadi.
- Chrome headless: 600, 768, 1024, 1280px × light/dark. Har holatda bitta h1, forma/maydonlar yo'q, gorizontal chiqish yo'q, hero ustunlari talabga mos. Skrinshotlar Gitdan tashqari `.local/landing-<kenglik>-<rejim>.png`da.
- Tab bilan landingdagi to'qqizta faol havola/tugmaga yetildi; rang rejimi almashtirildi, reduced-motion holatida o'tish vaqti 0.001 soniyadan kichik.
- Matn kontrasti hisoblandi: light minimum 4.77:1, dark minimum 6.38:1; dekorativ `aria-hidden` qismlar hisobga olinmadi.
- Ikkala CTA, `schoolId`/legacy mosligi va urinishsiz testdan wizardga o'tish tekshirildi.
- Wizard: kod `004271` boshidagi nollari bilan tekshirildi; sinf, ism/otasining ismi/familiya, tasdiqlash va start o'tdi. Tasdiqlashgacha urinish yaratilmagan, startdan keyin bitta urinish yaratilgan.
- Javob server draftiga saqlandi; wizard va landingdagi resume orqali shu javob qayta ochildi. Yuborish bitta natija yaratdi; natijadagi qaytish `/`ni ochdi.
- Brauzer konsoli va JavaScript xatolari: 0. Oqim API javoblari: resolve 200, start 201, draft/resume/submit 200.

Funksional tekshiruvda frontend mavjud lokal Netlify Devdan olindi. Brauzer API so'rovlari alohida Node jarayonidagi haqiqiy router → services → repositories qatlamlariga yuborildi; faqat Blobs adapteri xotira bilan almashtirildi. Tayyor muvaffaqiyat javoblari bilan API taqlid qilinmadi. Haqiqiy lokal yoki hosting ma'lumotlariga urinish/natija yozilmadi. Bir martalik tekshiruv kodi Gitga qo'shilmadi; doimiy tests/audit infratuzilmasi qayta yaratilmadi. Qisqa natijalar `.local/landing-review.json`da.

## Qarorlar va keyingi bosqich

Mahsulot qaroriga zid holat topilmadi. Tarixiy hujjatlarda eski oqim tasviri bor; ularga joriy sahifa tuzilmasi haqida alohida qayd qo'shildi. Obuna, urinish limiti va boshqa ochiq mahsulot siyosatlari bu ishda o'zgartirilmadi.

Keyingi bosqich uchun tavsiya: alohida topshiriqda 600pxdan kichik ekranlarni loyihalash. Hostingdagi haqiqiy ma'lumotlar bilan sinov va nashr bu bosqichda bajarilmadi.
