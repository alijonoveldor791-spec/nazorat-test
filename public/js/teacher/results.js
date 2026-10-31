// teacher/results.js: sahifaning shu vazifasi uchun modul.
import {$, esc} from '../core/dom.js';
import {toast} from '../components/toast.js';
import {modal, confirmAction} from '../components/modal.js';
import {empty} from '../components/empty-state.js';
import {busy} from '../core/busy.js';
import {percent, dateTime} from '../core/format.js';
import {download} from '../core/download.js';
import {data, refresh} from './data.js';
import {call, post} from './teacher-api.js';
import {heading, action} from '../components/page-heading.js';
import {bootstrapPage} from './shell.js';
import {rowsTable} from '../components/table.js';
import {classChart} from '../components/class-chart.js';
import {resultDetail} from './result-detail.js';
import {analysis} from './analytics.js';
let resultPage=1;
const filters={search:'',testId:'',classId:'',sort:'time'};
export function filteredResults() {
  return data.results.filter(r => (!filters.testId || r.testId===filters.testId) && (!filters.classId || r.classId===filters.classId) && `${r.surname} ${r.name}`.toLowerCase().includes(filters.search.toLowerCase())).sort((a,b) => filters.sort === 'score' ? percent(b)-percent(a) : filters.sort === 'name' ? (a.surname+a.name).localeCompare(b.surname+b.name,'uz') : b.time.localeCompare(a.time));
}
export function resultsView() {
  return heading('Natijalar', 'O’sishni kuzating, savollarni tahlil qiling.', action('refresh','↻ Yangilash','','secondary')+action('analysis','Savollar tahlili','','secondary')) + `<div class="toolbar"><input id="result-search" type="search" placeholder="O’quvchini qidirish…" aria-label="O’quvchi qidirish" value="${esc(filters.search)}"><select id="result-test" aria-label="Test filtri"><option value="">Barcha testlar</option>${[...new Map([...data.tests.map(t => [t.id,t.title]),...data.results.map(r => [r.testId,r.testTitle])])].map(([id,title]) => `<option value="${esc(id)}" ${filters.testId === id ? 'selected' : ''}>${esc(title)}</option>`).join('')}</select><select id="result-class" aria-label="Sinf filtri"><option value="">Barcha sinflar</option>${data.classes.map(c => `<option value="${esc(c.id)}" ${filters.classId===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select><select id="result-sort" aria-label="Saralash"><option value="time">Eng yangi</option><option value="score" ${filters.sort==='score'?'selected':''}>Yuqori ball</option><option value="name" ${filters.sort==='name'?'selected':''}>Familiya bo’yicha</option></select></div><div class="card"><div class="card-head"><h2>Topshirishlar ro’yxati</h2><div class="row no-print">${action('csv','CSV','','secondary small')}${action('excel','Excel (.xls)','','secondary small')}${action('print','Chop etish','','ghost small')}</div></div><div id="result-list">${resultList()}</div></div><div class="card"><h2>Sinflar taqqoslash</h2>${classChart(data.results)}</div>`;
}
export function resultList() { const rows=filteredResults(), pages=Math.max(1,Math.ceil(rows.length/20)); resultPage=Math.min(resultPage,pages); return rowsTable(rows.slice((resultPage-1)*20,resultPage*20))+`<div class="row between no-print" style="margin-top:20px"><p class="help">${rows.length} natija · ${resultPage} / ${pages} sahifa</p><div class="row">${action('prev-page','← Oldingi','','secondary')}${action('next-page','Keyingi →','','secondary')}</div></div>`; }
export function exportRows(excel = false) {
  const rows = [['Familiya','Ism','Sinf','Test','Ball','Jami','Foiz','Vaqt'],...filteredResults().map(r => [r.surname,r.name,r.grade,r.testTitle,r.score,r.total,percent(r)+'%',dateTime(r.time)])];
  const safe = value => /^[=+@\-\t\r]/.test(String(value)) ? "'"+value : String(value ?? '');
  if (excel) download('natijalar.xls', '\ufeff<html><head><meta charset="UTF-8"></head><body><table>'+rows.map(row=>'<tr>'+row.map(c=>'<td>'+esc(safe(c))+'</td>').join('')+'</tr>').join('')+'</table></body></html>','application/vnd.ms-excel;charset=utf-8');
  else download('natijalar.csv','\ufeff'+rows.map(row=>row.map(c=>'"'+safe(c).replace(/"/g,'""')+'"').join(',')).join('\r\n'),'text/csv;charset=utf-8');
  toast('Eksport tayyor.');
}
bootstrapPage('results',resultsView,{
 'result-detail':resultDetail, 'analysis':()=>analysis(filters.testId),
 'delete-result':async id=>{if(await confirmAction('Natija o’chirilsinmi?','Ball va javoblar o’chirilib, bu topshirish qayta ko’rinmaydi.')){await call('results/'+id,{method:'DELETE'});document.querySelector('dialog[open]')?.close();await refresh();toast('Natija o’chirildi.');}},
 'allow-retake':async id=>{await post('results/'+id+'/retake');toast('Yana bir urinishga ruxsat berildi.');},
 'prev-page':()=>{resultPage=Math.max(1,resultPage-1);$('result-list').innerHTML=resultList();},
 'next-page':()=>{resultPage++;$('result-list').innerHTML=resultList();},
 csv:()=>exportRows(),excel:()=>exportRows(true),print:()=>window.print()
});
$('content').addEventListener('input',event=>{if(event.target.id==='result-search'){filters.search=event.target.value;resultPage=1;$('result-list').innerHTML=resultList();}});
$('content').addEventListener('change',event=>{const id=event.target.id;if(['result-test','result-class','result-sort'].includes(id)){filters[{'result-test':'testId','result-class':'classId','result-sort':'sort'}[id]]=event.target.value;resultPage=1;$('result-list').innerHTML=resultList();}});
