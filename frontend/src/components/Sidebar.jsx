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
  useTheme
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
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

function Sidebar({ schoolName, onToggleTheme }) {
  const [open, setOpen] = useState({
    students: false,
    fees: false,
    settings: false,
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleClick = (section) => {
    setOpen((prev) => ({ ...prev, [section]: !prev[section] }));
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
    const itemProps = {
      sx: {
        ...(!isChild && {
          borderRadius: 1,
          margin: '4px 1px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        }),
        ...(isActive && {
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
          fontWeight: 'bold',
        }),
        color: 'theme.palette.primary.main',
        transition: 'all 0.3s ease',
        minHeight: isCollapsed && !isChild ? '48px' : 'auto',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        px: isCollapsed ? 1 : 2,
      },
      onClick: () => {
        if (isMobile) setIsMobileSidebarOpen(false);
        if (item.children && !isCollapsed) handleClick(item.label.toLowerCase());
      }
    };

    if (item.children) {
      return (
        <React.Fragment key={index}>
          <Tooltip title={isCollapsed ? item.label : ''} placement="right">
            <ListItem 
              button 
              {...itemProps}
              onClick={() => !isCollapsed && handleClick(item.label.toLowerCase())}
            >
              <ListItemIcon sx={{ 
                color: 'text.primary',
                minWidth: isCollapsed ? 'auto' : 40,
                mr: isCollapsed ? 0 : 2 
              }}>
                {item.icon}
              </ListItemIcon>
              {!isCollapsed && (
                <>
                  <ListItemText primary={item.label} />
                  {open[item.label.toLowerCase()] ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </ListItem>
          </Tooltip>
          {!isCollapsed && (
            <Collapse 
              in={open[item.label.toLowerCase()]} 
              timeout="auto" 
              unmountOnExit
            >
              <List component="div" disablePadding>
                {item.children.map((child, idx) => renderMenuItem(child, idx, true))}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    }

    return (
      <Tooltip title={isCollapsed ? item.label : ''} placement="right" key={index}>
        <ListItem
          button
          component={Link}
          to={item.path}
          {...itemProps}
        >
          <ListItemIcon sx={{ 
            color: 'text.primary',
            minWidth: isCollapsed ? 'auto' : 40,
            mr: isCollapsed ? 0 : 2 
          }}>
            {item.icon}
          </ListItemIcon>
          {!isCollapsed && <ListItemText primary={item.label} />}
        </ListItem>
      </Tooltip>
    );
  };

  const sidebarContent = (
    <Box
      sx={{
        width: isCollapsed ? 64 : 250,
        bgcolor: 'theme.palette.primary.main',
        boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.1)',
        color: 'theme.palette.primary.contrastText',
        height: '100vh',
        paddingTop: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.3s ease',
        position: 'relative',
      }}
    >
      {/* School Name and Theme Toggle */}
      {!isCollapsed && (
        <>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              paddingX: 2,
            }}
          >
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 'bold', 
                flexGrow: 1, 
                textAlign: 'center',
                color: 'primary.main'
              }}
            >
              {schoolName || 'School Name'}
            </Typography>
            <Tooltip title="Toggle Theme">
              <IconButton 
                color="primary" 
                onClick={onToggleTheme}
                size="small"
              >
                <ThemeIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Divider sx={{ my: 2, bgcolor: theme.palette.primary.contrastText}} />
        </>
      )}

      {/* Collapse Toggle Button */}
      {!isMobile && (
        <IconButton
          onClick={() => setIsCollapsed(!isCollapsed)}
          sx={{
            position: 'absolute',
            right: -15,
            top: 20,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              bgcolor: 'background.paper',
            },
            zIndex: 1,
          }}
          size="small"
        >
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      )}

      {/* Menu Items */}
      <List component="nav" sx={{ flexGrow: 1, overflow: 'auto' }}>
        {menuItems.map((item, index) => renderMenuItem(item, index))}
      </List>

      {/* Footer */}
      {!isCollapsed && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
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
          sx={{ position: 'fixed', top: 10, left: 10, zIndex: 1000 }}
        >
          <MenuIcon />
        </IconButton>
        {isMobileSidebarOpen && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgcolor: 'rgba(0,0,0,0.5)',
              zIndex: 999,
            }}
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <Box
              sx={{
                width: 250,
                height: '100%',
                bgcolor: 'background.paper',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <IconButton
                color="primary"
                aria-label="close sidebar"
                onClick={() => setIsMobileSidebarOpen(false)}
                sx={{ position: 'absolute', top: 10, right: 10 }}
              >
                <CloseIcon />
              </IconButton>
              {sidebarContent}
            </Box>
          </Box>
        )}
      </>
    );
  }

  return sidebarContent;
}

export default Sidebar;