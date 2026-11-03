import { uid } from './id'

// A finished polygon. `startedAt` is when its first point was placed and
// `finishedAt` when it was closed (click on the first point, or Enter), both
// as ISO timestamps from the participant's clock. Later edits of the shape
// (moving or inserting a vertex, changing the class) leave them alone.
export function createShape({ classId, points, startedAt, finishedAt }) {
  return { id: uid('shape'), classId, points: [...points], startedAt, finishedAt }
}
