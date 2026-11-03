# Mahsulot qoidalari: yagona asos

Sana: 2026-11-03. 1-bosqich: **tahlil va hujjatlar tayyor, qarorlar kutilmoqda**.

Ushbu hujjat joriy topshiriq uchun asosiy talab manbai. [Dalillar](product-evidence.md) kod va oldingi tahlil farqlarini, [vakolatlar](roles.md) amallar doirasini, [qarorlar va 2-bosqich](product-decisions.md) tasdiqlanmagan tanlovlarni beradi. Eski talablar tafsilot sifatida saqlanadi; ularning tarixiy "mavjud emas" yozuvlari bugungi holat emas. Ziddiyatda foydalanuvchining joriy qat'iy talabi ustun; tavsiya tasdiqlangan talabga aylanmaydi.

Har banddagi **Joriy holat** — `Koddagi joriy xatti-harakat`; **Muammo** — shu xatti-harakatning cheklovi. **Qoida** alohida holat bilan beriladi. Qabul mezonlari kelajakdagi tekshiruv sharti, bajarilgan sinov emas. Dalil IDlari har topilmani fayl va funksiyaga bog'laydi.

## O'zgarmas talablar

| ID | Holat | Qoida | Qabul mezoni |
| --- | --- | --- | --- |
| T01 | Tasdiqlangan talab | Mahsulot rollari bosh admin, maktab admini, o'quvchi. | O'quvchi admin APIga, maktab admini begona maktabga kira olmaydi. |
| T02 | Tasdiqlangan talab | Har maktabning doimiy noyob IDsi bor. Ichki UUID va ko'rsatiladigan `public_school_id` saqlanadi. | Nom o'zgarishi, retry va arxivlash IDni almashtirmaydi yoki qayta bermaydi. |
| T03 | Tasdiqlangan talab | O'quvchiga profil, login, parol yoki shaxsiy kirish kodi yaratilmaydi. Maktab IDsi + barcha qatnashchilarga umumiy 6 raqamli test kodi + sinf + ism-familiya bilan kiriladi. | Rosterli/rostersiz sinf bir xil kiradi; admin o'qishi/saqlashi ham yangi shaxsiy kod yaratmaydi. |
| T04 | Tasdiqlangan talab | Taymer faqat yakuniy "Testni boshlash" serverda qabul qilinganda boshlanadi. | Resolve, sinf/ism va tasdiqlash ekranigacha urinish yaratilmaydi. |
| T05 | Tasdiqlangan talab | Javob kaliti startda berilmaydi; baholash va muddat serverda tekshiriladi. | Start DTOda `answer` yo'q; mijoz balli/soati ruxsat dalili emas. |
| T06 | Tasdiqlangan talab | Muddatdan keyin faqat avval serverga yetgan javoblar baholanadi; draft versiyasi, brauzer egaligi va bitta natija saqlanadi. | Kech draft bahoni o'zgartirmaydi; stale draft yangisini bosmaydi; takror submit bir natija beradi. |
| T07 | Tasdiqlangan talab | Public API roster/shaxsiy kodlarni bermaydi; eski test va natija formatlari saqlanadi. Admin logout server sessiyasini bekor qiladi, token parol verifieriga bog'lanmaydi. | Begona/ochiq so'rovda maxfiy ma'lumot yo'q; eski ID/ball saqlanadi; logoutdan keyin token rad etiladi. |

## A. Rollar va vakolatlar

### A1. Amallar va bosh admin chegarasi

