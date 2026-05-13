import { useState, useRef } from 'react'
import { useStore } from '@/core/store'
import type { AppPromptTemplate } from '@/data/types'

export default function PromptManager() {
  const { state, dispatch } = useStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const templates = state.promptTemplates

  const handleUpdate = (template: AppPromptTemplate) => {
    dispatch({ type: 'UPDATE_PROMPT_TEMPLATE', template })
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prompt_templates.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as AppPromptTemplate[]
        dispatch({ type: 'SET_PROMPT_TEMPLATES', templates: data })
      } catch {
        alert('JSON 解析失败')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <button onClick={() => fileRef.current?.click()} className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium">
          导入模板
        </button>
        <button onClick={handleExport} className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-700 rounded-xl text-sm font-medium">
          导出模板
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div><p className="text-xs text-gray-400 px-1">
        可用变量：{'{{user}}'} =用户名，{'{{char}}'} = 角色名，{'{{scene}}'} = 场景名
      </p>

      <div className="space-y-2">
        {templates.map(t => (
          <div key={t.app_id} className="bg-white/60 dark:bg-white/5 rounded-xl p-3">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setEditingId(editingId === t.app_id ? null : t.app_id)}
            >
              <span className="font-medium text-[15px]">{t.app_name}</span>
              <span className="text-xs text-gray-400">{editingId === t.app_id ? '收起' : '编辑'}</span>
            </div>
            {editingId === t.app_id ? (
              <textarea
                value={t.template}
                onChange={e => handleUpdate({ ...t, template: e.target.value })}
                rows={5}
                className="w-full mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none resize-none"
              />
            ) : (
              <div className="text-xs text-gray-500 mt-1line-clamp-2">{t.template}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
