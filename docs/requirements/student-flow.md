# 1.5-bosqich: o‘quvchi ekranlari va test oqimi

2026-11-03: joriy asos [mahsulot qoidalari](product-rules.md), [dalillar](product-evidence.md) va [qarorlar](product-decisions.md). Quyidagi mavjud-kod tavsifi tarixiy: 4 bosqichli kirish va yakuniy start hozir bor (E18); obuna gate va atomik revoke/start hali yo'q (E10/E15). Quyidagi mahsulot takliflari tasdiqlangan joriy implementatsiya emas. Q2–Q6 hal qilinmaguncha faol urinish, limit, natija va obuna bo'yicha tavsiyalarni bajarildi deb ko'rsatmaslik kerak.

Sana: 2026-10-31. Holat: talablar loyihasi; dasturga tatbiq etilmagan.

## 1. Doira va amaldagi holat

Majburiy tartib: **maktab IDsi → umumiy 6 xonali test kodi → sinf → ism-familiya → tasdiqlash → test → natija**. Ekran deganda alohida URL bo‘lishi shart bo‘lmagan mantiqiy qadam tushuniladi. O‘quvchi profili, login, parol va shaxsiy kod yaratilmaydi.

Asoslar: [student-access.md](student-access.md), [test-code.md](test-code.md), [school-id.md](school-id.md), [roles.md](roles.md). Ushbu bosqich obuna tugashining ta'sirini aniqlashtiradi: yangi urinish yopiladi, avval qabul qilingan urinishning belgilangan muddati va natijaga kirishi saqlanadi. Boshqa obuna/to‘lov qoidalari bu hujjat doirasiga kirmaydi.

Hozir [index.html](../../public/index.html) va [home.js](../../public/js/student/home.js) sinf → shaxsiy kod yoki ism → test tanlash oqimidan foydalanadi; maktab IDsi, umumiy kod va alohida ma'lumot tasdiqlash qadami yo‘q. [test.html](../../public/test.html) savol, taymer, xarita va yakunlashni, [natija.html](../../public/natija.html) natijani ko‘rsatadi. Bu sahifalar quyidagi yangi oqimni hali bajarmaydi.

## 2. Barcha ekranlar uchun umumiy talablar

- Bosqich raqami, sarlavha va keyingi amal tushunarli ko‘rsatiladi. Maydonlar label bilan, xatolar maydon yonida va ekran o‘quvchisiga e'lon qilinadigan umumiy xabarda beriladi; faqat rangga tayanilmaydi.
- Barcha UI matni o‘zbek lotinida, `'` apostrofi bilan yoziladi. Foydalanuvchi matni escape qilinadi. Mobil ekran va klaviatura bilan boshqarish ishlaydi.
- Keyingi qadam tekshiruv muvaffaqiyatli bo‘lgach ochiladi. Yuklanishda tegishli tugma band holatida bo‘ladi; takror bosish bir xil operatsiyani takror yaratmaydi.
- 1–5-qadamlarda orqaga qaytish mumkin. Yuqori qadam o‘zgarsa, unga bog‘liq maktab/test/sinf tekshiruvlari bekor qilinib qayta bajariladi; kech kelgan eski javob yangi tanlovni almashtirmaydi.
- Ism/familiya va umumiy kod URL, analytics yoki loglarga yozilmaydi. Kirish ma'lumotlari tekshirilmaguncha savol va javob kalitlari yuklanmaydi.
- Server tasdiqlamaguncha urinish boshlangan, draft saqlangan yoki natija yakunlangan deb ko‘rsatilmaydi. Internet yo‘qligida yangi urinish boshlanmaydi.

## 3. Ekranlar talablari

