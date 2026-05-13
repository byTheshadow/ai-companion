import { useState, useEffect } from 'react'
import { useStore, useActiveCharacter, useActiveUser } from '@/core/store'
import { getAllConversations, saveConversation } from '@/core/storage/db'
import type { Conversation } from '@/data/types'
import { v4 as uuid } from 'uuid'
import AppShell from '@/components/AppShell'
import ConversationList from './ConversationList'
import ChatRoom from './ChatRoom'
import ChatSettings from './ChatSettings'

export default function ChatApp() {
  const { state } = useStore()
  const activeChar = useActiveCharacter()
  const activeUser = useActiveUser()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConvId, setCurrentConvId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // 加载对话列表
  useEffect(() => {
    getAllConversations().then(convs => {
      setConversations(convs.sort((a, b) => b.last_timestamp - a.last_timestamp))setLoaded(true)
    })
  }, [])

  // 创建新对话
  const handleNewChat = async () => {
    if (!activeChar) {
      alert('请先在设置中选择一个角色')
      return
    }
    const newConv: Conversation = {
      id: uuid(),
      type: 'direct',
      name: activeChar.name,
      participants: [activeChar.id],
      last_message: '',
      last_timestamp: Date.now(),
      unread_count: 0,
      theme: {
        bubble_color_user: '#007AFF',
        bubble_color_ai: '#E9E9EB',
        background: '',
        font_family: '',
        font_size: 15,
      },
    }
    await saveConversation(newConv)
    setConversations(prev => [newConv, ...prev])
    setCurrentConvId(newConv.id)
  }

  const handleUpdateConversation = (conv: Conversation) => {
    setConversations(prev => prev.map(c => (c.id === conv.id ? conv : c)))
    saveConversation(conv)
  }

  const currentConv = conversations.find(c => c.id === currentConvId)

  //聊天设置页
  if (showSettings && currentConv) {
    return (
      <ChatSettings
        conversation={currentConv}
        onUpdate={handleUpdateConversation}
        onBack={() => setShowSettings(false)}
      />
    )
  }

  // 聊天室
  if (currentConv) {
    return (
      <ChatRoom
        conversation={currentConv}
        onBack={() => setCurrentConvId(null)}
        onOpenSettings={() => setShowSettings(true)}
        onUpdateConversation={handleUpdateConversation}
      />
    )
  }

  // 对话列表
  return (
    <AppShell
      title="聊天"
      rightAction={
        <button onClick={handleNewChat} className="text-blue-500 text-2xl leading-none active:opacity-50">
          +
        </button>
      }
    >
      {!loaded ? (
        <div className="flex items-center justify-center h-40text-gray-400text-sm">加载中...</div>
      ) : !activeChar || !activeUser ? (
        <div className="flex flex-col items-center justify-center h-60text-gray-400 px-8text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-sm mb-2">请先完成设置</div>
          <div className="text-xs">
            {!activeUser && '需要创建/选择一个用户身份'}
            {!activeUser && !activeChar && '，'}
            {!activeChar && '需要导入/选择一个角色卡'}
          </div>
        </div>
      ) : (
        <ConversationList
          conversations={conversations}
          characters={state.characters}
          onSelect={id => setCurrentConvId(id)}
        />
      )}
    </AppShell>
  )
}
