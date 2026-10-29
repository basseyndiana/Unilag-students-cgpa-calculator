export default function ClassBadge({ degreeClass }) {
  if (!degreeClass) return null;

  const colorMap = {
    first: '#16a34a',
    upper: '#1a6ef5',
    lower: '#d97706',
    third: '#ea580c',
    pass:  '#64748b',
    fail:  '#dc2626',
  };

  const bg = colorMap[degreeClass.colorKey] || '#64748b';

  return (
    <span
      className="class-badge"
      style={{ backgroundColor: bg }}
      aria-label={`Degree class: ${degreeClass.label}`}
    >
      {degreeClass.label}
    </span>
  );
}

