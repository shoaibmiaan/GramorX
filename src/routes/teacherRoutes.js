const express = require('express');
const authorizeRole = require('../middleware/authorizeRole');
const { getTeacherDashboard, getTeacherClasses } = require('../services/teacherService');

const router = express.Router();

router.get('/dashboard', authorizeRole('teacher'), (req, res) => {
  const dashboard = getTeacherDashboard();
  return res.json(dashboard);
});

router.get('/classes', authorizeRole('teacher'), (req, res) => {
  const classes = getTeacherClasses();
  return res.json(classes);
});

module.exports = router;
