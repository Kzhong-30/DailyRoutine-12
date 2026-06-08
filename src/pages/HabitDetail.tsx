import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deleteHabit } from '../utils/storage';
import { useHabitData } from '../hooks/useHabitData';
import { Heatmap } from '../components/Heatmap';

export const HabitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { habits, isLoaded, getStats, updateRecord, removeRecord, getYearlyDataForHabit } = useHabitData();

  const habit = habits.find(h => h.id === id);
  const stats = habit ? getStats(habit.id) : null;
  const yearlyData = useMemo(() =>
    habit ? getYearlyDataForHabit(habit.id, habit.dailyTarget) : new Map(),
    [habit, getYearlyDataForHabit]
  );

  useEffect(() => {
    if (!id || !isLoaded) return;
    const exists = habits.some(h => h.id === id);
    if (!exists) {
      navigate('/');
    }
  }, [id, navigate, habits, isLoaded]);

  const handleDelete = () => {
    if (habit && confirm('确定要删除这个习惯吗？所有打卡记录也会被删除。')) {
      deleteHabit(habit.id);
      navigate('/');
    }
  };

  if (!habit || !stats) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: habit.color + '20' }}
                >
                  {habit.icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{habit.name}</h1>
                  <p className="text-gray-500">每日目标: {habit.dailyTarget}次</p>
                  {habit.reminderTime && (
                    <p className="text-sm text-blue-500 mt-1">⏰ 提醒时间: {habit.reminderTime}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                删除
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold" style={{ color: habit.color }}>
                  {stats.currentStreak}
                </p>
                <p className="text-sm text-gray-500 mt-1">当前连续</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-orange-500">{stats.bestStreak}</p>
                <p className="text-sm text-gray-500 mt-1">最佳连续</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-gray-700">{stats.totalCheckIns}</p>
                <p className="text-sm text-gray-500 mt-1">总打卡数</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-blue-600">{stats.monthlyRate}%</p>
                <p className="text-sm text-gray-500 mt-1">本月完成率</p>
              </div>
            </div>
          </div>
        </div>

        <Heatmap
          habitId={habit.id}
          color={habit.color}
          dailyTarget={habit.dailyTarget}
          data={yearlyData}
          onUpdateRecord={updateRecord}
          onRemoveRecord={removeRecord}
        />
      </div>
    </div>
  );
};
