import { useState } from 'react';
import NoteList from './components/NoteList';
import CreateModal from './components/CreateModal';
import Sidebar, { type Accent } from './components/Sidebar';
import styles from './App.module.css';

export default function App() {
  const [creating, setCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [paintColor, setPaintColor] = useState<Accent | null>(null);

  function handleSaved() {
    setRefreshKey(k => k + 1);
  }

  return (
    <>
      <Sidebar selected={paintColor} onSelect={setPaintColor} />
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.newBtn} onClick={() => setCreating(true)}>
            + New Note
          </button>
        </header>
        <main className={styles.main}>
          <NoteList refreshKey={refreshKey} paintColor={paintColor} />
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
