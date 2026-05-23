import { useState, useCallback, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import type { Session } from '@/types'
import { useStore } from '@/store'
import { debounce } from '@/lib/utils'
import { Pencil, Eye } from 'lucide-react'

interface Props {
  session: Session
}

const SECTION_COLORS = [
  { border: 'border-violet-500', text: 'text-violet-700 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30' },
  { border: 'border-sky-500',    text: 'text-sky-700 dark:text-sky-400',       bg: 'bg-sky-50 dark:bg-sky-950/30' },
  { border: 'border-emerald-500',text: 'text-emerald-700 dark:text-emerald-400',bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { border: 'border-amber-500',  text: 'text-amber-700 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { border: 'border-rose-500',   text: 'text-rose-700 dark:text-rose-400',     bg: 'bg-rose-50 dark:bg-rose-950/30' },
  { border: 'border-cyan-500',   text: 'text-cyan-700 dark:text-cyan-400',     bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
]

function makeComponents(): Components {
  let h2Index = -1
  return {
    h2({ children }) {
      h2Index = (h2Index + 1) % SECTION_COLORS.length
      const c = SECTION_COLORS[h2Index]
      return (
        <h2 className={`flex items-center gap-2 text-base font-bold mt-6 mb-3 pl-3 border-l-4 rounded-r ${c.border} ${c.text} ${c.bg} py-1 pr-2`}>
          {children}
        </h2>
      )
    },
    h3({ children }) {
      return <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-4 mb-2">{children}</h3>
    },
  }
}

export default function NotesEditor({ session }: Props) {
  const [value, setValue] = useState(session.notes)
  const [saved, setSaved] = useState(true)
  const [editing, setEditing] = useState(false)
  const updateNotes = useStore(s => s.updateNotes)
  const componentsRef = useRef<Components>(makeComponents())

  // Rebuild color counter on each render of the preview so h2 indices are stable
  const components = editing ? componentsRef.current : makeComponents()

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
              prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed
              prose-li:text-slate-600 dark:prose-li:text-slate-300
              prose-strong:text-slate-800 dark:prose-strong:text-slate-100
              prose-code:text-violet-600 dark:prose-code:text-violet-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:rounded
              prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800 prose-pre:rounded-lg
              prose-table:text-sm prose-th:text-slate-700 dark:prose-th:text-slate-200
              prose-hr:border-slate-200 dark:prose-hr:border-slate-700
              prose-a:text-violet-600 dark:prose-a:text-violet-400">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-slate-400 dark:text-slate-600 text-sm">Click Edit to add notes...</p>
          )}
        </div>
      )}
    </div>
  )
}
