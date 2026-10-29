/**
 * Calculation Engine — Pure Functions
 *
 * These functions have NO side effects and NO React dependencies.
 * They can be tested independently and reused anywhere.
 *
 * Key rule: CGPA is NEVER calculated as an average of semester GPAs.
 * It is always: total weighted grade points / total credit units.
 */

import { GRADE_SCALE, DEGREE_CLASSES } from '../config/gradingSystem';

/**
 * Returns the grade points for a given letter grade (e.g., 'A' -> 5).
 * Returns null if the grade is not recognised.
 */
export function getGradePoints(grade) {
  if (!grade || typeof grade !== 'string') return null;
  const entry = GRADE_SCALE.find(g => g.grade === grade.toUpperCase().trim());
  return entry !== undefined ? entry.points : null;
}

/**
 * Calculates GPA for a single semester.
 *
 * @param {Array} courses - Array of course objects: { creditUnits, grade, ... }
 * @returns {{ gpa: number, totalUnits: number, totalWeightedPoints: number, validCourseCount: number }}
 *
 * Courses with invalid grade or non-positive credit units are silently skipped.
 */
export function calculateSemesterGPA(courses) {
  if (!Array.isArray(courses) || courses.length === 0) {
    return { gpa: 0, totalUnits: 0, totalWeightedPoints: 0, validCourseCount: 0 };
  }

  let totalUnits = 0;
  let totalWeightedPoints = 0;
  let validCourseCount = 0;

  for (const course of courses) {
    const points = getGradePoints(course.grade);
    const units = Number(course.creditUnits);

    if (points === null || !Number.isFinite(units) || units <= 0) continue;

    totalUnits += units;
    totalWeightedPoints += points * units;
    validCourseCount += 1;
  }

  const gpa = totalUnits > 0 ? totalWeightedPoints / totalUnits : 0;

  return { gpa, totalUnits, totalWeightedPoints, validCourseCount };
}

/**
 * Calculates CGPA across multiple semesters.
 *
 * IMPORTANT: This sums ALL weighted grade points and ALL credit units
 * across every semester, then divides once. It does NOT average the GPAs.
 *
 * @param {Array} semesters - Array of semester objects, each with a courses array.
 * @returns {{ cgpa: number, grandTotalUnits: number, grandTotalWeightedPoints: number }}
 */
export function calculateCGPA(semesters) {
  if (!Array.isArray(semesters) || semesters.length === 0) {
    return { cgpa: 0, grandTotalUnits: 0, grandTotalWeightedPoints: 0 };
  }

  let grandTotalUnits = 0;
  let grandTotalWeightedPoints = 0;

  for (const semester of semesters) {
    const { totalUnits, totalWeightedPoints } = calculateSemesterGPA(semester.courses || []);
    grandTotalUnits += totalUnits;
    grandTotalWeightedPoints += totalWeightedPoints;
  }

  const cgpa = grandTotalUnits > 0 ? grandTotalWeightedPoints / grandTotalUnits : 0;

  return { cgpa, grandTotalUnits, grandTotalWeightedPoints };
}

/**
 * Returns the degree classification object for a given CGPA.
 * Returns null if CGPA is 0 (no data yet).
 */
export function getDegreeClass(cgpa) {
  if (cgpa === 0) return null;
  return DEGREE_CLASSES.find(dc => cgpa >= dc.min && cgpa <= dc.max) || DEGREE_CLASSES[DEGREE_CLASSES.length - 1];
}

/**
 * Formats a number to exactly 2 decimal places for display.
 */
export function formatGPA(value) {
  return Number(value).toFixed(2);
}

