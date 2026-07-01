const getId = require('../../../domain/utils/getId');

class CheckInUseCase {
  constructor({ attendanceRepository, scheduleRepository, courseRepository, qrCodeService }) {
    this.attendanceRepository = attendanceRepository;
    this.scheduleRepository = scheduleRepository;
    this.courseRepository = courseRepository;
    this.qrCodeService = qrCodeService;
  }

  async execute({ scheduleId, studentId, qrData }) {
    this.validateQrData(qrData, scheduleId);

    const schedule = await this.scheduleRepository.findById(scheduleId);
    if (!schedule) throw new Error('Schedule not found');

    const courseId = getId(schedule.courseId);
    const course = await this.courseRepository.findById(courseId);
    if (!course) throw new Error('Course not found');

    const isEnrolled = course.studentIds.some(id => id.toString() === studentId);
    if (!isEnrolled) {
      throw new Error('Student is not enrolled in this course');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.attendanceRepository.findByScheduleAndStudent(scheduleId, studentId);
    if (existing) {
      const existingDate = new Date(existing.date);
      existingDate.setHours(0, 0, 0, 0);
      if (existingDate.getTime() === today.getTime()) {
        if (existing.isPresent()) {
          return { message: 'Already checked in', attendance: existing };
        }
        existing.markPresent();
        const updated = await this.attendanceRepository.update(existing.id, { status: 'present' });
        return { message: 'Checked in successfully', attendance: updated };
      }
    }

    const Attendance = require('../../../domain/entities/attendanceEntity');
    const attendance = new Attendance({
      scheduleId,
      studentId,
      date: today,
      status: 'present',
      qrCode: qrData
    });

    const saved = await this.attendanceRepository.save(attendance);
    return { message: 'Checked in successfully', attendance: saved };
  }

  validateQrData(qrData, scheduleId) {
    return this.qrCodeService.verifyAttendancePayload(qrData, scheduleId);
  }
}

module.exports = CheckInUseCase;
