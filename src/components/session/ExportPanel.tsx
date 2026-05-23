import { useState } from 'react'
import type { Session } from '@/types'
import { useStore } from '@/store'
import { generateSessionMd, generateProgressMd, generateSkillMd, generateWeakAreasMd } from '@/lib/markdownExport'
import { downloadText, copyToClipboard } from '@/lib/utils'
import { Download, Copy, FileText, Check } from 'lucide-react'

interface Props {
  session: Session
}

export default function ExportPanel({ session }: Props) {
  const { progress, weakAreas } = useStore()
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = async (content: string, key: string) => {
    await copyToClipboard(content)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const exports = [
    { key: 'session', label: `${session.topic} notes`, description: 'Full session for NotebookLM', content: generateSessionMd(session), filename: `${session.topicSlug}.md` },
    { key: 'progress', label: 'Progress overview', description: 'All topics + scores', content: generateProgressMd(progress, weakAreas), filename: 'progress.md' },
    { key: 'skill', label: 'Skill assessment', description: 'Skill levels + gaps', content: generateSkillMd(progress, weakAreas), filename: 'skill.md' },
    { key: 'weak', label: 'Weak areas drill', description: 'Last-mile cramming sheet', content: generateWeakAreasMd(weakAreas), filename: 'weak-areas.md' },
  ]

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <FileText size={14} className="text-slate-500 dark:text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Export</h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">for NotebookLM / review</span>
      </div>
      <div className="space-y-2">
        {exports.map(e => (
          <div key={e.key} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
            <div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{e.label}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{e.description}</p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => handleCopy(e.content, e.key)}
                className="p-1.5 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors" title="Copy to clipboard">
                {copied === e.key ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
              <button onClick={() => downloadText(e.content, e.filename)}
                className="p-1.5 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors" title="Download .md">
                <Download size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