- Joriy holat: uch mahsulot roli ajratilgan; `legacy_admin` faqat eski maktabsiz yozuvlar uchun texnik moslik roli. Bosh admin maktab, obuna, admin tayinlash va agregat sanog'larni oladi; individual test/natija APIlari unga yopiq (E01–E03).
- Muammo: tarixiy talablar rollar va izolyatsiyani hali yo'q deb yozgan; bosh admin nomi cheksiz kirish deb tushunilishi mumkin.
- Qoida — **Tasdiqlangan talab**: maktab admini faqat o'z maktabida ishlaydi. **Tavsiya**: bosh adminning hozirgi boshqaruv/agregat chegarasini saqlash; texnik yordam uchun individual ma'lumotga kirishni alohida ruxsatsiz qo'shmaslik. Batafsil [vakolatlar jadvali](roles.md).
- Qabul mezoni: A admin B yozuvini GET/PUT/DELETE/nusxa/retake/eksport bilan ololmaydi; bosh admin maktab test kaliti va individual natijani ololmaydi. Qo'shimcha support kirishi Q1 qarorisiz yaratilmaydi.

### A2. Bloklash va arxivlash

- Joriy holat: faol bo'lmagan maktab admin login/so'rovi va yangi o'quvchi resolve/startini yopadi. Holat o'zgarishi admin sessiya versiyasini almashtiradi. Arxiv qaytmas; fizik o'chirish yo'q. Oldin boshlangan urinishda maktab holati qayta tekshirilmaydi (E03).
- Muammo: bloklash faol urinishni favqulodda uzmaydi; arxivdan qaytarish yo'li yo'q.
- Qoida — **Tavsiya**: oddiy blok/arxiv yangi kirishni yopsin, qabul qilingan urinish muddatigacha yakunlansin; mavjud ma'lumot saqlansin. Arxiv odatiy UI orqali qaytarilmasin. **Foydalanuvchi qarori kerak**: favqulodda uzish zarurati va arxivdagi natijani vakolatli olish tartibi (Q2).
- Qabul mezoni: blokdan keyin yangi start rad; unblock eski admin sessiyasini tiriltirmaydi; tanlangan siyosatga ko'ra faol draft/submit va eski natija tekshiriladi; arxiv IDni bo'shatmaydi.

## B. O'quvchi va urinishlar

### B1. Ismdoshlar va ismni tuzatish

- Joriy holat: maktab oqimi rosterga bog'lamaydi; urinish guruh kaliti test+sinf+normalizatsiyalangan ism-familiya+brauzer kalitidan hosil bo'ladi. Bir xil ism boshqa brauzerda alohida guruh, ayni brauzerda bitta guruh. Roster validatori bir xil ismlarni rad etadi. Ismni tuzatish API yo'q (E04–E05).
- Muammo: umumiy qurilmadagi ismdoshlar qo'shilib ketishi, xato ismni o'zgartirish yangi guruh yaratishi mumkin. Ism shaxsning noyob identifikatori emas.
- Qoida — **Tavsiya**: hisobotda urinish IDsi va boshlanish vaqtini ko'rsatib, ism bo'yicha avtomatik birlashtirmaslik. Startgacha ismni erkin tuzatish; startdan keyin maktab admini aniq urinish/natijaning faqat ko'rsatiladigan ismiga sababli, auditli tuzatish kiritsin; asl ism va ball saqlansin. **Foydalanuvchi qarori kerak**: Q3.
- Qabul mezoni: ismdosh ikki qatnashchi begona urinish/natijani olmaydi; bir qurilmada almashish tartibi tekshiriladi; ism tuzatish deadline, javob, ball, tarixiy kalit va urinish sonini o'zgartirmaydi.

### B2. Brauzer, qurilma va urinish limiti

