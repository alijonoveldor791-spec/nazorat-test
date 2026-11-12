# Nazorat

Mahsulot qoidalarining joriy asosi: [1-bosqich](docs/requirements/product-rules.md), [kod dalillari](docs/requirements/product-evidence.md), [vakolatlar](docs/requirements/roles.md), [ochiq qarorlar va 2-bosqich](docs/requirements/product-decisions.md). Holat: **tahlil va hujjatlar tayyor, qarorlar kutilmoqda** (2026-11-03). Talab va tavsiya amalda bajarilgan imkoniyatdan ajratilgan.

## Boshqa kompyuterda davom ettirish

Node.js 22.12.0 yoki yangiroq va Git o'rnatilgach:

```powershell
git clone https://github.com/alijonoveldor791-spec/nazorat-test.git
cd nazorat-test
npm.cmd install
```

Avval klonlangan nusxada lokal o'zgarishlarni saqlab, `git pull --ff-only origin main` bajaring. `.env`, `.netlify` ichidagi lokal Blobs bazasi va `.local` artefaktlari GitHub orqali ko'chmaydi. `.env`ni xavfsiz yo'l bilan alohida ko'chiring yoki quyidagi lokal sozlash yo'riqnomasi bo'yicha yarating; mavjud `.env` ustidan yozmang. Netlify hisobiga kirish va mavjud saytga ulash ham yangi kompyuterda alohida bajariladi.

Davom ettirish nuqtasi: [PLAN](PLAN.md), [A tahlili](docs/implementation/math-import-stage-a.md) va [B content shartnomasi](docs/implementation/math-import-stage-b.md). B validatori mustaqil; amaldagi APIga ulanmagan. Keyingi ish C вЂ” xavfsiz DOCX/OMML parsing; renderer va import tasdiqlash keyingi bosqichlarda. `npm.cmd run check` va `npm.cmd run build` tekshiruvlari saqlanadi.

O'quvchi bosh sahifasi endi 4 bosqichli: kodlarni tekshirish в†’ sinfni tanlash в†’ ism/familiya в†’ tasdiqlash. Test kodi bitta testni aniqlaydi; alohida test dropdowni yo'q. Taymer faqat yakuniy "Testni boshlash"da ishlaydi. Serverda tasdiqlangan saqlangan urinish alohida bannerda chiqadi. Eski testlar sahifasi: `/eski-testlar.html`; `/?legacy=1` ham shu sahifaga o'tadi. [Wizard hisoboti](docs/implementation/student-wizard.md).

2026-11-01: foydalanuvchi talabiga ko'ra dasturchi sinov fayllari, audit/brauzer skriptlari va lokal QA maktablari olib tashlandi. Tarixiy hisobotlardagi test buyruqlari endi mavjud emas. Tekshiruv uchun `npm run check` va `npm run build` ishlatiladi.

## Maktab IDsi va bosh admin paneli

Bosh admin menyusi: boshqaruv paneli, maktablar, maktab qo'shish, obunalar, statistika va sozlamalar. **Maktab qo'shish**da nom/hudud kiriting: server ichki UUID va alohida `public_school_id` (`SK-1001`, `SK-1002`, ...) yaratadi. **Maktablar**da qisqa ID yoki nom bo'yicha qidiring, IDni nusxalang; **Boshqarish**ni ochib nom/hudud, admin va obunani tahrirlang. Nom o'zgarsa ikkala ID saqlanadi. Parallel yoki qayta yuborilgan yaratish so'rovlari IDni takrorlamaydi.

Bloklash maвЂ™lumotlarni oвЂchirmaydi, maktab admini kirishini yopadi. Qayta faollashtirilganda admin yangidan kiradi; eski sessiyalar qayta ishlamaydi. Maktab admini oвЂz maktabi nomi/IDsini va nusxalash tugmasini panel sarlavhasida koвЂradi. Eski IDlar avtomatik almashtirilmaydi; fizik maktab oвЂchirish yoвЂq.