| Qadam / sarlavha | Mazmun va maydonlar | Tugmalar va o‘tish sharti |
| --- | --- | --- |
| 1. Maktabni aniqlash | `Maktab IDsi`; to‘liq doimiy ID. Havola qiymatni oldindan to‘ldirishi mumkin, ammo tekshiruvni chetlab o‘tmaydi. Format [school-id.md](school-id.md) bo‘yicha | `Davom etish`: server maktab kontekstini tekshiradi. Faqat minimal maktab nomi/IDsi ko‘rsatiladi; maktablar umumiy ro‘yxati yo‘q |
| 2. Test kodini kiritish | Tanlangan maktab nomi va `Umumiy test kodi`. Bitta satr maydon, raqamli klaviatura, 6 ta ASCII raqam; boshidagi nollar saqlanadi. Shaxsiy kod ko‘rsatmasi bo‘lmaydi | `Kodni tekshirish`, `Orqaga`. Server maktab + kod orqali yagona testni aniqlaydi; kod faol, test jadvali ochiq va obuna yangi urinishga ruxsatli bo‘lishi kerak |
| 3. Sinfni tanlash | Tekshirilgan maktab va test nomi; faqat shu test biriktirilgan maktab sinflari. Dastlab `Sinfingizni tanlang`; yagona sinf bo‘lsa ham tanlov tushunarli ko‘rinadi | `Davom etish`, `Orqaga`. Ruxsat etilgan sinf tanlanmasdan o‘tish yo‘q; boshqa testni nom bilan tanlash qadami qo‘shilmaydi |
| 4. Ism-familiyani kiritish | Alohida `Ism` va `Familiya`; ikkalasi majburiy. Tashqi bo‘sh joylar olinadi, har biri 1–60 belgi. O‘zbekcha ism, defis va apostrof asossiz rad etilmaydi. Roster orqali shaxsiy profil tanlanmaydi | `Davom etish`, `Orqaga`. Matn UI va serverda tekshiriladi; ismni noyob deb hisoblash yo‘q |
| 5. Ma'lumotlarni tasdiqlash | Maktab nomi va IDsi, test nomi, sinf, ism/familiya, savollar soni, urinish davomiyligi va oxirgi tugash vaqti. `Test boshlanganidan keyin vaqt hisoblanadi.` Ogohlantirish: serverga muddatida yetmagan javoblar baholanmaydi. Umumiy kod qayta to‘liq ko‘rsatilmaydi | `Ma'lumotlarni tuzatish`, `Testni boshlash`. Bu ekran o‘zi urinish yaratmaydi va vaqtni boshlamaydi |
| 6. Testni ishlash | Server tasdiqlagan maktab/test/sinf/ism, savol va variantlar, savol raqami, savollar xaritasi, javob berilganlar soni, qolgan vaqt, saqlash holati. `Oldingi`, `Keyingi`, `Keyinroq qaytaman` | `Testni boshlash` serverda qabul qilinganda vaqt boshlanadi; savollar shu urinish tartibida ochiladi. `Yakunlash va yuborish` tasdiqlash oynasini ochadi; muddat tugasa avtomatik yakunlash |
| 7. Natija | Server qaytargan ball/jami, foiz, maktab/test/sinf va ishtirokchi matni, yakun holati. Muddat tugagan bo‘lsa izoh; javoblar sharhi faqat server ruxsat etsa | `Bosh sahifaga qaytish`; umumiy qurilmadagi ushbu qatnashchi ma'lumotlarini tozalash yo‘li. Avtomatik yangi urinish yoki cheksiz `Qayta ishlash` tugmasi yo‘q |

Boshlashdan oldin cheklanmagan vaqt deb noto‘g‘ri va'da berilmaydi: vaqt limiti va test jadvali bo‘lmasa ham mavjud server siyosatidagi 24 soatlik chegara tushuntiriladi. Sana-vaqtlar Asia/Tashkent bo‘yicha aniq sana bilan ko‘rsatiladi; haqiqiy deadline serverdan olinadi.

## 4. Tekshiruv va xato xabarlari

Quyidagi matnlar maqsadli UI xabarlari. Server ichki kod/holatni kuzatishi mumkin, lekin o‘quvchiga maxfiy tafsilotni bermaydi.

| Holat | Xabar | Ekran amali |
| --- | --- | --- |
| Maktab IDsi bo‘sh | `Maktab IDsini kiriting.` | 1-qadamda qoladi, maydon fokuslanadi |
| Maktab IDsi formati noto‘g‘ri | `Maktab IDsi formati noto‘g‘ri. Berilgan IDni to‘liq kiriting.` | Formatni tuzatish; omborga keraksiz so‘rov yo‘q |
| Maktab topilmadi yoki kirish konteksti yopiq | `Maktabga kirish hozir mavjud emas. IDni tekshiring yoki maktab adminiga murojaat qiling.` | Himoyalangan sabab yoki boshqa maktab ma'lumoti oshkor qilinmaydi |
| Kod bo‘sh | `Umumiy test kodini kiriting.` | 2-qadamda qoladi |
| Kod 6 raqam emas | `Test kodi aniq 6 ta raqamdan iborat bo‘lishi kerak.` | Nol yo‘qotilmaydi; son tipiga aylantirilmaydi |
| Kod noto‘g‘ri/nofaol/bekor qilingan; test yopiq yoki obuna tugagan | `Bu maktab va kod bilan yangi urinishni boshlash hozir mumkin emas. Ma'lumotlarni tekshiring yoki maktab adminiga murojaat qiling.` | 2-qadamda qoladi; kod/maktab/test mavjudligi haqida qo‘shimcha dalil bermaydi |
| Tekshirilgan test hali boshlanmagan | `Test hali boshlanmagan. Belgilangan vaqtda qayta urinib ko‘ring.` | Faqat avval ruxsatli kontekstda jadval ochilishi mumkin; boshlash yo‘q |
| Tekshirilgan testning kirish muddati tugagan | `Testga yangi urinish boshlash muddati tugagan.` | Boshlash yo‘q; mavjud urinish bo‘lsa alohida davom ettirish yo‘li |
| Sinf tanlanmagan | `Sinfingizni tanlang.` | 3-qadamda qoladi |
| Sinf ro‘yxati bo‘sh | `Bu test uchun sinf mavjud emas. Maktab adminiga murojaat qiling.` | Davom etish yopiq; ro‘yxatni qayta yuklash mumkin |
| Sinf begona, o‘chirilgan yoki testga tegishli emas | `Tanlangan sinf bu test uchun mavjud emas. Sinfni qayta tanlang.` | Faqat ruxsatli sinflar qayta olinadi |
| Ism yoki familiya bo‘sh | `Ismingizni kiriting.` / `Familiyangizni kiriting.` | 4-qadam, tegishli maydonga fokus |
| Matn uzunligi chegaradan oshgan | `Ism va familiya har biri 60 belgidan oshmasligi kerak.` | Kiritilgan matn saqlanadi, foydalanuvchi tuzatadi |
| Tasdiqlashdan keyin kod/obuna/test holati o‘zgardi | `Yangi urinishga ruxsat o‘zgardi. Ma'lumotlarni qayta tekshiring yoki maktab adminiga murojaat qiling.` | Urinish qabul qilinmagan bo‘lsa vaqt boshlanmaydi; kontekst qayta tekshiriladi |
| So‘rovlar cheklovi | `So‘rovlar ko‘paydi. Ko‘rsatilgan vaqt tugagach qayta urinib ko‘ring.` | Server `Retry-After` bo‘yicha kutish ko‘rsatiladi; avtomatik tez qaytarish yo‘q |
| Internet/server xatosi, boshlashdan oldin | `Bog‘lanib bo‘lmadi. Internetni tekshirib, qayta urinib ko‘ring.` | Maydonlar saqlanadi; urinish yaratildi deb aytilmaydi |
| Start javobi noma'lum: aloqa uzildi | `Boshlash holati tekshirilmoqda. Sahifani qayta ochsangiz, shu urinish davom ettiriladi.` | Xuddi shu operatsiya tekshiriladi; yangi start ID bilan dublikat yaratilmaydi |
| Boshqa brauzer/egalik mos emas | `Bu urinishni ushbu brauzerda davom ettirib bo‘lmaydi. Boshlangan brauzerdan foydalaning yoki maktab adminiga murojaat qiling.` | Begona urinish, ism va natija qaytarilmaydi |
| Ikkinchi oyna | `Test boshqa oynada ochiq. O‘sha oynada davom eting.` | Bir vaqtda ikki oynada tahrir yo‘q |
| Qurilmaga saqlash ishlamadi | `Qurilmaga saqlab bo‘lmadi. Saqlash sozlamalari va bo‘sh joyni tekshiring.` | Server va lokal saqlash holati alohida; yolg‘on `saqlandi` yo‘q |

