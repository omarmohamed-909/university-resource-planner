const { Router } = require('express');

function attendanceRoutes(container) {
  const router = Router();
  const controller = container.resolve('attendanceController');
  const auth = container.resolve('authMiddleware');
  const role = container.resolve('roleMiddleware');

  router.use(auth);

  router.post('/checkin', role('student'), (req, res, next) => controller.checkIn(req, res, next));
  router.post('/generate-qr', role('doctor', 'admin'), (req, res, next) => controller.generateQR(req, res, next));
  router.get('/schedule/:scheduleId', role('doctor', 'admin'), (req, res, next) => controller.getBySchedule(req, res, next));

  return router;
}

module.exports = attendanceRoutes;
