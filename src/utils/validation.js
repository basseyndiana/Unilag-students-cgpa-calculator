/**
 * Validation Rules
 *
 * Returns error message strings so they are easy to test and display.
 */

import { GRADE_SCALE } from '../config/gradingSystem';

const VALID_GRADES = GRADE_SCALE.map(g => g.grade);

/** Validates a single course object. Returns an array of error strings. */
export function validateCourse(course, allCoursesInSemester = []) {
  const errors = [];

  if (!course.courseCode || !course.courseCode.trim()) {
    errors.push('Course code is required.');
  }

  if (!course.courseTitle || !course.courseTitle.trim()) {
    errors.push('Course title is required.');
  }

  const units = Number(course.creditUnits);
  if (course.creditUnits === '' || course.creditUnits === null || course.creditUnits === undefined) {
    errors.push('Credit units are required.');
  } else if (!Number.isInteger(units) || units < 1 || units > 6) {
    errors.push('Credit units must be a whole number between 1 and 6.');
  }

  if (!course.grade || !VALID_GRADES.includes(course.grade.toUpperCase())) {
    errors.push('A valid grade (A, B, C, D, E, or F) is required.');
  }

  if (course.courseCode && course.courseCode.trim()) {
    const duplicates = allCoursesInSemester.filter(
      c => c.id !== course.id &&
           c.courseCode.trim().toUpperCase() === course.courseCode.trim().toUpperCase()
    );
    if (duplicates.length > 0) {
      errors.push(`Course code "${course.courseCode.trim().toUpperCase()}" is already in this semester.`);
    }
  }

  return errors;
}

/** Validates a semester object. Returns an array of error strings. */
export function validateSemester(semester) {
  const errors = [];

  if (!semester.academicSession || !semester.academicSession.trim()) {
    errors.push('Academic session is required.');
  }

  if (!semester.semesterName || !semester.semesterName.trim()) {
    errors.push('Semester name is required.');
  }

  if (!Array.isArray(semester.courses) || semester.courses.length === 0) {
    errors.push('At least one course is required.');
  }

  return errors;
}

/** Validates all courses. Returns a map of courseId to errors array. */
export function validateAllCourses(courses) {
  const errorMap = {};
  for (const course of courses) {
    const errors = validateCourse(course, courses);
    if (errors.length > 0) {
      errorMap[course.id] = errors;
    }
  }
  return errorMap;
}

