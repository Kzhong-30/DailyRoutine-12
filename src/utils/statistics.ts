import { Habit, HabitStats } from '../types';
import { getRecords, formatDate } from './storage';

export const getHabitStats = (habitId: string, dailyTarget: number): HabitStats => {
  const records = getRecords().filter(r => r.habitId === habitId);
  const today = new Date();
  
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  
  const sortedDates = records
    .filter(r => r.count >= dailyTarget)
    .map(r => r.date)
    .sort();
  
  if (sortedDates.length > 0) {
    let checkDate = new Date(today);
    while (true) {
      const dateStr = formatDate(checkDate);
      if (sortedDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      bestStreak = Math.max(bestStreak, tempStreak);
    }
  }
  
  const totalCheckIns = records.reduce((sum, r) => sum + r.count, 0);
  
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let completedDays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = records.find(r => r.date === dateStr);
    if (record && record.count >= dailyTarget) {
      completedDays++;
    }
  }
  const monthlyRate = Math.round((completedDays / daysInMonth) * 100);
  
  return { currentStreak, bestStreak, totalCheckIns, monthlyRate };
};

export const getYearlyData = (habitId: string, dailyTarget: number): Map<string, number> => {
  const records = getRecords().filter(r => r.habitId === habitId);
  const data = new Map<string, number>();
  
  records.forEach(r => {
    const level = r.count >= dailyTarget ? Math.min(4, Math.ceil(r.count / dailyTarget)) : 0;
    data.set(r.date, level);
  });
  
  return data;
};

export const getMonthlyRates = (habits: Habit[]): { month: string; [key: string]: number | string }[] => {
  const result: { month: string; [key: string]: number | string }[] = [];
  const today = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    const monthData: { month: string; [key: string]: number | string } = { month: monthKey };
    
    habits.forEach(habit => {
      const records = getRecords().filter(r => r.habitId === habit.id && r.date.startsWith(monthKey));
      let completedDays = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${monthKey}-${String(day).padStart(2, '0')}`;
        const record = records.find(r => r.date === dateStr);
        if (record && record.count >= habit.dailyTarget) {
          completedDays++;
        }
      }
      monthData[habit.name] = Math.round((completedDays / daysInMonth) * 100);
    });
    
    result.push(monthData);
  }
  
  return result;
};
