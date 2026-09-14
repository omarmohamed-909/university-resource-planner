class GetScheduleUseCase {
  constructor({ scheduleRepository }) {
    this.scheduleRepository = scheduleRepository;
  }

  async execute({ semester, role, userId, page = 1, limit = 20, unpaginated = false }) {
    if (unpaginated) {
      if (role === 'doctor') return { data: await this.scheduleRepository.findByDoctor(userId) };
      if (role === 'student') return { data: await this.scheduleRepository.findByStudent(userId) };
      return { data: semester ? await this.scheduleRepository.findBySemester(semester) : await this.scheduleRepository.findAll() };
    }
    if (role === 'admin') {
      const filter = {};
      if (semester) filter.semester = semester;
      return this.scheduleRepository.findAllPaginated(filter, page, limit);
    }
    if (role === 'doctor') {
      return this.scheduleRepository.findByDoctorPaginated(userId, page, limit, semester);
    }
    if (role === 'student') {
      return this.scheduleRepository.findByStudentPaginated(userId, page, limit, semester);
    }
    return this.scheduleRepository.findAllPaginated({}, page, limit);
  }

  async getById(id) {
    return this.scheduleRepository.findById(id);
  }

  async getByHall(hallId) {
    return this.scheduleRepository.findByHall(hallId);
  }
}

module.exports = GetScheduleUseCase;
