function getTeacherDashboard() {
  return {
    role: 'teacher',
    message: 'Teacher dashboard with class summaries',
    upcomingSessions: 3,
  };
}

function getTeacherClasses() {
  return {
    role: 'teacher',
    classes: ['Mathematics', 'Science'],
  };
}

module.exports = {
  getTeacherDashboard,
  getTeacherClasses,
};
