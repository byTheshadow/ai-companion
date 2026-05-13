import type { CharacterCard, UserCard, LorebookEntry, AppPromptTemplate } from '@/data/types'
import type { ChatMessage } from '@/core/api/llm'

interface BuildOptions {
  character: CharacterCard
  user: UserCard
  appId: string
  appPromptTemplate: AppPromptTemplate
  globalLorebook: LorebookEntry[]
  recentMessages: ChatMessage[]
  longTermMemory?: string
  sceneContext?: string // 长聊天的场景
}

export function buildSystemPrompt(options: BuildOptions): string {
  const {
    character,
    user,
    appId,
    appPromptTemplate,
    globalLorebook,
    longTermMemory,
    sceneContext,
  } = options

  const parts: string[] = []

  // [1] 角色人设
  parts.push(`## 角色设定\n${character.system_prompt}`)
  if (character.personality) parts.push(`性格特点：${character.personality}`)
  if (character.speech_style) parts.push(`说话风格：${character.speech_style}`)
  if (character.appearance) parts.push(`外貌：${character.appearance}`)
  if (character.background) parts.push(`背景：${character.background}`)

  // [2] 用户人设
  parts.push(`\n## 用户信息\n用户名：${user.name}`)
  if (user.personality) parts.push(`用户性格：${user.personality}`)
  if (user.background) parts.push(`用户背景：${user.background}`)

  // [3] 关系设定
  if (character.relationship) {
    parts.push(`\n## 关系\n你和${user.name}的关系：${character.relationship}`)
  }

  // [4] 当前App上下文
  let appContext = appPromptTemplate.template
  appContext = appContext.replace(/\{\{user\}\}/g, user.name)
  appContext = appContext.replace(/\{\{char\}\}/g, character.name)
  if (sceneContext) {
    appContext = appContext.replace(/\{\{scene\}\}/g, sceneContext)
  }
  parts.push(`\n## 当前场景\n${appContext}`)

  // [5] 世界书注入—匹配关键词
  const allLorebook = [
    ...globalLorebook.filter(e => e.enabled && e.scope === 'global'),
    ...character.lorebook.filter(e => e.enabled),...globalLorebook.filter(e => e.enabled && e.scope === character.id),
  ]

  //从最近消息中提取文本用于关键词匹配
  const recentText = options.recentMessages
    .map(m => m.content)
    .join(' ')
    .toLowerCase()

  const matchedEntries = allLorebook
    .filter(entry =>
      entry.keywords.some(kw => recentText.includes(kw.toLowerCase()))
    )
    .sort((a, b) => b.priority - a.priority)

  if (matchedEntries.length > 0) {
    parts.push(`\n## 世界设定`)
    matchedEntries.forEach(e => parts.push(e.content))
  }

  // [6] 长期记忆摘要
  if (longTermMemory) {
    parts.push(`\n## 重要记忆\n${longTermMemory}`)
  }

  // [7] 情绪状态
  parts.push(`\n## 当前情绪状态\n你现在的情绪：${character.emotion_state.current}`)

  // [8] 当前时间
  const now = new Date()
  const timeStr = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
  parts.push(`\n## 当前时间\n${timeStr}`)

  return parts.join('\n')
}

export function buildMessages(
  systemPrompt: string,
  recentMessages: ChatMessage[]
): ChatMessage[] {
  return [
    { role: 'system', content: systemPrompt },
    ...recentMessages,
  ]
}
