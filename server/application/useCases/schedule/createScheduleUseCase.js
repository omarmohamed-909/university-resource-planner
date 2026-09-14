const Schedule = require('../../../domain/entities/scheduleEntity');

class CreateScheduleUseCase {
  constructor({ scheduleRepository, hallRepository, courseRepository, conflictDetectionService, socketService }) {
    this.scheduleRepository = scheduleRepository;
    this.hallRepository = hallRepository;
    this.courseRepository = courseRepository;
    this.conflictDetectionService = conflictDetectionService;
    this.socketService = socketService;
  }

  async execute(dto) {
    const hall = await this.hallRepository.findById(dto.hallId);
    if (!hall) throw new Error('Hall not found');
    if (!hall.isAvailable()) throw new Error('Hall is under maintenance');

    const course = await this.courseRepository.findById(dto.courseId);
    if (!course) throw new Error('Course not found');

    if (hall.capacity < course.getStudentCount()) {
      throw new Error(`Hall capacity (${hall.capacity}) is less than student count (${course.getStudentCount()})`);
    }

    const newSchedule = new Schedule(dto);

    const existingSchedules = await this.scheduleRepository.findByHall(dto.hallId);
    const hallConflicts = await this.conflictDetectionService.check(newSchedule, existingSchedules);
    if (hallConflicts.length > 0) {
      throw new Error(`Hall conflict: already scheduled at this time`);
    }

    const doctorCourses = await this.courseRepository.findByDoctor(course.doctorId);
    const doctorScheduleIds = [];
    for (const dc of doctorCourses) {
      const dcSchedules = await this.scheduleRepository.findByCourse(dc.id);
      doctorScheduleIds.push(...dcSchedules);
    }
    const doctorConflicts = await this.conflictDetectionService.checkDoctorOverlap(newSchedule, doctorScheduleIds);
    if (doctorConflicts.length > 0) {
      throw new Error(`Doctor has another lecture at this time`);
    }

    const saved = await this.scheduleRepository.save(newSchedule);

    const populated = await this.scheduleRepository.findById(saved.id);
    this.socketService.emitScheduleChange(populated);

    return populated;
  }
}

module.exports = CreateScheduleUseCase;
