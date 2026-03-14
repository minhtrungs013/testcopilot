function authorize(roles = []) {
  const allowedRoles = Array.isArray(roles) ? roles : [];

  return function roleGuard(req, res, next) {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        message: 'Unauthorized: authentication is required.',
      });
    }

    if (allowedRoles.length === 0) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Forbidden: insufficient role permissions.',
      });
    }

    return next();
  };
}

export default authorize;
