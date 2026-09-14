const ScheduleModel = require('../models/scheduleModel');
const Schedule = require('../../../domain/entities/scheduleEntity');

class MongooseScheduleRepository {
  async findById(id) {
    const doc = await ScheduleModel.findById(id).populate('courseId hallId').lean();
    if (!doc) return null;
    return new Schedule({ id: doc._id.toString(), ...doc, _id: undefined });
  }

  async findAll(filter = {}) {
    const docs = await ScheduleModel.find(filter).populate('courseId hallId').lean();
    return docs.map(doc => new Schedule({ id: doc._id.toString(), ...doc, _id: undefined }));
  }

  async findAllPaginated(filter = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      ScheduleModel.find(filter).sort({ day: 1, startTime: 1, _id: 1 }).skip(skip).limit(limit).populate('courseId hallId').lean(),
      ScheduleModel.countDocuments(filter)
    ]);
    return {
      data: docs.map(doc => new Schedule({ id: doc._id.toString(), ...doc, _id: undefined })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  async count(filter = {}) {
    return ScheduleModel.countDocuments(filter);
  }

  async findByDoctorPaginated(doctorId, page = 1, limit = 20, semester) {
    const CourseModel = require('../models/courseModel');
    const courseIds = await CourseModel.find({ doctorId }).distinct('_id');
    const filter = { courseId: { $in: courseIds } };
    if (semester) filter.semester = semester;
    return this.findAllPaginated(filter, page, limit);
  }

  async findByStudentPaginated(studentId, page = 1, limit = 20, semester) {
    const EnrollmentModel = require('../models/enrollmentModel');
    let courseIds = await EnrollmentModel.find({ studentId }).distinct('courseId');
    if (courseIds.length === 0) {
      const CourseModel = require('../models/courseModel');
      courseIds = await CourseModel.find({ studentIds: studentId }).distinct('_id');
    }
    const filter = { courseId: { $in: courseIds } };
    if (semester) filter.semester = semester;
    return this.findAllPaginated(filter, page, limit);
  }

  async findByHall(hallId) {
    const docs = await ScheduleModel.find({ hallId }).populate('courseId hallId').lean();
    return docs.map(doc => new Schedule({ id: doc._id.toString(), ...doc, _id: undefined }));
  }

  async findByCourse(courseId) {
    const docs = await ScheduleModel.find({ courseId }).populate('courseId hallId').lean();
    return docs.map(doc => new Schedule({ id: doc._id.toString(), ...doc, _id: undefined }));
  }

  async findBySemester(semester) {
    const docs = await ScheduleModel.find({ semester }).populate('courseId hallId').lean();
    return docs.map(doc => new Schedule({ id: doc._id.toString(), ...doc, _id: undefined }));
  }

  async findByDoctor(doctorId) {
    const CourseModel = require('../models/courseModel');
    const courses = await CourseModel.find({ doctorId }).lean();
    const courseIds = courses.map(c => c._id);
    const docs = await ScheduleModel.find({ courseId: { $in: courseIds } })
      .populate('courseId hallId').lean();
    return docs.map(doc => new Schedule({ id: doc._id.toString(), ...doc, _id: undefined }));
  }

  async findByStudent(studentId) {
    const EnrollmentModel = require('../models/enrollmentModel');
    let courseIds = await EnrollmentModel.find({ studentId }).distinct('courseId');
    if (courseIds.length === 0) {
      const CourseModel = require('../models/courseModel');
      courseIds = await CourseModel.find({ studentIds: studentId }).distinct('_id');
    }
    const docs = await ScheduleModel.find({ courseId: { $in: courseIds } })
      .populate('courseId hallId').lean();
    return docs.map(doc => new Schedule({ id: doc._id.toString(), ...doc, _id: undefined }));
  }

  async save(schedule, options = {}) {
    const payload = {
      courseId: schedule.courseId,
      hallId: schedule.hallId,
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      weekPattern: schedule.weekPattern,
      semester: schedule.semester
    };
    const doc = options.session
      ? (await ScheduleModel.create([payload], { session: options.session }))[0]
      : await ScheduleModel.create(payload);
    return new Schedule({ id: doc._id.toString(), ...doc.toObject(), _id: undefined });
  }

  async update(id, data) {
    const doc = await ScheduleModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!doc) return null;
    return new Schedule({ id: doc._id.toString(), ...doc, _id: undefined });
  }

  async delete(id) {
    await ScheduleModel.findByIdAndDelete(id);
  }

  async deleteMany(filter, options = {}) {
    await ScheduleModel.deleteMany(filter, options);
  }

  async replaceMany(filter, schedules, options = {}) {
    await ScheduleModel.deleteMany(filter, options);
    if (!schedules.length) return [];
    const payloads = schedules.map(schedule => ({
      courseId: schedule.courseId,
      hallId: schedule.hallId,
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      weekPattern: schedule.weekPattern,
      semester: schedule.semester,
    }));
    const docs = await ScheduleModel.insertMany(payloads, { session: options.session });
    return docs.map(doc => new Schedule({ id: doc._id.toString(), ...doc.toObject(), _id: undefined }));
  }
}

module.exports = MongooseScheduleRepository;
