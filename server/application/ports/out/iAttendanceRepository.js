class IAttendanceRepository {
  async findById(id) { throw new Error('Not implemented'); }
  async findByScheduleAndStudent(scheduleId, studentId) { throw new Error('Not implemented'); }
  async findBySchedule(scheduleId) { throw new Error('Not implemented'); }
  async save(attendance) { throw new Error('Not implemented'); }
  async update(id, data) { throw new Error('Not implemented'); }
}
module.exports = IAttendanceRepository;
