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

`ADMIN_SESSION_SECRET` admin tokenlariga, `TEST_CODE_ENCRYPTION_KEY` test kodlarini yangi shifrlashga mo'ljallangan; ikkalasi kamida 32 belgi. Bo'sh bo'lsa eski `TOKEN_SECRET` moslik uchun ishlaydi. `ADMIN_SESSION_PREVIOUS_SECRET` kalit almashish paytida eski admin tokenlarini 8 soatlik sessiya muddati o'tguncha qabul qiladi. `TEST_CODE_ENCRYPTION_KEY_PREVIOUS` mavjud v2 shifrlangan kodlarni boshqariladigan moslik davrida o'qiydi. Yangi yozuvlar joriy test-kod kalitidan foydalanadi. Keyingi aylantirishdan avval eski registrlarni yangi kalit bilan qayta shifrlash migratsiyasi kerak; hozir avtomatik migratsiya skripti yo'q. Noto'g'ri yoki yetishmagan kalitda restore rad etiladi va mavjud registr ustidan yozilmaydi.

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
