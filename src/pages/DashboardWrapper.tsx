import { useParams } from 'react-router-dom';
import Dashboard from './Dashboard';

const DashboardWrapper = () => {
  const { dashboardToken } = useParams<{ dashboardToken: string }>();
  
  if (!dashboardToken) {
    return (
      <div style={{ 
        padding: '3rem', 
        textAlign: 'center',
        fontFamily: 'Lato, sans-serif'
      }}>
        <h1 style={{ color: '#DC2626' }}>Invalid Dashboard Token</h1>
        <p style={{ color: '#6B7280' }}>Please check the URL and try again.</p>
      </div>
    );
  }
  
  return <Dashboard dashboardToken={dashboardToken} />;
};

export default DashboardWrapper;