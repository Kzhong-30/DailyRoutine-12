import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useHabitData } from '../hooks/useHabitData';
import { getMonthlyRates } from '../utils/statistics';
import { exportToCSV } from '../utils/csv';

export const Statistics = () => {
  const { habits, getStats, notifyDataChanged } = useHabitData();

  const monthlyRates = useMemo(() => getMonthlyRates(habits), [habits]);
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  const leaderboard = useMemo(() => habits
    .map(habit => {
      const stats = getStats(habit.id);
      if (!stats) return null;
      return { habit, stats };
    })
    .filter((item): item is { habit: typeof habits[0]; stats: NonNullable<ReturnType<typeof getStats>> } => item !== null)
    .sort((a, b) => b.stats.bestStreak - a.stats.bestStreak), [habits, getStats]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">数据统计</h1>
            <p className="text-gray-500">查看你的习惯养成进度</p>
          </div>
          <button
            onClick={() => {
              exportToCSV(habits);
              notifyDataChanged();
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            导出 CSV
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">月度完成率趋势</h2>
          {habits.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRates}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
                  <Tooltip formatter={(value: number) => [`${value}%`, '']} />
                  <Legend />
                  {habits.map((habit, index) => (
                    <Line
                      key={habit.id}
                      type="monotone"
                      dataKey={habit.name}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              添加习惯后查看趋势图
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">🏆 最佳连续记录排行榜</h2>
          {leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((item, index) => (
                <div
                  key={item.habit.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0
                        ? 'bg-yellow-100 text-yellow-600'
                        : index === 1
                        ? 'bg-gray-200 text-gray-600'
                        : index === 2
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: item.habit.color + '20' }}
                  >
                    {item.habit.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{item.habit.name}</h3>
                    <p className="text-sm text-gray-500">当前连续 {item.stats.currentStreak} 天</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: item.habit.color }}>
                      {item.stats.bestStreak}
                    </p>
                    <p className="text-xs text-gray-500">最佳连续天数</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              添加习惯后查看排行榜
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
