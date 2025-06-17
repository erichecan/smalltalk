import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TopicInput: React.FC = () => {
  const [topicInput, setTopicInput] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('currentTopic', topicInput.trim());
    navigate('/dialogue');
  };

  return (
    <div>
      {/* Form submission handling */}
    </div>
  );
};

export default TopicInput; 