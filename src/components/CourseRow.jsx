import GradeSelect from './GradeSelect';
import { getGradePoints } from '../utils/calculations';

export default function CourseRow({ course, onChange, onRemove, errors = [], showRemove }) {
  const gradePoints = getGradePoints(course.grade);

  function handleField(field, value) {
    onChange({ ...course, [field]: value });
  }

  const hasError = errors.length > 0;

  return (
    <>
      <tr className={`course-row${hasError ? ' course-row--error' : ''}`}>
        <td>
          <input
            type="text"
            className="table-input"
            placeholder="e.g. CSC 101"
            value={course.courseCode}
            onChange={e => handleField('courseCode', e.target.value)}
            aria-label="Course code"
            maxLength={20}
          />
        </td>
        <td>
          <input
            type="text"
            className="table-input table-input--wide"
            placeholder="e.g. Introduction to Computing"
            value={course.courseTitle}
            onChange={e => handleField('courseTitle', e.target.value)}
            aria-label="Course title"
          />
        </td>
        <td>
          <input
            type="number"
            className="table-input table-input--narrow"
            placeholder="1-6"
            min={1}
            max={6}
            value={course.creditUnits}
            onChange={e => handleField('creditUnits', e.target.value)}
            aria-label="Credit units"
          />
        </td>
        <td>
          <GradeSelect
            value={course.grade}
            onChange={val => handleField('grade', val)}
          />
        </td>
        <td className="grade-points-cell">
          {gradePoints !== null ? (
            <span className="grade-points-badge">{gradePoints}.0</span>
          ) : (
            <span className="grade-points-empty">--</span>
          )}
        </td>
        <td>
          {showRemove && (
            <button
              type="button"
              className="btn-icon btn-icon--danger"
              onClick={onRemove}
              aria-label="Remove course"
              title="Remove this course"
            >
              ✕
            </button>
          )}
        </td>
      </tr>
      {hasError && (
        <tr className="course-row-errors" aria-live="polite">
          <td colSpan={6}>
            <ul className="error-list">
              {errors.map((err, i) => (
                <li key={i} className="error-item">{err}</li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
  );
}

