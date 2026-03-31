import { useEffect, useState } from 'react';
import type { Note } from '../types';
import NoteCard from './NoteCard';
import styles from './NoteList.module.css';

// A function that actully fetches all the notes through the API
export default function NoteList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notes once when the component first mounts (empty dependency array = run once)
  useEffect(() => {
    fetch('/notes', { headers: { Accept: 'application/json' } })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch notes');
        return res.json();
      })
      .then((data: Note[]) => {
        setNotes(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Show feedback states before rendering the list
  if (loading) return <p className={styles.status}>Loading notes...</p>;
  if (error) return <p className={styles.status}>Error: {error}</p>;
  if (notes.length === 0) return <p className={styles.status}>No notes yet. Add one above!</p>;

  return (
    // Render each note as a NoteCard;
    <div className={styles.grid}>
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
