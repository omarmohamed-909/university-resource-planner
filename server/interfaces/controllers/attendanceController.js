class AttendanceController {
  constructor({ checkInUseCase, attendanceRepository, scheduleRepository, qrCodeService, pdfExportService, excelExportService }) {
    this.checkInUseCase = checkInUseCase;
    this.attendanceRepository = attendanceRepository;
    this.scheduleRepository = scheduleRepository;
    this.qrCodeService = qrCodeService;
    this.pdfExportService = pdfExportService;
    this.excelExportService = excelExportService;
  }

  async checkIn(req, res, next) {
    try {
      const result = await this.checkInUseCase.execute({
        ...req.body,
        studentId: req.user.id
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getBySchedule(req, res, next) {
    try {
      const { scheduleId } = req.params;
      const { date } = req.query;
      const records = await this.attendanceRepository.findBySchedule(scheduleId, date);
      res.json({ success: true, data: records });
    } catch (error) {
      next(error);
    }
  }

  async generateQR(req, res, next) {
    try {
      const { scheduleId } = req.body;
      if (!scheduleId) return res.status(400).json({ success: false, message: 'Schedule ID is required' });

      const schedule = await this.scheduleRepository.findById(scheduleId);
      if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });

      const data = await this.qrCodeService.generateAttendanceSession(scheduleId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async exportPdf(req, res, next) {
    try {
      const { scheduleId, date } = req.query;
      if (!scheduleId) return res.status(400).json({ success: false, message: 'Schedule ID is required' });

      const [records, schedule] = await Promise.all([
        this.attendanceRepository.findBySchedule(scheduleId, date),
        this.scheduleRepository.findById(scheduleId)
      ]);

      const scheduleInfo = schedule ? {
        courseName: schedule.courseId?.name || '',
        day: schedule.day,
        startTime: schedule.startTime
      } : null;

      const buffer = await this.pdfExportService.exportAttendance(records, scheduleInfo);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="attendance.pdf"');
      res.send(buffer);
    } catch (error) { next(error); }
  }

  async exportExcel(req, res, next) {
    try {
      const { scheduleId, date } = req.query;
      if (!scheduleId) return res.status(400).json({ success: false, message: 'Schedule ID is required' });

      const records = await this.attendanceRepository.findBySchedule(scheduleId, date);
      const buffer = await this.excelExportService.exportAttendance(records);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="attendance.xlsx"');
      res.send(buffer);
    } catch (error) { next(error); }
  }

  async exportMyPdf(req, res, next) {
    try {
      const records = await this.attendanceRepository.findByStudent(req.user.id);
      const buffer = await this.pdfExportService.exportStudentAttendance(records, req.user);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="my-attendance.pdf"');
      res.send(buffer);
    } catch (error) { next(error); }
  }

  async exportMyExcel(req, res, next) {
    try {
      const records = await this.attendanceRepository.findByStudent(req.user.id);
      const buffer = await this.excelExportService.exportStudentAttendance(records, req.user);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="my-attendance.xlsx"');
      res.send(buffer);
    } catch (error) { next(error); }
  }
}

module.exports = AttendanceController;
