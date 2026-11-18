# Imtihon himoyasi, fanlar akkordeoni va yuklanish

Sana: 2026-11-18.

## Imtihon himoyasi

Eski `exam-guard.js`, `violation-sync.js` va `section-map.js` oqimlari bilan
solishtirildi. Yangi frontend hodisani faqat `type` bilan yuborgan, server esa
`eventId`, `answers` va `version` talab qilgan. Rad etilgan xato yashirilgan.
Bu uzilish tuzatildi; ma'lumotlar ombori va egaga tegishlilik tekshiruvi saqlandi.

- `public/js/student/exam-guard.js`: fullscreen, fokus, clipboard, print va
  aniqlanadigan skrinshot yorliqlari uchun yagona, tozalanadigan obunalar.
- Windows PrintScreen, Win/Meta+Shift+S, Ctrl+Shift+S va Mac Cmd+Shift+3/4/5
  hodisalari aniqlansa `printscreen` sifatida yuboriladi; takroriy keydown sanalmaydi.
- Ctrl/Cmd+C/X/P/S/U, F12 va tegishli yorliqlar to'siladi; kontekst menyusi,
  matn tanlash va sudrash cheklanadi. Fokus/fullscreen yo'qolsa savollar darhol
  niqoblanadi, asosiy kontent inert bo'ladi va testga qaytish oynasi ochiladi.
- Chop etish CSS'i test savollarini yashiradi. Taymer himoya oynasida ham yuradi.
- Bular brauzer aniqlaydigan urinishlarni nazorat qiladi. Operatsion tizim,
  boshqa qurilma yoki brauzer tashqarisidagi tasvirga olishni to'liq to'sib bo'lmaydi.

## O'qituvchi belgilaydigan limitlar

Test tahririda umumiy qoidabuzarlik limiti va alohida skrinshotga urinish limiti
1–20 oralig'ida belgilanadi. Skrinshot umumiy hisobga ham kiradi: qaysi limit
oldin yetsa server urinishni yakunlaydi. Limitlar urinish boshlanishida snapshot
sifatida olinadi; faol urinishni keyingi test tahriri bilan yashirincha o'zgartirmaydi.

`violationSettings` eski yozuvga screenshotLimit yo'q bo'lsa mavjud umumiy
limitni qo'llaydi. Avvalgi policyVersion/default mosligi saqlandi. Eski logdan
skrinshot hisobini o'qish mumkin; yangi natijada screenshotCount saqlanadi.
O'quvchiga faqat hisob va limitlar qo'shildi; javob kalitlari berilmaydi.

## Navbat va tiklash

`violation-sync.js` har hodisani UUID, javoblar va draft versiyasi bilan brauzerda
saqlaydi. Ketma-ket yuboradi; javob yo'qolsa aynan shu hodisa IDsi qayta yuboriladi.
Hisobni faqat server qaytaradi. Offline holat va refresh navbatni yo'qotmaydi.
Yakuniy topshirishdan oldin saqlangan himoya xabarlari yuborilishi talab qilinadi.
Limitga yetilgan natija bir marta saqlanadi. Muddatdan keyingi baholashda avvalgi
server drafti qo'llanadigan mavjud oqim o'zgartirilmagan.

Egalik qulfi bir marta olinadi; oddiy render yoki yuborish holati o'zgarganda qayta
olinmaydi. Natija kelganda himoya/navbat to'xtaydi. Oynalar yopilganda obunalar va
taymerlar tozalanadi. Urinish tekshirilmaguncha savollar loading bilan berkitiladi.

## Blok test va samaradorlik

Savollar tartibini o'zgartirmaydigan `question-sections.js` asosiy va majburiy
fanlarni guruhlaydi. O'quvchi xaritasida guruh va fanlar ochilib-yopiladi;
joriy savol boshqa fanga o'tsa kerakli panel avtomatik ochiladi. Savol raqami,
javob/flag va mavjud scoring snapshotlari saqlandi.

O'qituvchi muharririda faqat ochilgan fan savollari DOM'ga chiziladi. Yopiq fan
tahrirlari parent savollar holatida qoladi; fan almashtirish savollarni o'chirmaydi.
DTM 90 testda 90 ta muharrir o'rniga ochiq fan uchun 30 yoki 10 tasi ishlaydi.

## Loading va navigatsiya

16 HTML hujjatga yagona statik skelet qo'yildi. Asosiy dinamik loading holatlari
`LoadingState` komponentiga o'tkazildi. Sahifa almashganda ingichka progress
indikatori ishlaydi; oddiy havola yoki klaviatura navigatsiyasi saqlanadi.

Hover/fokusda faqat tanilgan statik sahifa va kirish moduli prefetch/modulepreload
qilinadi. API yoki admin ma'lumotlari oldindan so'ralmaydi. Test davomida bu
oldindan yuklash o'chadi; saveData rejimida ham ishga tushmaydi. Prefetch 8 manzil
bilan cheklangan. BFCache/pageshow qaytishida eski navigatsiya blokirovkasi olinadi.
Reduced-motion holatida loading animatsiyalari to'xtatiladi.

## Lokal tekshiruv

Haqiqiy lokal API va Chrome bilan o'qituvchi limitni 2 qilib saqlashi/qayta ochishi,
Ctrl+C sanalishi, 2 skrinshotdan so'ng umumiy 10 limitga yetmasdan serverning
yakunlashi tekshirildi. Natijada screenshotCount=2 va violationCount=3 saqlandi.
Javobi yo'qolgan hodisa refreshdan keyin bir marta sanaldi; begona browserKey 403 oldi.
Mac yorlig'ida modifikatorlar oldin qo'yib yuborilganda ham takroriy urinish hisoblandi.
Chop etish niqobi, 90 savolli DTM akkordeonlari, 61→60 savol o'tishi va muharrirning
30/10 savolli DOM'i tekshirildi. Havolalar preload'i va backdan keyingi tema ishladi.
Odatdagi testni boshlash, draft, boshqa oyna qulfi va 1/1 natija regressiyasi o'tdi.
Sinovlar faqat lokal; artefaktlar Gitga kiritilmaydi, tests/ qayta yaratilmaydi.
Kabinetning barcha sahifalari alohida loading regressiyasidan o'tdi; JavaScript
xatosi va mobil gorizontal chiqish topilmadi. `npm run check` va `npm run build` o'tdi.
