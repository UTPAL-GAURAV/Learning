import { create } from 'zustand'
import { dataClient } from '@/lib/dataClient'
import { computeReadinessScore } from '@/lib/scoring'
import { sm2Update, newCard } from '@/lib/spacedRepetition'
import type { Session, SessionIndexData, ProgressData, WeakAreasData, SpacedRepData, ScoreHistoryData, QAItem } from '@/types'
import { slugify } from '@/lib/utils'

interface AppState {
  sessions: Session[]
  progress: ProgressData
  weakAreas: WeakAreasData
  spacedRep: SpacedRepData
  scoreHistory: ScoreHistoryData
  loaded: boolean
  load: () => Promise<void>
  createSession: (topic: string) => Promise<Session>
  updateSession: (session: Session) => Promise<void>
  addQA: (topicSlug: string, qa: Omit<QAItem, 'id' | 'attempts' | 'wrongCount' | 'lastReviewed'>) => Promise<void>
  recordAttempt: (topicSlug: string, questionId: string, correct: boolean) => Promise<void>
  updateNotes: (topicSlug: string, notes: string) => Promise<void>
  updateKeyConcepts: (topicSlug: string, concepts: string[]) => Promise<void>
  deleteQA: (topicSlug: string, questionId: string) => Promise<void>
  updateQA: (topicSlug: string, qa: QAItem) => Promise<void>
  addScoreEntry: (topic: string, score: number, note: string) => Promise<void>
}

function syncProgress(sessions: Session[], current: ProgressData): ProgressData {
  const topics: ProgressData['topics'] = { ...current.topics }
  sessions.forEach(s => {
    const firstTryCorrect = s.qa.filter(q => q.attempts[0]?.correct).length
    const score = computeReadinessScore(s)
    topics[s.topicSlug] = {
      topicSlug: s.topicSlug,
      displayName: s.topic,
      readinessScore: score,
      totalQuestions: s.qa.length,
      correctOnFirstTry: firstTryCorrect,
      sessionCount: s.sessionCount,
      firstStudied: topics[s.topicSlug]?.firstStudied ?? s.createdAt,
      lastStudied: s.updatedAt,
      status: score >= 75 ? 'ready' : score > 0 ? 'in-progress' : 'new',
    }
  })
  return {
    lastUpdated: new Date().toISOString(),
    totalSessionsCompleted: sessions.reduce((a, s) => a + s.sessionCount, 0),
    topics,
  }
}

function syncWeakAreas(sessions: Session[]): WeakAreasData {
  const weakAreas = sessions.flatMap(s =>
    s.qa
      .filter(q => q.wrongCount > 0)
      .map(q => ({
        questionId: q.id,
        topic: s.topicSlug,
        question: q.question,
        wrongCount: q.wrongCount,
        lastWrong: q.attempts.filter(a => !a.correct).slice(-1)[0]?.timestamp ?? s.updatedAt,
        flaggedForReview: q.wrongCount >= 2,
      }))
  )
  return { lastUpdated: new Date().toISOString(), weakAreas }
}

function buildIndex(sessions: Session[]): SessionIndexData {
  return {
    topics: sessions.map(s => ({
      topicSlug: s.topicSlug,
      topic: s.topic,
      updatedAt: s.updatedAt,
      readinessScore: s.readinessScore,
      sessionCount: s.sessionCount,
    })),
  }
}

