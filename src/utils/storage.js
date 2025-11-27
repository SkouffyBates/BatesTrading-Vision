/**
 * Storage utilities for localStorage management
 */

export const loadTrades = () => {
  try {
    const saved = localStorage.getItem('swing_trades');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading trades:', error);
    return [];
  }
};

export const saveTrades = (trades) => {
  try {
    localStorage.setItem('swing_trades', JSON.stringify(trades));
  } catch (error) {
    console.error('Error saving trades:', error);
  }
};

export const loadPlan = (initial) => {
  try {
    const saved = localStorage.getItem('swing_plan');
    return saved ? JSON.parse(saved) : initial;
  } catch (error) {
    console.error('Error loading plan:', error);
    return initial;
  }
};

export const savePlan = (plan) => {
  try {
    localStorage.setItem('swing_plan', JSON.stringify(plan));
  } catch (error) {
    console.error('Error saving plan:', error);
  }
};

export const loadAccounts = (initial) => {
  try {
    const saved = localStorage.getItem('swing_accounts');
    return saved ? JSON.parse(saved) : initial;
  } catch (error) {
    console.error('Error loading accounts:', error);
    return initial;
  }
};

export const saveAccounts = (accounts) => {
  try {
    localStorage.setItem('swing_accounts', JSON.stringify(accounts));
  } catch (error) {
    console.error('Error saving accounts:', error);
  }
};

export const loadMacroEvents = (initial) => {
  try {
    const saved = localStorage.getItem('swing_macro_events');
    return saved ? JSON.parse(saved) : initial;
  } catch (error) {
    console.error('Error loading macro events:', error);
    return initial;
  }
};

export const saveMacroEvents = (events) => {
  try {
    localStorage.setItem('swing_macro_events', JSON.stringify(events));
  } catch (error) {
    console.error('Error saving macro events:', error);
  }
};
