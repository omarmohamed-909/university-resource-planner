const CourseModel = require('../models/courseModel');
const Course = require('../../../domain/entities/courseEntity');

class MongooseCourseRepository {
  async findById(id) {
    const doc = await CourseModel.findById(id).lean();
    if (!doc) return null;
    return new Course({ id: doc._id.toString(), ...doc, _id: undefined, doctorId: doc.doctorId?.toString() });
  }

  async findAll(filter = {}) {
    const docs = await CourseModel.find(filter).lean();
    return docs.map(doc => new Course({ id: doc._id.toString(), ...doc, _id: undefined, doctorId: doc.doctorId?.toString() }));
  }

  async findAllPaginated(filter = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      CourseModel.find(filter).skip(skip).limit(limit).lean(),
      CourseModel.countDocuments(filter)
    ]);
    return {
      data: docs.map(doc => new Course({ id: doc._id.toString(), ...doc, _id: undefined, doctorId: doc.doctorId?.toString() })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  async findByDoctor(doctorId) {
    const docs = await CourseModel.find({ doctorId }).lean();
    return docs.map(doc => new Course({ id: doc._id.toString(), ...doc, _id: undefined, doctorId: doc.doctorId?.toString() }));
  }

  async findByStudent(studentId) {
    const docs = await CourseModel.find({ studentIds: studentId }).lean();
    return docs.map(doc => new Course({ id: doc._id.toString(), ...doc, _id: undefined }));
  }

  async save(course) {
    const doc = await CourseModel.create({
      code: course.code,
      name: course.name,
      doctorId: course.doctorId,
      department: course.department,
      studentIds: course.studentIds,
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
