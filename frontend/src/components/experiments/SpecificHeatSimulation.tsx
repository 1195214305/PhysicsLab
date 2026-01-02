import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'

const SpecificHeatSimulation = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [time, setTime] = useState(0)

  // 实验参数
  const [waterMass] = useState(200) // 水的质量 g
  const [waterTemp, setWaterTemp] = useState(20) // 水的初始温度 °C
  const [sampleMass] = useState(100) // 样品质量 g
  const [sampleTemp, setSampleTemp] = useState(100) // 样品初始温度 °C
  const [sampleType, setSampleType] = useState<'copper' | 'aluminum' | 'iron'>('copper')

  const [finalTemp, setFinalTemp] = useState<number | null>(null)
  const [measuredC, setMeasuredC] = useState<number | null>(null)

  const animationRef = useRef<number>()

  // 比热容 J/(g·°C)
  const specificHeat: Record<string, number> = {
    copper: 0.385,
    aluminum: 0.897,
    iron: 0.449
  }

  const materialNames: Record<string, string> = {
    copper: '铜',
    aluminum: '铝',
    iron: '铁'
  }

  const waterC = 4.186 // 水的比热容

  // 计算理论平衡温度
  const calculateEquilibrium = () => {
    const c = specificHeat[sampleType]
    // Q放 = Q吸: m样品 * c样品 * (T样品 - T平衡) = m水 * c水 * (T平衡 - T水)
    const T = (sampleMass * c * sampleTemp + waterMass * waterC * waterTemp) / (sampleMass * c + waterMass * waterC)
    return T
  }

  const theoreticalTemp = calculateEquilibrium()

  // 模拟混合过程
  useEffect(() => {
    if (isRunning && finalTemp === null) {
      const targetTemp = theoreticalTemp

      const animate = () => {
        setTime(t => t + 0.1)

        setWaterTemp(prev => {
          const diff = targetTemp - prev
          const newTemp = prev + diff * 0.05
          if (Math.abs(diff) < 0.1) {
            setFinalTemp(newTemp)
            // 反算比热容
            const measured = (waterMass * waterC * (newTemp - 20)) / (sampleMass * (100 - newTemp))
            setMeasuredC(measured)
            setIsRunning(false)
            return newTemp
          }
          return newTemp
        })

        setSampleTemp(prev => {
          const diff = targetTemp - prev
          return prev + diff * 0.05
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
  }, [isRunning, finalTemp, theoreticalTemp])

  const reset = () => {
    setIsRunning(false)
    setTime(0)
    setWaterTemp(20)
    setSampleTemp(100)
    setFinalTemp(null)
    setMeasuredC(null)
  }

  // 温度到颜色
  const tempToColor = (temp: number) => {
    const ratio = Math.min(1, Math.max(0, (temp - 20) / 80))
    const r = Math.floor(100 + 155 * ratio)
    const b = Math.floor(200 - 150 * ratio)
    return `rgb(${r}, 80, ${b})`
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-physics-border bg-physics-surface">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(true)}
            disabled={isRunning || finalTemp !== null}
            className={`btn ${isRunning ? 'btn-primary' : 'btn-secondary'}`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{finalTemp !== null ? '已完成' : isRunning ? '混合中' : '开始混合'}</span>
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
            {/* 量热器 */}
            <rect x="150" y="80" width="150" height="160" fill="#21262d" stroke="#484f58" strokeWidth="3" rx="5" />
            <rect x="155" y="85" width="140" height="150" fill="#161b22" rx="3" />

            {/* 水 */}
            <rect x="160" y="120" width="130" height="110" fill={tempToColor(waterTemp)} opacity="0.6" />

            {/* 样品 */}
            <circle
              cx="225"
              cy="180"
              r="25"
              fill={tempToColor(sampleTemp)}
              stroke="#d29922"
              strokeWidth="2"
            />
            <text x="225" y="185" fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">
              {materialNames[sampleType]}
            </text>

            {/* 温度计 */}
            <rect x="280" y="60" width="15" height="120" fill="#21262d" stroke="#484f58" strokeWidth="1" rx="7" />
            <rect
              x="283"
              y={175 - (waterTemp - 10) * 1.2}
              width="9"
              height={(waterTemp - 10) * 1.2}
              fill="#f85149"
              rx="4"
            />
            <circle cx="287" cy="175" r="6" fill="#f85149" />

            {/* 温度刻度 */}
            {[20, 40, 60, 80, 100].map(t => (
              <g key={t}>
                <line x1="295" y1={175 - (t - 10) * 1.2} x2="300" y2={175 - (t - 10) * 1.2} stroke="#6e7681" strokeWidth="1" />
                <text x="305" y={178 - (t - 10) * 1.2} fill="#6e7681" fontSize="8">{t}°C</text>
              </g>
            ))}

            {/* 搅拌棒 */}
            <rect x="180" y="50" width="8" height="100" fill="#6e7681" rx="2" />
            <ellipse cx="184" cy="150" rx="15" ry="5" fill="none" stroke="#6e7681" strokeWidth="2" />

            {/* 标签 */}
            <text x="225" y="260" fill="#8b949e" fontSize="10" textAnchor="middle">
              量热器 (混合法测比热容)
            </text>

            {/* 热水壶示意 */}
            <g transform="translate(50, 100)">
              <rect x="0" y="20" width="60" height="80" fill="#484f58" rx="5" />
              <rect x="5" y="25" width="50" height="70" fill={tempToColor(100)} opacity="0.6" />
              <text x="30" y="65" fill="white" fontSize="9" textAnchor="middle">100°C</text>
              <text x="30" y="120" fill="#8b949e" fontSize="9" textAnchor="middle">热样品</text>
            </g>

            {/* 箭头 */}
            {!isRunning && finalTemp === null && (
              <path d="M 115 140 L 145 160" stroke="#39d353" strokeWidth="2" markerEnd="url(#arrow)" />
            )}

            <defs>
              <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="#39d353" />
              </marker>
            </defs>
          </svg>
        </div>

        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-physics-border bg-physics-surface p-4 space-y-4 overflow-y-auto">
          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">样品选择</h4>
            <div className="flex gap-2">
              {(['copper', 'aluminum', 'iron'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setSampleType(m); reset() }}
                  className={`btn text-xs flex-1 ${sampleType === m ? 'btn-primary' : 'btn-secondary'}`}
                  disabled={isRunning}
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
                <span className="text-physics-textSecondary">水的质量</span>
                <span className="font-mono">{waterMass} g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">水的温度</span>
                <span className="text-physics-blue font-mono">{waterTemp.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">样品质量</span>
                <span className="font-mono">{sampleMass} g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">样品温度</span>
                <span className="text-physics-red font-mono">{sampleTemp.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">时间</span>
                <span className="measurement">{time.toFixed(1)} s</span>
              </div>
            </div>
          </div>

          {finalTemp !== null && (
            <div className="data-panel p-3 rounded border-physics-primary border">
              <h4 className="text-physics-primary text-sm font-medium mb-2">测量结果</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-physics-textSecondary">平衡温度</span>
                  <span className="measurement">{finalTemp.toFixed(2)}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-physics-textSecondary">测量比热容</span>
                  <span className="measurement">{measuredC?.toFixed(3)} J/(g·°C)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-physics-textSecondary">理论值</span>
                  <span className="text-physics-amber font-mono">{specificHeat[sampleType]} J/(g·°C)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-physics-textSecondary">相对误差</span>
                  <span className="text-physics-blue font-mono">
                    {(Math.abs((measuredC! - specificHeat[sampleType]) / specificHeat[sampleType]) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">混合法原理</h4>
            <div className="formula text-sm">Q放 = Q吸</div>
            <div className="formula text-xs mt-1">m₁c₁ΔT₁ = m₂c₂ΔT₂</div>
            <p className="text-physics-textMuted text-xs mt-2">
              热平衡时，高温物体放出的热量等于低温物体吸收的热量
            </p>
          </div>

          {showSettings && (
            <div className="data-panel p-3 rounded">
              <h4 className="text-physics-text text-sm font-medium mb-2">比热容参考值</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-physics-textSecondary">水</span>
                  <span className="font-mono">4.186 J/(g·°C)</span>
                </div>
                {Object.entries(specificHeat).map(([m, c]) => (
                  <div key={m} className="flex justify-between">
                    <span className="text-physics-textSecondary">{materialNames[m]}</span>
                    <span className="font-mono">{c} J/(g·°C)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SpecificHeatSimulation
