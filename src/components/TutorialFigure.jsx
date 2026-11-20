import { CAT_OUTLINE, FIGURE_SIZE } from '../tutorial/tutorialFrames'

const toPoints = (pts) => pts.map(({ x, y }) => `${x},${y}`).join(' ')

// The example photo plus the annotation overlay for one tutorial frame.
// BASE_URL keeps the path right under every phase's own build folder.
const PHOTO_URL = `${import.meta.env.BASE_URL}tutorial/cat.jpg`

function Photo() {
  return (
    <image
      href={PHOTO_URL}
      width={FIGURE_SIZE.width}
      height={FIGURE_SIZE.height}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    />
  )
}

function Cursor({ x, y }) {
  return (
    <path
      d="M0 0 L0 17 L4.5 13 L7.5 20 L10 19 L7 12 L13 12 Z"
      transform={`translate(${x} ${y})`}
      fill="#fff"
      stroke="#16181d"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  )
}

function Marker({ marker }) {
  if (marker.type === 'drag') {
    const { from, to } = marker
    return (
      <g data-testid="marker-drag">
        <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--info)" strokeWidth="2" strokeDasharray="3 3" />
        <circle cx={to.x} cy={to.y} r="5" fill="var(--info)" />
      </g>
    )
  }
  return (
    <g data-testid="marker-insert">
      <circle cx={marker.at.x} cy={marker.at.y} r="8" fill="var(--surface)" stroke="var(--info)" strokeWidth="2" />
      <path d={`M${marker.at.x - 4} ${marker.at.y} h8 M${marker.at.x} ${marker.at.y - 4} v8`} stroke="var(--info)" strokeWidth="2" />
    </g>
  )
}

export default function TutorialFigure({ frame, label }) {
  const { shape, count, cursor, closeRing, markers } = frame
  const drawn = shape === 'closed' ? CAT_OUTLINE : shape === 'open' ? CAT_OUTLINE.slice(0, count) : []

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${FIGURE_SIZE.width} ${FIGURE_SIZE.height}`}
      className="w-full h-auto rounded-lg"
      style={{ border: '1px solid var(--border)' }}
    >
      <Photo />
      {shape === 'closed' && (
        <polygon
          data-testid="outline-closed"
          points={toPoints(drawn)}
          fill="var(--accent-soft-strong)"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )}
      {shape === 'open' && (
        <polyline
          data-testid="outline-open"
          points={toPoints(drawn)}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )}
      {drawn.map(({ x, y }, i) => (
        <circle key={i} cx={x} cy={y} r="3.2" fill="#fff" stroke="var(--accent)" strokeWidth="1.6" data-testid="vertex" />
      ))}
      {closeRing && <circle cx={CAT_OUTLINE[0].x} cy={CAT_OUTLINE[0].y} r="11" fill="none" stroke="var(--info)" strokeWidth="2" />}
      {markers.map((m) => (
        <Marker key={m.type} marker={m} />
      ))}
      {cursor && <Cursor x={cursor.x} y={cursor.y} />}
    </svg>
  )
}
