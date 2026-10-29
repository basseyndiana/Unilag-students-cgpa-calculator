/**
 * Persistence Layer — localStorage
 *
 * This module is the ONLY place that reads/writes localStorage.
 * Isolating it here means we can later replace it with API calls
 * without touching any UI component.
 */

const STORAGE_KEY = 'unilag_cgpa_v1';

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('[storage] Could not save data:', error);
  }
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.semesters)) return null;
    return parsed;
  } catch (error) {
    console.error('[storage] Stored data was unreadable, resetting:', error);
    return null;
  }
}

export function clearData() {
  localStorage.removeItem(STORAGE_KEY);
}

