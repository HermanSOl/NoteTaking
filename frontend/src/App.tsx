import { useState } from 'react';
import NoteList from './components/NoteList';
import CreateModal from './components/CreateModal';
import Sidebar, { type Accent } from './components/Sidebar';
import styles from './App.module.css';

export default function App() {
  const [creating, setCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [paintColor, setPaintColor] = useState<Accent | null>(null);
  const [connectMode, setConnectMode] = useState(false);

  function handleSaved() {
    setRefreshKey(k => k + 1);
  }

  function toggleConnect() {
    setConnectMode(m => !m);
    if (paintColor) setPaintColor(null);
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
        </header>
        <main className={styles.main}>
          <NoteList refreshKey={refreshKey} paintColor={paintColor} connectMode={connectMode} />
        </main>
      </div>

      {creating && (             //shows up when setCreating is true to save space
        <CreateModal
          onClose={() => setCreating(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
