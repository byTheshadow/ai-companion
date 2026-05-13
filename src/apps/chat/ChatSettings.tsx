import type { Conversation } from '@/data/types'
import AppShell from '@/components/AppShell'

interface Props {
  conversation: Conversation
  onUpdate: (conv: Conversation) => void
  onBack: () => void
}

const presetBubbleColors = [
  '#007AFF', '#34C759', '#FF9500', '#FF2D55', '#AF52DE',
  '#5856D6', '#FF3B30', '#00C7BE', '#32ADE6', '#FFD60A',
]

const presetBgColors = [
  '', '#F2F2F7', '#E8F5E9', '#FFF3E0', '#FCE4EC',
  '#E3F2FD', '#F3E5F5', '#1C1C1E', '#2C2C2E',
]

export default function ChatSettings({ conversation, onUpdate, onBack }: Props) {
  const theme = conversation.theme

  const updateTheme = (partial: Partial<typeof theme>) => {
    onUpdate({ ...conversation, theme: { ...theme, ...partial } })
  }

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      updateTheme({ background: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  return (
    <AppShell title="聊天设置" onBack={onBack}>
      <div className="p-4 space-y-6">
        {/* 用户气泡颜色 */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">我的气泡颜色</h3>
          <div className="flex gap-2 flex-wrap">
            {presetBubbleColors.map(color => (
              <button
                key={color}
                onClick={() => updateTheme({ bubble_color_user: color })}
                className={`w-9 h-9 rounded-full ring-2 transition-all ${
                  theme.bubble_color_user === color ? 'ring-blue-500 scale-110' : 'ring-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </section>

        {/* AI气泡颜色 */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">对方气泡颜色</h3>
          <div className="flex gap-2 flex-wrap">
            {['#E9E9EB', '#DCF8C6', '#FFF9C4', '#F3E5F5', '#E3F2FD', '#FFCCBC', '#333333', '#1E1E1E'].map(color => (
              <button
                key={color}
                onClick={() => updateTheme({ bubble_color_ai: color })}
                className={`w-9 h-9 rounded-full ring-2 transition-all border border-gray-200 ${
                  theme.bubble_color_ai === color ? 'ring-blue-500 scale-110' : 'ring-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </section>

        {/* 聊天壁纸 */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">聊天壁纸</h3>
          <div className="flex gap-2 flex-wrap">
            {presetBgColors.map((bg, i) => (
              <button
                key={i}
                onClick={() => updateTheme({ background: bg })}
                className={`w-12 h-16 rounded-lg ring-2 transition-all border border-gray-200 ${
                  theme.background === bg ? 'ring-blue-500 scale-105' : 'ring-transparent'
                }`}
                style={{ backgroundColor: bg || '#fff' }}
              >
                {!bg && <span className="text-[10px] text-gray-400">默认</span>}
              </button>
            ))}
            <label className="w-12 h-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer">
              <span className="text-sm">📷</span>
              <span className="text-[8px] text-gray-400">上传</span>
              <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
            </label>
          </div>
        </section>

        {/* 字体大小 */}
        <section>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
            字体大小：{theme.font_size}px
          </h3>
          <input
            type="range"
            min={12}
            max={22}
            value={theme.font_size}
            onChange={e => updateTheme({ font_size: Number(e.target.value) })}
            className="w-full"
          />
        </section>
      </div>
    </AppShell>
  )
}
