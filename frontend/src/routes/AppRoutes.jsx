import { Navigate, Route, Routes } from 'react-router-dom';

import RoleProtectedRoute from '../components/RoleProtectedRoute.jsx';
import CartPage from '../pages/CartPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import MenuPage from '../pages/MenuPage.jsx';
import OwnerCategoriesPage from '../pages/OwnerCategoriesPage.jsx';
import OwnerDashboardPage from '../pages/OwnerDashboardPage.jsx';
import OwnerProductsPage from '../pages/OwnerProductsPage.jsx';
import OwnerStaffPage from '../pages/OwnerStaffPage.jsx';
import OwnerTablesPage from '../pages/OwnerTablesPage.jsx';
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
        path="/:slug/owner/categories"
        element={
          <RoleProtectedRoute allowRoles={['tenant_owner']}>
            <OwnerCategoriesPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/:slug/owner/products"
        element={
          <RoleProtectedRoute allowRoles={['tenant_owner']}>
            <OwnerProductsPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/:slug/owner/tables"
        element={
          <RoleProtectedRoute allowRoles={['tenant_owner']}>
            <OwnerTablesPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/:slug/owner/staff"
        element={
          <RoleProtectedRoute allowRoles={['tenant_owner']}>
            <OwnerStaffPage />
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
