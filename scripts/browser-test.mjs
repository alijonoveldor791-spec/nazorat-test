import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {admin,request,cleanup,base,artifact} from './helpers.mjs';

mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true});
const token=await admin(),errors=[],audits=[];
let cls,test;
const title='Brauzer-'+Date.now();
async function audit(page,label){
  const report=await page.evaluate(()=>{
    const visible=e=>!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)&&getComputedStyle(e).visibility!=='hidden';
    const unnamed=[...document.querySelectorAll('button,input,select,textarea')].filter(visible).filter(e=>!e.getAttribute('aria-label')&&!e.getAttribute('aria-labelledby')&&!e.labels?.length&&!e.textContent.trim()&&!['submit','button'].includes(e.type)).map(e=>e.id||e.tagName);
    const buttons=[...document.querySelectorAll('button')].filter(visible).filter(e=>e.getBoundingClientRect().height<43.5).map(e=>e.textContent.trim());
    const nav=performance.getEntriesByType('navigation')[0];
    return {lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth>innerWidth,unnamed,smallButtons:buttons,domContentLoadedMs:Math.round(nav.domContentLoadedEventEnd),loadMs:Math.round(nav.loadEventEnd),resourceBytes:performance.getEntriesByType('resource').reduce((s,r)=>s+r.transferSize,0),externalResources:performance.getEntriesByType('resource').filter(r=>new URL(r.name).origin!==location.origin).map(r=>r.name)};
  });
  assert.equal(report.lang,'uz');assert.equal(report.overflow,false,label+' overflow');assert.deepEqual(report.unnamed,[],label+' unnamed fields');assert.deepEqual(report.smallButtons,[],label+' touch targets');assert.deepEqual(report.externalResources,[]);
  audits.push({label,...report});
}
try{
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const teacher=await context.newPage();teacher.on('pageerror',e=>errors.push(e.message));
  await teacher.goto(base+'/teacher.html');await teacher.locator('#pw').fill(process.env.TEACHER_PASSWORD);await teacher.locator('#enter').click();await teacher.locator('#panel').waitFor({state:'visible'});
  await teacher.locator('[data-page=classes]').click();await teacher.locator('[data-action=new-class]').click();
  await teacher.locator('#class-name').fill(title);await teacher.locator('#class-students').fill('Aliyev Ali\nValiyeva Malika');await teacher.locator('[data-confirm]').click();
  await teacher.locator('#content article').filter({hasText:title}).waitFor();
  cls=(await request('admin/classes',{token})).find(c=>c.name===title);assert(cls);
  await teacher.locator('[data-page=tests]').click();await teacher.locator('[data-action=new-test]').click();
  await teacher.locator('#edit-title').fill(title);await teacher.locator(`[name=classIds][value="${cls.id}"]`).check();await teacher.locator('#limit').fill('2');
  await teacher.locator('#shuffle-q').check();await teacher.locator('#shuffle-o').check();
  await teacher.locator('#import-text').fill('Savol\nA. A\nB. B');await teacher.locator('#preview').click();await teacher.locator('#preview-error').filter({hasText:'ANSWER'}).waitFor();
  await teacher.locator('#import-file').setInputFiles('namuna-test.txt');await teacher.waitForFunction(()=>document.getElementById('import-text').value.includes('ANSWER:'));
  await teacher.locator('#preview').click();await teacher.locator('[data-question="19"]').waitFor();await teacher.locator('[data-confirm]').click();
  await teacher.locator('#test-list article').filter({hasText:title}).waitFor();test=(await request('admin/tests',{token})).find(t=>t.title===title);assert(test);console.log('PASS: brauzerda sinf yaratish, xato preview, .txt yuklash va saqlash');
  await teacher.locator('[data-page=dashboard]').click();await teacher.locator('#content h1').filter({hasText:'Bugungi manzara'}).waitFor();
  for(const width of [390,1280])for(const colorScheme of ['light','dark']){
    await teacher.setViewportSize({width,height:900});await teacher.emulateMedia({colorScheme});await teacher.evaluate(()=>{delete document.documentElement.dataset.theme;localStorage.removeItem('nazorat-theme');});
    await audit(teacher,`teacher-${width}-${colorScheme}`);await teacher.screenshot({path:`artifacts/teacher-${width}-${colorScheme}.png`,fullPage:true});
  }
  await teacher.setViewportSize({width:1280,height:900});
  const studentContext=await browser.newContext({viewport:{width:390,height:844}});const student=await studentContext.newPage();student.on('pageerror',e=>errors.push(e.message));
  await student.goto(base);await student.locator(`#grade option[value="${cls.id}"]`).waitFor({state:'attached'});
  for(const width of [390,1280])for(const colorScheme of ['light','dark']){
    await student.setViewportSize({width,height:844});await student.emulateMedia({colorScheme});await audit(student,`student-${width}-${colorScheme}`);await student.screenshot({path:`artifacts/student-${width}-${colorScheme}.png`,fullPage:true});
  }
  await student.setViewportSize({width:390,height:844});await student.emulateMedia({colorScheme:'light'});
  await student.locator('#grade').selectOption(cls.id);await student.locator(`#tsel option[value="${test.id}"]`).waitFor({state:'attached'});await student.locator('#student').selectOption(cls.students[0].id);await student.locator('#go').click();await student.locator('#test').waitFor({state:'visible'});
  await student.locator('#flag').click();await student.keyboard.press('b');await student.locator('#next').click();
  const draft=await student.evaluate(()=>JSON.parse(localStorage.getItem('nazorat-attempt-v2')));assert.equal(draft.answers[0],1);assert(draft.flags.includes(0));
  await student.reload();await student.locator('#continue').click();await student.locator('#question-number').filter({hasText:'2-savol'}).waitFor();
  const full=await request('admin/tests/'+test.id,{token});
  const shuffled=draft.questions,answers=shuffled.map(q=>{const original=full.questions.find(x=>x.q===q.q);return q.options.indexOf(original.options[original.answer]);});
  for(let i=0;i<20;i++){await student.locator(`[data-index="${i}"]`).click();await student.locator(`input[name=answer][value="${answers[i]}"]`).check();}
  await audit(student,'test-390');await student.screenshot({path:'artifacts/question-mobile.png',fullPage:true});
  await studentContext.setOffline(true);await student.locator('#send').click();await student.locator('[data-confirm]').click();await student.locator('#terr').filter({hasText:'saqlangan'}).waitFor();assert(await student.evaluate(()=>!!localStorage.getItem('nazorat-attempt-v2')));
  await studentContext.setOffline(false);await student.locator('#send').click();await student.locator('[data-confirm]').click();await student.locator('#done').waitFor({state:'visible'});assert.equal(await student.locator('#score').textContent(),'20 / 20');await student.screenshot({path:'artifacts/result-mobile.png',fullPage:true});console.log('PASS: klaviatura, belgilash, reload, offline retry, 20/20');
  await teacher.locator('[data-page=results]').click();await teacher.locator('#result-test').selectOption(test.id);await teacher.locator('#result-list tr').filter({hasText:'Aliyev Ali'}).waitFor();await teacher.locator('#result-list [data-action=result-detail]').click();await teacher.locator('dialog').filter({hasText:'Sarflangan vaqt'}).waitFor();await teacher.locator('[data-cancel]').click();await teacher.locator('[data-action=analysis]').click();await teacher.locator('dialog').filter({hasText:'Eng qiyin'}).waitFor();await teacher.locator('[data-cancel]').click();console.log('PASS: panel natijasi, tafsilot va savollar tahlili');
  await student.goto(base);await student.locator(`#grade option[value="${cls.id}"]`).waitFor({state:'attached'});await student.locator('#grade').selectOption(cls.id);await student.locator(`#tsel option[value="${test.id}"]`).waitFor({state:'attached'});await student.locator('#student').selectOption(cls.students[1].id);await student.locator('#go').click();await student.locator('#test').waitFor({state:'visible'});
  await student.evaluate(()=>{const d=JSON.parse(localStorage.getItem('nazorat-attempt-v2'));d.deadline=new Date(Date.now()-1000).toISOString();localStorage.setItem('nazorat-attempt-v2',JSON.stringify(d));});await student.reload();await student.locator('#continue').click();await student.locator('#done').waitFor({state:'visible'});assert.equal(await student.locator('#score').textContent(),'0 / 20');console.log('PASS: taymer tugash hodisasi avtomatik yubordi');
  await student.goto(base);await student.locator('[data-theme-toggle]').click();const theme=await student.evaluate(()=>document.documentElement.dataset.theme);await student.reload();assert.equal(await student.evaluate(()=>document.documentElement.dataset.theme),theme);
  assert.deepEqual(errors,[]);artifact('browser-audit.json',{audits,errors,notes:'Playwright Chrome. Lighthouse o’rniga form labels, 44px touch targets, overflow, external resources va navigation timing tekshirildi.'});console.log(`PASS: ${audits.length} responsive/a11y audits, light/dark, theme persistence, 0 JS errors`);
  await context.close();await studentContext.close();
}finally{await cleanup(token,cls,test);await browser.close();}
