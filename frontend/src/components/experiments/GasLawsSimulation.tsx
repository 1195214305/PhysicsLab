import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DataPoint {
  T: number
  p: number
  V: number
}

const GasLawsSimulation = () => {
  const [lawType, setLawType] = useState<'boyle' | 'charles' | 'gay-lussac'>('boyle')
  const [isRunning, setIsRunning] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // 初始状态
  const [pressure, setPressure] = useState(100) // kPa
  const [volume, setVolume] = useState(1) // L
  const [temperature, setTemperature] = useState(300) // K

  // 数据记录
  const [data, setData] = useState<DataPoint[]>([])
  const animationRef = useRef<number>()

  // 理想气体常数
  const n = 0.04 // mol

  // 根据定律计算
  const calculateState = () => {
    if (lawType === 'boyle') {
      // 等温过程: pV = 常数
      const pV = pressure * volume
      return { constant: pV, unit: 'kPa·L' }
    } else if (lawType === 'charles') {
      // 等压过程: V/T = 常数
      const VT = volume / temperature
      return { constant: VT * 1000, unit: 'mL/K' }
    } else {
      // 等容过程: p/T = 常数
      const pT = pressure / temperature
      return { constant: pT, unit: 'kPa/K' }
    }
  }

  const state = calculateState()

  // 动画效果
  useEffect(() => {
    if (isRunning) {
      let step = 0
      const animate = () => {
        step += 1

        if (lawType === 'boyle') {
          // 等温压缩/膨胀
          const newV = 0.5 + 1.5 * Math.abs(Math.sin(step * 0.02))
          const newP = (pressure * volume) / newV
          setVolume(newV)
          setPressure(newP)
          setData(prev => [...prev.slice(-50), { T: temperature, p: newP, V: newV }])
        } else if (lawType === 'charles') {
          // 等压加热/冷却
          const newT = 250 + 100 * Math.abs(Math.sin(step * 0.02))
          const newV = (volume * newT) / temperature
          setTemperature(newT)
          setVolume(newV)
          setData(prev => [...prev.slice(-50), { T: newT, p: pressure, V: newV }])
        } else {
          // 等容加热/冷却
          const newT = 250 + 100 * Math.abs(Math.sin(step * 0.02))
          const newP = (pressure * newT) / temperature
          setTemperature(newT)
          setPressure(newP)
          setData(prev => [...prev.slice(-50), { T: newT, p: newP, V: volume }])
        }

        animationRef.current = requestAnimationFrame(animate)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning, lawType])

  const reset = () => {
    setIsRunning(false)
    setPressure(100)
    setVolume(1)
    setTemperature(300)
    setData([])
  }

  // 活塞位置（基于体积）
  const pistonY = 100 + (2 - volume) * 50

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-physics-border bg-physics-surface">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setLawType('boyle'); reset() }}
            className={`btn ${lawType === 'boyle' ? 'btn-primary' : 'btn-secondary'} text-xs`}
          >
            玻意耳定律
          </button>
          <button
            onClick={() => { setLawType('charles'); reset() }}
            className={`btn ${lawType === 'charles' ? 'btn-primary' : 'btn-secondary'} text-xs`}
          >
            查理定律
          </button>
          <button
            onClick={() => { setLawType('gay-lussac'); reset() }}
            className={`btn ${lawType === 'gay-lussac' ? 'btn-primary' : 'btn-secondary'} text-xs`}
          >
            盖-吕萨克
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`btn ${isRunning ? 'btn-primary' : 'btn-secondary'}`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button onClick={reset} className="btn btn-secondary">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="icon-btn">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 p-4 flex flex-col gap-4">
          {/* 气缸示意图 */}
          <div className="flex-1">
            <svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet" className="w-full h-full max-h-full bg-physics-bg rounded border border-physics-border">
              {/* 气缸壁 */}
              <rect x="100" y="50" width="100" height="130" fill="none" stroke="#484f58" strokeWidth="3" />

              {/* 活塞 */}
              <rect x="102" y={pistonY} width="96" height="15" fill="#6e7681" stroke="#8b949e" strokeWidth="1" />
              <line x1="150" y1={pistonY} x2="150" y2={pistonY - 30} stroke="#6e7681" strokeWidth="4" />

              {/* 气体 */}
              <rect x="102" y={pistonY + 15} width="96" height={165 - pistonY} fill="rgba(57, 211, 83, 0.2)" />

              {/* 气体分子 */}
              {[...Array(Math.floor(volume * 10))].map((_, i) => (
                <circle
                  key={i}
                  cx={110 + Math.random() * 80}
                  cy={pistonY + 20 + Math.random() * (145 - pistonY)}
                  r="3"
                  fill="#39d353"
                  opacity="0.6"
                />
              ))}

              {/* 温度计 */}
              <rect x="220" y="80" width="20" height="80" fill="#21262d" stroke="#484f58" strokeWidth="1" rx="10" />
              <rect x="225" y={155 - (temperature - 200) * 0.5} width="10" height={(temperature - 200) * 0.5} fill="#f85149" rx="5" />
              <circle cx="230" cy="155" r="8" fill="#f85149" />
              <text x="230" y="175" fill="#8b949e" fontSize="8" textAnchor="middle">{temperature}K</text>

              {/* 压力计 */}
              <circle cx="50" cy="120" r="25" fill="#21262d" stroke="#484f58" strokeWidth="2" />
              <line
                x1="50"
                y1="120"
                x2={50 + 18 * Math.cos((pressure / 200 * 180 - 90) * Math.PI / 180)}
                y2={120 + 18 * Math.sin((pressure / 200 * 180 - 90) * Math.PI / 180)}
                stroke="#f85149"
                strokeWidth="2"
              />
              <text x="50" y="155" fill="#8b949e" fontSize="8" textAnchor="middle">{pressure.toFixed(0)}kPa</text>

              {/* 标签 */}
              <text x="150" y="195" fill="#8b949e" fontSize="10" textAnchor="middle">V = {volume.toFixed(2)} L</text>
            </svg>
          </div>

          {/* 图表 */}
          {data.length > 5 && (
            <div className="h-32 bg-physics-surface rounded border border-physics-border p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                  <XAxis
                    dataKey={lawType === 'boyle' ? 'V' : 'T'}
                    stroke="#6e7681"
                    fontSize={10}
                    tickFormatter={(v) => v.toFixed(1)}
                  />
                  <YAxis
                    dataKey={lawType === 'charles' ? 'V' : 'p'}
                    stroke="#6e7681"
                    fontSize={10}
                    tickFormatter={(v) => v.toFixed(0)}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#21262d', border: '1px solid #30363d' }}
                    labelStyle={{ color: '#8b949e' }}
                  />
                  <Line
                    type="monotone"
                    dataKey={lawType === 'charles' ? 'V' : 'p'}
                    stroke="#39d353"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-physics-border bg-physics-surface p-4 space-y-4 overflow-y-auto">
          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">状态参数</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">压强 p</span>
                <span className="measurement">{pressure.toFixed(1)} kPa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">体积 V</span>
                <span className="measurement">{volume.toFixed(3)} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">温度 T</span>
                <span className="measurement">{temperature.toFixed(0)} K</span>
              </div>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">
              {lawType === 'boyle' && '玻意耳定律 (等温)'}
              {lawType === 'charles' && '查理定律 (等压)'}
              {lawType === 'gay-lussac' && '盖-吕萨克定律 (等容)'}
            </h4>
            <div className="formula text-sm mb-2">
              {lawType === 'boyle' && 'pV = 常数'}
              {lawType === 'charles' && 'V/T = 常数'}
              {lawType === 'gay-lussac' && 'p/T = 常数'}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-physics-textSecondary">常数值</span>
              <span className="text-physics-amber font-mono">{state.constant.toFixed(2)} {state.unit}</span>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">理想气体状态方程</h4>
            <div className="formula text-sm">pV = nRT</div>
            <div className="text-physics-textMuted text-xs mt-2 space-y-1">
              <p>n = {n} mol</p>
              <p>R = 8.314 J/(mol·K)</p>
            </div>
          </div>

          {showSettings && (
            <div className="data-panel p-3 rounded">
              <h4 className="text-physics-text text-sm font-medium mb-2">手动调节</h4>
              <div className="space-y-3">
                {lawType !== 'gay-lussac' && (
                  <div>
                    <label className="text-physics-textSecondary text-xs">体积 V</label>
                    <input type="range" min="0.5" max="2" step="0.1" value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))} disabled={isRunning} />
                  </div>
                )}
                {lawType !== 'boyle' && (
                  <div>
                    <label className="text-physics-textSecondary text-xs">温度 T</label>
                    <input type="range" min="200" max="400" step="10" value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))} disabled={isRunning} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GasLawsSimulation
