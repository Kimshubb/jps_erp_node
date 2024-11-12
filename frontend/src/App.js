import React from 'react';
import AppTheme from './shared-theme/AppTheme';
import Dashboard from './pages/Dashboard';
import AppNavbar from './components/AppNavbar';
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  return (
    <div className="App">
      <AppTheme>
        <CssBaseline enableColorScheme/>
          <AppNavbar />
          <Dashboard  />
      </AppTheme>
    </div>
  );
}

export default App;
