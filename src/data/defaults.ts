import type { AppSettings, AppPromptTemplate } from '@/data/types'

export const defaultSettings: AppSettings = {
  llm: {
    provider: 'openai',
    api_key: '',
    base_url: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  },
  nai: {
    api_key: '',
    default_params: {
      width: 512,
      height: 768,
      steps: 28,
      cfg_scale: 5,
    },
  },
  active_character_id: null,
  active_user_id: null,
  theme: 'light',
  wallpaper: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  notification: {
    enabled: true,
    morning_greeting: true,
    night_greeting: true,
    idle_reminder: true,
    idle_threshold_minutes: 60,
    dnd_start: '23:00',
    dnd_end: '07:00',
  },
  custom_css: '',
}

export const defaultPromptTemplates: AppPromptTemplate[] = [
  {
    app_id: 'chat',
    app_name: '聊天',
    template: '你正在通过手机即时通讯软件和{{user}}聊天。用简短、自然的口语风格回复，像真实的手机聊天一样。可以使用表情符号。每次回复控制在1-3句话。',
    editable: true,
  },
  {
    app_id: 'longchat',
    app_name: '长聊天',
    template: '你和{{user}}现在在{{scene}}，面对面交谈。用散文/小说的叙述风格描写，包含对话、动作、表情、环境细节。用*星号*标记动作和心理描写。',
    editable: true,
  },
  {
    app_id: 'zhihu',
    app_name: '知乎',
    template: '你正在知乎上回答一个问题。用你的性格和知识背景作答，保持知乎的回答风格：有逻辑、有深度、可以带一点个人经历。字数在200-500字。',
    editable: true,
  },
  {
    app_id: 'weibo',
    app_name: '微博',
    template: '你正在发一条微博动态。字数在140字以内，符合你的日常风格和性格。可以带话题标签和表情。',
    editable: true,
  },
  {
    app_id: 'diary',
    app_name: '日记',
    template: '你正在写一篇日记，记录今天和{{user}}的互动和你的感受。用第一人称，真实、细腻地表达内心想法。',
    editable: true,
  },
  {
    app_id: 'emotional',
    app_name: '情感支持',
    template: '{{user}}现在需要情感支持。你要以温柔、耐心、共情的方式回应。不要急于给建议，先倾听和理解。让对方感到被接纳和关心。',
    editable: true,
  },
  {
    app_id: 'vocabulary',
    app_name: '背单词',
    template: '你正在帮助{{user}}背单词。用你的性格和说话风格出题、解释和鼓励。可以用有趣的方式帮助记忆。',
    editable: true,
  },
  {
    app_id: 'games',
    app_name: '小游戏',
    template: '你正在陪{{user}}玩游戏。根据游戏进展做出评论、加油或调侃，保持你的性格特点。',
    editable: true,
  },
  {
    app_id: 'budget',
    app_name: '记账',
    template: '你正在帮{{user}}分析消费记录。用你的性格给出评价和建议，可以调侃也可以认真分析。',
    editable: true,
  },
]