O'quvchi bosh sahifada qisqa maktab IDsi va 6 raqamli faol test kodini kiritadi, so'ng tegishli sinf va ism/familiyani tanlab boshlaydi. Maktabni oldindan to'ldirish: `/?schoolId=SK-1001`; test kodi URLga yozilmaydi. Eski maktabsiz testlar uchun `/?legacy=1` saqlangan. Qisqa ID admin huquqi yoki maxfiy parol emas.

Eski maktablar uchun `npm run migrate:school-ids` dry-run beradi; `npm run migrate:school-ids -- --apply` faqat lokal Netlify Dev omboriga yetishmagan IDlarni yozadi. Qayta bajarish mavjud kodlarni o'zgartirmaydi. Production apply bloklangan; production migratsiya alohida tasdiq talab qiladi. [Qisqa ID hisoboti](docs/implementation/public-school-id.md).

## Admin parollari va kalitlar

Admin paroli 6–128 belgidan iborat bo'lishi mumkin. `TOKEN_SECRET` eski urinish imzolari va moslik davriga saqlanadi; `ADMIN_SESSION_SECRET` admin sessiyalari, `TEST_CODE_ENCRYPTION_KEY` esa test kodlarini alohida himoyalaydi. Kalitlarni o'zgartirishdan oldin [migratsiya yo'riqnomasini](docs/backup-restore-security.md) bajaring. Production sirlarini repoga yoki zaxiraga qo'ymang.

## A: maktab adminining umumiy test kodi

Maktabga biriktirilgan admin testni saqlaganda 6 raqamli umumiy kod avtomatik yaratiladi. **Testlar** kartasida kod, fan, sinf, savol soni, vaqt/jadval va test holati koвЂrinadi. Kod dastlab nofaol: **Kodni faollashtirish** bilan ochiladi; **Kodni bekor qilish** uni qaytmas bekor qiladi. Shundan keyin yangi kod yaratish mumkin. Reload va testni tahrirlash ayni kodni saqlaydi; nusxa test boshqa nofaol kod oladi. Kod holati testni faollashtirish/toвЂxtatishdan mustaqil.

Kod serverda shifrlanadi va faqat o'z maktabi adminiga qaytariladi. `TOKEN_SECRET`ni saqlang: uni almashtirishdan oldin kod registri uchun kalit migratsiyasi kerak; aks holda admin API 503 qaytaradi, mavjud kodlar ustidan yozilmaydi. Eski, maktabga biriktirilmagan testga maktabni taxmin qilib kod yaratilmaydi. O'quvchi qisqa maktab IDsi va faol kod bilan kiradi; server kodni shu maktab doirasida tekshiradi.


## 1.1: rollar bilan lokal ishlash

Kirish: `/oqituvchi/kirish.html`. Yangi adminlar login va parolni kiritadi; bosh admin `/bosh-admin/index.html`ga, maktab admini oвЂz paneliga yoвЂnaltiriladi. Bosh admin bootstrap uchun muhitda `SUPER_ADMIN_LOGIN` (3вЂ“60 ta lotin harfi/raqam/nuqta/defis/pastki chiziq) va `SUPER_ADMIN_PASSWORD` (6–128 belgi) belgilanadi. Maxfiy qiymatlarni kod/Gitga yozmang; lokal `.env` yoki Netlify Functions muhitidan foydalaning. Bootstrap faqat yangi login hisobini yaratadi; keyin parol hisobning server hashidan tekshiriladi.

Kirish uchun admin logini va paroli majburiy. Umumiy parolli eski kirish olib tashlangan; eski sessiyalar rad etiladi. Maktab admini faqat o'z maktab ma'lumotlariga kira oladi. Egasi yo'q eski test/natijalar saqlanadi va avtomatik boshqa maktabga biriktirilmaydi.


Maktablar uchun frameworksiz onlayn test platformasi. O'qituvchi sinflar, ro'yxatlar, Aiken testlar va natijalarni boshqaradi. O'quvchi testni bir savoldan ishlab, yakunda ballini ko'radi.

## Lokal ishga tushirish

Node.js 22.12.0 yoki yangiroq versiya va npm kerak. PowerShell:

```powershell
cd C:\Users\user\Desktop\Nazorat-test
npm.cmd install
# .env mavjud bo'lmasa:
Copy-Item .env.example .env
```

`.env` ichida quyidagilarni yozing. Oldindan yaratilgan `.env` bo'lsa uni ustidan ko'chirmang.

| O'zgaruvchi | Vazifasi |
| --- | --- |
| `SUPER_ADMIN_LOGIN` | Boshlang'ich bosh admin logini. |
| `SUPER_ADMIN_PASSWORD` | Boshlang'ich bosh admin paroli, 6-128 belgi. |
| `TOKEN_SECRET` | HMAC imzolash kaliti; kamida 32 tasodifiy belgi. |
| `ADMIN_SESSION_SECRET` | Admin sessiyasi uchun alohida, kamida 32 belgili kalit. |
| `TEST_CODE_ENCRYPTION_KEY` | Test kodlari uchun alohida, kamida 32 belgili kalit. |

## Netlifyda ishga tushirish

1. Netlifyda Git repozitoriydan loyiha yarating. `netlify.toml` sozlamalari: build `npm run build`, publish `public`, functions `netlify/functions`, Node.js 22.
2. **Project configuration > Environment variables > Add a variable > Import from a .env file** orqali mahalliy `.env` tarkibini import qiling. Scope **Functions**ni qamrasin, deploy context **Production** bo'lsin. `.env.example` qiymatsiz namuna; haqiqiy qiymatlar `.env`da.
3. Yuqoridagi beshta majburiy qiymat to'ldirilgan bo'lsin. `ADMIN_SESSION_PREVIOUS_SECRET` va `TEST_CODE_ENCRYPTION_KEY_PREVIOUS` faqat kalit almashtirish uchun; yangi saytda bo'sh qoldiriladi.
4. `DOC_CONVERTER_URL` / `DOC_CONVERTER_TOKEN` eski binar `.doc` uchun, `DOC_MATH_CONVERTER_URL` / `DOC_MATH_CONVERTER_TOKEN` MathType/OLE formulalari uchun ixtiyoriy tashqi xizmat sozlamalari. Haqiqiy xizmat manzili va tokeni bo'lmasa bo'sh qoldiring; bu konvertatsiyalar uchun alohida xizmat kerak.
5. Sozlamalarni saqlagach yangi deploy boshlang. `/oqituvchi/kirish.html` orqali `.env`dagi bosh admin login-paroli bilan kiring, maktab va uning adminini yarating. Maktab adminida sinf/test yarating, test kodini faollashtiring va bosh sahifadan o'quvchi oqimini tekshiring.

Netlify `.env` faylini Gitdan olmaydi; faqat `public/` papkasini qo'lda yuklash server APIlarini o'rnatmaydi. Git asosidagi deploydan foydalaning. Netlify Blobs production ombori lokal `.netlify` omboridan alohida; lokal ma'lumotlar avtomatik ko'chmaydi. Mavjud production saytda kalitlarni mahalliy qiymatlar bilan almashtirmang: avval [kalit migratsiyasi va tiklash yo'riqnomasi](docs/backup-restore-security.md)ni bajaring. Bootstrap login mavjud bo'lsa, `.env`dagi parol uning serverdagi parolini o'zgartirmaydi.

Rasmiy yo'riqnomalar: [muhit o'zgaruvchilarini import qilish](https://docs.netlify.com/build/environment-variables/get-started/), [Functions scope](https://docs.netlify.com/build/functions/environment-variables/).

Kirish va parolni almashtirish formalarida input ichidagi **ko'z ikonkasini** bosib parolni ko'rsatish yoki berkitish mumkin. Parol uzunligi backend va brauzerda 6–128 bilan chegaralangan.

Kalit yaratish:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
npm.cmd run dev
```

- O'quvchi: http://localhost:8888/
- O'qituvchi: http://localhost:8888/oqituvchi/kirish.html
- Eski `/teacher.html` havolasi ham kirish sahifasiga olib boradi.

Bu muhitda Node PATH ichida topilmagani uchun sinovlar vaqtinchalik Node 22 bilan bajarildi. O'z kompyuteringizda Node'ni odatiy usulda o'rnating. Netlify Dev lokal `.netlify` omboridan foydalanadi; production ma'lumotlarini o'qimaydi.

Edge Functions ishlatilmaydi. Deno ishga tushishi ushbu Windows muhitida to'xtab qolgani sabab tekshiruvda `npx netlify dev --offline --no-open --internal-disable-edge-functions` ishlatildi. Odatda `npm run dev` yetarli.

## Sahifalar va kod

Statik fayllarning yagona manbasi `public/`. Eski ildizdagi `index.html` va `teacher.html` o'rniga `public/index.html` hamda `public/oqituvchi/` ishlatiladi.

```text
public/
  index.html, test.html, natija.html
  oqituvchi/               kirish va panel sahifalari
  css/                     tokens, base, layout, components, pages
  js/core/                 API, sessiya, DOM, saqlash, mavzu
  js/components/           modal, toast, jadval, navigatsiya
  js/student/              o'quvchi sahifalari va urinish holati
  js/teacher/              panel sahifalari va tahrirlagich
server/
  router.mjs
  routes/public/, routes/admin/
  services/, repositories/, lib/, migrations/
netlify/functions/api.mjs   yupqa Netlify kirish nuqtasi
samples/namuna-test.txt
scripts/, docs/
```

Qatlamlar va yangi kod qo'shish tartibi: [ARCHITECTURE.md](docs/ARCHITECTURE.md). O'qituvchi uchun [qo'llanma](docs/OQITUVCHI-QOLLANMA.md).

## Tekshiruvlar

```powershell
npm.cmd run check
npm.cmd run build

```

`build` statik kodni qayta yig'maydi, tuzilma tekshiruvini bajaradi. `check` 250 qator chegarasi, inline kod, qatlamlar va public havolalarini tekshiradi. `npm run format` kodni formatlaydi. Lock fayli avtomatik yaratiladi va `postinstall` uni 250 qator qoidasiga mos bir qatorli JSON qiladi.



## O'quvchi kodi va saqlash

Quyidagi shaxsiy kod ko'rsatmasi faqat eski maktabsiz oqimning amaldagi mosligiga tegishli. Maqsadli mahsulotda o'quvchiga shaxsiy kod yaratilmaydi. Yangi maktab oqimi umumiy test kodi va erkin ism bilan ishlaydi; ammo sinf boshqaruvida yangi shaxsiy kod generatsiyasi hali qolgan va bu talabga zid. Uni olib tashlash 2-bosqich P0-1 vazifasi. Umumiy kod/ism shaxsni tasdiqlamaydi; brauzer bo'yicha limit inson boshiga qat'iy limit emas.

Ro'yxatli sinf uchun **Sinflar в†’ Shaxsiy kirish kodlari**dan har o'quvchiga faqat o'z kodini bering. Eski ro'yxatlar admin panelida ochilganda kodlar qo'shiladi. Ochiq API roster yoki kodlarni bermaydi. O'quvchi sinf va shaxsiy kodini kiritadi; boshqa brauzer boshlangan urinishni egallay olmaydi. Ro'yxatsiz sinf erkin ism bilan **ochiq mashq** rejimida qoladi вЂ” bu shaxsni tasdiqlamaydi.

Har javob lokal saqlanadi, taxminan 1,2 soniya tanaffusdan keyin serverga yuboriladi. UI qurilma va server saqlash holatini alohida bildiradi; joy yetishmasa yolg'on вЂњsaqlandiвЂќ demaydi. Internet tiklanganda draft yoki yakuniy yuborish avtomatik qayta tekshiriladi. Bitta urinish ikki oynada tahrirlanmaydi.

Muddat tugagach yangi javob qabul qilinmaydi. Keyingi natijalar/tiklash so'rovida oxirgi server nusxasi yakunlanadi; hali serverga yetmagan oflayn javoblar kechikib bahoga qo'shilmaydi. Tiklash uchun imzolangan urinish dalili 7 kungacha ishlaydi, bu test vaqtini uzaytirmaydi. Vaqt sozlanmagan urinishning server muddati 24 soat. Boshlanmagan sahifani internet yo'q paytda yuklash uchun offline PWA qo'shilmagan.

## Aiken formati

```text
Savol matni?
A. Birinchi variant
B. Ikkinchi variant
ANSWER: B
```

UTF-8 `.txt`; savollar orasida bo'sh qator; 1вЂ“200 savol, 2вЂ“6 ketma-ket AвЂ“F variant. `JAVOB: B` ham qabul qilinadi. Parser faqat serverda: preview `POST /api/admin/tests/preview` orqali olinadi. [Namuna](samples/namuna-test.txt) repozitoriydagi `samples/` papkasida saqlangan; saytdagi alohida namuna yuklash fayli olib tashlangan.

## Zaxira va eski ma'lumotlar

Maktab admini o'z maktabining v3 JSON zaxirasini yuklab oladi. Tiklash server previewida yozuvlarni tekshiradi va qo'shish/yangilash sonini ko'rsatadi; tasdiqda eskirgan preview rad etiladi, joriy nusxa himoyalangan Blobs omboriga yoziladi. Faol urinishlar bo'lsa tiklash rad etiladi. Ko'p yozuvli tiklash tranzaksiya emas; qisman holat va xatolar hisobotda ko'rsatiladi. Parol hashlar, sessiyalar, server kalitlari va faol urinishlar eksport qilinmaydi; shifrlangan test-kod registri kiritiladi. Sinf ro'yxatidagi o'quvchi kodlari bor, shu sabab faylni shifrlangan va cheklangan joyda saqlang. Import 4 MB. To'liq doira va cheklovlar: [zaxira/tiklash qo'llanmasi](docs/backup-restore-security.md).

`tests` va `results` omborlari saqlangan. `grades` asosidagi eski testlar o'qishda virtual sinflarga moslashtiriladi. Eski natijalarda mavjud ball saqlanadi; saqlanmagan javoblar/sarflangan vaqt o'ylab topilmaydi. Eski cheklanmagan testlarga moslik uchun boshlang'ich limit 100 urinish.

## Netlify'ga joylash

1. Shu repozitoriyni avvalgi Netlify loyihasiga ulang. Mavjud Blobs yozuvlari kerak bo'lsa yangi site yaratmang.
2. `netlify.toml` build uchun `npm run build`, Node 22, Publish directory `public` va Functions directory `netlify/functions`ni belgilaydi.
3. Netlify muhit sozlamalarida `SUPER_ADMIN_LOGIN`, `SUPER_ADMIN_PASSWORD` va `TOKEN_SECRET`ni Functions uchun kiriting.
4. `.env`, `.netlify`, `node_modules` va `artifacts`ni yuklamang; Git orqali deploy qiling. Oddiy drag-and-drop faqat statik fayllar bilan backendni joylamaydi.
5. Joylashdan oldin lokal ``npm run build``ni bajaring va asosiy sahifalarni tekshiring.
6. O'quvchilar Netlify akkauntisiz kirishi uchun Project configuration в†’ General в†’ Visitor access в†’ Project visibility `Public` bo'lsin. Eski tariflarda Password Protection sozlamasini tekshiring. Bu sozlama panelning o'z parolini olib tashlamaydi.

Admin sessiyasi 8 soat; Chiqish server sessiyasini bekor qiladi. Parol almashtirilgach hisob versiyasi yangilanadi va eski sessiyalar ishlamaydi. Loyiha egasi recover:admin buyrug'i bilan aniq Netlify site va admin login uchun avval dry-run, keyin --apply bajarishi mumkin. Netlify Personal Access Token NETLIFY_AUTH_TOKEN orqali beriladi; apply site ID tasdig'i va yashirin parol inputini talab qiladi. Qadamlar backup-restore-security.md da.

### Word importi

O'qituvchi `.doc` yoki `.docx` Word faylini preview qilib, savol va variantlarni tahrirlashi mumkin. DOCX matn formatlari, raster rasmlar, jadvallar va qo'llab-quvvatlanadigan OMML formulalarini tuzilmasi bilan saqlaydi; umumiy renderer MathML hamda chegaralangan LaTeXni lokal MathJax SVG orqali chiqaradi. Eski `.doc` va MathType/OLE uchun Netlify'da konverter sozlamalari kerak. Formatlar va cheklovlar: [Word importi qo'llanmasi](docs/import-word.md).
