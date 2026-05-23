import { useNavigate } from 'react-router-dom'
import type { WeakAreasData } from '@/types'
import { AlertTriangle } from 'lucide-react'

interface Props {
  weakAreas: WeakAreasData
}

export default function WeakAreasSummary({ weakAreas }: Props) {
  const navigate = useNavigate()
  const top = weakAreas.weakAreas
    .filter(w => w.wrongCount >= 2)
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, 5)

  if (top.length === 0) return null

  return (
    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-red-500" />
        <h3 className="font-semibold text-red-800 dark:text-red-400 text-sm">Weak Areas — You Keep Missing These</h3>
      </div>
      <div className="space-y-2">
        {top.map(w => (
          <div key={w.questionId}
            onClick={() => navigate(`/session/${w.topic}`)}
            className="flex items-start justify-between gap-3 bg-white dark:bg-slate-900 rounded-lg px-3 py-2 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors">
            <p className="text-sm text-slate-700 dark:text-slate-200 flex-1 leading-tight">{w.question}</p>
            <span className="text-xs font-bold text-red-600 dark:text-red-400 whitespace-nowrap shrink-0">✗ {w.wrongCount}x</span>
          </div>
        ))}
      </div>
    </div>
  )
}
