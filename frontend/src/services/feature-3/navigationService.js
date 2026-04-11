/**
 * Navigation utility service following SOLID principles
 * Single Responsibility: Handle navigation logic and history management
 */

export const navigationService = {
  /**
   * Intelligent back navigation with fallback
   * @param {Function} navigate - React Router navigate function
   * @param {string} fallbackPath - Fallback path if no history exists
   */
  goBack: (navigate, fallbackPath = '/') => {
    try {
      // Check if there's browser history to go back to
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        // Fallback to provided path or home
        navigate(fallbackPath || '/');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Ultimate fallback
      navigate(fallbackPath || '/');
    }
  },

  /**
   * Navigate to a specific path with error handling
   * @param {Function} navigate - React Router navigate function
   * @param {string} path - Target path
   */
  navigateTo: (navigate, path) => {
    try {
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
      navigate('/');
    }
  },

  /**
   * Check if navigation back is possible
   * @returns {boolean} - Whether back navigation is possible
   */
  canGoBack: () => {
    return window.history.length > 1;
  }
};
