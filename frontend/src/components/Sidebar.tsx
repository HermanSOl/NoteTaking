import { useState } from 'react';
import styles from './Sidebar.module.css';

export const PALETTE = [
  { bg: '#DA4167', text: '#fff',    name: 'Magenta' },
  { bg: '#F4D35E', text: '#000',    name: 'Gold'    },
  { bg: '#F78764', text: '#000',    name: 'Coral'   },
  { bg: '#083D77', text: '#EBEBD3', name: 'Navy'    },
  { bg: '#EBEBD3', text: '#000',    name: 'Cream'   },
  { bg: '#ffffff', text: '#000',    name: 'White'   },
  { bg: '#2ECC71', text: '#000',    name: 'Green'   },
  { bg: '#9B59B6', text: '#fff',    name: 'Purple'  },
];

export type Accent = { bg: string; text: string };

interface Props {
  selected: Accent | null;
  onSelect: (color: Accent | null) => void;
}

export default function Sidebar({ selected, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);

  function toggle() {
    if (expanded) onSelect(null);
    setExpanded(e => !e);
  }

  return (
    <div className={styles.palette}>
      <button
        className={`${styles.circle} ${styles.toggleCircle} ${expanded ? styles.toggleOpen : ''}`}
        onClick={toggle}
        title="Color palette"
      />

      {PALETTE.map((color, i) => (
        <button
          key={color.bg}
          className={`${styles.circle} ${styles.colorCircle} ${expanded ? styles.visible : ''} ${selected?.bg === color.bg ? styles.activeColor : ''}`}
          style={{
            '--color': color.bg,
            '--delay': `${i * 30}ms`,
          } as React.CSSProperties}
          title={color.name}
          onClick={() => onSelect(selected?.bg === color.bg ? null : color)}
        />
      ))}
    </div>
  );
}
