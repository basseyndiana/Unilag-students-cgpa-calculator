import { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { saveData, loadData } from '../utils/storage';
import { useAuth } from './AuthContext';
import {
  fetchUserSemesters,
  upsertSemesterInSupabase,
  deleteSemesterFromSupabase,
  autoMigrateLocalData,
} from '../utils/supabaseSync';

const AppContext = createContext(null);

const initialState = {
  semesters: [],
};

function appReducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, semesters: action.payload.semesters || [] };

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
  const { user, loading: authLoading } = useAuth();
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [dataLoading, setDataLoading] = useState(true);
  const [migratedNotice, setMigratedNotice] = useState(0);

  // Sync state whenever auth changes
  useEffect(() => {
    if (authLoading) return;

    let isMounted = true;

    async function syncData() {
      setDataLoading(true);

      if (user) {
        try {
          // Check for and auto-migrate any unauthenticated local data
          const migratedCount = await autoMigrateLocalData(user.id);
          if (migratedCount > 0 && isMounted) {
            setMigratedNotice(migratedCount);
          }

          // Fetch user's cloud semesters from Supabase
          const cloudSemesters = await fetchUserSemesters(user.id);
          if (isMounted) {
            dispatch({ type: 'LOAD_DATA', payload: { semesters: cloudSemesters } });
          }
        } catch (err) {
          console.error('[AppContext] Failed to load data from Supabase:', err);
          // Fallback to local storage if cloud fetch fails
          const saved = loadData();
          if (saved && isMounted) {
            dispatch({ type: 'LOAD_DATA', payload: saved });
          }
        }
      } else {
        // Guest mode: load directly from localStorage
        const saved = loadData();
        if (saved && isMounted) {
          dispatch({ type: 'LOAD_DATA', payload: saved });
        } else if (isMounted) {
          dispatch({ type: 'LOAD_DATA', payload: { semesters: [] } });
        }
      }

      if (isMounted) {
        setDataLoading(false);
      }
    }

    syncData();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  // Persist guest data to localStorage when logged out
  useEffect(() => {
    if (!authLoading && !user) {
      saveData({ semesters: state.semesters });
    }
  }, [state.semesters, user, authLoading]);

  const addSemester = useCallback(async (semesterData) => {
    const semester = {
      ...semesterData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistically update React state
    dispatch({ type: 'ADD_SEMESTER', payload: semester });

    if (user) {
      try {
        await upsertSemesterInSupabase(user.id, semester);
      } catch (err) {
        console.error('[AppContext] Error saving new semester to Supabase:', err);
      }
    }

    return semester.id;
  }, [user]);

  const updateSemester = useCallback(async (semesterData) => {
    const updated = {
      ...semesterData,
      updatedAt: new Date().toISOString(),
    };

    // Optimistically update React state
    dispatch({ type: 'UPDATE_SEMESTER', payload: updated });

    if (user) {
      try {
        await upsertSemesterInSupabase(user.id, updated);
      } catch (err) {
        console.error('[AppContext] Error updating semester in Supabase:', err);
      }
    }
  }, [user]);

  const deleteSemester = useCallback(async (semesterId) => {
    // Optimistically update React state
    dispatch({ type: 'DELETE_SEMESTER', payload: { id: semesterId } });

    if (user) {
      try {
        await deleteSemesterFromSupabase(user.id, semesterId);
      } catch (err) {
        console.error('[AppContext] Error deleting semester from Supabase:', err);
      }
    }
  }, [user]);

  const clearMigratedNotice = useCallback(() => {
    setMigratedNotice(0);
  }, []);

  const value = {
    semesters: state.semesters,
    addSemester,
    updateSemester,
    deleteSemester,
    dataLoading: authLoading || dataLoading,
    migratedNotice,
    clearMigratedNotice,
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
