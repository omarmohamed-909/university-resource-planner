const { Router } = require('express');
const validateMiddleware = require('../middleware/validateMiddleware');
const { createHallSchema, updateHallSchema } = require('../validators/hallValidator');

function hallRoutes(container) {
  const router = Router();
  const controller = container.resolve('hallController');
  const auth = container.resolve('authMiddleware');
  const role = container.resolve('roleMiddleware');

  router.use(auth);

  router.post('/', role('admin'), validateMiddleware(createHallSchema), (req, res, next) => controller.create(req, res, next));
  router.get('/', (req, res, next) => controller.getAll(req, res, next));
  router.get('/available', (req, res, next) => controller.getAvailable(req, res, next));
  router.get('/:id', (req, res, next) => controller.getById(req, res, next));
  router.put('/:id', role('admin'), validateMiddleware(updateHallSchema), (req, res, next) => controller.update(req, res, next));
  router.delete('/:id', role('admin'), (req, res, next) => controller.delete(req, res, next));

  return router;
}

module.exports = hallRoutes;
