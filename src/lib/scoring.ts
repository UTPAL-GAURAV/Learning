export function getScoreLabel(score: number): 'Ready' | 'In Progress' | 'Needs Work' | 'New' {
  if (score >= 75) return 'Ready'
  if (score >= 45) return 'In Progress'
  if (score > 0) return 'Needs Work'
  return 'New'
}

export function getScoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-600'
  if (score >= 45) return 'text-amber-600'
  if (score > 0) return 'text-red-600'
  return 'text-slate-400'
}

export function getScoreBg(score: number): string {
  if (score >= 75) return 'bg-emerald-500'
  if (score >= 45) return 'bg-amber-500'
  if (score > 0) return 'bg-red-500'
  return 'bg-slate-300'
}
