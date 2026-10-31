import {createHash, randomUUID} from 'node:crypto';
export class HttpError extends Error { constructor(status,message){super(message);this.status=status;} }
export const fail = (message,status=400) => {throw new HttpError(status,message);};
export const norm = value => String(value??'').trim().replace(/['‘ʼ`]/g,'’').replace(/\s+/g,' ').toLowerCase();
export const hash = text => createHash('sha256').update(text).digest('hex');
export const legacyClassId = name => 'legacy-'+hash(norm(name)).slice(0,20);
export function string(value,label,max=100,required=true) { if (typeof value!=='string' || value.trim().length>max || (required&&!value.trim())) fail(`${label}: matn kiriting (ko’pi bilan ${max} belgi).`); return value.trim(); }
export function integer(value,label,min,max){if(!Number.isInteger(value)||value<min||value>max)fail(`${label}: ${min}–${max} oralig’ida butun son bo’lsin.`);return value;}
export function object(value){if(!value||typeof value!=='object'||Array.isArray(value))fail('JSON obyekt kutilgan.');return value;}
export function questionsValid(value){
  if(!Array.isArray(value)||!value.length||value.length>200)fail('1–200 ta savol kiriting.');
  return value.map((item,i)=>{object(item);if(!Array.isArray(item.options)||item.options.length<2||item.options.length>6)fail(`${i+1}-savol: 2–6 ta variant kiriting.`);return {q:string(item.q,`${i+1}-savol`,2000),options:item.options.map(o=>string(o,'Variant',1000)),answer:integer(item.answer,'To’g’ri javob',0,item.options.length-1)};});
}
export function settingsValid(value={}){object(value);for(const key of ['shuffleQuestions','shuffleOptions','showAnswers'])if(value[key]!==undefined&&typeof value[key]!=='boolean')fail(`${key}: mantiqiy qiymat kerak.`);return {timeLimitMin:integer(value.timeLimitMin??0,'Vaqt',0,240),maxAttempts:integer(value.maxAttempts??1,'Urinishlar',1,100),shuffleQuestions:!!value.shuffleQuestions,shuffleOptions:!!value.shuffleOptions,showAnswers:!!value.showAnswers};}
export function scheduleValid(value={}){object(value);const out={};for(const key of ['start','end']){const v=value[key];if(v!==null&&v!==undefined&&v!==''&&(typeof v!=='string'||!Number.isFinite(Date.parse(v))))fail('Jadval vaqti noto’g’ri.');out[key]=v?new Date(v).toISOString():null;}if(out.start&&out.end&&out.start>=out.end)fail('Tugash boshlanishdan keyin bo’lsin.');return out;}
export function status(test,now=Date.now()){if(!test.active)return 'paused';if(test.schedule?.end&&Date.parse(test.schedule.end)<=now)return 'ended';if(test.schedule?.start&&Date.parse(test.schedule.start)>now)return 'scheduled';return 'active';}
export function adaptTest(t,key){return {...t,id:t.id||key,title:t.title||'Eski test',classIds:Array.isArray(t.classIds)?t.classIds:(t.grades||[]).map(legacyClassId),questions:t.questions||[],settings:{timeLimitMin:0,maxAttempts:100,shuffleQuestions:false,shuffleOptions:false,showAnswers:false,...t.settings},schedule:{start:null,end:null,...t.schedule},created:t.created||new Date(0).toISOString(),updated:t.updated||t.created||new Date(0).toISOString()};}
export function adaptResult(r,key){return {...r,id:r.id||key,classId:r.classId||legacyClassId(r.grade||''),name:r.name||'',surname:r.surname||'',grade:r.grade||'',time:r.time||new Date(0).toISOString(),answers:Array.isArray(r.answers)?r.answers:[],durationSec:r.durationSec??null,score:Number(r.score)||0,total:Number(r.total)||0};}
export function classValid(d,old){object(d);const name=string(d.name,'Sinf nomi',60);let students=[];
  if(d.roster!==undefined){const roster=string(d.roster,'Ro’yxat',60000,false);students=roster.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).map(line=>{const [surname,...rest]=line.split(/\s+/);if(!rest.length)fail('Har qatorda Familiya Ism kiriting.');const name=string(rest.join(' '),'Ism',60);string(surname,'Familiya',60);const existing=old?.students?.find(s=>norm(s.name+' '+s.surname)===norm(name+' '+surname));return {id:existing?.id||randomUUID(),name,surname};});}
  else if(d.students!==undefined){if(!Array.isArray(d.students))fail('O’quvchilar ro’yxati kerak.');students=d.students.map(s=>({id:s.id?string(s.id,'O’quvchi ID',100):randomUUID(),name:string(s.name,'Ism',60),surname:string(s.surname,'Familiya',60)}));}
  else students=old?.students||[];
  if(students.length>500)fail('Sinfda ko’pi bilan 500 o’quvchi.');
  if(new Set(students.map(s=>norm(s.surname+' '+s.name))).size!==students.length||new Set(students.map(s=>s.id)).size!==students.length)fail('O’quvchilar takrorlanmasin.');
  return {id:old?.id||randomUUID(),name,students};
}
export function testMeta(t){const {questions,...rest}=t;return {...rest,count:questions.length,status:status(t)};}
