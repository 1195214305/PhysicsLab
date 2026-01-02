import { useState, useMemo } from 'react'
import { Settings } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const PhotoelectricEffectSimulation = () => {
  const [frequency, setFrequency] = useState(7) // ×10^14 Hz
  const [voltage, setVoltage] = useState(0) // 遏止电压 V
  const [metalType, setMetalType] = useState<'Na' | 'K' | 'Zn'>('Na')
  const [showSettings, setShowSettings] = useState(false)

  // 金属逸出功 (eV)
  const workFunctions: Record<string, number> = {
    'Na': 2.28, // 钠
    'K': 2.25,  // 钾
    'Zn': 4.31  // 锌
  }

  const W = workFunctions[metalType]
  const h = 6.626e-34 // 普朗克常数
  const e = 1.602e-19 // 电子电荷

  // 截止频率 ν₀ = W/h
  const cutoffFrequency = (W * e) / h / 1e14 // ×10^14 Hz

  // 光子能量 E = hν
  const photonEnergy = h * frequency * 1e14 / e // eV

  // 最大初动能 Ek = hν - W
  const maxKineticEnergy = Math.max(0, photonEnergy - W)

  // 遏止电压 U₀ = Ek/e
  const stoppingVoltage = maxKineticEnergy

  // 是否发生光电效应
  const hasPhotoelectricEffect = frequency >= cutoffFrequency

  // 光电流（简化模型）
  const photocurrent = hasPhotoelectricEffect
    ? Math.max(0, 1 - voltage / stoppingVoltage) * 100
    : 0

  // 波长
  const wavelength = (3e8 / (frequency * 1e14)) * 1e9 // nm

  // 颜色
  const getColor = (wl: number) => {
    if (wl < 400) return '#8B00FF'
    if (wl < 450) return '#4B0082'
    if (wl < 495) return '#0000FF'
    if (wl < 570) return '#00FF00'
    if (wl < 590) return '#FFFF00'
    if (wl < 620) return '#FF7F00'
    if (wl < 700) return '#FF0000'
    return '#8B0000'
  }

  const lightColor = getColor(wavelength)

  // I-U 曲线数据
  const iuData = useMemo(() => {
    if (!hasPhotoelectricEffect) return []
    const data = []
    for (let u = -stoppingVoltage - 0.5; u <= 2; u += 0.1) {
      const i = u >= -stoppingVoltage ? Math.max(0, 100 * (1 + u / stoppingVoltage)) : 0
      data.push({ voltage: u, current: Math.min(i, 100) })
    }
    return data
  }, [hasPhotoelectricEffect, stoppingVoltage])

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-physics-border bg-physics-surface">
        <div className="flex items-center gap-2">
          <span className="text-physics-textSecondary text-sm">光电效应</span>
          <span className={`tag ${hasPhotoelectricEffect ? 'tag-primary' : 'tag-red'}`}>
            {hasPhotoelectricEffect ? '发生光电效应' : '无光电效应'}
          </span>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="icon-btn">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 p-4">
          <svg viewBox="0 0 450 280" preserveAspectRatio="xMidYMid meet" className="w-full h-full max-h-full bg-physics-bg rounded border border-physics-border">
            {/* 光电管 */}
            <ellipse cx="200" cy="140" rx="100" ry="80" fill="none" stroke="#30363d" strokeWidth="2" />

            {/* 阴极 (K) */}
            <rect x="120" y="100" width="10" height="80" fill="#58a6ff" />
            <text x="115" y="150" fill="#58a6ff" fontSize="12" textAnchor="end">K</text>

            {/* 阳极 (A) */}
            <rect x="270" y="120" width="10" height="40" fill="#d29922" />
            <text x="295" y="145" fill="#d29922" fontSize="12">A</text>

            {/* 入射光 */}
            <g>
              {[0, 1, 2].map(i => (
                <line key={i} x1="30" y1={120 + i * 20} x2="115" y2={120 + i * 20}
                  stroke={lightColor} strokeWidth="2" opacity="0.8" />
              ))}
              <polygon points="115,110 125,140 115,170" fill={lightColor} opacity="0.3" />
              <text x="50" y="105" fill={lightColor} fontSize="10">入射光</text>
              <text x="50" y="118" fill="#8b949e" fontSize="9">ν = {frequency}×10¹⁴ Hz</text>
            </g>

            {/* 光电子 */}
            {hasPhotoelectricEffect && photocurrent > 0 && (
              <g>
                {[0, 1, 2, 3].map(i => (
                  <circle key={i} r="3" fill="#39d353">
                    <animateMotion
                      dur={`${0.5 + i * 0.2}s`}
                      repeatCount="indefinite"
                      path="M 135 140 Q 200 140 265 140"
                    />
                  </circle>
                ))}
              </g>
            )}

            {/* 电路 */}
            <path d="M 125 190 L 125 230 L 350 230 L 350 140 L 285 140" fill="none" stroke="#484f58" strokeWidth="1.5" />
            <path d="M 275 90 L 275 50 L 125 50 L 125 95" fill="none" stroke="#484f58" strokeWidth="1.5" />

            {/* 电源 */}
            <g transform="translate(350, 185)">
              <rect x="-15" y="-20" width="30" height="40" fill="#21262d" stroke="#30363d" strokeWidth="1" rx="2" />
              <line x1="-8" y1="-8" x2="8" y2="-8" stroke="#39d353" strokeWidth="2" />
              <line x1="0" y1="0" x2="0" y2="8" stroke="#39d353" strokeWidth="2" />
              <line x1="-4" y1="8" x2="4" y2="8" stroke="#39d353" strokeWidth="2" />
            </g>

            {/* 电流表 */}
            <g transform="translate(200, 50)">
              <circle cx="0" cy="0" r="18" fill="#21262d" stroke="#39d353" strokeWidth="1" />
              <text x="0" y="-22" fill="#39d353" fontSize="8">A</text>
              <text x="0" y="5" fill="#39d353" fontSize="10" fontWeight="bold" textAnchor="middle">
                {photocurrent.toFixed(0)}
              </text>
            </g>

            {/* 电压表 */}
            <g transform="translate(200, 230)">
              <circle cx="0" cy="0" r="18" fill="#21262d" stroke="#58a6ff" strokeWidth="1" />
              <text x="0" y="-22" fill="#58a6ff" fontSize="8">V</text>
              <text x="0" y="5" fill="#58a6ff" fontSize="10" fontWeight="bold" textAnchor="middle">
                {voltage.toFixed(1)}
              </text>
            </g>

            {/* 金属标签 */}
            <text x="125" y="200" fill="#8b949e" fontSize="10" textAnchor="middle">
              {metalType === 'Na' ? '钠' : metalType === 'K' ? '钾' : '锌'}
            </text>
          </svg>
        </div>

        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-physics-border bg-physics-surface p-4 space-y-4 overflow-y-auto">
          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">光源参数</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-physics-textSecondary">频率 ν</span>
                <span className="measurement">{frequency}×10¹⁴ Hz</span>
              </div>
              <input type="range" min="3" max="12" step="0.5" value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))} />
              <div className="flex justify-between text-sm">
                <span className="text-physics-textSecondary">波长 λ</span>
                <span style={{ color: lightColor }} className="font-mono">{wavelength.toFixed(0)} nm</span>
              </div>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">遏止电压</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-physics-textSecondary">外加电压 U</span>
                <span className="measurement">{voltage.toFixed(2)} V</span>
              </div>
              <input type="range" min={-3} max={0} step="0.1" value={voltage}
                onChange={(e) => setVoltage(Number(e.target.value))} />
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">光电效应数据</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">逸出功 W</span>
                <span className="text-physics-amber font-mono">{W.toFixed(2)} eV</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">截止频率 ν₀</span>
                <span className="text-physics-red font-mono">{cutoffFrequency.toFixed(2)}×10¹⁴ Hz</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">光子能量 hν</span>
                <span className="text-physics-primary font-mono">{photonEnergy.toFixed(2)} eV</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">最大初动能 Ek</span>
                <span className="measurement">{maxKineticEnergy.toFixed(2)} eV</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">遏止电压 U₀</span>
                <span className="measurement">{stoppingVoltage.toFixed(2)} V</span>
              </div>
            </div>
            <div className="formula mt-2 text-xs">
              hν = W + Ek(max)
            </div>
          </div>

          {iuData.length > 0 && (
            <div className="data-panel p-3 rounded">
              <h4 className="text-physics-text text-sm font-medium mb-2">I-U 特性曲线</h4>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={iuData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                    <XAxis dataKey="voltage" stroke="#6e7681" tick={{ fontSize: 9 }} />
                    <YAxis stroke="#6e7681" tick={{ fontSize: 9 }} domain={[0, 120]} />
                    <ReferenceLine x={-stoppingVoltage} stroke="#f85149" strokeDasharray="3 3" />
                    <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '6px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="current" stroke="#39d353" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {showSettings && (
            <div className="data-panel p-3 rounded">
              <h4 className="text-physics-text text-sm font-medium mb-2">金属选择</h4>
              <div className="flex gap-2">
                {(['Na', 'K', 'Zn'] as const).map(m => (
                  <button key={m} onClick={() => setMetalType(m)}
                    className={`flex-1 py-2 text-sm rounded ${metalType === m ? 'btn-primary' : 'btn-secondary'}`}>
                    {m === 'Na' ? '钠' : m === 'K' ? '钾' : '锌'}
                    <span className="block text-xs opacity-70">{workFunctions[m]}eV</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PhotoelectricEffectSimulation
