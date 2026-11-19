# Netlify bazasining lokal nusxasi

`npx netlify-cli login` bilan loyiha egasining hisobiga kiriladi. So'ng
`node scripts/copy-netlify-local.mjs --site-id <site-id>` ishga tushiriladi.
Mavjud `.env` almashtirilmaydi. Nusxalash skripti Netlify'da faqat o'qish
amallarini bajaradi; omborlar va barcha yozuvlar metadata bilan olinadi.
Ko'chirish vaqtida production yozuvlari o'zgarishi mumkin: bu butun baza
uchun bitta atomik snapshot emas. Har olingan yozuvning lokal nusxasi SHA-256
bilan tekshiriladi; yo'qolgan yozuv nusxalashni xato bilan to'xtatadi.

Asl nusxa va manifest `.local/snapshots/<vaqt>/` ichida saqlanadi. Lokal
server alohida `.local/databases/<vaqt>/` ishchi nusxasini o'zgartiradi.
`.env` ichidagi `NAZORAT_LOCAL_DATA` shu katalogni belgilaydi. Test kodlari
mosligi uchun production `TOKEN_SECRET` va shifrlash kalitlari saqlanadi;
admin sessiyalarini imzolash uchun yangi lokal `ADMIN_SESSION_SECRET`
yaratiladi. Hisoblar mavjud parollari bilan nusxalanadi. Maxfiy qiymatlar
terminalga chiqarilmaydi; `.env` va `.local/` Gitdan chiqarilgan.

`npm run dev` tanlangan katalog bilan serverni `http://localhost:3000`
manzilida faqat loopback interfeysida ochadi. `server.mjs` repositories
qatlamidagi lokal omborni boshlaydi. `storage-provider.mjs` development
uchun disk nusxasini yoki avvalgi xotira omborini tanlaydi; production
doimiy Netlify Blobs'dan foydalanadi. Disk ombori mavjud `@netlify/blobs/server`
emulyatori orqali etag, metadata va shartli yozuv qoidalarini saqlaydi.

Lokal adapter tekshiruvi: JSON yozish/o'qish, `onlyIfNew`, noto'g'ri etagli
`onlyIfMatch` va omborni yopib qayta ochganda yozuvning saqlanishi o'tdi.
Haqiqiy production nusxasini olish uchun Netlify login tasdig'i talab qilinadi.
