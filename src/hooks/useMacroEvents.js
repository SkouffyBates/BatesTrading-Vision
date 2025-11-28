import { useState, useEffect, useMemo } from 'react';

/**
 * Custom hook for managing macro economic events
 * Includes risk sentiment calculation
 */
export const useMacroEvents = (initialEvents = []) => {
  const isElectron = typeof window !== 'undefined' && window.db;
  const [events, setEvents] = useState(() => {
    if (isElectron) return initialEvents;
    const saved = localStorage.getItem('swing_macro_events');
    return saved ? JSON.parse(saved) : initialEvents;
  });

  // Persist or sync to DB
  useEffect(() => {
    if (isElectron) return;
    localStorage.setItem('swing_macro_events', JSON.stringify(events));
  }, [events]);

  const loadEvents = async () => {
    if (isElectron) {
      try {
        const rows = await window.db.getMacroEvents();
        setEvents(rows || []);
        return;
      } catch (err) {
        const toast = window.__addToast;
        toast ? toast('Erreur en chargeant les macro events: ' + (err.message || ''), 'error') : console.error('Error loading macro events:', err);
      }
    }
  };

  // ✅ CORRECTION: Charger les events depuis la BD au montage du composant
  useEffect(() => {
    if (isElectron) {
      loadEvents();
    }
  }, []);

  const addEvent = async (event) => {
    if (isElectron) {
      try {
        await window.db.createMacroEvent(event);
        await loadEvents();
      } catch (err) {
        const toast = window.__addToast;
        toast ? toast('Erreur en ajoutant l\'événement macro: ' + (err.message || ''), 'error') : console.error('Error creating macro event:', err);
      }
    } else {
      setEvents([...events, { id: Date.now(), ...event }]);
    }
  };

  const deleteEvent = async (id) => {
    if (isElectron) {
      try {
        await window.db.deleteMacroEvent(id);
        await loadEvents();
      } catch (err) {
        const toast = window.__addToast;
        toast ? toast('Erreur en supprimant l\'événement macro: ' + (err.message || ''), 'error') : console.error('Error deleting macro event:', err);
      }
    } else {
      setEvents(events.filter((e) => e.id !== id));
    }
  };

  // Calculate risk sentiment score
  const riskScore = useMemo(() => {
    if (events.length === 0) return 50;

    let score = 50;
    const weights = {
      Employment: 0.35,
      Inflation: 0.35,
      Growth: 0.15,
      Confidence: 0.05,
      'Central Bank': 0.4,
    };

    const sortedEvents = [...events].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    const recentEvents = sortedEvents.slice(0, 12);

    recentEvents.forEach((e) => {
      const actual = parseFloat(e.actual);
      const forecast = parseFloat(e.forecast);
      if (isNaN(actual) || isNaN(forecast)) return;

      let surprise = (actual - forecast) / (Math.abs(forecast) || 1);
      if (Math.abs(surprise) > 2) surprise = 2 * Math.sign(surprise);

      let directionalImpact = 0;

      if (e.category === 'Inflation') {
        directionalImpact = surprise > 0 ? -1 : 1;
      } else if (e.category === 'Employment') {
        if (e.event.includes('Unemployment') || e.event.includes('Jobless')) {
          directionalImpact = surprise > 0 ? -1 : 1;
        } else {
          directionalImpact = surprise > 0 ? 1 : -1;
        }
      } else if (e.category === 'Growth' || e.category === 'Confidence') {
        directionalImpact = surprise > 0 ? 1 : -1;
      } else if (e.category === 'Central Bank') {
        directionalImpact = surprise > 0 ? -1 : 1;
      }

      const impactWeight = e.impact === 'High' ? 1.5 : e.impact === 'Medium' ? 1 : 0.5;
      const categoryWeight = weights[e.category] || 0.1;

      score += directionalImpact * Math.abs(surprise) * 8 * impactWeight * categoryWeight;
    });

    return Math.max(0, Math.min(100, score));
  }, [events]);

  return {
    events,
    addEvent,
    deleteEvent,
    riskScore,
  };
};

export default useMacroEvents;