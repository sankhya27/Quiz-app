export const setInternalNav = () => {
  sessionStorage.setItem('isInternalNav', 'true');
};

export const checkInternalNav = () => {
  return sessionStorage.getItem('isInternalNav') === 'true';
};

export const clearInternalNav = () => {
  sessionStorage.removeItem('isInternalNav');
};
