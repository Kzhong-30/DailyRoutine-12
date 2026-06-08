import { Habit } from '../types';
import { getRecords } from './storage';

export const exportToCSV = (habits: Habit[]): void => {
  const records = getRecords();
  
  let csv = 'Habit ID,Habit Name,Date,Count,Target\n';
  
  habits.forEach(habit => {
    const habitRecords = records.filter(r => r.habitId === habit.id);
    habitRecords.forEach(record => {
      csv += `"${habit.id}","${habit.name}","${record.date}",${record.count},${habit.dailyTarget}\n`;
    });
  });
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `habit-tracker-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
