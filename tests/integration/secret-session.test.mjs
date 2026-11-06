// №19: haqiqiy lokal router/Blobsda previous admin key va server logout revokatsiyasi.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localBlobs } from '../helpers/local-blobs.mjs';
import { adminClient } from '../helpers/admin-client.mjs';

test('old signed session survives explicit rotation, missing current config fails, logout revokes', async (t) => {
  const blobs = await localBlobs(t),
    request = await adminClient(blobs);
  const old = process.env.ADMIN_SESSION_SECRET;
  process.env.ADMIN_SESSION_SECRET = old + '-rotated';
  assert.equal((await request('admin/session')).status, 401);
  process.env.ADMIN_SESSION_PREVIOUS_SECRET = old;
  assert.equal((await request('admin/session')).status, 200);
  delete process.env.ADMIN_SESSION_SECRET;
  const writes = blobs.writes();
  assert.equal((await request('admin/session')).status, 503);
  assert.equal(blobs.writes(), writes);
  process.env.ADMIN_SESSION_SECRET = old + '-rotated';
  assert.equal((await request('admin/logout', 'POST')).status, 200);
  assert.equal((await request('admin/session')).status, 401);
});
