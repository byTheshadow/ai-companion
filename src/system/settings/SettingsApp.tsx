import { useState } from 'react'
import { useStore } from '@/core/store'
import AppShell from '@/components/AppShell'
import APISettings from './sections/APISettings'
import CharacterManager from './sections/CharacterManager'
import UserManager from './sections/UserManager'
import LorebookManager from './sections/LorebookManager'
import PromptManager from './sections/PromptManager'
import ThemeSettings from './sections/ThemeSettings'
import DataManager from './sections/DataManager'

type Section = 'main' | 'api' | 'characters' | 'users' | 'lorebook' | 'prompts' | 'theme' | 'data'

const menuItems: { id: Section; icon: string; label: string }[] = [
  { id: 'api', icon: '🔑', label: 'API 设置' },
  { id: 'characters', icon: '🎭', label: '角色管理' },
  { id: 'users', icon: '👤', label: '用户身份' },
  { id: 'lorebook', icon: '📚', label: '世界书' },
  { id: 'prompts', icon: '📝', label: 'Prompt 模板' },
  { id: 'theme', icon: '🎨', label: '主题与外观' },
  { id: 'data', icon: '💾', label: '数据管理' },
]

export default function SettingsApp() {
  const [section, setSection] = useState<Section>('main')

  const renderSection = () => {
    switch (section) {
      case 'api': return <APISettings />
      case 'characters': return <CharacterManager />
      case 'users': return <UserManager />
      case 'lorebook': return <LorebookManager />
      case 'prompts': return <PromptManager />
      case 'theme': return <ThemeSettings />
      case 'data': return <DataManager />
      default: return null
    }
  }

  if (section !== 'main') {
    return (
      <AppShell
        title={menuItems.find(m => m.id === section)?.label || '设置'}
        onBack={() => setSection('main')}
      >
        {renderSection()}
      </AppShell>
    )
  }

  return (
    <AppShell title="设置">
      <div className="divide-y divide-black/5dark:divide-white/5">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setSection(item.id)}
            className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-black/5 dark:active:bg-white/5 transition-colors"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="flex-1 text-left text-[15px]">{item.label}</span><svg width="8" height="14" viewBox="0 0 8 14" fill="none" className="opacity-30">
              <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </AppShell>
  )
}