- Joriy holat: `maxAttempts` 1–100; boshlangan urinishlar soni, shu jumladan tashlab ketilganlari hisoblanadi. Maktab oqimi limitni texnik guruhga qo'llaydi; yangi brauzer/inkognito/storage tozalash yoki boshqa ism yangi guruh bo'lishi mumkin. Token va brauzer kalitisiz eski urinish tiklanmaydi (E04, E06).
- Muammo: bu inson boshiga qat'iy limit emas. Umumiy kod va erkin ism shaxsni tasdiqlamaydi, boshqa shaxs nomidan kirishni ishonchli to'xtatmaydi. Brauzer kaliti texnik egalik vositasi, o'quvchi akkaunti yoki shaxsiy kirish kodi emas.
- Qoida — **Tavsiya**: limitni "shu texnik qatnashuv guruhidagi urinishlar" deb ochiq nomlash; qat'iy nazorat uchun o'qituvchi kuzatuvi variantini taklif qilish. **Foydalanuvchi qarori kerak**: Q3. Yangi shaxsiy kod yoki akkaunt joriy etilmaydi.
- Qabul mezoni: ayni brauzer/ism/sinf/testda limit ishlaydi; inkognito va qurilma almashish cheklovi ochiq tushuntiriladi; faqat ism+umumiy kod bilan eski javoblar ochilmaydi. Bir xil brauzerdagi yangi qatnashchi oldingisining ma'lumotini ko'rmaydi.

### B3. Qayta topshirish va qurilma yo'qolishi

- Joriy holat: admin natijadagi `identityKey`ga +1 beradi; ruxsat aniq o'sha texnik guruhda ishlaydi. Natijani o'chirish urinishni yoki uning hisobini o'chirmaydi (E07).
- Muammo: boshqa brauzerda eski ruxsat ishlamaydi; o'qituvchi alohida rol emas, bu amal hozir maktab admini panelida.
- Qoida — **Tavsiya**: ayni qurilmada aniq natijadan +1 ruxsat va sabab/audit; qurilma yo'qolganda o'qituvchi nazoratida yangi qatnashuvga ruxsat, eski urinishga bog'lanish va holatini belgilash. Eski javoblarni yangi qurilmaga ism bilan ko'chirmaslik. **Foydalanuvchi qarori kerak**: Q3.
- Qabul mezoni: +1 boshqa test/maktab/ismdoshga o'tmaydi; takror bosish beixtiyor ikki ruxsat bermasligi uchun operatsiya takroriyligini aniqlash kerak; qurilma almashtirish eski deadline'ni yashirin uzaytirmaydi.

## C. Test va kirish kodi

### C1. Test holatlari

- Joriy holat: `active` bayrog'i va jadvaldan `paused`, `ended`, `scheduled`, `active` hisoblanadi; `paused` boshqa holatlardan oldin tekshiriladi. Alohida qoralama yo'q; yangi test `active: true`, kodi nofaol (E08).
- Muammo: "faol test" kodi yopiq bo'lsa kirishga tayyor degani emas; jadvali tugagan test to'xtatilsa UI `paused` ko'rsatadi. Yakunlangan holat terminal emas, jadvalni tahrirlab qayta ochish mumkin.
- Qoida — **Tavsiya**: qoralamani alohida ajratish, jadvalni qo'shimcha belgi sifatida ko'rsatish; yakunlangan testni qayta ochish o'rniga nusxa yaratish. **Foydalanuvchi qarori kerak**: Q4.
- Qabul mezoni: qoralama va yakunlanganga yangi start yo'q; faol bo'lsa ham jadval/kod/maktab/obuna alohida tekshiriladi; holat UI va serverda bir xil talqin qilinadi.

| Tavsiya etilgan test o'tishi | Holat | Yangi start | Mavjud urinish |
| --- | --- | --- | --- |
| Yaratish → qoralama | Tavsiya | Yo'q | Hali yo'q |
| Qoralama → faol | Tavsiya | To'liq validatsiya, jadval va faol kod bilan | Hali yo'q |
| Faol → to'xtatilgan | Tavsiya | Yo'q | Q2: oddiy pauzada davom ettirish tavsiya |
| To'xtatilgan → faol | Tavsiya | Jadval va boshqa shartlar bajarilsa | Deadline uzaymaydi |
| Faol/to'xtatilgan → yakunlangan | Tavsiya | Yo'q | Avval belgilangan muddatida yakunlash |
| Yakunlangan → faol | Foydalanuvchi qarori kerak | Tavsiya: rad, nusxa ishlatish | Eski natija o'zgarmaydi |

