import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, TextField, IconButton, Grid, Paper, Avatar, ListItemText, CircularProgress, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import { getCategories, CategoryData } from '../services/categoryService'; // Import service and type

// Specific MUI Icons to use based on iconName from backend
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'; // MdRestaurant
import FlightIcon from '@mui/icons-material/Flight'; // MdFlightTakeoff
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'; // MdWork
import SportsIcon from '@mui/icons-material/Sports'; // MdSportsEsports
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // MdShoppingCart
import ArticleIcon from '@mui/icons-material/Article'; // MdArticle
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'; // MdChatBubbleOutline (default)


// Helper to map iconName to actual MUI Icon component
const MuiIcon = ({ iconName }: { iconName?: string }) => {
  switch (iconName) {
    case 'MdRestaurant': return <RestaurantMenuIcon sx={{ fontSize: 36 }} />;
    case 'MdFlightTakeoff': return <FlightIcon sx={{ fontSize: 36 }} />;
    case 'MdWork': return <WorkOutlineIcon sx={{ fontSize: 36 }} />;
    case 'MdSportsEsports': return <SportsIcon sx={{ fontSize: 36 }} />;
    case 'MdShoppingCart': return <ShoppingCartIcon sx={{ fontSize: 36 }} />;
    case 'MdArticle': return <ArticleIcon sx={{ fontSize: 36 }} />;
    case 'MdChatBubbleOutline': return <ChatBubbleOutlineIcon sx={{ fontSize: 36 }} />;
    default: return <ChatBubbleOutlineIcon sx={{ fontSize: 36 }} />; // Default icon
  }
};


const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load categories.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleTopicClick = (category: CategoryData) => {
    navigate('/dialogue', { state: { topic: category.name, topicId: category._id } });
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)' /* Adjust for header/footer */, py: 2 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 2, bgcolor: '#F9FBF9', minHeight: 'calc(100vh - 64px)' /* Adjust for header */ }}>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: 'left' /* Align title left as per original HTML */ }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#111811' }}>
            Topics
          </Typography>
          <IconButton sx={{ color: '#111811' }} aria-label="Search topics">
            <SearchIcon />
          </IconButton>
        </Box>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search topics..."
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
            ),
            sx: { borderRadius: '25px', bgcolor: 'background.paper', '.MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' } }
          }}
          size="small" // Make search bar a bit smaller
        />
      </Box>

      {/* Topic List */}
      <Grid container spacing={2}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category._id}>
            <Paper
              elevation={0} // As per original HTML, cards are flat with border
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { boxShadow: 2, borderColor: 'primary.main' },
                borderRadius: '16px',
                bgcolor: 'background.paper',
                border: '1px solid #e0e0e0', // Default border
                height: '100%', // Ensure papers in a row have same height for alignment
              }}
              onClick={() => handleTopicClick(category)}
            >
              <Avatar
                src={category.imageUrl || undefined}
                variant="rounded" // Match HTML
                sx={{
                  width: 56, // Match HTML more closely
                  height: 56,
                  mr: 2,
                  bgcolor: category.imageUrl ? 'transparent' : '#e7f3e7', // Lighter green for icon background
                  color: '#4caf50' // Icon color
                }}
              >
                {!category.imageUrl && <MuiIcon iconName={category.iconName} />}
              </Avatar>
              <ListItemText
                primary={category.name}
                secondary={category.description}
                primaryTypographyProps={{ fontWeight: '600', color: 'text.primary', fontSize: '1rem' }} // Slightly bolder and larger
                secondaryTypographyProps={{ color: 'text.secondary', fontSize: '0.8rem' }} // Slightly smaller
              />
              <ChevronRightIcon sx={{ color: 'action.active', ml: 1 }} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CategoriesPage;
