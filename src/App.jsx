
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
import UsersPage from './pages/users/UsersPage';
import ProductsPage from './pages/products/ProductsPage';
import HealthPage from './pages/health/HealthPage';
import InventoryPage from './components/dashboard/InventoryDashboard';
import ProductionPage from './pages/production/ProductionPage';
import AddProduction from './components/dashboard/production/AddProduction';
import ViewProduction from './components/dashboard/production/ViewProduction';
import EditProduction from './components/dashboard/production/EditProduction';

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
            <Route path="/production" element={<ProductionPage />} />
            <Route path="/production/add" element={<AddProduction />} />
            <Route path="/production/view/:id" element={<ViewProduction />} />
            <Route path="/production/edit/:id" element={<EditProduction />} />
            <Route path="/branches" element={<BranchesPage />} />
            <Route path="/branches/table" element={<BranchesPage />} />
            <Route path="/branches/map" element={<BranchesPage />} />
            <Route path="/health-issues" element={<HealthPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/user-management" element={<UsersPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/inventory/table" element={<InventoryPage />} />
            <Route path="/settings" element={<div>Settings Page</div>} />
            <Route path="/profile" element={<div>Profile Page</div>} />
          </Route>
        </Routes>
      </AuthInitializer>
    </Provider>
  );
}

export default App;
