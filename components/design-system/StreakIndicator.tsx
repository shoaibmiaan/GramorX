import React from 'react';
export const StreakIndicator: React.FC<{value:number}> = ({ value }) => (
  <div className="streak-chip">
    <i className="fas fa-fire text-sunsetOrange"></i>
    <span>{value}</span>
  </div>
);
