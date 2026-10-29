import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calculateSemesterGPA, getGradePoints, formatGPA } from '../utils/calculations';
import { validateAllCourses, validateSemester } from '../utils/validation';
import { ACADEMIC_SESSIONS, SEMESTER_NAMES } from '../config/gradingSystem';
import CourseRow from '../components/CourseRow';

function createEmptyCourse() {
  return {
    id: crypto.randomUUID(),
    courseCode: '',
    courseTitle: '',
    creditUnits: '',
    grade: '',
  };
}

export default function SemesterForm() {
  const { id } = useParams();
  const { semesters, addSemester, updateSemester } = useApp();
  const navigate = useNavigate();

  const existing = id && id !== 'new' ? semesters.find(s => s.id === id) : null;

  const [academicSession, setAcademicSession] = useState(existing?.academicSession || '');
  const [semesterName, setSemesterName] = useState(existing?.semesterName || '');
  const [courses, setCourses] = useState(
    existing?.courses?.length > 0 ? existing.courses : [createEmptyCourse()]
  );
  const [semesterErrors, setSemesterErrors] = useState([]);
  const [courseErrors, setCourseErrors] = useState({});
  const [gpaResult, setGpaResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleCourseChange = useCallback((updatedCourse) => {
    setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
    setGpaResult(null);
  }, []);

  function handleAddCourse() {
    setCourses(prev => [...prev, createEmptyCourse()]);
  }

  function handleRemoveCourse(courseId) {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    setGpaResult(null);
  }

  function handleCalculate() {
    const errs = validateAllCourses(courses);
    setCourseErrors(errs);
    if (Object.keys(errs).length > 0) {
      setGpaResult(null);
      return;
    }
    const result = calculateSemesterGPA(courses);
    setGpaResult(result);
  }

  function handleSave() {
    const semErrs = validateSemester({ academicSession, semesterName, courses });
    const courseErrs = validateAllCourses(courses);
    setSemesterErrors(semErrs);
    setCourseErrors(courseErrs);

    if (semErrs.length > 0 || Object.keys(courseErrs).length > 0) return;

    const processedCourses = courses.map(c => ({
      ...c,
      courseCode: c.courseCode.trim().toUpperCase(),
      courseTitle: c.courseTitle.trim(),
      creditUnits: Number(c.creditUnits),
      gradePoints: getGradePoints(c.grade),
    }));

    if (existing) {
      updateSemester({ ...existing, academicSession, semesterName, courses: processedCourses });
    } else {
      addSemester({ academicSession, semesterName, courses: processedCourses });
    }

    setSaveSuccess(true);
    setTimeout(() => navigate('/'), 800);
  }

  const displayResult = gpaResult ?? (existing ? calculateSemesterGPA(courses) : null);

  return (
    <main className="page">
      <button className="btn btn--ghost btn--sm back-btn" onClick={() => navigate(-1)}>← Back</button>

      <h1 className="page-title">{existing ? 'Edit Semester' : 'Add New Semester'}</h1>

      {semesterErrors.length > 0 && (
        <div className="alert alert--error" role="alert" aria-live="polite">
          <ul>
            {semesterErrors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {saveSuccess && (
        <div className="alert alert--success" role="status" aria-live="polite">
          Semester saved successfully! Redirecting...
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="session" className="form-label">Academic Session</label>
          <select
            id="session"
            className="form-select"
            value={academicSession}
            onChange={e => setAcademicSession(e.target.value)}
          >
            <option value="">-- Select Session --</option>
            {ACADEMIC_SESSIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="semester" className="form-label">Semester</label>
          <select
            id="semester"
            className="form-select"
            value={semesterName}
            onChange={e => setSemesterName(e.target.value)}
          >
            <option value="">-- Select Semester --</option>
            {SEMESTER_NAMES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table entry-table" aria-label="Course entry table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Units</th>
                <th>Grade</th>
                <th>Points</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <CourseRow
                  key={course.id}
                  course={course}
                  onChange={handleCourseChange}
                  onRemove={() => handleRemoveCourse(course.id)}
                  errors={courseErrors[course.id] || []}
                  showRemove={courses.length > 1}
                />
              ))}
            </tbody>
          </table>
        </div>

        <button type="button" className="btn btn--ghost add-course-btn" onClick={handleAddCourse}>
          + Add Course
        </button>
      </div>

      {displayResult && displayResult.totalUnits > 0 && (
        <div className="gpa-result" aria-live="polite">
          <div className="gpa-result__main">
            <span className="gpa-result__label">Semester GPA</span>
            <span className="gpa-result__value">{formatGPA(displayResult.gpa)}</span>
            <span className="gpa-result__scale">/ 5.00</span>
          </div>
          <div className="gpa-result__details">
            <span>{displayResult.totalUnits} credit units</span>
            <span>&middot;</span>
            <span>{displayResult.totalWeightedPoints.toFixed(1)} quality points</span>
            <span>&middot;</span>
            <span>{displayResult.validCourseCount} valid course{displayResult.validCourseCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      <div className="action-bar">
        <button type="button" className="btn btn--secondary" onClick={handleCalculate}>
          Calculate GPA
        </button>
        <button type="button" className="btn btn--primary" onClick={handleSave}>
          {existing ? 'Save Changes' : 'Save Semester'}
        </button>
      </div>
    </main>
  );
}

