export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  dailyTarget: number;
  reminderTime?: string;
  createdAt: string;
}

export interface CheckInRecord {
  habitId: string;
  date: string;
  count: number;
}

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  totalCheckIns: number;
  monthlyRate: number;
}
