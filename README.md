# Segmentation Annotator

A lightweight, browser-only tool for collecting polygon segmentation annotations
from study participants. Images are loaded from the participant's local disk and
never leave their browser — only the resulting annotation coordinates (as JSON)
get exported.

Built for running annotation studies: participants enter a student ID, draw
polygons around structures in a set of local images, assign each shape a
class, and download a single JSON file with their results to send back to
you. Available in English and German (toggle in the top right).

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

1. Enter a name and student ID (only the ID is required — there's no roster
   to validate against, but both are editable later via the ✎ next to
   Export in case of a typo).
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
   every image's annotations.

Full instructions and the keyboard shortcut reference are available in-app
behind the ⓘ icon in the header (translated along with the rest of the UI).

## Configuring the study

### `src/config/classes.json` — the default class list

Bundled into the app at build time:

```json
[{ "id": "class-1", "name": "Class A", "color": "#ef4444" }]
```

Participants can also **load their own class list at runtime** via the
"Load" button above the class panel — pick a local `.json` file shaped
either as `["Name A", "Name B"]` or `[{ "name": "Name A", "color": "#ef4444" }]`
(`id` and `color` are optional and auto-generated/assigned if omitted). Once
loaded it's saved to that browser's `localStorage` and stays active across
reloads until "Reset" is clicked — handy for handing out a study-specific
class list as a plain file alongside the images, without needing a rebuild.
`samples/classes-ci-surgery-de.json` is a real 34-class example (German
cochlear implant surgery landmarks) you can use to try this out.

### `src/config/study.json` — study name, instructions, treatments

```json
{
  "studyName": { "en": "Segmentation Annotation Study", "de": "…" },
  "instructions": { "en": "Shown in the usage (ⓘ) modal.", "de": "…" },
  "treatments": []
}
```

`studyName`/`instructions` can be a plain string (shown as-is in both
languages) or `{ "en": "...", "de": "..." }` for translated copy. If
`treatments` is non-empty, participants pick one at login (recorded in
their export). You can also assign a treatment via URL, e.g.
`https://your-deploy-url/?treatment=A` — this skips the picker and locks the
treatment for that link, handy for sending different participants different
links.

### Adding more UI languages

All interface strings live in `src/i18n/translations.js` as flat
`{ 'key': '...' }` dictionaries per language. Add a new language object
there (and to the `LANGUAGES` array) to support more than English/German.

## Annotation data format

Each export is one JSON file:

```json
{
  "studentId": "s1234567",
  "studentName": "Jane Doe",
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
tab.

### Using a custom domain instead

Add a `public/CNAME` file containing just the domain (e.g.
`annotate.example.com`), then point its DNS at GitHub: a `CNAME` record to
`lasserk98.github.io` for a subdomain, or `A` records to GitHub's IPs for an
apex domain. You'll also need to register the domain on the Pages side —
`gh api -X PUT repos/lasserk98/image-annotation/pages -f cname=your.domain`
— before pushing the `public/CNAME` file. **Do this DNS step first, or push
the CNAME registration only once DNS is confirmed working** — GitHub starts
redirecting the default `github.io` URL to the custom domain as soon as
it's registered, which breaks the site for everyone until that domain
actually resolves. To go back to the plain `github.io` URL, delete
`public/CNAME`, push, and run
`gh api -X DELETE repos/lasserk98/image-annotation/pages` followed by
`gh api -X POST repos/lasserk98/image-annotation/pages -f build_type=workflow`
to clear it (a plain `PATCH` with an empty cname doesn't fully clear it).

## Privacy

Loaded images are held only in the browser tab's memory (as blob/object
URLs) for the current session and are never sent anywhere. Closing or
reloading the tab discards them — export before navigating away, and the
tool will warn you if you try to leave with unexported annotations. There is
no roster or other participant list bundled with the app, so no participant
data lives in this repo at all.
