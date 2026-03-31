import type { Note } from '../types';
import styles from './NoteCard.module.css';

// the interface required 
interface Props {
  note: Note;
}

// Renders a note as a card with title, category, content, dates, and star rating
export default function NoteCard({ note }: Props) {
  return (
    <div className={styles.card}>
      {/* Header: always shows title, optionally shows category badge */}
      <div className={styles.header}>
        <h2 className={styles.title}>{note.title}</h2>
        {note.category && <span className={styles.category}>{note.category}</span>}
      </div>
      
      {/* Body: only rendered if the note has content */}
      {note.content && <p className={styles.content}>{note.content}</p>}
      <div className={styles.footer}>
        <span className={styles.date}>Created: {note.created_at}</span>
        {note.updated_at !== note.created_at && (
          <span className={styles.date}>Updated: {note.updated_at}</span>
        )}
        {note.enjoyment && (
          <span className={styles.enjoyment}>{'★'.repeat(note.enjoyment)}{'☆'.repeat(5 - note.enjoyment)}</span>
        )}
      </div>
    </div>
  );
}
