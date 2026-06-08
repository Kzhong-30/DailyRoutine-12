import { useState } from 'react';
import { useHabitData } from '../hooks/useHabitData';
import { notifyDataChanged } from '../utils/eventBus';
import { HabitCard } from '../components/HabitCard';
import { AddHabitModal } from '../components/AddHabitModal';

export const Home = () => {
  const { habits, getStats, isTodayChecked } = useHabitData();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">我的习惯</h1>
          <p className="text-gray-500">坚持每一天，遇见更好的自己</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {habits.map(habit => {
            const stats = getStats(habit.id);
            if (!stats) return null;
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                stats={stats}
                todayChecked={isTodayChecked(habit.id)}
                onUpdate={notifyDataChanged}
              />
            );
          })}

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white rounded-2xl shadow-md p-6 border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 flex flex-col items-center justify-center min-h-[200px]"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-gray-500 font-medium">添加新习惯</span>
          </button>
        </div>

        {habits.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">开始你的习惯之旅</h3>
            <p className="text-gray-500">点击上方按钮添加你的第一个习惯</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddHabitModal
          onClose={() => setShowAddModal(false)}
          onAdd={notifyDataChanged}
        />
      )}
    </div>
  );
};
