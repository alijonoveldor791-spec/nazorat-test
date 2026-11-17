# Zaxira, tiklash va admin xavfsizligi

## Zaxira v3

`GET /api/admin/backup` maktab adminining server sessiyasidan `sourceSchoolId` oladi. Faylga sinflar (ro'yxat kodlari bilan), testlar, natijalar va maktab bo'lsa shifrlangan test-kod registri kiradi. Admin/parol hashlar, sessiyalar, server kalitlari va faol urinishlar kiritilmaydi. Sinf ro'yxatidagi o'quvchi kirish kodlari shaxsiy ma'lumot hisoblanadi: faylni faqat cheklangan, shifrlangan joyda saqlang. AES-GCM kod registri kalitsiz qayta ochilmaydi. Oddiy SHA-256 preview bog'lash uchun; u manba yoki imzo haqiqiyligini tasdiqlamaydi.

V3 envelope `format`, `version`, `createdAt`, `sourceSchoolId`, `includes` va `excludes` maydonlarini beradi. Maktab admini faqat o'z identifikatoriga teng v3 faylini tiklaydi. Legacy admin faqat maktabsiz v2 yoki `sourceSchoolId: null` v3 faylini tiklay oladi. V2 faqat legacy moslik uchun; maktablararo ko'chirish endpointi yo'q. Import 4 MB so'rov chegarasiga, sinf/test/natija soni limitlariga va server model validatsiyasiga bo'ysunadi. Savol ID, sinf bog'lanishlari, natija balli va takroriy ID tekshiriladi. Test rasmlari/content AST hozirgi saqlash modelida yo'q.

## Tiklash oqimi

1. `POST /api/admin/restore-preview` faylni to'liq tekshiradi, IDlar bo'yicha qo'shish/yangilash sonini hisoblaydi va yozmaydi. Preview ma'lumoti server Blobs'da 4 MB so'rov bilan birga saqlanadi; SHA-256 faylni previewga bog'laydi.
2. Tasdiqlash previewId va fileHash yuboradi. Server maktab ma'lumotlarining joriy izini solishtiradi; o'zgarish bo'lsa yangi preview talab etiladi. Maktab darajasidagi 5 daqiqalik qulf admin va o'quvchi yozuvlarini, shu jumladan parallel restore amallarini bloklaydi. Har tiklash yozuvi qulf muddatini yangilaydi; jarayon uzilsa qulf 5 daqiqadan so'ng bo'shaydi. Boshqa maktab previewdan foydalana olmaydi.
3. Yozishdan oldin joriy maktab eksporti backup-archives omborida saqlanadi. Faol urinishlar bo'lsa tiklash rad etiladi. Har yozuv xatosi hisobotga kiritiladi; takroriy so'rov tugallangan preview hisobotini qaytaradi. Uzilish yoki qisman natijadan keyin faylni qayta tanlab yangi preview oling; fayl xeshi bir xil bo'lsa oldingi operation ID davom etadi. Blobs ko'p yozuvni tranzaksiyada bajarmaydi, shu sabab qisman natija mumkin. Himoyalangan nusxani sozlamalardan yuklab olib alohida fayl sifatida tiklash mumkin.

## Parol va kalitlar

Parol siyosati backend va browserda 6-128 belgi; scrypt hash formati saqlanadi. Parol almashtirish joriy parolni so'raydi va admin sessiya versiyasini yangilab eski sessiyalarni bekor qiladi. Mavjud login limitlari saqlangan.

`TOKEN_SECRET` attempt imzosiga, `ADMIN_SESSION_SECRET` admin tokenlariga, `TEST_CODE_ENCRYPTION_KEY` yangi AES-GCM yozuvlariga, `TEST_CODE_LOOKUP_KEY` registry identity/digestga tegishli. API va scheduled backup ish boshlashida to'rttasi ham kamida 32 belgili va turlicha bo'lishini tekshiradi; noto'g'ri configurationda API 503 beradi, previous admin key bu xatoni yashirmaydi. Secret qiymati xatoga kiritilmaydi.

Faqat `NETLIFY_DEV=true` va `ALLOW_LEGACY_SECRET_FALLBACK=true` birga bo'lsa yetishmagan kalitlar `TOKEN_SECRET`ga fallback qiladi. Productionda bu flagning o'zi fallback ochmaydi. `.env.example`da default false; haqiqiy `.env` ushbu tuzatishda o'zgartirilmagan. Local opt-in productionga ko'chirilmasin.

`ADMIN_SESSION_PREVIOUS_SECRET` faqat imzo tekshiruvidagi 401dan keyin eski admin tokenini o'qiydi; server session/version/logout tekshiruvi saqlanadi. `TEST_CODE_ENCRYPTION_KEY_PREVIOUS` eski AES yozuvini o'qish uchun aniq beriladi, jumladan TOKEN_SECRET bilan shifrlangan v1 format. Production v1 o'qishida yashirin TOKEN_SECRET fallback yo'q; v1 uchun oldingi encryption key kerak. Yangi production yozuvlar v2 va current encryption key bilan yaratiladi.

### Mavjud site uchun nazoratli kalit ajratish

1. Production secret/data'ni ushbu topshiriqda o'zgartirmang. Operator avval site, offsite backup, registry `keyId` va v1/v2 encryption metadata'ni maxfiy qiymatsiz tekshiradi. Bu runbook deployning old sharti; kalitlar sozlanmasdan yangi kod APIga 503 qaytaradi.
2. Mavjud TOKEN_SECRETni o'zgartirmasdan `TEST_CODE_LOOKUP_KEY`ga ayni qiymatni alohida saqlang va vaqtincha `ALLOW_LEGACY_LOOKUP_KEY=true` belgilang. Bu faqat lookup/attempt jufti uchun explicit migratsiya ko'prigi; boshqa takroriy current kalitlar rad etiladi. Yangi site uchun to'rt mustaqil key va ikkala flag false.
3. Yangi mustaqil admin/encryption current key bering. Eski admin imzosi uchun `ADMIN_SESSION_PREVIOUS_SECRET`ga oldingi admin keyni (eski fallback ishlatilgan bo'lsa oldingi TOKEN_SECRETni), v1/v2 ciphertext uchun `TEST_CODE_ENCRYPTION_KEY_PREVIOUS`ga haqiqiy eski encryption keyni bering. Joriy + bitta previous key yetmaydigan bir nechta tarixiy avlod bo'lsa avval izolyatsiyalangan nusxada konsolidatsiya qiling; eski keyni ko'r-ko'rona almashtirmang.
4. Alohida lokal/staging nusxada registry `keyId`/digest/rezervlar o'zgarmasligi, mavjud kod decrypt/resolve, oldingi admin session/logout, owner/draft/resume/submit va export/preview/restore'ni tekshiring. Keylar saqlangachgina boshqariladigan deploy qiling. Bu kod hech bir production registrini avtomatik qayta yozmaydi.
5. Admin previous keyni oxirgi eski tokenning 8 soati o'tib va logout/version dalillari tekshirilgach olib tashlang. Encryption previous key faqat barcha eski ciphertext hamda saqlangan backup avlodlari qayta shifrlangan yoki alohida vault recoveryga ko'chirilgach olinadi. Re-encryption uchun avtomatik CLI hali yo'q; keyingi tasdiqlangan migration registry CAS, dry-run va round-trip bilan bajarilishi kerak.
6. Lookup keyni barqaror saqlang: u o'zgarsa tarixiy `reserved` digestlar va `keyId` mos kelmaydi. TOKEN_SECRETni almashtirishdan oldin barcha eski attemptlarning recovery muddati tugashi kerak (muddat + 7 kun; vaqt limitsiz urinish odatda 24 soat + 7 kun). Shundan keyin yangi TOKEN_SECRET bilan lookup eski, mustaqil qiymatda qoladi va `ALLOW_LEGACY_LOOKUP_KEY=false` qilinadi. Faqat flagni o'chirish teng kalitlar qolganida 503 beradi. Lookup rotation bu runbookda bajarilmaydi; bir tomonlama eski digestlarni qayta hash qilish mumkin deb taxmin qilmang.

Production sirlarini o'zgartirmang. Lokal dry-run uchun alohida `.env` va yangi lokal Blobs muhitidan foydalaning: joriy/oldingi kalitlarning mavjudligini va test-kod registry IDlarini tekshiring, so'ng alohida nusxada export/preview/restore bajaring. Production kalit almashinuvi kalitlarni secret manager'da sozlash, eski kalitni vaqtincha previous sifatida berish, alohida muhitda tiklashni tekshirish, so'ng sessiya muddatidan keyin eski kalitni olib tashlashni talab qiladi.

### Loyiha egasi admin parolini tiklashi

`npm run recover:admin` avval faqat aniq `--site-id` va `--login`dagi hisobni ko'radigan dry-run bajaradi. Netlify loyiha egasi Personal Access Tokenni maxfiy muhit o'zgaruvchisi `NETLIFY_AUTH_TOKEN` sifatida beradi; terminal historyga yozmang. Apply rejimi site IDni qayta kiritishni, yangi parolni yashirin terminal inputida yozishni talab qiladi:

```powershell
$secure = Read-Host 'Netlify token' -AsSecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
  $env:NETLIFY_AUTH_TOKEN = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  npm run recover:admin -- --site-id 'SITE_ID' --login 'admin-login'
  npm run recover:admin -- --site-id 'SITE_ID' --login 'admin-login' --apply
} finally {
  Remove-Item Env:NETLIFY_AUTH_TOKEN -ErrorAction SilentlyContinue
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  $secure.Dispose()
}
```

Site IDni Netlify Project configuration, General, Project information bo''limidan oling. Buyruqlar tokenni historyga yozmaydi; token vaqtincha process muhiti va xotirada turadi. Tiklash scrypt hashni o''zgartiradi, hisob versiyasini aylantirib eski sessiyalarni bekor qiladi va maktab blok holatini o''zgartirmaydi. --apply bajarilsa production account Blobs yozuvi o''zgaradi; bu topshiriqda skript ishga tushirilmagan.

## Audit va avtomatik zaxira

`audit-log` server omboriga admin POST amallari, kirish muvaffaqiyati/xatosi, backup eksporti va restore natijasi yoziladi: UTC vaqt, actor, maktab, amal/obyekt IDsi, natija va zarur bo'lsa HTTP holati. Parol, token, zaxira body yoki maxfiy kod yozilmaydi. Audit repository faqat server modulidan chaqiriladi; admin HTTP marshrutlari yo'q.

Netlify Scheduled Function har kuni 02:00 UTC da maktab va legacy ma'lumotlari uchun arxiv yaratadi. Har maktab nusxasi alohida Blobs yozuvi bo'lib saqlanadi; ish holati, yaratilgan nusxalar va xatolar soni qayd etiladi. Settings sahifasida maktab admini faqat o'z arxivlarini ko'rib yuklaydi. Schedule faqat publish qilingan deployda ishlaydi; lokal Netlify Dev timer yo'q, qo'lda Functions panelidan Run now yoki netlify functions:invoke daily-backup bilan tekshiriladi. Scheduled Function 30 soniya bilan cheklangan, katta ish qisman tugallanmay qolishi mumkin; holat yozuvi progressni ko'rsatadi.

Avtomatik arxivlar shu Netlify Blobs site ichida saqlanadi va site/account yo'qolishidan himoya qilmaydi. Saqlash muddati belgilanmagan; nusxalar avtomatik o'chirilmaydi. Production egasi Netlify tashqarisidagi shifrlangan object storage va retention muddatini alohida sozlashi kerak. Birinchi staging tiklashi tekshirilmaguncha tozalashni yoqmang.

## Tekshiruv qaydi

`npm run check` va `npm run build` tuzilma tekshiruvlari. Ular Blobs, cross-school, parallel tiklash, kalit almashish yoki brauzer oqimini funksional tasdiqlamaydi. Ushbu muhitdagi joriy bosqichda bajarilgan va bajarilmagan funksional tekshiruvlar asosiy topshiriq yakuniy javobida alohida sanaladi; olib tashlangan `tests/` va audit skriptlari qayta yaratilmaydi.

2026-11-17 merge mosligi: STRICT_SECRET_ISOLATION berilmagan yoki false bo'lsa eski TOKEN_SECRET fallback va registry digesti saqlanadi. Strict rejimni faqat to'rtta kalit va oldingi shifrlash kaliti tayyor bo'lgach yoqing. Mavjud registry uchun TEST_CODE_LOOKUP_KEY eski TOKEN_SECRET qiymatini saqlashi va vaqtinchalik ALLOW_LEGACY_LOOKUP_KEY=true bo'lishi kerak; lookup kalitini tasodifiy almashtirmang. Yangi saytda to'rtta mustaqil kalitdan foydalaning.
