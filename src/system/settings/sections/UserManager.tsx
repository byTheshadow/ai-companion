import { useRef } from 'react'
import { useStore } from '@/core/store'
import type { UserCard } from '@/data/types'
import { v4 as uuid } from 'uuid'

export default function UserManager() {
  const { state, dispatch } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const activeId = state.settings.active_user_id

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        const cards: UserCard[] = Array.isArray(data) ? data : [data]
        cards.forEach(card => {
          if (!card.name) {
            alert('用户卡需要至少包含 name 字段')
            return
          }
          if (!card.id) card.id = uuid()
          if (!card.created_at) card.created_at = Date.now()
          const exists = state.users.find(u => u.id === card.id)
          if (exists) {
            dispatch({ type: 'UPDATE_USER', user: card })
          } else {
            dispatch({ type: 'ADD_USER', user: card })
          }
        })
      } catch {
        alert('JSON 解析失败')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleCreate = () => {
    const name = prompt('输入用户名称：')
    if (!name) return
    const newUser: UserCard = {
      id: uuid(),
      name,
      avatar: '',
      personality: '',
      background: '',
      custom_css: '',
      created_at: Date.now(),
    }
    dispatch({ type: 'ADD_USER', user: newUser })
  }

  const handleSetActive = (id: string) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      settings: { active_user_id: activeId === id ? null : id },
    })
  }

  const handleExport = (user: UserCard) => {
    const blob = new Blob([JSON.stringify(user, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `user_${user.name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个用户身份吗？')) {
      dispatch({ type: 'DELETE_USER', id })
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <button
          onClick={handleCreate}
          className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium active:bg-green-600"
        >
          新建用户
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium active:bg-blue-600"
        >
          导入 (JSON)
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div>

      {state.users.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">👤</div>
          <div className="text-sm">还没有用户身份</div>
          <div className="text-xs mt-1">创建或导入一个用户身份</div>
        </div>
      ) : (
        <div className="space-y-2">
          {state.users.map(user => (
            <div
              key={user.id}
              className={`rounded-xl p-3 transition-colors ${
                activeId === user.id
                  ? 'bg-green-50 dark:bg-green-900/30 ring-2 ring-green-500'
                  : 'bg-white/60 dark:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl overflow-hidden shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.name[0]
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[15px] flex items-center gap-2">
                    {user.name}
                    {activeId === user.id && (
                      <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full">当前</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {user.personality || '暂无描述'}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleSetActive(user.id)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${
                    activeId === user.id
                      ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                      : 'bg-green-500 text-white'
                  }`}
                >
                  {activeId === user.id ? '取消选择' : '设为当前'}
                </button>
                <button
                  onClick={() => handleExport(user)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700"
                >
                  导出
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
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
