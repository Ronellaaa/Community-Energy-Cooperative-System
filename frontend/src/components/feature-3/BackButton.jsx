import React from 'react';
import { useNavigate } from 'react-router-dom';
import { navigationService } from '../../services/feature-3/navigationService';

/**
 * Reusable BackButton component following Single Responsibility Principle
 * Handles only back navigation functionality
 */
export default function BackButton({ 
  className = '', 
  label = 'Back', 
  fallbackPath = null,
  onClick = null 
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Execute custom onClick if provided
    if (onClick) {
      onClick();
      return;
    }

    // Use navigation service for intelligent back navigation
    navigationService.goBack(navigate, fallbackPath);
  };

  return (
    <button 
      className={`f3-backButton ${className}`}
      onClick={handleClick}
      aria-label={label}
    >
      <span className="f3-backButtonIcon">{'\u2190'}</span>
      <span className="f3-backButtonText">{label}</span>
    </button>
  );
}
