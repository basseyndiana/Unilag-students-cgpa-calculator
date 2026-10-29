/**
 * UNILAG Official Grading System
 * Source: NUC-aligned University of Lagos academic policy
 *
 * THIS IS THE SINGLE SOURCE OF TRUTH for grade points and degree classes.
 * Update only here if rules change. Never hardcode grade points elsewhere.
 */

export const GRADE_SCALE = [
  { grade: 'A', minScore: 70, maxScore: 100, points: 5, description: 'Excellent' },
  { grade: 'B', minScore: 60, maxScore: 69,  points: 4, description: 'Very Good' },
  { grade: 'C', minScore: 50, maxScore: 59,  points: 3, description: 'Good'      },
  { grade: 'D', minScore: 45, maxScore: 49,  points: 2, description: 'Fair'      },
  { grade: 'E', minScore: 40, maxScore: 44,  points: 1, description: 'Pass'      },
  { grade: 'F', minScore: 0,  maxScore: 39,  points: 0, description: 'Fail'      },
];

export const DEGREE_CLASSES = [
  { label: 'First Class Honours',              min: 4.50, max: 5.00, colorKey: 'first'  },
  { label: 'Second Class Honours (Upper)',     min: 3.50, max: 4.49, colorKey: 'upper'  },
  { label: 'Second Class Honours (Lower)',     min: 2.40, max: 3.49, colorKey: 'lower'  },
  { label: 'Third Class Honours',             min: 1.50, max: 2.39, colorKey: 'third'  },
  { label: 'Pass',                             min: 1.00, max: 1.49, colorKey: 'pass'   },
  { label: 'Fail',                             min: 0.00, max: 0.99, colorKey: 'fail'   },
];

/**
 * Academic sessions list for the session dropdown.
 * Format: "YYYY/YYYY"
 */
export const ACADEMIC_SESSIONS = Array.from({ length: 17 }, (_, i) => {
  const start = 2015 + i;
  return `${start}/${start + 1}`;
});

export const SEMESTER_NAMES = ['1st Semester', '2nd Semester'];

