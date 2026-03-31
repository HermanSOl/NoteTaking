import { useState } from 'react';
import type { Note } from '../types';
import styles from './EditModal.module.css';

interface Props {
  note: Note;
  onClose: () => void;
  onSaved: () => void; // triggers a refetch in NoteList
}

export default function EditModal({ note, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content ?? '');
  const [category, setCategory] = useState(note.category ?? '');
  // 0 means "not set" — null in the backend
  const [enjoyment, setEnjoyment] = useState<number>(note.enjoyment ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const body: Record<string, string | number | null> = {
      title,
      content: content.trim() || null,
      category: category.trim() || null,
      enjoyment: enjoyment > 0 ? enjoyment : null,
    };

    try {
      const res = await fetch(`/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to save');
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
    }
  }

  // Close modal when clicking the backdrop
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Edit Note</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Title — required */}
          <div className={styles.field}>
            <label className={styles.label}>Title</label>
            <input
              className={styles.input}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="Note title"
            />
          </div>

          {/* Content — optional */}
          <div className={styles.field}>
            <label className={styles.label}>
              Content <span className={styles.optional}>optional</span>
            </label>
            <textarea
              className={styles.textarea}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
            />
          </div>

          {/* Category — optional */}
          <div className={styles.field}>
            <label className={styles.label}>
              Category <span className={styles.optional}>optional</span>
            </label>
            <input
              className={styles.input}
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Work, Personal..."
            />
          </div>

          {/* Enjoyment — optional drag bar */}
          <div className={styles.field}>
            <label className={styles.label}>
              Enjoyment <span className={styles.optional}>optional</span>
              <span className={styles.enjoymentValue}>
                {enjoyment === 0 ? '—' : `${enjoyment} / 5`}
              </span>
            </label>
            <input
              className={styles.slider}
              type="range"
              min={0}
              max={5}
              step={1}
              value={enjoyment}
              onChange={e => setEnjoyment(Number(e.target.value))}
            />
            <div className={styles.sliderTicks}>
              {['None', '1', '2', '3', '4', '5'].map((t, i) => (
                <span key={i}>{t}</span>
              ))}
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
