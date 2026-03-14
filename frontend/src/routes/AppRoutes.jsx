import { Navigate, Route, Routes } from 'react-router-dom';

import RoleProtectedRoute from '../components/RoleProtectedRoute.jsx';
import CartPage from '../pages/CartPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import MenuPage from '../pages/MenuPage.jsx';
import OwnerDashboardPage from '../pages/OwnerDashboardPage.jsx';
import RegisterOwnerPage from '../pages/RegisterOwnerPage.jsx';
import StaffDashboardPage from '../pages/StaffDashboardPage.jsx';
import SuperAdminDashboardPage from '../pages/SuperAdminDashboardPage.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register-owner" element={<RegisterOwnerPage />} />

      <Route path="/:slug/menu" element={<MenuPage />} />
      <Route path="/:slug/table/:tableNumber" element={<MenuPage />} />
      <Route path="/:slug/cart" element={<CartPage />} />
      <Route path="/:slug/table/:tableNumber/cart" element={<CartPage />} />

      <Route
        path="/:slug/staff"
        element={
          <RoleProtectedRoute allowRoles={['staff', 'kitchen']}>
            <StaffDashboardPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/:slug/owner"
        element={
          <RoleProtectedRoute allowRoles={['tenant_owner']}>
            <OwnerDashboardPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/admin/super"
        element={
          <RoleProtectedRoute allowRoles={['super_admin']}>
            <SuperAdminDashboardPage />
          </RoleProtectedRoute>
        }
      />

      <Route path="/owner/setup" element={<Navigate to="/auth/login" replace />} />
      <Route path="/staff/setup" element={<Navigate to="/auth/login" replace />} />
      <Route path="*" element={<Navigate to="/milk-tea-house/menu" replace />} />
    </Routes>
  );
}

export default AppRoutes;
