# Nazorat-test

## Lokal ishga tushirish (PowerShell)

Node.js 22 LTS yoki yangiroq versiyasini o‘rnating, terminalni qayta oching:

```powershell
cd C:\Users\user\Desktop\Nazorat-test
node --version
npm.cmd install
Copy-Item .env.example .env
# .env ichidagi TEACHER_PASSWORD qiymatini o‘zgartiring.
npm.cmd run dev
```

O‘quvchi sahifasi: http://localhost:8888/

O‘qituvchi paneli: http://localhost:8888/teacher.html

`.env.example` dagi boshlang‘ich parol: `oqituvchi123`. `.env` o‘zgartirilganda serverni qayta ishga tushiring.

CLI bevosita ham ishlaydi: `npx.cmd netlify dev`. Oddiy HTML server Functions va Blobs API o‘rnini bosa olmaydi. Lokal Blobs ma’lumotlari `.netlify` ichida saqlanadi; ular production natijalaridan alohida.

## Tekshirish

Server ishlayotgan alohida terminalda:

```powershell
npx.cmd playwright install chromium
# .env parolini o‘zgartirgan bo‘lsangiz shu qiymatni kiriting:
$env:TEACHER_PASSWORD = 'oqituvchi123'
npm.cmd run verify
```

Tekshiruv parser, HTML ichidagi JavaScript sintaksisi, panelga kirish, `namuna-test.txt` yuklash, 7-A sinfidan 20 savolni ishlash va panelda 20/20 natijani ko‘rishni qamrab oladi. Vaqtinchalik test oxirida o‘chiriladi, sinov natijasi panelda qoladi. Uni paneldan ko‘rish mumkin.
