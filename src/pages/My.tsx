import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function My() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/profile');
  }, [navigate]);

  return null;
} 