Umumiy kirish rad javobi obuna holati yoki haqiqiy kodni aniqlash vositasi bo‘lmaydi. Aniq jadval xabarlari faqat hali amal qilayotgan, tekshirilgan test kontekstida beriladi; eskirgan kontekst yangi urinishga ruxsat emas.

## 5. Tasdiqlash va boshlash chegarasi

**FLOW-01:** 1–5-qadamlar urinish yaratmaydi, vaqtni boshlamaydi va joyni kafolatlamaydi. `Testni boshlash`da server maktab, obuna, umumiy kodning joriy versiyasi, test holati/jadvali, sinf mosligi va ism-familiyani qayta tekshiradi.

**FLOW-02:** faqat serverdagi atomik qabul nuqtasidan o‘tgan yozuv boshlangan urinish hisoblanadi. Kod bekor qilinishi yoki obuna tugashi shu nuqtadan oldin bo‘lsa start rad etiladi; oldin qabul qilingan bo‘lsa uning muddati saqlanadi. `now >= subscriptionEndsAt` holatida yangi start yopiq. Qabul va tekshiruv orasidagi poyga bekor qilish javobidan keyin eski ruxsat bilan start yaratmasligi kerak.

Boshlash operatsiyasi texnik idempotent so‘rov IDsi bilan himoyalanadi. Javob yo‘qolib qayta yuborilsa faqat o‘sha egaga o‘sha urinish va asl deadline qaytariladi; yangi vaqt yoki urinish berilmaydi. Bekor kod/obuna holatida ham oldin qabul qilingan shu operatsiyani tiklash yangi start sifatida baholanmaydi. Maktab/test/sinf va ishtirokchi matni urinishda saqlanadi; submit body orqali boshqa maktabga almashtirilmaydi.

