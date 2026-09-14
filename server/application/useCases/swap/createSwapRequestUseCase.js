const getId = require('../../../domain/utils/getId');

class CreateSwapRequestUseCase {
  constructor({ scheduleRepository, hallRepository, socketService, swapRepository, courseRepository }) {
    this.scheduleRepository = scheduleRepository;
    this.hallRepository = hallRepository;
    this.socketService = socketService;
    this.swapRepository = swapRepository;
    this.courseRepository = courseRepository;
  }

  async execute(dto) {
    const SwapRequest = require('../../../domain/entities/swapRequestEntity');

    const schedule = await this.scheduleRepository.findById(dto.originalScheduleId);
    if (!schedule) throw new Error('Schedule not found');

    if (dto.requesterRole === 'doctor') {
      const courseId = getId(schedule.courseId);
      const course = await this.courseRepository.findById(courseId);
      
      const docIdFromCourse = course ? String(getId(course.doctorId)) : 'undefined';
      const docIdFromReq = String(dto.requesterId);
      // Debug: only log ownership mismatches outside production
      if (process.env.NODE_ENV !== 'production' && docIdFromCourse !== docIdFromReq) {
        console.log(`[SWAP] Ownership mismatch — Course Doctor: ${docIdFromCourse} | Requester: ${docIdFromReq}`);
      }
      
      if (!course || docIdFromCourse !== docIdFromReq) {
        throw new Error('يمكنك فقط طلب تبديل محاضراتك الخاصة');
      }
    }

    if (dto.proposedHallId) {
      const hall = await this.hallRepository.findById(dto.proposedHallId);
      if (!hall) throw new Error('Proposed hall not found');
      if (!hall.isAvailable()) throw new Error('Proposed hall is not available');
    }

    new SwapRequest(dto); // validate domain rules
    const saved = await this.swapRepository.save({
      requesterId: dto.requesterId,
      originalScheduleId: dto.originalScheduleId,
      proposedHallId: dto.proposedHallId,
      proposedDay: dto.proposedDay,
      proposedStartTime: dto.proposedStartTime,
      proposedEndTime: dto.proposedEndTime,
      reason: dto.reason,
      status: 'pending'
    });

    this.socketService.broadcast('swap:requested', saved);

    return saved;
  }

}

module.exports = CreateSwapRequestUseCase;
