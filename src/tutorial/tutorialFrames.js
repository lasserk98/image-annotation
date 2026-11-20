// The tutorial annotates a CC0 photo of a cat (public/tutorial/cat.jpg, see the
// README next to it), never a study or medical image, so no study image data
// lands in the public repo. Coordinates are in the 400×300 figure space; the
// 800×600 photo is scaled into it. The outline is deliberately close-fitting
// but hand-placed, as a participant's would be.
export const FIGURE_SIZE = { width: 400, height: 300 }

export const CAT_OUTLINE = [
  { x: 92, y: 103 },
  { x: 116, y: 118 },
  { x: 138, y: 115 },
  { x: 147, y: 113 },
  { x: 161, y: 121 },
  { x: 160, y: 133 },
  { x: 175, y: 147 },
  { x: 206, y: 152 },
  { x: 231, y: 169 },
  { x: 245, y: 194 },
  { x: 252, y: 225 },
  { x: 254, y: 247 },
  { x: 266, y: 252 },
  { x: 300, y: 256 },
  { x: 344, y: 260 },
  { x: 359, y: 252 },
  { x: 369, y: 256 },
  { x: 369, y: 267 },
  { x: 356, y: 277 },
  { x: 312, y: 269 },
  { x: 266, y: 264 },
  { x: 250, y: 266 },
  { x: 231, y: 272 },
  { x: 200, y: 280 },
  { x: 188, y: 283 },
  { x: 177, y: 278 },
  { x: 181, y: 269 },
  { x: 162, y: 259 },
  { x: 144, y: 264 },
  { x: 134, y: 272 },
  { x: 125, y: 270 },
  { x: 123, y: 261 },
  { x: 109, y: 242 },
  { x: 117, y: 234 },
  { x: 122, y: 219 },
  { x: 120, y: 200 },
  { x: 117, y: 181 },
  { x: 112, y: 167 },
  { x: 106, y: 159 },
  { x: 102, y: 150 },
  { x: 103, y: 134 },
]

// Number of vertices already placed in the "click points" frame.
export const PARTIAL_COUNT = 7

// Per frame:
// - `shape`: 'none' | 'open' (first `count` vertices, still drawing) | 'closed'
// - `cursor`: where the mouse pointer is drawn, or null
// - `closeRing`: ring around the first vertex (click it again to close)
// - `highlight`: which part of the mock interface is emphasised
// - `markers`: edit gestures shown on the closed shape
export const TUTORIAL_FRAMES = [
  { id: 'goal', shape: 'closed', cursor: null, closeRing: false, highlight: null, markers: [] },
  { id: 'class', shape: 'none', cursor: null, closeRing: false, highlight: 'class', markers: [] },
  { id: 'newShape', shape: 'none', cursor: null, closeRing: false, highlight: 'newShape', markers: [] },
  {
    id: 'points',
    shape: 'open',
    count: PARTIAL_COUNT,
    cursor: CAT_OUTLINE[PARTIAL_COUNT],
    closeRing: false,
    highlight: null,
    markers: [],
  },
  {
    id: 'close',
    shape: 'open',
    count: CAT_OUTLINE.length,
    cursor: CAT_OUTLINE[0],
    closeRing: true,
    highlight: null,
    markers: [],
  },
  {
    id: 'refine',
    shape: 'closed',
    cursor: null,
    closeRing: false,
    highlight: null,
    markers: [
      { type: 'drag', from: CAT_OUTLINE[8], to: { x: CAT_OUTLINE[8].x + 14, y: CAT_OUTLINE[8].y - 9 } },
      { type: 'insert', at: { x: 219, y: 161 } },
    ],
  },
  { id: 'done', shape: 'closed', cursor: null, closeRing: false, highlight: 'instances', markers: [] },
]
