class GetScheduleUseCase {
  constructor({ scheduleRepository }) {
    this.scheduleRepository = scheduleRepository;
  }

  async execute({ semester, role, userId, page, limit }) {
    if (role === 'admin' && page) {
      const filter = {};
      if (semester) filter.semester = semester;
      return this.scheduleRepository.findAllPaginated(filter, page, limit || 20);
    }
    if (role === 'admin') {
      const schedules = semester
        ? await this.scheduleRepository.findBySemester(semester)
        : await this.scheduleRepository.findAll();
      return { data: schedules };
    }
    if (role === 'doctor') {
      return { data: await this.scheduleRepository.findByDoctor(userId) };
    }
    if (role === 'student') {
      return { data: await this.scheduleRepository.findByStudent(userId) };
    }
    return { data: await this.scheduleRepository.findAll() };
  }

  async getById(id) {
    return this.scheduleRepository.findById(id);
  }

  async getByHall(hallId) {
    return this.scheduleRepository.findByHall(hallId);
  }
}

module.exports = GetScheduleUseCase;
