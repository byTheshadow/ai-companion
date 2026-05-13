import { useState, useEffect } from 'react'
import { useStore } from '@/core/store'

export default function LockScreen() {
  const { dispatch } = useStore()
  const [time, setTime] = useState(new Date())
  const [startY, setStartY] = useState<number | null>(null)
  const [offsetY, setOffsetY] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeStr = time.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const dateStr = time.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return
    const diff = startY - e.touches[0].clientY
    if (diff > 0) setOffsetY(Math.min(diff, window.innerHeight))}

  const handleTouchEnd = () => {
    if (offsetY > window.innerHeight * 0.3) {
      dispatch({ type: 'SET_LOCKED', locked: false })
    }
    setOffsetY(0)
    setStartY(null)
  }

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center text-white z-40transition-transform duration-300"
      style={{
        transform: `translateY(-${offsetY}px)`,
        opacity: 1- offsetY / window.innerHeight,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}onClick={() => dispatch({ type: 'SET_LOCKED', locked: false })}
    >
      <div className="text-7xl font-thin tracking-wider mb-2">{timeStr}</div>
      <div className="text-lg font-light opacity-80">{dateStr}</div>

      <div className="absolute bottom-20 text-sm opacity-50animate-pulse">
        上滑解锁
      </div>

      {/* 底部横条 */}
      <div className="absolute bottom-2 w-32 h-1 bg-white/30 rounded-full" />
    </div>
  )
}
