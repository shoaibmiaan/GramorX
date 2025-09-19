function getAdminDashboard() {
  return {
    role: 'admin',
    message: 'Administrative dashboard overview',
    systemHealth: 'green',
  };
}

function getSystemReport() {
  return {
    role: 'admin',
    reportGeneratedAt: new Date().toISOString(),
    activeUsers: 142,
  };
}

module.exports = {
  getAdminDashboard,
  getSystemReport,
};
