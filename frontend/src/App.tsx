import { useState } from 'react';
import NoteList from './components/NoteList';
import CreateModal from './components/CreateModal';
import styles from './App.module.css';

export default function App() {
  const [creating, setCreating] = useState(false);
  // Incrementing this triggers NoteList to refetch
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSaved() {
    setRefreshKey(k => k + 1);
  }

  return (
    <>
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.newBtn} onClick={() => setCreating(true)}>
            + New Note
          </button>
        </header>
        <main className={styles.main}>
          <NoteList refreshKey={refreshKey} />
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
