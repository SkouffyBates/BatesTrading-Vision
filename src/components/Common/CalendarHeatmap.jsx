import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Calendar Heatmap Component
 * Shows daily P&L in a calendar format
 */
const CalendarHeatmap = ({ trades }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDay }, (_, i) => i);

  const getDailyPnl = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const tradesThisDay = trades.filter(
      (t) => (t.closeDate || t.openDate) === dateStr
    );

    if (tradesThisDay.length === 0) return null;
    return tradesThisDay.reduce((acc, t) => acc + parseFloat(t.pnl), 0);
  };

  const changeMonth = (offset) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)
    );
  };

  const monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  return (
    <div className="u-card p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="text-cyan-400" size={20} /> Calendrier P&L
        </h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-lg w-32 text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-slate-500 text-sm font-bold">
        <div>LUN</div>
        <div>MAR</div>
        <div>MER</div>
        <div>JEU</div>
        <div>VEN</div>
        <div>SAM</div>
        <div>DIM</div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for alignment */}
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="h-24 bg-transparent"></div>
        ))}

        {/* Days with P&L */}
        {days.map((day) => {
          const pnl = getDailyPnl(day);
          let bgColor = 'bg-slate-700/30';
          let textColor = 'text-slate-400';

          if (pnl !== null) {
            if (pnl > 0) {
              bgColor = 'bg-emerald-500/20 border border-emerald-500/50';
              textColor = 'text-emerald-400';
            } else if (pnl < 0) {
              bgColor = 'bg-red-500/20 border border-red-500/50';
              textColor = 'text-red-400';
            } else {
              bgColor = 'bg-slate-600/50';
              textColor = 'text-slate-300';
            }
          }

          return (
            <div
              key={day}
              className={`h-24 rounded-lg p-2 flex flex-col justify-between transition-all hover:brightness-110 ${bgColor}`}
            >
              <span className="text-xs font-bold text-slate-500">{day}</span>
              {pnl !== null && (
                <span className={`text-sm font-bold ${textColor}`}>
                  {pnl > 0 ? '+' : ''}
                  {pnl.toFixed(2)}$
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarHeatmap;