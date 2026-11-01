# Netlify deploy tekshiruvi

## Git va tasdiq holati

- Repository: `https://github.com/alijonoveldor791-spec/nazorat-test.git`.
- Lokal tarmoq: `main`; kuzatuvchi: `origin/main`.
- Tekshiruv boshida lokal va GitHub main: `aba5b24814dd42659d1bfd4adb0f495124ada472`.
- Foydalanuvchi tayyor o'zgarishlarni `main`ga commit/push qilish va Netlify'ni yangilashga tasdiq berdi.

## Topilmalar va tuzatishlar

| Qayerda | Topilma | Natija |
| --- | --- | --- |
| Netlify visitor access | Bosh sahifa, o'qituvchi sahifasi va API HTTP 401, HTML `Login Redirect` qaytardi. So'rovlar ilovaga yetib bormayapti. | Tashqi sozlama: o'quvchilar uchun Project visibility `Public` bo'lishi kerak. CLI hisobga kirmagan; bu sozlama o'zgartirilmadi. |
| `netlify.toml` | Deploydan avval test/check buyrug'i belgilanmagan. | `npm test && npm run build` qo'shildi; Node 22 tanlandi. `public` va `netlify/functions` saqlandi. |
| `package.json`, lock | Node `>=22` kutubxona talab qiladigan `>=22.12.0`dan past versiyalarga ruxsat berardi. | Minimum dependency talabi bilan moslandi. |
| `.gitignore` | Faqat `.env` chiqarilgan; `.env.local` yoki `.env.production` tasodifan qo'shilishi mumkin edi. | `.env*` chiqarildi; faqat qiymatlari bo'sh `.env.example`ga ruxsat qoldi. |
| `scripts/helpers.mjs` | TEST_BASE_URL orqali yozadigan sinovlarni production'ga yo'naltirish mumkin edi. | Faqat localhost, 127.0.0.1 va ::1 qabul qilinadi. Jonli sayt uchun alohida GET smoke tekshiruvi qo'shildi. |
| `scripts/audit-browser.mjs` | Audit kerakli test variantini kutardi, lekin uni tanlamasdi. Bir nechta test bo'lsa, vaqtsiz boshqa test boshlanishi mumkin edi. | Test ikkala boshlash oqimida ID bilan aniq tanlanadi. |
| Parol formasi | Matnli ko'rsatish tugmasi input yonida ortiqcha joy egallardi. | Input ichiga ko'z ikonka tugmasi qo'yildi; Enter/Space, mobil ekranlar, light/dark va ikkala sozlama maydoni tekshirildi. |
| `public/namuna-test.txt` | Ish davomida namuna yuklab olish havolasining fayli topilmadi va check to'xtadi. | Mavjud `samples/namuna-test.txt` nusxasidan tiklandi; asl Git nusxasi bilan bir xil. |

## Tekshiruv natijalari

Yozadigan sinovlar alohida TEMP loyiha, yangi tasodifiy parol/kalit va mustaqil lokal Blobs omborida bajarildi. Production'da faqat GET so'rovlari ishlatildi. Mavjud loyiha sinflari, testlari va natijalari o'chirilmagan.

Takroriy audit so'rovlarida lokal login rate limit 429 bilan ishladi. Parol brauzer sinovi himoyani o'zgartirmasdan yana bir yangi test omborida qayta bajarildi va to'liq o'tdi.

