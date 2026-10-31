import {getStore} from '@netlify/blobs';
import {adaptTest,adaptResult,legacyClassId} from './model.mjs';
const caches=new Map();
export const store=name=>getStore({name,consistency:'strong'});
export async function entries(name,prefix){const out=[];for await(const {blobs} of store(name).list({paginate:true,...(prefix?{prefix}:{})})){const values=await Promise.all(blobs.map(async b=>({key:b.key,value:await store(name).get(b.key,{type:'json'})})));out.push(...values.filter(x=>x.value));}return out;}
export const get=(name,key)=>store(name).get(key,{type:'json'});
export async function put(name,key,value){await store(name).setJSON(key,value);caches.delete(name);}
export async function remove(name,key){await store(name).delete(key);caches.delete(name);}
export function invalidate(){caches.clear();}
export async function all(name,fresh=false){const cached=caches.get(name);if(!fresh&&cached&&cached.until>Date.now())return structuredClone(cached.value);const rows=await entries(name);const value=rows.map(({key,value})=>name==='tests'?adaptTest(value,key):name==='results'?adaptResult(value,key):{...value,id:value.id||key});if(name==='tests'||name==='classes')caches.set(name,{until:Date.now()+5000,value});return structuredClone(value);}
export async function classes(fresh=false){const [explicit,tests]=await Promise.all([all('classes',fresh),all('tests',fresh)]);const map=new Map(explicit.map(c=>[c.id,{...c,students:c.students||[]}]));for(const t of tests)for(const name of t.grades||[]){const id=legacyClassId(name);if(!map.has(id)&&t.classIds.includes(id))map.set(id,{id,name,students:[],legacy:true});}return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,'uz',{numeric:true}));}
export async function clearStore(name){const rows=await entries(name);await Promise.all(rows.map(r=>remove(name,r.key)));}