export const useStore = create<AppState>((set, get) => ({
  sessions: [],
  progress: { lastUpdated: '', totalSessionsCompleted: 0, topics: {} },
  weakAreas: { lastUpdated: '', weakAreas: [] },
  spacedRep: { cards: [] },
  scoreHistory: { history: [] },
  loaded: false,

  load: async () => {
    const [index, progress, weakAreas, spacedRep, scoreHistory] = await Promise.all([
      dataClient.sessionIndex.read(),
      dataClient.progress.read(),
      dataClient.weakAreas.read(),
      dataClient.spacedRep.read(),
      dataClient.scoreHistory.read(),
    ])
    const sessions = (await Promise.all(
      index.topics.map(t => dataClient.session.read(t.topicSlug))
    )).filter((s): s is Session => s !== null)
    set({ sessions, progress, weakAreas, spacedRep, scoreHistory, loaded: true })
  },

  createSession: async (topic: string) => {
    const { sessions } = get()
    const topicSlug = slugify(topic)
    const existing = sessions.find(s => s.topicSlug === topicSlug)
    if (existing) return existing

    const now = new Date().toISOString()
    const session: Session = {
      id: `${topicSlug}-${Date.now()}`,
      topic,
      topicSlug,
      createdAt: now,
      updatedAt: now,
      notes: '',
      keyConcepts: [],
      qa: [],
      readinessScore: 0,
      sessionCount: 1,
    }
    const updated = [...sessions, session]
    const index = buildIndex(updated)
    const progress = syncProgress(updated, get().progress)
    const weakAreas = syncWeakAreas(updated)
    set({ sessions: updated, progress, weakAreas })
    await Promise.all([
      dataClient.session.write(topicSlug, session),
      dataClient.sessionIndex.write(index),
      dataClient.progress.write(progress),
      dataClient.weakAreas.write(weakAreas),
    ])
    return session
  },

  updateSession: async (session: Session) => {
    const { sessions } = get()
    const score = computeReadinessScore(session)
    const updated = sessions.map(s =>
      s.topicSlug === session.topicSlug
        ? { ...session, readinessScore: score, updatedAt: new Date().toISOString() }
        : s
    )
    const updatedSession = updated.find(s => s.topicSlug === session.topicSlug)!
    const index = buildIndex(updated)
    const progress = syncProgress(updated, get().progress)
    const weakAreas = syncWeakAreas(updated)
    set({ sessions: updated, progress, weakAreas })
    await Promise.all([
      dataClient.session.write(session.topicSlug, updatedSession),
      dataClient.sessionIndex.write(index),
      dataClient.progress.write(progress),
      dataClient.weakAreas.write(weakAreas),
    ])
  },

  addQA: async (topicSlug, qaInput) => {
    const { sessions, spacedRep, updateSession } = get()
    const session = sessions.find(s => s.topicSlug === topicSlug)
    if (!session) return
    const id = `q-${Date.now()}`
    const qa: QAItem = { ...qaInput, id, attempts: [], wrongCount: 0, lastReviewed: null }
    const newCards = [...spacedRep.cards, newCard(id, topicSlug)]
    set({ spacedRep: { cards: newCards } })
    await Promise.all([dataClient.spacedRep.write({ cards: newCards }), updateSession({ ...session, qa: [...session.qa, qa] })])
  },

  recordAttempt: async (topicSlug, questionId, correct) => {
    const { sessions, spacedRep, updateSession } = get()
    const session = sessions.find(s => s.topicSlug === topicSlug)
    if (!session) return
    const now = new Date().toISOString()
    const qa = session.qa.map(q => {
      if (q.id !== questionId) return q
      return {
        ...q,
        attempts: [...q.attempts, { timestamp: now, correct }],
        wrongCount: correct ? q.wrongCount : q.wrongCount + 1,
        lastReviewed: now,
      }
    })
    const quality = correct ? 4 : 1
    const cards = spacedRep.cards.map(c => {
      if (c.questionId !== questionId) return c
      return sm2Update(c, quality as 0 | 1 | 2 | 3 | 4 | 5)
    })
    set({ spacedRep: { cards } })
    await Promise.all([dataClient.spacedRep.write({ cards }), updateSession({ ...session, qa })])
  },

  updateNotes: async (topicSlug, notes) => {
    const { sessions, updateSession } = get()
    const session = sessions.find(s => s.topicSlug === topicSlug)
    if (session) await updateSession({ ...session, notes })
  },

  updateKeyConcepts: async (topicSlug, keyConcepts) => {
    const { sessions, updateSession } = get()
    const session = sessions.find(s => s.topicSlug === topicSlug)
    if (session) await updateSession({ ...session, keyConcepts })
  },

  deleteQA: async (topicSlug, questionId) => {
    const { sessions, updateSession } = get()
    const session = sessions.find(s => s.topicSlug === topicSlug)
    if (!session) return
    await updateSession({ ...session, qa: session.qa.filter(q => q.id !== questionId) })
  },

  updateQA: async (topicSlug, updated) => {
    const { sessions, updateSession } = get()
    const session = sessions.find(s => s.topicSlug === topicSlug)
    if (!session) return
    await updateSession({ ...session, qa: session.qa.map(q => q.id === updated.id ? updated : q) })
  },

  addScoreEntry: async (topic, score, note) => {
    const { scoreHistory } = get()
    const date = new Date().toISOString().slice(0, 10)
    const entry = { topic, date, score, note }
    const updated: ScoreHistoryData = { history: [...scoreHistory.history, entry] }
    set({ scoreHistory: updated })
    await dataClient.scoreHistory.write(updated)
  },
}))
