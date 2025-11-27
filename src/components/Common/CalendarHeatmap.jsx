import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

/**
 * Calendar Heatmap Component
 * Shows daily P&L in a calendar format with clickable trades
 */
const CalendarHeatmap = ({ trades, onTradeSelect }) => {
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

  const getDailyData = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const tradesThisDay = trades.filter(
      (t) => (t.close_date || t.closeDate || t.open_date || t.openDate) === dateStr
    );

    if (tradesThisDay.length === 0) return { pnl: null, trades: [] };
    const pnl = tradesThisDay.reduce((acc, t) => acc + parseFloat(t.pnl), 0);
    return { pnl, trades: tradesThisDay };
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

  const [hoveredDay, setHoveredDay] = useState(null);
  const [showTooltip, setShowTooltip] = useState(null);

  return (
    <div className="dashboard-section">
      <div className="flex justify-between items-center mb-6">
        <h3 className="section-title flex items-center gap-2">
          <Calendar className="text-cyan-400" size={20} /> Calendrier P&L
        </h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-lg w-40 text-center text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-slate-500 text-xs font-bold uppercase tracking-wide">
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
          const { pnl, trades: dayTrades } = getDailyData(day);
          let bgColor = 'bg-slate-800/40';
          let textColor = 'text-slate-400';
          let borderClass = '';
          let cursor = '';

          if (pnl !== null) {
            if (pnl > 0) {
              bgColor = 'bg-emerald-500/15';
              borderClass = 'border border-emerald-500/50';
              textColor = 'text-emerald-400';
              cursor = dayTrades.length > 0 ? 'cursor-pointer hover:bg-emerald-500/25' : '';
            } else if (pnl < 0) {
              bgColor = 'bg-red-500/15';
              borderClass = 'border border-red-500/50';
              textColor = 'text-red-400';
              cursor = dayTrades.length > 0 ? 'cursor-pointer hover:bg-red-500/25' : '';
            } else {
              bgColor = 'bg-slate-700/30';
              textColor = 'text-slate-300';
              cursor = dayTrades.length > 0 ? 'cursor-pointer hover:bg-slate-700/50' : '';
            }
          }

          return (
            <div
              key={day}
              className={`h-24 rounded-lg p-2 flex flex-col justify-between transition-all ${bgColor} ${borderClass} ${cursor}`}
              onMouseEnter={() => dayTrades.length > 0 && (setHoveredDay(day), setShowTooltip(day))}
              onMouseLeave={() => setShowTooltip(null)}
              onClick={() => dayTrades.length > 0 && onTradeSelect && onTradeSelect(dayTrades[0])}
            >
              <span className="text-xs font-bold text-slate-500">{day}</span>
              {pnl !== null && (
                <div className="flex flex-col gap-1">
                  <span className={`text-sm font-bold ${textColor}`}>
                    {pnl > 0 ? '+' : ''}
                    {pnl.toFixed(2)}$
                  </span>
                  {dayTrades.length > 0 && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      {dayTrades.length} trade{dayTrades.length > 1 ? 's' : ''}
                      <ExternalLink size={12} />
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarHeatmap;