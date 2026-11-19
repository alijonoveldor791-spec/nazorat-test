// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import {
  callback as useCallback,
  effect as useEffect,
  memo as useMemo,
  state as useState,
} from '../../core/state.js';
import { useNavigate, useSearchParams } from '../../core/navigation.js';
import { useAdminSession } from '../../core/use-admin-session.js';
import { useToast } from '../../components/toast-context.js';
import { ApiError, adminApi } from '../../core/api.js';
import { toTashkentInput } from '../../core/format.js';
export function part0(scope) {
  ({ session: scope.session, loading: scope.sessionLoading } = useAdminSession('teacher'));
  ({ toast: scope.toast } = useToast());
  scope.navigate = useNavigate();
  [scope.searchParams] = useSearchParams();
  scope.testId = scope.searchParams.get('id');
  [scope.classes, scope.setClasses] = useState([]);
  [scope.loading, scope.setLoading] = useState(true);
  [scope.saving, scope.setSaving] = useState(false);
  [scope.title, scope.setTitle] = useState('');
  [scope.forClass, scope.setForClass] = useState(true);
  [scope.forGroup, scope.setForGroup] = useState(false);
  [scope.subject, scope.setSubject] = useState('');
  [scope.direction, scope.setDirection] = useState('');
  [scope.selectedClassIds, scope.setSelectedClassIds] = useState(new Set());
  [scope.testType, scope.setTestType] = useState('ordinary');
  [scope.scoringMode, scope.setScoringMode] = useState('normal');
  [scope.timeLimitMin, scope.setTimeLimitMin] = useState(0);
  [scope.maxAttempts, scope.setMaxAttempts] = useState(1);
  [scope.violationLimit, scope.setViolationLimit] = useState(4);
  [scope.questionsPerAttempt, scope.setQuestionsPerAttempt] = useState(0);
  [scope.shuffleQuestions, scope.setShuffleQuestions] = useState(false);
  [scope.shuffleOptions, scope.setShuffleOptions] = useState(false);
  [scope.showAnswers, scope.setShowAnswers] = useState(true);
  [scope.hideResults, scope.setHideResults] = useState(false);
  [scope.scheduleStart, scope.setScheduleStart] = useState('');
  [scope.scheduleEnd, scope.setScheduleEnd] = useState('');
  [scope.questions, scope.setQuestions] = useState([]);
  [scope.selectedFile, scope.setSelectedFile] = useState(null);
  [scope.previewBusy, scope.setPreviewBusy] = useState(false);
  [scope.previewError, scope.setPreviewError] = useState('');
  [scope.replacePreviewConfirm, scope.setReplacePreviewConfirm] = useState(null);
  [scope.confirmSaveOpen, scope.setConfirmSaveOpen] = useState(false);
  [scope.requestId] = useState(() =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`
  );
  scope.loadData = useCallback(async () => {
    scope.setLoading(true);
    try {
      const cls = await adminApi('classes');
      scope.setClasses(cls);
      if (scope.testId) {
        const test = await adminApi(`tests/${encodeURIComponent(scope.testId)}`);
        scope.setTitle(test.title || '');
        scope.setSubject(test.subject || '');
        scope.setDirection(test.direction || '');
        scope.setTestType(test.testType === 'block' ? 'block' : 'ordinary');
        scope.setScoringMode(test.settings.scoringMode === 'dtm' ? 'dtm' : 'normal');
        scope.setTimeLimitMin(test.settings.timeLimitMin ?? 0);
        scope.setMaxAttempts(test.settings.maxAttempts ?? 1);
        scope.setViolationLimit(test.settings.violationLimit ?? 4);
        scope.setQuestionsPerAttempt(test.settings.questionsPerAttempt ?? 0);
        scope.setShuffleQuestions(Boolean(test.settings.shuffleQuestions));
        scope.setShuffleOptions(Boolean(test.settings.shuffleOptions));
        scope.setShowAnswers(test.settings.showAnswers ?? true);
        scope.setHideResults(Boolean(test.settings.hideResults));
        scope.setScheduleStart(toTashkentInput(test.schedule?.start));
        scope.setScheduleEnd(toTashkentInput(test.schedule?.end));
        scope.setQuestions(structuredClone(test.questions || []));
        const picked = cls.filter((c) => test.classIds.includes(c.id));
        scope.setForClass(!picked.length || picked.some((c) => c.kind !== 'group'));
        scope.setForGroup(picked.some((c) => c.kind === 'group'));
        scope.setSelectedClassIds(new Set(test.classIds));
      }
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Test ma'lumotlarini yuklab bo'lmadi.", true);
    } finally {
      scope.setLoading(false);
    }
  }, [scope.testId, scope.toast]);
  useEffect(() => {
    if (!scope.sessionLoading && scope.session) {
      scope.loadData();
    }
  }, [scope.sessionLoading, scope.session, scope.loadData]);
  scope.groupDirections = useMemo(
    () =>
      Array.from(
        new Set(scope.classes.filter((c) => c.kind === 'group' && c.direction).map((c) => c.direction))
      ).sort((a, b) => a.localeCompare(b, 'uz')),
    [scope.classes]
  );
}
