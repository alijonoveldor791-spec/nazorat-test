import {randomUUID} from 'node:crypto';
import {parseAiken as parse,toAiken} from './lib/parser.mjs';
import {HttpError,fail,norm,hash,string,integer,object,questionsValid,settingsValid,scheduleValid,status,adaptTest,adaptResult,classValid,testMeta} from './lib/model.mjs';
import {all,classes,get,put,create,update,remove,entries,clearStore,invalidate} from './lib/store.mjs';
import {presentation,grade} from './lib/grading.mjs';
import {secret,sign,verify,login,authorize,passwordHash,passwordMatches,ipAddress,limit} from './lib/security.mjs';

const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...(status===429?{'Retry-After':'900'}:{})}});
function parseAiken(text){try{return parse(text);}catch(error){fail(error.message);}}
async function body(req){const text=await req.text();if(text.length>4_000_000)fail('So’rov 4 MB dan oshmasin.',413);try{return object(JSON.parse(text));}catch(error){if(error instanceof HttpError)throw error;fail('JSON formati noto’g’ri.');}}
const testById=async id=>{const raw=await get('tests',id);if(!raw)fail('Test topilmadi.',404);return adaptTest(raw,id);};
function available(test){if(status(test)!=='active')fail('Test hozir ochiq emas. Jadval yoki holatni tekshiring.',403);}
async function identity(d,test){
  const c=(await classes(true)).find(c=>c.id===d.classId);
  if(!c||!test.classIds.includes(c.id))fail('Bu test sinfingizga biriktirilmagan.',403);
  let person;
  if(c.students.length){person=c.students.find(s=>s.id===d.studentId);if(!person)fail('O’quvchini sinf ro’yxatidan tanlang.');}
  else person={id:null,name:string(d.name,'Ism',60),surname:string(d.surname,'Familiya',60)};
  const key=hash(test.id+'|'+c.id+'|'+norm(person.surname+' '+person.name));
  return {key,classId:c.id,grade:c.name,studentId:person.id,...{name:person.name,surname:person.surname}};
}
function attemptResponse(attempt){return {attemptToken:sign({role:'attempt',id:attempt.id,exp:attempt.expires},secret()),title:attempt.title,questions:attempt.questions.map(q=>({q:q.q,options:q.options})),identity:attempt.identity,deadline:attempt.deadline,started:attempt.started};}
async function saveTest(d,id){
  object(d);const old=id?await testById(id):null;const title=string(d.title,'Test nomi',100);
  if(!Array.isArray(d.classIds)||!d.classIds.length||d.classIds.length>40||d.classIds.some(v=>typeof v!=='string'))fail('1–40 ta sinf tanlang.');
  const availableClasses=await classes(true),ids=[...new Set(d.classIds)];if(ids.some(id=>!availableClasses.some(c=>c.id===id)))fail('Sinf topilmadi.');
  const questions=d.text!==undefined?parseAiken(d.text):questionsValid(d.questions);
  const now=new Date().toISOString();const t={id:old?.id||randomUUID(),title,classIds:ids,grades:ids.map(id=>availableClasses.find(c=>c.id===id).name),questions,settings:settingsValid(d.settings),schedule:scheduleValid(d.schedule),active:old?.active??true,created:old?.created||now,updated:now};
  await put('tests',t.id,t);return testMeta(t);
}
async function handler(req,context){
  const url=new URL(req.url),method=req.method;const parts=url.pathname.replace(/^\/(?:api|\.netlify\/functions\/api)\/?/,'').split('/').filter(Boolean).map(part=>decodeURIComponent(part));
  if(parts.length>4||parts.some(p=>!p||p.length>160||! /^[\w-]+$/.test(p)))fail('Yo’l noto’g’ri.',404);
  const [a,b,c,d]=parts,ip=ipAddress(req,context);
  if(a==='classes'&&method==='GET'){
    const list=await classes();
    if(b&&c==='students'){const row=list.find(x=>x.id===b);if(!row)fail('Sinf topilmadi.',404);return json(row.students);}
    if(!b)return json(list.map(c=>({id:c.id,name:c.name,hasRoster:!!c.students.length})));
  }
  if(a==='grades'&&method==='GET')return json((await classes()).map(c=>c.name));
  if(a==='tests'&&!b&&method==='GET'){
    let id=url.searchParams.get('classId');if(!id&&url.searchParams.has('grade'))id=(await classes()).find(c=>norm(c.name)===norm(url.searchParams.get('grade')))?.id;
    return json((await all('tests')).filter(t=>t.classIds.includes(id)&&status(t)==='active').map(t=>({id:t.id,title:t.title,count:t.questions.length,settings:{timeLimitMin:t.settings.timeLimitMin,maxAttempts:t.settings.maxAttempts}})));
  }
  if((a==='test'||a==='tests')&&b&&!c&&method==='GET'){const t=await testById(b);available(t);return json({id:t.id,title:t.title,questions:t.questions.map(q=>({q:q.q,options:q.options}))});}
  if(a==='tests'&&b&&c==='start'&&method==='POST'){
    await limit('start',ip,80);const d=await body(req),t=await testById(b);available(t);secret();const who=await identity(d,t);
    const attempts=(await entries('attempts',who.key+'/')).map(x=>x.value);const now=Date.now();
    const active=attempts.find(a=>!a.finished&&a.expires>now&&(!a.deadline||Date.parse(a.deadline)>now));
    if(active)return json(attemptResponse(active));
    const oldResults=(await all('results',true)).filter(r=>!r.attemptId&&r.testId===t.id&&(r.classId===who.classId||norm(r.grade)===norm(who.grade))&&norm(r.surname+' '+r.name)===norm(who.surname+' '+who.name));
    const grant=await get('retakes',who.key);if(attempts.length+oldResults.length>=t.settings.maxAttempts+(grant?.extra||0))fail('Topshirish limiti tugagan. O’qituvchingizdan ruxsat so’rang.',403);
    const id=who.key+'/'+hash(who.key+':'+attempts.length).slice(0,40),started=new Date(now).toISOString();
    const deadline=Math.min(t.settings.timeLimitMin?now+t.settings.timeLimitMin*60000:Infinity,t.schedule.end?Date.parse(t.schedule.end):Infinity);
    const attempt={id,identity:who,testId:t.id,title:t.title,revision:t.updated,questions:presentation(t.questions,t.settings,id),settings:t.settings,started,deadline:Number.isFinite(deadline)?new Date(deadline).toISOString():null,expires:Number.isFinite(deadline)?deadline+30000:now+24*3600000,finished:false};
    if(!await create('attempts',id,attempt)){const existing=await get('attempts',id);if(existing.finished)fail('Bu urinish yakunlangan. Sahifani yangilang.',409);return json(attemptResponse(existing));}return json(attemptResponse(attempt),201);
  }
  if(a==='submit'&&method==='POST'){
    await limit('submit',ip,80);const d=await body(req);const claim=verify(d.attemptToken,secret(),'attempt');const attempt=await get('attempts',claim.id);if(!attempt)fail('Urinish topilmadi.',404);
    const resultId=claim.id.split('/').at(-1),stored=await get('results',resultId);if(stored)return json(stored.publicResult);
    if(attempt.finished)fail('Bu urinish yakunlangan.',409);
    const t=await testById(attempt.testId);if(!t.active||(t.schedule.start&&Date.parse(t.schedule.start)>Date.now())||(t.schedule.end&&Date.now()>Date.parse(t.schedule.end)+30000))fail('Test hozir ochiq emas.',403);if(!t.classIds.includes(attempt.identity.classId))fail('Sinf testdan chiqarilgan.',403);
    if(Date.now()>attempt.expires)fail('Test vaqti tugagan. O’qituvchiga murojaat qiling.',403);
    const scored=grade(attempt.questions,d.answers);const durationSec=Math.max(0,Math.round((Date.now()-Date.parse(attempt.started))/1000));
    const publicResult={...scored,title:attempt.title};
    if(attempt.settings.showAnswers&&t.settings.showAnswers)publicResult.review=attempt.questions.map((q,i)=>({q:q.q,options:q.options,answer:q.answer,selected:d.answers[i]}));
    const r={id:resultId,attemptId:attempt.id,testId:t.id,testTitle:attempt.title,classId:attempt.identity.classId,grade:attempt.identity.grade,name:attempt.identity.name,surname:attempt.identity.surname,studentId:attempt.identity.studentId,identityKey:attempt.identity.key,score:scored.score,total:scored.total,answers:d.answers,questions:attempt.questions,revision:attempt.revision,durationSec,time:new Date().toISOString(),publicResult};
    const created=await create('results',resultId,r);await put('attempts',attempt.id,{...attempt,finished:true});return json(created?publicResult:(await get('results',resultId)).publicResult);
  }
  if(a!=='admin')fail('Topilmadi.',404);
  if(b==='login'&&method==='POST'){const d=await body(req);return json(await login(d.password,ip));}
  const auth=await authorize(req);
  if(b==='classes'){
    const list=await classes(true);
    if(!c&&method==='GET')return json(list);
    if(!c&&method==='POST'||c&&method==='PUT'){
      const old=c?list.find(x=>x.id===c):null;if(c&&!old)fail('Sinf topilmadi.',404);const row=classValid(await body(req),old);
      if(list.some(x=>x.id!==row.id&&norm(x.name)===norm(row.name)))fail('Bu sinf nomi mavjud.');
      await put('classes',row.id,row);
      if(old&&old.name!==row.name)for(const t of await all('tests',true))if(t.classIds.includes(row.id))await put('tests',t.id,{...t,grades:t.classIds.map(id=>id===row.id?row.name:list.find(c=>c.id===id)?.name||id)});
      return json(row,c?200:201);
    }
    if(c&&method==='DELETE'){if(!list.some(x=>x.id===c))fail('Sinf topilmadi.',404);for(const t of await all('tests',true))if(t.classIds.includes(c)){const ids=t.classIds.filter(id=>id!==c);await put('tests',t.id,{...t,classIds:ids,grades:ids.map(id=>list.find(x=>x.id===id)?.name||id)});}await remove('classes',c);return json({ok:true});}
  }
  if(b==='preview'&&method==='POST')return json({questions:parseAiken((await body(req)).text)});
  if(b==='tests'){
    if(!c&&method==='GET')return json((await all('tests',true)).sort((a,b)=>b.created.localeCompare(a.created)).map(testMeta));
    if(!c&&method==='POST')return json(await saveTest(await body(req)),201);
    if(c&&!d&&method==='GET')return json(await testById(c));
    if(c&&!d&&method==='PUT')return json(await saveTest(await body(req),c));
    if(c&&!d&&method==='DELETE'){await remove('tests',c);return json({ok:true});}
    if(c&&d==='toggle'&&method==='POST'){const t=await testById(c);t.active=!t.active;await put('tests',c,t);return json(testMeta(t));}
    if(c&&d==='duplicate'&&method==='POST'){const t=await testById(c),now=new Date().toISOString();const copy={...t,id:randomUUID(),title:(t.title+' — nusxa').slice(0,100),active:false,created:now,updated:now};await put('tests',copy.id,copy);return json(testMeta(copy),201);}
    if(c&&d==='export'&&method==='GET'){const t=await testById(c);return new Response(toAiken(t.questions),{headers:{'Content-Type':'text/plain; charset=utf-8','Content-Disposition':'attachment; filename="test.txt"','Cache-Control':'no-store'}});}
  }
  if(b==='results'){
    if(!c&&method==='GET'){const list=await all('results',true);return json(list.sort((a,b)=>b.time.localeCompare(a.time)).map(({questions,answers,publicResult,...r})=>r));}
    if(c){const raw=await get('results',c);if(!raw)fail('Natija topilmadi.',404);const r=adaptResult(raw,c);
      if(!d&&method==='GET')return json(r);
      if(!d&&method==='DELETE'){await remove('results',c);return json({ok:true});}
      if(d==='retake'&&method==='POST'){const key=r.identityKey||hash(r.testId+'|'+r.classId+'|'+norm(r.surname+' '+r.name));await update('retakes',key,grant=>({extra:(grant?.extra||0)+1}));return json({ok:true});}
    }
  }
  if(b==='analysis'&&method==='GET'){
    const t=await testById(url.searchParams.get('testId')||'');const results=(await all('results',true)).filter(r=>r.testId===t.id&&r.questions?.length&&r.revision===t.updated);
    const questions=t.questions.map((q,index)=>{const distribution=q.options.map(()=>0);let correct=0,unanswered=0,count=0;
      for(const r of results){const i=r.questions.findIndex(q=>q.sourceIndex===index);if(i<0)continue;count++;const choice=r.answers[i];if(choice===null||choice===undefined){unanswered++;continue;}const snap=r.questions[i];const original=snap.sourceOptions?.[choice]??q.options.indexOf(snap.options[choice]);if(original>=0)distribution[original]++;if(choice===snap.answer)correct++;}
      return {index,q:q.q,count,percent:count?Math.round(correct/count*100):0,distribution,unanswered};});
    return json({title:t.title,attempts:results.length,questions,hardest:[...questions].sort((a,b)=>a.percent-b.percent).slice(0,5)});
  }
  if(b==='backup'&&method==='GET')return json({version:2,created:new Date().toISOString(),classes:await classes(true),tests:await all('tests',true),results:await all('results',true)});
  if(b==='restore'&&method==='POST'){
    const backup=await body(req);if(backup.version!==2||!Array.isArray(backup.classes)||!Array.isArray(backup.tests)||!Array.isArray(backup.results))fail('Zaxira formati yaroqsiz.');
    if(backup.classes.length>200||backup.tests.length>1000||backup.results.length>20000)fail('Zaxirada yozuvlar juda ko’p.');
    const validId=value=>{const id=string(value,'ID',160);if(!/^[\w-]+$/.test(id))fail('Zaxira ID noto’g’ri.');return id;};
    const cs=backup.classes.map(c=>({...classValid(c),id:validId(c.id)})),classIds=new Set(cs.map(c=>c.id));
    const ts=backup.tests.map(raw=>{const t=adaptTest(raw,validId(raw.id));if(!Array.isArray(t.classIds)||t.classIds.some(id=>!classIds.has(id)))fail('Zaxirada test sinfi yo’q.');return {...t,title:string(t.title,'Test nomi',100),questions:questionsValid(t.questions),settings:settingsValid(t.settings),schedule:scheduleValid(t.schedule),active:!!t.active};});
    const rs=backup.results.map(raw=>{object(raw);const r=adaptResult(raw,validId(raw.id));integer(r.total,'Jami',0,200);integer(r.score,'Ball',0,r.total);string(r.name,'Ism',60);string(r.surname,'Familiya',60);if(!Number.isFinite(Date.parse(r.time)))fail('Natija vaqti noto’g’ri.');if(r.questions?.length){r.questions=questionsValid(r.questions).map((q,i)=>({...q,sourceIndex:raw.questions[i].sourceIndex??i}));grade(r.questions,r.answers);}return r;});
    for(const c of cs)await put('classes',c.id,c);for(const t of ts)await put('tests',t.id,t);for(const r of rs)await put('results',r.id,r);invalidate();return json({ok:true,counts:{classes:cs.length,tests:ts.length,results:rs.length}});
  }
  if(b==='password'&&method==='POST'){const d=await body(req);if(!passwordMatches(d.currentPassword,auth.password))fail('Joriy parol noto’g’ri.',403);const next=string(d.newPassword,'Yangi parol',200);if(next.length<12)fail('Yangi parol kamida 12 belgi bo’lsin.');await put('settings','auth',{version:randomUUID(),password:passwordHash(next)});return json({ok:true});}
  if(b==='clear'&&method==='POST'){const d=await body(req);if(d.confirmation!=='HAMMASINI OCHIRISH')fail('Tozalash tasdiqlanmadi.');for(const name of ['tests','results','classes','attempts','retakes'])await clearStore(name);invalidate();return json({ok:true});}
  fail('Topilmadi.',404);
}
export default async (req,context)=>{try{return await handler(req,context);}catch(error){if(!(error instanceof HttpError))console.error('API xatosi:',error);return json({error:error instanceof HttpError?error.message:'Server xatosi. Birozdan keyin qayta urinib ko’ring.'},error.status||500);}};
