import {createHmac,randomBytes,scryptSync,timingSafeEqual,randomUUID} from 'node:crypto';
import {HttpError,fail,hash} from './model.mjs';
import {get,put,update} from './store.mjs';
export const env=name=>globalThis.Netlify?.env?.get(name)||process.env[name];
export function sign(payload,secret){const body=Buffer.from(JSON.stringify(payload)).toString('base64url');return body+'.'+createHmac('sha256',secret).update(body).digest('base64url');}
export function verify(token,secret,role,now=Date.now()){
  if(typeof token!=='string'||token.length>4000)fail('Sessiya yaroqsiz. Qayta kiring.',401);
  const parts=token.split('.');if(parts.length!==2)fail('Sessiya yaroqsiz.',401);
  const expected=createHmac('sha256',secret).update(parts[0]).digest();const actual=Buffer.from(parts[1],'base64url');
  if(actual.length!==expected.length||!timingSafeEqual(actual,expected))fail('Sessiya imzosi noto’g’ri.',401);
  let data;try{data=JSON.parse(Buffer.from(parts[0],'base64url').toString());}catch{fail('Sessiya yaroqsiz.',401);}
  if(!data||data.role!==role||!Number.isFinite(data.exp)||data.exp<=now)fail('Sessiya muddati tugagan. Qayta kiring.',401);return data;
}
export function secret(){const key=env('TOKEN_SECRET');if(!key||key.length<32)fail('Serverda TOKEN_SECRET sozlanmagan (kamida 32 belgi).',503);return key;}
export function passwordHash(password,salt=randomBytes(16).toString('hex')){return {salt,hash:scryptSync(password,salt,64).toString('hex')};}
export function passwordMatches(password,record){if(typeof password!=='string'||password.length>200||!record)return false;const a=Buffer.from(record.hash,'hex'),b=scryptSync(password,record.salt,64);return a.length===b.length&&timingSafeEqual(a,b);}
export async function authConfig(){const password=env('TEACHER_PASSWORD');if(!password)fail('Admin kirishi bloklangan: TEACHER_PASSWORD muhit o’zgaruvchisini sozlang.',503);secret();return await get('settings','auth')||{version:hash(password),password:passwordHash(password,hash(password).slice(0,32))};}
export async function authorize(req){const config=await authConfig();const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];const claim=verify(token,secret(),'admin');if(claim.version!==config.version)fail('Parol yangilangan. Qayta kiring.',401);return config;}
export function ipAddress(req,context){return context?.ip||req.headers.get('x-nf-client-connection-ip')||'local';}
export async function limit(scope,ip,max=60,windowMs=60000){const key='counters/'+scope+'-'+hash(ip).slice(0,32);await update('limits',key,previous=>{const now=Date.now(),row=previous&&previous.until>now?previous:{count:0,until:now+windowMs};if(row.count>=max)throw new HttpError(429,'So’rovlar ko’paydi. Birozdan keyin qayta urinib ko’ring.');return {...row,count:row.count+1};});}
export async function login(password,ip){
  const config=await authConfig(),key='counters/login-'+hash(ip).slice(0,32),matches=passwordMatches(password,config.password);
  await update('limits',key,previous=>{const now=Date.now(),row=previous&&previous.until>now?previous:{count:0,until:now+15*60000};if(row.blockedUntil>now)fail('5 ta xato urinish. 15 daqiqadan keyin qayta urinib ko’ring.',429);if(matches)return {count:0,until:now+15*60000};const count=row.count+1;return {...row,count,...(count>=5?{blockedUntil:now+15*60000,until:now+15*60000}:{})};});
  if(!matches)fail('Parol noto’g’ri.',401);
  return {token:sign({role:'admin',version:config.version,exp:Date.now()+8*3600000},secret()),expiresIn:28800};
}
