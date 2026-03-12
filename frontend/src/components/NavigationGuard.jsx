import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { checkInternalNav, clearInternalNav } from '../utils/navigation';

function NavigationGuard({ children }) {
  const location = useLocation();
  const [isAllowed, setIsAllowed] = useState(true);

  useEffect(() => {
    // Home is our safety landing pad. Always allow it.
    if (location.pathname === '/') {
      setIsAllowed(true);
      return;
    }

    const internal = checkInternalNav();
    if (!internal) {
      setIsAllowed(false);
    } else {
      setIsAllowed(true);
      // We only clear it AFTER we've accepted the navigation.
      // This way, re-renders on the SAME page don't lock us out.
      clearInternalNav();
    }
  }, [location.pathname]);

  if (!isAllowed && location.pathname !== '/') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default NavigationGuard;
