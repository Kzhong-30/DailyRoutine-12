import { useNavigate } from 'react-router-dom';
import { Habit, HabitStats } from '../types';
import { checkIn, cancelCheckIn, formatDate } from '../utils/storage';

interface HabitCardProps {
  habit: Habit;
  stats: HabitStats;
  todayChecked: boolean;
}

export const HabitCard = ({ habit, stats, todayChecked }: HabitCardProps) => {
  const navigate = useNavigate();

  const handleQuickCheckIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = formatDate(new Date());
    if (todayChecked) {
      cancelCheckIn(habit.id, today);
    } else {
      checkIn(habit.id, today, habit.dailyTarget);
    }
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200"
      onClick={() => navigate(`/habit/${habit.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: habit.color + '20' }}
          >
            {habit.icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{habit.name}</h3>
            <p className="text-sm text-gray-500">每日目标: {habit.dailyTarget}次</p>
          </div>
        </div>
        <button
          onClick={handleQuickCheckIn}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            todayChecked
              ? 'bg-green-500 text-white shadow-lg shadow-green-200'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <p className="text-2xl font-bold" style={{ color: habit.color }}>
            {stats.currentStreak}
          </p>
          <p className="text-xs text-gray-500">连续天数</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <p className="text-2xl font-bold text-gray-700">{stats.totalCheckIns}</p>
          <p className="text-xs text-gray-500">总打卡</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <p className="text-2xl font-bold text-blue-600">{stats.monthlyRate}%</p>
          <p className="text-xs text-gray-500">本月完成</p>
        </div>
      </div>
    </div>
  );
};
