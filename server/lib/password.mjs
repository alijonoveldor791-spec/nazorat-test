// lib/password.mjs: serverdagi shu qatlam vazifasi.
import {randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
export function passwordHash(password,salt=randomBytes(16).toString('hex')){return {salt,hash:scryptSync(password,salt,64).toString('hex')};}
export function passwordMatches(password,record){if(typeof password!=='string'||password.length>200||!record)return false;const a=Buffer.from(record.hash,'hex'),b=scryptSync(password,record.salt,64);return a.length===b.length&&timingSafeEqual(a,b);}
