import { Navigate, useLocation } from 'react-router-dom';

import useAuthStore from '../store/authStore.js';

function RoleProtectedRoute({ allowRoles, children }) {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  if (!token || !user) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowRoles.includes(user.role)) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}

export default RoleProtectedRoute;
