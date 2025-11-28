export const validateTrade = (trade) => {
  const errors = [];
  if (!trade.pair || trade.pair.length < 3) {
    errors.push('Instrument invalide (ex: EURUSD)');
  }
  if (!trade.risk || parseFloat(trade.risk) <= 0) {
    errors.push('Risque doit être supérieur à 0');
  }
  if (trade.pnl === undefined || trade.pnl === null || isNaN(parseFloat(trade.pnl))) {
    errors.push('P&L invalide');
  }
  if (!['Long', 'Short'].includes(trade.direction)) {
    errors.push('Direction invalide');
  }
  return { isValid: errors.length === 0, errors };
};

export default { validateTrade };
