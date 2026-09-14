const Course = require('../../../domain/entities/courseEntity');

class CourseUseCase {
  constructor({ courseRepository, enrollmentRepository }) {
    this.courseRepository = courseRepository;
    this.enrollmentRepository = enrollmentRepository;
  }

  async list({ role, userId, page, limit, search }) {
    if (role === 'doctor') {
      if (this.courseRepository.findByDoctorPaginated && page) {
        return this.courseRepository.findByDoctorPaginated(userId, page, limit);
      }
      return { data: await this.courseRepository.findByDoctor(userId) };
    }
    if (role === 'student') {
      if (this.courseRepository.findByStudentPaginated && page) {
        return this.courseRepository.findByStudentPaginated(userId, page, limit);
      }
      return { data: await this.courseRepository.findByStudent(userId) };
    }
    if (!page && this.courseRepository.findAll) return { data: await this.courseRepository.findAll() };
    return this.courseRepository.findAllPaginated({}, page, limit, search);
  }

  async getById(id) {
    return this.courseRepository.findById(id);
  }

  async create(dto) {
    const saved = await this.courseRepository.save(new Course(dto));
    await this.enrollmentRepository.enrollMany(saved.id, dto.studentIds || []);
    return saved;
  }

  async update(id, dto) {
    return this.courseRepository.update(id, dto);
  }

  async delete(id) {
    await Promise.all([
      this.courseRepository.delete(id),
      this.enrollmentRepository.deleteByCourse(id),
    ]);
    return { deleted: true };
  }

  async enroll(courseId, studentIds) {
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      throw new Error('studentIds must be a non-empty array');
    }
    const added = await this.enrollmentRepository.enrollMany(courseId, studentIds);
    return this.courseRepository.update(courseId, {
      ...(added ? { $inc: { studentCount: added } } : {})
    });
  }

  async unenroll(courseId, studentId) {
    const removed = await this.enrollmentRepository.unenroll(courseId, studentId);
    return this.courseRepository.update(courseId, {
      ...(removed ? { $inc: { studentCount: -removed } } : {})
    });
  }

  async listEnrollments(courseId, { page, limit, search }) {
    return this.enrollmentRepository.listByCourse(courseId, page, limit, search);
  }
}

module.exports = CourseUseCase;
