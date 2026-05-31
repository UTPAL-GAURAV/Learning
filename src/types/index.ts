export interface QAAttempt {
  timestamp: string
  correct: boolean
}

export interface QAItem {
  id: string
  question: string
  answer: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  attempts: QAAttempt[]
  wrongCount: number
  lastReviewed: string | null
}

export interface Session {
  id: string
  topic: string
  topicSlug: string
  createdAt: string
  updatedAt: string
  notes: string
  keyConcepts: string[]
  qa: QAItem[]
  readinessScore: number
  sessionCount: number
  syllabusTopics?: string[]
  coveredTopics?: string[]
}

export interface TopicProgress {
  topicSlug: string
  displayName: string
  readinessScore: number
  totalQuestions: number
  correctOnFirstTry: number
  sessionCount: number
  firstStudied: string
  lastStudied: string
  status: 'new' | 'in-progress' | 'ready'
}

export interface ProgressData {
  lastUpdated: string
  totalSessionsCompleted: number
  topics: Record<string, TopicProgress>
}

export interface WeakArea {
  questionId: string
  topic: string
  question: string
  wrongCount: number
  lastWrong: string
  flaggedForReview: boolean
}

export interface WeakAreasData {
  lastUpdated: string
  weakAreas: WeakArea[]
}

export interface SpacedRepCard {
  questionId: string
  topic: string
  easinessFactor: number
  interval: number
  repetitions: number
  nextReviewDate: string
  lastReviewDate: string
}

export interface SpacedRepData {
  cards: SpacedRepCard[]
}

export interface SessionsData {
  sessions: Session[]
}

export interface SessionIndexEntry {
  topicSlug: string
  topic: string
  updatedAt: string
  readinessScore: number
  sessionCount: number
  syllabusProgress?: number
}

export interface SessionIndexData {
  topics: SessionIndexEntry[]
}

export interface ScoreEntry {
  topic: string
  date: string
  score: number
  note: string
}

export interface ScoreHistoryData {
  history: ScoreEntry[]
}
