import { useStore } from '@/core/store'
import StatusBar from '@/system/statusbar/StatusBar'
import LockScreen from '@/system/lockscreen/LockScreen'
import Launcher from '@/apps/launcher/Launcher'
import AppRouter from '@/AppRouter'

export default function App() {
  const { state } = useStore()

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-black"
      style={{
        maxWidth: '100vw',
        maxHeight: '100vh',
      }}
    >
      {/*壁纸层 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          background: state.settings.wallpaper.startsWith('data:') || state.settings.wallpaper.startsWith('http')
            ? `url(${state.settings.wallpaper}) center/cover no-repeat`
            : state.settings.wallpaper,
        }}
      />

      {/* 状态栏 */}
      <StatusBar />

      {/* 主内容 */}
      <div className="relative w-full h-full pt-11safe-bottom">
        {state.isLocked ? (
          <LockScreen />
        ) : state.currentApp ? (
          <AppRouter appId={state.currentApp} />
        ) : (
          <Launcher />
        )}
      </div>
    </div>
  )
}
