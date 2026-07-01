class DeleteScheduleUseCase {
  constructor({ scheduleRepository, socketService }) {
    this.scheduleRepository = scheduleRepository;
    this.socketService = socketService;
  }

  async execute(id) {
    const existing = await this.scheduleRepository.findById(id);
    if (!existing) throw new Error('Schedule not found');
    await this.scheduleRepository.delete(id);
    this.socketService.broadcast('schedule:deleted', { id });
    return { deleted: true };
  }
}

module.exports = DeleteScheduleUseCase;
