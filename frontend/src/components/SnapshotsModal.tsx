import { useState } from 'react';
import styles from './SnapshotsModal.module.css';

export interface SnapshotData {
  positions: Record<string, string>;
  widths:    Record<string, string>;
  heights:   Record<string, string>;
  colors:    Record<string, string>;
  connections: { from: number; to: number }[];
}

export interface Snapshot {
  id:        string;
  name:      string;
  createdAt: string;
  data:      SnapshotData;
}

function loadSnapshots(): Snapshot[] {
  const saved = localStorage.getItem('canvas-snapshots');
  return saved ? JSON.parse(saved) : [];
}

function saveSnapshots(snapshots: Snapshot[]) {
  localStorage.setItem('canvas-snapshots', JSON.stringify(snapshots));
}

export function captureCurrentState(): SnapshotData {
  const positions: Record<string, string> = {};
  const widths:    Record<string, string> = {};
  const heights:   Record<string, string> = {};
  const colors:    Record<string, string> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    const val = localStorage.getItem(key)!;
    if      (key.startsWith('note-pos-'))   positions[key] = val;
    else if (key.startsWith('note-w-'))     widths[key]    = val;
    else if (key.startsWith('note-h-'))     heights[key]   = val;
    else if (key.startsWith('note-color-')) colors[key]    = val;
  }

  const connections = JSON.parse(localStorage.getItem('note-connections') ?? '[]');
  return { positions, widths, heights, colors, connections };
}

interface Props {
  onClose:       () => void;
  onLoadSnapshot: (data: SnapshotData) => void;
}

export default function SnapshotsModal({ onClose, onLoadSnapshot }: Props) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>(loadSnapshots);
  const [name, setName] = useState('');

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const snapshot: Snapshot = {
      id:        crypto.randomUUID(),
      name:      trimmed,
      createdAt: new Date().toLocaleString(),
      data:      captureCurrentState(),
    };
    const next = [snapshot, ...snapshots];
    setSnapshots(next);
    saveSnapshots(next);
    setName('');
  }

  function handleDelete(id: string) {
    const next = snapshots.filter(s => s.id !== id);
    setSnapshots(next);
    saveSnapshots(next);
  }

  return (
    <div className={styles.backdrop} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>Snapshots</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {/* Save current state */}
          <div className={styles.saveRow}>
            <input
              className={styles.input}
              placeholder="Snapshot name…"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
            />
            <button className={styles.saveBtn} onClick={handleSave} disabled={!name.trim()}>
              Save
            </button>
          </div>

          {/* Snapshot list */}
          {snapshots.length === 0 ? (
            <p className={styles.empty}>No snapshots yet.</p>
          ) : (
            <ul className={styles.list}>
              {snapshots.map(s => (
                <li key={s.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{s.name}</span>
                    <span className={styles.itemDate}>{s.createdAt}</span>
                  </div>
                  <div className={styles.itemActions}>
                    <button className={styles.loadBtn} onClick={() => onLoadSnapshot(s.data)}>
                      Load
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(s.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
