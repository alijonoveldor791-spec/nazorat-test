// lib/auth-token.mjs: serverdagi shu qatlam vazifasi.
import {createHmac,timingSafeEqual} from 'node:crypto';
import {fail} from './http.mjs';
export function sign(payload,secret){const body=Buffer.from(JSON.stringify(payload)).toString('base64url');return body+'.'+createHmac('sha256',secret).update(body).digest('base64url');}
export function verify(token,secret,role,now=Date.now()){
  if(typeof token!=='string'||token.length>4000)fail('Sessiya yaroqsiz. Qayta kiring.',401);
  const parts=token.split('.');if(parts.length!==2)fail('Sessiya yaroqsiz.',401);
  const expected=createHmac('sha256',secret).update(parts[0]).digest();const actual=Buffer.from(parts[1],'base64url');
  if(actual.length!==expected.length||!timingSafeEqual(actual,expected))fail('Sessiya imzosi noto’g’ri.',401);
  let data;try{data=JSON.parse(Buffer.from(parts[0],'base64url').toString());}catch{fail('Sessiya yaroqsiz.',401);}
  if(!data||data.role!==role||!Number.isFinite(data.exp)||data.exp<=now)fail('Sessiya muddati tugagan. Qayta kiring.',401);return data;
}
