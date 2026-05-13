import { useStore } from '@/core/store'
import ChatApp from '@/apps/chat/ChatApp'
import SettingsApp from '@/system/settings/SettingsApp'

// Phase 1 只注册聊天和设置，后续Phase逐步添加
const appComponents: Record<string, React.ComponentType> = {
  chat: ChatApp,
  settings: SettingsApp,
}

interface Props {
  appId: string
}

export default function AppRouter({ appId }: Props) {
  const { dispatch } = useStore()
  const Component = appComponents[appId]

  if (!Component) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white">
        <div className="text-6xl mb-4">🚧</div>
        <div className="text-lg font-medium mb-2">开发中</div>
        <div className="text-sm opacity-60mb-6">这个App还没有做好</div>
        <button
          onClick={() => dispatch({ type: 'OPEN_APP', app: null })}
          className="px-6 py-2 rounded-full glass text-black dark:text-white text-sm"
        >
          返回桌面
        </button>
      </div>
    )
  }

  return <Component />
}
