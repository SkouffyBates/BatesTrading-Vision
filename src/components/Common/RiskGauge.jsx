import React from 'react';

/**
 * Risk Gauge Component
 * Displays macro risk sentiment with visual gauge
 */
const RiskGauge = ({ score }) => {
  const rotation = (score / 100) * 180 - 90;
  let label = 'NEUTRE';
  let colorClass = 'text-slate-300';
  let subText = 'Marché indécis. Prudence.';

  if (score < 30) {
    label = 'RISK OFF';
    colorClass = 'text-red-500';
    subText = 'Refuge vers USD, JPY, Gold.';
  } else if (score > 70) {
    label = 'RISK ON';
    colorClass = 'text-emerald-500';
    subText = 'Achat Indices, Crypto, AUD/NZD.';
  }

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Gauge */}
      <div className="w-64 h-32 overflow-hidden relative">
        {/* Base circle */}
        <div className="w-64 h-64 rounded-full bg-slate-700 border-4 border-slate-600 box-border absolute top-0 left-0"></div>

        {/* Color gradient arc */}
        <div
          className="w-64 h-64 rounded-full absolute top-0 left-0"
          style={{
            background: `conic-gradient(from 270deg, #ef4444 0deg 54deg, #fbbf24 54deg 126deg, #10b981 126deg 180deg, transparent 180deg)`,
          }}
        ></div>

        {/* Needle */}
        <div
          className="w-1 h-32 bg-white absolute left-1/2 bottom-0 origin-bottom transition-transform duration-1000 ease-out z-10"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
          <div className="w-4 h-4 bg-white rounded-full absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 shadow-lg"></div>
        </div>

        {/* Center cover */}
        <div className="w-48 h-24 bg-slate-800 rounded-t-full absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end justify-center pb-2 z-0"></div>
      </div>

      {/* Labels */}
      <div className="mt-4 text-center">
        <h2 className={`text-3xl font-black ${colorClass}`}>
          {score.toFixed(0)}
        </h2>
        <h3 className={`text-xl font-bold ${colorClass}`}>{label}</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">{subText}</p>
      </div>
    </div>
  );
};

export default RiskGauge;