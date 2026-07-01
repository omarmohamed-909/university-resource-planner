const { Router } = require('express');

function userRoutes(container) {
  const router = Router();
  const auth = container.resolve('authMiddleware');
  const role = container.resolve('roleMiddleware');
  const validate = container.resolve('validateMiddleware');
  const controller = container.resolve('userController');
  const { listUsersSchema } = require('../validators/userValidator');

  router.use(auth, role('admin'));

  router.get('/', validate(listUsersSchema, 'query'), (req, res, next) => controller.list(req, res, next));
  router.get('/:id', (req, res, next) => controller.getById(req, res, next));
  router.put('/:id', (req, res, next) => controller.update(req, res, next));
  router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

  return router;
}

module.exports = userRoutes;
