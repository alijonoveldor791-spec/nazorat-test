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

Davom ettirish nuqtasi: [PLAN](PLAN.md), [A tahlili](docs/implementation/math-import-stage-a.md) va [B content shartnomasi](docs/implementation/math-import-stage-b.md). B validatori mustaqil; amaldagi APIga ulanmagan. Keyingi ish C — xavfsiz DOCX/OMML parsing; renderer va import tasdiqlash keyingi bosqichlarda. `npm.cmd run check` va `npm.cmd run build` tekshiruvlari saqlanadi.

O'quvchi bosh sahifasi endi 4 bosqichli: kodlarni tekshirish → sinfni tanlash → ism/familiya → tasdiqlash. Test kodi bitta testni aniqlaydi; alohida test dropdowni yo'q. Taymer faqat yakuniy "Testni boshlash"da ishlaydi. Serverda tasdiqlangan saqlangan urinish alohida bannerda chiqadi. Eski testlar sahifasi: `/eski-testlar.html`; `/?legacy=1` ham shu sahifaga o'tadi. [Wizard hisoboti](docs/implementation/student-wizard.md).

2026-11-01: foydalanuvchi talabiga ko'ra dasturchi sinov fayllari, audit/brauzer skriptlari va lokal QA maktablari olib tashlandi. Tarixiy hisobotlardagi test buyruqlari endi mavjud emas. Tekshiruv uchun `npm run check` va `npm run build` ishlatiladi.

## Maktab IDsi va bosh admin paneli

Bosh admin menyusi: boshqaruv paneli, maktablar, maktab qo'shish, obunalar, statistika va sozlamalar. **Maktab qo'shish**da nom/hudud kiriting: server ichki UUID va alohida `public_school_id` (`SK-1001`, `SK-1002`, ...) yaratadi. **Maktablar**da qisqa ID yoki nom bo'yicha qidiring, IDni nusxalang; **Boshqarish**ni ochib nom/hudud, admin va obunani tahrirlang. Nom o'zgarsa ikkala ID saqlanadi. Parallel yoki qayta yuborilgan yaratish so'rovlari IDni takrorlamaydi.

Bloklash ma’lumotlarni o‘chirmaydi, maktab admini kirishini yopadi. Qayta faollashtirilganda admin yangidan kiradi; eski sessiyalar qayta ishlamaydi. Maktab admini o‘z maktabi nomi/IDsini va nusxalash tugmasini panel sarlavhasida ko‘radi. Eski IDlar avtomatik almashtirilmaydi; fizik maktab o‘chirish yo‘q.


O'quvchi bosh sahifada qisqa maktab IDsi va 6 raqamli faol test kodini kiritadi, so'ng tegishli sinf va ism/familiyani tanlab boshlaydi. Maktabni oldindan to'ldirish: `/?schoolId=SK-1001`; test kodi URLga yozilmaydi. Eski maktabsiz testlar uchun `/?legacy=1` saqlangan. Qisqa ID admin huquqi yoki maxfiy parol emas.

Eski maktablar uchun `npm run migrate:school-ids` dry-run beradi; `npm run migrate:school-ids -- --apply` faqat lokal Netlify Dev omboriga yetishmagan IDlarni yozadi. Qayta bajarish mavjud kodlarni o'zgartirmaydi. Production apply bloklangan; production migratsiya alohida tasdiq talab qiladi. [Qisqa ID hisoboti](docs/implementation/public-school-id.md).

## A: maktab adminining umumiy test kodi

Maktabga biriktirilgan admin testni saqlaganda 6 raqamli umumiy kod avtomatik yaratiladi. **Testlar** kartasida kod, fan, sinf, savol soni, vaqt/jadval va test holati ko‘rinadi. Kod dastlab nofaol: **Kodni faollashtirish** bilan ochiladi; **Kodni bekor qilish** uni qaytmas bekor qiladi. Shundan keyin yangi kod yaratish mumkin. Reload va testni tahrirlash ayni kodni saqlaydi; nusxa test boshqa nofaol kod oladi. Kod holati testni faollashtirish/to‘xtatishdan mustaqil.

