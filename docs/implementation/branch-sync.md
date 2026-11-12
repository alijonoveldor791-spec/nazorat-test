# Git va GitHub tarmoqlarini bir xil qilish

Sana: 2026-11-12. Foydalanuvchi hisobotdagi barcha ishlarni barcha lokal va
GitHub branchlarga birlashtirishni so'radi; main va push shu topshiriqqa kiradi.

## Tarkib

- Sinf/guruhlar, blok test, Word bo'limlari va savollar xaritasi.
- Karta/ro'yxat ko'rinishlari, filtrlar va tanlab o'chirish.
- DTM 189: 31/21/11 birliklar, tarkib validatsiyasi va grading snapshoti.
- Tugagan natijani ochish/yopish va qayta yangilash; fanlar kesimidagi ball.
- Haqiqiy XLSX, guruh nomli sarlavha/fayl, reyting va qatnashmaganlar.
- Yangi blok/importda DTM default; ota ismisiz kirish va tungi hover.
- TEACHER_PASSWORDsiz loginli admin, server logout va sessiya revokatsiyasi.
- Hisobotda qayd etilgan yuklama skriptlari va repository optimizatsiyalari.

## Birlashtirish qarorlari

feature/dtm-189-complete asos qilib olindi: kechagi sinf/guruh hamda bugungi
DTM/Excel o'zgarishlari unda bor. feature/account-login-only oddiy merge bilan
qo'shildi; arxitektura hujjatining ikkala qismi saqlandi.

origin/feat/word-docx-import eski parallel implementatsiya: rich envelope,
muqobil parser va alohida attempt-start/completion modeli bor. Hisobotdagi
amaldagi boy HTML importi hamda DTM snapshotiga bu muqobil model qo'shilmadi.
Uning tarixi ours-strategy merge parent sifatida saqlandi. Shuning uchun
barcha boshlang'ich branch HEADlari yakuniy tarixning ajdodi bo'ladi, lekin
eski alternativaning har bir kodi faol implementatsiyaga aylantirilmaydi.
Force push yoki tarixni o'chirish talab qilinmaydi.

## Bir xil qilinadigan 9 tarmoq

- main
- codex/student-test-responsive
- feat/word-docx-import
- feature/account-login-only
- feature/classes-groups-block-tests
- feature/dtm-189-complete
- feature/dtm-scoring
- hardening
- perf/500-active-students

Lokal refs compare-and-swap tranzaksiya bilan, remote refs bitta atomic push
bilan yangilanadi. Yakunda ls-remote va lokal refs SHAlari solishtiriladi.
Boshlang'ich ref nusxasi va tekshiruv artefaktlari .local/ ichida qoladi.

## Lokal tekshiruv

- npm run check va npm run build: PASS.
- 191 ta JS/MJS fayl node --check orqali o'tdi.
- TEACHER_PASSWORDsiz root va maktab logini, majburiy login, eski tokenni
  rad etish, parol almashishi, logout va maktablararo ruxsatlar o'tdi.
- Recovery adapteri mock saqlash bilan password/version/audit va eski
  sessiyani bekor qilishga tekshirildi; production recovery bajarilmadi.
- Haqiqiy 90 savolli DOCX -> save -> start -> submit -> admin result o'tdi.
- 90/189, 59/119.9, 8/8.8, wrong/0 va empty/0 hisoblari o'tdi.
- Variant shuffle, savollar tartibi mustaqilligi, eski grade, snapshot,
  takroriy/parallel submit va bittadan natija tekshirildi.
- Tungi hover, ota ismisiz wizard, ko'rinish sozlamasi va Excel brauzer
  tekshiruvlari birlashtirilgan lokal serverda PASS. Excel ZIP/openpyxl
  orqali guruh sarlavhasi, numeric ball va qatnashmagan qatorga tekshirildi.

Kecha saqlangan lokal tokenlar muddati tugagani uchun dastlabki UI sinovi
401 oldi; yangi disposable hisob/token bilan qayta tekshiruv PASS. Bu test
ma'lumotining muddati, yangi auth ruxsatini chetlab o'tish qo'shilmadi.

## Cheklov

500 faol o'quvchi sig'imi hali tasdiqlangan emas; yuklama rejasidagi
bosqichlar avvalgidek qoladi. Eski natijalar qayta hisoblanmaydi. .env,
.netlify, tokenlar va lokal artefaktlar Gitga kiritilmaydi. Alohida deploy
buyrug'i bajarilmaydi; GitHubdagi main yangilanadi.
