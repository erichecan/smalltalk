import React from 'react';
import BottomNav from '../components/BottomNav';

const Profile: React.FC = () => {
  return (
    <div>
       {/* 用户资料、等级、兴趣标签、底部按钮等 UI 组件 */}
       {/* 固定导航栏（或底部导航） */}
       <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', display: 'flex', justifyContent: 'space-around', padding: '10px', background: '#f0f0f0' }}>
          <a href="/dialogue">Dialogue</a>
          <a href="/history">History</a>
          <a href="/settings"> Settings</a>
          <a href="/profile"> Profile</a>
       </div>
       <BottomNav />
    </div>
  );
};

export default Profile; 