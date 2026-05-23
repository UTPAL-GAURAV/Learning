import type { Session } from '@/types'
import { getScoreLabel, getScoreColor, getScoreBg } from '@/lib/scoring'
import { useStore } from '@/store'
import { daysUntilDue, isDue } from '@/lib/spacedRepetition'
import { Target, Calendar, Clock } from 'lucide-react'

interface Props {
  session: Session
}

export default function ReadinessPanel({ session }: Props) {
  const spacedRep = useStore(s => s.spacedRep)
  const score = session.readinessScore
  const label = getScoreLabel(score)
  const scoreColor = getScoreColor(score)
  const scoreBg = getScoreBg(score)

  const dueCards = session.qa.filter(q => {
    const card = spacedRep.cards.find(c => c.questionId === q.id)
    return card ? isDue(card) : false
  })

  const nextDue = session.qa
    .map(q => spacedRep.cards.find(c => c.questionId === q.id))
    .filter(Boolean)
    .sort((a, b) => new Date(a!.nextReviewDate).getTime() - new Date(b!.nextReviewDate).getTime())[0]

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Target size={14} className="text-violet-600" />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Interview Readiness</h3>
      </div>

      <div className="flex items-end gap-2">
        <span className={`text-4xl font-bold ${scoreColor}`}>{score}</span>
        <span className="text-slate-400 dark:text-slate-500 text-sm pb-1">/100 — {label}</span>
      </div>

      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${scoreBg}`} style={{ width: `${score}%` }} />
      </div>

      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span>Q&A practiced</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {session.qa.filter(q => q.attempts.length > 0).length}/{session.qa.length}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Correct on first try</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {session.qa.filter(q => q.attempts[0]?.correct).length}/{session.qa.length}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Concepts covered</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{session.keyConcepts.length}</span>
        </div>
      </div>

      {dueCards.length > 0 && (
        <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-900 rounded-lg px-3 py-2">
          <Calendar size={13} className="text-violet-600 dark:text-violet-400 shrink-0" />
          <span className="text-xs text-violet-700 dark:text-violet-400 font-medium">
            {dueCards.length} card{dueCards.length > 1 ? 's' : ''} due for review!
          </span>
        </div>
      )}

      {nextDue && !isDue(nextDue) && (
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <Clock size={12} />
          Next review in {daysUntilDue(nextDue)} day{daysUntilDue(nextDue) !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
