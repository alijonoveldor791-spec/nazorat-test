import assert from 'node:assert/strict';
import {admin,request,fixture,cleanup,artifact} from './helpers.mjs';
const token=await admin();let cls,test;
try{
  ({cls,test}=await fixture(token,{maxAttempts:1}));
  const attempts=await Promise.all(Array.from({length:40},(_,i)=>request(`tests/${test.id}/start`,{method:'POST',body:{classId:cls.id,name:'Sinov'+i,surname:'Parallel'},expected:201})));
  const begin=performance.now();const timings=[];
  const responses=await Promise.allSettled(attempts.map(async a=>{const start=performance.now();const r=await request('submit',{method:'POST',body:{attemptToken:a.attemptToken,answers:a.questions.map(()=>null)}});timings.push(performance.now()-start);assert.equal(r.score,0);return r;}));
  const elapsedMs=Math.round(performance.now()-begin),failed=responses.filter(r=>r.status==='rejected');
  const rows=(await request('admin/results',{token})).filter(r=>r.testId===test.id);
  timings.sort((a,b)=>a-b);const report={requests:40,succeeded:responses.length-failed.length,failed:failed.length,stored:rows.length,elapsedMs,p50Ms:Math.round(timings[Math.floor(timings.length*.5)]),p95Ms:Math.round(timings[Math.min(timings.length-1,Math.floor(timings.length*.95))]),errors:failed.map(r=>r.reason.message),environment:'Netlify Dev, local Blobs'};
  artifact('load-test.json',report);console.log(JSON.stringify(report,null,2));assert.equal(failed.length,0);assert.equal(rows.length,40);
}finally{await cleanup(token,cls,test);}
