import { useRef } from 'react'
import { useStore } from '@/core/store'
import type { CharacterCard } from '@/data/types'

export default function CharacterManager() {
  const { state, dispatch } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const activeId = state.settings.active_character_id

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        // 支持单个或数组
        const cards: CharacterCard[] = Array.isArray(data) ? data : [data]
        cards.forEach(card => {
          if (!card.id || !card.name) {
            alert('角色卡格式不正确，需要至少包含 id 和 name 字段')
            return
          }
          // 检查是否已存在
          const exists = state.characters.find(c => c.id === card.id)
          if (exists) {
            dispatch({ type: 'UPDATE_CHARACTER', character: card })
          } else {
            dispatch({ type: 'ADD_CHARACTER', character: card })
          }
        })
      } catch {
        alert('JSON 解析失败')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleExport = (char: CharacterCard) => {
    const blob = new Blob([JSON.stringify(char, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${char.name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportAll = () => {
    const blob = new Blob([JSON.stringify(state.characters, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'all_characters.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSetActive = (id: string) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      settings: { active_character_id: activeId === id ? null : id },
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个角色卡吗？')) {
      dispatch({ type: 'DELETE_CHARACTER', id })
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium active:bg-blue-600"
        >
          导入角色卡 (JSON)
        </button>
        <button
          onClick={handleExportAll}
          className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 rounded-xl text-sm font-medium active:opacity-70"
        >
          全部导出
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div>

      {/* 角色列表 */}
      {state.characters.length === 0 ? (
        <div className="text-center py-12text-gray-400">
          <div className="text-4xl mb-3">🎭</div>
          <div className="text-sm">还没有角色卡</div>
          <div className="text-xs mt-1">导入一个 JSON 格式的角色卡开始吧</div>
        </div>
      ) : (
        <div className="space-y-2">
          {state.characters.map(char => (
            <div
              key={char.id}
              className={`rounded-xl p-3 transition-colors ${
                activeId === char.id
                  ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500'
                  : 'bg-white/60 dark:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* 头像 */}
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl overflow-hidden shrink-0">
                  {char.avatar ? (
                    <img src={char.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    char.name[0]
                  )}
                </div>
                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[15px] flex items-center gap-2">
                    {char.name}
                    {activeId === char.id && (
                      <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full">当前</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {char.personality || '暂无描述'}
                  </div>
                </div>
              </div>
              {/* 操作 */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleSetActive(char.id)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${
                    activeId === char.id
                      ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {activeId === char.id ? '取消选择' : '设为当前'}
                </button>
                <button
                  onClick={() => handleExport(char)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700"
                >
                  导出
                </button>
                <button
                  onClick={() => handleDelete(char.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-500"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
