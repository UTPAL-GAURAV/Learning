import { useState } from 'react'
import { useStore } from '@/store'
import { useTheme } from '@/lib/theme'
import TopicGrid from '@/components/home/TopicGrid'
import WeakAreasSummary from '@/components/home/WeakAreasSummary'
import NewSessionDialog from '@/components/home/NewSessionDialog'
import { Plus, BookOpen, TrendingUp, Target, Sun, Moon } from 'lucide-react'

export default function HomePage() {
  const { sessions, progress, weakAreas, loaded } = useStore()
  const { theme, toggle } = useTheme()
  const [showNew, setShowNew] = useState(false)

  const readyCount = Object.values(progress.topics).filter(t => t.readinessScore >= 75).length
  const avgScore = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.readinessScore, 0) / sessions.length)
    : 0
  const totalQA = sessions.reduce((acc, s) => acc + s.qa.length, 0)

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen size={20} className="text-violet-600" />
            <span className="font-bold text-slate-800 dark:text-slate-100 text-base">Interview Prep</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-1.5 bg-violet-600 text-white hover:bg-violet-700 px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm">
              <Plus size={15} /> New Session
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {sessions.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-violet-600 mb-1">
                <BookOpen size={15} />
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Topics</span>
              </div>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{sessions.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-violet-600 mb-1">
                <TrendingUp size={15} />
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Q&A Cards</span>
              </div>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{totalQA}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                <Target size={15} />
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Avg Readiness</span>
              </div>
              <p className="text-3xl font-bold text-emerald-600">{avgScore}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{readyCount} topic{readyCount !== 1 ? 's' : ''} ≥ 75</p>
            </div>
          </div>
        )}

        <WeakAreasSummary weakAreas={weakAreas} />
        <TopicGrid sessions={sessions} />
      </main>

      {showNew && <NewSessionDialog onClose={() => setShowNew(false)} />}
    </div>
  )
}
