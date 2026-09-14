const { Router } = require('express');

function systemStatsRoutes(container) {
  const router = Router();
  const auth = container.resolve('authMiddleware');
  const role = container.resolve('roleMiddleware');
  const controller = container.resolve('systemStatsController');

  router.get('/overview', auth, role('admin'), (req, res, next) => controller.overview(req, res, next));
  return router;
}

module.exports = systemStatsRoutes;
