import { Habit, CheckInRecord } from '../types';
import { notifyDataChanged } from './eventBus';

const HABITS_KEY = 'habit_tracker_habits';
const RECORDS_KEY = 'habit_tracker_records';

export const getHabits = (): Habit[] => {
  const data = localStorage.getItem(HABITS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveHabits = (habits: Habit[]): void => {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  notifyDataChanged();
};

export const addHabit = (habit: Habit): void => {
  const habits = getHabits();
  habits.push(habit);
  saveHabits(habits);
};

export const updateHabit = (habit: Habit): void => {
  const habits = getHabits();
  const index = habits.findIndex(h => h.id === habit.id);
  if (index !== -1) {
    habits[index] = habit;
    saveHabits(habits);
  }
};

export const deleteHabit = (habitId: string): void => {
  const habits = getHabits().filter(h => h.id !== habitId);
  saveHabits(habits);
  const records = getRecords().filter(r => r.habitId !== habitId);
  saveRecords(records);
};

export const getRecords = (): CheckInRecord[] => {
  const data = localStorage.getItem(RECORDS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveRecords = (records: CheckInRecord[]): void => {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  notifyDataChanged();
};

export const getRecord = (habitId: string, date: string): CheckInRecord | undefined => {
  return getRecords().find(r => r.habitId === habitId && r.date === date);
};

export const checkIn = (habitId: string, date: string, count: number = 1): void => {
  const records = getRecords();
  const existing = records.findIndex(r => r.habitId === habitId && r.date === date);
  if (existing !== -1) {
    records[existing].count = count;
  } else {
    records.push({ habitId, date, count });
  }
  saveRecords(records);
};

export const cancelCheckIn = (habitId: string, date: string): void => {
  const records = getRecords().filter(r => !(r.habitId === habitId && r.date === date));
  saveRecords(records);
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
