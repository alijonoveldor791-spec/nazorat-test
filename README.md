# Nazorat

Maktablar uchun frameworksiz onlayn test platformasi. O’qituvchi sinflar, ro’yxatlar, Aiken testlar va natijalarni boshqaradi. O’quvchi testni bir savoldan ishlab, yakunda ballini ko’radi.

## Lokal ishga tushirish

Node.js 22 yoki yangiroq versiya va npm kerak. PowerShell:

```powershell
cd C:\Users\user\Desktop\Nazorat-test
npm.cmd install
# .env mavjud bo’lmasa:
Copy-Item .env.example .env
```

`.env` ichida quyidagilarni yozing. Oldindan yaratilgan `.env` bo’lsa uni ustidan ko’chirmang.

| O’zgaruvchi | Vazifasi |
| --- | --- |
| `TEACHER_PASSWORD` | Boshlang’ich o’qituvchi paroli: standart siyosatda 12–200 belgi. Standart parol yo’q; muhitdagi minimumga mos kelmasa kirish bloklanadi. |
| `TOKEN_SECRET` | HMAC imzolash kaliti; kamida 32 tasodifiy belgi. |
| `TEACHER_PASSWORD_MIN_LENGTH` | Standart 12; muhit uchun 5–200 oralig’ida alohida minimum berish mumkin. Forma va server bir xil qiymatdan foydalanadi. |

Kalit yaratish:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
npm.cmd run dev
```

- O’quvchi: http://localhost:8888/
- O’qituvchi: http://localhost:8888/oqituvchi/kirish.html
- Eski `/teacher.html` havolasi ham kirish sahifasiga olib boradi.

Bu muhitda Node PATH ichida topilmagani uchun sinovlar vaqtinchalik Node 22 bilan bajarildi. O’z kompyuteringizda Node’ni odatiy usulda o’rnating. Netlify Dev lokal `.netlify` omboridan foydalanadi; production ma’lumotlarini o’qimaydi.

Edge Functions ishlatilmaydi. Deno ishga tushishi ushbu Windows muhitida to’xtab qolgani sabab tekshiruvda `npx netlify dev --offline --no-open --internal-disable-edge-functions` ishlatildi. Odatda `npm run dev` yetarli.

## Sahifalar va kod

Statik fayllarning yagona manbasi `public/`. Eski ildizdagi `index.html` va `teacher.html` o’rniga `public/index.html` hamda `public/oqituvchi/` ishlatiladi.

```text
public/
  index.html, test.html, natija.html
  oqituvchi/               kirish va panel sahifalari
  css/                     tokens, base, layout, components, pages
  js/core/                 API, sessiya, DOM, saqlash, mavzu
  js/components/           modal, toast, jadval, navigatsiya
  js/student/              o’quvchi sahifalari va urinish holati
  js/teacher/              panel sahifalari va tahrirlagich
server/
  router.mjs
  routes/public/, routes/admin/
  services/, repositories/, lib/, migrations/
