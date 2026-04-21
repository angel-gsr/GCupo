import { createBrowserRouter } from "react-router";
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { FAQPage } from './components/FAQPage';
import { UserSettings } from './components/UserSettings';
import { ProtectedRoute } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/faq",
    element: (
      <ProtectedRoute>
        <FAQPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <UserSettings />
      </ProtectedRoute>
    ),
  },
]);