### C2. Kod holatlari va o'tishlar

- Joriy holat: kod testdan alohida maktab registrida; nofaol yaratiladi, o'z maktabi adminiga qayta ko'rsatiladi. Bekor qiymat rezervda qoladi; nusxaga yangi nofaol kod. Draft/resume/submit kodni qayta so'ramaydi (E09).
- Muammo: start kodni o'qishi bilan urinish yaratishi bitta atomik operatsiya emas; parallel revoke/start uchun oldingi TC-09 kafolati isbotlanmagan. Urinishda kod ID/versiyasi saqlanmaydi (E10).
- Qoida — **Tasdiqlangan talab**: umumiy 6 raqamli kod va server start tekshiruvi. **Tavsiya**: quyidagi mavjud siklni saqlash; revoke va start uchun yagona qabul tartibini ta'minlash. Kodni bekor qilish avval qabul qilingan urinishni uzmasin.
- Qabul mezoni: `004271` noli saqlanadi; bekor kod qayta faollashmaydi; parallel revoke yakunidan keyin eski versiya bilan yangi qabul bo'lmaydi; avval qabul qilingan egasi davom etadi.

| Kod o'tishi | Holat | Yangi startga ta'sir |
| --- | --- | --- |
| Yaratish → `inactive` | Koddagi joriy xatti-harakat | Rad |
| `inactive` → `active` (`activate`) | Koddagi joriy xatti-harakat | Boshqa shartlar ham bajarilishi kerak |
| `inactive`/`active` → `revoked` (`revoke`) | Koddagi joriy xatti-harakat | Eski kod rad; parallel qabul E10 bo'shlig'i bor |
| `revoked` → yangi qiymat `inactive` (`replace`) | Koddagi joriy xatti-harakat | Yangi qiymat alohida faollashtiriladi |
| `revoked` → `active` | Koddagi joriy xatti-harakat | Taqiqlangan |
| Test pauzasi/jadval tugashi | Koddagi joriy xatti-harakat | Kod holati o'zgarmaydi, yangi start yopiladi |

### C3. Boshlanganidan keyingi tahrir

- Joriy holat: savollar/sozlamalar urinishda nusxalanadi; baholash shu nusxadan. Joriy jadval oxiri deadline'ni qisqartirishi mumkin; pauza draft/resumeni, faollik yoki sinfni uzish submitni to'sadi. Testni o'chirish tugallanmagan urinishni yakunlashga xalaqit qiladi (E11).
- Muammo: tahrir tarixiy savolni almashtirmasa ham qatnashchining vaqtini yoki topshirishini kutilmaganda buzadi.
- Qoida — **Tavsiya**: savol/ball/vaqt/jadval/sinfning yangi tahriri faqat yangi urinishga ta'sir qilsin; mavjud urinish startdagi nusxa va deadline bilan yashasin. Birinchi startdan keyin fizik test o'chirish o'rniga arxiv; favqulodda uzish Q2 bilan alohida amal.
- Qabul mezoni: tahrirdan oldingi va keyingi urinish turli revision bilan to'g'ri baholanadi; jadvalni qisqartirish/uzaytirish eski deadline'ni o'zgartirmaydi; eski natija va faol urinish test o'chirilishi sabab yo'qolmaydi.

## D. Vaqt, saqlash va natija

### D1. Vaqt va internet

- Joriy holat: deadline = start vaqti + limit va jadval oxirining eng ertasi; ikkalasi yo'q bo'lsa server chegarasi 24 soat. Draft 1,2 soniya tanaffusdan keyin yuboriladi; lokal/server holati ajratilgan. Tiklash dalili deadline'dan keyin 7 kungacha, vaqtni uzaytirmaydi (E06, E12).
- Muammo: oflayn javob faqat qurilmada qolishi mumkin; tiklash muddati test vaqti bilan adashishi mumkin. Fon yakunlash jadvali yo'q.
- Qoida — **Tasdiqlangan talab**: kech javob bahoga qo'shilmaydi. **Tavsiya**: boshlang'ich eng erta deadline/24 soat va cheklangan tiklashni saqlash, jadval tahriri uchun C3. Internet uzilishi taymerni to'xtatmasin.
- Qabul mezoni: 10:00 start, 30 minut limit, jadval oxiri 10:20 → 10:20; oflayn/reload vaqtni uzaytirmaydi. 10:20 dan keyin kelgan javob o'rniga oxirgi server drafti baholanadi; so'rov yuborilgan mijoz vaqti yetarli emas.

