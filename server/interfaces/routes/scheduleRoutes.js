const { Router } = require('express');
const validateMiddleware = require('../middleware/validateMiddleware');
const { createScheduleSchema, updateScheduleSchema } = require('../validators/scheduleValidator');

function scheduleRoutes(container) {
  const router = Router();
  const controller = container.resolve('scheduleController');
  const auth = container.resolve('authMiddleware');
  const role = container.resolve('roleMiddleware');

  router.use(auth);

  // IMPORTANT: specific routes must come before parameterized routes like /:id
  router.get('/export/pdf', (req, res, next) => controller.exportPdf(req, res, next));
  router.get('/export/excel', (req, res, next) => controller.exportExcel(req, res, next));
  router.post('/auto-generate', role('admin'), (req, res, next) => controller.autoGenerate(req, res, next));
  router.get('/auto-generate/jobs/:jobId', role('admin'), (req, res, next) => controller.autoGenerateStatus(req, res, next));
  router.get('/available', (req, res, next) => {
    const hallController = container.resolve('hallController');
    hallController.getAvailable(req, res, next);
  });
  router.get('/hall/:hallId', (req, res, next) => controller.getByHall(req, res, next));

  router.post('/', role('admin'), validateMiddleware(createScheduleSchema), (req, res, next) => controller.create(req, res, next));
  router.get('/', (req, res, next) => controller.getAll(req, res, next));
  router.get('/:id', (req, res, next) => controller.getById(req, res, next));
  router.put('/:id', role('admin'), validateMiddleware(updateScheduleSchema), (req, res, next) => controller.update(req, res, next));
  router.delete('/:id', role('admin'), (req, res, next) => controller.delete(req, res, next));

  return router;
}

module.exports = scheduleRoutes;
