import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStore } from '@/store'
import NotesEditor from '@/components/session/NotesEditor'
import QAList from '@/components/session/QAList'
import KeyConceptsList from '@/components/session/KeyConceptsList'
import ReadinessPanel from '@/components/session/ReadinessPanel'
import ExportPanel from '@/components/session/ExportPanel'
import ScoreHistory from '@/components/session/ScoreHistory'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function SessionPage() {
  const { topicSlug } = useParams<{ topicSlug: string }>()
  const navigate = useNavigate()
  const { sessions, loaded } = useStore()

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    )
  }

  const session = sessions.find(s => s.topicSlug === topicSlug)
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-500 dark:text-slate-400">Session not found.</p>
        <Link to="/" className="text-violet-600 hover:underline text-sm">← Back to home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-violet-600" />
            <span className="font-bold text-slate-800 dark:text-slate-100">{session.topic}</span>
          </div>
          <span className="text-xs text-slate-400 ml-1">Last updated {formatDate(session.updatedAt)}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0 space-y-6">
            <NotesEditor session={session} />
            <KeyConceptsList session={session} />
            <QAList session={session} />
          </div>
          <div className="w-72 shrink-0 space-y-4">
            <ReadinessPanel session={session} />
            <ScoreHistory topicSlug={session.topicSlug} />
            <ExportPanel session={session} />
          </div>
        </div>
      </main>
    </div>
  )
}
