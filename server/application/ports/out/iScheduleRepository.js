class IScheduleRepository {
  async findById(id) { throw new Error('Not implemented'); }
  async findAll(filter) { throw new Error('Not implemented'); }
  async findByHall(hallId) { throw new Error('Not implemented'); }
  async findByCourse(courseId) { throw new Error('Not implemented'); }
  async findBySemester(semester) { throw new Error('Not implemented'); }
  async save(schedule) { throw new Error('Not implemented'); }
  async update(id, data) { throw new Error('Not implemented'); }
  async delete(id) { throw new Error('Not implemented'); }
}
module.exports = IScheduleRepository;
