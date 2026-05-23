# Claude Session Context

> Paste this file at the start of a Claude session to restore full context.

## Who I am

I'm preparing for software engineering interviews. I use this repo to learn topics with Claude and track my progress.

## How this repo works

- **App**: React frontend at root. Run with `npm run dev`, opens at `http://localhost:5173`
- **Data**: All learning data stored in `data/*.json` (sessions, progress, weak areas, spaced repetition, score history)
- **Score history**: `data/score-history.json` — per-topic score log with date + note (see CLAUDE.md for format)
- **Markdown**: `data/progress.md`, `data/skill.md`, `data/weak-areas.md` — human-readable exports
- **Per-topic notes**: `data/exports/sessions/<topic>.md` — exported from app, great for NotebookLM

## My current status

See `data/progress.json` for exact scores. Summary:
- Topics: (check progress.json)
- Weak areas: (check weak-areas.json)

## How to continue a learning session with Claude

1. Tell Claude which topic you want to learn
2. Claude teaches you, you take notes in the app
3. Claude adds Q&A cards based on the conversation
4. At the end, export the session markdown

## Suggested Claude prompts for learning

- "Teach me [topic] from scratch, then quiz me"
- "Look at my weak areas in data/weak-areas.md and quiz me on those"  
- "I'm scoring [X] on [topic]. What should I focus on?"
- "Create 5 hard interview Q&As about [topic] for me to add to the app"

## How to use with NotebookLM

1. Export session markdown from the app
2. Upload `data/exports/sessions/<topic>.md` to NotebookLM as a source
3. Ask NotebookLM to: "Interview me on this topic. Ask one question at a time, wait for my answer, then evaluate."
4. Also upload `data/weak-areas.md` and say "Focus questions on my weak areas"

## Things I repeatedly get wrong

See `data/weak-areas.md` (updated from app exports)
