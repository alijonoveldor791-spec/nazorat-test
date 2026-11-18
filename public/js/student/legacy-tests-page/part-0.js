// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { el } from '../../core/dom.js';
import { effect as useEffect, state as useState } from '../../core/state.js';
import { useNavigate } from '../../core/navigation.js';
import { PublicHeader } from '../../components/layout/public-header.js';
import { ResumeAttemptBanner } from '../../components/student/resume-attempt-banner.js';
import { api } from '../../core/api.js';
import { getBrowserKey, saveAttempt } from '../../core/attempt-storage.js';
import { view2 } from './view2.js';
export function part0(scope) {
  scope.navigate = useNavigate();
  [scope.classes, scope.setClasses] = useState([]);
  [scope.selectedClass, scope.setSelectedClass] = useState('');
  [scope.tests, scope.setTests] = useState([]);
  [scope.selectedTest, scope.setSelectedTest] = useState('');
  [scope.name, scope.setName] = useState('');
  [scope.surname, scope.setSurname] = useState('');
  [scope.accessCode, scope.setAccessCode] = useState('');
  [scope.loading, scope.setLoading] = useState(true);
  [scope.busy, scope.setBusy] = useState(false);
  [scope.error, scope.setError] = useState('');
  useEffect(() => {
    api('classes')
      .then((rows) => {
        scope.setClasses(rows);
        if (rows.length > 0) scope.setSelectedClass(rows[0].id);
      })
      .catch((err) => scope.setError(err instanceof Error ? err.message : 'Sinflar yuklanmadi.'))
      .finally(() => scope.setLoading(false));
  }, []);
  useEffect(() => {
    if (!scope.selectedClass) {
      scope.setTests([]);
      scope.setSelectedTest('');
      return;
    }
    api(`tests?classId=${encodeURIComponent(scope.selectedClass)}`)
      .then((rows) => {
        scope.setTests(rows);
        scope.setSelectedTest(rows[0]?.id || '');
      })
      .catch((err) => scope.setError(err instanceof Error ? err.message : 'Testlar yuklanmadi.'));
  }, [scope.selectedClass]);
  scope.handleStart = async (e) => {
    e.preventDefault();
    if (!scope.selectedTest) {
      scope.setError('Avval testni tanlang.');
      return;
    }
    scope.setBusy(true);
    scope.setError('');
    try {
      const attempt = await api(`tests/${encodeURIComponent(scope.selectedTest)}/start`, {
        method: 'POST',
        body: JSON.stringify({
          classId: scope.selectedClass,
          name: scope.name.trim(),
          surname: scope.surname.trim(),
          accessCode: scope.accessCode.trim() || undefined,
          browserKey: getBrowserKey(),
        }),
      });
      saveAttempt({
        ...attempt,
        answers: attempt.answers || Array(attempt.questions.length).fill(null),
        flags: [],
        current: 0,
        draftVersion: attempt.draftVersion || 0,
        dirty: false,
        clockReceivedAt: Date.now(),
      });
      scope.navigate('/test');
    } catch (err) {
      scope.setError(err instanceof Error ? err.message : "Testni boshlab bo'lmadi.");
    } finally {
      scope.setBusy(false);
    }
  };
  return {
    done: true,
    value: el(
      'div',
      { className: 'min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100' },
      el(PublicHeader, { ctaLabel: 'Kod bilan kirish', ctaTo: '/test-kirish' }),
      el(
        'main',
        { className: 'mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6' },
        el(ResumeAttemptBanner, null),
        view2(scope)
      )
    ),
  };
}
