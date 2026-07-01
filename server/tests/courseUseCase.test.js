const test = require('node:test');
const assert = require('node:assert/strict');
const CourseUseCase = require('../application/useCases/course/courseUseCase');

test('course use case filters courses for doctor role', async () => {
  const useCase = new CourseUseCase({
    courseRepository: {
      findByDoctor: async doctorId => [{ id: 'course-1', doctorId }],
      findByStudent: async () => [],
      findAll: async () => []
    }
  });

  const result = await useCase.list({ role: 'doctor', userId: 'doctor-1' });

  assert.equal(result.data.length, 1);
  assert.equal(result.data[0].doctorId, 'doctor-1');
});

test('course use case filters courses for student role', async () => {
  const useCase = new CourseUseCase({
    courseRepository: {
      findByDoctor: async () => [],
      findByStudent: async studentId => [{ id: 'course-2', studentIds: [studentId] }],
      findAll: async () => []
    }
  });

  const result = await useCase.list({ role: 'student', userId: 'student-1' });

  assert.equal(result.data.length, 1);
  assert.deepEqual(result.data[0].studentIds, ['student-1']);
});
