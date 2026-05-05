const StatCard = ({ icon, label, value, color = 'blue', trend }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-info">
        <span className="stat-card-value">{value}</span>
        <span className="stat-card-label">{label}</span>
      </div>
      {trend !== undefined && (
        <div className={`stat-card-trend ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}
        </div>
      )}
    </div>
  );
};

export default StatCard;
