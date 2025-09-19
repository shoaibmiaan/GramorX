const express = require('express');
const authorizeRole = require('../middleware/authorizeRole');
const { getStudentDashboard, getStudentCourses } = require('../services/studentService');

const router = express.Router();

router.get('/dashboard', authorizeRole('student'), (req, res) => {
  const dashboard = getStudentDashboard();
  return res.json(dashboard);
});

router.get('/courses', authorizeRole('student'), (req, res) => {
  const courses = getStudentCourses();
  return res.json(courses);
});

module.exports = router;
