import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Session } from '@/types'
import { useStore } from '@/store'
import { debounce } from '@/lib/utils'
import { Pencil, Eye } from 'lucide-react'

interface Props {
  session: Session
}

export default function NotesEditor({ session }: Props) {
  const [value, setValue] = useState(session.notes)
  const [saved, setSaved] = useState(true)
  const [editing, setEditing] = useState(false)
  const updateNotes = useStore(s => s.updateNotes)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (notes: string) => {
      await updateNotes(session.topicSlug, notes)
      setSaved(true)
    }, 800),
    [session.topicSlug]
  )

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    setSaved(false)
    debouncedSave(e.target.value)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notes</h3>
        <div className="flex items-center gap-3">
          <span className={`text-xs transition-colors ${saved ? 'text-slate-300 dark:text-slate-600' : 'text-amber-500'}`}>
            {saved ? 'Saved' : 'Saving…'}
          </span>
          <button
            onClick={() => setEditing(e => !e)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 transition-colors"
          >
            {editing ? <><Eye size={13} /> Preview</> : <><Pencil size={13} /> Edit</>}
          </button>
        </div>
      </div>

      {editing ? (
        <textarea
          value={value}
          onChange={handleChange}
          placeholder="Write your notes here... (Markdown supported)"
          rows={24}
          className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-y leading-relaxed font-mono placeholder:text-slate-400 dark:placeholder:text-slate-600"
        />
      ) : (
        <div
          className="w-full min-h-[24rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-5 py-4 overflow-y-auto"
        >
          {value ? (
            <div className="prose prose-sm dark:prose-invert max-w-none
              prose-headings:font-semibold prose-headings:text-slate-800 dark:prose-headings:text-slate-100
              prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
              prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed
              prose-li:text-slate-600 dark:prose-li:text-slate-300
              prose-strong:text-slate-800 dark:prose-strong:text-slate-100
              prose-code:text-violet-600 dark:prose-code:text-violet-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:rounded
              prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800 prose-pre:rounded-lg
              prose-table:text-sm prose-th:text-slate-700 dark:prose-th:text-slate-200
              prose-hr:border-slate-200 dark:prose-hr:border-slate-700
              prose-a:text-violet-600 dark:prose-a:text-violet-400">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-slate-400 dark:text-slate-600 text-sm">Click Edit to add notes...</p>
          )}
        </div>
      )}
    </div>
  )
}
