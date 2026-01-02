import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'

const SimplePendulumSimulation = () => {
  const [length, setLength] = useState(1) // 摆长 m
  const [initialAngle, setInitialAngle] = useState(15) // 初始角度 度
  const [gravity, setGravity] = useState(9.8)
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [angle, setAngle] = useState(15)
  const [angularVelocity, setAngularVelocity] = useState(0)
  const [periodCount, setPeriodCount] = useState(0)
  const [measuredPeriods, setMeasuredPeriods] = useState<number[]>([])
  const [showSettings, setShowSettings] = useState(false)

  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  const lastAngleRef = useRef<number>(15)
  const periodStartRef = useRef<number>(0)

  const omega = Math.sqrt(gravity / length)
  const theoreticalPeriod = 2 * Math.PI * Math.sqrt(length / gravity)

  const calculateState = useCallback((t: number) => {
    const theta0 = initialAngle * Math.PI / 180
    const theta = theta0 * Math.cos(omega * t)
    const omega_t = -theta0 * omega * Math.sin(omega * t)
    return { angle: theta * 180 / Math.PI, angularVelocity: omega_t * 180 / Math.PI }
  }, [initialAngle, omega])

  useEffect(() => {
    if (!isRunning) return

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const deltaTime = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp

      setTime(prevTime => {
        const newTime = prevTime + deltaTime
        const state = calculateState(newTime)

        // 检测周期（过零点且方向向右）
        if (lastAngleRef.current < 0 && state.angle >= 0) {
          if (periodStartRef.current > 0) {
            const measuredPeriod = newTime - periodStartRef.current
            setMeasuredPeriods(prev => [...prev.slice(-9), measuredPeriod])
            setPeriodCount(prev => prev + 1)
          }
          periodStartRef.current = newTime
        }
        lastAngleRef.current = state.angle

        setAngle(state.angle)
        setAngularVelocity(state.angularVelocity)

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
    lastTimeRef.current = 0
    setIsRunning(!isRunning)
  }

  const resetSimulation = () => {
    setIsRunning(false)
    setTime(0)
    setAngle(initialAngle)
    setAngularVelocity(0)
    setPeriodCount(0)
    setMeasuredPeriods([])
    lastTimeRef.current = 0
    lastAngleRef.current = initialAngle
    periodStartRef.current = 0
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
  }

  // 计算平均周期
  const avgPeriod = measuredPeriods.length > 0
    ? measuredPeriods.reduce((a, b) => a + b, 0) / measuredPeriods.length
    : 0

  // 计算测得的g值
  const measuredG = avgPeriod > 0 ? 4 * Math.PI * Math.PI * length / (avgPeriod * avgPeriod) : 0

  // 画布参数
  const pivotX = 200
  const pivotY = 50
  const pendulumLength = 180
  const bobX = pivotX + pendulumLength * Math.sin(angle * Math.PI / 180)
  const bobY = pivotY + pendulumLength * Math.cos(angle * Math.PI / 180)

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
          <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" className="w-full h-full max-h-full bg-physics-bg rounded border border-physics-border">
            {/* 支架 */}
            <rect x="180" y="30" width="40" height="20" fill="#30363d" />
            <line x1="200" y1="0" x2="200" y2="30" stroke="#484f58" strokeWidth="4" />

            {/* 摆线 */}
            <line x1={pivotX} y1={pivotY} x2={bobX} y2={bobY} stroke="#8b949e" strokeWidth="2" />

            {/* 摆球 */}
            <circle cx={bobX} cy={bobY} r="15" fill="#39d353" />

            {/* 平衡位置参考线 */}
            <line x1={pivotX} y1={pivotY} x2={pivotX} y2={pivotY + pendulumLength + 20}
              stroke="#484f58" strokeWidth="1" strokeDasharray="5 5" />

            {/* 角度标注 */}
            {Math.abs(angle) > 1 && (
              <>
                <path
                  d={`M ${pivotX} ${pivotY + 40} A 40 40 0 0 ${angle > 0 ? 1 : 0} ${pivotX + 40 * Math.sin(angle * Math.PI / 180)} ${pivotY + 40 * Math.cos(angle * Math.PI / 180)}`}
                  fill="none"
                  stroke="#d29922"
                  strokeWidth="1"
                />
                <text x={pivotX + 50} y={pivotY + 50} fill="#d29922" fontSize="12">
                  θ = {angle.toFixed(1)}°
                </text>
              </>
            )}

            {/* 周期计数 */}
            <text x="20" y="280" fill="#8b949e" fontSize="12">
              完成周期: {periodCount}
            </text>
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
                <span className="text-physics-textSecondary">角度 θ</span>
                <span className="measurement">{angle.toFixed(2)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">角速度 ω</span>
                <span className="measurement">{angularVelocity.toFixed(2)}°/s</span>
              </div>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">周期测量</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">理论周期</span>
                <span className="text-physics-primary font-mono">{theoreticalPeriod.toFixed(4)} s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">测量周期</span>
                <span className="text-physics-primary font-mono">{avgPeriod > 0 ? avgPeriod.toFixed(4) : '-'} s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">测得 g 值</span>
                <span className="text-physics-amber font-mono">{measuredG > 0 ? measuredG.toFixed(3) : '-'} m/s²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">相对误差</span>
                <span className="text-physics-textSecondary font-mono">
                  {measuredG > 0 ? ((Math.abs(measuredG - gravity) / gravity) * 100).toFixed(2) : '-'}%
                </span>
              </div>
            </div>
            <div className="formula mt-2 text-xs">
              T = 2π√(L/g), g = 4π²L/T²
            </div>
          </div>

          {measuredPeriods.length > 0 && (
            <div className="data-panel p-3 rounded">
              <h4 className="text-physics-text text-sm font-medium mb-2">周期记录</h4>
              <div className="max-h-24 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-physics-textMuted border-b border-physics-border">
                      <th className="py-1 text-left">#</th>
                      <th className="py-1 text-right">T (s)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measuredPeriods.map((p, i) => (
                      <tr key={i} className="text-physics-text">
                        <td className="py-0.5">{i + 1}</td>
                        <td className="py-0.5 text-right font-mono">{p.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {showSettings && (
            <div className="data-panel p-3 rounded">
              <h4 className="text-physics-text text-sm font-medium mb-2">参数设置</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-physics-textSecondary text-xs block mb-1">摆长 L: {length.toFixed(2)} m</label>
                  <input type="range" min="0.2" max="2" step="0.1" value={length}
                    onChange={(e) => { setLength(Number(e.target.value)); resetSimulation() }}
                    disabled={isRunning} />
                </div>
                <div>
                  <label className="text-physics-textSecondary text-xs block mb-1">初始角度: {initialAngle}°</label>
                  <input type="range" min="5" max="30" value={initialAngle}
                    onChange={(e) => { setInitialAngle(Number(e.target.value)); resetSimulation() }}
                    disabled={isRunning} />
                </div>
                <div>
                  <label className="text-physics-textSecondary text-xs block mb-1">重力加速度: {gravity} m/s²</label>
                  <input type="range" min="1" max="15" step="0.1" value={gravity}
                    onChange={(e) => { setGravity(Number(e.target.value)); resetSimulation() }}
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

export default SimplePendulumSimulation
