import React from 'react';

/**
 * WCAG 2.1 AA Compliant Icon Component
 * 
 * Provides consistent icon rendering with accessibility support
 * Icons are always paired with text/labels, never used alone for meaning
 */

export interface IconProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  ariaLabel?: string;
  ariaHidden?: boolean;
  decorative?: boolean;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'sm',
  className = '',
  ariaLabel,
  ariaHidden = false,
  decorative = true
}) => {
  // Icon mapping with semantic symbols that work in all contexts
  const iconMap: Record<string, string> = {
    // Status icons
    'success': '✓',
    'check': '✓',
    'warning': '⚠',
    'alert': '⚠',
    'error': '✕',
    'close': '✕',
    'info': 'ℹ',
    'help': '?',
    
    // Selection icons
    'checkbox-checked': '☑',
    'checkbox-unchecked': '☐',
    'checkbox-mixed': '◐',
    'radio-selected': '●',
    'radio-unselected': '○',
    
    // Navigation icons
    'arrow-up': '↑',
    'arrow-down': '↓',
    'arrow-left': '←',
    'arrow-right': '→',
    'chevron-up': '▲',
    'chevron-down': '▼',
    'chevron-left': '◄',
    'chevron-right': '►',
    
    // Action icons
    'edit': '✎',
    'delete': '🗑',
    'view': '👁',
    'open': '↗',
    'menu': '⋯',
    'more': '⋯',
    'settings': '⚙',
    'filter': '⚪',
    'search': '🔍',
    'refresh': '↻',
    
    // Loading/status
    'loading': '⟳',
    'pending': '⏳',
    'complete': '✓',
    'in-progress': '⟳',
    
    // Priority/severity
    'high': '🔴',
    'medium': '🟡',
    'low': '🟢',
    'critical': '🔴',
    
    // Default
    'default': '●'
  };

  const iconSymbol = iconMap[name] || iconMap['default'];
  const sizeClass = `rbm-icon--${size}`;
  
  // For decorative icons (paired with text), use aria-hidden
  // For semantic icons (standalone), require aria-label
  const ariaProps = decorative || ariaHidden ? {
    'aria-hidden': 'true'
  } : {
    'aria-label': ariaLabel || name,
    'role': 'img'
  };

  return (
    <span
      className={`rbm-icon ${sizeClass} ${className}`}
      {...ariaProps}
    >
      {iconSymbol}
    </span>
  );
};