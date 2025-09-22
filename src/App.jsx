
import { Provider } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { store } from './redux/store';
import './App.css';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import Login from './pages/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
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
import ProductionPage from './pages/production/ProductionPage';
import AddProduction from './components/dashboard/production/AddProduction';
import ViewProduction from './components/dashboard/production/ViewProduction';
import EditProduction from './components/dashboard/production/EditProduction';
import ByProductAddPage from './pages/production/ByProductAddPage';

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
            <Route path="/production" element={<ProductionPage />} />
            <Route path="/production/add" element={<AddProduction />} />
            <Route path="/production/view/:id" element={<ViewProduction />} />
            <Route path="/production/edit/:id" element={<EditProduction />} />
            <Route path="/production/by-product/add" element={<ByProductAddPage />} />
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
            <Route path="/settings" element={<div>Settings Page</div>} />
            <Route path="/profile" element={<div>Profile Page</div>} />
          </Route>
        </Routes>
      </AuthInitializer>
    </Provider>
  );
}

export default App;
