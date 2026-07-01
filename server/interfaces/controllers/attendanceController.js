class AttendanceController {
  constructor({ checkInUseCase, attendanceRepository, scheduleRepository, qrCodeService }) {
    this.checkInUseCase = checkInUseCase;
    this.attendanceRepository = attendanceRepository;
    this.scheduleRepository = scheduleRepository;
    this.qrCodeService = qrCodeService;
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
}

module.exports = AttendanceController;
