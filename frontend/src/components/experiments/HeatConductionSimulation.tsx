import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'

const HeatConductionSimulation = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [material, setMaterial] = useState<'copper' | 'aluminum' | 'iron' | 'glass'>('copper')
  const [showSettings, setShowSettings] = useState(false)
  const [time, setTime] = useState(0)
  const [temperatures, setTemperatures] = useState<number[]>([100, 25, 25, 25, 25, 25])
  const animationRef = useRef<number>()

  // 热导率 W/(m·K)
  const conductivity: Record<string, number> = {
    copper: 401,
    aluminum: 237,
    iron: 80,
    glass: 1.1
  }

  const materialNames: Record<string, string> = {
    copper: '铜',
    aluminum: '铝',
    iron: '铁',
    glass: '玻璃'
  }

  const k = conductivity[material]

  // 模拟热传导
  useEffect(() => {
    if (isRunning) {
      const dt = 0.1 // 时间步长
      const dx = 0.02 // 空间步长 2cm
      const alpha = k / (8900 * 385) // 热扩散系数 (以铜为基准)

      const animate = () => {
        setTime(t => t + dt)
        setTemperatures(prev => {
          const newTemps = [...prev]
          // 简化的热传导方程
          for (let i = 1; i < newTemps.length - 1; i++) {
            const factor = alpha * dt / (dx * dx) * (k / 401) * 0.5
            newTemps[i] = prev[i] + factor * (prev[i - 1] - 2 * prev[i] + prev[i + 1])
          }
          // 边界条件：左端恒温100°C，右端自然冷却
          newTemps[0] = 100
          newTemps[newTemps.length - 1] = Math.max(25, newTemps[newTemps.length - 1] - 0.01)
          return newTemps
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
  }, [isRunning, k])

  const reset = () => {
    setIsRunning(false)
    setTime(0)
    setTemperatures([100, 25, 25, 25, 25, 25])
  }

  // 温度到颜色的映射
  const tempToColor = (temp: number) => {
    const ratio = (temp - 25) / 75
    const r = Math.floor(255 * ratio)
    const b = Math.floor(255 * (1 - ratio))
    return `rgb(${r}, 50, ${b})`
  }

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
        <div className="flex-1 p-4">
          <svg viewBox="0 0 450 300" preserveAspectRatio="xMidYMid meet" className="w-full h-full max-h-full bg-physics-bg rounded border border-physics-border">
            {/* 热源（酒精灯） */}
            <ellipse cx="80" cy="250" rx="25" ry="10" fill="#d29922" />
            <path d="M 70 250 Q 80 200 90 250" fill="#f85149" opacity="0.8" />
            <path d="M 75 250 Q 80 210 85 250" fill="#d29922" />

            {/* 火焰动画 */}
            {isRunning && (
              <>
                <ellipse cx="80" cy="220" rx="8" ry="15" fill="#f85149" opacity="0.6">
                  <animate attributeName="ry" values="15;18;15" dur="0.5s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="80" cy="225" rx="5" ry="10" fill="#d29922">
                  <animate attributeName="ry" values="10;12;10" dur="0.3s" repeatCount="indefinite" />
                </ellipse>
              </>
            )}

            {/* 金属棒 */}
            <rect x="60" y="140" width="330" height="30" fill="#484f58" rx="3" />

            {/* 温度分布显示 */}
            {temperatures.map((temp, i) => (
              <g key={i}>
                <rect
                  x={60 + i * 55}
                  y="140"
                  width="55"
                  height="30"
                  fill={tempToColor(temp)}
                  opacity="0.8"
                />
                <text
                  x={87 + i * 55}
                  y="160"
                  fill="white"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {temp.toFixed(0)}°C
                </text>
              </g>
            ))}

            {/* 蜡点标记 */}
            {temperatures.slice(1).map((temp, i) => (
              <g key={`wax-${i}`}>
                <circle
                  cx={115 + (i + 1) * 55}
                  cy="135"
                  r={temp > 60 ? 0 : 5}
                  fill="#e3b341"
                />
                {temp > 60 && (
                  <ellipse
                    cx={115 + (i + 1) * 55}
                    cy="175"
                    rx="8"
                    ry="3"
                    fill="#e3b341"
                    opacity="0.7"
                  />
                )}
              </g>
            ))}

            {/* 支架 */}
            <rect x="55" y="170" width="10" height="80" fill="#6e7681" />
            <rect x="385" y="170" width="10" height="80" fill="#6e7681" />
            <rect x="45" y="250" width="30" height="5" fill="#6e7681" />
            <rect x="375" y="250" width="30" height="5" fill="#6e7681" />

            {/* 图例 */}
            <text x="60" y="100" fill="#8b949e" fontSize="10">热端</text>
            <text x="360" y="100" fill="#8b949e" fontSize="10">冷端</text>

            {/* 热流方向 */}
            <line x1="100" y1="120" x2="350" y2="120" stroke="#39d353" strokeWidth="1" strokeDasharray="5 3" />
            <polygon points="345,115 355,120 345,125" fill="#39d353" />
            <text x="225" y="110" fill="#39d353" fontSize="10" textAnchor="middle">热流方向 Q</text>

            {/* 材料标签 */}
            <text x="225" y="200" fill="#d29922" fontSize="12" textAnchor="middle" fontWeight="bold">
              {materialNames[material]}棒 (k = {k} W/(m·K))
            </text>
          </svg>
        </div>

        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-physics-border bg-physics-surface p-4 space-y-4 overflow-y-auto">
          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">材料选择</h4>
            <div className="grid grid-cols-2 gap-2">
              {(['copper', 'aluminum', 'iron', 'glass'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setMaterial(m); reset() }}
                  className={`btn text-xs ${material === m ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {materialNames[m]}
                </button>
              ))}
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">实验数据</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">时间</span>
                <span className="measurement">{time.toFixed(1)} s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">热导率 k</span>
                <span className="text-physics-amber font-mono">{k} W/(m·K)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">热端温度</span>
                <span className="text-physics-red font-mono">{temperatures[0].toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">冷端温度</span>
                <span className="text-physics-blue font-mono">{temperatures[5].toFixed(1)}°C</span>
              </div>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">傅里叶热传导定律</h4>
            <div className="formula text-sm">Q = -kA(dT/dx)</div>
            <div className="text-physics-textMuted text-xs mt-2 space-y-1">
              <p>Q: 热流量 (W)</p>
              <p>k: 热导率 (W/(m·K))</p>
              <p>A: 截面积 (m²)</p>
              <p>dT/dx: 温度梯度 (K/m)</p>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">热导率对比</h4>
            <div className="space-y-1 text-xs">
              {Object.entries(conductivity).map(([m, k]) => (
                <div key={m} className="flex justify-between">
                  <span className="text-physics-textSecondary">{materialNames[m]}</span>
                  <span className={`font-mono ${material === m ? 'text-physics-primary' : 'text-physics-textMuted'}`}>
                    {k} W/(m·K)
                  </span>
                </div>
              ))}
            </div>
            <p className="text-physics-textMuted text-xs mt-2">
              热导率越大，热传导越快
            </p>
          </div>

          {showSettings && (
            <div className="data-panel p-3 rounded">
              <h4 className="text-physics-text text-sm font-medium mb-2">实验说明</h4>
              <div className="text-physics-textSecondary text-xs space-y-1">
                <p>1. 选择不同材料的金属棒</p>
                <p>2. 点击开始加热</p>
                <p>3. 观察蜡点熔化顺序</p>
                <p>4. 比较不同材料的导热性能</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HeatConductionSimulation
