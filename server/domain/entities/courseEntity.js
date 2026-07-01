class Course {
  constructor({ id, code, name, doctorId, department, studentIds, creditHours }) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.doctorId = doctorId;
    this.department = department;
    this.studentIds = studentIds || [];
    this.creditHours = creditHours;
  }

  getStudentCount() {
    return this.studentIds.length;
  }
}

module.exports = Course;
