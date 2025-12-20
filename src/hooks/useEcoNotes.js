import { useState, useEffect, useCallback } from 'react';

const useEcoNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await window.db.getEcoNotes();
      setNotes(data || []);
    } catch (error) {
      console.error('Failed to fetch eco notes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addNote = useCallback(async (note) => {
    try {
      // Ensure the note object matches the DB schema expectations
      // camelCase keys will be mapped to DB params if necessary, 
      // but our backend uses @param names. Let's make sure we pass 
      // the object structure that matches what createEcoNote expects.
      // In electron/database.js:
      // VALUES (@id, @url, @summary, @impact, @relatedAssets)
      
      const newNote = {
        id: Date.now(), // Simple ID generation
        url: note.url || '',
        summary: note.summary,
        impact: note.impact,
        relatedAssets: note.relatedAssets || ''
      };

      await window.db.createEcoNote(newNote);
      await fetchNotes(); // Reload list
      return true;
    } catch (error) {
      console.error('Failed to add eco note:', error);
      return false;
    }
  }, [fetchNotes]);

  const deleteNote = useCallback(async (id) => {
    try {
      await window.db.deleteEcoNote(id);
      await fetchNotes(); // Reload list
      return true;
    } catch (error) {
      console.error('Failed to delete eco note:', error);
      return false;
    }
  }, [fetchNotes]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    loading,
    addNote,
    deleteNote,
    refreshNotes: fetchNotes
  };
};

export default useEcoNotes;