## 6. Kod, obuna va vaqt holatlari

| Hodisa | Yangi urinish | Avval qabul qilingan urinish |
| --- | --- | --- |
| Kod nofaol yoki bekor qilingan | Yopiq; oldin 2-qadamdan o‘tish yetarli emas | Token va brauzer egaligi bilan asl muddatigacha ishlaydi; kod qayta so‘ralmaydi |
| Obuna tugagan | Yopiq; forma yoki tasdiqlash ekranida turganlar ham qayta tekshiriladi | Draft, resume, submit va o‘z natijasini olish ishlaydi; obuna yangilash talabiga yo‘naltirilmaydi |
| Test boshlanish vaqti kelmagan | Yopiq | Noto‘g‘ri yangi urinish yaratilmaydi |
| Testning yangi kirish jadvali tugagan | Yopiq | O‘z server deadline'i bilan boshqariladi; jadval tugashi deadline tarkibiga allaqachon kirgan bo‘lsa yakunlanadi |
| Urinish muddati tugagan | Shu urinish qayta boshlanmaydi | Javob tahriri to‘xtaydi; serverdagi vaqtida yetgan javoblar yakunlanadi |
| Obuna uzaytirildi yoki kod yangilandi | Barcha joriy tekshiruvlar qayta bajarilsa ochilishi mumkin | Eski deadline avtomatik uzaymaydi; yakunlangan urinish ochilmaydi |

**FLOW-03:** deadline boshlashdagi vaqt limiti va jadval tugashining eng ertasi; ikkalasi yo‘q bo‘lsa serverning 24 soatlik chegarasi. Kod bekor qilinishi va obuna tugashi bu deadline'ni qisqartirmaydi yoki uzaytirmaydi. Jadvalni keyin o‘zgartirish, testni favqulodda to‘xtatish/o‘chirish yoki maktabni bloklashning faol urinishga ta'siri alohida qaror; ular oddiy kod bekor qilish yoki obuna tugashi bilan tenglashtirilmaydi.

### Muddat tugashi va aloqa uzilishi

