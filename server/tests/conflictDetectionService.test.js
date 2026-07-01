const test = require('node:test');
const assert = require('node:assert/strict');
const Schedule = require('../domain/entities/scheduleEntity');
const ConflictDetectionService = require('../domain/services/conflictDetectionService');

test('detects overlapping schedules in the same hall and day', async () => {
  const service = new ConflictDetectionService();
  const next = new Schedule({
    id: 'new',
    courseId: 'course-1',
    hallId: 'hall-1',
    day: 'sunday',
    startTime: '09:00',
    endTime: '10:00',
    weekPattern: 'weekly',
    semester: '2026-1'
  });

  const conflicts = await service.check(next, [{
    id: 'existing',
    courseId: 'course-2',
    hallId: 'hall-1',
    day: 'sunday',
    startTime: '09:30',
    endTime: '11:00',
    weekPattern: 'weekly',
    semester: '2026-1'
  }]);

  assert.equal(conflicts.length, 1);
});

test('allows odd and even schedules to share the same hall time', async () => {
  const service = new ConflictDetectionService();
  const next = new Schedule({
    id: 'new',
    courseId: 'course-1',
    hallId: 'hall-1',
    day: 'sunday',
    startTime: '09:00',
    endTime: '10:00',
    weekPattern: 'odd',
    semester: '2026-1'
  });

  const conflicts = await service.check(next, [{
    id: 'existing',
    courseId: 'course-2',
    hallId: 'hall-1',
    day: 'sunday',
    startTime: '09:00',
    endTime: '10:00',
    weekPattern: 'even',
    semester: '2026-1'
  }]);

  assert.equal(conflicts.length, 0);
});
