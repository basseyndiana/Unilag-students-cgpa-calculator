import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calculateSemesterGPA, getGradePoints, formatGPA } from '../utils/calculations';
import ConfirmModal from '../components/ConfirmModal';

export default function SemesterDetail() {
  const { id } = useParams();
  const { semesters, deleteSemester } = useApp();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);

  const semester = semesters.find(s => s.id === id);

  if (!semester) {
    return (
      <main className="page">
        <p className="error-message">Semester not found.</p>
        <button className="btn btn--ghost" onClick={() => navigate('/')}>Back to Dashboard</button>
      </main>
    );
  }

  const { gpa, totalUnits, totalWeightedPoints } = calculateSemesterGPA(semester.courses || []);

  function handleDelete() {
    deleteSemester(semester.id);
    navigate('/');
  }

  return (
    <main className="page">
      <button className="btn btn--ghost btn--sm back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="page-header">
        <div>
          <h1 className="page-title">{semester.semesterName}</h1>
          <p className="page-subtitle">{semester.academicSession}</p>
        </div>
        <div className="detail-gpa">
          <span className="detail-gpa__value">{formatGPA(gpa)}</span>
          <span className="detail-gpa__label">GPA</span>
        </div>
      </div>

      <div className="result-summary">
        <div className="result-summary__item">
          <span className="result-summary__label">Total Credit Units</span>
          <span className="result-summary__value">{totalUnits}</span>
        </div>
        <div className="result-summary__item">
          <span className="result-summary__label">Quality Points</span>
          <span className="result-summary__value">{totalWeightedPoints.toFixed(1)}</span>
        </div>
        <div className="result-summary__item">
          <span className="result-summary__label">Courses</span>
          <span className="result-summary__value">{semester.courses?.length || 0}</span>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Course Breakdown</h2>
        <div className="table-wrapper">
          <table className="data-table" aria-label="Course breakdown">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Units</th>
                <th>Grade</th>
                <th>Points</th>
                <th>Weighted</th>
              </tr>
            </thead>
            <tbody>
              {(semester.courses || []).map(course => {
                const pts = getGradePoints(course.grade);
                const units = Number(course.creditUnits);
                return (
                  <tr key={course.id}>
                    <td><code className="course-code">{course.courseCode}</code></td>
                    <td>{course.courseTitle}</td>
                    <td>{units}</td>
                    <td>
                      <span className={`grade-chip grade-chip--${course.grade}`}>
                        {course.grade}
                      </span>
                    </td>
                    <td>{pts !== null ? pts : '--'}</td>
                    <td>{pts !== null ? (pts * units).toFixed(1) : '--'}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="table-footer">
                <td colSpan={2}><strong>Total</strong></td>
                <td><strong>{totalUnits}</strong></td>
                <td></td>
                <td></td>
                <td><strong>{totalWeightedPoints.toFixed(1)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="action-bar">
        <button className="btn btn--secondary" onClick={() => navigate(`/semester/${semester.id}/edit`)}>
          Edit Semester
        </button>
        <button className="btn btn--danger" onClick={() => setShowDelete(true)}>
          Delete Semester
        </button>
      </div>

      <ConfirmModal
        isOpen={showDelete}
        title="Delete Semester"
        message={`Delete ${semester.semesterName} (${semester.academicSession})? This will affect your CGPA and cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        confirmLabel="Delete"
      />
    </main>
  );
}