netlify/functions/api.mjs   yupqa Netlify kirish nuqtasi
samples/namuna-test.txt
scripts/, tests/, docs/
```

Qatlamlar va yangi kod qo’shish tartibi: [ARCHITECTURE.md](docs/ARCHITECTURE.md). O’qituvchi uchun [qo’llanma](docs/OQITUVCHI-QOLLANMA.md).

## Tekshiruvlar

```powershell
npm.cmd test
npm.cmd run check
npm.cmd run build
# Netlify Dev boshqa terminalda ishlayotganida:
npm.cmd run verify
npm.cmd run test:browser
npm.cmd run test:load
npm.cmd run test:audit:api
npm.cmd run test:audit:auth
npm.cmd run test:audit:browser
```

`build` statik kodni qayta yig’maydi, tuzilma tekshiruvini bajaradi. `check` 250 qator chegarasi, inline kod, qatlamlar va public havolalarini tekshiradi. `npm run format` kodni formatlaydi. Lock fayli avtomatik yaratiladi va `postinstall` uni 250 qator qoidasiga mos bir qatorli JSON qiladi.

Brauzer sinovi o’rnatilgan Chrome’dan foydalanadi. Boshqa kanal uchun `PLAYWRIGHT_CHANNEL` belgilang. Natija va skrinshotlar `artifacts/`ga yoziladi. Sinovlar vaqtinchalik sinf/test/natijalarni o’chiradi; ularga tegishli urinish izlari lokal Blobs’da qolishi mumkin. `TEST_BASE_URL` bilan faqat alohida sinov muhitini ko’rsating.

`test:audit:auth` faqat localhost’da vaqtinchalik parolni almashtirib, asl parolni qaytaradi. Sinov tokenlari serverdan bekor qilinadi. Boshlang’ich [audit](docs/AUDIT-OLDIN.md) va tuzatishdan keyingi [hisobot](docs/AUDIT-KEYIN.md) alohida saqlangan.

## O’quvchi kodi va saqlash

Ro’yxatli sinf uchun **Sinflar → Shaxsiy kirish kodlari**dan har o’quvchiga faqat o’z kodini bering. Eski ro’yxatlar admin panelida ochilganda kodlar qo’shiladi. Ochiq API roster yoki kodlarni bermaydi. O’quvchi sinf va shaxsiy kodini kiritadi; boshqa brauzer boshlangan urinishni egallay olmaydi. Ro’yxatsiz sinf erkin ism bilan **ochiq mashq** rejimida qoladi — bu shaxsni tasdiqlamaydi.

Har javob lokal saqlanadi, taxminan 1,2 soniya tanaffusdan keyin serverga yuboriladi. UI qurilma va server saqlash holatini alohida bildiradi; joy yetishmasa yolg’on “saqlandi” demaydi. Internet tiklanganda draft yoki yakuniy yuborish avtomatik qayta tekshiriladi. Bitta urinish ikki oynada tahrirlanmaydi.

Muddat tugagach yangi javob qabul qilinmaydi. Keyingi natijalar/tiklash so’rovida oxirgi server nusxasi yakunlanadi; hali serverga yetmagan oflayn javoblar kechikib bahoga qo’shilmaydi. Tiklash uchun imzolangan urinish dalili 7 kungacha ishlaydi, bu test vaqtini uzaytirmaydi. Vaqt sozlanmagan urinishning server muddati 24 soat. Boshlanmagan sahifani internet yo’q paytda yuklash uchun offline PWA qo’shilmagan.

## Aiken formati

```text
Savol matni?
A. Birinchi variant
B. Ikkinchi variant
ANSWER: B
```

UTF-8 `.txt`; savollar orasida bo’sh qator; 1–200 savol, 2–6 ketma-ket A–F variant. `JAVOB: B` ham qabul qilinadi. Parser faqat serverda: preview `POST /api/admin/tests/preview` orqali olinadi. [Namuna](samples/namuna-test.txt) yuklab olish uchun `public/namuna-test.txt`da ham mavjud; bu statik tarqatish nusxasi, parser nusxasi emas.

## Zaxira va eski ma’lumotlar

Sozlamalarda zaxirani bitta JSON qilib yuklab oling. Tiklash faylni avval tekshiradi, keyin ID bo’yicha qo’shadi yoki yangilaydi. Bir nechta yozuvni tiklash umumiy tranzaksiya emas: uzilish bo’lsa shu zaxirani qayta tiklash mumkin. Parol, admin sessiyalari, tugallanmagan urinishlar va token kaliti eksport qilinmaydi. Sinf zaxirasida shaxsiy o’quvchi kodlari bor — faylni faqat ishonchli joyda saqlang. Import limiti 4 MB.

`tests` va `results` omborlari saqlangan. `grades` asosidagi eski testlar o’qishda virtual sinflarga moslashtiriladi. Eski natijalarda mavjud ball saqlanadi; saqlanmagan javoblar/sarflangan vaqt o’ylab topilmaydi. Eski cheklanmagan testlarga moslik uchun boshlang’ich limit 100 urinish.

## Netlify’ga joylash

1. Shu repozitoriyni avvalgi Netlify loyihasiga ulang. Mavjud Blobs yozuvlari kerak bo’lsa yangi site yaratmang.
2. Publish directory: `public`; Functions directory: `netlify/functions`; build command kerak emas.
3. Netlify muhit sozlamalarida `TEACHER_PASSWORD` va `TOKEN_SECRET`ni Functions uchun kiriting.
4. `.env`, `.netlify`, `node_modules` va `artifacts`ni yuklamang; Git orqali deploy qiling. Oddiy drag-and-drop faqat statik fayllar bilan backendni joylamaydi.
5. Deploydan keyin kirish → sinf → test → o’quvchi → panel natijasi oqimini production’da tekshiring.

Admin sessiyasi 8 soat, **Chiqish** server sessiyasini ham bekor qiladi. Parol panelda almashtirilgach scrypt hash Blobs sozlamasida turadi; muhitdagi qiymat faqat boshlang’ich sozlash uchun qoladi. Unutilgan parolni site egasi `settings` omboridagi `auth` yozuvini o’chirib boshlang’ich parolga qaytarishi mumkin; bu eski tokenlarni qayta yaroqli qilmaydi. `TOKEN_SECRET`ni almashtirish barcha eski imzolarni bekor qiladi. O’quvchi kaliti faqat yakunlangach va amaldagi ruxsat yoqilganida qaytariladi; avval ko’rsatilgan yoki ko’chirib olingan javoblarni orqaga qaytarib bo’lmaydi.
