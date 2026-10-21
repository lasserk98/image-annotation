# Segmentation Annotator

A lightweight, browser-only tool for collecting polygon segmentation annotations
from study participants. Images are loaded from the participant's local disk and
never leave their browser — only the resulting annotation coordinates (as JSON)
get exported.

Built for running annotation studies: participants enter a participant ID, draw
polygons around structures in a set of local images, assign each shape a
class, and download a single JSON file with their results to send back to
you. Available in English and German (toggle in the top right).

The workspace is a three-column layout: **classes and images on the left**, the
**canvas in the middle**, and the **instances marked on the current image on the
right**, grouped by class. Either side panel can be collapsed with the two
buttons at the far left of the header to give the canvas more room.

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

## Two variants

One codebase builds two products, selected at build time with
`VITE_APP_VARIANT`:

| Variant | Build | What it is |
|---|---|---|
| `creator` (default) | `npm run build` | The open tool: no participant ID, class editing always available, and an Export button that asks for a file name. Exports contain polygon shapes only — never the images. This is what the current deployed site serves. |
| `study` | `npm run build:study` | The participant flow described below: a participant ID and shared study password to enter, a fixed class list that cannot be changed, German by default (English switch). |

For development, `npm run dev` starts the creator variant and
`npm run dev:study` starts the study variant (both read `VITE_APP_VARIANT`,
which `.env.study` sets for the `study` mode). The
participant-flow sections below describe the `study` variant.

## How participants use it

