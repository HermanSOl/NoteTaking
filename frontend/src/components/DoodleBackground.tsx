import styles from './DoodleBackground.module.css';

const CROSSES = [
  { x: 3,  y: 5,  rot: 12  },
  { x: 14, y: 32, rot: -8  },
  { x: 8,  y: 62, rot: 20  },
  { x: 20, y: 82, rot: -15 },
  { x: 28, y: 18, rot: 5   },
  { x: 35, y: 48, rot: 30  },
  { x: 30, y: 72, rot: -5  },
  { x: 44, y: 8,  rot: 18  },
  { x: 47, y: 58, rot: -20 },
  { x: 50, y: 88, rot: 10  },
  { x: 58, y: 28, rot: 0   },
  { x: 63, y: 72, rot: 25  },
  { x: 70, y: 12, rot: -12 },
  { x: 74, y: 50, rot: 15  },
  { x: 80, y: 82, rot: -8  },
  { x: 88, y: 35, rot: 22  },
  { x: 92, y: 65, rot: -18 },
  { x: 96, y: 8,  rot: 8   },
];

const SWIRLS = [
  { x: 10, y: 48, rot: 0   },
  { x: 22, y: 92, rot: 30  },
  { x: 38, y: 30, rot: -20 },
  { x: 42, y: 78, rot: 15  },
  { x: 54, y: 42, rot: -10 },
  { x: 60, y: 92, rot: 25  },
  { x: 68, y: 20, rot: -5  },
  { x: 78, y: 62, rot: 12  },
  { x: 86, y: 10, rot: -25 },
  { x: 94, y: 85, rot: 18  },
];

const SWIRL_PATH = "M 14,0 C 14,-14 -14,-14 -14,0 C -14,10 -6,16 0,12 C 6,8 8,2 4,-2 C 2,-5 -2,-4 -2,-1 C -2,1 0,2 1,1";

export default function DoodleBackground() {
  const strokeProps = {
    stroke: '#000', strokeWidth: 4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  return (
    <div className={styles.bg} aria-hidden>
      {CROSSES.map((d, i) => (
        <div key={`x-${i}`} className={styles.doodle}
          style={{ left: `${d.x}%`, top: `${d.y}%`, transform: `rotate(${d.rot}deg)` }}>
          <svg width="40" height="40" viewBox="-20 -20 40 40" overflow="visible">
            <line x1="-13" y1="-13" x2="13" y2="13" {...strokeProps} />
            <line x1="13"  y1="-13" x2="-13" y2="13" {...strokeProps} />
          </svg>
        </div>
      ))}

      {SWIRLS.map((d, i) => (
        <div key={`swirl-${i}`} className={styles.doodle}
          style={{ left: `${d.x}%`, top: `${d.y}%`, transform: `rotate(${d.rot}deg)` }}>
          <svg width="40" height="40" viewBox="-20 -20 40 40" overflow="visible">
            <path d={SWIRL_PATH} {...strokeProps} />
          </svg>
        </div>
      ))}
    </div>
  );
}
