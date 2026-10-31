// lib/rate-limit.mjs: serverdagi shu qatlam vazifasi.
import {updateCounter} from '../repositories/limits-repo.mjs';
import {HttpError} from './http.mjs';
import {hash} from './identity.mjs';
export function ipAddress(req,context){return context?.ip||req.headers.get('x-nf-client-connection-ip')||'local';}
export async function limit(scope,ip,max=60,windowMs=60000){const key='counters/'+scope+'-'+hash(ip).slice(0,32);await updateCounter(key,previous=>{const now=Date.now(),row=previous&&previous.until>now?previous:{count:0,until:now+windowMs};if(row.count>=max)throw new HttpError(429,'So’rovlar ko’paydi. Birozdan keyin qayta urinib ko’ring.');return {...row,count:row.count+1};});}
