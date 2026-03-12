import React from 'react';
import { useNavigate } from 'react-router-dom';

import { setInternalNav } from '../utils/navigation';

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    alert('Logged out!');
    setInternalNav();
    navigate('/');
  };

  return <button onClick={handleLogout}>Logout</button>;
}

export default Logout;