Kod serverda shifrlanadi va faqat o'z maktabi adminiga qaytariladi. `TOKEN_SECRET`ni saqlang: uni almashtirishdan oldin kod registri uchun kalit migratsiyasi kerak; aks holda admin API 503 qaytaradi, mavjud kodlar ustidan yozilmaydi. Eski, maktabga biriktirilmagan testga maktabni taxmin qilib kod yaratilmaydi. O'quvchi qisqa maktab IDsi va faol kod bilan kiradi; server kodni shu maktab doirasida tekshiradi.


## 1.1: rollar bilan lokal ishlash

Kirish: `/oqituvchi/kirish.html`. Yangi adminlar login va parolni kiritadi; bosh admin `/bosh-admin/index.html`ga, maktab admini o‘z paneliga yo‘naltiriladi. Bosh admin bootstrap uchun muhitda `SUPER_ADMIN_LOGIN` (3–60 ta lotin harfi/raqam/nuqta/defis/pastki chiziq) va `SUPER_ADMIN_PASSWORD` (6–12 belgi) belgilanadi. Maxfiy qiymatlarni kod/Gitga yozmang; lokal `.env` yoki Netlify Functions muhitidan foydalaning. Bootstrap faqat yangi login hisobini yaratadi; keyin parol hisobning server hashidan tekshiriladi.

Eski login maydoni bo'sh kirish `TEACHER_PASSWORD` orqali ishlashda davom etadi, ammo u faqat maktabga hali biriktirilmagan eski yozuvlarni ko'radi va bosh admin emas. Maktab adminida boshqa maktab/legacy yozuvlariga ruxsat yo'q. Yangi maktablarda qisqa ID va faol umumiy kodli o'quvchi kirishi ishlaydi; eski oqim legacy testlar uchun saqlanadi. Eski egasiz test/natijalar avtomatik biriktirilmaydi.


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
| `TEACHER_PASSWORD` | Boshlang'ich o'qituvchi paroli: 6–12 belgi. Harf, raqam va `_` kabi belgilar qabul qilinadi. Standart parol yo'q. |
| `TOKEN_SECRET` | HMAC imzolash kaliti; kamida 32 tasodifiy belgi. |

Kirish va parolni almashtirish formalarida input ichidagi **ko'z ikonkasini** bosib parolni ko'rsatish yoki berkitish mumkin. Uzunlik serverda ham 6–12 bilan chegaralangan; eski `TEACHER_PASSWORD_MIN_LENGTH` endi ishlatilmaydi va uni Netlify'dan o'chirish mumkin.

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

Ro'yxatli sinf uchun **Sinflar → Shaxsiy kirish kodlari**dan har o'quvchiga faqat o'z kodini bering. Eski ro'yxatlar admin panelida ochilganda kodlar qo'shiladi. Ochiq API roster yoki kodlarni bermaydi. O'quvchi sinf va shaxsiy kodini kiritadi; boshqa brauzer boshlangan urinishni egallay olmaydi. Ro'yxatsiz sinf erkin ism bilan **ochiq mashq** rejimida qoladi — bu shaxsni tasdiqlamaydi.

Har javob lokal saqlanadi, taxminan 1,2 soniya tanaffusdan keyin serverga yuboriladi. UI qurilma va server saqlash holatini alohida bildiradi; joy yetishmasa yolg'on “saqlandi” demaydi. Internet tiklanganda draft yoki yakuniy yuborish avtomatik qayta tekshiriladi. Bitta urinish ikki oynada tahrirlanmaydi.

