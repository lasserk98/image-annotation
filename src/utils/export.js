import { polygonArea } from './geometry'

// Builds the full submission payload for the current session. Coordinates
// are recorded in original-image pixel space so they can be compared
// directly against ground-truth masks regardless of how the browser
// happened to render/zoom the image during annotation.
// The Creator variant has no participant, so `participantId` is null there.
// schemaVersion 2 renamed the top-level `studentId` field to `participantId`.
// schemaVersion 3 added the optional top-level `survey` (study phases only);
// everything else is as before. The survey is copied in raw: answers by item
// id, no scoring.
// schemaVersion 4 added the top-level `phase` ('phase1' | 'phase2' | 'phase3',
// null for the Creator): a participant uploads one file per phase, and every
// phase now carries the survey and the annotations of its image.
// schemaVersion 5 added `survey.consentVersion`, the version of the consent
// text that was accepted (null where there is no consent step, or where the
// consent was given before versions were recorded).
// schemaVersion 6 added `startedAt` and `finishedAt` to every shape: when its
// first point was placed and when it was closed (null if not recorded).
export function buildExportData({
  participantId = null,
  phase = null,
  treatment,
  images,
  shapesByImage,
  classes,
  survey = null,
}) {
  const classById = Object.fromEntries(classes.map((c) => [c.id, c]))

  return {
    participantId,
    phase,
    treatment: treatment || null,
    exportedAt: new Date().toISOString(),
    tool: 'image-annotation',
    schemaVersion: 6,
    ...(survey && { survey: copySurvey(survey) }),
    images: images.map((img) => {
      const shapes = shapesByImage[img.id] || []
      return {
        filename: img.name,
        width: img.width,
        height: img.height,
        shapes: shapes.map((shape) => ({
          id: shape.id,
          classId: shape.classId,
          className: classById[shape.classId]?.name ?? shape.classId,
          points: shape.points.map((p) => [round(p.x), round(p.y)]),
          area: Math.abs(polygonArea(shape.points)),
          startedAt: shape.startedAt ?? null,
          finishedAt: shape.finishedAt ?? null,
        })),
      }
    }),
  }
}

function copySurvey({ version, consentAcceptedAt, consentVersion, completedAt, answers }) {
  return { version, consentAcceptedAt, consentVersion, completedAt, answers: { ...answers } }
}

function round(n) {
  return Math.round(n * 100) / 100
}

// Guarantees a ".json" extension regardless of what the user typed (or left
// blank), so an exported class list can never end up saved under some other
// file type. Replaces a trailing extension rather than appending blindly, so
// re-submitting an unchanged "classes.json" round-trips to itself.
export function toJsonFilename(name, fallback = 'classes') {
  const base =
    String(name)
      .trim()
      .replace(/\.[A-Za-z0-9]{1,10}$/, '')
      .replace(/\.+$/, '') || fallback
  return `${base}.json`
}

// The file a participant uploads: named after their study ID so the analyst
// can tell submissions apart. Anything unsafe in a file name becomes `_`, and
// leading dots are dropped so the name can be neither hidden nor a path
// climb. Built directly rather than through `toJsonFilename`, which would
// read the tail of an ID like `P.12` as a file extension.
// The optional `suffix` is the phase, which tells the three files of one
// participant apart: `<id>_phase1.json`, `<id>_phase2.json`, `<id>_phase3.json`.
export function participantFilename(participantId, suffix = '') {
  const base = String(participantId ?? '')
    .trim()
    .replace(/[^A-Za-z0-9._-]/g, '_')
    .replace(/^\.+/, '')
  return `${base || 'study'}${suffix ? `_${suffix}` : ''}.json`
}

// How a phase's file name ends. The participant is told this much of the name
// (never the ID in front of it) so they can find the file to upload.
export function phaseFileEnding(phaseId) {
  return `_${phaseId}.json`
}

export function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
