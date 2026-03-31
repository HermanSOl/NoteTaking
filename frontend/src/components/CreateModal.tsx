import { useState } from 'react';
import styles from './EditModal.module.css';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function CreateModal({ onClose, onSaved }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [enjoyment, setEnjoyment] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Backend expects form data at /notes/post
    const form = new FormData();
    form.append('title', title);
    if (content.trim()) form.append('content', content.trim());
    if (category.trim()) form.append('category', category.trim());
    if (enjoyment > 0) form.append('enjoyment', String(enjoyment));

    try {
      const res = await fetch('/notes/post', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Failed to create note');
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>New Note</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Title</label>
            <input
              className={styles.input}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="Note title"
              autoFocus
            />
          </div>

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
              {saving ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
