import { useStore } from '@/core/store'
import type { AppDefinition } from '@/data/types'

const apps: AppDefinition[] = [
  { id: 'chat', name: '聊天', icon: '💬', color: '#34C759', component: 'chat' },
  { id: 'longchat', name: '长聊天', icon: '💬', color: '#5856D6', component: 'longchat' },
  { id: 'album', name: '相册', icon: '📸', color: '#FF9500', component: 'album' },
  { id: 'music', name: '音乐', icon: '🎵', color: '#FF2D55', component: 'music' },
  { id: 'calendar', name: '日历', icon: '📅', color: '#FF3B30', component: 'calendar' },
  { id: 'zhihu', name: '知乎', icon: '📖', color: '#0A84FF', component: 'zhihu' },
  { id: 'weibo', name: '微博', icon: '💌', color: '#FF6B35', component: 'weibo' },
  { id: 'diary', name: '日记', icon: '📓', color: '#FFCC00', component: 'diary' },
  { id: 'budget', name: '记账', icon: '💰', color: '#30D158', component: 'budget' },
  { id: 'emotional', name: '情感支持', icon: '🧠', color: '#BF5AF2', component: 'emotional' },
  { id: 'countdown', name: '倒数日', icon: '⏳', color: '#64D2FF', component: 'countdown' },
  { id: 'vocabulary', name: '背单词', icon: '🔤', color: '#FF9F0A', component: 'vocabulary' },
  { id: 'games', name: '小游戏', icon: '🎮', color: '#32ADE6', component: 'games' },
  { id: 'settings', name: '设置', icon: '⚙️', color: '#8E8E93', component: 'settings' },
]

export default function Launcher() {
  const { dispatch } = useStore()

  return (
    <div className="h-full flex flex-col px-6 pt-8 pb-6 overflow-y-auto">
      {/* App图标网格 */}
      <div className="grid grid-cols-4 gap-y-6 gap-x-4">
        {apps.map(app => (
          <button
            key={app.id}
            className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform duration-150"
            onClick={() => dispatch({ type: 'OPEN_APP', app: app.id })}
          >
            {/* 图标 */}
            <div
              className="w-14 h-14 rounded-[16px] flex items-center justify-center text-2xl shadow-lg relative"
              style={{ backgroundColor: app.color }}
            >
              {app.icon_url ? (
                <img src={app.icon_url} alt={app.name} className="w-8 h-8 object-contain" />
              ) : (
                <span className="text-2xl">{app.icon}</span>
              )}
              {/* 角标 */}
              {app.badge && app.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {app.badge > 99 ? '99+' : app.badge}
                </span>
              )}
            </div>
            {/* 名称 */}
            <span className="text-xs text-white font-medium drop-shadow-sm truncate w-full text-center">
              {app.name}
            </span>
          </button>
        ))}
      </div>

      {/* 底部 Home 指示条 */}
      <div className="mt-auto flex justify-center pt-4">
        <div className="w-32 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  )
}
