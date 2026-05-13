import { useState, useEffect, useRef } from 'react'
import { useStore, useActiveCharacter, useActiveUser } from '@/core/store'
import { addMessage, getMessagesByConversation } from '@/core/storage/db'
import { callLLM, type ChatMessage as LLMMessage } from '@/core/api/llm'
import { buildSystemPrompt, buildMessages } from '@/core/prompt/builder'
import type { Conversation, Message } from '@/data/types'
import { v4 as uuid } from 'uuid'

interface Props {
  conversation: Conversation
  onBack: () => void
  onOpenSettings: () => void
  onUpdateConversation: (conv: Conversation) => void
}

export default function ChatRoom({ conversation, onBack, onOpenSettings, onUpdateConversation }: Props) {
  const { state } = useStore()
  const activeChar = useActiveCharacter()
  const activeUser = useActiveUser()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streamContent, setStreamContent] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 加载消息
  useEffect(() => {
    getMessagesByConversation(conversation.id).then(msgs => {
      setMessages(msgs.sort((a, b) => a.timestamp - b.timestamp))
    })
  }, [conversation.id])

  // 自动滚动到底部
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streamContent])

  // 发送首条消息
  useEffect(() => {
    if (messages.length === 0 && activeChar?.first_message) {
      const firstMsg: Message = {
        id: uuid(),
        conversation_id: conversation.id,
        role: 'assistant',
        content: activeChar.first_message,
        type: 'text',
        image_url: null,
        timestamp: Date.now(),
        character_id: activeChar.id,
        read: true,
      }
      addMessage(firstMsg)
      setMessages([firstMsg])
      onUpdateConversation({
        ...conversation,
        last_message: activeChar.first_message,
        last_timestamp: Date.now(),
      })
    }
  }, [messages.length, activeChar])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || !activeChar || !activeUser || isTyping) return

    setInput('')

    // 用户消息
    const userMsg: Message = {
      id: uuid(),
      conversation_id: conversation.id,
      role: 'user',
      content: text,
      type: 'text',
      image_url: null,
      timestamp: Date.now(),
      character_id: null,
      read: true,
    }
    await addMessage(userMsg)
    setMessages(prev => [...prev, userMsg])

    // 构建上下文
    setIsTyping(true)
    setStreamContent('')

    try {
      const recentMessages: LLMMessage[] = [...messages, userMsg]
        .slice(-20)
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))

      const appTemplate = state.promptTemplates.find(t => t.app_id === 'chat')!

      const systemPrompt = buildSystemPrompt({
        character: activeChar,
        user: activeUser,
        appId: 'chat',
        appPromptTemplate: appTemplate,
        globalLorebook: state.globalLorebook,
        recentMessages,
      })

      const fullMessages = buildMessages(systemPrompt, recentMessages)

      let aiContent = ''

      if (state.settings.llm.api_key) {
        const response = await callLLM(state.settings.llm, fullMessages, {
          stream: true,
          onChunk: (chunk) => {
            aiContent += chunk
            setStreamContent(aiContent)
          },
        })
        aiContent = response.content || aiContent
      } else {
        // 无API Key时的模拟回复
        aiContent = `[未配置API Key] 我是${activeChar.name}，请在设置中配置API Key后再来聊天~`
      }

      const aiMsg: Message = {
        id: uuid(),
        conversation_id: conversation.id,
        role: 'assistant',
        content: aiContent,
        type: 'text',
        image_url: null,
        timestamp: Date.now(),
        character_id: activeChar.id,
        read: true,
      }
      await addMessage(aiMsg)
      setMessages(prev => [...prev, aiMsg])
      setStreamContent('')

      onUpdateConversation({
        ...conversation,
        last_message: aiContent.slice(0, 50),
        last_timestamp: Date.now(),
      })
    } catch (err: any) {
      const errorMsg: Message = {
        id: uuid(),
        conversation_id: conversation.id,
        role: 'system',
        content: `❌ 发送失败：${err.message}`,
        type: 'text',
        image_url: null,
        timestamp: Date.now(),
        character_id: null,
        read: true,
      }
      await addMessage(errorMsg)
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  //聊天壁纸
  const bgStyle: React.CSSProperties = conversation.theme.background
    ? conversation.theme.background.startsWith('data:') || conversation.theme.background.startsWith('http')
      ? { backgroundImage: `url(${conversation.theme.background})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundColor: conversation.theme.background }
    : {}

  return (
    <div className="h-full flex flex-col">
      {/* 顶栏 */}
      <div className="glass-heavy border-b border-black/5 dark:border-white/10 flex items-center px-4 h-11shrink-0">
        <button onClick={onBack} className="text-blue-500 active:opacity-50 mr-3flex items-center gap-1">
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path d="M9 1L1 9l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[17px]">返回</span>
        </button>
        <div className="flex-1 text-center">
          <div className="font-semibold text-[17px]">{conversation.name}</div>
          {isTyping && (
            <div className="text-xs text-gray-400">对方正在输入...</div>
          )}
        </div>
        <button onClick={onOpenSettings} className="text-blue-500 active:opacity-50">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="5" r="1.5" fill="currentColor" />
            <circle cx="11" cy="11" r="1.5" fill="currentColor" />
            <circle cx="11" cy="17" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* 消息区*/}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-2"
        style={bgStyle}
      >
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            theme={conversation.theme}
            characterAvatar={activeChar?.avatar}
            userAvatar={activeUser?.avatar}/>
        ))}

        {/* 流式输出中*/}
        {streamContent && (
          <MessageBubble
            message={{
              id: 'streaming',
              conversation_id: '',
              role: 'assistant',
              content: streamContent,
              type: 'text',
              image_url: null,
              timestamp: Date.now(),
              character_id: null,
              read: true,
            }}
            theme={conversation.theme}
            characterAvatar={activeChar?.avatar}
            userAvatar={activeUser?.avatar}
          />
        )}

        {/* 正在输入动画 */}
        {isTyping && !streamContent && (
          <div className="flex items-end gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm overflow-hidden shrink-0">
              {activeChar?.avatar ? (
                <img src={activeChar.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                activeChar?.name?.[0]
              )}
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot" style={{ animationDelay: '0s' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dot" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
      </div>

      {/* 输入区 */}
      <div className="glass-heavy border-t border-black/5 dark:border-white/10 px-3 py-2safe-bottom">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            rows={1}
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2 text-[15px] outline-none resize-none max-h-32"
            style={{
              fontFamily: conversation.theme.font_family || 'inherit',
              fontSize: conversation.theme.font_size ||15,
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              input.trim() && !isTyping
                ? 'bg-blue-500 text-white active:bg-blue-600'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

//===== 消息气泡组件 =====
function MessageBubble({
  message,
  theme,
  characterAvatar,
  userAvatar,
}: {
  message: Message
  theme: Conversation['theme']
  characterAvatar?: string
  userAvatar?: string
}) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-gray-400bg-black/5 dark:bg-white/5 rounded-full px-3 py-1">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex items-end gap-2 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* 头像 */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm overflow-hidden shrink-0">
          {characterAvatar ? (
            <img src={characterAvatar} alt="" className="w-full h-full object-cover" />
          ) : (
            '🤖'
          )}
        </div>
      )}

      {/* 气泡 */}
      <div
        className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? 'rounded-br-md text-white'
            : 'rounded-bl-md'
        }`}
        style={{
          backgroundColor: isUser ? theme.bubble_color_user : theme.bubble_color_ai,
          color: isUser ? '#fff' : undefined,
          fontFamily: theme.font_family || 'inherit',
          fontSize: theme.font_size || 15,
        }}
      >
        {message.content}
      </div>

      {/* 已读标记 */}
      {isUser && (
        <div className="text-[10px] text-blue-400 shrink-0 self-end mb-0.5">已读</div>
      )}
    </div>
  )
}
