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
  useMediaQuery,
  useTheme,
  Drawer
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as StudentsIcon,
  Payment as PaymentsIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  ViewList as ViewListIcon,
  Add as AddIcon,
  BarChart as ReportsIcon,
  Tune as ConfigureIcon,
  Brightness4 as ThemeIcon,
  People as PeopleIcon,
  ChevronLeft as CollapseIcon,
  ChevronRight as ExpandIcon,
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ schoolName, onToggleTheme }) {
  const [open, setOpen] = useState({
    students: false,
    fees: false,
    settings: false,
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // Collapsible state
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleClick = (section) => {
    setOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileSidebarOpen(false);
  };

  const menuItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    {
      label: 'Students',
      icon: <StudentsIcon />,
      children: [
        { label: 'View Students', icon: <ViewListIcon />, path: '/students' },
        { label: 'Add Student', icon: <AddIcon />, path: '/students/add' },
      ],
    },
    {
      label: 'Fees',
      icon: <PaymentsIcon />,
      children: [
        { label: 'View Payments', icon: <ViewListIcon />, path: '/payments/view' },
        { label: 'New Payment', icon: <AddIcon />, path: '/payments/new' },
        { label: 'Add Fee Lists', icon: <AddIcon />, path: '/payments/view-addfees' },
        { label: 'Fees Reports', icon: <ReportsIcon />, path: '/payments/reports' },
      ],
    },
    {
      label: 'Teachers',
      icon: <PeopleIcon />,
      children: [
        { label: 'Assign Subjects', icon: <ViewListIcon />, path: '/teachers/assign-subjects' },
        { label: 'Add Teacher', icon: <AddIcon />, path: '/teachers/add' },
      ],
    },
    {
      label: 'Settings',
      icon: <SettingsIcon />,
      children: [
        { label: 'Manage Grades', icon: <ConfigureIcon />, path: '/settings/configure-grades' },
        { label: 'Manage Terms', icon: <ConfigureIcon />, path: '/settings/terms' },
        { label: 'Manage Fee Structures', icon: <ConfigureIcon />, path: '/settings/fee-structures' },
        { label: 'Manage Users', icon: <ConfigureIcon />, path: '/settings/users' },
        { label: 'Additional Fees', icon: <ConfigureIcon />, path: '/settings/additional-fees' },
      ],
    },
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
            {!collapsed && <ListItemText primary={item.label} className="sidebar-text" />}
            {open[item.label.toLowerCase()] ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse
            in={!collapsed && open[item.label.toLowerCase()]}
            timeout="auto"
            unmountOnExit
            className="sidebar-collapse"
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
        {!collapsed && <ListItemText primary={item.label} className="sidebar-text" />}
      </ListItem>
    );
  };

  const sidebarContent = (
    <Box
      className={`sidebar-container ${collapsed ? 'sidebar-collapsed' : ''}`}
    >
      <Box className="sidebar-header">
        {!collapsed && (
          <Typography variant="h6" component="div" className="school-name">
            {schoolName || 'School Name'}
          </Typography>
        )}
        <Tooltip title="Toggle Sidebar">
          <IconButton
            color="primary"
            onClick={() => setCollapsed((prev) => !prev)}
            className="collapse-toggle"
          >
            {collapsed ? <ExpandIcon /> : <CollapseIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      <Divider className="sidebar-divider" />

      <List component="nav" className="sidebar-nav">
        {menuItems.map((item, index) => renderMenuItem(item, index))}
      </List>

      {!collapsed && (
        <Box className="sidebar-footer">
          <Typography variant="caption" className="footer-text">
            © 2024 School Management System
          </Typography>
        </Box>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <IconButton
          color="primary"
          aria-label="open sidebar"
          onClick={() => setIsMobileSidebarOpen(true)}
          className="mobile-menu-button"
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          anchor="left"
          open={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          classes={{
            paper: 'mobile-sidebar-content',
          }}
        >
          {sidebarContent}
        </Drawer>
      </>
    );
  }

  return sidebarContent;
}

export default Sidebar;
