import React from 'react';

interface ScrewRivetProps {
  className?: string;
  angle?: number;
}

export const ScrewRivet: React.FC<ScrewRivetProps> = ({ className = '', angle = 45 }) => {
  return (
    <div
      className={`screw-rivet ${className}`}
      style={{ transform: `rotate(${angle}deg)` }}
      title="Hardware chassis fastener"
    />
  );
};
