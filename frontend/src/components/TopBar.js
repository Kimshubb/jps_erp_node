// src/components/Topbar.js
import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Topbar = ({ user }) => { // Destructure user from props
  return (
    <AppBar position="fixed" sx={{ width: `calc(100% - 250px)`, ml: '250px' }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Welcome, {user?.username}!
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
