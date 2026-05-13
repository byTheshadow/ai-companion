import type { Conversation, CharacterCard } from '@/data/types'

interface Props {
  conversations: Conversation[]
  characters: CharacterCard[]
  onSelect: (id: string) => void
}

export default function ConversationList({ conversations, characters, onSelect }: Props) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-gray-400">
        <div className="text-4xl mb-3">💬</div>
        <div className="text-sm">还没有对话</div>
        <div className="text-xs mt-1">点击右上角 + 开始新对话</div>
      </div>
    )
  }

  return (
    <div className="divide-y divide-black/5 dark:divide-white/5">
      {conversations.map(conv => {
        const char = characters.find(c => conv.participants.includes(c.id))
        const timeStr = new Date(conv.last_timestamp).toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        })

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className="w-full flex items-center gap-3 px-4 py-3 active:bg-black/5 dark:active:bg-white/5 transition-colors"
          >
            {/* 头像 */}
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl overflow-hidden shrink-0 relative">
              {char?.avatar ? (
                <img src={char.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{char?.name?.[0] || '?'}</span>
              )}{conv.unread_count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {conv.unread_count}
                </span>
              )}
            </div>
            {/* 内容 */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[15px] truncate">{conv.name}</span>
                <span className="text-xs text-gray-400shrink-0 ml-2">{timeStr}</span>
              </div>
              <div className="text-sm text-gray-500 truncate mt-0.5">
                {conv.last_message || '开始聊天吧'}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
