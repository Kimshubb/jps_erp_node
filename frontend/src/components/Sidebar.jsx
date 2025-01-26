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
  ViewList as ViewListIcon,
  Add as AddIcon,
  BarChart as ReportsIcon,
  Tune as ConfigureIcon,
  Brightness4 as ThemeIcon,
  People as PeopleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Sidebar({ schoolName, isMiniVariant, onMiniVariantToggle }) {
  const [open, setOpen] = useState({
    students: false,
    fees: false,
    settings: false,
    teachers: false
  });
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isExtraLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  const handleClick = (section) => {
    if (isMiniVariant) {
      // In mini variant, navigate to the first child route (if available)
      const menuItem = menuItems.find((item) => item.label.toLowerCase() === section);
      if (menuItem?.children?.[0]?.path) {
        navigate(menuItem.children[0].path);
      }
    } else {
      // In expanded state, toggle the collapsible section
      setOpen((prev) => ({ ...prev, [section]: !prev[section] }));
    }
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
        color: 'inherit',
        minHeight: isMiniVariant && !isChild ? '48px' : 'auto',
        justifyContent: isMiniVariant ? 'center' : 'flex-start',
        px: isMiniVariant ? 1 : 2,
      },
    };

    if (item.children) {
      return (
        <React.Fragment key={index}>
          <Tooltip title={isMiniVariant ? item.label : ''} placement="right">
            <ListItem 
              button 
              {...itemProps}
              onClick={() => handleClick(item.label.toLowerCase())}
            >
              <ListItemIcon sx={{ 
                color: 'inherit',
                minWidth: isMiniVariant ? 'auto' : 40,
                mr: isMiniVariant ? 0 : 2 
              }}>
                {item.icon}
              </ListItemIcon>
              {!isMiniVariant && (
                <>
                  <ListItemText primary={item.label} />
                  {open[item.label.toLowerCase()] ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </ListItem>
          </Tooltip>
          {!isMiniVariant && (
            <Collapse in={open[item.label.toLowerCase()]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.children.map((child, idx) => renderMenuItem(child, idx, true))}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    }

    return (
      <Tooltip title={isMiniVariant ? item.label : ''} placement="right" key={index}>
        <ListItem
          button
          component={Link}
          to={item.path}
          {...itemProps}
        >
          <ListItemIcon sx={{ 
            color: 'inherit',
            minWidth: isMiniVariant ? 'auto' : 40,
            mr: isMiniVariant ? 0 : 2 
          }}>
            {item.icon}
          </ListItemIcon>
          {!isMiniVariant && <ListItemText primary={item.label} />}
        </ListItem>
      </Tooltip>
    );
  };

  return (
    <Box
      className="sidebar-container"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        ...(isExtraLargeScreen ? {
          pt: 2, // Add top padding for extra large screens
        } : {})
      }}
    >
      {/* Header */}
      {!isMiniVariant && (
        <>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            ...(isExtraLargeScreen ? {
              px: 3, // Slightly more horizontal padding on extra large screens
            } : {})
          }}>
            <Typography variant="h6" noWrap component="div">
              {schoolName || 'School Name'}
            </Typography>
            <IconButton onClick={onMiniVariantToggle} size="small">
              <ThemeIcon />
            </IconButton>
          </Box>
          <Divider />
        </>
      )}

      {/* Collapse Toggle Button */}
      <IconButton
        onClick={onMiniVariantToggle}
        sx={{
          position: 'absolute',
          right: -15,
          top: isExtraLargeScreen ? 30 : 20,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            bgcolor: 'background.paper',
          },
          zIndex: 1,
          ...(isExtraLargeScreen ? {
            right: -20, // Slightly adjusted for extra large screens
          } : {})
        }}
        size="small"
      >
        {isMiniVariant ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </IconButton>

      {/* Menu Items */}
      <Box sx={{ flexGrow: 1, overflow: 'auto',
        ...(isExtraLargeScreen ? {
          px: isMiniVariant ? 1 : 2, // Adjust horizontal padding
        } : {})
      }}
      >
        <List 
          sx={{
            ...(isExtraLargeScreen ? {
              py: 1, // Slightly reduce vertical padding
            } : {})
          }}
        >
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </List>
      </Box>

      {/* Footer */}
      {!isMiniVariant && (
        <>
          <Divider />
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              © 2024 School Management System
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}

export default Sidebar;