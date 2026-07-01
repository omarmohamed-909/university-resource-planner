const test = require('node:test');
const assert = require('node:assert/strict');
const QrCodeService = require('../infrastructure/qr/qrCodeService');

test('attendance QR verifies a signed payload for the same schedule', async () => {
  process.env.QR_SECRET = 'test-secret';
  const service = new QrCodeService();

  const session = await service.generateAttendanceSession('schedule-1', 10);
  const payload = service.verifyAttendancePayload(session.payload, 'schedule-1');

  assert.equal(payload.type, 'attendance');
  assert.equal(payload.scheduleId, 'schedule-1');
  assert.ok(payload.nonce);
  assert.ok(payload.expiresAt);
});

test('attendance QR rejects tampered schedule data', async () => {
  process.env.QR_SECRET = 'test-secret';
  const service = new QrCodeService();
  const session = await service.generateAttendanceSession('schedule-1', 10);
  const payload = JSON.parse(session.payload);

  payload.scheduleId = 'schedule-2';

  assert.throws(
    () => service.verifyAttendancePayload(JSON.stringify(payload), 'schedule-2'),
    /signature is invalid/
  );
});

test('attendance QR rejects expired payloads', async () => {
  process.env.QR_SECRET = 'test-secret';
  const service = new QrCodeService();
  const session = await service.generateAttendanceSession('schedule-1', -1);

  assert.throws(
    () => service.verifyAttendancePayload(session.payload, 'schedule-1'),
    /expired/
  );
});
