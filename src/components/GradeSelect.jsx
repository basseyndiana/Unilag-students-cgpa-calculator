import { GRADE_SCALE } from '../config/gradingSystem';

export default function GradeSelect({ value, onChange, id, name }) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="grade-select"
      aria-label="Grade"
    >
      <option value="">-- Grade --</option>
      {GRADE_SCALE.map(g => (
        <option key={g.grade} value={g.grade}>
          {g.grade} ({g.minScore}–{g.maxScore}) — {g.description}
        </option>
      ))}
    </select>
  );
}

