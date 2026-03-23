import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// AI usage limits per plan
export const AI_LIMITS = {
  free: { tribute_writer: 0, life_story: 0, biography: 0 },
  premium: { tribute_writer: 10, life_story: 0, biography: 5 },
  lifetime: { tribute_writer: Infinity, life_story: Infinity, biography: Infinity },
} as const

export type AITool = 'tribute_writer' | 'life_story' | 'biography'

export function buildTributePrompt(opts: {
  name: string
  born?: string
  died?: string
  tone: string
  length: string
  memories?: string
  details?: string[]
}) {
  const tones: Record<string, string> = {
    warm: 'warm, personal, and heartfelt — as if speaking from the heart',
    poetic: 'poetic and lyrical with evocative imagery',
    celebratory: 'celebratory, focusing on joy and gratitude',
    spiritual: 'spiritual and peaceful, offering comfort through faith',
    formal: 'formal and dignified',
    humorous: 'warm with gentle humour that captures their spirit',
  }

  const lengths: Record<string, string> = {
    short: '2-3 sentences only',
    medium: 'one substantive paragraph (4-6 sentences)',
    long: '2-3 rich paragraphs',
  }

  return `Write a heartfelt tribute for ${opts.name}${opts.born ? ` (born ${opts.born}` : ''}${opts.died ? `, passed ${opts.died})` : opts.born ? ')' : ''}.

Tone: Write in a ${tones[opts.tone] || tones.warm} tone.
Length: ${lengths[opts.length] || lengths.medium}.

${opts.memories ? `Memories and thoughts shared:\n"${opts.memories}"` : ''}
${opts.details?.length ? `Key qualities to weave in: ${opts.details.join(', ')}` : ''}

Rules:
- Write ONLY the tribute text — no title, no quotes around it, no preamble
- First person, as if from a loved one
- Specific and human — not generic
- No clichés like "gone too soon" or "watching over us"

Write the tribute now:`
}

export function buildLifeStoryPrompt(opts: {
  name: string
  born?: string
  died?: string
  birthplace?: string
  occupation?: string
  style: string
  chapter: string
  bullets?: string
}) {
  const styles: Record<string, string> = {
    warm: 'warm, narrative memoir style — intimate and personal',
    literary: 'literary and poetic with vivid imagery',
    intimate: 'intimate, like a heartfelt letter',
    classic: 'classic biography style — dignified and well-structured',
  }

  const chapters: Record<string, string> = {
    'early-life': 'childhood, family of origin, early memories, and formative experiences',
    'education': 'school years, intellectual development, and coming of age',
    'career': `professional life and vocation${opts.occupation ? ` as a ${opts.occupation}` : ''}`,
    'love': 'love, marriage, and romantic partnership',
    'family': 'family life, parenting, and home',
    'passions': 'hobbies, passions, and what brought joy',
    'faith-life': 'faith, spirituality, and community',
    'legacy': 'lasting impact and what they leave behind',
  }

  return `Write a chapter of a life story biography for ${opts.name}${opts.born ? ` (${opts.born}–${opts.died || 'present'})` : ''}.

Chapter: ${chapters[opts.chapter] || opts.chapter}
Style: ${styles[opts.style] || styles.warm}
${opts.birthplace ? `Birthplace: ${opts.birthplace}` : ''}

${opts.bullets ? `Facts and memories to weave in:\n• ${opts.bullets}` : ''}

Rules:
- Write 2-3 substantial paragraphs
- Third person (she/he/they)
- No chapter title — just the body text
- Specific, resonant, human — not generic
- End on a quiet, meaningful note

Write the chapter now:`
}
