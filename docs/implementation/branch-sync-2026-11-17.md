# Tarmoqlarni birlashtirish: 2026-11-17

Foydalanuvchi GitHub, main va lokal ishlarni birlashtirish, zid joylarni tuzatish va lokal ishga tushirishni so'radi.

Boshlanish: origin/main va main b63924e, feature/school-question-library b687bfe. Fetchdan keyin GitHubda faqat main mavjud; boshqa remote branchlar yo'q. Lokal branchlarning boshlang'ich SHAlari .local/branch-sync-2026-11-17-refs.txt ichida saqlangan.

## Qarorlar

- Savollar bazasining beshta yangi commiti mainga fast-forward orqali kiritildi.
- fix/p1-19-secret-isolation haqiqiy merge qilindi: student-code generation/backfill o'chirildi, avval saqlangan kodlar qo'llovi saqlandi; admin sinflarini GET qilish endi yozmaydi. Alohida kalitlar, previous-key tekshiruvi va eski shifrlash kalitidan migratsiya qo'shildi.
- Strict rejim STRICT_SECRET_ISOLATION=true bilan yoqiladi. Defaultda mavjud TOKEN_SECRET lookup/admin/encryption fallbacki saqlanadi: foydalanuvchining mavjud .env yoki production registry yozuvlari avtomatik o'zgartirilmaydi. Strict rejimda to'rtta kalit tekshiriladi; ALLOW_LEGACY_LOOKUP_KEY faqat vaqtinchalik registry ko'prigi. Bu eski tarmoqdagi unconditional strict guardga nisbatan ongli moslik qarori.
- Login konflikti amaldagi accountLogin foydasiga hal qilindi; TEACHER_PASSWORD va legacy admin autentifikatsiyasi qaytarilmadi.
- Router storage metrics, DTM section metama'lumotlari, bank permission guardlari va yangi /admin/tests/preview endpointi saqlandi.
- Eski tests/, test skriptlari va ularga tegishli AGENTS.md talablari qaytarilmadi: joriy foydalanuvchi ko'rsatmasi ustun. .gitattributes va .prettierignore saqlandi.
- backup/pre-github-upload-a81af59 eski public school ID, school/account isolation va test-code/wizard implementatsiyasidir; hozirgi kod shu imkoniyatlarning keyingi rivojlangan versiyasini ishlatadi. U faqat tarix merge parenti sifatida olinadi, eski parallel kod bilan hozirgi oqimlar almashtirilmaydi.
- Boshqa lokal feature/fix branchlar tegishli merge parentlarining ajdodi; ular ham yakuniy main tarixida. Stashlar va backup refi tarixiy nusxa sifatida saqlanadi, avtomatik pop/delete qilinmaydi.
- *.env lokal nusxalari .gitignorega qo'shildi; haqiqiy sirlar va .local/.netlify Gitga kirmaydi.

## Tekshiruv

- npm run check va npm run build o'tdi; merge markerlari va JS/MJS sintaksisi tekshirildi.
- Haqiqiy router/services/repositories, xotira Blobs: 15 mavzu, takror import/CAS, kvotalar/noyoblik, boy DOCX, markerlar, alohida kalit, backup preview/restore, maktab egaligi va 20/20 idempotent baholash o'tdi.
- Bank tariflari, boshqa maktabga kirishni rad etish, o'chirilgan shared test kelib chiqishi, muddati tugagan obuna va avvalgi faol draft/submit tekshirildi.
- Strict kalit konfiguratsiyasi, admin previous key, yetishmagan current keyda 503, server logout, parol o'zgarganda eski tokenning bekor bo'lishi, test-code encryption rotation/AAD va legacy moslik o'tdi.
- Chrome: qoralama tuzish/saqlash, miqdor va jami chegarasi, qidiruv, holat filtri, sahifalash chegaralari, mavzuni chiqarish; 390/965/1440px light/dark, overflow va JS xatosi yo'q.
- npm run dev --offline lokal Netlify serveri http://localhost:8888 manzilida ishga tushdi. Netlify CLI global config uchun kengaytirilgan ruxsat talab qildi. Alohida Netlify production deploy buyrug'i bajarilmaydi; GitHub main push hostingning mavjud avtomatik buildini ishga tushirishi mumkin.

Bir martalik vositalar .local/merge-library-verify.mjs, .local/merge-security-verify.mjs va .local/library-redesign.mjs; doimiy tests/ qayta yaratilmagan, real maktab bazalariga sinov yozuvi kiritilmagan.
