import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as StudentsIcon,
  Payment as PaymentsIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
  ChevronLeft as CollapseIcon,
  ChevronRight as ExpandIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ schoolName, onToggleTheme, onCollapseChange }) {
  const [open, setOpen] = useState({
    students: false,
    fees: false,
    settings: false,
  });
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (section) => {
    setOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const menuItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    {
      label: 'Students',
      icon: <StudentsIcon />,
      children: [
        { label: 'View Students', icon: <StudentsIcon />, path: '/students' },
        { label: 'Add Student', icon: <StudentsIcon />, path: '/students/add' },
      ],
    },
    {
      label: 'Fees',
      icon: <PaymentsIcon />,
      children: [
        { label: 'View Payments', icon: <PaymentsIcon />, path: '/payments/view' },
        { label: 'New Payment', icon: <PaymentsIcon />, path: '/payments/new' },
      ],
    },
    { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { label: 'Sign Out', icon: <LogoutIcon />, path: '/logout' },
  ];

  const renderMenuItem = (item, index, isChild = false) => {
    const isActive = location.pathname === item.path;
    const itemClass = `sidebar-item ${isActive ? 'active' : ''} ${
      isChild ? 'child-item' : ''
    } ${collapsed ? 'collapsed' : ''}`;

    if (item.children) {
      return (
        <React.Fragment key={index}>
          <ListItem
            button
            className={itemClass}
            onClick={() => handleClick(item.label.toLowerCase())}
          >
            <ListItemIcon className="sidebar-icon">{item.icon}</ListItemIcon>
            {!collapsed && <ListItemText primary={item.label} />}
            {!collapsed && (open[item.label.toLowerCase()] ? <ExpandLess /> : <ExpandMore />)}
          </ListItem>
          <Collapse
            in={!collapsed && open[item.label.toLowerCase()]}
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              {item.children.map((child, idx) => renderMenuItem(child, idx, true))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    return (
      <ListItem
        button
        className={itemClass}
        key={index}
        onClick={() => handleNavigation(item.path)}
      >
        <ListItemIcon className="sidebar-icon">{item.icon}</ListItemIcon>
        {!collapsed && <ListItemText primary={item.label} />}
      </ListItem>
    );
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    if (onCollapseChange) onCollapseChange(!collapsed);
  };

  return (
    <Box className={`sidebar-container ${collapsed ? 'collapsed' : ''}`}>
      <Box className="sidebar-header">
        {!collapsed && (
          <Typography variant="h6" className="school-name">
            {schoolName || 'School Name'}
          </Typography>
        )}
        <Tooltip title="Toggle Sidebar">
          <IconButton onClick={toggleSidebar}>
            {collapsed ? <ExpandIcon /> : <CollapseIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item, index) => renderMenuItem(item, index))}
      </List>
    </Box>
  );
}

export default Sidebar;
