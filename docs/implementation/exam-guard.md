# Test muhiti nazorati (2026-11-12)

- `student/exam-guard.js` test sahifasidagi savollarni to'liq ekran foydalanuvchi tugmasi orqali yoqilguncha berkitadi va asosiy interfeysni inert qiladi.
- Fokus yo'qolsa, sahifa yashirilsa yoki fullscreen tugasa qaytish oynasi chiqadi. Dialoglar yopiladi; taymer va draft sinxronlash davom etadi.
- Ichki sahifa havolalari va brauzer yetkazadigan navigatsiya tugmalari cheklanadi. Sahifani yopish/yangilashda brauzer ogohlantirishi so'raladi.
- Natija serverdan tasdiqlanganda guard tinglovchilari olib tashlanadi, inert/fullscreen bekor qilinadi va natija sahifasiga o'tiladi.
- Fullscreen API mavjud bo'lmagan qurilmada aniq izoh bilan fokus nazorati ishlaydi. Oddiy veb-sayt OS ilovalari, brauzerning barcha tugmalari yoki ikkinchi qurilmadan qidirishni taqiqlay olmaydi. Qat'iy cheklov boshqariladigan kiosk qurilmasini talab qiladi.
- Qoidabuzarlik uchun avtomatik yakunlash yoki ball jarimasi qo'shilmagan. Bu UI nazorati, serverdagi xavfsizlik chegarasi emas.

Tekshiruv: `npm run dev -- --port 8897` bilan mahalliy Chrome/Playwright, API javoblari mock qilindi. Haqiqiy Fullscreen API, fullscreen chiqishi, blur, ichki havola, javob saqlanishi, ikkinchi oynada egalik rad etilishi, yakunlashda natijaga o'tish, fullscreen bo'lmagan brauzer fallbacki va yopiq savollar ortida muddat tugaganda bir marta yuborish o'tdi. Brauzer JS xatosi yo'q.

`npm run check` va `npm run build` o'tdi. Server autentifikatsiyasi, draft versiyasi, baholash va recovery kodlari o'zgarmadi. Real OS Alt+Tab va mobil ilova almashtirish qo'lda qurilmada tekshirilishi kerak.
