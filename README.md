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
| `TEACHER_PASSWORD` | O’qituvchi paroli; kamida 12 belgi tavsiya qilinadi. Standart parol yo’q. Bo’sh bo’lsa admin kirishi bloklanadi. |
| `TOKEN_SECRET` | HMAC imzolash kaliti; kamida 32 tasodifiy belgi. |

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
```

`build` statik kodni qayta yig’maydi, tuzilma tekshiruvini bajaradi. `check` 250 qator chegarasi, inline kod, qatlamlar va public havolalarini tekshiradi. `npm run format` kodni formatlaydi. Lock fayli avtomatik yaratiladi va `postinstall` uni 250 qator qoidasiga mos bir qatorli JSON qiladi.

Brauzer sinovi o’rnatilgan Chrome’dan foydalanadi. Boshqa kanal uchun `PLAYWRIGHT_CHANNEL` belgilang. Natija va skrinshotlar `artifacts/`ga yoziladi. Sinovlar vaqtinchalik sinf/test/natijalarni o’chiradi; ularga tegishli urinish izlari lokal Blobs’da qolishi mumkin. `TEST_BASE_URL` bilan faqat alohida sinov muhitini ko’rsating.

## Aiken formati

```text
Savol matni?
A. Birinchi variant
B. Ikkinchi variant
ANSWER: B
```

UTF-8 `.txt`; savollar orasida bo’sh qator; 1–200 savol, 2–6 ketma-ket A–F variant. `JAVOB: B` ham qabul qilinadi. Parser faqat serverda: preview `POST /api/admin/tests/preview` orqali olinadi. [Namuna](samples/namuna-test.txt) yuklab olish uchun `public/namuna-test.txt`da ham mavjud; bu statik tarqatish nusxasi, parser nusxasi emas.

## Zaxira va eski ma’lumotlar

Sozlamalarda zaxirani bitta JSON qilib yuklab oling. Tiklash faylni avval tekshiradi, keyin ID bo’yicha qo’shadi yoki yangilaydi. Bir nechta yozuvni tiklash umumiy tranzaksiya emas: uzilish bo’lsa shu zaxirani qayta tiklash mumkin. Parol va kalit eksport qilinmaydi.

`tests` va `results` omborlari saqlangan. `grades` asosidagi eski testlar o’qishda virtual sinflarga moslashtiriladi. Eski natijalarda mavjud ball saqlanadi; saqlanmagan javoblar/sarflangan vaqt o’ylab topilmaydi. Eski cheklanmagan testlarga moslik uchun boshlang’ich limit 100 urinish.

## Netlify’ga joylash

1. Shu repozitoriyni avvalgi Netlify loyihasiga ulang. Mavjud Blobs yozuvlari kerak bo’lsa yangi site yaratmang.
2. Publish directory: `public`; Functions directory: `netlify/functions`; build command kerak emas.
3. Netlify muhit sozlamalarida `TEACHER_PASSWORD` va `TOKEN_SECRET`ni Functions uchun kiriting.
4. `.env`, `.netlify`, `node_modules` va `artifacts`ni yuklamang; Git orqali deploy qiling. Oddiy drag-and-drop faqat statik fayllar bilan backendni joylamaydi.
5. Deploydan keyin kirish → sinf → test → o’quvchi → panel natijasi oqimini production’da tekshiring.

Admin sessiyasi 8 soat; parol almashtirish eski tokenlarni bekor qiladi. Parol panelda almashtirilgach scrypt hash Blobs sozlamasida turadi, muhitdagi qiymat boshlang’ich sozlash uchun qoladi. O’quvchi urinishida aralashtirish va baholash serverda; javob kaliti faqat yakundan so’ng o’qituvchi ruxsati bilan qaytariladi. Taymerga tarmoq uchun 30 soniya yuborish imtiyozi bor, vaqtsiz urinish 24 soat saqlanadi. Ro’yxatdan tanlash to’liq shaxsiy autentifikatsiya emas: sinfdagi boshqa ismni tanlashni texnik jihatdan to’smaydi.
