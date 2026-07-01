const { Router } = require('express');

function attendanceRoutes(container) {
  const router = Router();
  const controller = container.resolve('attendanceController');
  const auth = container.resolve('authMiddleware');
  const role = container.resolve('roleMiddleware');

  router.use(auth);

  router.get('/export/pdf', role('doctor', 'admin'), (req, res, next) => controller.exportPdf(req, res, next));
  router.get('/export/excel', role('doctor', 'admin'), (req, res, next) => controller.exportExcel(req, res, next));
  router.get('/my/export/pdf', role('student'), (req, res, next) => controller.exportMyPdf(req, res, next));
  router.get('/my/export/excel', role('student'), (req, res, next) => controller.exportMyExcel(req, res, next));
  router.post('/checkin', role('student'), (req, res, next) => controller.checkIn(req, res, next));
  router.post('/generate-qr', role('doctor', 'admin'), (req, res, next) => controller.generateQR(req, res, next));
  router.get('/schedule/:scheduleId', role('doctor', 'admin'), (req, res, next) => controller.getBySchedule(req, res, next));

  return router;
}

module.exports = attendanceRoutes;
