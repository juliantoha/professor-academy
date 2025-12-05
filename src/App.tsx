import { useState } from 'react';
import LandingPage from './pages/LandingPage';

type View = 'landing';

const App = () => {
  const [currentView] = useState<View>('landing');

  const handleNavigateToAdmin = () => {
    // Navigate to admin page using window.location
    window.location.href = '/admin';
  };

  if (currentView === 'landing') {
    return <LandingPage onNavigateToAdmin={handleNavigateToAdmin} />;
  }

  return null;
};

export default App;