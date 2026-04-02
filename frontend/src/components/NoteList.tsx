import { useEffect, useState, useRef } from 'react';
import type { Note } from '../types';
import NoteCard from './NoteCard';
import EditModal from './EditModal';
import styles from './NoteList.module.css';

interface Props {
  refreshKey: number;  // we need this to save notes properly
}

export default function NoteList({ refreshKey }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Tracks the z-index order — last focused note goes to the top
  const [focusOrder, setFocusOrder] = useState<number[]>([]);
  const topZ = useRef(10);

  useEffect(() => {
    fetchNotes();
  }, [refreshKey]);

  function fetchNotes() { // fetches the data from the API and lets the dev know if it was successful
    setLoading(true);
    fetch('/notes', { headers: { Accept: 'application/json' } })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch notes');
        return res.json();
      })
      .then((data: Note[]) => {
        setNotes(data);
        setFocusOrder(data.map((n: Note) => n.id));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }

  function handleFocus(id: number) {
    setFocusOrder(prev => [...prev.filter(x => x !== id), id]);
  }

  function handleDelete(id: number) {
    setNotes(prev => prev.filter(n => n.id !== id));
    setFocusOrder(prev => prev.filter(x => x !== id));
  }

  if (loading) return <p className={styles.status}>Loading notes...</p>;
  if (error) return <p className={styles.status}>Error: {error}</p>;
  if (notes.length === 0) return <p className={styles.status}>No notes yet. Add one above!</p>;

  return (
    <>
      <div className={styles.canvas}> 
        {notes.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={setEditingNote}
            onDelete={handleDelete}
            onFocus={handleFocus}
            zIndex={focusOrder.indexOf(note.id) + 1}
          />
        ))}
      </div>

      {editingNote && (   // window for editing the note
        <EditModal
          note={editingNote}
          onClose={() => setEditingNote(null)}
          onSaved={fetchNotes}
        />
      )}
    </>
  );
}
