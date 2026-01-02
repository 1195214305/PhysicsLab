import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DataPoint {
  time: number
  x: number
  y: number
}

const ProjectileMotionSimulation = () => {
  const [initialVelocity, setInitialVelocity] = useState(10) // 初速度 m/s
  const [initialHeight, setInitialHeight] = useState(50) // 初始高度 m
  const [gravity] = useState(9.8)
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 50 })
  const [velocity, setVelocity] = useState({ vx: 10, vy: 0 })
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [trajectory, setTrajectory] = useState<{x: number, y: number}[]>([])

  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  const canvasWidth = 400
  const canvasHeight = 300
  const scale = 3 // 像素/米

  const calculateState = useCallback((t: number) => {
    const x = initialVelocity * t
    const y = initialHeight - 0.5 * gravity * t * t
    const vy = gravity * t
    return { x, y: Math.max(0, y), vx: initialVelocity, vy }
  }, [initialVelocity, initialHeight, gravity])

  useEffect(() => {
    if (!isRunning) return

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const deltaTime = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp

      setTime(prevTime => {
        const newTime = prevTime + deltaTime
        const state = calculateState(newTime)

        setPosition({ x: state.x, y: state.y })
        setVelocity({ vx: state.vx, vy: state.vy })
        setTrajectory(prev => [...prev, { x: state.x, y: state.y }])

        if (Math.floor(newTime * 10) > Math.floor(prevTime * 10)) {
          setDataPoints(prev => [...prev, { time: newTime, x: state.x, y: state.y }])
        }

        if (state.y <= 0) {
          setIsRunning(false)
          return newTime
        }

        return newTime
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isRunning, calculateState])

  const toggleSimulation = () => {
    if (!isRunning && position.y <= 0) resetSimulation()
    lastTimeRef.current = 0
    setIsRunning(!isRunning)
  }

  const resetSimulation = () => {
    setIsRunning(false)
    setTime(0)
    setPosition({ x: 0, y: initialHeight })
    setVelocity({ vx: initialVelocity, vy: 0 })
    setDataPoints([])
    setTrajectory([])
    lastTimeRef.current = 0
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
  }

  // 理论值
  const flightTime = Math.sqrt(2 * initialHeight / gravity)
  const range = initialVelocity * flightTime
  const finalVelocity = Math.sqrt(initialVelocity * initialVelocity + (gravity * flightTime) ** 2)

  // 画布坐标转换
  const toCanvasX = (x: number) => 50 + x * scale
  const toCanvasY = (y: number) => canvasHeight - 30 - y * scale

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-physics-border bg-physics-surface">
        <div className="flex items-center gap-2">
          <button onClick={toggleSimulation} className={`btn ${isRunning ? 'btn-secondary' : 'btn-primary'}`}>
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? '暂停' : '开始'}</span>
          </button>
          <button onClick={resetSimulation} className="btn btn-secondary">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="icon-btn">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 p-4">
          <svg viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} className="w-full h-full bg-physics-bg rounded border border-physics-border">
            {/* 网格 */}
            <defs>
              <pattern id="grid-proj" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#21262d" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-proj)" />

            {/* 坐标轴 */}
            <line x1="50" y1={canvasHeight - 30} x2={canvasWidth - 20} y2={canvasHeight - 30} stroke="#484f58" strokeWidth="1" />
            <line x1="50" y1="20" x2="50" y2={canvasHeight - 30} stroke="#484f58" strokeWidth="1" />
            <text x={canvasWidth - 15} y={canvasHeight - 25} fill="#8b949e" fontSize="10">x</text>
            <text x="55" y="25" fill="#8b949e" fontSize="10">y</text>

            {/* 地面 */}
            <rect x="0" y={canvasHeight - 30} width={canvasWidth} height="30" fill="#21262d" />

            {/* 轨迹 */}
            {trajectory.length > 1 && (
              <polyline
                points={trajectory.map(p => `${toCanvasX(p.x)},${toCanvasY(p.y)}`).join(' ')}
                fill="none"
                stroke="#39d353"
                strokeWidth="2"
                strokeDasharray="4 2"
                opacity="0.6"
              />
            )}

            {/* 小球 */}
            <circle
              cx={toCanvasX(position.x)}
              cy={toCanvasY(position.y)}
              r="8"
              fill="#39d353"
            />

            {/* 速度向量 */}
            <line
              x1={toCanvasX(position.x)}
              y1={toCanvasY(position.y)}
              x2={toCanvasX(position.x) + velocity.vx * 3}
              y2={toCanvasY(position.y)}
              stroke="#58a6ff"
              strokeWidth="2"
              markerEnd="url(#arrow-blue)"
            />
            <line
              x1={toCanvasX(position.x)}
              y1={toCanvasY(position.y)}
              x2={toCanvasX(position.x)}
              y2={toCanvasY(position.y) + velocity.vy * 3}
              stroke="#f85149"
              strokeWidth="2"
              markerEnd="url(#arrow-red)"
            />

            <defs>
              <marker id="arrow-blue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="#58a6ff" />
              </marker>
              <marker id="arrow-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="#f85149" />
              </marker>
            </defs>

            {/* 标注 */}
            <text x={toCanvasX(position.x) + 15} y={toCanvasY(position.y) - 5} fill="#58a6ff" fontSize="10">vx</text>
            <text x={toCanvasX(position.x) + 5} y={toCanvasY(position.y) + velocity.vy * 3 + 12} fill="#f85149" fontSize="10">vy</text>
          </svg>
        </div>

        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-physics-border bg-physics-surface p-4 space-y-4 overflow-y-auto">
          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">实时数据</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">时间 t</span>
                <span className="measurement">{time.toFixed(2)} s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">水平位移 x</span>
                <span className="measurement">{position.x.toFixed(2)} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">竖直位移 y</span>
                <span className="measurement">{position.y.toFixed(2)} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">水平速度 vx</span>
                <span className="text-physics-blue font-mono">{velocity.vx.toFixed(2)} m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">竖直速度 vy</span>
                <span className="text-physics-red font-mono">{velocity.vy.toFixed(2)} m/s</span>
              </div>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">理论计算</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">落地时间</span>
                <span className="text-physics-primary font-mono">{flightTime.toFixed(3)} s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">水平射程</span>
                <span className="text-physics-primary font-mono">{range.toFixed(2)} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">落地速度</span>
                <span className="text-physics-primary font-mono">{finalVelocity.toFixed(2)} m/s</span>
              </div>
            </div>
            <div className="formula mt-2 text-xs">
              t = √(2h/g), x = v₀t
            </div>
          </div>

          {dataPoints.length > 2 && (
            <div className="data-panel p-3 rounded">
              <h4 className="text-physics-text text-sm font-medium mb-2">y-x 轨迹</h4>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataPoints}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                    <XAxis dataKey="x" stroke="#6e7681" tick={{ fontSize: 9 }} />
                    <YAxis stroke="#6e7681" tick={{ fontSize: 9 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '6px', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="y" stroke="#39d353" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {showSettings && (
            <div className="data-panel p-3 rounded">
              <h4 className="text-physics-text text-sm font-medium mb-2">参数设置</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-physics-textSecondary text-xs block mb-1">初速度: {initialVelocity} m/s</label>
                  <input type="range" min="1" max="30" value={initialVelocity}
                    onChange={(e) => { setInitialVelocity(Number(e.target.value)); resetSimulation() }}
                    disabled={isRunning} />
                </div>
                <div>
                  <label className="text-physics-textSecondary text-xs block mb-1">初始高度: {initialHeight} m</label>
                  <input type="range" min="10" max="100" value={initialHeight}
                    onChange={(e) => { setInitialHeight(Number(e.target.value)); resetSimulation() }}
                    disabled={isRunning} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectileMotionSimulation
