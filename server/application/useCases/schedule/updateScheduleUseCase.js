const getId = require('../../../domain/utils/getId');

class UpdateScheduleUseCase {
  constructor({ scheduleRepository, hallRepository, conflictDetectionService, socketService }) {
    this.scheduleRepository = scheduleRepository;
    this.hallRepository = hallRepository;
    this.conflictDetectionService = conflictDetectionService;
    this.socketService = socketService;
  }

  async execute(id, dto) {
    const existing = await this.scheduleRepository.findById(id);
    if (!existing) throw new Error('Schedule not found');

    if (dto.hallId) {
      const hall = await this.hallRepository.findById(dto.hallId);
      if (!hall) throw new Error('Hall not found');
      if (!hall.isAvailable()) throw new Error('Hall is under maintenance');
    }

    const updatedData = {
      ...existing,
      ...dto,
      id,
      hallId: dto.hallId || getId(existing.hallId)
    };
    const updatedSchedule = new (require('../../../domain/entities/scheduleEntity'))(updatedData);

    const allSchedules = await this.scheduleRepository.findByHall(updatedData.hallId);
    const conflicts = await this.conflictDetectionService.check(updatedSchedule, allSchedules);
    if (conflicts.length > 0) {
      throw new Error('Schedule conflict detected');
    }

    const saved = await this.scheduleRepository.update(id, dto);
    this.socketService.emitScheduleChange(saved);
    return saved;
  }

}

module.exports = UpdateScheduleUseCase;
