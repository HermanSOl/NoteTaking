import { useState, useRef } from 'react';
import type { Note } from '../types';
import styles from './NoteCard.module.css';

const ACCENTS = [
  { bg: '#DA4167', text: '#fff' },
  { bg: '#F4D35E', text: '#000' },
  { bg: '#F78764', text: '#000' },
  { bg: '#083D77', text: '#EBEBD3' },
];

const MIN_W = 200;
const MIN_H = 120;
const DEFAULT_W = 300;

function defaultPos(id: number) {
  const col = (id - 1) % 3;
  const row = Math.floor((id - 1) / 3);
  return { x: col * 340 + 24, y: row * 300 + 24 };
}

function loadPos(id: number) {
  const saved = localStorage.getItem(`note-pos-${id}`);
  return saved ? JSON.parse(saved) : defaultPos(id);
}

function loadWidth(id: number): number {
  const saved = localStorage.getItem(`note-w-${id}`);
  return saved ? Number(saved) : DEFAULT_W;
}

function loadHeight(id: number): number | 'auto' {
  const saved = localStorage.getItem(`note-h-${id}`);
  return saved ? Number(saved) : 'auto';
}

interface Props {
  note: Note;
  onEdit: (note: Note) => void;
  onFocus: (id: number) => void;
  zIndex: number;
}

type ResizeDir = { dx: -1 | 0 | 1; dy: -1 | 0 | 1 };

const HANDLES: { dir: ResizeDir; cls: string; cursor: string }[] = [
  { dir: { dx: -1, dy: -1 }, cls: styles.handleNW, cursor: 'nwse-resize' },
  { dir: { dx:  0, dy: -1 }, cls: styles.handleN,  cursor: 'ns-resize'   },
  { dir: { dx:  1, dy: -1 }, cls: styles.handleNE, cursor: 'nesw-resize' },
  { dir: { dx:  1, dy:  0 }, cls: styles.handleE,  cursor: 'ew-resize'   },
  { dir: { dx:  1, dy:  1 }, cls: styles.handleSE, cursor: 'nwse-resize' },
  { dir: { dx:  0, dy:  1 }, cls: styles.handleS,  cursor: 'ns-resize'   },
  { dir: { dx: -1, dy:  1 }, cls: styles.handleSW, cursor: 'nesw-resize' },
  { dir: { dx: -1, dy:  0 }, cls: styles.handleW,  cursor: 'ew-resize'   },
];

export default function NoteCard({ note, onEdit, onFocus, zIndex }: Props) {
  const { bg, text } = ACCENTS[note.id % ACCENTS.length];

  const [pos,    setPos]    = useState(() => loadPos(note.id));
  const [width,  setWidth]  = useState(() => loadWidth(note.id));
  const [height, setHeight] = useState<number | 'auto'>(() => loadHeight(note.id));
  const [isDragging, setIsDragging] = useState(false);

  const posRef    = useRef(pos);
  const widthRef  = useRef(width);
  const heightRef = useRef(height);
  const cardRef   = useRef<HTMLDivElement>(null);

  // ── Move ──────────────────────────────────────────────────────
  function handleMoveStart(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('button, [data-handle]')) return;
    e.preventDefault();
    onFocus(note.id);
    setIsDragging(true);

    const startX = e.clientX, startY = e.clientY;
    const startPosX = posRef.current.x, startPosY = posRef.current.y;

    function onMove(ev: MouseEvent) {
      const canvas  = cardRef.current?.offsetParent as HTMLElement | null;
      const maxX    = (canvas?.clientWidth  ?? window.innerWidth)  - widthRef.current;
      const cardH   = cardRef.current?.offsetHeight ?? 0;
      const maxY    = (canvas?.clientHeight ?? window.innerHeight) - cardH;

      const newPos = {
        x: Math.max(0, Math.min(maxX, startPosX + (ev.clientX - startX))),
        y: Math.max(0, Math.min(maxY, startPosY + (ev.clientY - startY))),
      };
      posRef.current = newPos;
      setPos(newPos);
    }
    function onUp() {
      setIsDragging(false);
      localStorage.setItem(`note-pos-${note.id}`, JSON.stringify(posRef.current));
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // RESIZE FUNCTION
  function handleResizeStart(e: React.MouseEvent, { dx, dy }: ResizeDir) {
    e.preventDefault();
    e.stopPropagation();
    onFocus(note.id);

    const startMouseX = e.clientX, startMouseY = e.clientY;
    const startW = widthRef.current;
    // If height is still 'auto', snapshot the rendered pixel height now
    const startH = heightRef.current === 'auto'
      ? (cardRef.current?.offsetHeight ?? 200)
      : heightRef.current;
    const startPosX = posRef.current.x, startPosY = posRef.current.y;

    function onMove(ev: MouseEvent) {
      const diffX = ev.clientX - startMouseX;
      const diffY = ev.clientY - startMouseY;

      let newW = startW, newH = startH;
      let newX = startPosX, newY = startPosY;

      if (dx === 1) {
        newW = Math.max(MIN_W, startW + diffX);
      } else if (dx === -1) {
        newW = Math.max(MIN_W, startW - diffX);
        newX = startPosX + (startW - newW);   // keep right edge fixed
      }

      if (dy === 1) {
        newH = Math.max(MIN_H, startH + diffY);
      } else if (dy === -1) {
        newH = Math.max(MIN_H, startH - diffY);
        newY = startPosY + (startH - newH);   // keep bottom edge fixed
      }

      widthRef.current  = newW;
      heightRef.current = newH;
      posRef.current    = { x: newX, y: newY };
      setWidth(newW);
      setHeight(newH);
      setPos({ x: newX, y: newY });
    }
    function onUp() {
      localStorage.setItem(`note-w-${note.id}`,   String(widthRef.current));
      localStorage.setItem(`note-h-${note.id}`,   String(heightRef.current));
      localStorage.setItem(`note-pos-${note.id}`, JSON.stringify(posRef.current));
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      style={{
        '--accent': bg,
        '--text': text,
        left: pos.x,
        top: pos.y,
        width,
        height: height === 'auto' ? undefined : height,
        zIndex,
      } as React.CSSProperties}
      onMouseDown={handleMoveStart}
    >
      <div className={styles.body}>
        <div className={styles.header}>
          <h2 className={styles.title}>{note.title}</h2>
          {note.category && <span className={styles.category}>{note.category}</span>}
        </div>

        {note.content && <p className={styles.content}>{note.content}</p>}

        <div className={styles.footer}>
          <div className={styles.dates}>
            <span className={styles.date}>Created {note.created_at}</span>
            {note.updated_at !== note.created_at && (
              <span className={styles.date}>Updated {note.updated_at}</span>
            )}
          </div>
          <div className={styles.footerRight}>
            {note.enjoyment && (
              <span className={styles.enjoyment}>
                {'★'.repeat(note.enjoyment)}{'☆'.repeat(5 - note.enjoyment)}
              </span>
            )}
            <button className={styles.editBtn} onClick={() => onEdit(note)}>
              Edit
            </button>
          </div>
        </div>
      </div>

      {HANDLES.map(({ dir, cls, cursor }) => (
        <div
          key={cursor + dir.dx + dir.dy}
          data-handle
          className={`${styles.handle} ${cls}`}
          style={{ cursor }}
          onMouseDown={e => handleResizeStart(e, dir)}
        />
      ))}
    </div>
  );
}



// 90% of this class was done by AI