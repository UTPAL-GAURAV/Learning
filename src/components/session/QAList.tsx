import { useState } from 'react'
import type { Session, QAItem } from '@/types'
import { useStore } from '@/store'
import QAItemCard from './QAItemCard'
import QADialog from './QADialog'
import { Plus, Filter } from 'lucide-react'

interface Props {
  session: Session
}

type FilterType = 'all' | 'wrong' | 'easy' | 'medium' | 'hard'

export default function QAList({ session }: Props) {
  const { addQA, recordAttempt, deleteQA, updateQA } = useStore()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingQA, setEditingQA] = useState<QAItem | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = session.qa.filter(q => {
    if (filter === 'wrong') return q.wrongCount > 0
    if (filter === 'all') return true
    return q.difficulty === filter
  })

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: `All (${session.qa.length})` },
    { key: 'wrong', label: `Weak (${session.qa.filter(q => q.wrongCount > 0).length})` },
    { key: 'easy', label: 'Easy' },
    { key: 'medium', label: 'Medium' },
    { key: 'hard', label: 'Hard' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Q&A</h3>
          <div className="flex items-center gap-1">
            <Filter size={12} className="text-slate-400" />
            {filters.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                  filter === f.key
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-1 text-xs bg-violet-600 text-white hover:bg-violet-700 px-3 py-1.5 rounded-full transition-colors font-medium">
          <Plus size={13} /> Add Q&A
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <p className="text-sm">{session.qa.length === 0 ? 'No Q&A yet. Add your first question!' : 'No questions match this filter.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(q => (
            <QAItemCard key={q.id} qa={q}
              onAttempt={(id, correct) => recordAttempt(session.topicSlug, id, correct)}
              onEdit={setEditingQA}
              onDelete={id => deleteQA(session.topicSlug, id)}
            />
          ))}
        </div>
      )}

      {showAddDialog && (
        <QADialog onSave={qa => addQA(session.topicSlug, qa)} onClose={() => setShowAddDialog(false)} />
      )}
      {editingQA && (
        <QADialog initialValues={editingQA}
          onSave={qa => updateQA(session.topicSlug, { ...editingQA, ...qa })}
          onClose={() => setEditingQA(null)}
        />
      )}
    </div>
  )
}
