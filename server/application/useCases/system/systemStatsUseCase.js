class SystemStatsUseCase {
  constructor({ userRepository, hallRepository, courseRepository, scheduleRepository }) {
    this.userRepository = userRepository;
    this.hallRepository = hallRepository;
    this.courseRepository = courseRepository;
    this.scheduleRepository = scheduleRepository;
  }

  async execute({ semester } = {}) {
    const scheduleFilter = semester ? { semester } : {};
    const [students, doctors, courses, schedules, halls, activeHalls, maintenanceHalls] = await Promise.all([
      this.userRepository.count({ role: 'student', isActive: true }),
      this.userRepository.count({ role: 'doctor', isActive: true }),
      this.courseRepository.count(),
      this.scheduleRepository.count(scheduleFilter),
      this.hallRepository.count(),
      this.hallRepository.count({ status: 'active' }),
      this.hallRepository.count({ status: 'maintenance' }),
    ]);

    return { students, doctors, courses, schedules, halls, activeHalls, maintenanceHalls };
  }
}

module.exports = SystemStatsUseCase;
