# Interview Prep

A personal learning app for SDE-2 interview preparation. Study topics with Claude, track progress over time, and export notes for revision or NotebookLM.

## How to start a session

```bash
npm run dev
```

Then open a new Claude Code session in this directory and say the topic:

> "Let's study Cache today"

That's it. Claude reads your existing progress automatically and takes it from there.

## What Claude does automatically

- Reads your last score, where you left off, and weak areas before teaching anything
- Teaches one sub-topic at a time: Intro → Mechanics → Scenario question → Evaluate → next sub-topic
- Writes Q&A cards and updates notes after each sub-topic (not at session end — so nothing is lost if you close early)
- Logs a score entry with a note after each sub-topic clears
- Flags anything you got wrong or hesitated on as a weak area, and revisits it next session

## Revision mode

Tell Claude "I want to revise Cache" and it outputs a single cheat-sheet page — definition, when-to-use, trade-offs, gotchas, scenarios. No sub-cards, everything on one scroll.

## App

Open `http://localhost:5173` while `npm run dev` is running.

- **Home** — all topic cards with readiness score (0–100) and a score sparkline
- **Session page** — notes, key concepts, Q&A cards, score history chart, export panel
- **Dark mode** — toggle with the sun/moon button top-right

## Data files (committed to git)

| File | Purpose |
|------|---------|
| `data/sessions.json` | Notes, Q&A, key concepts per topic |
| `data/score-history.json` | Score timeline — date + note per entry |
| `data/progress.json` | Latest score and stats per topic |
| `data/weak-areas.json` | Questions answered wrong 2+ times |
| `data/spaced-repetition.json` | SM-2 state per Q&A card |

All data lives in this repo. Every session is a git commit — your learning history is version-controlled.

## Exporting for NotebookLM

From any session page → Export panel:

1. Click copy or download next to the topic name
2. Upload the `.md` file to NotebookLM as a source
3. Ask NotebookLM: *"Interview me on this topic. Ask one question at a time, wait for my answer, then evaluate."*
4. Also upload `data/weak-areas.md` and say *"Focus on my weak areas"*

## Topics covered

Cache, DSA, Java, Spring Boot, System Design, DevOps, Databases, Networking, OS — add any topic by clicking "New Session".
