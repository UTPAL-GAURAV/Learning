import { useState } from 'react'
import type { QAItem } from '@/types'
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  qa: QAItem
  onAttempt: (id: string, correct: boolean) => void
  onEdit: (qa: QAItem) => void
  onDelete: (id: string) => void
}

export default function QAItemCard({ qa, onAttempt, onEdit, onDelete }: Props) {
  const [revealed, setRevealed] = useState(false)
  const [answered, setAnswered] = useState(false)

  const total = qa.attempts.length
  const correct = qa.attempts.filter(a => a.correct).length
  const rate = total > 0 ? Math.round((correct / total) * 100) : null

  const diffColor: Record<string, string> = {
    easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    hard: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  }

  const handleAnswer = (isCorrect: boolean) => {
    onAttempt(qa.id, isCorrect)
    setAnswered(true)
  }

  return (
    <div className={cn(
      'border rounded-xl p-4 transition-all',
      qa.wrongCount >= 3
        ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${diffColor[qa.difficulty]}`}>
              {qa.difficulty}
            </span>
            {qa.tags.map(tag => (
              <span key={tag} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full">{tag}</span>
            ))}
            {qa.wrongCount > 0 && (
              <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-medium px-2 py-0.5 rounded-full">
                ✗ {qa.wrongCount}x wrong
              </span>
            )}
            {rate !== null && (
              <span className="text-xs text-slate-400 dark:text-slate-500">{rate}% ({total} attempts)</span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-snug">{qa.question}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(qa)} className="p-1.5 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors rounded">
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(qa.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded">
            <Trash2 size={13} />
          </button>
          <button onClick={() => { setRevealed(r => !r); setAnswered(false) }}
            className="p-1.5 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors rounded">
            {revealed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {revealed && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{qa.answer}</p>
          {!answered && (
            <div className="flex gap-2 mt-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mr-1 self-center">Did you get it right?</p>
              <button onClick={() => handleAnswer(true)}
                className="flex items-center gap-1 text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 px-3 py-1.5 rounded-full transition-colors font-medium">
                <ThumbsUp size={12} /> Yes
              </button>
              <button onClick={() => handleAnswer(false)}
                className="flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60 px-3 py-1.5 rounded-full transition-colors font-medium">
                <ThumbsDown size={12} /> No
              </button>
            </div>
          )}
          {answered && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic">Recorded. Click another question to continue.</p>
          )}
        </div>
      )}
    </div>
  )
}
