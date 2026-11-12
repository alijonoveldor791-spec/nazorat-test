# Bosh sahifa va umumiy mavzu kontrasti (2026-11-12)

Lokal manzil: http://localhost:8888/oqituvchi/index.html. Mavjud npm run dev jarayoni qayta ishlatildi. Frontend HTML/CSS/ES modules, mavjud sidebar, heading, rowsTable, classChart va modal bilan bajarildi. Biriktirilgan dizayn rasmi xabarda ko'rinmagani uchun yozma tuzilma asos qilindi.

## Aniqlangan sabablar va tuzatish

- Eski --line #dce1ed oq kartalar va maydonlarda yetarli ajralmagan. Umumiy chegara rangi kuchaytirildi.
- Natijalar sahifasi body darajasida qorong'i tokenlar va color-scheme:dark belgilab, kunduzgi rejimni bosib ketgan. Mahalliy qotirilgan ranglar umumiy tokenlarga o'tkazildi.
- Asosiy tugma rangi --primary, matni esa o'zgaruvchan --surface ga bog'langan edi. Endi --button-bg va --on-primary alohida; --primary havola/semantik aksent bo'lib qoladi.
- Oldingi dark-hover qoidasi barcha hover tugma matnini oq qilgan; och aksentli fonlarda kontrast buzilishi mumkin edi. Semantik ranglar saqlanadi.
- Xira disabled opacity o'rniga o'qiladigan soft fon, muted matn va shtrixli chegara qo'llanadi. Faol/pressed holatda inset belgi, bosilganda siljish, klaviatura fokusida alohida --focus chizig'i bor.
- Muvaffaqiyat, xato va ogohlantirish badge/toast/taymerda rangdan tashqari belgi yoki holat matni bilan beriladi. Ball, foiz, taymer va qisqa holatlar bo'linmaydi.
- O'quvchi savoli va javoblari qorong'i rejimda ham semantik fon/matn oladi; tanlangan javobda binafsha chegara va belgi saqlanadi. Yakunlash tugmasining yashil foni saqlandi, chegarasi semantik accentga o'tdi.

## Bosh sahifa va mavzu

Dashboard haqiqiy data.tests/classes/results'dan Toshkent sanasidagi bugungi topshirishlar, faol testlar, sinf/guruhlar va o'rtacha foizni hisoblaydi. Natija bo'lmasa o'rtacha qiymat —, jadval va diagrammada tushunarli bo'sh holat chiqadi. Eng yangi beshta natija mustaqil sortlanadi.

Maktab nomi/IDsi mavjud autentifikatsiyalangan shell sarlavhasidan, yuqoridagi yangi test va sinf/guruh amallari mavjud navigatsiya/dialogdan olinadi. Ko'rish tafsiloti, Word, qayta topshirish va tasdiqli o'chirish amallari dashboardga ulandi. Barchasini ko'rish mavjud Natijalar sahifasini ochadi. Keng ekranda jadval va diagramma yonma-yon; tor ekranda ketma-ket. Uzun sinf nomlari diagramma ustunlariga urilmaydi; to'liq nom SVG title orqali mavjud.

Theme moduli init qayta chaqirilganda listenerlarni takrorlamaydi, saqlangan light/dark tanlovini, tizim mavzusini va boshqa tabdagi storage o'zgarishini qo'llaydi. Tugmada joriy holat va keyingi amal aria-pressed/aria-label/title bilan ko'rsatiladi. Bosh admin sarlavhasiga ham mavzu tugmasi qo'shildi.

Yangi kichik modullar: components/contrast.css umumiy holatlar, pages/dashboard.css bosh sahifa joylashuvi. Server API, baholash, sessiya va draft protokollari o'zgarmadi. Natijalar sahifasining server filtrlari, paketli eksporti va 20 tadan sahifalashi saqlandi.

## Tekshiruvlar va chegaralar

