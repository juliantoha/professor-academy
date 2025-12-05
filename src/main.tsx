import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.tsx'
import ReviewWrapper from './pages/ReviewWrapper.tsx'
import DashboardWrapper from './pages/DashboardWrapper.tsx'
import AdminPage from './pages/AdminPage.tsx'
import OrientationWrapper from './pages/OrientationWrapper.tsx'
import TrainingWrapper from './pages/TrainingWrapper.tsx'

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
  {
    path: '/training',
    element: <TrainingWrapper />
  },
  // 🆕 ADD THESE MODULE ROUTES
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
  {
    path: '/review/:submissionId',
    element: <ReviewWrapper />
  },
  {
    path: '/dashboard/:dashboardToken',
    element: <DashboardWrapper />
  },
  {
    path: '/admin',
    element: <AdminPage />
  },
  {
    path: '/orientation',
    element: <OrientationWrapper />
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)