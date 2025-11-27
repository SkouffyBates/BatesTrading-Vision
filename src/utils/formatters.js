/**
 * Formatter utilities for display
 */

export const formatCurrency = (value, currency = '$') => {
  return `${currency}${parseFloat(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const formatNumber = (num) => {
  return parseFloat(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const formatPercent = (value) => {
  return `${parseFloat(value).toFixed(2)}%`;
};

export const formatPnL = (pnl) => {
  const prefix = pnl > 0 ? '+' : '';
  return `${prefix}${formatNumber(pnl)}`;
};
