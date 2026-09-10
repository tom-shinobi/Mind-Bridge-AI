import React from 'react';
import { sound } from '../../services/soundService';

interface HardwareButtonProps {
  label: string;
  variant?: 'light' | 'dark' | 'vermilion' | 'accent';
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export const HardwareButton: React.FC<HardwareButtonProps> = ({
  label,
  variant = 'light',
  active = false,
  disabled = false,
  onClick,
  className = '',
  icon
}) => {
  const handleClick = () => {
    if (disabled) return;
    sound.playClick();
    onClick?.();
  };

  const variantClass =
    variant === 'light'
      ? 'btn-hw-light'
      : 'btn-hw-dark';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`btn-hardware-pill ${variantClass} ${active ? 'active ring-1 ring-purple-500/40' : ''} ${className}`}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      <span>{label}</span>
    </button>
  );
};
