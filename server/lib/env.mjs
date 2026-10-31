// lib/env.mjs: serverdagi shu qatlam vazifasi.
import {fail} from './http.mjs';
export const env=name=>globalThis.Netlify?.env?.get(name)||process.env[name];
export function secret(){const key=env('TOKEN_SECRET');if(!key||key.length<32)fail('Serverda TOKEN_SECRET sozlanmagan (kamida 32 belgi).',503);return key;}
