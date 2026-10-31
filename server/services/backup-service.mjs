// Zaxira tekshiruvi to’liq tugagandan keyingina yozuvlarni tiklaydi.
import * as testsRepo from '../repositories/tests-repo.mjs';
import * as classesRepo from '../repositories/classes-repo.mjs';
import * as resultsRepo from '../repositories/results-repo.mjs';
import * as attemptsRepo from '../repositories/attempts-repo.mjs';
import * as retakesRepo from '../repositories/retakes-repo.mjs';
import {listClasses} from './class-service.mjs';
import {adaptTest,adaptResult} from '../migrations/legacy.mjs';
import {fail} from '../lib/http.mjs';
import {string,integer,object,classValid,questionsValid,settingsValid,scheduleValid} from '../lib/validate.mjs';
import {grade} from '../lib/grade.mjs';

export async function backupData() {
  return {version:2,created:new Date().toISOString(),classes:await listClasses(true),tests:await testsRepo.list(true),results:await resultsRepo.list(true)};
}
function validId(value) {
  const id = string(value,'ID',160);
  if (!/^[\w-]+$/.test(id)) fail('Zaxira ID noto’g’ri.');
  return id;
}
export async function restoreData(backup) {
  if (backup.version !== 2 || !Array.isArray(backup.classes) || !Array.isArray(backup.tests) || !Array.isArray(backup.results)) fail('Zaxira formati yaroqsiz.');
  if (backup.classes.length > 200 || backup.tests.length > 1000 || backup.results.length > 20000) fail('Zaxirada yozuvlar juda ko’p.');
  const classes = backup.classes.map(c => ({...classValid(c),id:validId(c.id)}));
  const classIds = new Set(classes.map(c => c.id));
  const tests = backup.tests.map(raw => {
    const test = adaptTest(raw,validId(raw.id));
    if (!Array.isArray(test.classIds) || test.classIds.some(id => !classIds.has(id))) fail('Zaxirada test sinfi yo’q.');
    return {...test,title:string(test.title,'Test nomi',100),questions:questionsValid(test.questions),settings:settingsValid(test.settings),schedule:scheduleValid(test.schedule),active:!!test.active};
  });
  const results = backup.results.map(raw => {
    object(raw);
    const result = adaptResult(raw,validId(raw.id));
    integer(result.total,'Jami',0,200); integer(result.score,'Ball',0,result.total);
    string(result.name,'Ism',60); string(result.surname,'Familiya',60);
    if (!Number.isFinite(Date.parse(result.time))) fail('Natija vaqti noto’g’ri.');
    if (result.questions?.length) {
      result.questions = questionsValid(result.questions).map((q,index) => ({...q,sourceIndex:raw.questions[index].sourceIndex ?? index}));
      grade(result.questions,result.answers);
    }
    return result;
  });
  for (const row of classes) await classesRepo.save(row);
  for (const row of tests) await testsRepo.save(row);
  for (const row of results) await resultsRepo.save(row);
  return {ok:true,counts:{classes:classes.length,tests:tests.length,results:results.length}};
}
export async function clearData(payload) {
  if (payload.confirmation !== 'HAMMASINI OCHIRISH') fail('Tozalash tasdiqlanmadi.');
  for (const repo of [testsRepo,resultsRepo,classesRepo,attemptsRepo,retakesRepo]) await repo.clear();
  return {ok:true};
}
