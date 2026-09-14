const EnrollmentModel = require('../models/enrollmentModel');

class MongooseEnrollmentRepository {
  async enrollMany(courseId, studentIds) {
    if (!studentIds.length) return;
    const result = await EnrollmentModel.bulkWrite(studentIds.map(studentId => ({
      updateOne: {
        filter: { courseId, studentId },
        update: { $setOnInsert: { courseId, studentId } },
        upsert: true,
      },
    })), { ordered: false });
    return result.upsertedCount || 0;
  }

  async unenroll(courseId, studentId) {
    const result = await EnrollmentModel.deleteOne({ courseId, studentId });
    return result.deletedCount || 0;
  }

  async deleteByCourse(courseId) {
    await EnrollmentModel.deleteMany({ courseId });
  }

  async listByCourse(courseId, page = 1, limit = 20, search = '') {
    const skip = (page - 1) * limit;
    const pipeline = [
      { $match: { courseId: new (require('mongoose').Types.ObjectId)(courseId) } },
      { $lookup: { from: 'users', localField: 'studentId', foreignField: '_id', as: 'student' } },
      { $unwind: '$student' },
    ];
    const normalizedSearch = String(search || '').trim();
    if (normalizedSearch) {
      const { escapeRegex } = require('../../../interfaces/http/queryPagination');
      const term = new RegExp(`^${escapeRegex(normalizedSearch)}`, 'i');
      pipeline.push({ $match: { $or: [{ 'student.name': term }, { 'student.email': term }] } });
    }
    pipeline.push({ $sort: { 'student.name': 1, _id: 1 } });

    const [result] = await EnrollmentModel.aggregate([
      ...pipeline,
      { $facet: {
        data: [{ $skip: skip }, { $limit: limit }, { $replaceWith: '$student' }, { $project: { password: 0 } }],
        meta: [{ $count: 'total' }],
      } },
    ]);
    const total = result.meta[0]?.total || 0;
    return {
      data: result.data.map(student => ({ ...student, id: student._id.toString(), _id: undefined })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async courseIdsForStudent(studentId) {
    return EnrollmentModel.find({ studentId }).distinct('courseId');
  }
}

module.exports = MongooseEnrollmentRepository;
