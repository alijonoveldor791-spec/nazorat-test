// Mavzular, chorak qoralamasi, tayyor umumiy testlar va tarif boshqaruvi adapterlari.
import { adminRoute as route } from '../../lib/route.mjs';
import * as topics from '../../services/topic-service.mjs';
import * as quarter from '../../services/quarter-test-service.mjs';
import * as bank from '../../services/shared-bank-service.mjs';
import * as policy from '../../services/bank-policy-service.mjs';
import { exportDocument } from '../../services/test-document-service.mjs';
import { publishLibrary } from '../../services/library-online-service.mjs';
export const routes = [
  route('GET', '/admin/topics', () => topics.listTopics()),
  route('POST', '/admin/topics', async ({ body }) => topics.createTopic(await body()), 201),
  route('GET', '/admin/topics/:id', ({ params }) => topics.findTopic(params.id)),
  route('POST', '/admin/topics/:id/import', async ({ params, body }) =>
    topics.appendQuestions(params.id, await body())
  ),
  route('PUT', '/admin/topics/:id/question', async ({ params, body }) =>
    topics.editTopicQuestion(params.id, await body())
  ),
  route('POST', '/admin/quarter/compose', async ({ body }) => quarter.composeQuarter(await body())),
  route('POST', '/admin/quarter/replace', async ({ body }) => quarter.replaceQuarterQuestion(await body())),
  route('POST', '/admin/quarter/save', async ({ body }) => quarter.saveQuarter(await body()), 201),
  route('POST', '/admin/tests/:id/publish', async ({ params, body }) =>
    publishLibrary(params.id, await body())
  ),
  route('GET', '/admin/tests/:id/document', ({ params, url }) =>
    exportDocument(params.id, url.searchParams.get('format'))
  ),
  route('POST', '/admin/tests/:id/share', ({ params }) => bank.submitShared(params.id), 201),
  route('GET', '/admin/shared-tests', () => bank.listShared()),
  route('GET', '/admin/bank-access', () => policy.bankAccess()),
  route('POST', '/admin/shared-tests/:id/take', ({ params }) => bank.takeShared(params.id), 201),
  route('GET', '/admin/shared-tests/:id/document', ({ params, url }) =>
    exportDocument(params.id, url.searchParams.get('format'), true)
  ),
  route('GET', '/super-admin/shared-tests', () => bank.reviewQueue()),
  route('PUT', '/super-admin/shared-tests/:id', async ({ params, body }) =>
    bank.moderateShared(params.id, await body())
  ),
  route('GET', '/super-admin/bank-policies', () => policy.listPolicies()),
  route('PUT', '/super-admin/bank-policies', async ({ body }) => policy.saveBankPolicy(await body())),
];
