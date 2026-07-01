const Course = require('../../../domain/entities/courseEntity');

class CourseUseCase {
  constructor({ courseRepository }) {
    this.courseRepository = courseRepository;
  }

  async list({ role, userId, page, limit }) {
    if (role === 'doctor') return { data: await this.courseRepository.findByDoctor(userId) };
    if (role === 'student') return { data: await this.courseRepository.findByStudent(userId) };
    if (page) return this.courseRepository.findAllPaginated({}, page, limit);
    return { data: await this.courseRepository.findAll() };
  }

  async getById(id) {
    return this.courseRepository.findById(id);
  }

  async create(dto) {
    return this.courseRepository.save(new Course(dto));
  }

  async update(id, dto) {
    return this.courseRepository.update(id, dto);
  }

  async delete(id) {
    await this.courseRepository.delete(id);
    return { deleted: true };
  }

  async enroll(courseId, studentIds) {
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      throw new Error('studentIds must be a non-empty array');
    }
    return this.courseRepository.update(courseId, {
      $addToSet: { studentIds: { $each: studentIds } }
    });
  }

  async unenroll(courseId, studentId) {
    return this.courseRepository.update(courseId, {
      $pull: { studentIds: studentId }
    });
  }
}

module.exports = CourseUseCase;
