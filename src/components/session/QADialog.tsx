import { useState } from 'react'
import type { QAItem } from '@/types'
import { X } from 'lucide-react'

interface Props {
  initialValues?: Partial<QAItem>
  onSave: (qa: Omit<QAItem, 'id' | 'attempts' | 'wrongCount' | 'lastReviewed'>) => void
  onClose: () => void
}

export default function QADialog({ initialValues, onSave, onClose }: Props) {
  const [question, setQuestion] = useState(initialValues?.question ?? '')
  const [answer, setAnswer] = useState(initialValues?.answer ?? '')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(initialValues?.difficulty ?? 'medium')
  const [tags, setTags] = useState((initialValues?.tags ?? []).join(', '))
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) { setError('Question is required'); return }
    if (!answer.trim()) { setError('Answer is required'); return }
    onSave({
      question: question.trim(),
      answer: answer.trim(),
      difficulty,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    })
    onClose()
  }

  const inputCls = "w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder:text-slate-400 dark:placeholder:text-slate-600"

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {initialValues?.question ? 'Edit Q&A' : 'Add Q&A'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Question</label>
            <textarea autoFocus value={question} onChange={e => setQuestion(e.target.value)}
              rows={2} placeholder="Scenario or trade-off question..."
              className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Answer</label>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)}
              rows={4} placeholder="Write the full answer here..."
              className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Difficulty</label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map(d => (
                <button key={d} type="button" onClick={() => setDifficulty(d)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                    difficulty === d
                      ? d === 'easy' ? 'bg-emerald-600 text-white' : d === 'medium' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (comma-separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)}
              placeholder="e.g. consistency, cache, distributed"
              className={inputCls} />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2 text-sm text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors font-medium">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
