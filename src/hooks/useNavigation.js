import { useState } from 'react';
import { VIEWS } from '../utils/constants';

/**
 * Custom hook for managing navigation between views
 */
export const useNavigation = (initialView = VIEWS.DASHBOARD) => {
  const [currentView, setCurrentView] = useState(initialView);

  const navigateTo = (view) => {
    if (Object.values(VIEWS).includes(view)) {
      setCurrentView(view);
    } else {
      console.warn(`Invalid view: ${view}`);
    }
  };

  const isCurrentView = (view) => currentView === view;

  return {
    currentView,
    navigateTo,
    isCurrentView,
  };
};

export default useNavigation;