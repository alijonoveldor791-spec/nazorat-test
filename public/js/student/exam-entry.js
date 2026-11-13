// Boshlash bosishidagi fullscreen ruxsatini sahifani qayta yuklamasdan testga olib o'tadi.
let entered = false;
export function takeExamEntry() {
  const value = entered;
  entered = false;
  return value;
}
export async function prepareExam() {
  const wasFullscreen = !!document.fullscreenElement;
  const fullscreen = document.fullscreenEnabled && document.documentElement.requestFullscreen;
  let opened = false;
  const cancel = async () => {
    if (!opened && !wasFullscreen && document.fullscreenElement)
      await document.exitFullscreen().catch(() => {});
  };
  try {
    if (fullscreen && !wasFullscreen) {
      try {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      } catch {
        throw new Error("To'liq ekranga ruxsat berilmadi. Brauzer ruxsatini tekshirib, qayta urining.");
      }
    }
    const response = await fetch('/test.html');
    if (!response.ok) throw new Error("Test sahifasini yuklab bo'lmadi. Qayta urining.");
    const page = new DOMParser().parseFromString(await response.text(), 'text/html');
    if (!page.getElementById('exam-guard') || !page.getElementById('test'))
      throw new Error('Test sahifasi yaroqsiz. Sahifani yangilang.');
    return {
      cancel,
      async open() {
        entered = true;
        history.replaceState(null, '', '/test.html');
        document.title = page.title;
        document.body.className = page.body.className;
        document.body.replaceChildren(...page.body.childNodes);
        opened = true;
        await import('./test.js');
      },
    };
  } catch (error) {
    await cancel();
    throw error;
  }
}
