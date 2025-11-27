import React from 'react';

/**
 * Reusable Card component for displaying metrics
 */
export const Card = ({ title, value, subtext, icon: Icon, trend }) => {
  return (
    <div className="flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-sm font-semibold text-slate-400 uppercase">{title}</h4>
        {Icon && <Icon size={20} className="text-cyan-400" />}
      </div>
      <div>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
      </div>
      {trend && (
        <div className={`mt-2 text-xs font-semibold ${
          trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
        }`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trend}
        </div>
      )}
    </div>
  );
};

export default Card;
