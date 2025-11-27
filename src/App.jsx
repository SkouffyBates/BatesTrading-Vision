import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  BarChart2, 
  Brain, 
  ScrollText, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  Briefcase,
  Globe
} from 'lucide-react';

// Import components
import Dashboard from './components/Dashboard/Dashboard';
import Journal from './components/Trading/Journal';
import Analysis from './components/Analysis/Analysis';
import Psychology from './components/Psychology/Psychology';
import TradingPlan from './components/TradingPlan/TradingPlan';
import MacroEdge from './components/MacroEdge/MacroEdge';
import Sidebar from './components/Sidebar/Sidebar';

// Import utilities
import {
  INITIAL_PLAN,
  INITIAL_ACCOUNTS,
  INITIAL_TRADES,
  INITIAL_MACRO_EVENTS,
  VIEWS
} from './utils/constants';
import {
  loadTrades,
  saveTrades,
  loadPlan,
  savePlan,
  loadAccounts,
  saveAccounts,
  loadMacroEvents,
  saveMacroEvents
} from './utils/storage';



const CalendarHeatmap = ({ trades }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); 
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDay }, (_, i) => i);

  const getDailyPnl = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const tradesThisDay = trades.filter(t => (t.closeDate || t.openDate) === dateStr);
    if (tradesThisDay.length === 0) return null;
    return tradesThisDay.reduce((acc, t) => acc + parseFloat(t.pnl), 0);
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  return (
    <div className="u-card p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <CalendarIcon className="text-cyan-400" size={20} /> Calendrier P&L
        </h3>
        <div className="flex items-center gap-4">
          <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-700 rounded"><ChevronLeft size={20}/></button>
          <span className="font-bold text-lg w-32 text-center">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
          <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-700 rounded"><ChevronRight size={20}/></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-slate-500 text-sm font-bold">
        <div>LUN</div><div>MAR</div><div>MER</div><div>JEU</div><div>VEN</div><div>SAM</div><div>DIM</div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {blanks.map((_, i) => <div key={`blank-${i}`} className="h-24 bg-transparent"></div>)}
        {days.map(day => {
          const pnl = getDailyPnl(day);
          let bgColor = "bg-slate-700/30";
          let textColor = "text-slate-400";
          if (pnl !== null) {
            if (pnl > 0) { bgColor = "bg-emerald-500/20 border border-emerald-500/50"; textColor = "text-emerald-400"; } 
            else if (pnl < 0) { bgColor = "bg-red-500/20 border border-red-500/50"; textColor = "text-red-400"; } 
            else { bgColor = "bg-slate-600/50"; textColor = "text-slate-300"; }
          }
          return (
            <div key={day} className={`h-24 rounded-lg p-2 flex flex-col justify-between transition-all hover:brightness-110 ${bgColor}`}>
              <span className="text-xs font-bold text-slate-500">{day}</span>
              {pnl !== null && (<span className={`text-sm font-bold ${textColor}`}>{pnl > 0 ? '+' : ''}{pnl}$</span>)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- MACRO EDGE (SENTIMENT) ---

const RiskGauge = ({ score }) => {
  const rotation = (score / 100) * 180 - 90;
  let label = "NEUTRE";
  let colorClass = "text-slate-300";
  let subText = "Marché indécis. Prudence.";

  if (score < 30) { label = "RISK OFF"; colorClass = "text-red-500"; subText = "Refuge vers USD, JPY, Gold."; } 
  else if (score > 70) { label = "RISK ON"; colorClass = "text-emerald-500"; subText = "Achat Indices, Crypto, AUD/NZD."; }

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="w-64 h-32 overflow-hidden relative">
        <div className="w-64 h-64 rounded-full bg-slate-700 border-4 border-slate-600 box-border absolute top-0 left-0"></div>
        <div className="w-64 h-64 rounded-full absolute top-0 left-0" style={{ background: `conic-gradient(from 270deg, #ef4444 0deg 54deg, #fbbf24 54deg 126deg, #10b981 126deg 180deg, transparent 180deg)` }}></div>
        <div className="w-1 h-32 bg-white absolute left-1/2 bottom-0 origin-bottom transition-transform duration-1000 ease-out z-10" style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}>
            <div className="w-4 h-4 bg-white rounded-full absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 shadow-lg"></div>
        </div>
        <div className="w-48 h-24 bg-slate-800 rounded-t-full absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end justify-center pb-2 z-0"></div>
      </div>
      <div className="mt-4 text-center">
          <h2 className={`text-3xl font-black ${colorClass}`}>{score.toFixed(0)}</h2>
          <h3 className={`text-xl font-bold ${colorClass}`}>{label}</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">{subText}</p>
      </div>
    </div>
  );
};

const MacroEdge = ({ events, setEvents }) => {
    const [newEvent, setNewEvent] = useState({ date: new Date().toISOString().split('T')[0], event: '', category: 'Employment', actual: '', forecast: '', previous: '', impact: 'High' });
    
    // --- RISK ENGINE ---
    const riskAnalysis = useMemo(() => {
        let score = 50;
        // Pondération par catégorie
        const weights = { Employment: 0.35, Inflation: 0.35, Growth: 0.15, Confidence: 0.05, 'Central Bank': 0.4 }; // Central Bank a un gros poids
        const sortedEvents = [...events].sort((a,b) => new Date(b.date) - new Date(a.date));
        const recentEvents = sortedEvents.slice(0, 12); // Analyse les 12 derniers événements

        recentEvents.forEach(e => {
            const actual = parseFloat(e.actual);
            const forecast = parseFloat(e.forecast);
            if(isNaN(actual) || isNaN(forecast)) return;
            
            let surprise = (actual - forecast) / (Math.abs(forecast) || 1); 
            // Cap surprise à 200% pour éviter de casser le score
            if(Math.abs(surprise) > 2) surprise = 2 * Math.sign(surprise);
            
            let directionalImpact = 0;
            
            // INFLATION (CPI, PPI, PCE)
            // Si Inflation > Forecast => Mauvais pour les actifs à risque (Crainte de hausse des taux) => Risk OFF
            if (e.category === 'Inflation') directionalImpact = surprise > 0 ? -1 : 1; 
            
            // EMPLOYMENT (NFP, Earnings)
            else if (e.category === 'Employment') {
                // Cas particulier : Unemployment Rate & Claims (Si ça monte, c'est mauvais pour l'économie, mais parfois bon pour la Fed pivot... restons classique : Chômage = Mauvais)
                if(e.event.includes('Unemployment') || e.event.includes('Jobless')) {
                    directionalImpact = surprise > 0 ? -1 : 1; 
                } else {
                    // NFP, Earnings : Si ça monte => Économie forte => Risk ON (swing context)
                    directionalImpact = surprise > 0 ? 1 : -1;
                }
            } 
            
            // GROWTH (GDP, Retail Sales, ISM) & CONFIDENCE
            else if (e.category === 'Growth' || e.category === 'Confidence') {
                directionalImpact = surprise > 0 ? 1 : -1;
            }

            // CENTRAL BANK (Rates)
            else if (e.category === 'Central Bank') {
                // Si Taux > Forecast => Hawkish => Risk OFF
                directionalImpact = surprise > 0 ? -1 : 1;
            }
            
            const impactWeight = e.impact === 'High' ? 1.5 : e.impact === 'Medium' ? 1 : 0.5;
            const categoryWeight = weights[e.category] || 0.1;
            
            // Formule : Direction * Surprise * Facteur * Importance
            score += directionalImpact * Math.abs(surprise) * 8 * impactWeight * categoryWeight;
        });
        
        score = Math.max(0, Math.min(100, score));
        return { score };
    }, [events]);

    const addEvent = (e) => { e.preventDefault(); setEvents([...events, { id: Date.now(), ...newEvent }]); setNewEvent({...newEvent, event: '', actual: '', forecast: '', previous: ''}); };
    const deleteEvent = (id) => { setEvents(events.filter(e => e.id !== id)); };
    const historyData = events.slice().sort((a,b) => new Date(a.date) - new Date(b.date)).map((e, i) => ({ name: e.date.substring(5), score: 50 + (i%2 === 0 ? 5 : -5) }));

    return (
        <div className="space-y-6 animate-in fade-in">
             <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Globe className="text-cyan-400" /> MacroEdge Pro 
                    <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded border border-cyan-500/40">Sentiment Analyzer</span>
                </h2>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* GAUGE */}
                 <div className="u-card p-6 rounded-xl flex flex-col items-center">
                     <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 w-full text-left">Sentiment Macro US</h3>
                     <RiskGauge score={riskAnalysis.score} />
                     <div className="w-full mt-6 u-card p-4 rounded-lg">
                         <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Zap size={14} className="text-yellow-400"/> Impact sur Trading</h4>
                         <ul className="text-sm space-y-2 text-slate-300">
                             {riskAnalysis.score > 60 ? ( 
                                 <> 
                                    <li className="flex items-center gap-2"><ArrowRight size={14} className="text-emerald-500"/> <strong>USD:</strong> Faible / Vente</li> 
                                    <li className="flex items-center gap-2"><ArrowRight size={14} className="text-emerald-500"/> <strong>Indices:</strong> Achat</li> 
                                 </> 
                             ) : riskAnalysis.score < 40 ? ( 
                                 <> 
                                    <li className="flex items-center gap-2"><ArrowRight size={14} className="text-red-500"/> <strong>USD:</strong> Fort (Safe Haven)</li> 
                                    <li className="flex items-center gap-2"><ArrowRight size={14} className="text-red-500"/> <strong>Indices:</strong> Pression baissière</li> 
                                 </> 
                             ) : ( <li className="text-yellow-500 italic">Marché en range.</li> )}
                         </ul>
                     </div>
                 </div>

                 {/* TABLEAU */}
                 <div className="lg:col-span-2 u-card p-6 rounded-xl flex flex-col">
                     <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Derniers Indicateurs</h3>
                     <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-slate-300 text-sm">
                            <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Event</th><th className="px-4 py-3">Actual</th><th className="px-4 py-3">Forecast</th><th className="px-4 py-3 text-center">Surprise</th><th className="px-4 py-3 text-center">Impact</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
                            <tbody className="divide-y divide-slate-700">{events.slice().reverse().map(e => {
                                const surprise = e.actual - e.forecast;
                                const isPositiveSurprise = surprise > 0;
                                let colorClass = "text-emerald-400";
                                // Logique couleur pour le tableau (simple visual feedback)
                                if(e.category === 'Inflation' || (e.category === 'Employment' && e.event.includes('Unemployment')) || e.category === 'Central Bank') {
                                    // Pour l'inflation, chomage et taux : Plus c'est haut, plus c'est "Rouge" (Risk Off generally)
                                    colorClass = isPositiveSurprise ? "text-red-400" : "text-emerald-400";
                                } else {
                                    // Pour la croissance : Plus c'est haut, mieux c'est
                                    colorClass = isPositiveSurprise ? "text-emerald-400" : "text-red-400";
                                }
                                return (
                                    <tr key={e.id} className="hover:bg-slate-700/30">
                                        <td className="px-4 py-3 whitespace-nowrap">{e.date}</td>
                                        <td className="px-4 py-3 font-medium text-white">{e.event}</td>
                                        <td className="px-4 py-3 font-mono">{e.actual}</td>
                                        <td className="px-4 py-3 font-mono text-slate-500">{e.forecast}</td>
                                        <td className={`px-4 py-3 text-center font-bold ${colorClass}`}>{surprise > 0 ? '+' : ''}{surprise.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-center"><span className={`text-xs px-2 py-1 rounded border ${e.impact === 'High' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`}>{e.impact}</span></td>
                                        <td className="px-4 py-3 text-right"><button onClick={() => deleteEvent(e.id)} className="text-slate-600 hover:text-red-400"><Trash2 size={14}/></button></td>
                                    </tr>
                                );
                            })}</tbody>
                        </table>
                     </div>
                 </div>
             </div>

             {/* FORMULAIRE & GRAPH */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="u-card p-6 rounded-xl">
                     <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Ajouter Donnée Éco</h3>
                     <form onSubmit={addEvent} className="space-y-3">
                         <div>
                             <label className="text-xs text-slate-500">Event</label>
                             <input type="text" list="macroEvents" required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm" value={newEvent.event} onChange={e => setNewEvent({...newEvent, event: e.target.value})} placeholder="Rechercher..." />
                             {/* LISTE EXHAUSTIVE DES INDICATEURS */}
                             <datalist id="macroEvents">
                                 {/* Inflation */}
                                 <option value="PPI m/m (Prix Producteurs)"/>
                                 <option value="Core PPI m/m"/>
                                 <option value="CPI m/m (Prix Conso)"/>
                                 <option value="CPI y/y"/>
                                 <option value="Core CPI m/m"/>
                                 <option value="Final GDP Price Index q/q"/>
                                 <option value="Core PCE Price Index m/m"/>
                                 <option value="ISM Manufacturing Prices"/>
                                 <option value="Prelim UoM Inflation Expectations"/>
                                 
                                 {/* Emploi */}
                                 <option value="Unemployment Claims"/>
                                 <option value="Unemployment Rate"/>
                                 <option value="JOLTS Job Openings"/>
                                 <option value="Non-Farm Employment Change (NFP)"/>
                                 <option value="Average Hourly Earnings m/m"/>
                                 
                                 {/* Croissance & Activité */}
                                 <option value="Core Retail Sales m/m"/>
                                 <option value="Retail Sales m/m"/>
                                 <option value="Flash Manufacturing PMI"/>
                                 <option value="Flash Services PMI"/>
                                 <option value="ISM Manufacturing PMI"/>
                                 <option value="ISM Services PMI"/>
                                 <option value="Final GDP q/q"/>
                                 <option value="Durable Goods Orders m/m"/>
                                 <option value="Core Durable Goods Orders m/m"/>
                                 
                                 {/* Confiance */}
                                 <option value="Prelim UoM Consumer Sentiment"/>
                                 <option value="CB Consumer Confidence"/>
                                 
                                 {/* Banque Centrale */}
                                 <option value="Federal Funds Rate"/>
                                 <option value="FOMC Economic Projections"/>
                                 <option value="FOMC Statement"/>
                                 <option value="FOMC Press Conference"/>
                             </datalist>
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                             <div><label className="text-xs text-slate-500">Date</label><input type="date" required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} /></div>
                             <div>
                                 <label className="text-xs text-slate-500">Catégorie</label>
                                 <select className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm" value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value})}>
                                     <option value="Inflation">Inflation (CPI/PPI)</option>
                                     <option value="Employment">Emploi (NFP/Jobs)</option>
                                     <option value="Growth">Croissance (GDP/ISM)</option>
                                     <option value="Confidence">Confiance (UoM/CB)</option>
                                     <option value="Central Bank">Banque Centrale (Fed)</option>
                                 </select>
                             </div>
                         </div>
                         <div className="grid grid-cols-3 gap-2"><div><label className="text-xs text-slate-500">Actual</label><input type="number" step="0.01" required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm font-mono" value={newEvent.actual} onChange={e => setNewEvent({...newEvent, actual: e.target.value})} placeholder="Act." /></div><div><label className="text-xs text-slate-500">Forecast</label><input type="number" step="0.01" required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm font-mono" value={newEvent.forecast} onChange={e => setNewEvent({...newEvent, forecast: e.target.value})} placeholder="Frcst" /></div><div><label className="text-xs text-slate-500">Previous</label><input type="number" step="0.01" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm font-mono" value={newEvent.previous} onChange={e => setNewEvent({...newEvent, previous: e.target.value})} placeholder="Prev" /></div></div>
                         <div><label className="text-xs text-slate-500">Impact</label><select className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm" value={newEvent.impact} onChange={e => setNewEvent({...newEvent, impact: e.target.value})}><option value="High">Haut (Rouge)</option><option value="Medium">Moyen (Orange)</option><option value="Low">Faible (Jaune)</option></select></div>
                         <button type="submit" className="w-full brutal-btn bg-gradient-to-r from-cyan-500/20 to-cyan-500/20 hover:from-cyan-500/30 hover:to-cyan-500/30 text-white font-bold py-2 rounded text-sm mt-2 flex items-center justify-center gap-2 border border-cyan-500/30 hover:border-cyan-500/50"><Plus size={16}/> Ajouter Donnée</button>
                     </form>
                 </div>
                 <div className="lg:col-span-2 u-card p-6 rounded-xl">
                     <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Historique Score Risk (12 Mois)</h3>
                     <div className="h-64 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={historyData}>
                                 <defs><linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                 <XAxis dataKey="name" stroke="#94a3b8" />
                                 <YAxis domain={[0, 100]} stroke="#94a3b8" />
                                 <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }} />
                                 <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="3 3" />
                                 <Area type="monotone" dataKey="score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" />
                             </AreaChart>
                         </ResponsiveContainer>
                     </div>
                 </div>
             </div>
        </div>
    );
};

// --- DASHBOARD PRINCIPAL ---

const Dashboard = ({ trades, accounts, currentAccountId }) => {
  const [timeFilter, setTimeFilter] = useState('all');
  
  const filteredTrades = useMemo(() => filterTradesByTime(trades, timeFilter), [trades, timeFilter]);
  
  const stats = useMemo(() => {
    const totalTrades = filteredTrades.length;
    const wins = filteredTrades.filter(t => t.pnl > 0).length;
    const losses = filteredTrades.filter(t => t.pnl <= 0).length;
    const winRate = totalTrades ? ((wins / totalTrades) * 100).toFixed(1) : 0;
    const totalPnL = filteredTrades.reduce((acc, curr) => acc + parseFloat(curr.pnl), 0);
    const grossProfit = filteredTrades.filter(t => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
    const grossLoss = Math.abs(filteredTrades.filter(t => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0));
    const profitFactor = grossLoss === 0 ? grossProfit : (grossProfit / grossLoss).toFixed(2);
    
    let startBalance = 0;
    if (currentAccountId !== 'all') { 
        const acc = accounts.find(a => a.id === currentAccountId); 
        startBalance = acc ? parseFloat(acc.balance) : 0; 
    } else { 
        startBalance = accounts.reduce((acc, curr) => acc + parseFloat(curr.balance), 0); 
    }
    
    let currentEquity = startBalance;
    const equityCurve = filteredTrades.map((t, index) => { 
        currentEquity += parseFloat(t.pnl); 
        return { name: `T${index + 1}`, equity: currentEquity }; 
    });
    
    if (equityCurve.length === 0) { equityCurve.push({ name: 'Début', equity: startBalance }); } 
    else { equityCurve.unshift({ name: 'Start', equity: startBalance }); }
    
    const allTimePnL = trades.reduce((acc, curr) => acc + parseFloat(curr.pnl), 0);
    const trueCurrentBalance = (currentAccountId === 'all' 
        ? accounts.reduce((acc, curr) => acc + parseFloat(curr.balance), 0) 
        : (accounts.find(a => a.id === currentAccountId)?.balance || 0)) + allTimePnL;
        
    return { winRate, totalPnL, profitFactor, totalTrades, equityCurve, wins, losses, trueCurrentBalance };
  }, [filteredTrades, trades, accounts, currentAccountId]);

  const pieData = [{ name: 'Gagnants', value: stats.wins }, { name: 'Perdants', value: stats.losses }];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
         <div>
             {currentAccountId !== 'all' && ( 
                 <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                     <Wallet className="text-emerald-400"/> Solde Actuel: {stats.trueCurrentBalance.toLocaleString()}
                 </h2> 
             )}
         </div>
         <div className="flex justify-end gap-2">
            <button onClick={() => setTimeFilter('month')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${timeFilter === 'month' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Ce Mois</button>
            <button onClick={() => setTimeFilter('year')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${timeFilter === 'year' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Cette Année</button>
            <button onClick={() => setTimeFilter('all')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${timeFilter === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Tout</button>
         </div>
      </div>
      
      <div className="dashboard-grid cols-4">
        <div className="stat-card glow-active"><Card title="P&L (Période)" value={`${stats.totalPnL > 0 ? '+' : ''}${stats.totalPnL.toFixed(2)}`} icon={TrendingUp} trend={stats.totalPnL >= 0 ? 'up' : 'down'} /></div>
        <div className="stat-card glow-active"><Card title="Win Rate" value={`${stats.winRate}%`} subtext={`${stats.wins}W - ${stats.losses}L`} icon={CheckCircle} trend={parseFloat(stats.winRate) > 50 ? 'up' : 'down'} /></div>
        <div className="stat-card glow-active"><Card title="Profit Factor" value={stats.profitFactor} subtext="Cible > 1.5" icon={BarChart2} trend="neutral" /></div>
        <div className="stat-card glow-active"><Card title="Trades" value={stats.totalTrades} subtext={timeFilter === 'all' ? 'Total' : timeFilter === 'month' ? 'Ce mois' : 'Cette année'} icon={BookOpen} trend="neutral" /></div>
      </div>
      
      <div className="divider-gradient"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 dashboard-section">
          <h3 className="section-title mb-6">Courbe de Capital (Equity Curve)</h3>
          <div className="chart-container h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.equityCurve}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" hide />
                      <YAxis stroke="rgba(255,255,255,0.4)" domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,13,0.95)', borderColor: 'rgba(255,255,255,0.1)', color: '#06b6d4', borderRadius: '8px' }} itemStyle={{ color: '#45E78C' }} />
                      <Line type="monotone" dataKey="equity" stroke="#45E78C" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
              </ResponsiveContainer>
          </div>
        </div>
        <div className="dashboard-section flex flex-col items-center justify-center">
          <h3 className="section-title mb-4 w-full text-left">Distribution</h3>
          <div className="chart-container h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,13,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  </PieChart>
              </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- JOURNAL (TABLEAU & GALERIE) ---

const Journal = ({ trades, accounts, currentAccountId, onAddTrade, onEditTrade, onDeleteTrade }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'gallery'
  
  const [formData, setFormData] = useState({ accountId: currentAccountId !== 'all' ? currentAccountId : accounts[0]?.id || '', openDate: new Date().toISOString().split('T')[0], closeDate: new Date().toISOString().split('T')[0], pair: '', direction: 'Long', positionSize: '', setup: '', risk: '', pnl: '', notes: '', psychology: 'Calme', result: 'Win', screenshotBefore: '', screenshotAfter: '' });

  const openNewTradeModal = () => { setFormData({ accountId: currentAccountId !== 'all' ? currentAccountId : accounts[0]?.id || '', openDate: new Date().toISOString().split('T')[0], closeDate: new Date().toISOString().split('T')[0], pair: '', direction: 'Long', positionSize: '', setup: '', risk: '', pnl: '', notes: '', psychology: 'Calme', result: 'Win', screenshotBefore: '', screenshotAfter: '' }); setEditingId(null); setIsModalOpen(true); };
  const openEditTradeModal = (trade) => { setFormData({ accountId: trade.accountId || accounts[0].id, openDate: trade.openDate, closeDate: trade.closeDate || trade.openDate, pair: trade.pair, direction: trade.direction, positionSize: trade.positionSize || '', setup: trade.setup, risk: trade.risk, pnl: trade.pnl, notes: trade.notes, psychology: trade.psychology, result: trade.pnl > 0 ? 'Win' : 'Loss', screenshotBefore: trade.screenshotBefore || trade.screenshot || '', screenshotAfter: trade.screenshotAfter || '' }); setEditingId(trade.id); setIsModalOpen(true); };
  const handleSubmit = (e) => { e.preventDefault(); const riskAmount = parseFloat(formData.risk) || 0; const pnlAmount = parseFloat(formData.pnl) || 0; const rMultiple = riskAmount > 0 ? (pnlAmount / riskAmount).toFixed(2) : 0; const tradeData = { ...formData, risk: riskAmount, pnl: pnlAmount, r: rMultiple }; if (editingId) { onEditTrade({ ...tradeData, id: editingId }); } else { onAddTrade({ ...tradeData, id: Date.now() }); } setIsModalOpen(false); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Journal de Trading</h2>
            {/* SWITCH TABLE / GALLERY */}
            <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex">
                <button onClick={() => setViewMode('table')} className={`p-1.5 rounded transition-all ${viewMode === 'table' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`} title="Vue Liste"><List size={18}/></button>
                <button onClick={() => setViewMode('gallery')} className={`p-1.5 rounded transition-all ${viewMode === 'gallery' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`} title="Vue Galerie"><Grid size={18}/></button>
            </div>
        </div>
        <button onClick={openNewTradeModal} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"><Plus size={20} /> Nouveau Trade</button>
      </div>

      {viewMode === 'table' ? (
        <div className="u-card rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-300">
                <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-bold"><tr><th className="px-4 py-4">Open</th><th className="px-4 py-4">Market</th><th className="px-4 py-4">Dir</th><th className="px-4 py-4">Size</th><th className="px-4 py-4 text-center">Res</th><th className="px-4 py-4 text-right">P&L</th><th className="px-4 py-4 text-center">Shots</th>{currentAccountId === 'all' && <th className="px-4 py-4 text-center">Compte</th>}<th className="px-4 py-4 text-center">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-700">
                {trades.slice().reverse().map((trade) => (
                    <tr key={trade.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-4 text-sm whitespace-nowrap">{trade.openDate}</td>
                    <td className="px-4 py-4 font-bold text-white">{trade.pair}</td>
                    <td className="px-4 py-4"><span className={`px-2 py-1 rounded text-xs ${trade.direction === 'Long' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-orange-500/20 text-orange-400'}`}>{trade.direction}</span></td>
                    <td className="px-4 py-4 text-sm text-slate-400">{trade.positionSize || '-'}</td>
                    <td className="px-4 py-4 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${trade.pnl > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{trade.pnl > 0 ? 'W' : 'L'}</span></td>
                    <td className={`px-4 py-4 text-right font-mono font-bold ${trade.pnl > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{trade.pnl > 0 ? '+' : ''}{trade.pnl}</td>
                    <td className="px-4 py-4 text-center"><div className="flex justify-center gap-2">{trade.screenshotBefore ? <a href={trade.screenshotBefore} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300"><Eye size={16} /></a> : <span className="w-4"></span>}{trade.screenshotAfter ? <a href={trade.screenshotAfter} target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300"><ImageIcon size={16} /></a> : <span className="w-4"></span>}</div></td>
                    {currentAccountId === 'all' && ( <td className="px-4 py-4 text-center"><span className="text-xs text-slate-500 border border-slate-700 px-2 py-1 rounded">{accounts.find(a => a.id === trade.accountId)?.name || 'N/A'}</span></td> )}
                    <td className="px-4 py-4 text-center flex justify-center gap-2"><button onClick={() => openEditTradeModal(trade)} className="text-slate-500 hover:text-cyan-400 transition-colors"><Pencil size={16} /></button><button onClick={() => onDeleteTrade(trade.id)} className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={16} /></button></td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
      ) : (
        // VUE GALERIE (PLAYBOOK)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
            {trades.slice().reverse().map(trade => (
                <div key={trade.id} className="u-card rounded-xl overflow-hidden shadow-lg flex flex-col hover:border-cyan-500/50 transition-colors">
                    {/* Zone Image */}
                    <div className="h-48 bg-slate-900 relative group">
                        {trade.screenshotBefore || trade.screenshotAfter ? (
                            <img 
                                src={trade.screenshotAfter || trade.screenshotBefore} 
                                alt="Chart" 
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                onError={(e) => {e.target.style.display='none'}}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600"><ImageIcon size={48}/></div>
                        )}
                        <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold ${trade.pnl > 0 ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                            {trade.pnl > 0 ? '+' : ''}{trade.pnl}$
                        </div>
                        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur rounded text-xs text-white">
                            {trade.pair} • {trade.direction}
                        </div>
                    </div>
                    {/* Zone Détails */}
                    <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold text-white text-lg">{trade.setup || 'Setup Inconnu'}</h4>
                             <span className="text-xs text-slate-500">{trade.openDate}</span>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1 italic">"{trade.notes}"</p>
                        
                        <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                             <div className="flex gap-2">
                                {trade.screenshotBefore && <a href={trade.screenshotBefore} target="_blank" className="p-2 bg-slate-700 rounded hover:bg-slate-600 text-cyan-400" title="Avant" rel="noreferrer"><Eye size={16}/></a>}
                                {trade.screenshotAfter && <a href={trade.screenshotAfter} target="_blank" className="p-2 bg-slate-700 rounded hover:bg-slate-600 text-purple-400" title="Après" rel="noreferrer"><ImageIcon size={16}/></a>}
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => openEditTradeModal(trade)} className="text-slate-500 hover:text-cyan-400"><Pencil size={16}/></button>
                                <button onClick={() => onDeleteTrade(trade.id)} className="text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
                             </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Modal Ajout/Modif Trade */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-600 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800 z-10">
              <h3 className="text-xl font-bold text-white">{editingId ? "Modifier le Trade" : "Nouveau Trade"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">Fermer</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 bg-slate-700/30 p-4 rounded-lg border border-slate-600 mb-4"><label className="text-sm text-emerald-400 font-bold block mb-2 flex items-center gap-2"><Briefcase size={16}/> Compte de Trading</label><select required value={formData.accountId} onChange={e => setFormData({...formData, accountId: e.target.value})} className="w-full bg-slate-900 border border-slate-500 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-emerald-500">{accounts.map(acc => (<option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>))}</select></div>
              <div className="space-y-2"><label className="text-sm text-slate-400">Date Ouverture (Open)</label><input type="date" required value={formData.openDate} onChange={e => setFormData({...formData, openDate: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
              <div className="space-y-2"><label className="text-sm text-slate-400">Date Fermeture (Close)</label><input type="date" value={formData.closeDate} onChange={e => setFormData({...formData, closeDate: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
              <div className="space-y-2"><label className="text-sm text-slate-400">Instrument</label><input type="text" required placeholder="EURUSD..." value={formData.pair} onChange={e => setFormData({...formData, pair: e.target.value.toUpperCase()})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none" /></div>
              <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-sm text-slate-400">Direction</label><select value={formData.direction} onChange={e => setFormData({...formData, direction: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none"><option value="Long">Long</option><option value="Short">Short</option></select></div><div className="space-y-2"><label className="text-sm text-slate-400">Taille</label><input type="text" placeholder="1.5 Lots" value={formData.positionSize} onChange={e => setFormData({...formData, positionSize: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none" /></div></div>
              <div className="space-y-2"><label className="text-sm text-slate-400">Setup</label><input type="text" list="setups" placeholder="Breakout..." value={formData.setup} onChange={e => setFormData({...formData, setup: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none" /><datalist id="setups"><option value="Trend Following" /><option value="Breakout" /><option value="Reversal" /><option value="Range" /></datalist></div>
              <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-sm text-slate-400">Risque</label><input type="number" required placeholder="100" value={formData.risk} onChange={e => setFormData({...formData, risk: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none" /></div><div className="space-y-2"><label className="text-sm text-slate-400">P&L Réalisé</label><input type="number" required placeholder="150" value={formData.pnl} onChange={e => setFormData({...formData, pnl: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none" /></div></div>
              <div className="space-y-2"><label className="text-sm text-slate-400 flex items-center gap-2"><Eye size={14}/> Screenshot AVANT</label><input type="text" placeholder="https://..." value={formData.screenshotBefore} onChange={e => setFormData({...formData, screenshotBefore: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none text-sm" /></div>
              <div className="space-y-2"><label className="text-sm text-slate-400 flex items-center gap-2"><ImageIcon size={14}/> Screenshot APRÈS</label><input type="text" placeholder="https://..." value={formData.screenshotAfter} onChange={e => setFormData({...formData, screenshotAfter: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none text-sm" /></div>
              <div className="space-y-2"><label className="text-sm text-slate-400">Psycho</label><select value={formData.psychology} onChange={e => setFormData({...formData, psychology: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none"><option value="Calme">Calme / Discipliné</option><option value="Anxieux">Anxieux / Hésitant</option><option value="FOMO">FOMO / Impulsif</option><option value="Revenge">Revenge / Colère</option><option value="Confiant">Confiant</option></select></div>
              <div className="md:col-span-2 space-y-2"><label className="text-sm text-slate-400">Notes</label><textarea rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none resize-none" placeholder="Analyse..." /></div>
              <div className="md:col-span-2 pt-4 border-t border-slate-700"><button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95">{editingId ? "Mettre à jour" : "Enregistrer le Trade"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Analysis = ({ trades }) => {
  const setupStats = useMemo(() => {
    const data = {};
    trades.forEach(t => {
      if (!data[t.setup]) data[t.setup] = { name: t.setup || 'Autre', wins: 0, total: 0, pnl: 0 };
      data[t.setup].total += 1;
      data[t.setup].pnl += parseFloat(t.pnl);
      if (t.pnl > 0) data[t.setup].wins += 1;
    });
    return Object.values(data).map(d => ({ ...d, winRate: ((d.wins / d.total) * 100).toFixed(0) }));
  }, [trades]);

  const pairStats = useMemo(() => {
    const data = {};
    trades.forEach(t => {
      const pair = t.pair || 'Inconnu';
      if (!data[pair]) data[pair] = { name: pair, pnl: 0 };
      data[pair].pnl += parseFloat(t.pnl);
    });
    return Object.values(data).sort((a, b) => b.pnl - a.pnl).slice(0, 5);
  }, [trades]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="dashboard-section">
        <h2 className="section-title mb-6">Analyse & Stats</h2>
      </div>
      <CalendarHeatmap trades={trades} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="dashboard-section lg:col-span-2">
            <h3 className="section-title mb-4">Performance par Setup</h3>
            <div className="chart-container h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={setupStats} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} /><XAxis type="number" stroke="rgba(255,255,255,0.4)" /><YAxis dataKey="name" type="category" width={100} stroke="rgba(255,255,255,0.4)" /><Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'rgba(10,10,13,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} /><Bar dataKey="pnl" fill="#06b6d4" radius={[0, 4, 4, 0]}>{setupStats.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.pnl > 0 ? '#45E78C' : '#FF5F5F'} />))}</Bar></BarChart></ResponsiveContainer></div>
        </div>
        <div className="dashboard-section">
          <h3 className="section-title mb-4">Top 5 Instruments (P&L)</h3>
           <div className="chart-container h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={pairStats}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} /><XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" /><YAxis stroke="rgba(255,255,255,0.4)" /><Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'rgba(10,10,13,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} /><Bar dataKey="pnl" radius={[4, 4, 0, 0]}>{pairStats.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.pnl > 0 ? '#9A6BFF' : '#FF5F5F'} />))}</Bar></BarChart></ResponsiveContainer></div>
        </div>
      </div>
    </div>
  );
};

const Psychology = ({ trades }) => {
  const emotionStats = useMemo(() => {
    const data = {};
    trades.forEach(t => {
      if (!data[t.psychology]) data[t.psychology] = { name: t.psychology, count: 0, pnl: 0 };
      data[t.psychology].count += 1;
      data[t.psychology].pnl += parseFloat(t.pnl);
    });
    return Object.values(data);
  }, [trades]);

  const disciplineStats = useMemo(() => {
    if (trades.length === 0) return { score: 0, revengeCount: 0, disciplinedStreak: 0, hasData: false };
    const negativeStates = ['FOMO', 'Revenge', 'Anxieux'];
    const indisciplinedCount = trades.filter(t => negativeStates.includes(t.psychology)).length;
    const revengeCount = trades.filter(t => t.psychology === 'Revenge').length;
    const score = Math.round(((trades.length - indisciplinedCount) / trades.length) * 100);
    return { score, revengeCount, hasData: true };
  }, [trades]);

  return (
    <div className="space-y-6">
       <div className="dashboard-section">
         <h2 className="section-title flex items-center gap-2"><Brain className="text-purple-400" /> Module Psychologie</h2>
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="dashboard-section lg:col-span-2">
            <h3 className="section-title mb-4">Impact Émotionnel sur le P&L</h3>
             <div className="chart-container h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={emotionStats}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} /><XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" /><YAxis stroke="rgba(255,255,255,0.4)" /><Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'rgba(10,10,13,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} /><Bar dataKey="pnl" radius={[4, 4, 0, 0]}>{emotionStats.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.pnl > 0 ? '#45E78C' : '#FF5F5F'} />))}</Bar></BarChart></ResponsiveContainer></div>
         </div>
         <div className="dashboard-section flex flex-col items-center justify-center text-center">
            <h3 className="section-title mb-2">Score de Discipline</h3>
            {disciplineStats.hasData ? (
              <>
                <div className={`w-32 h-32 rounded-full border-8 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,0,0,0.3)] ${disciplineStats.score >= 80 ? 'border-emerald-500 shadow-emerald-500/20' : disciplineStats.score >= 50 ? 'border-yellow-500 shadow-yellow-500/20' : 'border-red-500 shadow-red-500/20'}`}><span className="text-3xl font-bold text-white">{disciplineStats.score}%</span></div>
                <div className="mt-6 w-full space-y-2 text-left"><div className={`flex items-center gap-2 text-sm ${disciplineStats.revengeCount > 0 ? 'text-red-400' : 'text-slate-500'}`}><AlertTriangle size={16} /><span>Revenge Trading: {disciplineStats.revengeCount} trade(s).</span></div></div>
              </>
            ) : ( <div className="flex flex-col items-center justify-center h-48 text-slate-500"><Brain size={48} className="mb-2 opacity-50" /><p>Aucune donnée.</p></div> )}
         </div>
       </div>
    </div>
  );
};

const TradingPlan = ({ plan, setPlan }) => {
  const [newRule, setNewRule] = useState("");
  const toggleRoutine = (id) => { const newRoutine = plan.dailyRoutine.map(item => item.id === id ? { ...item, done: !item.done } : item); setPlan({ ...plan, dailyRoutine: newRoutine }); };
  const addRule = (e) => { e.preventDefault(); if(newRule.trim()) { setPlan({ ...plan, rules: [...plan.rules, newRule] }); setNewRule(""); } };
  const deleteRule = (index) => { const newRules = plan.rules.filter((_, i) => i !== index); setPlan({ ...plan, rules: newRules }); };
  return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="u-card p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><CheckCircle className="text-emerald-400" /> Routine Quotidienne</h3>
            <div className="space-y-3">{plan.dailyRoutine.map(item => ( <div key={item.id} onClick={() => toggleRoutine(item.id)} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${item.done ? 'bg-emerald-900/30 border-emerald-700' : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700'}`}><div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${item.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-400'}`}>{item.done && <CheckCircle size={14} className="text-white" />}</div><span className={item.done ? 'text-slate-400 line-through' : 'text-white'}>{item.text}</span></div> ))}</div>
        </div>
        <div className="u-card p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ScrollText className="text-cyan-400" /> Règles (Hard Rules)</h3>
            <ul className="space-y-2 mb-4">{plan.rules.map((rule, idx) => (<li key={idx} className="flex justify-between items-center text-slate-300 bg-slate-900/50 p-2 rounded border-l-4 border-cyan-500"><span>{rule}</span><button onClick={() => deleteRule(idx)} className="text-slate-600 hover:text-red-400"><Trash2 size={14}/></button></li>))}</ul>
            <form onSubmit={addRule} className="flex gap-2"><input type="text" value={newRule} onChange={(e) => setNewRule(e.target.value)} placeholder="Nouvelle règle..." className="flex-1 bg-white/3 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20" /><button type="submit" className="brutal-btn bg-gradient-to-r from-cyan-500/20 to-cyan-500/20 hover:from-cyan-500/30 hover:to-cyan-500/30 border border-cyan-500/30 hover:border-cyan-500/50 text-white px-3 py-2 rounded"><Plus size={16} /></button></form>
        </div>
    </div>
  );
};

// --- APP COMPONENT ---

const App = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const fileInputRef = useRef(null);
  
  // STATES
  const [trades, setTrades] = useState(() => { const saved = localStorage.getItem('swing_trades'); return saved ? JSON.parse(saved) : INITIAL_TRADES; });
  const [plan, setPlan] = useState(() => { const saved = localStorage.getItem('swing_plan'); return saved ? JSON.parse(saved) : INITIAL_PLAN; });
  const [accounts, setAccounts] = useState(() => { const saved = localStorage.getItem('swing_accounts'); return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS; });
  const [macroEvents, setMacroEvents] = useState(() => { const saved = localStorage.getItem('swing_macro_events'); return saved ? JSON.parse(saved) : INITIAL_MACRO_EVENTS; });
  const [currentAccountId, setCurrentAccountId] = useState('all');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [newAccountData, setNewAccountData] = useState({ name: '', balance: '' });

  // PERSISTENCE
  useEffect(() => { localStorage.setItem('swing_trades', JSON.stringify(trades)); }, [trades]);
  useEffect(() => { localStorage.setItem('swing_plan', JSON.stringify(plan)); }, [plan]);
  useEffect(() => { localStorage.setItem('swing_accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('swing_macro_events', JSON.stringify(macroEvents)); }, [macroEvents]);

  // LOGIC
  const addTrade = (trade) => setTrades([...trades, trade]);
  const editTrade = (updatedTrade) => setTrades(trades.map(t => t.id === updatedTrade.id ? updatedTrade : t));
  const deleteTrade = (id) => setTrades(trades.filter(t => t.id !== id));

  const addAccount = (e) => {
      e.preventDefault();
      if (newAccountData.name && newAccountData.balance) {
          setAccounts([...accounts, { id: `acc_${Date.now()}`, name: newAccountData.name, balance: parseFloat(newAccountData.balance), currency: '$' }]);
          setNewAccountData({ name: '', balance: '' }); setIsAccountModalOpen(false);
      }
  };
  const deleteAccount = (id) => {
      if (window.confirm("Êtes-vous sûr ?")) { setAccounts(accounts.filter(a => a.id !== id)); if(currentAccountId === id) setCurrentAccountId('all'); }
  };

  const displayedTrades = useMemo(() => { if (currentAccountId === 'all') return trades; return trades.filter(t => t.accountId === currentAccountId); }, [trades, currentAccountId]);

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({trades, plan, accounts, macroEvents}));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `swing_trade_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (json.trades && json.plan) {
          if(window.confirm("Attention : Ceci va écraser vos données. Continuer ?")) {
            setTrades(json.trades); setPlan(json.plan); if(json.accounts) setAccounts(json.accounts); if(json.macroEvents) setMacroEvents(json.macroEvents);
            alert("Import réussi !");
          }
        } else { alert("Format invalide."); }
      } catch (error) { alert("Erreur fichier."); }
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  return (
    <div className="flex h-screen app-root text-slate-100 font-sans overflow-hidden">
      <aside className="w-64 sidebar bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="sidebar-brand u-card">
          <h1 className="text-2xl font-extrabold tracking-tight brutal-title">BatesTading<span className="font-light text-white">Vision</span></h1>
          <p className="text-xs text-slate-500 mt-1 neon-badge">Journal</p>
        </div>
        
        {/* ACCOUNT SELECTOR */}
        <div className="px-4 pt-4">
            <div className="u-card rounded-lg p-2">
                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block pl-1">Compte Actif</label>
                <select value={currentAccountId} onChange={(e) => setCurrentAccountId(e.target.value)} className="w-full bg-slate-800 text-white text-sm rounded p-1.5 outline-none border border-slate-700 focus:border-cyan-500">
                    <option value="all">Vue Globale (Tous)</option>
                    {accounts.map(acc => (<option key={acc.id} value={acc.id}>{acc.name}</option>))}
                </select>
                <button onClick={() => setIsAccountModalOpen(true)} className="w-full mt-2 text-xs text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 py-1 border border-dashed border-slate-700 hover:border-cyan-500 rounded transition-colors"><Plus size={12}/> Gérer les comptes</button>
            </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => setCurrentView('dashboard')} className={`nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'dashboard' ? 'active' : ''}`}><LayoutDashboard size={20} /> <span className="nav-label">Dashboard</span></button>
          <button onClick={() => setCurrentView('journal')} className={`nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'journal' ? 'active' : ''}`}><BookOpen size={20} /> <span className="nav-label">Journal</span></button>
          <button onClick={() => setCurrentView('analysis')} className={`nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'analysis' ? 'active' : ''}`}><BarChart2 size={20} /> <span className="nav-label">Analyse</span></button>
          <button onClick={() => setCurrentView('macro')} className={`nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'macro' ? 'active' : ''}`}><Globe size={20} /> <span className="nav-label">MacroEdge</span> <span className="text-[10px] bg-red-500 text-white px-1 rounded ml-auto">PRO</span></button>
          <button onClick={() => setCurrentView('psychology')} className={`nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'psychology' ? 'active' : ''}`}><Brain size={20} /> <span className="nav-label">Psychologie</span></button>
          <button onClick={() => setCurrentView('plan')} className={`nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'plan' ? 'active' : ''}`}><ScrollText size={20} /> <span className="nav-label">Plan de Trading</span></button>
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button onClick={exportData} className="w-full flex items-center justify-center gap-2 u-card text-slate-300 text-sm py-2 rounded-lg transition-colors"><Download size={16} /> Backup Data</button>
          <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
          <button onClick={() => fileInputRef.current.click()} className="w-full flex items-center justify-center gap-2 u-card text-slate-300 text-sm py-2 rounded-lg transition-colors"><Upload size={16} /> Import Data</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto pb-20">
          <header className="md:hidden mb-6 flex justify-between items-center"><h1 className="text-xl brutal-title-small">Bates Tading Vision</h1></header>
          {currentAccountId !== 'all' && ( <div className="mb-6 u-card p-4 rounded-xl flex justify-between items-center"><div className="flex items-center gap-3"><div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400"><Briefcase size={24}/></div><div><h2 className="font-bold text-white text-lg">{accounts.find(a => a.id === currentAccountId)?.name}</h2><p className="text-sm text-muted">Solde Initial: {accounts.find(a => a.id === currentAccountId)?.balance.toLocaleString()} {accounts.find(a => a.id === currentAccountId)?.currency}</p></div></div></div> )}
          {currentView === 'dashboard' && <Dashboard trades={displayedTrades} accounts={accounts} currentAccountId={currentAccountId} />}
          {currentView === 'journal' && <Journal trades={displayedTrades} accounts={accounts} currentAccountId={currentAccountId} onAddTrade={addTrade} onEditTrade={editTrade} onDeleteTrade={deleteTrade} />}
          {currentView === 'analysis' && <Analysis trades={displayedTrades} />}
          {currentView === 'macro' && <MacroEdge events={macroEvents} setEvents={setMacroEvents} />}
          {currentView === 'psychology' && <Psychology trades={displayedTrades} />}
          {currentView === 'plan' && <TradingPlan plan={plan} setPlan={setPlan} />}
          {/* Finance view removed */}
        </div>
      </main>

      {/* MODAL GESTION COMPTES */}
      {isAccountModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="u-card rounded-2xl shadow-2xl w-full max-w-md">
                  <div className="p-6 border-b border-white/10 flex justify-between items-center"><h3 className="text-xl font-bold text-white">Mes Comptes</h3><button onClick={() => setIsAccountModalOpen(false)} className="text-muted hover:text-white">Fermer</button></div>
                  <div className="p-6 space-y-6">
                      <div className="space-y-2 max-h-48 overflow-y-auto">{accounts.map(acc => (<div key={acc.id} className="flex justify-between items-center u-card p-3 rounded"><div><p className="font-bold text-white text-sm">{acc.name}</p><p className="text-xs text-muted">Départ: {acc.balance.toLocaleString()}</p></div><button onClick={() => deleteAccount(acc.id)} className="text-muted hover:text-red-400 p-1"><Trash2 size={16}/></button></div>))}</div>
                      <form onSubmit={addAccount} className="border-t border-white/10 pt-4 space-y-3"><h4 className="text-sm font-bold text-white uppercase">Ajouter un compte</h4><input type="text" placeholder="Nom (ex: FTMO 120k)" value={newAccountData.name} onChange={(e) => setNewAccountData({...newAccountData, name: e.target.value})} className="w-full bg-white/3 border border-white/10 rounded p-2 text-white text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20" /><input type="number" placeholder="Solde Initial (ex: 120000)" value={newAccountData.balance} onChange={(e) => setNewAccountData({...newAccountData, balance: e.target.value})} className="w-full bg-white/3 border border-white/10 rounded p-2 text-white text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20" /><button type="submit" className="w-full brutal-btn bg-gradient-to-r from-cyan-500/20 to-cyan-500/20 hover:from-cyan-500/30 hover:to-cyan-500/30 text-white py-2 rounded font-bold text-sm transition-colors border border-cyan-500/30 hover:border-cyan-500/50">Créer le compte</button></form>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;