### D2. Ikki oyna va takror yuborish

- Joriy holat: brauzer Web Locks yoki localStorage lease bilan oynani cheklaydi; server egalik va monoton draft versiyasi, natija `onlyIfNew` bilan himoyalangan (E12–E13).
- Muammo: lease zaxira usuli atomik emas; ayni brauzer kalitli ikki mijozni server alohida oyna sifatida ajratmaydi. UI lock inson shaxsini tasdiqlamaydi.
- Qoida — **Tasdiqlangan talab**: stale draft va takror submit yaxlitlikni buzmasin. **Tavsiya**: ikkinchi oynada yozish yopilsin; oyna himoyasining cheklovi hujjatda ochiq qolsin.
- Qabul mezoni: boshqa egaga 403; past/teng draft versiyasi yuqorisini bosmaydi; parallel submitda bir natija; lease poygasida ham server deadline va natija yaxlitligi buzilmaydi.

### D3. Ball va javoblar sharhi

- Joriy holat: yakundan keyin ball va savol to'g'ri/noto'g'ri belgilari qaytadi; sharh faqat startdagi ruxsat va joriy `showAnswers` birga yoqilganda. Alohida "jadvaldan keyin ko'rsatish" yo'q (E14).
- Muammo: erta yakunlagan qatnashchi sharhni boshqalarga tarqatishi mumkin; avval ochilgan kalitni qaytarib olib bo'lmaydi.
- Qoida — **Tavsiya**: ball yakunda, kalitli sharh umumiy jadval tugagach va admin ruxsatida; jadval yo'q bo'lsa admin alohida ochsin. **Foydalanuvchi qarori kerak**: Q5.
- Qabul mezoni: tanlangan ochilish vaqtidan oldin kalitli sharh yo'q; startda hech qachon kalit yo'q; keyin ruxsat o'chirilsa keyingi server javobida sharh yo'q. Ball va savol bo'yicha belgilar siyosati Q5da aniqlanadi.

## E. Obuna

- Joriy holat: `subscription: null` yoki `active/expired + endsAt`; `subscriptionActive()` faqat boshqaruv ko'rinishi/statistikada. Trial, imtiyozli muddat va startda obuna tekshiruvi yo'q (E15).
- Muammo: obunasi tugagan/belgilanmagan maktab ham test boshlashi mumkin; oldingi student-flow talabi bajarilmagan.
- Qoida — **Tavsiya**: sinov (`trial`), faol, tugagan holatlari; trial ham aniq tugash vaqtiga ega. Server qabul paytida trial/faol va `now < endsAt` bo'lsin. Tugaganda yangi start yopilsin, qabul qilingan urinish muddati, eski natijani ko'rish/eksport va o'z maktabi zaxirasini olish saqlansin. Blok/arxiv obunadan alohida va yangi kirishda ustun. **Foydalanuvchi qarori kerak**: Q6; oldingi hujjatdagi obuna siyosati joriy kod deb olinmaydi.
- Qabul mezoni: `now === endsAt`da yangi start rad; bir lahza oldin qabul qilingan urinish yakunlanadi; tugagan obunada maktab admini eski natijani o'qiydi/eksport qiladi, obunani o'zi uzaytirolmaydi; barcha start yo'llari cheklovni chetlab o'tolmaydi.

