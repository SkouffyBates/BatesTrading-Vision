// Constants and magic strings
export const VIEWS = {
  DASHBOARD: 'dashboard',
  TRADING: 'trading',
  ANALYSIS: 'analysis',
  PSYCHOLOGY: 'psychology',
  MACRO: 'macro',
  PLAN: 'plan'
};

export const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6'];

export const TIME_FILTERS = {
  ALL: 'all',
  MONTH: 'month',
  YEAR: 'year'
};

export const PSYCHOLOGY_STATES = [
  'Calme',
  'Anxieux',
  'FOMO',
  'Revenge',
  'Confiant'
];

export const SETUPS = [
  'Trend Following',
  'Breakout',
  'Reversal',
  'Range'
];

export const MACRO_CATEGORIES = [
  'Inflation',
  'Employment',
  'Growth',
  'Confidence',
  'Central Bank'
];

export const MACRO_IMPACTS = [
  'High',
  'Medium',
  'Low'
];

export const INITIAL_PLAN = {
  dailyRoutine: [
    { id: 1, text: "Analyser le calendrier économique", done: false },
    { id: 2, text: "Revue des positions ouvertes", done: false },
    { id: 3, text: "Scanner les paires majeures (H4/D1)", done: false },
  ],
  rules: [
    "Risque max par trade : 1%",
    "Ne pas trader 30min avant une news rouge",
    "Minimum R:R de 1:2",
    "Pas de FOMO après une perte"
  ],
  goals: "Atteindre 5% de croissance mensuelle avec un drawdown max de 3%."
};

export const INITIAL_ACCOUNTS = [
  { id: 'acc_1', name: 'FTMO Challenge 120k', balance: 120000, currency: '$' },
  { id: 'acc_2', name: 'Compte Perso', balance: 5000, currency: '€' }
];

export const INITIAL_TRADES = [
  { 
    id: 1, 
    accountId: 'acc_1',
    openDate: '2025-01-15', 
    closeDate: '2025-01-16', 
    pair: 'EURUSD', 
    direction: 'Long', 
    positionSize: '1.5 Lots', 
    result: 'Win', 
    pnl: 1500, 
    r: 2.1, 
    risk: 700, 
    setup: 'Breakout', 
    psychology: 'Calme', 
    notes: 'Bonne entrée sur retest', 
    screenshotBefore: '', 
    screenshotAfter: '' 
  }
];

export const INITIAL_MACRO_EVENTS = [
  { id: 1, date: '2025-01-10', event: 'ISM Manufacturing PMI', category: 'Growth', actual: 52.3, forecast: 50.5, previous: 49.0, impact: 'High' },
  { id: 2, date: '2025-01-15', event: 'Non-Farm Employment Change (NFP)', category: 'Employment', actual: 245000, forecast: 200000, previous: 227000, impact: 'High' },
  { id: 3, date: '2025-01-22', event: 'CPI m/m', category: 'Inflation', actual: 0.3, forecast: 0.2, previous: 0.4, impact: 'High' },
  { id: 4, date: '2025-01-29', event: 'Federal Funds Rate', category: 'Central Bank', actual: 4.25, forecast: 4.25, previous: 4.50, impact: 'High' },
];
