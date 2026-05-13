//===== 角色卡 =====
export interface LorebookEntry {
  id: string
  keywords: string[]
  content: string
  priority: number
  enabled: boolean
  scope: 'global' | string // 'global' 或 character_id
}

export interface NAIConfig {
  enabled: boolean
  base_prompt: string
  negative_prompt: string
  style: string
  model: string
}

export interface AppsConfig {
  weibo_style: string
  zhihu_topics: string[]
  music_taste: string
  diary_style: string
}

export interface EmotionState {
  current:'happy' | 'sad' | 'angry' | 'shy' | 'neutral'
  last_updated: number
}

export interface CharacterCard {
  id: string
  name: string
  avatar: string // base64 | url
  gender: 'male' | 'female' | 'other'
  age: number
  personality: string
  background: string
  speech_style: string
  appearance: string
  relationship: string
  system_prompt: string
  first_message: string
  lorebook: LorebookEntry[]
  nai_config: NAIConfig
  apps_config: AppsConfig
  emotion_state: EmotionState
  created_at: number
}

// ===== 用户卡 =====
export interface UserCard {
  id: string
  name: string
  avatar: string
  personality: string
  background: string
  custom_css: string
  created_at: number
}

// ===== 消息 =====
export type MessageType = 'text' | 'image' | 'audio_mock' | 'sticker'

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  type: MessageType
  image_url: string | null
  timestamp: number
  character_id: string | null
  read: boolean
}

// ===== 对话 =====
export interface ConversationTheme {
  bubble_color_user: string
  bubble_color_ai: string
  background: string // base64 | color | url
  font_family: string
  font_size: number
}

export interface Conversation {
  id: string
  type: 'direct' | 'group'
  name: string
  participants: string[] // character_ids
  last_message: string
  last_timestamp: number
  unread_count: number
  theme: ConversationTheme
}

// ===== API设置 =====
export interface LLMConfig {
  provider: 'openai' | 'claude' | 'gemini' | 'ollama' | 'custom'
  api_key: string
  base_url: string
  model: string
}

export interface NAIApiConfig {
  api_key: string
  default_params: {
    width: number
    height: number
    steps: number
    cfg_scale: number
  }
}

// ===== App Prompt 模板 =====
export interface AppPromptTemplate {
  app_id: string
  app_name: string
  template: string
  editable: boolean
}

// ===== 全局设置 =====
export interface AppSettings {
  llm: LLMConfig
  nai: NAIApiConfig
  active_character_id: string | null
  active_user_id: string | null
  theme: 'light' | 'dark'
  wallpaper: string // base64 | url | color
  notification: {
    enabled: boolean
    morning_greeting: boolean
    night_greeting: boolean
    idle_reminder: boolean
    idle_threshold_minutes: number
    dnd_start: string // "22:00"
    dnd_end: string// "08:00"
  }
  custom_css: string
}

// ===== App 定义 =====
export interface AppDefinition {
  id: string
  name: string
  icon: string        // emoji
  icon_url?: string   // 图片URL，优先于emoji
  color: string       // 图标背景色
  component: string
  badge?: number
}
