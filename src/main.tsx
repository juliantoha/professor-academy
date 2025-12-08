import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.tsx'
import ReviewWrapper from './pages/ReviewWrapper.tsx'
import DashboardWrapper from './pages/DashboardWrapper.tsx'
import AdminPage from './pages/AdminPage.tsx'
import OrientationWrapper from './pages/OrientationWrapper.tsx'
import TrainingWrapper from './pages/TrainingWrapper.tsx'

// Auth pages
import LoginPage from './pages/LoginPage.tsx'
import SignupPage from './pages/SignupPage.tsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.tsx'
import ResetPasswordPage from './pages/ResetPasswordPage.tsx'
import ProfessorDashboard from './pages/ProfessorDashboard.tsx'
import SettingsPage from './pages/SettingsPage.tsx'

// Auth components
import { AuthProvider } from './contexts/AuthContext.tsx'
import { ProtectedRoute } from './components/ProtectedRoute.tsx'

// Import the modules
import Module1ComputerEssentials from './components/modules/Module1.tsx'
import Module2ZoomConfiguration from './components/modules/Module2.tsx'
import Module3SystemNavigation from './components/modules/Module3.tsx'
import Module4Documentation from './components/modules/Module4.tsx'

import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  // Auth routes (public)
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/signup',
    element: <SignupPage />
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />
  },
  // Professor dashboard (protected)
  {
    path: '/professor',
    element: (
      <ProtectedRoute requiredRole="professor">
        <ProfessorDashboard />
      </ProtectedRoute>
    )
  },
  // Settings page (protected)
  {
    path: '/settings',
    element: (
      <ProtectedRoute requiredRole="professor">
        <SettingsPage />
      </ProtectedRoute>
    )
  },
  // Admin page (protected - admin only)
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminPage />
      </ProtectedRoute>
    )
  },
  // Training and module routes (public - accessed via token URLs)
  {
    path: '/training',
    element: <TrainingWrapper />
  },
  {
    path: '/module1',
    element: <Module1ComputerEssentials />
  },
  {
    path: '/module2',
    element: <Module2ZoomConfiguration />
  },
  {
    path: '/module3',
    element: <Module3SystemNavigation />
  },
  {
    path: '/module4',
    element: <Module4Documentation />
  },
  // Review and dashboard routes (public - accessed via email links)
  {
    path: '/review/:submissionId',
    element: <ReviewWrapper />
  },
  {
    path: '/dashboard/:dashboardToken',
    element: <DashboardWrapper />
  },
  {
    path: '/orientation',
    element: <OrientationWrapper />
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)
