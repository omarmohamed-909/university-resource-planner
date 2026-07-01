const { Router } = require('express');
const validateMiddleware = require('../middleware/validateMiddleware');
const { swapRequestSchema, swapRespondSchema } = require('../validators/swapValidator');

function swapRoutes(container) {
  const router = Router();
  const controller = container.resolve('swapController');
  const auth = container.resolve('authMiddleware');
  const role = container.resolve('roleMiddleware');

  router.use(auth);

  router.post('/',              role('doctor', 'admin'), validateMiddleware(swapRequestSchema),  (req, res, next) => controller.request(req, res, next));
  router.get('/',                                                                                  (req, res, next) => controller.getAll(req, res, next));
  router.put('/:id/respond',   role('admin'),           validateMiddleware(swapRespondSchema),  (req, res, next) => controller.respond(req, res, next));

  return router;
}

module.exports = swapRoutes;
