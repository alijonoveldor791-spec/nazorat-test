# Oddiy test uchun tasodifiy savollar bazasi

Sana: 2026-11-12. Tarmoq: feature/random-question-bank.

## Foydalanish

Oddiy testda Word bazasini import qiling. Har urinishda beriladigan savollar
soniga 30 yozilsa, bazadagi 100 savoldan 30 tasi beriladi. 0 avvalgi barcha
savollar oqimini saqlaydi. Musbat qiymatda shuffle majburiy. Blok/DTM testda
ushbu sozlama yopiq va server ham musbat qiymatni rad etadi.

## Takrorlanishni oldini olish

Savol matni va variantlari bir xil bo'lgan aniq dublikatlar bir dona olinadi;
variantlar joyi almashgan bo'lsa ham bir savol deb qaraladi. Shu dublikatda
ikki xil javob kaliti topilsa saqlash rad etiladi. So'ralgan miqdor noyob
savollardan ko'p bo'lsa aniq mavjud miqdor bilan xato qaytadi.

N ta savoldan K talik tartiblar soni P(N,K)=N!/(N-K)!. Server registry
maktab/test/baza tarkibi/miqdor uchun bitta seed va har urinishga yagona
ordinal saqlaydi. Ordinal CAS orqali ajratiladi; bir urinishning parallel
startlari ham bir ordinalni qaytaradi. Seedli affine bijeksiya
rank=(offset+ordinal*step) mod P ishlaydi; gcd(step,P)=1. Offset va step
SHAKE256 orqali hajmga mos tasodifiy qiymatlardan olinadi. Partial permutation
unranking har rankni alohida K ta takrorlanmagan indeksga aylantiradi.

Natijada o'zgarmagan baza va miqdor doirasida ketma-ketlik takrorlanmaydi.
Tasodifga tayanib kolliziyani yo'q deb taxmin qilish o'rniga bu registry
bilan kafolatlanadi. Imkoniyatlar tugasa 409 va bazani kengaytirish xabari
beriladi; oldingi tartib qayta tarqatilmaydi. O'quvchilar orasida savollarning
bir qismi mos kelishi mumkin, lekin bitta urinishda savol takrorlanmaydi.

## Snapshot va xavfsizlik

Urinishga faqat tanlangan savollar yoziladi; answers ham K uzunlikda.
sourceIndex va sourceOptions asl bazaga/variantga bog'lanishni saqlaydi.
Baholash faqat shu snapshot bilan, K ta javob bo'yicha bajariladi. Bazani
keyin tahrirlash, miqdorni o'zgartirish yoki sahifani yangilash avval boshlangan
urinishni o'zgartirmaydi. Natijada sourceQuestionCount asl baza indeksining
chegarasini saqlaydi; restore validator K < N indekslarini ham qabul qiladi.

question-sets school-scoped repository. Seed, ordinal va indekslar public
javoblarga qo'shilmaydi; xom savollar bazasiga publicTest yo'li ham yopiladi.
O'quvchi kirishida va test kartasida beriladigan savollar soni ko'rsatiladi,
admin kartasida bazadagi son ham alohida. Javob kaliti serverda qoladi.

## Fayllar

- server/lib/question-bank.mjs: deduplikatsiya, miqdor va metadata.
- server/lib/unique-question-order.mjs: bigint va qisman permutatsiya.
- server/repositories/question-sets-repo.mjs: atomik, idempotent rezervlar.
- server/services/question-bank-service.mjs: rezerv va presentationni ulash.
- shuffle, validate, test-status, test/attempt/completion/school-entry
  services: yangi sozlama, tanlangan snapshot va savollar soni.
- blob-store: yangi scoped store; backup-validate: source indekslar mosligi.
- teacher/question-bank-form.js: miqdor inputi, hint va shuffle boshqaruvi.
- teacher/test-form, test-form-view, test-card-view, test-audience: muharrir,
  karta va tasdiqlash. PLAN, ARCHITECTURE va qo'llanma yangilandi.

## Tekshiruv dalillari

- 100 savolli haqiqiy DOCX -> preview -> save/read: bazada 100, beriladi 30.
- 50 ta real school-entry/start, 5 ta parallel worker. Har urinishda 30 ta
  noyob savol; 50 xil ketma-ketlik va sinovda 50 xil tanlangan to'plam.
- Bir o'quvchining 5 parallel starti bitta attempt va bir tartibni qaytardi.
- Resume/restart savollarni saqladi. Begona browserKey 403 oldi.
- 100 javobli draft 400; version 3 keyin version 1 yuborilganda eskisi
  yangisini bosmadi. Snapshot keyingi teskari baza/20 miqdoridan saqlandi.
- 30 to'g'ri javob -> 30/30. Takroriy submit bitta natija qaytardi.
- Deadline o'tganda oxirgi server draftidagi 5 javob 5/30 bo'ldi.
- 2 savoldan 1 tanlashda 2 xil tartib; uchinchi o'quvchi 409, eski resume
  esa o'z savolini oldi. Kichik barcha permutatsiyalar to'liq tekshirildi.
- 100/30 va 200/200 uchun 50 ordinal noyobligi tekshirildi.
- Ko'p/duplikatga nisbatan ortiqcha, manfiy, kasr va blok tanlovi rad etildi.
- Eski ordinary default 100 savol bo'lib qoldi; DTM all/empty 189/0 saqlandi.
- Restore validator sampled indekslarni saqladi va dublikat indeksni rad etdi.
  Alohida lokal maktabga restore-preview va restore yozuvi bajarildi; keyingi
  GETda 30/30, sourceQuestionCount=100 va settings=30 tasdiqlandi.
- Chrome: DOCX import -> input30 -> save -> wizard30 -> 30 variant tanlash
  -> natija30/30. Blokda maydon yashirin; shuffle avtomatik. JS xatolari yo'q.

npm run check va npm run build: PASS. Yangi va o'zgargan JS/MJS modullar
node --check bilan ham tekshirildi. Test/audit yoki tests/ qayta yaratilmagan; harness, DOCX va
natijalar .local/ ichida qoladi.

## Cheklovlar

Mavjud import limiti 200 savol. .doc eski konvertor sozlamasidan foydalanadi;
real yangi oqim .docx bilan tekshirildi. Mazmunan o'xshash, lekin matni yoki
HTMLi boshqacha savollarning semantik dublikati avtomatik topilmaydi.

Registry hajmi urinishlar soni bilan o'sadi; millionlab rezervlarga yuklama
sinovi bajarilmagan. 50 o'quvchi funksional sinovi 500 faol o'quvchi sig'imi
sertifikati emas. Yangi baza tarkibi yoki K yangi rezerv doirasini yaratadi.
Registry mavjud Blobs'da saqlanadi; eski JSON backup modeli uni ko'chirmaydi.
Shu backenddagi odatiy restore registryga tegmaydi. Mutlaqo yangi backendga
ko'chirishda eski registry ham alohida ko'chirilmasa tarixiy noyoblik kafolati
portable backup orqali tiklanmaydi.

Oldindan kuzatilgan lokal Netlify Dev restore proksisi ACK javobida HTTP500
qaytardi; server 200 qayd etdi va keyingi GET tiklangan qiymatlarni tasdiqladi.
To'liq restore transportining muvaffaqiyati deb belgilanmadi. Productionga
so'rov, deploy va main/push bajarilmadi.
