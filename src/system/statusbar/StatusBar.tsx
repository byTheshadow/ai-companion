import { useState, useEffect } from 'react'
import { useStore } from '@/core/store'

export default function StatusBar() {
  const { state } = useStore()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeStr = time.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const totalBadge = state.notifications.filter(n => !n.read).length

  return (
    <div className="absolute top-0 left-0 right-0 z-50 safe-top">
      <div className="flex items-center justify-between px-5 h-11text-white text-sm font-medium">
        {/* 左侧：时间 */}
        <div className="w-20 font-semibold">{timeStr}</div>

        {/* 中间：刘海区域（可选） */}
        <div className="flex-1" />

        {/* 右侧：信号、WiFi、电量 */}
        <div className="flex items-center gap-1.5 w-20justify-end">
          {totalBadge > 0 && (
            <span className="bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center mr-1">
              {totalBadge > 9 ? '9+' : totalBadge}
            </span>
          )}
          {/* 信号 */}
          <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
            <rect x="0" y="9" width="3" height="3" rx="0.5" opacity="1" />
            <rect x="4.5" y="6" width="3" height="6" rx="0.5" opacity="1" />
            <rect x="9" y="3" width="3" height="9" rx="0.5" opacity="1" />
            <rect x="13.5" y="0" width="3" height="12" rx="0.5" opacity="0.3" />
          </svg>
          {/* WiFi */}
          <svg width="15" height="12" viewBox="0 0 15 12" fill="white">
            <path d="M7.5 10.5a1.5 1.5 0 1103 1.5 1.5 0 010-3z" />
            <path d="M4.5 8.5a4.2 4.2 0 0160" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            <path d="M25.8a7.5 7.5 0 01110" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          </svg>
          {/* 电量 */}
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
            <rect x="0" y="0.5" width="21" height="11" rx="2" stroke="white" strokeWidth="1" />
            <rect x="22" y="3.5" width="2" height="5" rx="1" fill="white" opacity="0.4" />
            <rect x="1.5" y="2" width="17" height="8" rx="1" fill="white" /></svg>
        </div>
      </div>
    </div>
  )
}
