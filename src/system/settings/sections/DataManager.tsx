import { useRef } from 'react'
import { useStore } from '@/core/store'
import { local } from '@/core/storage/local'
import { exportAllDB, importAllDB, clearAllDB } from '@/core/storage/db'

export default function DataManager() {
  const { state, dispatch } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleExportAll = async () => {
    const localData = local.exportAll()
    const dbData = await exportAllDB()
    const fullBackup = { local: localData, db: dbData, version: 1, exported_at: Date.now() }
    const blob = new Blob([JSON.stringify(fullBackup)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai_companion_backup_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (data.local) local.importAll(data.local)
        if (data.db) await importAllDB(data.db)
        alert('导入成功，页面将刷新')
        window.location.reload()
      } catch {
        alert('导入失败：JSON 格式错误')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleClearAll = async () => {
    if (!confirm('确定要清除所有数据吗？此操作不可撤销！')) return
    if (!confirm('再次确认：所有聊天记录、角色卡、设置都将被删除！')) return
    local.clear()
    await clearAllDB()
    alert('数据已清除，页面将刷新')
    window.location.reload()
  }

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={handleExportAll}
        className="w-full py-3 bg-blue-500 text-white rounded-xl text-sm font-medium active:bg-blue-600"
      >
        📦 导出全部数据
      </button>

      <button
        onClick={() => fileRef.current?.click()}
        className="w-full py-3 bg-green-500 text-white rounded-xl text-sm font-medium active:bg-green-600"
      >
        📥 导入备份
      </button><input ref={fileRef} type="file" accept=".json" onChange={handleImportAll} className="hidden" />

      <div className="pt-4 border-t border-black/5dark:border-white/5">
        <button
          onClick={handleClearAll}
          className="w-full py-3 bg-red-500 text-white rounded-xl text-sm font-medium active:bg-red-600"
        >
          🗑️ 清除所有数据
        </button>
        <p className="text-xs text-red-400 text-center mt-2">此操作不可撤销</p>
      </div>
    </div>
  )
}
