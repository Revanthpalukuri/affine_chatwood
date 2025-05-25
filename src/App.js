import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TenantProvider } from './context/TenantContext';
import AppLayout from './components/AppLayout';
import AffineWorkspace from './components/AffineWorkspace';
import './App.css';

function App() {
  const navigate = useNavigate(); 
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/' && !location.search) {
      navigate('/?tenant=default', { replace: true });
    }
  }, [location, navigate]);

  return (
    <TenantProvider>
      <AppLayout>
        <AffineWorkspace />
      </AppLayout>
    </TenantProvider>
  );
}

export default App;
