import { useState, useEffect } from 'react';

/**
 * Custom hook for managing trading plan
 * Handles daily routine, rules, and goals
 */
export const useTradingPlan = (initialPlan = {}) => {
  const isElectron = typeof window !== 'undefined' && window.db;

  const [plan, setPlan] = useState(() => {
    if (isElectron) return initialPlan;
    const saved = localStorage.getItem('swing_plan');
    return saved ? JSON.parse(saved) : initialPlan;
  });

  // Persist to localStorage when not using DB
  useEffect(() => {
    if (isElectron) return;
    localStorage.setItem('swing_plan', JSON.stringify(plan));
  }, [plan]);

  // Load from DB on mount when running in Electron
  useEffect(() => {
    if (!isElectron) return;
    (async () => {
      try {
        const dbPlan = await window.db.getTradingPlan();
        if (dbPlan) setPlan(dbPlan);
      } catch (err) {
        const toast = window.__addToast;
        toast ? toast('Erreur en chargeant le trading plan: ' + (err.message || ''), 'error') : console.error('Error loading trading plan:', err);
      }
    })();
  }, []);

  const toggleRoutineItem = (id) => {
    const newRoutine = plan.dailyRoutine.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    setPlan({ ...plan, dailyRoutine: newRoutine });
  };

  const addRule = (rule) => {
    if (rule.trim()) {
      setPlan({ ...plan, rules: [...plan.rules, rule] });
    }
  };

  const deleteRule = (index) => {
    const newRules = plan.rules.filter((_, i) => i !== index);
    setPlan({ ...plan, rules: newRules });
  };

  const updateGoals = (newGoals) => {
    setPlan({ ...plan, goals: newGoals });
  };

  const getRoutineCompletion = () => {
    if (!plan.dailyRoutine || plan.dailyRoutine.length === 0) return 0;
    const completed = plan.dailyRoutine.filter((item) => item.done).length;
    return Math.round((completed / plan.dailyRoutine.length) * 100);
  };

  return {
    plan,
    setPlan,
    toggleRoutineItem,
    addRule,
    deleteRule,
    updateGoals,
    getRoutineCompletion,
  };
};

export default useTradingPlan;