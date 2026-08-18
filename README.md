# Shortlist

A resume engine that scores, rewrites, and tracks a job search, running entirely in the
browser. One HTML file, no framework, no build step, no dependencies.

**Live:** https://shortlist-production-95ce.up.railway.app

## What it does

- **Scores a resume against a specific job posting** on six weighted dimensions, and cites
  the exact line behind every finding. The whole rubric is published on the page.
- **Action plan.** Each recommendation carries a measured point gain: the fix is applied to a
  copy of the resume, the rubric is re-run, and the difference is reported. Safe fixes can be
  applied in one click, and every edit is undoable.
- **Rewrites bullets** into verb, object, method, result. It never invents a number. Where a
  metric belongs it leaves a labelled blank, because a figure you did not earn is a figure you
  cannot defend in an interview.
- **Imports PDF and .docx** in the page. A .docx is unzipped with `DecompressionStream`; a PDF
  has its streams inflated and each font's ToUnicode table read to turn glyph codes back into
  letters. If a file will not decode cleanly it is refused rather than scored on scrambled text.
- **Workspace:** saved versions, an application board, a score curve over time, and interview
  questions generated from your own bullets.
- **Job feed** across public job board APIs, covering healthcare and skilled trades as well as
  tech, scored against your resume.

## Privacy

Your resume is never uploaded. The engine, every lexicon and every rule, is in the page you
already downloaded, and the analysis runs locally. The server sends one file and stores
nothing. Saved versions live in your browser's local storage and can be deleted in one click.

The only outbound requests are the ones you trigger with the job feed, which reads public job
board APIs. Turn it off and the page makes no network requests at all.

## Running it

Any static host will do, since it is a single file.

```bash
npm start
```

Serves `index.html` on `PORT` (default 3000) with no dependencies.

Or just open `index.html` directly. Everything except the job feed works offline, though
some browsers block local storage on `file://`, so saved versions may not persist.

## Layout

| File | Purpose |
|------|---------|
| `index.html` | The entire application: markup, styles, and engine |
| `server.js` | Zero-dependency static host. Every route serves the app |
| `shortlist-artifact.html` | The same page without its document wrapper, for embedding |

## License

[MIT](LICENSE). Copyright (c) 2026 Francis Mercado.
