function getStudentDashboard() {
  return {
    role: 'student',
    message: 'Student dashboard with assignments',
    pendingAssignments: 2,
  };
}

function getStudentCourses() {
  return {
    role: 'student',
    courses: ['History', 'Biology'],
  };
}

module.exports = {
  getStudentDashboard,
  getStudentCourses,
};
