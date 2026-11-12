/**
 * Day Notes Persistence
 * Stores daily intentions and notes for specific calendar dates.
 */

const STORAGE_KEY = 'chronopaper_day_notes_v1';

export function getDayNotesMap(): Record<string, string> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getDayNote(date: string): string {
  const map = getDayNotesMap();
  return map[date] || '';
}

export function saveDayNote(date: string, note: string): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    const map = getDayNotesMap();
    if (note.trim()) {
      map[date] = note;
    } else {
      delete map[date];
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota errors
  }
}
