import { Box, Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { styled } from '@mui/material/styles';
import welcomeImg from '../../public/assets/8c9bd27fa1c4a9441c426e943dc9df9e22eb7426.png'; // 替换为 assets-map.json 中 Welcome 页大图的本地路径

const NavButton = styled(Button)(({ theme }) => ({
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 999,
  minWidth: 0,
  padding: 0,
  background: 'none',
  boxShadow: 'none',
  color: '#0d1c14',
  '&:hover': {
    background: '#e7f3ed',
  },
}));

export default function Welcome() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fcfa', fontFamily: 'Inter, Noto Sans, sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflowX: 'hidden' }}>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 8, px: 2 }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Box sx={{ aspectRatio: '1/1', width: '100%', borderRadius: 4, overflow: 'hidden', boxShadow: 3, background: `url(${welcomeImg}) center/cover no-repeat` }} />
        </Box>
        <Typography variant="h3" sx={{ color: '#0d1c14', fontWeight: 'bold', mt: 8, mb: 3, textAlign: 'center', letterSpacing: '-0.02em', fontSize: { xs: 28, sm: 32 } }}>
          Ready to Speak Like a Native?
        </Typography>
        <Typography sx={{ color: '#374151', fontSize: 16, textAlign: 'center', mb: 6, maxWidth: 320 }}>
          Tip: The more you practice, the faster you'll improve! Don't be afraid to make mistakes – that's how we learn.
        </Typography>
      </Box>
      <Box sx={{ px: 2, pb: 4, width: '100%', maxWidth: 400, mx: 'auto' }}>
        <Button component={Link} to="/topic" fullWidth sx={{ height: 56, borderRadius: 999, bgcolor: '#0ecd6a', color: '#fff', fontWeight: 600, fontSize: 18, mb: 2, boxShadow: 2, '&:hover': { bgcolor: '#10b65c' } }}>
          Start Your First Conversation
        </Button>
        <Button fullWidth sx={{ height: 56, borderRadius: 999, bgcolor: '#f1f5f1', color: '#0d1c14', fontWeight: 500, fontSize: 18, border: '1px solid #e7f3ed', '&:hover': { bgcolor: '#e7f3ed' } }}>
          Explore Topics
        </Button>
      </Box>
      {/* 底部导航栏 */}
      <Box sx={{ position: 'sticky', bottom: 0, bgcolor: '#f8fcfa', borderTop: '1px solid #e7f3ed', px: 2, pt: 2, pb: 3, display: 'flex', gap: 1, zIndex: 10 }}>
        <NavButton disableRipple>
          <HomeIcon sx={{ fontSize: 28, color: '#0d1c14' }} />
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#0d1c14' }}>Home</Typography>
        </NavButton>
        <NavButton disableRipple>
          <SearchIcon sx={{ fontSize: 28, color: '#7f8c8d' }} />
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#7f8c8d' }}>Explore</Typography>
        </NavButton>
        <NavButton disableRipple>
          <ChatBubbleOutlineIcon sx={{ fontSize: 28, color: '#7f8c8d' }} />
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#7f8c8d' }}>Practice</Typography>
        </NavButton>
        <NavButton disableRipple>
          <PersonOutlineIcon sx={{ fontSize: 28, color: '#7f8c8d' }} />
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#7f8c8d' }}>Profile</Typography>
        </NavButton>
      </Box>
    </Box>
  );
} 