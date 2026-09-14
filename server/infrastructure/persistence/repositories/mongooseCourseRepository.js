const CourseModel = require('../models/courseModel');
const Course = require('../../../domain/entities/courseEntity');

class MongooseCourseRepository {
  async findById(id) {
    const doc = await CourseModel.findById(id).select('-studentIds').lean();
    if (!doc) return null;
    return new Course({ id: doc._id.toString(), ...doc, _id: undefined, doctorId: doc.doctorId?.toString() });
  }

  async findAll(filter = {}) {
    const docs = await CourseModel.find(filter).select('-studentIds').lean();
    return docs.map(doc => new Course({ id: doc._id.toString(), ...doc, _id: undefined, doctorId: doc.doctorId?.toString() }));
  }

  async findAllPaginated(filter = {}, page = 1, limit = 20, search = '') {
    const normalizedSearch = String(search || '').trim();
    if (normalizedSearch) {
      const { escapeRegex } = require('../../../interfaces/http/queryPagination');
      const term = new RegExp(`^${escapeRegex(normalizedSearch)}`, 'i');
      filter = { ...filter, $or: [{ code: term }, { name: term }, { department: term }] };
    }
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      CourseModel.find(filter).select('-studentIds').sort({ code: 1, _id: 1 }).skip(skip).limit(limit).lean(),
      CourseModel.countDocuments(filter)
    ]);
    return {
      data: docs.map(doc => new Course({ id: doc._id.toString(), ...doc, _id: undefined, doctorId: doc.doctorId?.toString() })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  async count(filter = {}) {
    return CourseModel.countDocuments(filter);
  }

  async findByDoctor(doctorId) {
    const docs = await CourseModel.find({ doctorId }).lean();
    return docs.map(doc => new Course({ id: doc._id.toString(), ...doc, _id: undefined, doctorId: doc.doctorId?.toString() }));
  }

  async findByDoctorPaginated(doctorId, page = 1, limit = 20) {
    return this.findAllPaginated({ doctorId }, page, limit);
  }

  async findByStudent(studentId) {
    const EnrollmentModel = require('../models/enrollmentModel');
    let courseIds = await EnrollmentModel.find({ studentId }).distinct('courseId');
    const filter = courseIds.length ? { _id: { $in: courseIds } } : { studentIds: studentId };
    const docs = await CourseModel.find(filter).lean();
    return docs.map(doc => new Course({ id: doc._id.toString(), ...doc, _id: undefined }));
  }

  async findByStudentPaginated(studentId, page = 1, limit = 20) {
    const EnrollmentModel = require('../models/enrollmentModel');
    let courseIds = await EnrollmentModel.find({ studentId }).distinct('courseId');
    const filter = courseIds.length ? { _id: { $in: courseIds } } : { studentIds: studentId };
    return this.findAllPaginated(filter, page, limit);
  }

  async isStudentEnrolled(courseId, studentId) {
    const EnrollmentModel = require('../models/enrollmentModel');
    const enrollment = await EnrollmentModel.exists({ courseId, studentId });
    if (enrollment) return true;
    return Boolean(await CourseModel.exists({ _id: courseId, studentIds: studentId }));
  }

  async save(course) {
    const doc = await CourseModel.create({
      code: course.code,
      name: course.name,
      doctorId: course.doctorId,
      department: course.department,
      studentIds: course.studentIds,
      studentCount: course.studentIds.length,
      creditHours: course.creditHours
    });
    return new Course({ id: doc._id.toString(), ...doc.toObject(), _id: undefined });
  }

  async update(id, data) {
    const doc = await CourseModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!doc) return null;
    return new Course({ id: doc._id.toString(), ...doc, _id: undefined, doctorId: doc.doctorId?.toString() });
  }

  async delete(id) {
    await CourseModel.findByIdAndDelete(id);
  }
}

module.exports = MongooseCourseRepository;
