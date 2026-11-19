// Testni yangi hujjat ochmasdan boshlash uchun to'liq ekran va manzilni tayyorlaydi.
export async function requestExamFullscreen() {
  try {
    if (
      !document.fullscreenElement &&
      document.documentElement.requestFullscreen &&
      document.fullscreenEnabled
    )
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
  } catch {
    /* Ruxsat berilmasa imtihon himoyasi qayta kirish tugmasini ko'rsatadi. */
  }
}
export function openExam(setStarted) {
  history.replaceState(null, '', '/test');
  document.title = 'Testni yechish - Nazorat';
  setStarted(true);
}
