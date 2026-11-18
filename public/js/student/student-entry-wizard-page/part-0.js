// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { effect as useEffect, state as useState } from '../../core/state.js';
import { useNavigate, useSearchParams } from '../../core/navigation.js';
import { api } from '../../core/api.js';
import { getBrowserKey } from '../../core/attempt-storage.js';
export function part0(scope) {
  [scope.params] = useSearchParams();
  scope.navigate = useNavigate();
  [scope.step, scope.setStep] = useState(1);
  [scope.schoolId, scope.setSchoolId] = useState(() => scope.params.get('schoolId') || '');
  [scope.testCode, scope.setTestCode] = useState(() => scope.params.get('code') || '');
  [scope.resolved, scope.setResolved] = useState(null);
  [scope.classId, scope.setClassId] = useState('');
  [scope.name, scope.setName] = useState('');
  [scope.surname, scope.setSurname] = useState('');
  [scope.busy, scope.setBusy] = useState(false);
  [scope.error, scope.setError] = useState('');
  [scope.confirmOverwrite, scope.setConfirmOverwrite] = useState(false);
  useEffect(() => {
    if (scope.params.get('legacy') === '1') {
      scope.navigate('/eski-testlar', { replace: true });
    }
  }, [scope.params, scope.navigate]);
  scope.handleCodeChange = (nextSchool, nextCode) => {
    scope.setSchoolId(nextSchool);
    scope.setTestCode(nextCode);
    scope.setResolved(null);
    scope.setClassId('');
    scope.setError('');
    if (scope.step !== 1) scope.setStep(1);
  };
  scope.handleResolve = async () => {
    const cleanSchool = scope.schoolId.trim().toUpperCase();
    const cleanCode = scope.testCode.trim();
    if (!cleanSchool) {
      scope.setError('Maktab IDsini kiriting (masalan, SK-1001).');
      return;
    }
    if (!/^[0-9]{6}$/.test(cleanCode)) {
      scope.setError("Test kodi aniq 6 ta raqamdan iborat bo'lishi kerak.");
      return;
    }
    scope.setBusy(true);
    scope.setError('');
    try {
      const data = await api('school-entry/resolve', {
        method: 'POST',
        body: JSON.stringify({
          public_school_id: cleanSchool,
          testCode: cleanCode,
          browserKey: getBrowserKey(),
        }),
      });
      scope.setResolved(data);
      scope.setSchoolId(data.school.public_school_id);
      if (data.classes.length === 1) scope.setClassId(data.classes[0].id);
    } catch (err) {
      scope.setResolved(null);
      scope.setError(err instanceof Error ? err.message : "Kodlarni tekshirib bo'lmadi.");
    } finally {
      scope.setBusy(false);
    }
  };
  scope.handleNext = async (e) => {
    e.preventDefault();
    scope.setError('');
    if (scope.step === 1) {
      if (!scope.resolved) {
        await scope.handleResolve();
        return;
      }
      scope.setStep(2);
      return;
    }
    if (scope.step === 2) {
      if (!scope.resolved?.classes.some((c) => c.id === scope.classId)) {
        scope.setError('Davom etish uchun sinf yoki guruhingizni tanlang.');
        return;
      }
      scope.setStep(3);
      return;
    }
    if (scope.step === 3) {
      if (!scope.name.trim() || scope.name.trim().length > 60) {
        scope.setError('Ismingizni kiriting (1–60 belgi).');
        return;
      }
      if (!scope.surname.trim() || scope.surname.trim().length > 60) {
        scope.setError('Familiyangizni kiriting (1–60 belgi).');
        return;
      }
      scope.setStep(4);
      return;
    }
    await scope.tryStartAttempt();
  };
}
