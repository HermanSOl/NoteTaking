import { useEffect, useState, useRef } from 'react';
import type { Note } from '../types';
import NoteCard, { type CardBounds } from './NoteCard';
import EditModal from './EditModal';
import styles from './NoteList.module.css';
import type { Accent } from './Sidebar';
import DoodleBackground from './DoodleBackground';

interface Connection { from: number; to: number; }

interface Props {
  refreshKey: number;  // we need this to save notes properly
  paintColor: Accent | null;
  connectMode: boolean;
  layoutKey: number;   // incrementing this remounts all cards (re-reads localStorage)
}

export default function NoteList({ refreshKey, paintColor, connectMode, layoutKey }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Tracks the z-index order — last focused note goes to the top
  const [focusOrder, setFocusOrder] = useState<number[]>([]);
  const topZ = useRef(10);

  // Connection lines
  const [connections, setConnections] = useState<Connection[]>(() => {
    const saved = localStorage.getItem('note-connections');
    return saved ? JSON.parse(saved) : [];
  });
  const [connectSource, setConnectSource] = useState<number | null>(null);
  const [cardBounds, setCardBounds] = useState<Record<number, CardBounds>>({});

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

  // Clear the pending source when connect mode is turned off
  useEffect(() => {
    if (!connectMode) setConnectSource(null);
  }, [connectMode]);

  // When a snapshot is loaded (layoutKey changes), re-read connections from localStorage
  useEffect(() => {
    if (layoutKey === 0) return;
    const saved = localStorage.getItem('note-connections');
    setConnections(saved ? JSON.parse(saved) : []);
    setCardBounds({});
  }, [layoutKey]);

  function handleFocus(id: number) {
    setFocusOrder(prev => [...prev.filter(x => x !== id), id]);
  }

  function handleDelete(id: number) {
    setNotes(prev => prev.filter(n => n.id !== id));
    setFocusOrder(prev => prev.filter(x => x !== id));
    // Remove any connections involving this note
    setConnections(prev => {
      const next = prev.filter(c => c.from !== id && c.to !== id);
      localStorage.setItem('note-connections', JSON.stringify(next));
      return next;
    });
  }

  function handlePositionChange(id: number, bounds: CardBounds) {
    setCardBounds(prev => ({ ...prev, [id]: bounds }));
  }

  function handleConnectClick(id: number) {
    if (!connectSource) {
      setConnectSource(id);
      return;
    }
    if (connectSource === id) {
      setConnectSource(null);
      return;
    }
    // Toggle the connection between connectSource and id
    const exists = connections.some(
      c => (c.from === connectSource && c.to === id) || (c.from === id && c.to === connectSource)
    );
    const next = exists
      ? connections.filter(c => !((c.from === connectSource && c.to === id) || (c.from === id && c.to === connectSource)))
      : [...connections, { from: connectSource, to: id }];
    setConnections(next);
    localStorage.setItem('note-connections', JSON.stringify(next));
    setConnectSource(null);
  }

  function removeConnection(from: number, to: number) {
    const next = connections.filter(
      c => !((c.from === from && c.to === to) || (c.from === to && c.to === from))
    );
    setConnections(next);
    localStorage.setItem('note-connections', JSON.stringify(next));
  }

  if (loading) return <p className={styles.status}>Loading notes...</p>;
  if (error) return <p className={styles.status}>Error: {error}</p>;
  if (notes.length === 0) return <p className={styles.status}>No notes yet. Add one above!</p>;

  return (
    <>
      <div className={`${styles.canvas} ${paintColor ? styles.paintMode : ''} ${connectMode ? styles.connectModeCanvas : ''}`}>
        <DoodleBackground />

        {/* SVG layer for connection lines — above cards via z-index */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999,
            overflow: 'visible',
          }}
        >
          {connections.map(({ from, to }) => {
            const a = cardBounds[from];
            const b = cardBounds[to];
            if (!a || !b) return null;
            const x1 = a.x + a.w / 2;
            const y1 = a.y + a.h / 2;
            const x2 = b.x + b.w / 2;
            const y2 = b.y + b.h / 2;
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;
            return (
              <g key={`${from}-${to}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000" strokeWidth={3} />
                {/* Delete button at midpoint */}
                <circle
                  cx={mx} cy={my} r={10}
                  fill="#DA4167"
                  stroke="#000"
                  strokeWidth={2.5}
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
                  onClick={() => removeConnection(from, to)}
                />
                <text
                  x={mx} y={my + 4.5}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight="bold"
                  fill="#fff"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  ×
                </text>
              </g>
            );
          })}
        </svg>

        {notes.map(note => (
          <NoteCard
            key={`${note.id}-${layoutKey}`}
            note={note}
            onEdit={setEditingNote}
            onDelete={handleDelete}
            onFocus={handleFocus}
            paintColor={paintColor}
            zIndex={focusOrder.indexOf(note.id) + 1}
            onPositionChange={handlePositionChange}
            connectMode={connectMode}
            onConnectClick={handleConnectClick}
            connectSelected={connectSource === note.id}
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
