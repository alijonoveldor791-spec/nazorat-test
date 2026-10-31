// Faqat lokal muhitda parol almashishi va token bekor qilinishini tekshiradi.
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {base,admin,request,artifact} from './helpers.mjs';
if(!['localhost','127.0.0.1','[::1]'].includes(new URL(base).hostname))throw new Error('Parol aylantirish sinovi faqat lokal muhit uchun.');
const original=process.env.TEACHER_PASSWORD,next=randomBytes(24).toString('base64url');
const first=await admin(),logs=[];
let changed=false;
try {
  await request('admin/password',{token:first,method:'POST',body:{currentPassword:original,newPassword:next}});
  changed=true;
  await request('admin/tests',{token:first,expected:401});
  await request('admin/login',{method:'POST',body:{password:original},expected:401});
  logs.push('S04: parol o’zgargach eski token va eski parol rad etildi.');
  const fresh=(await request('admin/login',{method:'POST',body:{password:next}})).token;
  await request('admin/password',{token:fresh,method:'POST',body:{currentPassword:next,newPassword:original}});
  changed=false;
  await request('admin/tests',{token:fresh,expected:401});
  logs.push('S04: parol qaytarildi, oraliq sessiya ham bekor qilindi.');
  const final=await admin();await request('admin/logout',{token:final,method:'POST'});
  await request('admin/session',{token:final,expected:401});
  assert.equal(logs.length,2);logs.push('S04: server logoutdan keyin /admin/session 401.');
  artifact('audit-auth.json',{passed:logs.length,logs});logs.forEach(row=>console.log('PASS:',row));
} finally {
  if(changed)for(const password of [next,original]) {
    try {
      const token=(await request('admin/login',{method:'POST',body:{password}})).token;
      if(password!==original)await request('admin/password',{token,method:'POST',body:{currentPassword:password,newPassword:original}});
      break;
    } catch {}
  }
}