- Taymer server vaqti asosida ishlaydi; qurilma soatini o‘zgartirish muddatni uzaytirmaydi. Oxirgi daqiqada `Bir daqiqadan kam vaqt qoldi.` xabari chiqadi.
- Vaqt nolga yetganda savol variantlari va tahrir boshqaruvlari yopiladi, yakunlash tasdiqlash oynasi ochiq bo‘lsa yopiladi. `Vaqt tugadi. Natija tekshirilmoqda…` holati ko‘rsatiladi.
- Server faqat muddatdan oldin qabul qilingan javoblarni baholaydi. Oflayn yangi javoblarni keyin yuborish ularni ballga qo‘shmaydi. Tiklash tokeni muddatni uzaytirmaydi.
- Aloqa yo‘q bo‘lsa `Vaqt tugadi. Aloqa tiklangach serverdagi natija olinadi. Muddatdan keyin javoblar o‘zgartirilmaydi.` ko‘rsatiladi. Tasdiqlanmagan ball chiqarilmaydi; lokal nusxa muddatni chetlab o‘tmaydi.
- Muddatdan oldin aloqa uzilganda `Javoblar qurilmada saqlandi, serverga hali yuborilmadi.` faqat lokal saqlash muvaffaqiyatli bo‘lsa ko‘rsatiladi. Server tasdig‘ida `Javoblar serverda saqlandi.` beriladi. Timer aloqa uzilganda to‘xtamaydi.
- Yakunlash so‘rovi javobsiz qolsa `Yakunlash holati tekshirilmoqda…` ko‘rsatiladi; qayta yuborish/online tiklash bitta natijani oladi. Mahalliy nusxa server tasdig‘isiz yo‘qotilmaydi.

## 7. Qo‘lda yakunlash va natija

`Yakunlash va yuborish` bosilganda: `Test yakunlansinmi?` sarlavhasi va javobsiz savol bo‘lsa `{son} ta savol javobsiz. Baribir yuborilsinmi?`, aks holda `Javoblaringizni yakuniy yuborishni tasdiqlaysizmi?` matni beriladi. Tugmalar: `Testga qaytish`, `Yakunlash`. Tasdiqlashning o‘zi vaqtni to‘xtatmaydi; yuborish boshlanganidan keyin tahrir yopiladi.

Server natijasi kelgach `Test yakunlandi` va ball/foiz ko‘rsatiladi. Muddatli yakun izohi: `Vaqt tugadi. Serverga muddatida yetib borgan javoblar baholandi. Yuborilmagan kech javoblar hisobga olinmadi.` Natija maktab, sinf, test va urinishga bog‘lanadi; ism-familiya tasdiqlangan shaxs guvohnomasi emas.

O‘z natijasiga kirish urinishning texnik dalili bilan cheklanadi. Umumiy kod yoki ism-familiya orqali natijalar qidiruvi yo‘q. Javob kaliti va sharhni ko‘rsatish har qaytarishda serverning amaldagi siyosatidan olinadi. Lokal saqlangan natija rasmiy server yozuvini almashtirmaydi. Umumiy qurilmada keyingi qatnashchiga avvalgi ishtirokchi ma'lumoti ochilmasligi uchun tozalash oqimi kerak; bu server natijasini o‘chirmaydi.

## 8. Alohida qaror talab qiladigan masalalar

| ID | Masala | Qaror chegarasi |
| --- | --- | --- |
| OPEN-01 | Takroriy urinishni qaysi birlik bo‘yicha cheklash | Ism insonni noyob aniqlamaydi; brauzer ham inson emas. Inson darajasida limit kafolati hozir yo‘q; shaxsiy kod/profil bilan yechish mumkin emas |
| OPEN-02 | Bir xil sinfdagi bir xil ism-familiya | Urinish va natijalar avtomatik birlashtirilmaydi, begona urinish qaytarilmaydi. Admin ajratishi va UI ogohlantirish tartibi tanlanadi |
| OPEN-03 | Ismni boshlashdan oldin tuzatish | 4/5-qadamda mumkin, hali natija/urinish yo‘q. Normalizatsiya va noto‘g‘ri yozilgan ism uchun tavsiya matni aniqlashtiriladi |
| OPEN-04 | Ismni boshlashdan keyin tuzatish | O‘quvchi o‘zi o‘zgartiradimi yoki admin tuzatadimi, auditda asl matn va tuzatish qanday saqlanadi — ochiq. Qarorgacha urinishdagi ismni yashirin almashtirish yo‘q |
| OPEN-05 | Ismni o‘zgartirib qayta kirish | Bu yangi inson ekanini isbotlamaydi; shubhali takrorlarni ko‘rib chiqish va xabar berish tartibi kerak. Ism o‘xshashligi bilan begona natija ochilmaydi |
| OPEN-06 | Admin bergan qayta topshirish ruxsati | Akkauntsiz/shaxsiy kodsiz yangi startga qanday bog‘lanishi aniqlanadi. Takror submit yoki start retry qo‘shimcha urinish emas |
| OPEN-07 | Qurilma/brauzer almashtirish, dalil yo‘qolishi | Tiklash va admin yordami tartibi kerak; ism + umumiy kod begona urinishga egalik bermaydi |
| OPEN-08 | Umumiy qurilmada saqlash muddati | Natijani ko‘rsatish, lokal tozalash va davom ettirish o‘rtasidagi aniq muddat/tugmalar tanlanadi |

