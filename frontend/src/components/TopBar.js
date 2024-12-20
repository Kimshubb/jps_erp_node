import React from 'react';
import { AppBar, Toolbar, Typography, Stack } from '@mui/material';

const Topbar = ({ user, currentTerm }) => {
  return (
    <AppBar position="fixed" sx={{ width: `calc(100% - 250px)`, ml: '250px' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6">
          Welcome, {user?.username}!
        </Typography>

        <Stack spacing={0.5} sx={{ textAlign: 'right' }}>
          <Typography variant="subtitle1">
            {user?.username} ({user?.role})
          </Typography>
          {currentTerm && (
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Current Term: {currentTerm.name}
            </Typography>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;