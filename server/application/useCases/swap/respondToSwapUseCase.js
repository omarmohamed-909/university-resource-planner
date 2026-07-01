const getId = require('../../../domain/utils/getId');

class RespondToSwapUseCase {
  constructor({ scheduleRepository, socketService, swapRepository, hallRepository, courseRepository, conflictDetectionService }) {
    this.scheduleRepository = scheduleRepository;
    this.socketService = socketService;
    this.swapRepository = swapRepository;
    this.hallRepository = hallRepository;
    this.courseRepository = courseRepository;
    this.conflictDetectionService = conflictDetectionService;
  }

  async execute({ swapId, action }) {
    const swap = await this.swapRepository.findById(swapId);
    if (!swap) throw new Error('Swap request not found');
    if (swap.status !== 'pending') throw new Error('Swap request already resolved');

    if (action === 'approve') {
      const scheduleId = getId(swap.originalScheduleId);
      const originalSchedule = await this.scheduleRepository.findById(scheduleId);
      if (!originalSchedule) throw new Error('Original schedule not found');

      const nextHallId = getId(swap.proposedHallId) || getId(originalSchedule.hallId);
      const updateData = {
        hallId: nextHallId,
        day: swap.proposedDay || originalSchedule.day,
        startTime: swap.proposedStartTime || originalSchedule.startTime,
        endTime: swap.proposedEndTime || originalSchedule.endTime
      };

      const hall = await this.hallRepository.findById(nextHallId);
      if (!hall) throw new Error('Proposed hall not found');
      if (!hall.isAvailable()) throw new Error('Proposed hall is not available');

      const courseId = getId(originalSchedule.courseId);
      const course = await this.courseRepository.findById(courseId);
      if (!course) throw new Error('Course not found');
      if (hall.capacity < course.getStudentCount()) {
        throw new Error(`Hall capacity (${hall.capacity}) is less than student count (${course.getStudentCount()})`);
      }

      const Schedule = require('../../../domain/entities/scheduleEntity');
      const updatedSchedule = new Schedule({
        ...originalSchedule,
        ...updateData,
        id: scheduleId,
        courseId
      });

      const hallSchedules = await this.scheduleRepository.findByHall(nextHallId);
      const hallConflicts = await this.conflictDetectionService.check(updatedSchedule, hallSchedules);
      if (hallConflicts.length > 0) {
        throw new Error('Proposed swap conflicts with another lecture in this hall');
      }

      const doctorSchedules = await this.scheduleRepository.findByDoctor(getId(course.doctorId));
      const doctorConflicts = this.conflictDetectionService.checkDoctorOverlap(updatedSchedule, doctorSchedules);
      if (doctorConflicts.length > 0) {
        throw new Error('Doctor has another lecture at the proposed time');
      }

      const savedSchedule = await this.scheduleRepository.update(scheduleId, updateData);
      await this.swapRepository.update(swapId, { status: 'approved' });
      this.socketService.emitScheduleChange(savedSchedule);
      this.socketService.broadcast('swap:approved', { swapId });
    } else if (action === 'reject') {
      await this.swapRepository.update(swapId, { status: 'rejected' });
      this.socketService.broadcast('swap:rejected', { swapId });
    } else {
      throw new Error('Invalid action. Must be approve or reject');
    }

    return { id: swapId, status: action === 'approve' ? 'approved' : 'rejected' };
  }

}

module.exports = RespondToSwapUseCase;
