import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calculateCGPA, formatGPA, getDegreeClass } from '../utils/calculations';
import SemesterCard from '../components/SemesterCard';
import ClassBadge from '../components/ClassBadge';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';

export default function AcademicHistory() {
  const { semesters, deleteSemester } = useApp();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { cgpa, grandTotalUnits, grandTotalWeightedPoints } = calculateCGPA(semesters);
  const degreeClass = getDegreeClass(cgpa);

  function handleDelete(id) {
    setDeleteTarget(id);
  }

  function confirmDelete() {
    if (deleteTarget) {
      deleteSemester(deleteTarget);
      setDeleteTarget(null);
    }
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Academic History</h1>
          <p className="page-subtitle">All recorded semesters in chronological order</p>
        </div>
        {degreeClass && <ClassBadge degreeClass={degreeClass} />}
      </div>

      {semesters.length > 0 && (
        <div className="cgpa-summary-bar">
          <div className="cgpa-summary-bar__item">
            <span className="cgpa-summary-bar__label">CGPA</span>
            <span className="cgpa-summary-bar__value">{formatGPA(cgpa)}</span>
          </div>
          <div className="cgpa-summary-bar__item">
            <span className="cgpa-summary-bar__label">Total Units</span>
            <span className="cgpa-summary-bar__value">{grandTotalUnits}</span>
          </div>
          <div className="cgpa-summary-bar__item">
            <span className="cgpa-summary-bar__label">Quality Points</span>
            <span className="cgpa-summary-bar__value">{grandTotalWeightedPoints.toFixed(1)}</span>
          </div>
          <div className="cgpa-summary-bar__item">
            <span className="cgpa-summary-bar__label">Semesters</span>
            <span className="cgpa-summary-bar__value">{semesters.length}</span>
          </div>
        </div>
      )}

      {semesters.length === 0 ? (
        <EmptyState
          icon="📂"
          title="No academic history yet"
          description="Your recorded semesters will appear here."
          action={
            <button className="btn btn--primary" onClick={() => navigate('/semester/new')}>
              + Add First Semester
            </button>
          }
        />
      ) : (
        <div className="card-grid">
          {semesters.map(s => (
            <SemesterCard key={s.id} semester={s} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Semester"
        message="Are you sure you want to delete this semester? This will recalculate your CGPA."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Delete Semester"
      />
    </main>
  );
}

