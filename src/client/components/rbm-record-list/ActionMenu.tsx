import React from 'react';

/**
 * WCAG 2.1 AA Compliant Action Menu Component
 * 
 * Provides accessible menu with proper ARIA markup and keyboard navigation
 */

export interface ActionMenuProps {
  actions: any[];
  onActionSelect: (actionId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
  className?: string;
  ariaLabel?: string;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  actions,
  onActionSelect,
  isOpen,
  onClose,
  triggerRef,
  className = '',
  ariaLabel = 'Actions menu',
  placement = 'bottom-end'
}) => {
  const menuRef = React.useRef<HTMLUListElement>(null);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);

  // Focus management
  React.useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstMenuItem = menuRef.current.querySelector('[role="menuitem"]') as HTMLElement;
      if (firstMenuItem) {
        firstMenuItem.focus();
        setFocusedIndex(0);
      }
    }
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => {
          const newIndex = Math.min(prev + 1, actions.length - 1);
          focusMenuItem(newIndex);
          return newIndex;
        });
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => {
          const newIndex = Math.max(prev - 1, 0);
          focusMenuItem(newIndex);
          return newIndex;
        });
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < actions.length) {
          handleActionSelect(actions[focusedIndex].id);
        }
        break;
      case 'Escape':
        event.preventDefault();
        handleClose();
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        focusMenuItem(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedIndex(actions.length - 1);
        focusMenuItem(actions.length - 1);
        break;
    }
  };

  const focusMenuItem = (index: number) => {
    if (menuRef.current) {
      const menuItems = menuRef.current.querySelectorAll('[role="menuitem"]');
      const item = menuItems[index] as HTMLElement;
      if (item) {
        item.focus();
      }
    }
  };

  const handleActionSelect = (actionId: string) => {
    onActionSelect(actionId);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    // Return focus to trigger element
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for closing menu */}
      <div
        className="rbm-menu-backdrop"
        onClick={handleClose}
        aria-hidden="true"
      />
      
      <ul
        ref={menuRef}
        role="menu"
        className={`rbm-action-menu ${className}`}
        aria-label={ariaLabel}
        aria-orientation="vertical"
        data-placement={placement}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {actions.map((action, index) => (
          <li key={action.id} role="none">
            <button
              role="menuitem"
              className={`rbm-action-menu__item ${action.category ? `rbm-action-menu__item--${action.category}` : ''}`}
              onClick={() => handleActionSelect(action.id)}
              disabled={action.advisoryEnabled === false}
              aria-describedby={action.accessibility?.description ? `action-${action.id}-desc` : undefined}
              data-action-id={action.id}
              tabIndex={-1}
            >
              {action.iconKey && (
                <span 
                  className="rbm-action-menu__icon" 
                  aria-hidden="true"
                >
                  {action.iconKey}
                </span>
              )}
              <span className="rbm-action-menu__label">
                {action.label}
              </span>
              {action.accessibility?.description && (
                <span 
                  id={`action-${action.id}-desc`}
                  className="rbm-sr-only"
                >
                  {action.accessibility.description}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};