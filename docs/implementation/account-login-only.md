# Umumiy teacher parolini olib tashlash

2026-11-11, feature/account-login-only. Foydalanuvchi topshirig'i bilan
TEACHER_PASSWORDga asoslangan eski loginsiz admin kirishi olib tashlandi.

## O'zgarish

- auth-service: eski bootstrap/login/authConfig yo'q. Avtorizatsiya faqat
  accountLogin va jti bilan account-service orqali; legacy tokenlar 401.
- Login route faqat accountLoginni chaqiradi, router legacy adminni qabul qilmaydi.
- Logout server sessiyasini o'chirishda, parol almashtirish esa joriy parolni
  tekshirib hisob versiyasini aylantirishda davom etadi.
- settings-repo.mjs va login-policy.mjs faqat eski kirishga tegishli bo'lib,
  endi import qilinmagani uchun o'chirildi. Accounts va recovery omborlari qoladi.
- Login maydoni brauzerda majburiy, eski bo'sh qoldirish taklifi olib tashlandi.
  Parol maxlength backendga mos 128 qilindi (oldin 12 edi).
- Lokal .env va .env.example ichidan TEACHER_PASSWORD olib tashlandi; lokal
  maxfiy fayl Gitga kiritilmadi. README va amaldagi deploy yo'riqnomasi yangilandi.
- Ma'lumotlar, eski settings/auth yozuvlari yoki hisoblar o'chirilmadi.
  Legacy ma'lumotning backup scope'i saqlandi, u admin login vakolati emas.

## Tekshiruv

TEACHER_PASSWORDsiz npm run dev 8898 da ishga tushirildi. Lokal API orqali:

- Bosh admin va ikkita yangi maktab admini login-parol bilan kirdi.
- Loginsiz va bo'sh loginli so'rovlar 400; to'g'ri imzolangan accountLoginsiz
  eski token 401 oldi.
- Maktab admini boshqa maktab sinfiga 404, bosh admin endpointiga 403 oldi.
- Noto'g'ri joriy parol 403; to'g'ri parol almashgach eski parol va eski
  sessiya 401, yangi parol bilan kirish 200 oldi.
- Logoutdan keyin server sessiyasi bilan qayta kirish 401 oldi.
- Chrome'da login required, 12 belgidan uzun hisob paroli bilan panelga
  kirish va xatosiz sahifa ishlashi tekshirildi.

Recovery adapteri lokal mock getStore bilan tekshirildi: boshlang'ich
sessiya ishlaydi; tiklash yangi password hash/version va ikki audit yozuvi
yaratadi; eski parol va eski sessiya yaroqsiz. Tashqi Netlify CLI recovery
production hisobida bajarilmadi.

npm run check va npm run build: PASS. Sinovlar .local/ ichida, tests/
yaratilmadi. Masofaviy environment sozlamalari o'zgartirilmadi, deploy/main
birlashtirish bajarilmadi. Eski TEACHER_PASSWORD masofada qolgan bo'lsa ham
yangi kod uni o'qimaydi.
