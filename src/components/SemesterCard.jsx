import { useNavigate } from 'react-router-dom';
import { calculateSemesterGPA, formatGPA } from '../utils/calculations';

export default function SemesterCard({ semester, onDelete, compact }) {
  const navigate = useNavigate();
  const { gpa, totalUnits } = calculateSemesterGPA(semester.courses || []);

  return (
    <div className="semester-card">
      <div className="semester-card__header">
        <div>
          <p className="semester-card__name">{semester.semesterName}</p>
          <p className="semester-card__session">{semester.academicSession}</p>
        </div>
        <div className="semester-card__gpa">
          <span className="gpa-value">{formatGPA(gpa)}</span>
          <span className="gpa-label">GPA</span>
        </div>
      </div>
      {!compact && (
        <p className="semester-card__meta">
          {totalUnits} credit unit{totalUnits !== 1 ? 's' : ''} &middot; {semester.courses?.length || 0} course{semester.courses?.length !== 1 ? 's' : ''}
        </p>
      )}
      <div className="semester-card__actions">
        <button
          className="btn btn--sm btn--ghost"
          onClick={() => navigate(`/semester/${semester.id}`)}
        >
          View
        </button>
        <button
          className="btn btn--sm btn--ghost"
          onClick={() => navigate(`/semester/${semester.id}/edit`)}
        >
          Edit
        </button>
        {onDelete && (
          <button
            className="btn btn--sm btn--danger-ghost"
            onClick={() => onDelete(semester.id)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

