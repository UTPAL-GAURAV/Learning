import type { Session } from '@/types'
import TopicCard from './TopicCard'

interface Props {
  sessions: Session[]
}

export default function TopicGrid({ sessions }: Props) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-24 text-slate-400">
        <div className="text-5xl mb-4">📚</div>
        <p className="text-lg font-medium text-slate-500 dark:text-slate-400">No topics yet</p>
        <p className="text-sm mt-1 dark:text-slate-500">Click <strong>"New Session"</strong> to start learning</p>
      </div>
    )
  }

  const sorted = [...sessions].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sorted.map(s => <TopicCard key={s.id} session={s} />)}
    </div>
  )
}
