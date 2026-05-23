import { useNavigate } from 'react-router-dom'
import type { Session } from '@/types'
import { getScoreLabel, getScoreColor, getScoreBg } from '@/lib/scoring'
import { formatRelative } from '@/lib/utils'
import { MessageSquare, Clock, Layers } from 'lucide-react'
import { useStore } from '@/store'
import { daysUntilDue } from '@/lib/spacedRepetition'

interface Props {
  session: Session
}

export default function TopicCard({ session }: Props) {
  const navigate = useNavigate()
  const spacedRep = useStore(s => s.spacedRep)
  const scoreHistory = useStore(s => s.scoreHistory)
  const score = session.readinessScore
  const label = getScoreLabel(score)
  const scoreColor = getScoreColor(score)
  const scoreBg = getScoreBg(score)

  const dueCards = session.qa.filter(q => {
    const card = spacedRep.cards.find(c => c.questionId === q.id)
    if (!card) return false
    return daysUntilDue(card) === 0
  }).length

  const history = scoreHistory.history
    .filter(e => e.topic === session.topicSlug)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-6)

  const labelColors: Record<string, string> = {
    Ready: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    'In Progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    'Needs Work': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    New: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  }

  return (
    <div
      onClick={() => navigate(`/session/${session.topicSlug}`)}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 cursor-pointer hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">
          {session.topic}
        </h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${labelColors[label]}`}>
          {label}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-2xl font-bold ${scoreColor}`}>{score}</span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${scoreBg}`} style={{ width: `${score}%` }} />
        </div>
      </div>

      {history.length >= 2 && (
        <div className="mb-3">
          <svg width="100%" height="28" viewBox={`0 0 ${history.length * 30} 28`} preserveAspectRatio="none">
            <polyline
              fill="none" stroke="#7c3aed" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" opacity="0.6"
              points={history.map((e, i) => {
                const x = (i / (history.length - 1)) * (history.length * 30 - 10) + 5
                const y = 24 - (e.score / 100) * 20
                return `${x},${y}`
              }).join(' ')}
            />
            {history.map((e, i) => {
              const x = (i / (history.length - 1)) * (history.length * 30 - 10) + 5
              const y = 24 - (e.score / 100) * 20
              return <circle key={i} cx={x} cy={y} r="2.5" fill="#7c3aed" opacity="0.8" />
            })}
          </svg>
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1"><MessageSquare size={12} />{session.qa.length} Q&A</span>
        <span className="flex items-center gap-1"><Layers size={12} />{session.keyConcepts.length} concepts</span>
        <span className="flex items-center gap-1"><Clock size={12} />{formatRelative(session.updatedAt)}</span>
      </div>

      {dueCards > 0 && (
        <div className="mt-3 bg-violet-50 dark:bg-violet-950/50 rounded-lg px-2.5 py-1.5 text-xs text-violet-700 dark:text-violet-400 font-medium">
          📅 {dueCards} card{dueCards > 1 ? 's' : ''} due for review
        </div>
      )}
    </div>
  )
}
