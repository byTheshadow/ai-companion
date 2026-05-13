import { useRef, useState } from 'react'
import { useStore } from '@/core/store'
import type { LorebookEntry } from '@/data/types'
import { v4 as uuid } from 'uuid'

export default function LorebookManager() {
  const { state, dispatch } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const entries = state.globalLorebook

  const handleAdd = () => {
    const newEntry: LorebookEntry = {
      id: uuid(),
      keywords: ['新关键词'],
      content: '',
      priority: 0,
      enabled: true,
      scope: 'global',
    }
    dispatch({ type: 'SET_GLOBAL_LOREBOOK', entries: [...entries, newEntry] })setEditingId(newEntry.id)
  }

  const handleUpdate = (id: string, partial: Partial<LorebookEntry>) => {
    dispatch({
      type: 'SET_GLOBAL_LOREBOOK',
      entries: entries.map(e => (e.id === id ? { ...e, ...partial } : e)),
    })
  }

  const handleDelete = (id: string) => {
    dispatch({
      type: 'SET_GLOBAL_LOREBOOK',
      entries: entries.filter(e => e.id !== id),
    })
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as LorebookEntry[]
        dispatch({ type: 'SET_GLOBAL_LOREBOOK', entries: [...entries, ...data] })
      } catch {
        alert('JSON 解析失败')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lorebook.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <button onClick={handleAdd} className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium">
          新增条目
        </button>
        <button onClick={() => fileRef.current?.click()} className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 rounded-xl text-sm font-medium">
          导入
        </button>
        <button onClick={handleExport} className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 rounded-xl text-sm font-medium">
          导出
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📚</div>
          <div className="text-sm">世界书为空</div>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => (
            <div key={entry.id} className="bg-white/60 dark:bg-white/5 rounded-xl p-3">
              {editingId === entry.id ? (
                <div className="space-y-2">
                  <input
                    value={entry.keywords.join(', ')}
                    onChange={e => handleUpdate(entry.id, { keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    placeholder="关键词（逗号分隔）"
                    className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none"
                  />
                  <textarea
                    value={entry.content}
                    onChange={e => handleUpdate(entry.id, { content: e.target.value })}
                    placeholder="内容"
                    rows={3}
                    className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">优先级：</span>
                    <input
                      type="number"
                      value={entry.priority}
                      onChange={e => handleUpdate(entry.id, { priority: Number(e.target.value) })}
                      className="w-16 bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1 text-sm outline-none"
                    /><select
                      value={entry.scope}
                      onChange={e => handleUpdate(entry.id, { scope: e.target.value })}
                      className="bg-gray-100 dark:bg-gray-800 rounded-lg px-2 py-1 text-sm outline-none"
                    >
                      <option value="global">全局</option>
                      {state.characters.map(c => (
                        <option key={c.id} value={c.id}>{c.name}专属</option>
                      ))}
                    </select>
                <div className="flex-1" />
                    <button onClick={() => setEditingId(null)} className="text-xs text-blue-500">完成</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => handleUpdate(entry.id, { enabled: !entry.enabled })}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      entry.enabled ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}
                  >
                    {entry.enabled && <span className="text-white text-[10px]">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0" onClick={() => setEditingId(entry.id)}>
                    <div className="text-sm font-medium">{entry.keywords.join(', ')}</div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">{entry.content || '(空)'}</div>
                  </div>
                  <button onClick={() => handleDelete(entry.id)} className="text-red-400 text-xs shrink-0">删除</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
