import React from 'react';
import { Icon } from './Icon';

/**
 * WCAG 2.1 AA Enhanced Focus Indicator Component
 * 
 * Provides highly visible focus indicators that work in all contexts:
 * - High contrast borders
 * - Multiple visual cues
 * - Keyboard focus patterns
 * - Color-independent indicators
 */

export interface FocusIndicatorProps {
  children: React.ReactNode;
  className?: string;
  focusWithin?: boolean;
  variant?: 'subtle' | 'prominent' | 'high-contrast';
  shape?: 'rectangular' | 'rounded' | 'circular';
  showFocusText?: boolean;
  customFocusLabel?: string;
}

export const FocusIndicator: React.FC<FocusIndicatorProps> = ({
  children,
  className = '',
  focusWithin = false,
  variant = 'prominent',
  shape = 'rounded',
  showFocusText = false,
  customFocusLabel
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [isKeyboardFocus, setIsKeyboardFocus] = React.useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    setIsKeyboardFocus(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsKeyboardFocus(false);
  };

  const handleMouseDown = () => {
    setIsKeyboardFocus(false);
  };

  const variantClass = `rbm-focus-indicator--${variant}`;
  const shapeClass = `rbm-focus-indicator--${shape}`;
  const focusClass = isFocused ? 'rbm-focus-indicator--focused' : '';
  const keyboardClass = isKeyboardFocus ? 'rbm-focus-indicator--keyboard' : '';
  const withinClass = focusWithin ? 'rbm-focus-indicator--within' : '';

  return (
    <div
      className={`rbm-focus-indicator ${variantClass} ${shapeClass} ${focusClass} ${keyboardClass} ${withinClass} ${className}`}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseDown={handleMouseDown}
      data-focus-variant={variant}
      data-keyboard-focus={isKeyboardFocus}
    >
      {/* Multi-layered focus ring for maximum visibility */}
      <div className="rbm-focus-indicator__rings" aria-hidden="true">
        <div className="rbm-focus-ring rbm-focus-ring--outer" />
        <div className="rbm-focus-ring rbm-focus-ring--inner" />
        <div className="rbm-focus-ring rbm-focus-ring--accent" />
      </div>

      {/* Animated focus pattern */}
      <div className="rbm-focus-indicator__pattern" aria-hidden="true">
        <div className="rbm-focus-pattern rbm-focus-pattern--pulse" />
        <div className="rbm-focus-pattern rbm-focus-pattern--glow" />
      </div>

      {/* Content wrapper */}
      <div className="rbm-focus-indicator__content">
        {children}
      </div>

      {/* Focus state text (for screen readers or visible when needed) */}
      {(showFocusText || customFocusLabel) && isFocused && (
        <div className="rbm-focus-indicator__text rbm-sr-only">
          {customFocusLabel || 'Focused element. Use keyboard to navigate.'}
        </div>
      )}

      {/* Focus corner indicators for extra visibility */}
      <div className="rbm-focus-corners" aria-hidden="true">
        <div className="rbm-focus-corner rbm-focus-corner--top-left" />
        <div className="rbm-focus-corner rbm-focus-corner--top-right" />
        <div className="rbm-focus-corner rbm-focus-corner--bottom-left" />
        <div className="rbm-focus-corner rbm-focus-corner--bottom-right" />
      </div>
    </div>
  );
};