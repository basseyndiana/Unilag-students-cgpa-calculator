import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calculateCGPA, calculateSemesterGPA, formatGPA, getDegreeClass } from '../utils/calculations';
import StatsCard from '../components/StatsCard';
import SemesterCard from '../components/SemesterCard';
import ClassBadge from '../components/ClassBadge';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';

export default function Dashboard() {
  const { semesters, deleteSemester } = useApp();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { cgpa, grandTotalUnits } = calculateCGPA(semesters);
  const degreeClass = getDegreeClass(cgpa);

  const latestSemester = semesters.length > 0 ? semesters[semesters.length - 1] : null;
  const latestGPA = latestSemester ? calculateSemesterGPA(latestSemester.courses || []).gpa : null;

  const recentSemesters = [...semesters].reverse().slice(0, 3);

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
          <h1 className="page-title">Academic Dashboard</h1>
          <p className="page-subtitle">University of Lagos — CGPA Tracker</p>
        </div>
        {degreeClass && <ClassBadge degreeClass={degreeClass} />}
      </div>

      <section className="stats-grid" aria-label="Academic summary">
        <StatsCard
          label="Cumulative GPA (CGPA)"
          value={semesters.length > 0 ? formatGPA(cgpa) : '--'}
          subtitle="out of 5.00"
          accent
        />
        <StatsCard
          label="Latest Semester GPA"
          value={latestGPA !== null ? formatGPA(latestGPA) : '--'}
          subtitle={latestSemester ? `${latestSemester.semesterName}, ${latestSemester.academicSession}` : 'No semesters yet'}
        />
        <StatsCard
          label="Semesters Completed"
          value={semesters.length}
          subtitle="recorded semesters"
        />
        <StatsCard
          label="Total Credit Units"
          value={grandTotalUnits}
          subtitle="across all semesters"
        />
      </section>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Recent Semesters</h2>
          {semesters.length > 3 && (
            <button className="btn btn--ghost btn--sm" onClick={() => navigate('/history')}>
              View all
            </button>
          )}
        </div>

        {recentSemesters.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No semesters recorded yet"
            description="Add your first semester to start tracking your CGPA."
            action={
              <button className="btn btn--primary" onClick={() => navigate('/semester/new')}>
                + Add Your First Semester
              </button>
            }
          />
        ) : (
          <div className="card-grid">
            {recentSemesters.map(s => (
              <SemesterCard key={s.id} semester={s} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Semester"
        message="Are you sure you want to delete this semester? This action cannot be undone and will affect your CGPA."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Delete Semester"
      />
    </main>
  );
}

