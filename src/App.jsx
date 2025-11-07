
import { Provider } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { store } from './redux/store';
import './App.css';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import Login from './pages/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';
import AuthInitializer from './components/auth/AuthInitializer';
import LeadsPage from './components/dashboard/LeadsDashboard';
import LeadFormPage from './pages/leads/LeadFormPage';
import LeadDetails from './components/dashboard/leads/LeadDetails';
import BranchesPage from './pages/branches/BranchesPage';
import BranchFormPage from './pages/branches/BranchFormPage';
import BranchDetailsPage from './pages/branches/BranchDetailsPage';
import UsersPage from './pages/users/UsersPage';
import UserFormPage from './pages/users/UserFormPage';
import UserDetailsPage from './pages/users/UserDetailsPage';
import ProductsPage from './pages/products/ProductsPage';
import ProductFormPage from './pages/products/ProductFormPage';
import ProductDetailsPage from './pages/products/ProductDetailsPage';
import HealthPage from './pages/health/HealthPage';
import HealthFormPage from './pages/health/HealthFormPage';
import HealthDetailsPage from './pages/health/HealthDetailsPage';
import InventoryPage from './components/dashboard/InventoryDashboard';
import InventoryFormPage from './pages/inventory/InventoryFormPage';
import InventoryDetailsPage from './pages/inventory/InventoryDetailsPage';
import SentGoodsPage from './pages/inventory/SentGoodsPage';
import ReceivedGoodsPageSimple from './pages/inventory/ReceivedGoodsPageSimple';
import ProductionPage from './pages/production/ProductionPage';
import ProductionFormPage from './pages/production/ProductionFormPage';
import ProductionDetailsPage from './pages/production/ProductionDetailsPage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderFormPage from './pages/orders/OrderFormPage';
import OrderDetailsPage from './pages/orders/OrderDetailsPage';
import AccountsPage from './pages/accounts/AccountsPage';
import AccountFormPage from './pages/accounts/AccountFormPage';
import PayrollPage from './pages/payroll/PayrollPage';
import PayrollFormPage from './pages/payroll/PayrollFormPage';
import SupervisorAttendancePage from './pages/attendance/SupervisorAttendancePage';
import ProfilePage from './pages/auth/ProfilePage';

function App() {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<div>Register Page</div>} />
          
          
          {/* Protected Layout routes */}
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/leads/table" element={<LeadsPage />} />
            <Route path="/leads/pipeline" element={<LeadsPage />} />
            <Route path="/leads/performance" element={<LeadsPage />} />
            <Route path="/leads/create" element={<LeadFormPage />} />
            <Route path="/leads/edit/:id" element={<LeadFormPage />} />
            <Route path="/leads/view/:id" element={<LeadDetails />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/create" element={<ProductFormPage />} />
            <Route path="/products/edit/:id" element={<ProductFormPage />} />
            <Route path="/products/view/:id" element={<ProductDetailsPage />} />
            {/* Production routes */}
            <Route path="/production" element={<Navigate to="/productions" replace />} />
            <Route path="/productions" element={<ProductionPage />} />
            <Route path="/productions/create" element={<ProductionFormPage />} />
            <Route path="/productions/edit/:id" element={<ProductionFormPage />} />
            <Route path="/productions/view/:id" element={<ProductionDetailsPage />} />
            <Route path="/branches" element={<BranchesPage />} />
            <Route path="/branches/table" element={<BranchesPage />} />
            <Route path="/branches/map" element={<BranchesPage />} />
            <Route path="/branches/create" element={<BranchFormPage />} />
            <Route path="/branches/edit/:id" element={<BranchFormPage />} />
            <Route path="/branches/view/:id" element={<BranchDetailsPage />} />
            <Route path="/health-issues" element={<HealthPage />} />
            <Route path="/health-issues/create" element={<HealthFormPage />} />
            <Route path="/health-issues/edit/:id" element={<HealthFormPage />} />
            <Route path="/health-issues/view/:id" element={<HealthDetailsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/user-management" element={<UsersPage />} />
            <Route path="/users/create" element={<UserFormPage />} />
            <Route path="/users/edit/:id" element={<UserFormPage />} />
            <Route path="/users/view/:id" element={<UserDetailsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/inventory/table" element={<InventoryPage />} />
            <Route path="/inventory/create" element={<InventoryFormPage />} />
            <Route path="/inventory/edit/:id" element={<InventoryFormPage />} />
            <Route path="/inventory/view/:id" element={<InventoryDetailsPage />} />
            <Route path="/inventory/sent-goods" element={<SentGoodsPage />} />
            <Route path="/inventory/received-goods" element={<ReceivedGoodsPageSimple />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/new" element={<OrderFormPage />} />
            <Route path="/orders/edit/:id" element={<OrderFormPage />} />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />
            <Route path="/accounts" element={
              <RoleProtectedRoute allowedRoles={['super_admin', 'admin', 'accounts_manager']}>
                <AccountsPage />
              </RoleProtectedRoute>
            } />
            <Route path="/accounts/new" element={
              <RoleProtectedRoute allowedRoles={['super_admin', 'admin', 'accounts_manager']}>
                <AccountFormPage />
              </RoleProtectedRoute>
            } />
            <Route path="/accounts/edit/:id" element={
              <RoleProtectedRoute allowedRoles={['super_admin', 'admin', 'accounts_manager']}>
                <AccountFormPage />
              </RoleProtectedRoute>
            } />
            <Route path="/payrolls" element={<PayrollPage />} />
            <Route path="/payrolls/new" element={<PayrollFormPage />} />
            <Route path="/payrolls/edit/:id" element={<PayrollFormPage />} />
            <Route path="/attendance" element={<SupervisorAttendancePage />} />
            {/* <Route path="/settings" element={<div>Settings Page</div>} /> */}
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </AuthInitializer>
    </Provider>
  );
}

export default App;
