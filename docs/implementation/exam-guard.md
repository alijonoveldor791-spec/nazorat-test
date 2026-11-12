# Test muhiti nazorati (2026-11-12)

- `student/exam-guard.js` test sahifasidagi savollarni to'liq ekran foydalanuvchi tugmasi orqali yoqilguncha berkitadi va asosiy interfeysni inert qiladi.
- Fokus yo'qolsa, sahifa yashirilsa yoki fullscreen tugasa qaytish oynasi chiqadi. Dialoglar yopiladi; taymer va draft sinxronlash davom etadi.
- Ichki sahifa havolalari va brauzer yetkazadigan navigatsiya tugmalari cheklanadi. Sahifani yopish/yangilashda brauzer ogohlantirishi so'raladi.
- Natija serverdan tasdiqlanganda guard tinglovchilari olib tashlanadi, inert/fullscreen bekor qilinadi va natija sahifasiga o'tiladi.
- Fullscreen API mavjud bo'lmagan qurilmada aniq izoh bilan fokus nazorati ishlaydi. Oddiy veb-sayt OS ilovalari, brauzerning barcha tugmalari yoki ikkinchi qurilmadan qidirishni taqiqlay olmaydi. Qat'iy cheklov boshqariladigan kiosk qurilmasini talab qiladi.
- Qoidabuzarlik uchun avtomatik yakunlash yoki ball jarimasi qo'shilmagan. Bu UI nazorati, serverdagi xavfsizlik chegarasi emas.

Tekshiruv: `npm run dev -- --port 8897` bilan mahalliy Chrome/Playwright, API javoblari mock qilindi. Haqiqiy Fullscreen API, fullscreen chiqishi, blur, ichki havola, javob saqlanishi, ikkinchi oynada egalik rad etilishi, yakunlashda natijaga o'tish, fullscreen bo'lmagan brauzer fallbacki va yopiq savollar ortida muddat tugaganda bir marta yuborish o'tdi. Brauzer JS xatosi yo'q.

`npm run check` va `npm run build` o'tdi. Server autentifikatsiyasi, draft versiyasi, baholash va recovery kodlari o'zgarmadi. Real OS Alt+Tab va mobil ilova almashtirish qo'lda qurilmada tekshirilishi kerak.

## Nusxalash va tasvir olishni cheklash (2026-11-12)

- Faqat faol testda exam-protected klassi qo'yiladi. CSS user-select:none va WebKit touch-callout/drag cheklovlari savol va rasmlarni belgilash/uzoq bosib nusxalashni kamaytiradi.
- copy/cut/contextmenu/selectstart/dragstart hodisalari capture bosqichida bekor qilinadi. Ctrl/Cmd+A/C/X/S/P va Ctrl+Insert cheklanadi. Oddiy A-F javob tanlash, radio, tugma va savollar navigatsiyasi saqlanadi.
- Brauzerga yetkazilgan PrintScreen, Meta+Shift+3/4/5/S va Ctrl+Shift+S keydown/keyup hodisalarida savollar inert qaytish oynasi bilan berkitiladi. Shift+3 uchun key=#, code=Digit3 varianti ham taniladi.
- beforeprint testni berkitadi; print CSS faol testning barcha body farzandlarini chiqarishdan yashiradi. Taymer va javoblarni saqlash davom etadi; natija tasdiqlanganda klass va hodisa tinglovchilari tozalanadi.
- Bu cheklovlar screenshot API yoki OS himoyasi emas. OS/telefon skrinshoti, boshqa kamera, kengaytma, DevTools yoki sahifa kodini o'zgartirishni oddiy sayt to'liq taqiqlay olmaydi. Hodisa screenshotdan oldin kelishi kafolatlanmaydi. Clipboardning avvalgi tarkibi o'qilmaydi yoki majburan tozalanmaydi.

Lokal Chrome/Playwright, mavjud npm run dev localhost:8888: CSS selection, copy/cut/context/select/drag cancel, Ctrl hotkeylar, PrintScreen va Mac Digit3/# kabi simulyatsiya qilingan tugmalarda maska/inert, print media holatida main/header yashirilishi, beforeprint, A tugmasi bilan javob, saqlash, fullscreen/blur, ikkinchi oynada egalik, natijaga o'tish/klass tozalanishi va muddat tugaganda bir marta yuborish o'tdi. JS xatosi yo'q. APIlar mock qilindi; real OS screenshot tugmalari va iOS/Android long-press qo'lda tekshirilmagan. Skrinshot to'liq bloklangan degan da'vo yo'q.

Manbalar: [copy hodisasini bekor qilish](https://developer.mozilla.org/en-US/docs/Web/API/Element/copy_event), [W3C ekran ulashish API doirasi](https://www.w3.org/TR/screen-capture/). Yangi test/audit fayli Gitga qo'shilmadi. npm run check, npm run build va git diff --check o'tdi.
