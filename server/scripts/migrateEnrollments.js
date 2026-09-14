require('dotenv').config();
const { connectDatabase } = require('../config/database');
const CourseModel = require('../infrastructure/persistence/models/courseModel');
const EnrollmentModel = require('../infrastructure/persistence/models/enrollmentModel');

async function migrate() {
  await connectDatabase();
  let migrated = 0;
  const cursor = CourseModel.find({ 'studentIds.0': { $exists: true } }).select('_id studentIds').lean().cursor();
  for await (const course of cursor) {
    await EnrollmentModel.bulkWrite(course.studentIds.map(studentId => ({
      updateOne: {
        filter: { courseId: course._id, studentId },
        update: { $setOnInsert: { courseId: course._id, studentId } },
        upsert: true,
      },
    })), { ordered: false });
    await CourseModel.updateOne({ _id: course._id }, { $set: { studentCount: course.studentIds.length } });
    migrated += course.studentIds.length;
  }
  console.log(`Enrollment migration complete: ${migrated} relationships processed`);
  process.exit(0);
}

migrate().catch(error => {
  console.error(error);
  process.exit(1);
});
