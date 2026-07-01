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
      ScheduleModel.find(filter).skip(skip).limit(limit).populate('courseId hallId').lean(),
      ScheduleModel.countDocuments(filter)
    ]);
    return {
      data: docs.map(doc => new Schedule({ id: doc._id.toString(), ...doc, _id: undefined })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
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
    const CourseModel = require('../models/courseModel');
    const courses = await CourseModel.find({ studentIds: studentId }).lean();
    const courseIds = courses.map(c => c._id);
    const docs = await ScheduleModel.find({ courseId: { $in: courseIds } })
      .populate('courseId hallId').lean();
    return docs.map(doc => new Schedule({ id: doc._id.toString(), ...doc, _id: undefined }));
  }

  async save(schedule) {
    const doc = await ScheduleModel.create({
      courseId: schedule.courseId,
      hallId: schedule.hallId,
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      weekPattern: schedule.weekPattern,
      semester: schedule.semester
    });
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

  async deleteMany(filter) {
    await ScheduleModel.deleteMany(filter);
  }
}

module.exports = MongooseScheduleRepository;
