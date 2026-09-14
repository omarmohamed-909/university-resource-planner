const AttendanceModel = require('../models/attendanceModel');
const Attendance = require('../../../domain/entities/attendanceEntity');

class MongooseAttendanceRepository {
  buildScheduleFilter(scheduleId, date) {
    const filter = { scheduleId };
    if (date) {
      const from = new Date(date);
      from.setHours(0, 0, 0, 0);
      const to = new Date(from);
      to.setDate(to.getDate() + 1);
      filter.date = { $gte: from, $lt: to };
    }
    return filter;
  }

  async findById(id) {
    const doc = await AttendanceModel.findById(id).lean();
    if (!doc) return null;
    return new Attendance({ id: doc._id.toString(), ...doc, _id: undefined });
  }

  async findByScheduleAndStudent(scheduleId, studentId) {
    const doc = await AttendanceModel.findOne({ scheduleId, studentId }).lean();
    if (!doc) return null;
    return new Attendance({ id: doc._id.toString(), ...doc, _id: undefined });
  }

  async findBySchedule(scheduleId, date) {
    const filter = this.buildScheduleFilter(scheduleId, date);
    const docs = await AttendanceModel.find(filter).sort({ date: -1, _id: -1 }).populate('studentId', 'name email department').lean();
    return docs.map(doc => new Attendance({ id: doc._id.toString(), ...doc, _id: undefined }));
  }

  async findBySchedulePaginated(scheduleId, date, page = 1, limit = 20) {
    const filter = this.buildScheduleFilter(scheduleId, date);
    const [result, present, absent] = await Promise.all([
      this.paginate(filter, page, limit, query => query.populate('studentId', 'name email department')),
      AttendanceModel.countDocuments({ ...filter, status: 'present' }),
      AttendanceModel.countDocuments({ ...filter, status: 'absent' }),
    ]);
    return { ...result, summary: { present, absent, total: present + absent } };
  }

  async save(attendance) {
    const doc = await AttendanceModel.create({
      scheduleId: attendance.scheduleId,
      studentId: attendance.studentId,
      date: attendance.date,
      status: attendance.status,
      qrCode: attendance.qrCode
    });
    return new Attendance({ id: doc._id.toString(), ...doc.toObject(), _id: undefined });
  }

  async update(id, data) {
    const doc = await AttendanceModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!doc) return null;
    return new Attendance({ id: doc._id.toString(), ...doc, _id: undefined });
  }

  async findByStudent(studentId) {
    const docs = await AttendanceModel.find({ studentId })
      .populate({
        path: 'scheduleId',
        populate: { path: 'courseId', select: 'name code' }
      })
      .sort({ date: -1 })
      .lean();
    return docs.map(doc => new Attendance({ id: doc._id.toString(), ...doc, _id: undefined }));
  }

  async findByStudentPaginated(studentId, page = 1, limit = 20) {
    return this.paginate({ studentId }, page, limit, query => query.populate({
      path: 'scheduleId',
      populate: { path: 'courseId', select: 'name code' }
    }));
  }

  async paginate(filter, page, limit, decorate = query => query) {
    const skip = (page - 1) * limit;
    const baseQuery = AttendanceModel.find(filter).sort({ date: -1, _id: -1 }).skip(skip).limit(limit);
    const [docs, total] = await Promise.all([
      decorate(baseQuery).lean(),
      AttendanceModel.countDocuments(filter),
    ]);
    return {
      data: docs.map(doc => new Attendance({ id: doc._id.toString(), ...doc, _id: undefined })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async count(filter = {}) {
    return AttendanceModel.countDocuments(filter);
  }

  async markBulk(scheduleId, date, studentIds, status) {
    const ops = studentIds.map(studentId => ({
      updateOne: {
        filter: { scheduleId, studentId, date },
        update: { $set: { status } },
        upsert: true
      }
    }));
    await AttendanceModel.bulkWrite(ops);
  }
}

module.exports = MongooseAttendanceRepository;
