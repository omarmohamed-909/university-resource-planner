class GetAvailableHallsUseCase {
  constructor({ hallRepository }) {
    this.hallRepository = hallRepository;
  }

  async execute({ day, startTime, endTime, semester, excludeScheduleId } = {}) {
    return this.hallRepository.findAvailable({ day, startTime, endTime, semester, excludeScheduleId });
  }
}

module.exports = GetAvailableHallsUseCase;