Bu ochiq savollar asosiy yetti qadam, shaxsiy kodsiz kirish yoki kod/obuna tugashidan oldin qabul qilingan urinish kafolatini bekor qilmaydi.

## 9. Keyingi implementatsiya qabul mezonlari

| Tekshiruv | Kutiladigan natija |
| --- | --- |
| To‘g‘ri kirish | Yetti qadam aynan belgilangan tartibda; profil/login/parol/shaxsiy kod yo‘q |
| Bo‘sh/xato maydonlar | 4-bo‘limdagi xabar va fokus; kiritilgan boshqa ma'lumot yo‘qolmaydi |
| `004271` kodi | Boshidagi nollar saqlanadi; 5/7 raqam va son tipidagi API qiymati rad etiladi |
| Maktab/kod/sinfni almashtirish va eski javobning kech kelishi | Quyi qadamlar qayta tekshiriladi; begona ma'lumot yoki eski kontekst ishlatilmaydi |
| Tasdiqlashda kutish | Urinish va taymer boshlanmaydi; startda shartlar qayta tekshiriladi |
| Kod bekor qilish yoki obuna tugashi bilan parallel start | Server qabul tartibi to‘g‘ri; rad etilgan yangi startga vaqt/urinish ajratilmaydi |
| Kod/obuna yopilishidan oldin boshlangan test | Asl muddatgacha draft/resume/submit, keyin o‘z natijasi ishlaydi |
| Start javobi yo‘qolishi, takror bosish va submit retry | Dublikat urinish/natija yo‘q; asl deadline saqlanadi |
| Test vaqtida offline va muddat tugashi | Tahrir to‘xtaydi; faqat serverga avval yetgan javoblar baholanadi; tasdiqsiz ball yo‘q |
| Bir xil ism yoki begona token/brauzer | Natijalar birlashmaydi, begona urinish/natija ochilmaydi |
| Mobil, klaviatura, ekran o‘quvchisi va umumiy qurilma | Qadam/xato/yuklanish holati tushunarli; oldingi qatnashchi ma'lumoti himoyalangan |

Bular yangi oqimning kelajakdagi tekshiruvlari. Mavjud testlarning o‘tishi ushbu talablar dasturda bajarilganini anglatmaydi.

## 10. Ish chegarasi

Faqat `docs/requirements/student-flow.md` tayyorlandi. Dastur kodi, mavjud IDlar, testlar, natijalar va oldingi talab hujjatlari o‘zgartirilmadi. PLAN va amaldagi arxitektura tuzilmasi o‘zgarmadi. Keyingi bosqichga o‘tilmaydi.

Tekshirish natijalari: `npm test` — 54/54 o‘tdi; `npm run check` — o‘tdi. Hujjatdagi mahalliy havolalar mavjud, fayl 250 qatordan kam, yangi fayl uchun `git diff --no-index --check` bo‘sh joy xatolarisiz o‘tdi. Ishlab turgan lokal loyiha http://localhost:8888 manzilida HTTP 200 qaytardi. Xavfsizlik/recovery kodi o‘zgarmagani uchun API/auth/brauzer auditlari bajarilmadi; yangi oqimning runtime sinovlari hali amalga oshirilmagan.
