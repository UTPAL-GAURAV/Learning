import { useState } from 'react'
import type { ScoreEntry } from '@/types'
import { useStore } from '@/store'
import { TrendingUp, Plus, X } from 'lucide-react'
import { getScoreColor } from '@/lib/scoring'

interface Props {
  topicSlug: string
}

export default function ScoreHistory({ topicSlug }: Props) {
  const { scoreHistory, addScoreEntry } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [score, setScore] = useState('70')
  const [note, setNote] = useState('')

  const entries: ScoreEntry[] = scoreHistory.history
    .filter(e => e.topic === topicSlug)
    .sort((a, b) => a.date.localeCompare(b.date))

  const handleAdd = async () => {
    const s = parseInt(score)
    if (isNaN(s) || s < 0 || s > 100) return
    await addScoreEntry(topicSlug, s, note.trim())
    setNote('')
    setScore('70')
    setShowForm(false)
  }

  const maxScore = Math.max(...entries.map(e => e.score), 100)
  const chartH = 80

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-violet-600" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Score Over Time</h3>
        </div>
        <button onClick={() => setShowForm(f => !f)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? 'Cancel' : 'Log score'}
        </button>
      </div>

      {showForm && (
        <div className="mb-3 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900 rounded-xl p-3 space-y-2">
          <div className="flex gap-2 items-center">
            <label className="text-xs text-slate-600 dark:text-slate-400 w-14 shrink-0">Score</label>
            <input type="number" min="0" max="100" value={score} onChange={e => setScore(e.target.value)}
              className="w-20 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
            <span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="flex gap-2 items-start">
            <label className="text-xs text-slate-600 dark:text-slate-400 w-14 shrink-0 pt-1.5">Note</label>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="What was weak? What clicked?"
              rows={2}
              className="flex-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600" />
          </div>
          <button onClick={handleAdd}
            className="w-full py-1.5 text-xs bg-violet-600 text-white hover:bg-violet-700 rounded-lg transition-colors font-medium">
            Save entry
          </button>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic">No score history yet. Claude logs this automatically after each sub-topic.</p>
      ) : (
        <>
          <div className="mb-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
            <svg width="100%" height={chartH} viewBox={`0 0 ${Math.max(entries.length * 40, 200)} ${chartH}`} preserveAspectRatio="none">
              {[25, 50, 75].map(pct => (
                <line key={pct} x1="0" y1={chartH - (pct / 100) * chartH} x2="100%" y2={chartH - (pct / 100) * chartH}
                  stroke="#475569" strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />
              ))}
              {entries.length > 1 && (
                <polyline fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  points={entries.map((e, i) => {
                    const x = (i / (entries.length - 1)) * (entries.length * 40 - 20) + 10
                    const y = chartH - (e.score / maxScore) * (chartH - 10) - 5
                    return `${x},${y}`
                  }).join(' ')} />
              )}
              {entries.map((e, i) => {
                const x = entries.length === 1 ? (entries.length * 40) / 2 : (i / (entries.length - 1)) * (entries.length * 40 - 20) + 10
                const y = chartH - (e.score / maxScore) * (chartH - 10) - 5
                return (
                  <g key={`${e.date}-${i}`}>
                    <circle cx={x} cy={y} r="4" fill="#7c3aed" />
                    <text x={x} y={y - 8} textAnchor="middle" fontSize="9" fill="#7c3aed" fontWeight="600">{e.score}</text>
                  </g>
                )
              })}
            </svg>
            <div className="flex justify-between mt-1">
              {entries.map((e, i) => (
                <span key={`${e.date}-label-${i}`} className="text-[10px] text-slate-400 dark:text-slate-500">{e.date.slice(5)}</span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {[...entries].reverse().map((e, i) => (
              <div key={`${e.date}-row-${i}`} className="flex gap-3 items-start bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
                <div className="shrink-0 text-center">
                  <span className={`text-lg font-bold ${getScoreColor(e.score)}`}>{e.score}</span>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{e.date}</p>
                </div>
                {e.note && <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug pt-0.5">{e.note}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
