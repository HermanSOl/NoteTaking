import NoteList from './components/NoteList';
import styles from './App.module.css';

export default function App() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>My Notes</h1>
      </header>
      <main className={styles.main}>
        <NoteList />
      </main>
    </div>
  );
}
