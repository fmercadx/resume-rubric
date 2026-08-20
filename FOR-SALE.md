# Resume Rubric, for sale

A finished resume scoring tool. Everything runs in the browser, so it costs almost
nothing to host and there is no backend to maintain.

**Live:** https://resume-rubric-production.up.railway.app
**Code:** https://github.com/fmercadx/resume-rubric

---

## Straight answers first

I would rather you hear this from me than find it later.

- **Revenue: $0.** It has never been monetised.
- **Users: none yet.** The counter shows 86 visits and nearly all of those are my own
  testing. It went live this week.
- **Age: days, not years.**

So you are not buying a business. You are buying a finished product, a clean codebase,
and search groundwork that has not had time to work yet. Price it accordingly.

---

## What it does

Paste a resume and a real job posting. It scores the resume out of 100 across six
weighted areas, cites the exact line behind every finding, and rewrites the weak bullets.

The things that make it different from Jobscan, Teal, Rezi and the rest:

**The scoring rubric is published on the page.** All six weights and every threshold.
No competitor shows theirs. It makes the score arguable, which is the point.

**It never invents a number.** Where a metric belongs and the user has not supplied one,
it marks the gap and stops. Competing tools write plausible figures into your resume that
you cannot defend in an interview.

**It covers eight fields, not just tech.** Healthcare, skilled trades, education,
government, operations, finance, sales and technology. Each has its own verb list,
expected sections, credential checks and definition of what counts as evidence. Almost
every competitor is built for software jobs.

**It exports a Word file and proves the export parses.** The generated .docx is fed back
through the same reader an applicant tracking system would need, then rescored. If the
score survives, the file demonstrably parses. Nobody else can make that claim, because
nobody else publishes their parser.

**Nothing is uploaded.** The whole engine is inside the page. Open the network tab and
run an analysis: zero requests. That is the strongest thing here commercially, because it
removes the security review that kills most sales into schools and public agencies.

---

## What is included

| | |
|---|---|
| Application | One HTML file, ~276 KB, no framework, no build step, no dependencies |
| Pages | 10 live: the tool, an organizations page, and 8 search landing pages |
| Hosting | Node server for Railway, plus a static build for GitHub Pages. Both configured |
| Repo | 20 commits, CI that smoke tests before deploy, auto deploy on push |
| Extras | Word exporter, PDF and DOCX importer, job board feed, application tracker |

## Built in features

- Six part scoring engine, deterministic, every deduction cites a line
- Three step guided fix: wording, your numbers, the posting's keywords
- Bullet rewriter with undo on every change
- PDF and .docx import, parsed in the browser, with a quality gate that refuses
  scrambled text rather than scoring nonsense
- ATS safe .docx export with the round trip proof described above
- Interview questions generated from the user's own bullets
- Job feed across public job board APIs, covering healthcare and trades as well as tech
- Saved versions, an application board and a score history, all in local storage

## Running costs

- **$0** on GitHub Pages, already built and working
- **About $5 a month** on Railway if you want the server, which adds a privacy safe
  visit counter

There is no database, no auth, no third party service and no per user cost. It scales to
any number of users for the same money, because the work happens on their machines.

---

## Licensing

Currently **AGPL-3.0-or-later**.

I am the sole copyright holder, so I can grant a different licence as part of a sale. If
you want to run it closed source or commercially without the copyleft obligation, say so
and that goes in the deal. This is normal and it is mine to give.

---

## Where the value is

1. **It is finished.** It works today. No half built parts.
2. **Costs nothing to run.** Client side means no marginal cost per user.
3. **A real position.** Privacy and an open rubric are defensible claims that the funded
   competitors cannot copy without rebuilding on a different architecture.
4. **An underserved market.** Nurses, electricians, drivers and teachers are poorly
   served by every major resume tool. The 8 landing pages already target those searches.
5. **Two obvious routes to money**, neither built yet: a paid sync tier that genuinely
   needs a server, and selling to career centres, workforce boards and veteran programs.
   There is a full page on the site aimed at that second audience already.

## What it needs

Distribution. That is the honest gap. The product is done and nobody knows it exists.
Whoever buys this is buying a head start on building, not on marketing.

---

## Contact

Francis Mercado
vfranmer29@gmail.com