- Unit: 54/54, jumladan production manzilini yozadigan sinovlardan bloklash.
- `npm run check` / build: o'tdi.
- `netlify build --offline`: production kontekstida unit/check va `api.mjs` Functions bundling o'tdi.
- `npm run verify`: 9 oqim o'tdi; Aiken import, sinf/test, 20/20 topshirish, panel natijasi va zaxira tiklash.
- API audit: 7 tekshiruv o'tdi; yopiq roster, token/logout, javob kaliti, muddat, parallel topshirish va rate limit.
- Auth audit: 3 tekshiruv o'tdi; parol aylantirish va server logout.
- Asosiy brauzer sinovi: test yuklash, ishlash, panel natijasi, taymer; 9 responsive/a11y holati va 0 JS xato.
- Qo'shimcha brauzer auditi: aniq test tanlash tuzatilgach 8 tekshiruv o'tdi; offline, sekin internet, XSS va ikki oyna.
- Parol brauzer sinovi: ko'rsatish/berkitish, 320/390/1280 px va 6/12 belgili parollar bilan kirish.
- Yangi GET smoke sinovi lokal serverda: 6/6; public sahifalar/API 200, yopiq admin 401 JSON, `/.env` 404.
- Jonli sayt smoke sinovi: 0/6; barchasi Netlify `Login Redirect` 401 bilan cheklangan. Bu backenddagi parol xatosi deb baholanmadi.
- Git kuzatayotgan fayllarda joriy parol yoki token qiymatlari topilmadi; `.env.example` qiymatlari bo'sh.

## Netlify'da tekshiriladigan sozlamalar

1. Project configuration → General → Visitor access → Project visibility: `Public`. Eski tariflarda Password Protection bo'limi bo'lishi mumkin. O'qituvchi panelining o'z autentifikatsiyasi saqlanadi.
2. Project configuration → Developer settings → Continuous deployment → Repository: aynan `alijonoveldor791-spec/nazorat-test`, production branch `main`. Builds yoqilgan bo'lsin. Yangi site yaratish yoki mavjud omborlarni tozalash talab qilinmaydi.
3. Functions muhitida TEACHER_PASSWORD 6–12 belgi va TOKEN_SECRET kamida 32 belgi bo'lsin. Qiymatlar Gitga kiritilmaydi. Avval saqlangan parol muhit qiymati bilan avtomatik almashtirilmaydi.
4. GitHub commit statuslari va check-runs javoblari bo'sh chiqdi; shu sabab avtomatik deploy ulanganini hozircha tasdiqlab bo'lmaydi. Bo'sh statusning `pending` qiymati faol deploy borligini anglatmaydi.
5. Tasdiq olindi. Commit/pushdan keyin Netlify deploy holati va `npm run test:deploy` qayta tekshiriladi.

Rasmiy yo'riqnomalar: [Visitor access](https://docs.netlify.com/manage/security/secure-access-to-sites/password-protection/), [Git repository ulash](https://docs.netlify.com/build/git-workflows/repo-permissions-linking/).

## Keyingi kirish tekshiruvi

Sayt qayta tekshirilganda kirish sahifasi 200 qaytardi va parolni ko'rsatish tugmasi mavjud edi. Foydalanuvchi belgilagan parol bilan bitta login so'rovi 401 JSON `Parol noto'g'ri.` qaytardi. Bootstrap sozlamasi yaroqli, ammo amaldagi Blobs paroli shu qiymatga mos emas. Muhitdagi parol saqlangan schema-2 yozuvni avtomatik almashtirmasligi kodda tasdiqlandi.

Sinflar/testlar/natijalarni o'chirmasdan faqat `settings/auth`ni yangi hash va sessiya versiyasi bilan almashtirish uchun Git'dan chetlatilgan `.local/teacher-password-reset.json` tayyorlandi. Ichida ochiq parol yoki token yo'q. Default Netlify CLI ham hisobga kirmagan; jonli ombor yozuvi hozircha o'zgartirilmadi. Hisobga kirilgach mavjud saytga ulash, eski auth yozuvini maxfiy lokal zaxiraga olish, tayyor yozuvni qo'llash va loginni qayta tekshirish kerak.

## Push oldidan tasdiqlangan ulanish

Foydalanuvchi GitHub va Netlify'ni yangilashga tasdiq bergach, default CLI hisobga kirgani aniqlandi va lokal loyiha mavjud `nazorat-test` saytiga ulandi. Netlify API `github` provider, `alijonoveldor791-spec/nazorat-test` repository, `main` production tarmog'i va `stop_builds: false`ni tasdiqladi. Oxirgi published deploy `aba5b24` commitidan `ready` holatda. Demak repository orqali avtomatik build yoqilgan; keyingi push natijasi alohida tekshiriladi.
