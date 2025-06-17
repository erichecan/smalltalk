import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BottomNavigationAction, BottomNavigation, Paper } from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import ChatIcon from '@mui/icons-material/Chat';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';


const navs = [
  { path: '/topics', label: 'Topics', icon: <ExploreIcon /> },
  { path: '/dialogue', label: 'Dialogue', icon: <ChatIcon /> }, // Assuming /dialogue is primary practice
  { path: '/history', label: 'History', icon: <HistoryIcon /> },
  { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
  { path: '/profile', label: 'Profile', icon: <AccountCircleIcon /> },
];

const BottomNav: React.FC = () => {
  const location = useLocation();
  // Find the value for BottomNavigation based on the current path
  // It should correspond to one of the nav paths or be undefined if no match
  const currentValue = navs.find(nav => location.pathname.startsWith(nav.path))?.path;

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
      <BottomNavigation
        value={currentValue} // Set current active tab
        showLabels // Always show labels
        sx={{ backgroundColor: '#f0f0f0' }} // Similar background as original
      >
        {navs.map(nav => (
          <BottomNavigationAction
            key={nav.path}
            label={nav.label}
            value={nav.path} // Value used by parent BottomNavigation to determine active state
            icon={nav.icon}
            component={Link}
            to={nav.path}
            sx={{
              color: location.pathname.startsWith(nav.path) ? '#0ecd6a' : 'rgba(0, 0, 0, 0.6)', // Active vs Inactive
              '&.Mui-selected': { // Style for selected (active) item
                color: '#0ecd6a',
              },
              paddingTop: '8px', // Adjust padding if needed
              paddingBottom: '8px',
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
