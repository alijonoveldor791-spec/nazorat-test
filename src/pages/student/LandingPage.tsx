import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, CheckCircle2, Clock, Moon, ShieldCheck, Sun } from 'lucide-react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { ResumeAttemptBanner } from '../../components/student/ResumeAttemptBanner';
import { useTheme } from '../../context/ThemeContext';

const HERO_IMG = '/src/assets/images/hero_edu_assessment_1794979927112.jpg';
const FOCUS_IMG = '/src/assets/images/edu_student_focus_1794979927759.jpg';

export function LandingPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (params.get('legacy') === '1') {
      navigate('/eski-testlar', { replace: true });
    } else if (params.has('schoolId')) {
      navigate('/test-kirish?' + params.toString(), { replace: true });
    }
  }, [params, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <PublicHeader />

      <main className="mx-auto max-w-6xl space-y-20 px-4 py-10 sm:px-6 lg:py-14">
        <ResumeAttemptBanner />

        <section
          aria-labelledby="hero-title"
          className="grid items-stretch gap-10 lg:grid-cols-12 lg:gap-12"
        >
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="text-xs font-semibold tracking-wider text-blue-700 dark:text-blue-400">
              Maktablar va abituriyentlar uchun raqamli baholash tizimi
            </p>
            <h1
              id="hero-title"
              className="mt-3 font-display text-4xl leading-[1.12] font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white"
              style={{ textWrap: 'balance' }}
            >
              Bilimingizni ishonch va aniqlik bilan sinang
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
              Maktab IDsi va 6 raqamli test kodi bilan ro'yxatdan o'tmasdan testga kiring. Taymer
              faqat savollarni boshlaganingizda ishga tushadi, javoblaringiz esa oflayn holatda ham
              saqlanadi.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/test-kirish"
                className="inline-flex items-center gap-2.5 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <span>Testga o'tish</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/oqituvchi/kirish"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                O'qituvchi kabineti
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              O'quvchi uchun login va parol talab qilinmaydi · Natija serverda hisoblanadi
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-900">
              <img
                src={HERO_IMG}
                alt="Zamonaviy o'quv zalida raqamli test yechayotgan o'quvchi"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent" />
              <div className="absolute right-6 bottom-6 left-6 text-white">
                <p className="text-xs font-medium text-slate-200">
                  Oddiy testlar · DTM 189 balli blok tizim · Word formulalar
                </p>
                <p className="mt-1 font-display text-xl font-semibold">
                  Har bir urinish o'sish va aniq tahlil sari qadam
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 border-y border-slate-200 py-8 sm:grid-cols-4 dark:border-slate-800">
          <div>
            <p className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              4 qadam
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Akkauntsiz tezkor kirish
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              189 ball
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              DTM standart blok baholash
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              MathML
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Word formulalarni aniq chiqarish
            </p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              100%
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Server vaqti va natija nazorati
            </p>
          </div>
        </section>

        <section id="qadamlar" aria-labelledby="steps-title" className="space-y-8">
          <div className="max-w-2xl">
            <h2
              id="steps-title"
              className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white"
            >
              Nazorat qanday ishlaydi
            </h2>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
              Uchta sodda bosqich bilan testni boshlang va darhol tahlil oling.
            </p>
          </div>

          <ol className="grid gap-6 md:grid-cols-3">
            <li className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <span className="font-mono text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                01. Kodlarni kiriting
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-slate-900 dark:text-white">
                Maktab IDsi va test kodi
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                O'qituvchingiz bergan maktab identifikatori (masalan, SK-1001) va 6 raqamli umumiy
                kodni kiriting.
              </p>
            </li>
            <li className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <span className="font-mono text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                02. Shaxsingizni tanlang
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-slate-900 dark:text-white">
                Sinf va ism-familiya
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Testga biriktirilgan sinf yoki guruhingizni tanlab, ism-familiyangizni kiriting va
                tasdiqlang.
              </p>
            </li>
            <li className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <span className="font-mono text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                03. Testni yeching
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-slate-900 dark:text-white">
                Savollar xaritasi va natija
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Savollar orasida erkin harakatlaning, ikkilangan savollarni belgilang va yakunda
                batafsil natijani ko'ring.
              </p>
            </li>
          </ol>
        </section>

        <section id="imkoniyatlar" aria-labelledby="features-title" className="grid gap-8 lg:grid-cols-12">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
            <img
              src={FOCUS_IMG}
              alt="Tinch kutubxonada test tayyorgarligi"
              referrerPolicy="no-referrer"
              className="h-full min-h-[260px] w-full object-cover"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="mt-3 font-display text-base font-semibold text-slate-900 dark:text-white">
                Aniq server taymeri
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Taymer faqat «Testni boshlash» tugmasidan so'ng ishlaydi va vaqt server bilan sinxron
                yuritiladi.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="mt-3 font-display text-base font-semibold text-slate-900 dark:text-white">
                Halol imtihon muhiti
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                To'liq ekran nazorati, oyna almashishini qayd etish va avtomatik qoralama saqlash
                bilan ishonchli tekshiruv.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <BookOpenCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="mt-3 font-display text-base font-semibold text-slate-900 dark:text-white">
                O'qituvchilar uchun qulay baza
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Word (.docx) hujjatlardan formulali savollarni bir zumda import qiling va tayyor
                chorak testlarini tuzing.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="mt-3 font-display text-base font-semibold text-slate-900 dark:text-white">
                Excel va Word hisobotlar
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Sinflar bo'yicha ko'p varaqli XLSX reyting jadvali va individual o'quvchi Word
                varaqasini yuklab oling.
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span className="font-display font-bold text-slate-900 dark:text-white">Nazorat</span>
            <span>·</span>
            <span>O'rganing, sinab ko'ring, yuksaling.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/oqituvchi/kirish"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Maktab sahifasi
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              <span>{theme === 'dark' ? 'Kunduzgi rejim' : "Qorong'i rejim"}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