| Holat/o'tish | Holat | Tavsiya etilgan natija |
| --- | --- | --- |
| Yangi maktab → trial yoki obunasiz | Foydalanuvchi qarori kerak | Q6; obunasiz bo'lsa yangi start yopiq |
| Trial → faol | Tavsiya | Bosh admin tasdiqlagan tugash vaqti bilan |
| Trial/faol → tugagan | Tavsiya | Server vaqti bilan; yangi start yopiq |
| Tugagan → faol | Tavsiya | Bosh admin yangi muddat beradi; tarix saqlanadi |
| Imtiyozli muddat | Foydalanuvchi qarori kerak | Tavsiya: avtomatik imtiyoz yo'q; asosli uzaytirishni bosh admin qayd etadi |

## F. Ma'lumotlar

### F1. Natijani tuzatish va o'chirish

- Joriy holat: maktab admini o'z natijasini o'chiradi va retake beradi; ism/ball tahrirlash API yo'q. Test/sinf o'chirish ham bor, to'liq audit/tombstone yo'q (E07, E11, E16).
- Muammo: sababsiz o'chirish baholash izini yo'qotadi; sinf/test o'chirish faol urinishni buzishi mumkin.
- Qoida — **Tavsiya**: ballni qo'lda yozmaslik; xato bahoda yangi test revision va qayta topshirish. Ism tuzatish B1. Natijani sabab bilan bekor deb belgilash, asl javob/ballni saqlash; fizik o'chirish faqat kelishilgan retention tartibida. **Foydalanuvchi qarori kerak**: Q7.
- Qabul mezoni: bekor natija standart hisobdan ajraladi, audit va vakolatli tarixda qoladi; o'chirishning o'zi qo'shimcha urinish yaratmaydi; begona admin tuzatolmaydi/o'chirolmaydi.

### F2. Audit, saqlash va tiklash

- Joriy holat: amallarga oid ayrim vaqt/versiyalar bor, to'liq audit ombori va avtomatik retention yo'q. Backup v2 sinf/test/natijani oladi, sessiya/urinish/kod registrini olmaydi. Yangi adminlarga restore/clear routerda yopiq; legacy restore ko'p yozuvli tranzaksiya emas (E16).
- Muammo: oddiy JSON zaxira to'liq falokatdan tiklash nusxasi emas; qancha muddat va kim tiklashi belgilanmagan.
- Qoida — **Tavsiya**: maktab/admin/obuna/holat, test revision/jadval, kod activate/revoke/replace, retake, ism tuzatish, natijani bekor/o'chirish, eksport/backup/restore va favqulodda amallarni actor, rol, maktab, obyekt IDsi, server vaqti, sabab va operatsiya IDsi bilan qayd etish. Kod, token, parol va to'liq javob auditga kiritilmasin. Maktab admini o'z auditini, bosh admin boshqaruv auditini ko'rsin.
- Qoida — **Foydalanuvchi qarori kerak**: Q7 saqlash muddati va audit ko'rinishi; Q8 restore vakolati hamda to'liq zaxira siyosati. Tavsiya: o'z maktabi eksporti saqlansin, restore hozircha yopiq; tekshirilgan tiklash alohida ruxsatli lokal jarayonda.
- Qabul mezoni: ruxsatsiz/begona restore rad; eski backup bekor kodni qayta ochmaydi, shaxsiy kod yaratmaydi, eski ID/ballni saqlaydi; qisman uzilishdan qayta urinish begona yozuvni bosmaydi. Retention faol urinishni o'chirmaydi; zaxiradan tiklash o'chirilgan ma'lumotni yashirin qaytarmaydi.

## Ushbu bosqich chegarasi

Faqat hujjatlar yangilandi. Frontend/backend, sxema, sirlar, lokal/production yozuvlari o'zgartirilmadi; deploy va migratsiya bajarilmadi. Qoidalar uchun dalil statik kod o'qishdir; runtime kafolati emas. `npm run check` va `npm run build` natijalari [2-bosqich hujjatida](product-decisions.md#tekshiruv) qayd etiladi.
