import { SynapticStreakData } from '../types';

const STORAGE_KEY = 'kintsugi_synaptic_streak';

export const getTodayDateString = (offsetDays = 0): string => {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getStoredStreak = (): SynapticStreakData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return validateStreakFreshness(parsed);
    }
  } catch (e) {
    console.warn('Failed to load streak data:', e);
  }

  // Initial default seeded streak (shows vibrant gold-lacquer streak on initial boot)
  const today = getTodayDateString();
  const yesterday = getTodayDateString(-1);
  const twoDaysAgo = getTodayDateString(-2);

  const initial: SynapticStreakData = {
    currentStreak: 3,
    bestStreak: 7,
    lastSessionDate: today,
    historyDates: [twoDaysAgo, yesterday, today],
    totalSessionsCompleted: 12,
  };

  saveStoredStreak(initial);
  return initial;
};

export const saveStoredStreak = (streak: SynapticStreakData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(streak));
    // Asynchronously sync with server
    fetch('/api/streak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ streak }),
    }).catch(() => {});
  } catch (e) {
    console.warn('Failed to save streak data:', e);
  }
};

/**
 * Validates if the streak was broken because more than 1 calendar day elapsed since the last session.
 */
export const validateStreakFreshness = (streak: SynapticStreakData): SynapticStreakData => {
  const today = getTodayDateString();
  const yesterday = getTodayDateString(-1);

  if (!streak.lastSessionDate) {
    return {
      ...streak,
      currentStreak: 0,
    };
  }

  // If last session was today or yesterday, streak is alive!
  if (streak.lastSessionDate === today || streak.lastSessionDate === yesterday) {
    return streak;
  }

  // Otherwise, streak broke because a full day was skipped
  const updated: SynapticStreakData = {
    ...streak,
    currentStreak: 0,
  };
  saveStoredStreak(updated);
  return updated;
};

/**
 * Records that a retrieval session was completed. Updates streak counter and persists to storage.
 */
export const recordSessionInStreak = (
  prevStreak: SynapticStreakData,
  currentDateOverride?: string
): { updatedStreak: SynapticStreakData; isNewDayStreak: boolean } => {
  const today = currentDateOverride || getTodayDateString();
  const yesterday = getTodayDateString(-1);

  const historySet = new Set(prevStreak.historyDates || []);
  const alreadyCompletedToday = historySet.has(today);

  let newCurrentStreak = prevStreak.currentStreak;
  let isNewDayStreak = false;

  if (!alreadyCompletedToday) {
    // If last session was yesterday, increment streak
    if (prevStreak.lastSessionDate === yesterday || prevStreak.currentStreak === 0) {
      newCurrentStreak = prevStreak.currentStreak + 1;
      isNewDayStreak = true;
    } else if (prevStreak.lastSessionDate === today) {
      // already today
      newCurrentStreak = Math.max(1, prevStreak.currentStreak);
    } else {
      // More than 1 day lapsed
      newCurrentStreak = 1;
      isNewDayStreak = true;
    }
  }

  historySet.add(today);
  const updatedHistory = Array.from(historySet).sort();
  const newBestStreak = Math.max(prevStreak.bestStreak, newCurrentStreak);

  const updatedStreak: SynapticStreakData = {
    currentStreak: newCurrentStreak,
    bestStreak: newBestStreak,
    lastSessionDate: today,
    historyDates: updatedHistory,
    totalSessionsCompleted: prevStreak.totalSessionsCompleted + 1,
  };

  saveStoredStreak(updatedStreak);
  return { updatedStreak, isNewDayStreak };
};

/**
 * Simulation helper to test streak increments or resets
 */
export const simulateStreakDayIncrement = (prevStreak: SynapticStreakData): SynapticStreakData => {
  const newStreak = prevStreak.currentStreak + 1;
  const today = getTodayDateString();
  const historySet = new Set(prevStreak.historyDates || []);
  historySet.add(today);

  const updated: SynapticStreakData = {
    currentStreak: newStreak,
    bestStreak: Math.max(prevStreak.bestStreak, newStreak),
    lastSessionDate: today,
    historyDates: Array.from(historySet).sort(),
    totalSessionsCompleted: prevStreak.totalSessionsCompleted + 1,
  };

  saveStoredStreak(updated);
  return updated;
};

export const resetStreakForDemo = (): SynapticStreakData => {
  const today = getTodayDateString();
  const initial: SynapticStreakData = {
    currentStreak: 1,
    bestStreak: 7,
    lastSessionDate: today,
    historyDates: [today],
    totalSessionsCompleted: 1,
  };
  saveStoredStreak(initial);
  return initial;
};

/**
 * Returns streak tier information for gold-lacquer aesthetic display
 */
export const getStreakTier = (streakCount: number) => {
  if (streakCount >= 30) {
    return {
      title: 'Grand Kintsugi Luminary',
      badge: '30+ Master',
      colorClass: 'text-amber-300',
      glowColor: '#fbbf24',
      description: 'Permanent synaptic consolidation with impenetrable golden seams.',
    };
  }
  if (streakCount >= 14) {
    return {
      title: 'Golden Lacquer Alchemist',
      badge: 'Fortnight Seam',
      colorClass: 'text-amber-400',
      glowColor: '#f59e0b',
      description: 'Deep Bayesian resistance against forgetting cliffs.',
    };
  }
  if (streakCount >= 7) {
    return {
      title: 'Synaptic Vessel Craftsman',
      badge: '7-Day Seam',
      colorClass: 'text-amber-400',
      glowColor: '#d97706',
      description: 'Active memory bridges consistently reinforced against power-law decay.',
    };
  }
  if (streakCount >= 3) {
    return {
      title: 'Gold Seam Initiate',
      badge: '3-Day Seam',
      colorClass: 'text-amber-400',
      glowColor: '#b45309',
      description: 'Consecutive active retrieval consolidating early synaptic fragility.',
    };
  }
  return {
    title: 'Novice Repairer',
    badge: '1-Day Seam',
    colorClass: 'text-stone-300',
    glowColor: '#78716c',
    description: 'Begin daily retrieval sessions to weave continuous golden seams.',
  };
};

/**
 * Generates the last 7 calendar days array with completed status
 */
export const getLast7DaysStatus = (historyDates: string[]) => {
  const historySet = new Set(historyDates || []);
  const today = getTodayDateString();
  const days = [];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    days.push({
      dateStr,
      dayName: dayNames[d.getDay()],
      dayNumber: d.getDate(),
      isToday: dateStr === today,
      isCompleted: historySet.has(dateStr),
    });
  }

  return days;
};
