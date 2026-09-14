const { Router } = require('express');

function courseRoutes(container) {
  const router = Router();
  const auth = container.resolve('authMiddleware');
  const role = container.resolve('roleMiddleware');
  const validate = container.resolve('validateMiddleware');
  const controller = container.resolve('courseController');
  const { createCourseSchema, updateCourseSchema, enrollSchema } = require('../validators/courseValidator');

  router.use(auth);

  router.get('/', (req, res, next) => controller.list(req, res, next));
  router.get('/:id', (req, res, next) => controller.getById(req, res, next));
  router.get('/:id/enrollments', role('admin', 'doctor'), (req, res, next) => controller.listEnrollments(req, res, next));
  router.post('/', role('admin'), validate(createCourseSchema), (req, res, next) => controller.create(req, res, next));
  router.put('/:id', role('admin'), validate(updateCourseSchema), (req, res, next) => controller.update(req, res, next));
  router.delete('/:id', role('admin'), (req, res, next) => controller.delete(req, res, next));
  router.post('/:id/enroll', role('admin'), validate(enrollSchema), (req, res, next) => controller.enroll(req, res, next));
  router.delete('/:id/enroll/:studentId', role('admin'), (req, res, next) => controller.unenroll(req, res, next));

  return router;
}

module.exports = courseRoutes;
