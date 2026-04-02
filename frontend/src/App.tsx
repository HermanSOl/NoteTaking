import { useState } from 'react';
import NoteList from './components/NoteList';
import CreateModal from './components/CreateModal';
import Sidebar, { type Accent } from './components/Sidebar';
import SnapshotsModal, { type SnapshotData } from './components/SnapshotsModal';
import styles from './App.module.css';

export default function App() {
  const [creating, setCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [paintColor, setPaintColor] = useState<Accent | null>(null);
  const [connectMode, setConnectMode] = useState(false);
  const [snapshotsOpen, setSnapshotsOpen] = useState(false);
  const [layoutKey, setLayoutKey] = useState(0);

  function handleSaved() {
    setRefreshKey(k => k + 1);
  }

  function toggleConnect() {
    setConnectMode(m => !m);
    if (paintColor) setPaintColor(null);
  }

  function handleLoadSnapshot(data: SnapshotData) {
    // Clear existing layout keys before writing snapshot data
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      if (key.startsWith('note-pos-') || key.startsWith('note-w-') ||
          key.startsWith('note-h-')   || key.startsWith('note-color-')) {
        toRemove.push(key);
      }
    }
    toRemove.forEach(k => localStorage.removeItem(k));

    Object.entries(data.positions).forEach(([k, v]) => localStorage.setItem(k, v));
    Object.entries(data.widths).forEach(([k, v])    => localStorage.setItem(k, v));
    Object.entries(data.heights).forEach(([k, v])   => localStorage.setItem(k, v));
    Object.entries(data.colors).forEach(([k, v])    => localStorage.setItem(k, v));
    localStorage.setItem('note-connections', JSON.stringify(data.connections));

    setLayoutKey(k => k + 1);
    setSnapshotsOpen(false);
  }

  return (
    <>
      <Sidebar selected={paintColor} onSelect={c => { setPaintColor(c); if (c) setConnectMode(false); }} />
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.newBtn} onClick={() => setCreating(true)}>
            + New Note
          </button>
          <button
            className={`${styles.connectBtn} ${connectMode ? styles.connectBtnActive : ''}`}
            onClick={toggleConnect}
          >
            {connectMode ? 'Done Connecting' : 'Connect Notes'}
          </button>
          <button className={styles.snapshotsBtn} onClick={() => setSnapshotsOpen(true)}>
            Snapshots
          </button>
        </header>
        <main className={styles.main}>
          <NoteList refreshKey={refreshKey} paintColor={paintColor} connectMode={connectMode} layoutKey={layoutKey} />
        </main>
      </div>

      {creating && (             //shows up when setCreating is true to save space
        <CreateModal
          onClose={() => setCreating(false)}
          onSaved={handleSaved}
        />
      )}

      {snapshotsOpen && (
        <SnapshotsModal
          onClose={() => setSnapshotsOpen(false)}
          onLoadSnapshot={handleLoadSnapshot}
        />
      )}
    </>
  );
}
