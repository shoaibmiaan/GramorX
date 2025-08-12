export const StreakIndicator: React.FC<{ value?: number; count?: number }> = ({ value, count }) => {
  const streakValue = value ?? count ?? 0;
  return (
    <div className="streak-chip">
      <i className="fas fa-fire text-sunsetOrange"></i>
      <span>{streakValue}</span>
    </div>
  );
};
