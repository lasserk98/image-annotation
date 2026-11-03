# Segmentation Annotator

A lightweight, browser-only tool for collecting polygon segmentation annotations
from study participants. Images are loaded from the participant's local disk and
never leave their browser — only the resulting annotation coordinates (as JSON)
get exported.

Built for running annotation studies: participants open a personal link (which
carries their participant ID), draw polygons around structures in a local
image, assign each shape a
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

## Four variants

One codebase builds four products, selected at build time with
`VITE_APP_VARIANT`:

| Variant | Build | What it is |
|---|---|---|
| `creator` (default) | `npm run build` | The open tool: no participant ID, class editing always available, and an Export button that asks for a file name. Exports contain polygon shapes only — never the images. This is what the current deployed site serves. |
| `phase1` | `npm run build:phase1` | Study phase 1: consent, the pre-study survey, then annotating one image. Served at `<site>/phase1/`. |
| `phase2` | `npm run build:phase2` | Study phase 2, right after the video: the post-intervention survey (with the video ratings), then annotating one image. No consent step. Served at `<site>/phase2/`. |
| `phase3` | `npm run build:phase3` | Study phase 3, the follow-up some weeks later: the follow-up survey, then annotating one image. No consent step. Served at `<site>/phase3/`. |

The three phases are the same flow (password, [consent in phase 1], survey,
annotate one image, export) and differ only in the table in `src/phases.js`:
survey, consent, password, image to expect. A participant always arrives through
a **personal link** that carries their ID — see [Running the study](#running-the-study).
All three have a fixed class list that cannot be changed, and German by default
(English switch).

For development, `npm run dev` starts the creator variant and
`npm run dev:phase1` / `dev:phase2` / `dev:phase3` start a phase (they read
`VITE_APP_VARIANT`, which `.env.phase1` … `.env.phase3` set for their modes). A
phase page needs a link with an ID, e.g. `http://localhost:5173/?id=P-1`. The
participant-flow sections below describe any of the phases.

## How participants use it

The study's classes are fixed in the app (see
[Study and creator classes](#study-and-creator-classes) below) — participants
can only pick from that list.

1. Open the personal link from the invitation email (it carries the
   participant ID, which is never shown or typed) and enter the study password
   of that phase. In phase 1 then accept the consent notice; in every phase
   complete the survey (see [The study survey](#the-study-survey)). The
   annotation workspace opens once the survey is submitted.
2. Drag & drop, or click "+ Add / .zip", to load the phase's image (a folder or
   a .zip with images works too). Images are read straight into the browser (as
   object URLs) and are never uploaded. The empty image area names the file to
   load, and a different image or more than one is flagged with a warning.
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
9. When done, click **Export** in the header. In a study phase this saves
   one file named after the participant's ID and the phase
   (`P-1234567_phase1.json`) holding the survey answers and every image's
   annotations (never the images), and a dialog says to upload that file to the
   shared study folder and what comes next. The dialog tells the participant
   only how the file name ends (`_phase1.json`), never the ID in front of it. If
   the participant exports again they upload only the newest file. In the creator
   variant Export asks for a file name and writes the annotations only. If any
   loaded image is still unannotated the
   header counter turns amber and Export asks for confirmation first, naming
   the frames it is about to write out empty — unannotated frames are also
   flagged in the image list, so they're easy to find and finish.

Full instructions and the keyboard shortcut reference are available in-app
behind the ⓘ icon in the header (translated along with the rest of the UI).

## Configuring the study

### Study and creator classes

- **Study phases**: the classes are the fixed list in
  `src/config/studyClasses.json`. There is no Creator Mode, no way to add,
  rename, delete or load classes, and a class list saved in the browser is
  ignored. To change the list, edit that file and redeploy.
- **Creator variant**: class editing is always available (create, rename,
  delete, load and export a class list), and the list is saved in that
  browser's `localStorage`.

The study passwords are checked in the browser, so they ship inside the public
JS bundle and can be read by anyone using their browser's dev tools. They keep
casual visitors out of a study page; they are **not real access control**.

### The study surveys

Each phase has its own survey: phase 1 the pre-study survey, phase 2 the
post-intervention survey, phase 3 the follow-up survey (five statements, one per
page). In phase 1 a participant first sees a consent notice,
then the three-part survey (demographics and AI usage, a pre-intervention
questionnaire, and ten knowledge questions) before the workspace opens. Phase 2
asks 18 questions, one per page: the post-intervention questionnaire (10,
agreement scale), the AI-augmented video rating (5) and the conventional video
rating (3), both in school grades 1–6. Progress survives a reload; the
participant can go back until they submit, after which the answers are locked,
and logging out clears everything.

- **Wording** lives in `src/survey/preSurvey.js` (phase 1),
  `src/survey/postSurvey.js` (phase 2) and `src/survey/followUpSurvey.js`
  (phase 3), as data, always in German (only buttons and messages follow the
  DE/EN switch). It comes from the study owner and must not be changed without
  their confirmation. Phase 2's answer ids are `post.1`–`post.10`, `ai.1`–`ai.5`,
  `conv.1`–`conv.3`; phase 3's are `fu.1`–`fu.5`.
- **Consent text** lives in `src/survey/consentText.js`: the study information,
  the Datenschutz notices and the declaration, worded by the study owner and
  the data protection officers. Bump its `version` with every change of the
  wording — the version is stored with each participant's consent
  (`survey.consentVersion`). The second checkbox's label (consent to the data
  processing) is our wording, not part of their text.
- **Answers** are stored raw, keyed by stable item ids (`demo.*`, `pre.1`–`pre.10`,
  `mc.1`–`mc.10`). This repository holds **no answer key and does no scoring**:
  that happens later, outside this public repo. A test checks that the survey
  definition has no field that could hold a correct answer.
- **Export**: the answers go into the participant's `<id>_phaseN.json` (see
  [Annotation data format](#annotation-data-format)). They are kept only in
  the browser session until then, and logging out before exporting discards
  them, so the participant would have to answer the survey again.

### `src/config/classes.json` — the default class list

Bundled into the app at build time. Ships empty (`[]`) — there is no default
class list in the creator variant; classes are set up there before annotating.
(The study phases use `src/config/studyClasses.json` instead.)

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

### `src/config/study.json` — study name, instructions, treatments, passwords

```json
{
  "studyName": { "en": "Segmentation Annotation Study", "de": "…" },
  "instructions": { "en": "Shown in the usage (ⓘ) modal.", "de": "…" },
  "treatments": [],
  "phase1Password": "…",
  "phase2Password": "changeme-phase2",
  "phase3Password": "changeme-phase3"
}
```

`studyName`/`instructions` can be a plain string (shown as-is in both
languages) or `{ "en": "...", "de": "..." }` for translated copy. If
`treatments` is non-empty, participants pick one at login (recorded in
their export). You can also assign a treatment via the link, e.g.
`…/phase1/?id=P-1&treatment=A` — this skips the picker and locks the
treatment for that link, in every phase. Each phase has its own password
(`phase1Password` … `phase3Password`), which the participant enters on that
page — see above for what that does and does not protect against. **Change
`phase2Password` and `phase3Password` from their `changeme-…` values before the
study.**

### Running the study

The study is three pages on one site, each a build of the same code
(`<site>/phase1/`, `/phase2/`, `/phase3/`; see [Four variants](#four-variants)).
Phases 1 and 2 happen in one sitting with a video in between, phase 3 some weeks
later:

| Step | What the participant does | Link / material |
|---|---|---|
| 1 | Downloads the phase 1 image, opens phase 1, answers the pre-survey, annotates the image, exports and uploads `<id>_phase1.json` | Nextcloud: image (password-protected share); phase 1 page; Nextcloud file drop |
| 2 | Watches the video | Nextcloud: video share (password, "hide download", ideally an expiry date) |
| 3 | Downloads the phase 2 image, opens phase 2, answers the post-survey, annotates the image, exports and uploads `<id>_phase2.json` | Nextcloud: image; phase 2 page; file drop |
| 4 (weeks later) | Same for the follow-up: `<id>_phase3.json` | Nextcloud: image; phase 3 page; file drop |

**Personal links.** The participant's ID is never typed and never shown: it
comes from the link, `https://<site>/phase1/?id=P-1234567` (the same ID in all
three phases, plus `&treatment=…` if there are groups). A page opened without a
valid `id` shows "Link ungültig" and cannot be used, and a session saved in the
browser for another ID is ignored, so answers can never be exported under the
wrong ID. An ID may only contain letters, digits, `.`, `_` and `-` (it ends up
in the file name) and may not start with a dot. The ID is visible in the link
and in the exported file name (`P-1234567_phase1.json`) — that is how you tell
the uploads apart.

**Images.** Each phase expects one image named in `src/phases.js`
(`imageName`: `phase1`, `phase2`, and none yet for phase 3), saved as any image
format (`phase1.png`, `phase1.jpg`, …) — name the files you put on Nextcloud
that way. The tool shows the name to load and warns when another image, or more
than one, is loaded. It does not block: the check is only a nudge. Set
`expectedImages` in `src/phases.js` if a phase needs more than one image.

**Nextcloud setup.**
- **Uploads**: a *File drop* share (upload only), so participants can add files
  but not see each other's. One link serves all phases, since the file names
  carry the phase. Nextcloud renames a duplicate instead of overwriting it.
- **Images**: a password-protected share link, download allowed.
- **Video**: a password-protected share link with *Hide download* on and, if you
  can, an expiry date.
- The Nextcloud share passwords are separate from the tool's phase passwords.
  Put both in the email, not in the links.

**Sending it out.** German email templates for phases 1 + 2 and for phase 3 are
in [`docs/study-emails.de.md`](docs/study-emails.de.md). One email for phases 1
and 2 (they are one sitting) and one weeks later for phase 3 keeps the order
clear.

**Before each send-out:**
- [ ] `phase2Password` / `phase3Password` changed from `changeme-…`, and the
      same values put in the emails.
- [ ] The image to expect for phase 3 set in `src/phases.js` before phase 3
      goes out.
- [ ] The data protection officers have seen the consent text, including what it
      leaves out: hosting on GitHub Pages (visitors' IP addresses), uploads via
      NextCloud, the AI-usage and knowledge-test answers, and the follow-up
      session some weeks later.
- [ ] A dry run with two or three people through the real emails on Windows and
      macOS, then check the uploaded files load in your analysis.

**Your analysis** now receives three files per participant (`<id>_phase1.json`,
`_phase2.json`, `_phase3.json`), each with `schemaVersion` 5 and a `phase` field,
and — unlike before — phase 2 and 3 files also contain the annotated image. The
old `<id>.json` and `<id>_post.json` no longer exist.

Notes:
- Each phase keeps its progress under its own `localStorage` key, so phases in
  the same browser never leak into each other. Logging out before exporting
  discards the answers.
- Nothing stops a participant from opening phase 2 before phase 1 or before the
  video: without a backend the order rests on the order of the emails.

### Adding more UI languages

All interface strings live in `src/i18n/translations.js` as flat
`{ 'key': '...' }` dictionaries per language. Add a new language object
there (and to the `LANGUAGES` array) to support more than English/German.

## Annotation data format

Each export is one JSON file. A study phase saves it as
`<participant ID>_<phase>.json`, e.g. `P-1234567_phase1.json` (characters that
are unsafe in a file name become `_`), and includes the survey; the creator
variant has no participant ID, no `phase` and no `survey` key. This is the input
format of the (separate, private) analysis step.

```json
{
  "participantId": "P-1234567",
  "phase": "phase1",
  "treatment": null,
  "exportedAt": "2026-09-01T12:00:00.000Z",
  "tool": "image-annotation",
  "schemaVersion": 5,
  "survey": {
    "version": "pre-1",
    "consentAcceptedAt": "2026-09-01T11:50:00.000Z",
    "consentVersion": "consent-1",
    "completedAt": "2026-09-01T11:58:00.000Z",
    "answers": { "demo.age": 24, "demo.gender": "divers", "pre.1": 2, "mc.1": "C" }
  },
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

`survey.answers` holds raw values keyed by item id: whole numbers for Likert
and number items, the chosen letter (`A`–`E`) for knowledge questions, text for
the optional free answer (left out when empty). Nothing in the file is scored
and no correct answers are stored. `exportedAt` tells two exports of the same
participant apart.

All three phase files have this same shape, each with its own survey. Which
survey it is shows in `survey.version`: `pre-1` (phase 1), `post-1` (phase 2) or
`followup-1` (phase 3). `consentAcceptedAt` and `consentVersion` are `null` in
phases 2 and 3, which have no consent step; `consentVersion` names the wording
of the consent text that was accepted. Phase 2's answers are
numbers keyed `post.*`, `ai.*` and `conv.*`. The `images` entry of each file
holds that phase's annotated image.

> **`schemaVersion` 5** added `survey.consentVersion`, the version of the consent
> text the participant accepted (`null` where there is no consent step, or where
> consent was given before versions were recorded). Changing the wording does
> not ask earlier participants again: bump `version` and decide separately
> whether they need to re-consent.
>
> **`schemaVersion` 4** added the top-level `phase` (`phase1` | `phase2` |
> `phase3`; `null` for the creator). Every phase now carries its annotations as
> well as its survey: the separate answers-only post file (`<id>_post.json`,
> built by the former post page) is gone, and the study file `<id>.json` is now
> `<id>_phase1.json`.
>
> **`schemaVersion` 3** added the optional top-level `survey` object (study
> variant only); the rest is unchanged from version 2.
>
> **`schemaVersion` 2** renamed the top-level `studentId` field to
> `participantId`. Nothing else about the payload changed, so a reader that
> needs to accept both can fall back:
> `pid = data.get("participantId") or data["studentId"]`.

## Deploying so participants can just open a link

This repo is public and deploys automatically via GitHub Pages: every push
to `main` runs `.github/workflows/deploy.yml`, which builds the app and
publishes `dist/` to **https://lasserk98.github.io/image-annotation/**
(the creator tool; the workflow also builds the three study phases into
`dist/phase1/`, `dist/phase2/` and `dist/phase3/`, served at `/phase1/`,
`/phase2/` and `/phase3/`). No
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