Muddat tugagach yangi javob qabul qilinmaydi. Keyingi natijalar/tiklash so'rovida oxirgi server nusxasi yakunlanadi; hali serverga yetmagan oflayn javoblar kechikib bahoga qo'shilmaydi. Tiklash uchun imzolangan urinish dalili 7 kungacha ishlaydi, bu test vaqtini uzaytirmaydi. Vaqt sozlanmagan urinishning server muddati 24 soat. Boshlanmagan sahifani internet yo'q paytda yuklash uchun offline PWA qo'shilmagan.

## Aiken formati

```text
Savol matni?
A. Birinchi variant
B. Ikkinchi variant
ANSWER: B
```

UTF-8 `.txt`; savollar orasida bo'sh qator; 1–200 savol, 2–6 ketma-ket A–F variant. `JAVOB: B` ham qabul qilinadi. Parser faqat serverda: preview `POST /api/admin/tests/preview` orqali olinadi. [Namuna](samples/namuna-test.txt) repozitoriydagi `samples/` papkasida saqlangan; saytdagi alohida namuna yuklash fayli olib tashlangan.

## Zaxira va eski ma'lumotlar

Sozlamalarda zaxirani bitta JSON qilib yuklab oling. Tiklash faylni avval tekshiradi, keyin ID bo'yicha qo'shadi yoki yangilaydi. Bir nechta yozuvni tiklash umumiy tranzaksiya emas: uzilish bo'lsa shu zaxirani qayta tiklash mumkin. Parol, admin sessiyalari, tugallanmagan urinishlar va token kaliti eksport qilinmaydi. Sinf zaxirasida shaxsiy o'quvchi kodlari bor — faylni faqat ishonchli joyda saqlang. Import limiti 4 MB.

`tests` va `results` omborlari saqlangan. `grades` asosidagi eski testlar o'qishda virtual sinflarga moslashtiriladi. Eski natijalarda mavjud ball saqlanadi; saqlanmagan javoblar/sarflangan vaqt o'ylab topilmaydi. Eski cheklanmagan testlarga moslik uchun boshlang'ich limit 100 urinish.

## Netlify'ga joylash

1. Shu repozitoriyni avvalgi Netlify loyihasiga ulang. Mavjud Blobs yozuvlari kerak bo'lsa yangi site yaratmang.
2. `netlify.toml` build uchun `npm run build`, Node 22, Publish directory `public` va Functions directory `netlify/functions`ni belgilaydi.
3. Netlify muhit sozlamalarida `TEACHER_PASSWORD` va `TOKEN_SECRET`ni Functions uchun kiriting.
4. `.env`, `.netlify`, `node_modules` va `artifacts`ni yuklamang; Git orqali deploy qiling. Oddiy drag-and-drop faqat statik fayllar bilan backendni joylamaydi.
5. Joylashdan oldin lokal ``npm run build``ni bajaring va asosiy sahifalarni tekshiring.
6. O'quvchilar Netlify akkauntisiz kirishi uchun Project configuration → General → Visitor access → Project visibility `Public` bo'lsin. Eski tariflarda Password Protection sozlamasini tekshiring. Bu sozlama panelning o'z parolini olib tashlamaydi.

Admin sessiyasi 8 soat, **Chiqish** server sessiyasini ham bekor qiladi. Parol panelda almashtirilgach scrypt hash Blobs sozlamasida turadi; muhitdagi qiymat faqat boshlang'ich sozlash uchun qoladi. Unutilgan parolni site egasi `settings` omboridagi `auth` yozuvini o'chirib boshlang'ich parolga qaytarishi mumkin; bu eski tokenlarni qayta yaroqli qilmaydi. `TOKEN_SECRET`ni almashtirish barcha eski imzolarni bekor qiladi. O'quvchi kaliti faqat yakunlangach va amaldagi ruxsat yoqilganida qaytariladi; avval ko'rsatilgan yoki ko'chirib olingan javoblarni orqaga qaytarib bo'lmaydi.
