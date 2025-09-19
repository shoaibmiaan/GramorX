function normalizeRoles(inputRoles) {
  if (!Array.isArray(inputRoles)) {
    return [inputRoles];
  }
  return inputRoles;
}

function authorizeRole(requiredRoles) {
  const rolesToAllow = normalizeRoles(requiredRoles).map((role) =>
    typeof role === 'string' ? role.toLowerCase() : role
  );

  return (req, res, next) => {
    const headerRole = req.headers['x-user-role'];

    if (!headerRole) {
      return res.status(401).json({
        error: 'Missing role information',
      });
    }

    const normalizedHeaderRole = headerRole.toLowerCase();

    if (!rolesToAllow.includes(normalizedHeaderRole)) {
      return res.status(403).json({
        error: 'Access forbidden: insufficient permissions',
      });
    }

    req.userRole = normalizedHeaderRole;
    return next();
  };
}

module.exports = authorizeRole;
