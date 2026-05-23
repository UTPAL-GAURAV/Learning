import type { Session, ProgressData, WeakAreasData } from '@/types'
import { computeReadinessScore } from './scoring'

export function generateSessionMd(session: Session): string {
  const score = computeReadinessScore(session)
  const lines: string[] = [
    `# ${session.topic} — Study Notes`,
    `> Topic: ${session.topic} | Sessions: ${session.sessionCount} | Readiness: ${score}/100`,
    `> Last updated: ${new Date(session.updatedAt).toLocaleDateString()}`,
    '',
    '---',
    '',
  ]

  if (session.notes.trim()) {
    lines.push('## Notes', '', session.notes.trim(), '', '---', '')
  }

  if (session.keyConcepts.length > 0) {
    lines.push('## Key Concepts', '')
    session.keyConcepts.forEach(c => lines.push(`- ${c}`))
    lines.push('', '---', '')
  }

  if (session.qa.length > 0) {
    lines.push('## Q&A', '')
    session.qa.forEach((q, i) => {
      const total = q.attempts.length
      const correct = q.attempts.filter(a => a.correct).length
      const rate = total > 0 ? Math.round((correct / total) * 100) : null
      lines.push(
        `### Q${i + 1}: ${q.question}`,
        `**Answer:** ${q.answer}`,
        `**Difficulty:** ${q.difficulty}${rate !== null ? ` | **Correct rate:** ${rate}% (${correct}/${total})` : ''}`,
        q.wrongCount > 0 ? `⚠️ Wrong ${q.wrongCount} time${q.wrongCount > 1 ? 's' : ''}` : '',
        '',
      )
    })
    lines.push('---', '')
  }

  const weakQs = session.qa.filter(q => q.wrongCount > 0).sort((a, b) => b.wrongCount - a.wrongCount)
  if (weakQs.length > 0) {
    lines.push('## Weak Areas — Drill These', '')
    weakQs.forEach(q => {
      lines.push(`### [${q.wrongCount}x wrong] ${q.question}`, `**Answer:** ${q.answer}`, '')
    })
    lines.push('---', '')
  }

  return lines.filter(l => l !== undefined).join('\n')
}

export function generateProgressMd(progress: ProgressData, weakAreasData: WeakAreasData): string {
  const topics = Object.values(progress.topics).sort((a, b) => b.readinessScore - a.readinessScore)

  const statusIcon = (score: number) => score >= 75 ? '✅' : score >= 45 ? '🟡' : score > 0 ? '🔴' : '⬜'

  const lines: string[] = [
    '# Interview Prep Progress',
    `> Last updated: ${new Date(progress.lastUpdated).toLocaleDateString()}`,
    '',
    '## Overview',
    `- Total topics studied: ${topics.length}`,
    `- Total sessions: ${progress.totalSessionsCompleted}`,
    `- Interview-ready topics (score ≥ 75): ${topics.filter(t => t.readinessScore >= 75).length}`,
    '',
    '## Topic Scores',
    '',
    '| Topic | Score | Status | Last Studied | Sessions |',
    '|-------|-------|--------|--------------|----------|',
    ...topics.map(t =>
      `| ${statusIcon(t.readinessScore)} ${t.displayName} | ${t.readinessScore} | ${t.status} | ${new Date(t.lastStudied).toLocaleDateString()} | ${t.sessionCount} |`
    ),
    '',
    '## Weak Areas (Repeated Mistakes)',
    '',
  ]

  const topWeak = weakAreasData.weakAreas
    .filter(w => w.wrongCount >= 2)
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, 10)

  if (topWeak.length > 0) {
    topWeak.forEach(w => {
      lines.push(`- **[${w.topic}]** ${w.question} — wrong ${w.wrongCount} times`)
    })
  } else {
    lines.push('_No repeated mistakes yet. Keep going!_')
  }

  return lines.join('\n')
}

export function generateSkillMd(progress: ProgressData, weakAreasData: WeakAreasData): string {
  const topics = Object.values(progress.topics)
  const lines: string[] = [
    '# Skill Level Assessment',
    `> Last updated: ${new Date(progress.lastUpdated).toLocaleDateString()}`,
    `> Use this file for interview self-assessment or share with NotebookLM.`,
    '',
  ]

  topics.forEach(t => {
    const level = t.readinessScore >= 75 ? 'Advanced' : t.readinessScore >= 45 ? 'Intermediate' : 'Beginner'
    const weak = weakAreasData.weakAreas.filter(w => w.topic === t.topicSlug)
    lines.push(
      `## ${t.displayName}`,
      `**Level:** ${level} | **Score:** ${t.readinessScore}/100`,
      `**Questions practiced:** ${t.totalQuestions} | **First-try correct:** ${t.correctOnFirstTry}`,
      '',
    )
    if (weak.length > 0) {
      lines.push('**Gaps to close:**')
      weak.forEach(w => lines.push(`- ${w.question} (wrong ${w.wrongCount}x)`))
      lines.push('')
    }
    lines.push('---', '')
  })

  return lines.join('\n')
}

export function generateWeakAreasMd(weakAreasData: WeakAreasData): string {
  const byTopic = weakAreasData.weakAreas.reduce<Record<string, typeof weakAreasData.weakAreas>>((acc, w) => {
    if (!acc[w.topic]) acc[w.topic] = []
    acc[w.topic].push(w)
    return acc
  }, {})

  const lines: string[] = [
    '# Weak Areas — Final Prep Drill Sheet',
    `> Generated: ${new Date().toLocaleDateString()}`,
    '> Use this file for last-mile interview cramming. These are topics you repeatedly got wrong.',
    '',
  ]

  Object.entries(byTopic).forEach(([topic, areas]) => {
    const sorted = areas.sort((a, b) => b.wrongCount - a.wrongCount)
    lines.push(`## ${topic.charAt(0).toUpperCase() + topic.slice(1)} (${sorted.length} weak questions)`, '')
    sorted.forEach(w => {
      const priority = w.wrongCount >= 4 ? '🔴 HIGH' : w.wrongCount >= 2 ? '🟡 MEDIUM' : '⬜ LOW'
      lines.push(
        `### [${priority}] ${w.question}`,
        `- Wrong count: ${w.wrongCount}`,
        `- Last wrong: ${new Date(w.lastWrong).toLocaleDateString()}`,
        '',
      )
    })
    lines.push('---', '')
  })

  return lines.join('\n')
}
