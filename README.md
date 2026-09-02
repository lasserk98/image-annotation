# Segmentation Annotator

A lightweight, browser-only tool for collecting polygon segmentation annotations
from study participants. Images are loaded from the participant's local disk and
never leave their browser — only the resulting annotation coordinates (as JSON)
get exported.

Built for running annotation studies: participants identify themselves with a
student ID, draw polygons around structures in a set of local images, assign
each shape a class, and download a single JSON file with their results to send
back to you.

## Quickstart

```bash
npm install
npm run dev
```

Open the printed local URL. To build a static production bundle:

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally to sanity-check it
```

`dist/` is a fully static site — every file inside it can be hosted anywhere
(GitHub Pages, Netlify, a plain web server, or opened as a zip and run from
`file://`) with no backend required.

## How participants use it

1. Enter their student ID (validated against the roster you configure, see below).
2. Drag & drop, or click "+ Add", to load one or more local images. Images are
   read straight into the browser (as object URLs) and are never uploaded.
3. Pick a class in the left sidebar (or press `1`-`9`).
4. Click **+ New shape** (or press `N`), then click points on the image to
   place a polygon outline. Click back on the first point (or press `Enter`)
   to close it.
5. Refine a shape: drag any vertex to move it, double-click a vertex to delete
   it, or double-click an edge to insert a new vertex there.
6. Switch between loaded images with the `‹ ›` toolbar buttons or arrow keys.
7. When done, click **Export** in the header to download one JSON file with
   every image's annotations, the student ID, and a timestamp.

Other shortcuts: `Ctrl+Z` / `Ctrl+Shift+Z` undo/redo (per image), `Delete`
removes the selected shape or vertex, `Esc` cancels the shape being drawn.

## Configuring the study

Class and study settings live in `src/config/` and are bundled into the app
at build time — edit these, then rebuild/redeploy. The roster is handled
differently (see below).

### `classes.json`

The list of classes participants can assign to a shape, in order (so `1`-`9`
map to the first nine entries):

```json
[{ "id": "class-1", "name": "Class A", "color": "#ef4444" }]
```

### `public/roster.json`

```json
{ "ids": ["s1234567", "s7654321"] }
```

Unlike the other config files, the roster is loaded at *runtime* via
`fetch('/roster.json')` rather than bundled at build time — so it lives in
`public/` (served as a plain static file) and this file **doesn't exist in
git at all** (it's gitignored). If `ids` is non-empty, only listed student
IDs can log in; if the file is missing or `ids` is empty, any non-empty ID
is accepted with no validation (the default, useful for testing).

Because it's fetched at runtime instead of imported, a missing roster file
never breaks the build — a fresh clone or CI checkout just falls back to
"accept any ID". Create `public/roster.json` locally with the real list
before building for a deployment that should enforce a roster; since it's
gitignored, real student IDs never enter this public repo's git history.
One caveat: this is a purely static app, so whatever is in `public/roster.json`
at build/deploy time ships as a plain downloadable file on the live site —
keeping it out of git avoids it living in the repo's history/GitHub UI, but
anyone who inspects network requests on the deployed site can still read
the list. Fine for identifying participants, not a real secret.

### `study.json`

```json
{
  "studyName": "Segmentation Annotation Study",
  "instructions": "Shown behind the ⓘ icon in the header.",
  "treatments": []
}
```

If `treatments` is non-empty, participants pick one at login (recorded in
their export). You can also assign a treatment via URL, e.g.
`https://your-deploy-url/?treatment=A` — this skips the picker and locks the
treatment for that link, handy for sending different participants different
links.

## Annotation data format

Each export is one JSON file:

```json
{
  "studentId": "s1234567",
  "treatment": "A",
  "exportedAt": "2026-09-01T12:00:00.000Z",
  "images": [
    {
      "filename": "case_003.png",
      "width": 1920,
      "height": 1080,
      "shapes": [
        {
          "id": "shape-...",
          "classId": "class-1",
          "className": "Class A",
          "points": [[120.5, 300.1], [180.2, 305.9], [150, 260]],
          "area": 1713.44
        }
      ]
    }
  ]
}
```

`points` are in original-image pixel coordinates (regardless of zoom/pan
during annotation), so they can be rasterized and compared directly against
ground-truth masks of the same images.

## Deploying so participants can just open a link

This repo is public and deploys automatically via GitHub Pages: every push
to `main` runs `.github/workflows/deploy.yml`, which builds the app and
publishes `dist/` to **https://lasserk98.github.io/image-annotation/**. No
server code or database is required for the default "download only"
workflow this tool implements — check progress under the repo's **Actions**
tab, and the live URL under **Settings → Pages**.

Since `roster.json` is gitignored (see above), make sure it has the real
student IDs you want *before* pushing the commit that should go live —
whatever is in your local `src/config/roster.json` at build time is what
ends up in the deployed bundle.

## Privacy

Loaded images are held only in the browser tab's memory (as blob/object
URLs) for the current session and are never sent anywhere. Closing or
reloading the tab discards them — export before navigating away, and the
tool will warn you if you try to leave with unexported annotations.
