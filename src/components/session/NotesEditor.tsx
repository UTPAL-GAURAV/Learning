import { useState, useCallback } from 'react'
import type { Session } from '@/types'
import { useStore } from '@/store'
import { debounce } from '@/lib/utils'

interface Props {
  session: Session
}

export default function NotesEditor({ session }: Props) {
  const [value, setValue] = useState(session.notes)
  const [saved, setSaved] = useState(true)
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
        <span className={`text-xs transition-colors ${saved ? 'text-slate-300 dark:text-slate-600' : 'text-amber-500'}`}>
          {saved ? 'Saved' : 'Saving…'}
        </span>
      </div>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Write your notes here... (Markdown supported)"
        rows={8}
        className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-y leading-relaxed font-mono placeholder:text-slate-400 dark:placeholder:text-slate-600"
      />
    </div>
  )
}
