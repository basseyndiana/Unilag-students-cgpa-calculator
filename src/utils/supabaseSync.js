import { supabase } from '../lib/supabase';
import { loadData, clearData } from './storage';

/**
 * Transforms a Supabase row (with joined courses) to the frontend semester object format.
 */
export function formatSemesterFromDB(row) {
  return {
    id: row.id,
    academicSession: row.academic_session,
    semesterName: row.semester_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    courses: (row.courses || []).map(c => ({
      id: c.id,
      courseCode: c.course_code,
      courseTitle: c.course_title,
      creditUnits: c.credit_units,
      grade: c.grade,
      gradePoints: c.grade_points,
    })),
  };
}

/**
 * Fetches all semesters and their courses for an authenticated user.
 */
export async function fetchUserSemesters(userId) {
  const { data, error } = await supabase
    .from('semesters')
    .select(`
      id,
      academic_session,
      semester_name,
      created_at,
      updated_at,
      courses (
        id,
        course_code,
        course_title,
        credit_units,
        grade,
        grade_points
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[supabaseSync] Error fetching semesters:', error);
    throw error;
  }

  return (data || []).map(formatSemesterFromDB);
}

/**
 * Adds or updates a semester and its courses in Supabase.
 */
export async function upsertSemesterInSupabase(userId, semester) {
  const semesterPayload = {
    id: semester.id,
    user_id: userId,
    academic_session: semester.academicSession,
    semester_name: semester.semesterName,
    created_at: semester.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error: semError } = await supabase
    .from('semesters')
    .upsert(semesterPayload, { onConflict: 'id' });

  if (semError) {
    console.error('[supabaseSync] Error saving semester:', semError);
    throw semError;
  }

  // Delete existing courses for this semester to handle edits/removals cleanly
  const { error: delError } = await supabase
    .from('courses')
    .delete()
    .eq('semester_id', semester.id);

  if (delError) {
    console.error('[supabaseSync] Error clearing old courses for semester:', delError);
    throw delError;
  }

  if (semester.courses && semester.courses.length > 0) {
    const coursePayload = semester.courses.map(c => ({
      id: c.id,
      semester_id: semester.id,
      user_id: userId,
      course_code: c.courseCode,
      course_title: c.courseTitle,
      credit_units: c.creditUnits,
      grade: c.grade,
      grade_points: c.gradePoints,
    }));

    const { error: coursesError } = await supabase
      .from('courses')
      .insert(coursePayload);

    if (coursesError) {
      console.error('[supabaseSync] Error saving courses:', coursesError);
      throw coursesError;
    }
  }
}

/**
 * Deletes a semester from Supabase.
 * Cascades to courses due to on delete cascade constraint.
 */
export async function deleteSemesterFromSupabase(userId, semesterId) {
  const { error } = await supabase
    .from('semesters')
    .delete()
    .match({ id: semesterId, user_id: userId });

  if (error) {
    console.error('[supabaseSync] Error deleting semester:', error);
    throw error;
  }
}

/**
 * Auto-syncs unauthenticated local storage records to the user's Supabase account on signup/login.
 * Retains a timestamped safety backup in localStorage.
 */
export async function autoMigrateLocalData(userId) {
  const localData = loadData();
  if (!localData || !Array.isArray(localData.semesters) || localData.semesters.length === 0) {
    return 0;
  }

  const count = localData.semesters.length;
  try {
    for (const sem of localData.semesters) {
      await upsertSemesterInSupabase(userId, sem);
    }

    // Preserve safety backup in localStorage before clearing active key
    try {
      localStorage.setItem(`unilag_cgpa_backup_${Date.now()}`, JSON.stringify(localData));
    } catch {
      // Ignore backup quota errors
    }

    // Clear active key so it doesn't conflict
    clearData();
    return count;
  } catch (err) {
    console.error('[supabaseSync] Error during auto-migration of local data:', err);
    throw err;
  }
}

