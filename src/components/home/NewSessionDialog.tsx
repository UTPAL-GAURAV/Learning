import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import { slugify } from '@/lib/utils'
import { BookOpen, X } from 'lucide-react'

interface Props {
  onClose: () => void
}

export default function NewSessionDialog({ onClose }: Props) {
  const [topic, setTopic] = useState('')
  const [error, setError] = useState('')
  const { sessions, createSession } = useStore()
  const navigate = useNavigate()

  const existingTopics = sessions.map(s => s.topic)
  const slug = slugify(topic)
  const existing = sessions.find(s => s.topicSlug === slug)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) { setError('Enter a topic name'); return }
    const session = await createSession(topic.trim())
    onClose()
    navigate(`/session/${session.topicSlug}`)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-violet-600" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Start Learning Session</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Topic</label>
            <input
              autoFocus
              value={topic}
              onChange={e => { setTopic(e.target.value); setError('') }}
              placeholder="e.g. Cache, System Design, SQL Indexes..."
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder:text-slate-400"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          {existing && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-400">
              A session for <strong>{existing.topic}</strong> already exists. This will open it.
            </div>
          )}

          {existingTopics.length > 0 && !existing && (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Existing topics:</p>
              <div className="flex flex-wrap gap-1.5">
                {existingTopics.map(t => (
                  <button key={t} type="button" onClick={() => setTopic(t)}
                    className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 dark:hover:bg-violet-900/40 text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-400 px-2 py-1 rounded-full transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2 text-sm text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors font-medium">
              {existing ? 'Open Session' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
