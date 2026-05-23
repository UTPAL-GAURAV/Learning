import type { SessionIndexData, Session, ProgressData, WeakAreasData, SpacedRepData, ScoreHistoryData } from '@/types'

const isDev = import.meta.env.DEV

async function readJSON<T>(filename: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`/data/${filename}`)
    if (!res.ok) return fallback
    return (await res.json()) as T
  } catch {
    return fallback
  }
}

async function writeJSON(filename: string, data: unknown): Promise<void> {
  if (!isDev) return
  await fetch(`/api/data/${filename}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export const dataClient = {
  sessionIndex: {
    read: () => readJSON<SessionIndexData>('sessions-index.json', { topics: [] }),
    write: (data: SessionIndexData) => writeJSON('sessions-index.json', data),
  },
  session: {
    read: (slug: string) => readJSON<Session | null>(`sessions/${slug}.json`, null),
    write: (slug: string, data: Session) => writeJSON(`sessions/${slug}.json`, data),
  },
  progress: {
    read: () => readJSON<ProgressData>('progress.json', {
      lastUpdated: new Date().toISOString(),
      totalSessionsCompleted: 0,
      topics: {},
    }),
    write: (data: ProgressData) => writeJSON('progress.json', data),
  },
  weakAreas: {
    read: () => readJSON<WeakAreasData>('weak-areas.json', { lastUpdated: new Date().toISOString(), weakAreas: [] }),
    write: (data: WeakAreasData) => writeJSON('weak-areas.json', data),
  },
  spacedRep: {
    read: () => readJSON<SpacedRepData>('spaced-repetition.json', { cards: [] }),
    write: (data: SpacedRepData) => writeJSON('spaced-repetition.json', data),
  },
  scoreHistory: {
    read: () => readJSON<ScoreHistoryData>('score-history.json', { history: [] }),
    write: (data: ScoreHistoryData) => writeJSON('score-history.json', data),
  },
}
