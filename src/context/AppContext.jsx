import { createContext, useContext, useReducer, useEffect } from 'react';
import { saveData, loadData } from '../utils/storage';

const AppContext = createContext(null);

const initialState = {
  semesters: [],
};

function appReducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, semesters: action.payload.semesters };

    case 'ADD_SEMESTER':
      return { ...state, semesters: [...state.semesters, action.payload] };

    case 'UPDATE_SEMESTER':
      return {
        ...state,
        semesters: state.semesters.map(s =>
          s.id === action.payload.id
            ? { ...action.payload, updatedAt: new Date().toISOString() }
            : s
        ),
      };

    case 'DELETE_SEMESTER':
      return {
        ...state,
        semesters: state.semesters.filter(s => s.id !== action.payload.id),
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const saved = loadData();
    if (saved) {
      dispatch({ type: 'LOAD_DATA', payload: saved });
    }
  }, []);

  useEffect(() => {
    saveData({ semesters: state.semesters });
  }, [state.semesters]);

  function addSemester(semesterData) {
    const semester = {
      ...semesterData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_SEMESTER', payload: semester });
    return semester.id;
  }

  function updateSemester(semesterData) {
    dispatch({ type: 'UPDATE_SEMESTER', payload: semesterData });
  }

  function deleteSemester(semesterId) {
    dispatch({ type: 'DELETE_SEMESTER', payload: { id: semesterId } });
  }

  const value = {
    semesters: state.semesters,
    addSemester,
    updateSemester,
    deleteSemester,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside an AppProvider');
  }
  return context;
}

