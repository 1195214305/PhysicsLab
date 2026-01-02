import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DataPoint {
  time: number
  N: number
  theoretical: number
}

const RadioactiveDecaySimulation = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [time, setTime] = useState(0)
  const [halfLife, setHalfLife] = useState(5) // 半衰期 秒
  const [initialCount, setInitialCount] = useState(100) // 初始原子数
  const [currentCount, setCurrentCount] = useState(100)
  const [data, setData] = useState<DataPoint[]>([])
  const [atoms, setAtoms] = useState<{ id: number; decayed: boolean; x: number; y: number }[]>([])

  const animationRef = useRef<number>()

  // 衰变常数
  const lambda = Math.log(2) / halfLife

  // 初始化原子
  useEffect(() => {
    const newAtoms = []
    for (let i = 0; i < initialCount; i++) {
      newAtoms.push({
        id: i,
        decayed: false,
        x: 50 + Math.random() * 200,
        y: 50 + Math.random() * 150
      })
    }
    setAtoms(newAtoms)
    setCurrentCount(initialCount)
    setData([{ time: 0, N: initialCount, theoretical: initialCount }])
  }, [initialCount])

  // 模拟衰变
  useEffect(() => {
    if (isRunning) {
      const dt = 0.1 // 时间步长

      const animate = () => {
        setTime(t => {
          const newTime = t + dt

          // 计算衰变概率
          const decayProb = 1 - Math.exp(-lambda * dt)

          setAtoms(prev => {
            const newAtoms = prev.map(atom => {
              if (!atom.decayed && Math.random() < decayProb) {
                return { ...atom, decayed: true }
              }
              return atom
            })

            const remaining = newAtoms.filter(a => !a.decayed).length
            setCurrentCount(remaining)

            // 记录数据
            const theoretical = initialCount * Math.exp(-lambda * newTime)
            setData(d => [...d.slice(-100), { time: newTime, N: remaining, theoretical }])

            return newAtoms
          })

          return newTime
        })

        animationRef.current = requestAnimationFrame(animate)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning, lambda, initialCount])

  const reset = () => {
    setIsRunning(false)
    setTime(0)
    const newAtoms = []
    for (let i = 0; i < initialCount; i++) {
      newAtoms.push({
        id: i,
        decayed: false,
        x: 50 + Math.random() * 200,
        y: 50 + Math.random() * 150
      })
    }
    setAtoms(newAtoms)
    setCurrentCount(initialCount)
    setData([{ time: 0, N: initialCount, theoretical: initialCount }])
  }

  // 计算经过的半衰期数
  const halfLives = time / halfLife
  const theoreticalN = initialCount * Math.exp(-lambda * time)

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-physics-border bg-physics-surface">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`btn ${isRunning ? 'btn-primary' : 'btn-secondary'}`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? '暂停' : '开始'}</span>
          </button>
          <button onClick={reset} className="btn btn-secondary">
            <RotateCcw className="w-4 h-4" />
            <span>重置</span>
          </button>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="icon-btn">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 p-4 flex flex-col gap-4">
          {/* 原子可视化 */}
          <div className="flex-1">
            <svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMid meet" className="w-full h-full max-h-full bg-physics-bg rounded border border-physics-border">
              {/* 容器 */}
              <rect x="40" y="40" width="220" height="160" fill="#161b22" stroke="#484f58" strokeWidth="2" rx="5" />

              {/* 原子 */}
              {atoms.map(atom => (
                <circle
                  key={atom.id}
                  cx={atom.x}
                  cy={atom.y}
                  r={atom.decayed ? 0 : 4}
                  fill={atom.decayed ? 'transparent' : '#39d353'}
                  opacity={atom.decayed ? 0 : 0.8}
                >
                  {atom.decayed && (
                    <animate attributeName="r" from="4" to="0" dur="0.3s" fill="freeze" />
                  )}
                </circle>
              ))}

              {/* 衰变粒子效果 */}
              {atoms.filter(a => a.decayed).slice(-10).map((atom) => (
                <g key={`decay-${atom.id}`}>
                  <circle cx={atom.x} cy={atom.y} r="2" fill="#f85149" opacity="0.5">
                    <animate attributeName="r" from="2" to="10" dur="0.5s" fill="freeze" />
                    <animate attributeName="opacity" from="0.5" to="0" dur="0.5s" fill="freeze" />
                  </circle>
                </g>
              ))}

              {/* 标签 */}
              <text x="150" y="25" fill="#8b949e" fontSize="10" textAnchor="middle">放射性样品</text>
              <text x="150" y="215" fill="#39d353" fontSize="11" textAnchor="middle">
                剩余原子: {currentCount} / {initialCount}
              </text>

              {/* 辐射符号 */}
              <g transform="translate(270, 120)">
                <circle cx="0" cy="0" r="15" fill="none" stroke="#d29922" strokeWidth="2" />
                {[0, 120, 240].map(angle => (
                  <path
                    key={angle}
                    d={`M 0 0 L ${8 * Math.cos(angle * Math.PI / 180)} ${8 * Math.sin(angle * Math.PI / 180)} A 8 8 0 0 1 ${8 * Math.cos((angle + 60) * Math.PI / 180)} ${8 * Math.sin((angle + 60) * Math.PI / 180)} Z`}
                    fill="#d29922"
                    transform={`rotate(${angle})`}
                  />
                ))}
              </g>
            </svg>
          </div>

          {/* 衰变曲线 */}
          <div className="h-40 bg-physics-surface rounded border border-physics-border p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis
                  dataKey="time"
                  stroke="#6e7681"
                  fontSize={10}
                  tickFormatter={(v) => `${v.toFixed(0)}s`}
                />
                <YAxis stroke="#6e7681" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#21262d', border: '1px solid #30363d' }}
                  labelStyle={{ color: '#8b949e' }}
                  formatter={(value: number, name: string) => [
                    value.toFixed(0),
                    name === 'N' ? '实际值' : '理论值'
                  ]}
                />
                <Line type="monotone" dataKey="N" stroke="#39d353" dot={false} strokeWidth={2} name="N" />
                <Line type="monotone" dataKey="theoretical" stroke="#d29922" dot={false} strokeWidth={1} strokeDasharray="5 5" name="theoretical" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-physics-border bg-physics-surface p-4 space-y-4 overflow-y-auto">
          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">实验数据</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">时间 t</span>
                <span className="measurement">{time.toFixed(1)} s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">经过半衰期</span>
                <span className="text-physics-amber font-mono">{halfLives.toFixed(2)} 个</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">剩余原子数 N</span>
                <span className="measurement">{currentCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">理论值</span>
                <span className="text-physics-amber font-mono">{theoreticalN.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">衰变率</span>
                <span className="text-physics-blue font-mono">
                  {((1 - currentCount / initialCount) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">参数设置</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-physics-textSecondary">半衰期 T½</span>
                  <span className="measurement">{halfLife} s</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={halfLife}
                  onChange={(e) => { setHalfLife(Number(e.target.value)); reset() }}
                  disabled={isRunning}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-physics-textSecondary">初始原子数 N₀</span>
                  <span className="measurement">{initialCount}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="10"
                  value={initialCount}
                  onChange={(e) => { setInitialCount(Number(e.target.value)); reset() }}
                  disabled={isRunning}
                />
              </div>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">衰变规律</h4>
            <div className="formula text-sm">N = N₀e^(-λt)</div>
            <div className="formula text-sm mt-1">N = N₀(½)^(t/T½)</div>
            <div className="text-physics-textMuted text-xs mt-2 space-y-1">
              <p>λ = ln2/T½ = {lambda.toFixed(4)} s⁻¹</p>
              <p>T½ = {halfLife} s</p>
            </div>
          </div>

          {showSettings && (
            <div className="data-panel p-3 rounded">
              <h4 className="text-physics-text text-sm font-medium mb-2">说明</h4>
              <div className="text-physics-textSecondary text-xs space-y-1">
                <p>• 绿点表示未衰变的原子</p>
                <p>• 红色闪烁表示衰变事件</p>
                <p>• 实线为实际测量值</p>
                <p>• 虚线为理论预测值</p>
                <p>• 由于统计涨落，实际值会围绕理论值波动</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RadioactiveDecaySimulation
