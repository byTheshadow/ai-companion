import { useStore } from '@/core/store'

const presetWallpapers = [
  { name: '紫蓝渐变', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: '暖橙', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: '深海', value: 'linear-gradient(135deg, #0c3547 0%, #1a5276 50%, #2e86c1 100%)' },
  { name: '森林', value: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
  { name: '夜空', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { name: '纯黑', value: '#000000' },
  { name: '纯白', value: '#ffffff' },
]

export default function ThemeSettings() {
  const { state, dispatch } = useStore()

  const updateSettings = (partial: Partial<typeof state.settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: partial })
  }

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      updateSettings({ wallpaper: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="p-4 space-y-6">
      {/* 深浅色模式 */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">外观模式</h3>
        <div className="flex gap-2">
          {(['light', 'dark'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => updateSettings({ theme: mode })}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                state.settings.theme === mode
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/60 dark:bg-white/5'
              }`}
            >
              {mode === 'light' ? '☀️浅色' : '🌙 深色'}
            </button>
          ))}
        </div>
      </section>

      {/* 壁纸*/}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">桌面壁纸</h3>
        <div className="grid grid-cols-4 gap-2">
          {presetWallpapers.map(wp => (
            <button
              key={wp.name}
              onClick={() => updateSettings({ wallpaper: wp.value })}
              className={`aspect-[9/16] rounded-xl overflow-hidden ring-2 transition-all ${
                state.settings.wallpaper === wp.value ? 'ring-blue-500 scale-95' : 'ring-transparent'
              }`}
              style={{ background: wp.value }}
            >
              <span className="text-[10px] text-white drop-shadow-sm">{wp.name}</span>
            </button>
          ))}{/* 自定义上传 */}
          <label className="aspect-[9/16] rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer active:opacity-70">
            <span className="text-lg">📷</span>
            <span className="text-[10px] text-gray-400 mt-1">上传</span>
            <input type="file" accept="image/*" onChange={handleWallpaperUpload} className="hidden" />
          </label>
        </div>
      </section>

      {/* 自定义CSS */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">自定义 CSS</h3>
        <textarea
          value={state.settings.custom_css}
          onChange={e => updateSettings({ custom_css: e.target.value })}
          placeholder="输入自定义CSS，会全局注入..."
          rows={6}
          className="w-full bg-white/60 dark:bg-white/5 rounded-xl px-3 py-2 text-sm font-mono outline-none resize-none"
        />
      </section>
    </div>
  )
}
