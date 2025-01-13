import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Stack, 
  IconButton, 
  useTheme, 
  useMediaQuery,
  Box,
  Avatar,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Button
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const SIDEBAR_WIDTH = {
  expanded: 300,
  collapsed: 64
};

// Mock notifications - replace with your actual notifications data
const mockNotifications = [
  {
    id: 1,
    type: 'payment',
    title: 'New Payment Received',
    message: 'John Doe has made a payment of $500',
    time: '5 minutes ago',
    read: false,
    icon: <PaymentIcon color="primary" />
  },
  {
    id: 2,
    type: 'student',
    title: 'New Student Registration',
    message: 'Jane Smith has registered for Grade 10',
    time: '1 hour ago',
    read: false,
    icon: <PersonIcon color="secondary" />
  },
  {
    id: 3,
    type: 'assignment',
    title: 'Assignment Due',
    message: 'Math Assignment due for Grade 8',
    time: '2 hours ago',
    read: true,
    icon: <AssignmentIcon color="warning" />
  },
  {
    id: 4,
    type: 'system',
    title: 'System Update',
    message: 'New features have been added',
    time: '1 day ago',
    read: true,
    icon: <SettingsIcon color="info" />
  }
];

const Topbar = ({ 
  user, 
  currentTerm, 
  isCollapsed, 
  onMenuClick,
  showMenuIcon,
  sidebarWidth
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState(mockNotifications);
  
  const unreadCount = notifications.filter(notif => !notif.read).length;
  const open = Boolean(anchorEl);

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const NotificationItem = ({ notification }) => (
    <ListItem 
      alignItems="flex-start"
      sx={{ 
        bgcolor: notification.read ? 'transparent' : 'action.hover',
        '&:hover': {
          bgcolor: 'action.selected',
        },
      }}
      onClick={() => handleMarkAsRead(notification.id)}
    >
      <ListItemAvatar>
        {notification.icon}
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography variant="subtitle2" component="div">
            {notification.title}
          </Typography>
        }
        secondary={
          <React.Fragment>
            <Typography
              variant="body2"
              color="text.primary"
              component="span"
            >
              {notification.message}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              component="div"
              sx={{ mt: 0.5 }}
            >
              {notification.time}
            </Typography>
          </React.Fragment>
        }
      />
    </ListItem>
  );
  return (
    <AppBar 
        position="fixed" 
        color="inherit"
        elevation={1}
        sx={{ 
            width: {
                xs: '100%',
                md: `calc(100% - ${isCollapsed ? sidebarWidth.collapsed : sidebarWidth.expanded}px)`
            },
            ml: {
                xs: 0,
                md: isCollapsed ? `${sidebarWidth.collapsed}px` : `${sidebarWidth.expanded}px`
            },
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            bgcolor: 'background.paper',
            zIndex: theme.zIndex.drawer + 1,
        }}
    >
      <Toolbar sx={{ 
        justifyContent: 'space-between',
        minHeight: { xs: 64, sm: 70 },
        px: { xs: 2, sm: 3 }
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          {showMenuIcon && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onMenuClick}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          {/* Notifications Badge */}
          <IconButton
            color="inherit"
            onClick={handleNotificationClick}
            sx={{ ml: { xs: 0, md: 1 } }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Typography 
            variant="h6" 
            sx={{ 
              display: { xs: 'none', sm: 'block' },
              fontWeight: 500
            }}
          >
            Welcome, {user?.username}!
          </Typography>
        </Stack>

        <Stack 
          direction="row" 
          spacing={2} 
          alignItems="center"
        >
          <Stack 
            spacing={0.5} 
            sx={{ 
              textAlign: 'right',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            <Typography 
              variant="subtitle2" 
              sx={{ fontWeight: 500 }}
            >
              {user?.username} ({user?.role})
            </Typography>
            {currentTerm && (
              <Typography 
                variant="caption" 
                sx={{ 
                  opacity: 0.8,
                  color: 'text.secondary'
                }}
              >
                Current Term: {currentTerm.name}
              </Typography>
            )}
          </Stack>
          
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText
            }}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
        </Stack>

        {/* Notifications Panel */}
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          PaperProps={{
            sx: {
              width: 360,
              maxHeight: 480,
              overflow: 'auto'
            }
          }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Notifications</Typography>
            <Button 
              size="small" 
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
          </Box>
          <Divider />
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <NotificationItem notification={notification} />
                {index < notifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
            {notifications.length === 0 && (
              <ListItem>
                <ListItemText 
                  primary="No notifications"
                  sx={{ textAlign: 'center', color: 'text.secondary' }}
                />
              </ListItem>
            )}
          </List>
        </Popover>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;