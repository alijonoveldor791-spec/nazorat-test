# Rasm tahriri va DTM bo'lim nomlari

2026-11-19.

`question-editor-list/image-controls.js` tanlangan rasmning width/height
atributlari tarixini boshqaradi. Bitta maydonda ketma-ket raqam kiritish bitta
amal hisoblanadi; 50 ta oldingi holat saqlanadi. Ctrl/Cmd+Z bekor qiladi,
Ctrl+Y yoki Ctrl/Cmd+Shift+Z qayta qo'llaydi. Asl o'lchamga qaytish ham tarixga
kiradi. Bu tugmalar faqat rasm boshqaruvlari ichida ushlanadi; oddiy savol
matnini tahrirlashdagi brauzer undo oqimi o'zgarmaydi.

Enter formani yubormaydi, o'lcham tahririni tugatadi va tanlangan rasmni
ko'rinishda qoldiradi. Noto'g'ri o'lcham atributga yozilmaydi; maydondan
chiqilganda haqiqiy o'lcham qaytariladi. Tanlov belgisi HTMLni solishtirishda
hisobga olinmaydi: rasm DOM tuguni qayta yaratilmaydi. Commit callback ref
orqali yangilanadi, boshqa savollardagi keyingi tahrirlar eski holatga qaytmaydi.

`editable-content.js` formulalarning asl MathML manbasini muharrir wrapperida
saqlaydi. MathJax ko'rinishi serializatsiyada asl MathML bilan almashtiriladi;
SVG, wrapper va tanlov atributlari testga yozilmaydi. Shu sabab formulali
savoldagi rasmni tahrirlash uning formulalarini buzmaydi.

DTM validatori MAJBURIY FANLAR BLOKI nomini mavjud Majburiy fanlar bilan
bir xil qabul qiladi. 30+30+10+10+10 savol, besh bo'lim va 189 ball talablari
saqlanadi. Berilgan Word fayli: 90 savol, 28 rasm, 188 MathML formula.
Parser va to'liq saveTest servisi alohida xotira omborida shu faylni qabul qildi.

Chrome'da haqiqiy DOCX preview javobi bilan rasm o'lchamlari, Enter,
Ctrl+Z/Y va asl MathML serializatsiyasi tekshirildi. Alohida muharrir oqimida
boshqa savol tahriri, asl o'lchamni undo qilish va noto'g'ri o'lcham sinovlari
ham o'tdi. UI preview API javobi taqlid qilingan; foydalanuvchi bazasiga
sinov yozuvlari qo'shilmagan. Check/build o'tdi.