- Chrome/Playwright, 1440x1000 va 390x844: 67 sahifa/holat ko'rinishi, 26 mobil ko'rinish; ikkala mavzu. Dashboard, sinflar/guruhlar, testlar, test tahrirlash dialogi, Natijalar/eksport menyusi, Sozlamalar, login, ommaviy bosh sahifa, o'quvchi kirishi/test/natija, eski kirish va bosh adminning barcha oltita paneli ko'rildi. JS xatosi yo'q.
- Runtime hisoblangan matn/fon ranglari alpha bilan ota fonga qo'shib baholandi: oddiy matn 4.5:1; 24px yoki 18.66px qalin matn 3:1. Tekshirilgan ko'rinadigan matnlarda chegaradan past juftlik topilmadi. Dekorativ aria-hidden/SVG, yashirin va disabled elementlar runtime matn skanidan chiqarildi; ularning asosiy ranglari token tekshiruvida qamraldi.
- 32 token juftligi: oddiy matn juftliklari eng kami 5.04:1; line tokenining fon/surface/soft bilan eng kami 3.19:1. Fokus va muhim chegara juftliklari >=3:1. Bu avtomatik rang tekshiruvi; to'liq WCAG sertifikatsiyasi emas. Gradient, rasm ichidagi matn va foydalanuvchi import qilgan barcha kontent uchun umumiy kafolat berilmaydi.
- Tizim mavzusi, saqlangan tanlov, qayta initda bitta toggle, storage sinxronlash, klaviatura fokusi va teacher.html eski redirect tekshirildi.
- Asosiy Yangi test navigatsiyasi, sinf/guruh dialogi (ochish/bekor qilish), Ko'rish, test/sinf qidiruvi, Natijalar filtri, parol ko'rsatish, tanlangan javob va keyingi savol tekshirildi. O'quvchi fullscreen va egalik nazorati saqlandi.
- 128 test / 4860 topshirish fixture bilan Natijalar sahifasining qidiruv, server sahifalashi/saralashi, filtrlar, CSV/Excel va barcha mos yozuvlarni chop etish DOMi qayta o'tdi. Har eksport javobi <=200 yozuv. 390px sahifada tashqi gorizontal overflow yo'q.
- Sinovlar lokal serverdan frontendni olib, API javoblarini taqlid qildi. Mahsulot ko'rsatkichlari kodga namuna sonlar sifatida yozilmadi; skrinshotdagi maktab/ism/sonlar faqat .local fixturega tegishli.
- Haqiqiy telefon, Safari/Firefox, production yuklamasi, real login/parolni almashtirish, ma'lumot yozib sinf/test yaratish, zaxira/tiklash va haqiqiy printer dialogi bu ishda sinovdan o'tkazilmadi. Mavjud backendga oid xavfsizlik oqimlari o'zgartirilmadi.
- npm run check, npm run build, git diff --check o'tdi. GitHub push va Netlify deploy bajarilmadi.

## Skrinshotlar

[Umumiy taqqoslash galereyasi](../../.local/theme-overview.png). Har bir sahifa alohida yuqori aniqlikdagi faylda:

| Sahifa | Kunduzgi | Qorong'i |
| --- | --- | --- |
| Bosh sahifa | [light](../../.local/theme-dashboard-light.png) | [dark](../../.local/theme-dashboard-dark.png) |
| Sinflar va guruhlar | [light](../../.local/theme-classes-light.png) | [dark](../../.local/theme-classes-dark.png) |
| Testlar | [light](../../.local/theme-tests-light.png) | [dark](../../.local/theme-tests-dark.png) |
| Natijalar | [light](../../.local/theme-results-light.png) | [dark](../../.local/theme-results-dark.png) |
| Sozlamalar | [light](../../.local/theme-settings-light.png) | [dark](../../.local/theme-settings-dark.png) |
| Login | [light](../../.local/theme-login-light.png) | [dark](../../.local/theme-login-dark.png) |
| O'quvchi kirishi | [light](../../.local/theme-student-entry-light.png) | [dark](../../.local/theme-student-entry-dark.png) |
| O'quvchi testi | [light](../../.local/theme-student-test-light.png) | [dark](../../.local/theme-student-test-dark.png) |
| O'quvchi natijasi | [light](../../.local/theme-student-result-light.png) | [dark](../../.local/theme-student-result-dark.png) |
| Bosh admin | [light](../../.local/theme-super-admin-light.png) | [dark](../../.local/theme-super-admin-dark.png) |
| Mobil bosh sahifa | [light](../../.local/theme-dashboard-light-390.png) | [dark](../../.local/theme-dashboard-dark-390.png) |
| Mobil o'quvchi testi | [light](../../.local/theme-student-test-light-390.png) | [dark](../../.local/theme-student-test-dark-390.png) |

PNG, JSON va mahalliy tekshiruv skriptlari .local ichida, Gitga kirmaydi.

## O'zgargan fayllar

- public/css/tokens.css
- public/css/base.css
- public/css/components/button.css
- public/css/components/dark-hover.css
- public/css/components/contrast.css
- public/css/pages/dashboard.css
- public/css/pages/results.css
- public/css/pages/results-controls.css
- public/css/pages/student-test.css
- public/css/styles.css
- public/js/core/theme.js
- public/js/teacher/dashboard.js
- public/js/components/class-chart.js
- public/js/components/table.js
- public/bosh-admin/index.html
- PLAN.md
- docs/ARCHITECTURE.md
- docs/implementation/theme-dashboard.md
