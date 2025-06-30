import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navs = [
  { path: '/dialogue', label: 'Dialogue' },
  { path: '/practice', label: 'Practice' },
  { path: '/vocabulary', label: 'Vocabulary' },
  { path: '/my', label: 'My' },
];

const BottomNav: React.FC = () => {
  const location = useLocation();
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '12px 0',
      background: '#f0f0f0',
      borderTop: '1px solid #ddd',
      zIndex: 1000
    }}>
      {navs.map(nav => (
        <Link
          key={nav.path}
          to={nav.path}
          style={{
            color: location.pathname === nav.path ? '#0ecd6a' : '#222',
            fontWeight: location.pathname === nav.path ? 700 : 400,
            textDecoration: 'none',
            fontSize: 16
          }}
        >
          {nav.label}
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav; 