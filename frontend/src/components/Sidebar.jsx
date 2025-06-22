import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Tooltip,
  IconButton,
  useTheme,
  useMediaQuery
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
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const SIDEBAR_WIDTH = 280;
const SIDEBAR_MINI_WIDTH = 64;
const TOPBAR_HEIGHT = 70;

function Sidebar({ isMiniVariant, onMiniVariantToggle }) {
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
      const menuItem = menuItems.find((item) => item.label.toLowerCase() === section);
      if (menuItem?.children?.[0]?.path) {
        navigate(menuItem.children[0].path);
      }
    } else {
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
        { label: 'Fees Reports', icon: <ReportsIcon />, path: '/payments/fee-reports' },
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
        ...(isActive && {
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
          fontWeight: 'bold',
        }),
        borderRadius: 1,
        mx: 1,
        mb: 0.5,
        color: 'inherit',
        justifyContent: isMiniVariant ? 'center' : 'flex-start',
        px: isMiniVariant ? 1 : 2,
        minHeight: isMiniVariant ? 48 : 'auto',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      },
    };

    if (item.children) {
      return (
        <React.Fragment key={index}>
          <Tooltip title={isMiniVariant ? item.label : ''} placement="right">
            <ListItem button {...itemProps} onClick={() => handleClick(item.label.toLowerCase())}>
              <ListItemIcon
                sx={{
                  color: 'inherit',
                  minWidth: isMiniVariant ? 0 : 40,
                  mr: isMiniVariant ? 0 : 2,
                  justifyContent: 'center'
                }}
              >
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
        <ListItem button component={Link} to={item.path} {...itemProps}>
          <ListItemIcon
            sx={{
              color: 'inherit',
              minWidth: isMiniVariant ? 0 : 40,
              mr: isMiniVariant ? 0 : 2,
              justifyContent: 'center'
            }}
          >
            {item.icon}
          </ListItemIcon>
          {!isMiniVariant && <ListItemText primary={item.label} />}
        </ListItem>
      </Tooltip>
    );
  };

  return (
    <Box
      sx={{
        width: isMiniVariant ? SIDEBAR_MINI_WIDTH : SIDEBAR_WIDTH,
        height: '100vh',
        bgcolor: 'background.default',
        borderRight: '1px solid',
        borderColor: 'divider',
        overflowX: 'hidden',
        pt: `${TOPBAR_HEIGHT}px`,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.standard,
        }),
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: theme.zIndex.drawer - 1,
      }}
    >
      {/* Mini Variant Toggle Button */}
      <IconButton
        onClick={onMiniVariantToggle}
        sx={{
          position: 'absolute',
          bottom: 20,
          right: -15,
          zIndex: 10,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 2,
        }}
        size="small"
      >
        {isMiniVariant ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </IconButton>

      {/* Menu Items */}
      <List>{menuItems.map((item, index) => renderMenuItem(item, index))}</List>
    </Box>
  );
}

export default Sidebar;
