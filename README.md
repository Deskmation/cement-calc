# Cement Calc · dump bailer

A phone web app for an external client (15 Oct 2026): the cement volume for a plug in any casing or tubing,
how many runs with which dump bailer, and the new top of cement. No server, no sign-in; it installs on the phone
("Add to Home Screen") and works without signal.

## What it answers
- **Cement needed** for the plug, in litres, US gallons, barrels and cubic feet at once (pick the one to show big).
- **Runs**: N full runs of the bailer length + one last run, the last run rounded UP to 5 ft joints (1 m in metres).
- **Per run**: volume and the feet of pipe one bailer-load covers; the total dumped; the cemented height; the new
  TOC; how far above (or short of) the target the rounded plan lands.
- **Which bailer**: every usual bailer ID (1.5 to 3 in, plus a typed one) against the same plug - per-run volume
  and the runs it takes; tap a row to plan with it.
- **On the job**: count the runs as they go down; the theoretical TOC and the runs left follow.
- Units: depths in ft or m (band toggle), IDs in inches or mm, volumes in all four.

## The arithmetic
The dump-bailer CALC_MASTER sheet's: pipe capacity 158.987 / 1029.45 L per ft per in² of ID (bailer 159 / 1029.45),
cement placed from the bottom up. Reproduces an issued proposal to the decimal (5 ft plug, 5½" 23#, 2.6" bailer:
16.84 L required, one 20 ft run of 20.88 L, 6.20 ft cemented, new TOC 11,490.80 ft).

## Pipe tables
API casing 4½" to 20" (OD, lb/ft -> ID) and API 5CT tubing 1.050" to 4½" (common walls). Anything else:
"Other" and type the ID. The ID field is always free to type.

## Files
`index.html`, `app.js` (everything), `app.css`, `sw.js` (offline cache `cement-calc-1` - bump it on every change),
`manifest.webmanifest`, `icon.svg` + `icon-192/512.png`. Host as static files anywhere (HTTPS for the install
prompt and the offline cache). Live: https://deskmation.github.io/cement-calc/ (GitHub Pages from `main`; `git push` deploys). Local look: the `cement-calc` entry in `../.claude/launch.json` (python http.server
on :8798).

## Tests
`cc_test.js` (node, kept outside the repo): the reference proposal, a tall plug, metre joints, the error paths.
