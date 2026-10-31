// lib/http.mjs: serverdagi shu qatlam vazifasi.
export class HttpError extends Error { constructor(status,message){super(message);this.status=status;} }
export const fail = (message,status=400) => {throw new HttpError(status,message);};
export const json = (value,status=200) => new Response(JSON.stringify(value), {status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...(status===429?{'Retry-After':'900'}:{})}});
export async function readJson(req) {
  const text=await req.text(); if(text.length>4_000_000) fail('So’rov 4 MB dan oshmasin.',413);
  try {const value=JSON.parse(text);if(!value||typeof value!=='object'||Array.isArray(value))fail('JSON obyekt kutilgan.');return value;}
  catch(error) {if(error instanceof HttpError)throw error;fail('JSON formati noto’g’ri.');}
}
