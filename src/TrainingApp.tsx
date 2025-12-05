import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Module1ComputerEssentials from './components/modules/Module1';
import Module2ZoomConfiguration from './components/modules/Module2';
import Module3SystemNavigation from './components/modules/Module3';
import Module4Documentation from './components/modules/Module4';
import Dashboard from './pages/Dashboard';

const TrainingApp = () => {
  return (
    <Router>
      <Routes>
        {/* Dashboard Route */}
        <Route path="/" element={<Dashboard dashboardToken="your-token-here" />} />
        
        {/* Module Routes - THESE MUST BE HERE */}
        <Route path="/module1" element={<Module1ComputerEssentials />} />
        <Route path="/module2" element={<Module2ZoomConfiguration />} />
        <Route path="/module3" element={<Module3SystemNavigation />} />
        <Route path="/module4" element={<Module4Documentation />} />
        
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default TrainingApp;