// teacher/analytics.js: sahifaning shu vazifasi uchun modul.
import { esc } from '../core/dom.js';
import { toast } from '../components/toast.js';
import { modal } from '../components/modal.js';

import { percent } from '../core/format.js';

import { data } from './data.js';
import { call } from './teacher-api.js';

export async function analysis(testId) {
  const id = testId || data.tests[0]?.id;
  if (!id) return toast('Tahlil uchun test tanlang.', true);
  const d = await call('analysis?testId=' + encodeURIComponent(id));
  await modal(
    'Savollar tahlili',
    `<p>${esc(d.title)} · ${d.attempts} ta batafsil natija</p>
<p class="help">Eski, javoblari saqlanmagan va boshqa tahrirdagi natijalar hisobga kiritilmaydi.</p>
<h3>Eng qiyin 5 savol</h3>${d.hardest.map((q) => `<p>${q.index + 1}. ${esc(q.q)} — ${q.percent}%</p>`).join('')}${d.questions
      .map(
        (q) => `<div class="answer-detail">
<h3>${q.index + 1}. ${esc(q.q)}</h3>
<p>To’g’ri javob: ${q.percent}% · ${q.count} javob</p>
<p class="help">${q.distribution.map((n, i) => `${'ABCDEF'[i]}: ${n}`).join(' · ')} · Javobsiz: ${q.unanswered}</p>
</div>`
      )
      .join('')}`,
    { confirm: '', cancel: 'Yopish' }
  );
}
