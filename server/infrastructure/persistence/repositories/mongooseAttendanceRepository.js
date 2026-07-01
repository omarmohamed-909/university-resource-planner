const AttendanceModel = require('../models/attendanceModel');
const Attendance = require('../../../domain/entities/attendanceEntity');

class MongooseAttendanceRepository {
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
    const filter = { scheduleId };
    if (date) {
      const from = new Date(date);
      from.setHours(0, 0, 0, 0);
      const to = new Date(from);
      to.setDate(to.getDate() + 1);
      filter.date = { $gte: from, $lt: to };
    }
    const docs = await AttendanceModel.find(filter).populate('studentId', 'name email department').lean();
    return docs.map(doc => new Attendance({ id: doc._id.toString(), ...doc, _id: undefined }));
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
