# Production tayyorgarligi: 0-bosqich

Sana: 2026-11-06. Doira: xavfsiz ishchi nusxa, test ruxsati va sifat buyruqlari.

## Branch va oldingi ish

- Asl worktree: `C:/Users/user/Desktop/Nazorat-test`, branch `fix/p1-19-secret-isolation`.
- №15 allaqachon `8e05cdc` (`fix: stop generating personal student codes`) commitida.
- №19 ning tugallanmagan code/config/docs fayllari asl worktree'da commit qilinmagan holda qoldi. №2 boshlanmagan.
- 0-bosqich `8e05cdc` ustidan `chore/production-stage-0` branchida, `.local/worktrees/production-stage-0` alohida worktree'da tayyorlandi. Bu branch №19 ning tugallanmagan kodini o'z ichiga olmaydi.
- Asl yettita o'zgarish saqlandi: `package-lock.json`, `public/js/components/table.js`, `public/js/core/format.js`, `public/js/student/result.js`, `public/js/teacher/result-detail.js`, `public/js/teacher/results.js`, `public/natija.html`. Ular bu commitga olinmadi; alohida review/commit tavsiya etiladi.
- `ANALYSIS_REPORT.md` va foydalanuvchining untracked `.env` fayli asl worktree'da qoldi. Secret fayli o'qilmadi, nusxalanmadi va stagingga olinmadi.

## O'zgarishlar va dalillar

- `AGENTS.md:15`: `node:test` unit/integration uchun ruxsat, synthetic/local data va majburiy check/build/lint/test.
- `AGENTS.md:16`: Conventional Commit, formatni alohida saqlash, push/deploy/data migration yo'qligi va bosqich tasdig'i.
- `package.json:14`: `lint` vaqtincha first-party syntax gate. Bu ESLint bilan bir xil imkoniyat degani emas; flat config 7-bosqichda.
- `package.json:15`: `format:check` yozmaydigan Prettier tekshiruvi, baseline xatosini yashirmaydi.
- `package.json:16–17`: `test` va `test:ci` faqat `tests/**/*.test.mjs`ni bajaradi; browser `test.js` entrylari suite deb olinmaydi.
- `scripts/check-syntax.mjs:7–10`: browser/server/Functions/scripts/tests doirasi; vendor, installed packages, artefakt va private papkalar chiqariladi.
- `scripts/check-syntax.mjs:25–40`: har JS/MJS `node --check --input-type=module` orqali bajarilmasdan parse qilinadi; nonzero/timeout fail bo'ladi.
- `tests/unit/check-syntax.test.mjs:6–25`: valid ES module bajarilmasligi, malformed syntax rad etilishi va source doirasi uchun uch assertion guruhi.

Node 22.12 test runner quoted globni qo'llaydi ([rasmiy hujjat](https://nodejs.org/download/release/v22.12.0/docs/api/test.html#running-tests-from-the-command-line)). Amaliy tekshiruv esa ushbu mashinadagi Node 24.13.0 / npm 11.6.2 bilan; aynan Node 22.12 runtime tekshirilmadi.

## Tekshiruv natijasi

| Buyruq | Holat | Chegara |
| --- | --- | --- |
| `npm run check` | PASS | Tuzilma, havola va qator chegaralari |
| `npm run build` | PASS | Check alias, deployment emas |
| `npm run lint` | PASS | 165 JS/MJS, 0 syntax xato; ESLint hali yo'q |
| `npm test` | PASS | 3 test, 0 fail; faqat yangi syntax gate |
| `npm run test:ci` | PASS | 3 test va terminal coverage report |
| `npm run format:check` | FAIL, mavjud qarz | Clean worktree'da 222 fayl; Git CRLF checkout ham hisobga kiradi |
| Prettier `--end-of-line auto` diagnostikasi | 29 format farqi | Faqat line-ending ta'sirini ajratish; npm gate o'zgartirilmagan |

Yangi testlar faqat syntax gate'ni import qiladi. Terminal coverage shu gate uchun 74.47% line, 64.29% branch; bu application yoki server coverage emas. 80/75 va 90% xavfsizlik mezonlari bajarildi deyilmaydi. To'liq unit/integration/coverage 2-bosqichda.

Yangi helper/test Prettier bilan formatlandi; mavjud 222 faylga tegilmadi. Test discovery va sintaktik rad etish sintetik source bilan bajarildi; app modulidagi top-level kod test runner orqali ishlatilmadi. Dependency qo'shilmadi, lock fayli tahrirlanmadi; mavjud o'rnatilgan vositalar ancestor `node_modules`dan ishlatildi. Fresh `npm ci`, Netlify Dev, browser, haqiqiy lokal Blobs, parallel worker, production, deploy, push va migration tekshirilmadi/bajarilmadi.

## Keyingi tasdiq nuqtasi

0-bosqichdan keyin to'xtash. Foydalanuvchi tasdig'idan keyin 1-bosqichda №15 holatini doimiy regression bilan tekshirish, №19 tugallanmagan diffni qayta review/test qilish va commit, so'ng №2 reconcile + CAS. №1/№8/№3 yondashuvi alohida tasdiqlanadi. Q2/Q3/Q4/Q6 va LICENSE tanlovi foydalanuvchidan olinadi.
