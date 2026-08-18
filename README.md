# Resume Rubric

A resume engine that scores, rewrites, and tracks a job search, running entirely in the
browser. One HTML file, no framework, no build step, no dependencies.

**Live:** https://resume-rubric-production.up.railway.app

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

Your resume is never uploaded. The engine, every word list and every rule, is in the page you
already downloaded, and the scoring runs on your machine. Saved versions live in your
browser storage on your own device and one button deletes all of them.

The server counts how many times each page was opened, so the project can answer how many
people use it. That is one number per day. No IP address, no browser details, no cookie and
no resume text. The page never sends anything to it, and the counts are public at `/stats`.

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
| `resume-rubric-artifact.html` | The same page without its document wrapper, for embedding |

## Deploying

Pushing to `main` runs CI (a boot and smoke check of the server) and, if that passes,
Railway rebuilds and ships automatically. No manual deploy step.

## License

[GNU AGPL-3.0-or-later](LICENSE). Copyright (c) 2026 Francis Mercado.

You may use, study, modify and share this freely. The one condition that matters:
if you run a modified version as a network service, you must offer your users the
source of that modified version. That keeps the guarantee this tool is built on,
which is that anyone can audit what it does with their resume.

For commercial licensing on other terms, contact the copyright holder.
