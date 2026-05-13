import { useStore } from '@/core/store'

interface Props {
  title: string
  onBack?: () => void
  children: React.ReactNode
  transparent?: boolean
  rightAction?: React.ReactNode
}

export default function AppShell({ title, onBack, children, transparent, rightAction }: Props) {
  const { dispatch } = useStore()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      dispatch({ type: 'OPEN_APP', app: null })
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 导航栏 */}
      <div className={`flex items-center px-4 h-11 shrink-0 ${transparent ? '' : 'glass-heavy border-b border-black/5 dark:border-white/10'}`}>
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-blue-500 active:opacity-50 transition-opacity mr-3"
        >
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
            <path d="M91L1 9l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[17px]">返回</span>
        </button>
        <div className="flex-1 text-center font-semibold text-[17px] truncate">{title}</div>
        <div className="w-16 flex justify-end">{rightAction}</div>
      </div>

      {/* 内容区 */}
      <div className={`flex-1 overflow-y-auto ${transparent ? '' : 'glass-heavy'}`}>
        {children}
      </div>
    </div>
  )
}
