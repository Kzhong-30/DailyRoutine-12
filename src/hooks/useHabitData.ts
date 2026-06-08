import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Habit, HabitStats, CheckInRecord } from '../types';
import { getHabits, getRecords, saveRecords } from '../utils/storage';
import { getHabitStats } from '../utils/statistics';
import { subscribeDataChanged } from '../utils/eventBus';

export const useHabitData = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [records, setRecords] = useState<CheckInRecord[]>(() => getRecords());
  const [isLoaded, setIsLoaded] = useState(false);
  const recordsRef = useRef(records);
  recordsRef.current = records;

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

  const toggleCheckIn = useCallback((habitId: string, date: string, dailyTarget: number) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const existing = records.find(r => r.habitId === habitId && r.date === date);
    const isChecked = existing && existing.count >= dailyTarget;

    let newRecords: CheckInRecord[];
    if (isChecked) {
      newRecords = records.filter(r => !(r.habitId === habitId && r.date === date));
    } else {
      const idx = records.findIndex(r => r.habitId === habitId && r.date === date);
      if (idx !== -1) {
        newRecords = [...records];
        newRecords[idx] = { ...newRecords[idx], count: dailyTarget };
      } else {
        newRecords = [...records, { habitId, date, count: dailyTarget }];
      }
    }

    setRecords(newRecords);
    saveRecords(newRecords);
  }, [habits, records]);

  const updateRecord = useCallback((habitId: string, date: string, count: number) => {
    const idx = recordsRef.current.findIndex(r => r.habitId === habitId && r.date === date);
    let newRecords: CheckInRecord[];
    if (idx !== -1) {
      newRecords = [...recordsRef.current];
      newRecords[idx] = { ...newRecords[idx], count };
    } else {
      newRecords = [...recordsRef.current, { habitId, date, count }];
    }
    setRecords(newRecords);
    saveRecords(newRecords);
  }, []);

  const removeRecord = useCallback((habitId: string, date: string) => {
    const newRecords = recordsRef.current.filter(r => !(r.habitId === habitId && r.date === date));
    setRecords(newRecords);
    saveRecords(newRecords);
  }, []);

  const getYearlyDataForHabit = useCallback((habitId: string, dailyTarget: number): Map<string, number> => {
    const habitRecords = records.filter(r => r.habitId === habitId);
    const data = new Map<string, number>();
    habitRecords.forEach(r => {
      const level = r.count >= dailyTarget ? Math.min(4, Math.ceil(r.count / dailyTarget)) : 0;
      data.set(r.date, level);
    });
    return data;
  }, [records]);

  return {
    habits,
    records,
    isLoaded,
    getStats,
    isTodayChecked,
    toggleCheckIn,
    updateRecord,
    removeRecord,
    getYearlyDataForHabit,
  };
};
