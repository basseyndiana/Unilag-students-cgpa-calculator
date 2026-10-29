export default function StatsCard({ label, value, subtitle, accent }) {
  return (
    <div className={`stats-card${accent ? ' stats-card--accent' : ''}`}>
      <p className="stats-card__label">{label}</p>
      <p className="stats-card__value">{value}</p>
      {subtitle && <p className="stats-card__subtitle">{subtitle}</p>}
    </div>
  );
}

