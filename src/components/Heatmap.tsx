import { useState } from 'react';
import { checkIn, cancelCheckIn } from '../utils/storage';

interface HeatmapProps {
  habitId: string;
  color: string;
  dailyTarget: number;
  data: Map<string, number>;
  onUpdate: () => void;
}

export const Heatmap = ({ habitId, color, dailyTarget, data, onUpdate }: HeatmapProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const today = new Date();
  const year = today.getFullYear();
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const startDay = startDate.getDay();
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const weeks: (string | null)[][] = [];
  let currentWeek: (string | null)[] = Array(startDay).fill(null);

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    currentWeek.push(dateStr);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  const getColor = (level: number): string => {
    if (level === 0) return '#ebedf0';
    const opacity = [0.3, 0.5, 0.7, 1][Math.min(level - 1, 3)];
    return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
  };

  const handleDateClick = (dateStr: string | null) => {
    if (!dateStr) return;
    const level = data.get(dateStr) || 0;
    setSelectedDate(dateStr);
    setSelectedCount(level * dailyTarget);
    setShowModal(true);
  };

  const handleSave = () => {
    if (selectedDate) {
      if (selectedCount > 0) {
        checkIn(habitId, selectedDate, selectedCount);
      } else {
        cancelCheckIn(habitId, selectedDate);
      }
      onUpdate();
      setShowModal(false);
    }
  };

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const monthPositions = months.map((_, i) => {
    const firstDay = new Date(year, i, 1);
    const daysFromStart = Math.ceil((firstDay.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.floor((daysFromStart + startDay) / 7);
  });

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 overflow-x-auto">
      <h3 className="font-bold text-gray-800 mb-4">{year} 年度热力图</h3>
      
      <div className="flex gap-1 mb-2 text-xs text-gray-400 ml-8">
        {months.map((month, i) => (
          <div
            key={month}
            className="text-center"
            style={{
              width: `${((monthPositions[i + 1] || weeks.length) - monthPositions[i]) * 14}px`,
              minWidth: '40px'
            }}
          >
            {month}
          </div>
        ))}
      </div>

      <div className="flex gap-1">
        <div className="flex flex-col gap-1 text-xs text-gray-400 mr-2">
          <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
        </div>
        <div className="flex gap-0.5">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-0.5">
              {week.map((dateStr, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all ${
                    dateStr ? '' : 'bg-transparent'
                  }`}
                  style={{ backgroundColor: dateStr ? getColor(data.get(dateStr) || 0) : undefined }}
                  onClick={() => handleDateClick(dateStr)}
                  title={dateStr || ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
        <span>少</span>
        {[0, 1, 2, 3, 4].map(level => (
          <div
            key={level}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: getColor(level) }}
          />
        ))}
        <span>多</span>
      </div>

      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl">
            <h4 className="font-bold text-lg text-gray-800 mb-4">编辑打卡记录</h4>
            <p className="text-gray-600 mb-4">{selectedDate}</p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                完成次数 (目标: {dailyTarget}次)
              </label>
              <input
                type="number"
                min="0"
                value={selectedCount}
                onChange={(e) => setSelectedCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