The study's classes are fixed in the app (see
[Study and creator classes](#study-and-creator-classes) below) — participants
can only pick from that list.

1. Enter a participant ID (any non-empty value — there's no roster to validate
   against, but it's editable later via the ✎ next to Export in case of a typo)
   and the shared study password. Then accept the consent notice and complete
   the survey (see [The study survey](#the-study-survey)); the annotation
   workspace opens once the survey is submitted.
2. Drag & drop, or click "+ Add", to load one or more local images. Images are
   read straight into the browser (as object URLs) and are never uploaded.
3. Pick a class in the left panel (or press `1`-`9` for the first nine).
   Classes are listed alphabetically; long lists scroll and gain a filter box,
   and the active class is echoed next to **+ New shape**.
4. Click **+ New shape** (or press `N`), then click points on the image to
   place a polygon outline. Click back on the first point (or press `Enter`)
   to close it.
5. Refine a shape: drag any vertex to move it, double-click a vertex to delete
   it, or double-click an edge to insert a new vertex there.
6. Review what's marked in the **Instances** panel on the right. Each row is
   filled with its class colour and ordered by class, hovering one highlights
   and names it on the image, and clicking the class name on the row moves that
   instance to a different class.
7. Zoom with the scroll wheel over the canvas (`Shift`+scroll pans
   horizontally), drag to pan, **Fit** to reset.
8. Switch between loaded images with the `‹ ›` toolbar buttons or arrow keys.
9. When done, click **Export** in the header to download one JSON file with
   every image's annotations. If any loaded image is still unannotated the
   header counter turns amber and Export asks for confirmation first, naming
   the frames it is about to write out empty — unannotated frames are also
   flagged in the image list, so they're easy to find and finish.

Full instructions and the keyboard shortcut reference are available in-app
behind the ⓘ icon in the header (translated along with the rest of the UI).

## Configuring the study

### Study and creator classes

- **Study variant**: the classes are the fixed list in
  `src/config/studyClasses.json`. There is no Creator Mode, no way to add,
  rename, delete or load classes, and a class list saved in the browser is
  ignored. To change the list, edit that file and redeploy.
- **Creator variant**: class editing is always available (create, rename,
  delete, load and export a class list), and the list is saved in that
  browser's `localStorage`.

The study password is checked in the browser, so it ships inside the public JS
bundle and can be read by anyone using their browser's dev tools. It keeps
casual visitors out of the study page; it is **not real access control**.

### The study survey

After login a study participant sees a consent notice and then a three-part
survey (demographics and AI usage, a pre-intervention questionnaire, and ten
knowledge questions) before the workspace opens. Progress survives a reload;
the participant can go back until they submit, after which the answers are
locked, and logging out clears everything.

- **Wording** lives in `src/survey/preSurvey.js`, as data, always in German
  (only buttons and messages follow the DE/EN switch). It comes from the study
  owner and must not be changed without their confirmation.
- **Consent text** lives in `src/survey/consentText.js` and is currently a
  **placeholder** — replace it with the real wording before the pilot.
- **Answers** are stored raw, keyed by stable item ids (`demo.*`, `pre.1`–`pre.10`,
  `mc.1`–`mc.10`). This repository holds **no answer key and does no scoring**:
  that happens later, outside this public repo. A test checks that the survey
  definition has no field that could hold a correct answer.
- **Not exported yet**: the answers are kept in the browser session; writing
  them into the downloaded file is a later step, so do not hand the study out
  to participants before that is done.

### `src/config/classes.json` — the default class list

Bundled into the app at build time. Ships empty (`[]`) — there is no default
class list in the creator variant; classes are set up there before annotating.
(The study variant uses `src/config/studyClasses.json` instead.)

Classes can be set up in two ways, and both are saved to that browser's
`localStorage` so they stay active across reloads:

- **Load a class list from a file** via the "Load" button above the class
  panel — pick a local `.json` file shaped either as `["Name A", "Name B"]`
  or `[{ "name": "Name A", "color": "#ef4444" }]` (`id` and `color` are
  optional and auto-generated/assigned if omitted). Handy for handing out a
  study-specific class list as a plain file alongside the images, without
  needing a rebuild. `samples/classes-ci-surgery-de.json` is a real 34-class
  example (German cochlear implant surgery landmarks) you can use to try
  this out.
- **Create classes one at a time** by typing a name and clicking "+ Add
  class" in the panel — no file needed. Each class can also be renamed in
  place, or deleted with the ✕ next to it (deleting a class already in use
  asks for confirmation first, since existing shapes are left without a
  class and need reassigning afterwards in the instances panel).

"Export" prompts for a file name (defaulting to `classes.json`; any other
extension you type is replaced with `.json`) and downloads the current class
list under it, for reuse or backup. "Clear all" removes every class from the
list.

Whichever list is in use, the app **sorts it alphabetically by name** before
displaying it, so the order in the file only affects which palette colour each
name is assigned. The comparison is case- and accent-insensitive (`Ä` sorts
with `A`) and digit-aware (`Class 2` before `Class 10`), and it is pinned to a
single locale so every participant gets the same order — and therefore the same
`1`-`9` shortcut mapping — regardless of their browser's language settings.

### `src/config/study.json` — study name, instructions, treatments, study password

```json
{
  "studyName": { "en": "Segmentation Annotation Study", "de": "…" },
  "instructions": { "en": "Shown in the usage (ⓘ) modal.", "de": "…" },
  "treatments": [],
  "studyPassword": "changeme"
}
```

`studyName`/`instructions` can be a plain string (shown as-is in both
languages) or `{ "en": "...", "de": "..." }` for translated copy. If
`treatments` is non-empty, participants pick one at login (recorded in
their export). You can also assign a treatment via URL, e.g.
`https://your-deploy-url/?treatment=A` — this skips the picker and locks the
treatment for that link, handy for sending different participants different
links. `studyPassword` is the shared password participants enter with their ID
— see above for what it does and does not protect against. **Change it from
`changeme` before the study.**

### Adding more UI languages

All interface strings live in `src/i18n/translations.js` as flat
`{ 'key': '...' }` dictionaries per language. Add a new language object
there (and to the `LANGUAGES` array) to support more than English/German.

## Annotation data format

Each export is one JSON file:

```json
{
  "participantId": "P-1234567",
  "treatment": "A",
  "exportedAt": "2026-09-01T12:00:00.000Z",
  "tool": "image-annotation",
  "schemaVersion": 2,
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

> **`schemaVersion` 2** renamed the top-level `studentId` field to
> `participantId`. Nothing else about the payload changed, so a reader that
> needs to accept both can fall back:
> `pid = data.get("participantId") or data["studentId"]`.

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
