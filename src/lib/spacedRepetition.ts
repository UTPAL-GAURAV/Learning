import type { SpacedRepCard } from '@/types'

// SM-2 algorithm: quality 0-5 (5=perfect, 0=complete blackout)
export function sm2Update(card: SpacedRepCard, quality: 0 | 1 | 2 | 3 | 4 | 5): SpacedRepCard {
  const q = quality
  let { easinessFactor, interval, repetitions } = card

  if (q >= 3) {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * easinessFactor)
    repetitions += 1
  } else {
    repetitions = 0
    interval = 1
  }

  easinessFactor = Math.max(1.3, easinessFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))

  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + interval)

  return {
    ...card,
    easinessFactor,
    interval,
    repetitions,
    nextReviewDate: nextReviewDate.toISOString(),
    lastReviewDate: new Date().toISOString(),
  }
}

export function newCard(questionId: string, topic: string): SpacedRepCard {
  return {
    questionId,
    topic,
    easinessFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: new Date().toISOString(),
    lastReviewDate: new Date().toISOString(),
  }
}

export function isDue(card: SpacedRepCard): boolean {
  return new Date(card.nextReviewDate) <= new Date()
}

export function daysUntilDue(card: SpacedRepCard): number {
  const diff = new Date(card.nextReviewDate).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
