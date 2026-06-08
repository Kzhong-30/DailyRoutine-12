import { useState, useEffect, useCallback, useMemo } from 'react';
import { Habit, CheckInRecord, HabitStats } from '../types';
import { getHabits, getRecords } from '../utils/storage';
import { getHabitStats } from '../utils/statistics';
import { subscribeDataChanged } from '../utils/eventBus';

export const useHabitData = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshData = useCallback(() => {
    setHabits(getHabits());
    setRecords(getRecords());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refreshData();
    return subscribeDataChanged(refreshData);
  }, [refreshData]);

  const statsCache = useMemo(() => {
    const cache = new Map<string, HabitStats>();
    habits.forEach(habit => {
      cache.set(habit.id, getHabitStats(habit.id, habit.dailyTarget));
    });
    return cache;
  }, [habits, records]);

  const getStats = useCallback((habitId: string) => {
    return statsCache.get(habitId);
  }, [statsCache]);

  const isTodayChecked = useCallback((habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return false;
    const record = records.find(r => r.habitId === habitId && r.date === today);
    return !!record && record.count >= habit.dailyTarget;
  }, [habits, records]);

  return {
    habits,
    records,
    isLoaded,
    refreshData,
    getStats,
    isTodayChecked,
  };
};
