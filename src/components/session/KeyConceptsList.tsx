import { useState } from 'react'
import type { Session } from '@/types'
import { useStore } from '@/store'
import { Plus, X, Lightbulb } from 'lucide-react'

interface Props {
  session: Session
}

export default function KeyConceptsList({ session }: Props) {
  const [newConcept, setNewConcept] = useState('')
  const updateKeyConcepts = useStore(s => s.updateKeyConcepts)

  const add = () => {
    const trimmed = newConcept.trim()
    if (!trimmed || session.keyConcepts.includes(trimmed)) return
    updateKeyConcepts(session.topicSlug, [...session.keyConcepts, trimmed])
    setNewConcept('')
  }

  const remove = (concept: string) => {
    updateKeyConcepts(session.topicSlug, session.keyConcepts.filter(c => c !== concept))
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb size={14} className="text-amber-500" />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Key Concepts</h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">({session.keyConcepts.length})</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {session.keyConcepts.map(c => (
          <span key={c}
            className="flex items-center gap-1 text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full">
            {c}
            <button onClick={() => remove(c)} className="text-amber-400 hover:text-red-500 ml-0.5 transition-colors">
              <X size={11} />
            </button>
          </span>
        ))}
        {session.keyConcepts.length === 0 && (
          <span className="text-xs text-slate-400 dark:text-slate-500 italic">Add key concepts to remember</span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={newConcept}
          onChange={e => setNewConcept(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Add a concept..."
          className="flex-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder:text-slate-400 dark:placeholder:text-slate-600"
        />
        <button onClick={add}
          className="flex items-center gap-1 text-xs bg-amber-500 text-white hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-colors font-medium">
          <Plus size={12} /> Add
        </button>
      </div>
    </div>
  )
}
