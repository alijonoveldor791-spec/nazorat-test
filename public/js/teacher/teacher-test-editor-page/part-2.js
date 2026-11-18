// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { ApiError, adminPost } from '../../core/api.js';
import { fromTashkentInput } from '../../core/format.js';
import { view11 } from './view11.js';
export function part2(scope) {
  scope.handleSave = async () => {
    scope.setSaving(true);
    try {
      const payload = {
        title: scope.title.trim(),
        subject: scope.subject.trim(),
        direction: scope.forGroup ? scope.direction.trim() : '',
        testType: scope.testType,
        classIds: scope.activeSelectedIds,
        questions: scope.questions,
        settings: {
          timeLimitMin: Number(scope.timeLimitMin) || 0,
          maxAttempts: Math.max(1, Number(scope.maxAttempts) || 1),
          violationLimit: Math.max(0, Number(scope.violationLimit) || 0),
          questionsPerAttempt:
            scope.testType === 'ordinary' ? Math.max(0, Number(scope.questionsPerAttempt) || 0) : 0,
          shuffleQuestions: scope.shuffleQuestions,
          shuffleOptions: scope.shuffleOptions,
          showAnswers: scope.showAnswers,
          hideResults: scope.hideResults,
          scoringMode: scope.testType === 'block' ? scope.scoringMode : 'normal',
        },
        schedule: {
          start: fromTashkentInput(scope.scheduleStart),
          end: fromTashkentInput(scope.scheduleEnd),
        },
        ...(!scope.testId ? { requestId: scope.requestId } : {}),
      };
      await adminPost(
        `tests${scope.testId ? '/' + encodeURIComponent(scope.testId) : ''}`,
        payload,
        scope.testId ? 'PUT' : 'POST'
      );
      scope.toast('Test saqlandi.');
      scope.setConfirmSaveOpen(false);
      scope.navigate('/oqituvchi/testlar');
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : 'Saqlashda xato yuz berdi.', true);
    } finally {
      scope.setSaving(false);
    }
  };
  return { done: true, value: view11(scope) };
}
