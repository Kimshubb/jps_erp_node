// Desc: Sidebar component for the dashboard
//src/components/Sidebar.js
import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as StudentsIcon,
  Payment as PaymentsIcon,
  Settings as SettingsIcon,
  /*People as StaffIcon,
  Schedule as ScheduleIcon,*/
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

function Sidebar({schoolName}) {
  const [open, setOpen] = React.useState({ students: false, fees: false, staff: false, schedules: false, settings: false });

  const handleClick = (section) => {
    setOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <Box sx={{ width: 250, bgcolor: 'primary.main', color: 'white', minHeight: '100vh', paddingTop: 2 }}>
      <Box sx={{ textAlign: 'center', paddingBottom: 2 }}>
        <h3>{schoolName|| 'School name'}</h3>
      </Box>
      <List component="nav">
        <ListItem button component={Link} to="/dashboard">
          <ListItemIcon><DashboardIcon sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>

        {/* Students Section */}
        <ListItem button onClick={() => handleClick('students')}>
          <ListItemIcon><StudentsIcon sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Students" />
          {open.students ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={open.students} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button component={Link} to="/students/view" sx={{ pl: 4 }}>
              <ListItemText primary="View Students" />
            </ListItem>
            <ListItem button component={Link} to="/students/add" sx={{ pl: 4 }}>
              <ListItemText primary="Add Student" />
            </ListItem>
          </List>
        </Collapse>

        {/* Fees Section */}
        <ListItem button onClick={() => handleClick('fees')}>
          <ListItemIcon><PaymentsIcon sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Fees" />
          {open.fees ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={open.fees} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button component={Link} to="/payments/view" sx={{ pl: 4 }}>
              <ListItemText primary="View Payments" />
            </ListItem>
            <ListItem button component={Link} to="/payments/new" sx={{ pl: 4 }}>
              <ListItemText primary="New Payment" />
            </ListItem>
            <ListItem button component={Link} to="/payments/reports" sx={{ pl: 4 }}>
              <ListItemText primary="Fees Reports" />
            </ListItem>
          </List>
        </Collapse>

        {/* Settings Section */}
        <ListItem button onClick={() => handleClick('settings')}>
          <ListItemIcon><SettingsIcon sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Settings" />
          {open.settings ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={open.settings} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button component={Link} to="/settings/terms" sx={{ pl: 4 }}>
              <ListItemText primary="Manage Terms" />
            </ListItem>
          </List>
        </Collapse>

        {/* Logout */}
        <ListItem button component={Link} to="/logout">
          <ListItemIcon><LogoutIcon sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Sign Out" />
        </ListItem>
      </List>
    </Box>
  );
}

export default Sidebar;