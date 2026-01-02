import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DataPoint {
  time: number
  displacement: number
  velocity: number
}

const SpringOscillatorSimulation = () => {
  // 实验参数
  const [mass, setMass] = useState(1) // 质量 (kg)
  const [springConstant, setSpringConstant] = useState(10) // 劲度系数 (N/m)
  const [amplitude, setAmplitude] = useState(50) // 振幅 (像素，对应实际位移)
  const [damping, setDamping] = useState(0) // 阻尼系数

  // 模拟状态
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [displacement, setDisplacement] = useState(50) // 当前位移
  const [velocity, setVelocity] = useState(0)
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [showSettings, setShowSettings] = useState(false)

  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // 计算角频率
  const omega = Math.sqrt(springConstant / mass)
  // 计算周期
  const period = (2 * Math.PI) / omega

  // 计算位置和速度
  const calculateState = useCallback((t: number) => {
    const dampingFactor = Math.exp(-damping * t / (2 * mass))
    const x = amplitude * dampingFactor * Math.cos(omega * t)
    const v = -amplitude * omega * dampingFactor * Math.sin(omega * t)
    return { displacement: x, velocity: v }
  }, [amplitude, omega, damping, mass])

  // 动画循环
  useEffect(() => {
    if (!isRunning) return

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const deltaTime = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp

      setTime(prevTime => {
        const newTime = prevTime + deltaTime
        const { displacement: x, velocity: v } = calculateState(newTime)

        setDisplacement(x)
        setVelocity(v)

        // 记录数据点
        if (Math.floor(newTime * 20) > Math.floor(prevTime * 20)) {
          setDataPoints(prev => {
            const newPoints = [...prev, { time: newTime, displacement: x, velocity: v }]
            // 保留最近的数据点
            return newPoints.slice(-100)
          })
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
  }, [isRunning, calculateState])

  // 开始/暂停
  const toggleSimulation = () => {
    lastTimeRef.current = 0
    setIsRunning(!isRunning)
  }

  // 重置
  const resetSimulation = () => {
    setIsRunning(false)
    setTime(0)
    setDisplacement(amplitude)
    setVelocity(0)
    setDataPoints([])
    lastTimeRef.current = 0
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  // 弹簧绘制
  const springCoils = 12
  const equilibriumX = 250
  const currentX = equilibriumX + displacement

  // 生成弹簧路径
  const generateSpringPath = () => {
    const coilWidth = (currentX - 50) / springCoils
    let path = 'M 50 200'
    for (let i = 0; i < springCoils; i++) {
      const x1 = 50 + coilWidth * i + coilWidth * 0.25
      const x2 = 50 + coilWidth * i + coilWidth * 0.75
      const x3 = 50 + coilWidth * (i + 1)
      path += ` L ${x1} 180 L ${x2} 220 L ${x3} 200`
    }
    return path
  }

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
          <svg className="w-full h-full" viewBox="0 0 500 400">
            {/* 背景网格 */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 212, 170, 0.1)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* 固定墙 */}
            <rect x="30" y="150" width="20" height="100" fill="#2d3a4f" />
            <line x1="30" y1="150" x2="30" y2="250" stroke="#00d4aa" strokeWidth="2" />

            {/* 弹簧 */}
            <path
              d={generateSpringPath()}
              fill="none"
              stroke="#00d4aa"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 平衡位置标记 */}
            <line
              x1={equilibriumX}
              y1="160"
              x2={equilibriumX}
              y2="240"
              stroke="#3b82f6"
              strokeWidth="1"
              strokeDasharray="5 5"
            />
            <text x={equilibriumX} y="155" fill="#3b82f6" fontSize="10" textAnchor="middle">
              平衡位置
            </text>

            {/* 振子（质量块） */}
            <motion.g
              animate={{ x: displacement }}
              transition={{ duration: 0.016, ease: "linear" }}
            >
              <rect
                x={equilibriumX - 25}
                y="175"
                width="50"
                height="50"
                rx="5"
                fill="url(#massGradient)"
                stroke="#00d4aa"
                strokeWidth="2"
              />
              <text
                x={equilibriumX}
                y="205"
                fill="#0a0f1a"
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
              >
                m
              </text>
            </motion.g>

            {/* 渐变定义 */}
            <defs>
              <linearGradient id="massGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d4aa" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>

            {/* 位移标注 */}
            {displacement !== 0 && (
              <>
                <line
                  x1={equilibriumX}
                  y1="280"
                  x2={currentX}
                  y2="280"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <text
                  x={(equilibriumX + currentX) / 2}
                  y="300"
                  fill="#f59e0b"
                  fontSize="12"
                  textAnchor="middle"
                >
                  x = {(displacement / 50 * 0.1).toFixed(3)} m
                </text>
              </>
            )}

            {/* 箭头标记 */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
              </marker>
            </defs>

            {/* 速度向量 */}
            {Math.abs(velocity) > 0.1 && (
              <line
                x1={currentX}
                y1="200"
                x2={currentX + velocity * 2}
                y2="200"
                stroke="#ef4444"
                strokeWidth="3"
                markerEnd="url(#velocityArrow)"
              />
            )}
            <defs>
              <marker id="velocityArrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
              </marker>
            </defs>
          </svg>
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
                <span className="text-lab-muted text-sm">位移 x</span>
                <span className="measurement">{(displacement / 50 * 0.1).toFixed(3)} m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lab-muted text-sm">速度 v</span>
                <span className="measurement">{(velocity / 50 * 0.1).toFixed(3)} m/s</span>
              </div>
            </div>
          </div>

          {/* 理论值 */}
          <div className="data-panel p-4">
            <h4 className="text-lab-text font-medium mb-3">理论计算</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-lab-muted">角频率 ω</span>
                <span className="text-lab-accent font-mono">{omega.toFixed(3)} rad/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lab-muted">周期 T</span>
                <span className="text-lab-accent font-mono">{period.toFixed(3)} s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lab-muted">频率 f</span>
                <span className="text-lab-accent font-mono">{(1 / period).toFixed(3)} Hz</span>
              </div>
              <div className="formula mt-3 text-xs">
                T = 2π√(m/k) = 2π√({mass}/{springConstant})
              </div>
            </div>
          </div>

          {/* x-t 图像 */}
          {dataPoints.length > 2 && (
            <div className="data-panel p-4">
              <h4 className="text-lab-text font-medium mb-3">x-t 图像</h4>
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
                      domain={[-amplitude * 1.2, amplitude * 1.2]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a2332',
                        border: '1px solid #2d3a4f',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(v) => `t = ${Number(v).toFixed(2)}s`}
                      formatter={(v: number) => [`${(v / 50 * 0.1).toFixed(3)} m`, 'x']}
                    />
                    <Line
                      type="monotone"
                      dataKey="displacement"
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
                    质量 m: {mass} kg
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={mass}
                    onChange={(e) => {
                      setMass(Number(e.target.value))
                      resetSimulation()
                    }}
                    disabled={isRunning}
                  />
                </div>
                <div>
                  <label className="text-lab-muted text-sm block mb-2">
                    劲度系数 k: {springConstant} N/m
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={springConstant}
                    onChange={(e) => {
                      setSpringConstant(Number(e.target.value))
                      resetSimulation()
                    }}
                    disabled={isRunning}
                  />
                </div>
                <div>
                  <label className="text-lab-muted text-sm block mb-2">
                    振幅 A: {(amplitude / 50 * 0.1).toFixed(2)} m
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="5"
                    value={amplitude}
                    onChange={(e) => {
                      setAmplitude(Number(e.target.value))
                      resetSimulation()
                    }}
                    disabled={isRunning}
                  />
                </div>
                <div>
                  <label className="text-lab-muted text-sm block mb-2">
                    阻尼系数: {damping}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={damping}
                    onChange={(e) => {
                      setDamping(Number(e.target.value))
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

export default SpringOscillatorSimulation
