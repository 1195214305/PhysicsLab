import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DataPoint {
  time: number
  height: number
  velocity: number
}

const FreeFallSimulation = () => {
  // 实验参数
  const [initialHeight, setInitialHeight] = useState(100) // 初始高度 (m)
  const [gravity, setGravity] = useState(9.8) // 重力加速度 (m/s²)

  // 模拟状态
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [currentHeight, setCurrentHeight] = useState(100)
  const [currentVelocity, setCurrentVelocity] = useState(0)
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [showSettings, setShowSettings] = useState(false)

  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  const canvasHeight = 400

  // 计算物体位置
  const calculatePosition = useCallback((t: number) => {
    const h = initialHeight - 0.5 * gravity * t * t
    const v = gravity * t
    return { height: Math.max(0, h), velocity: v }
  }, [initialHeight, gravity])

  // 动画循环
  useEffect(() => {
    if (!isRunning) return

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const deltaTime = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp

      setTime(prevTime => {
        const newTime = prevTime + deltaTime
        const { height, velocity } = calculatePosition(newTime)

        setCurrentHeight(height)
        setCurrentVelocity(velocity)

        // 记录数据点
        if (Math.floor(newTime * 10) > Math.floor(prevTime * 10)) {
          setDataPoints(prev => [...prev, { time: newTime, height, velocity }])
        }

        // 落地检测
        if (height <= 0) {
          setIsRunning(false)
          return newTime
        }

        return newTime
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning, calculatePosition])

  // 开始/暂停
  const toggleSimulation = () => {
    if (!isRunning && currentHeight <= 0) {
      resetSimulation()
    }
    lastTimeRef.current = 0
    setIsRunning(!isRunning)
  }

  // 重置
  const resetSimulation = () => {
    setIsRunning(false)
    setTime(0)
    setCurrentHeight(initialHeight)
    setCurrentVelocity(0)
    setDataPoints([])
    lastTimeRef.current = 0
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  // 计算物体在画布上的位置
  const objectY = ((initialHeight - currentHeight) / initialHeight) * (canvasHeight - 60) + 30

  // 理论落地时间
  const theoreticalTime = Math.sqrt(2 * initialHeight / gravity)

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* 控制栏 */}
      <div className="flex items-center justify-between p-4 border-b border-lab-border bg-lab-darker/50">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSimulation}
            className={`control-btn ${isRunning ? '' : 'primary'}`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="ml-2">{isRunning ? '暂停' : '开始'}</span>
          </button>
          <button onClick={resetSimulation} className="control-btn">
            <RotateCcw className="w-4 h-4" />
            <span className="ml-2">重置</span>
          </button>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`control-btn ${showSettings ? 'border-lab-accent' : ''}`}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex">
        {/* 模拟画布 */}
        <div className="flex-1 relative p-4">
          {/* 刻度尺 */}
          <div className="absolute left-8 top-8 bottom-8 w-8 flex flex-col justify-between text-xs text-lab-muted">
            {[0, 25, 50, 75, 100].reverse().map((percent) => (
              <div key={percent} className="flex items-center gap-1">
                <span className="w-6 text-right">{Math.round(initialHeight * percent / 100)}</span>
                <div className="w-2 h-px bg-lab-border" />
              </div>
            ))}
          </div>

          {/* 落体动画区域 */}
          <div className="ml-12 h-full relative bg-gradient-to-b from-lab-surface/30 to-lab-surface/10 rounded-lg border border-lab-border overflow-hidden">
            {/* 地面 */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-lab-border/50" />

            {/* 落体 */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 w-12 h-12"
              style={{ top: objectY }}
              animate={{ top: objectY }}
              transition={{ duration: 0.016, ease: "linear" }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-lab-accent to-lab-secondary shadow-lg shadow-lab-accent/30 flex items-center justify-center">
                <span className="text-lab-dark font-bold text-xs">m</span>
              </div>
            </motion.div>

            {/* 轨迹线 */}
            {dataPoints.length > 1 && (
              <svg className="absolute inset-0 pointer-events-none">
                <path
                  d={dataPoints.map((point, i) => {
                    const y = ((initialHeight - point.height) / initialHeight) * (canvasHeight - 60) + 30
                    return `${i === 0 ? 'M' : 'L'} 50% ${y}`
                  }).join(' ')}
                  fill="none"
                  stroke="rgba(0, 212, 170, 0.3)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>
            )}
          </div>
        </div>

        {/* 数据面板 */}
        <div className="w-80 border-l border-lab-border bg-lab-darker/30 p-4 space-y-4 overflow-y-auto">
          {/* 实时数据 */}
          <div className="data-panel p-4">
            <h4 className="text-lab-text font-medium mb-3">实时数据</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lab-muted text-sm">时间 t</span>
                <span className="measurement">{time.toFixed(2)} s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lab-muted text-sm">高度 h</span>
                <span className="measurement">{currentHeight.toFixed(2)} m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lab-muted text-sm">速度 v</span>
                <span className="measurement">{currentVelocity.toFixed(2)} m/s</span>
              </div>
            </div>
          </div>

          {/* 理论值对比 */}
          <div className="data-panel p-4">
            <h4 className="text-lab-text font-medium mb-3">理论计算</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-lab-muted">落地时间</span>
                <span className="text-lab-accent font-mono">{theoreticalTime.toFixed(3)} s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lab-muted">落地速度</span>
                <span className="text-lab-accent font-mono">{(gravity * theoreticalTime).toFixed(2)} m/s</span>
              </div>
              <div className="formula mt-3 text-xs">
                t = √(2h/g) = √(2×{initialHeight}/{gravity})
              </div>
            </div>
          </div>

          {/* 速度-时间图 */}
          {dataPoints.length > 2 && (
            <div className="data-panel p-4">
              <h4 className="text-lab-text font-medium mb-3">v-t 图像</h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataPoints}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4f" />
                    <XAxis
                      dataKey="time"
                      stroke="#6b7280"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => v.toFixed(1)}
                    />
                    <YAxis
                      stroke="#6b7280"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => v.toFixed(0)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a2332',
                        border: '1px solid #2d3a4f',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(v) => `t = ${Number(v).toFixed(2)}s`}
                      formatter={(v: number) => [`${v.toFixed(2)} m/s`, 'v']}
                    />
                    <Line
                      type="monotone"
                      dataKey="velocity"
                      stroke="#00d4aa"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 参数设置 */}
          {showSettings && (
            <div className="data-panel p-4">
              <h4 className="text-lab-text font-medium mb-3">参数设置</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-lab-muted text-sm block mb-2">
                    初始高度: {initialHeight} m
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={initialHeight}
                    onChange={(e) => {
                      setInitialHeight(Number(e.target.value))
                      resetSimulation()
                    }}
                    disabled={isRunning}
                  />
                </div>
                <div>
                  <label className="text-lab-muted text-sm block mb-2">
                    重力加速度: {gravity} m/s²
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.1"
                    value={gravity}
                    onChange={(e) => {
                      setGravity(Number(e.target.value))
                      resetSimulation()
                    }}
                    disabled={isRunning}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FreeFallSimulation
