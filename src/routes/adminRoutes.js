const express = require('express');
const authorizeRole = require('../middleware/authorizeRole');
const { getAdminDashboard, getSystemReport } = require('../services/adminService');

const router = express.Router();

router.get('/dashboard', authorizeRole('admin'), (req, res) => {
  const dashboard = getAdminDashboard();
  return res.json(dashboard);
});

router.get('/reports', authorizeRole('admin'), (req, res) => {
  const report = getSystemReport();
  return res.json(report);
});

module.exports = router;
