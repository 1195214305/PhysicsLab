import { useState, useMemo } from 'react'
import { Settings } from 'lucide-react'

const DoubleslitInterferenceSimulation = () => {
  const [wavelength, setWavelength] = useState(550) // nm (绿光)
  const [slitDistance, setSlitDistance] = useState(0.5) // mm
  const [screenDistance, setScreenDistance] = useState(1) // m
  const [showSettings, setShowSettings] = useState(false)

  // 计算条纹间距 Δx = λL/d
  const fringeSpacing = useMemo(() => {
    return (wavelength * 1e-9 * screenDistance) / (slitDistance * 1e-3) * 1000 // mm
  }, [wavelength, slitDistance, screenDistance])

  // 波长对应的颜色
  const getWavelengthColor = (wl: number) => {
    if (wl < 450) return '#8B00FF' // 紫
    if (wl < 495) return '#0000FF' // 蓝
    if (wl < 570) return '#00FF00' // 绿
    if (wl < 590) return '#FFFF00' // 黄
    if (wl < 620) return '#FF7F00' // 橙
    return '#FF0000' // 红
  }

  const lightColor = getWavelengthColor(wavelength)

  // 生成干涉条纹
  const fringes = useMemo(() => {
    const result = []
    const numFringes = 15
    const scale = 20 // 放大显示

    for (let k = -numFringes; k <= numFringes; k++) {
      const x = k * fringeSpacing * scale
      const intensity = Math.cos(k * Math.PI) ** 2 // 简化的强度分布
      result.push({ k, x, intensity: k === 0 ? 1 : Math.abs(intensity) })
    }
    return result
  }, [fringeSpacing])

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-physics-border bg-physics-surface">
        <div className="flex items-center gap-2">
          <span className="text-physics-textSecondary text-sm">双缝干涉实验</span>
          <span className="tag" style={{ backgroundColor: `${lightColor}30`, color: lightColor, borderColor: `${lightColor}50` }}>
            λ = {wavelength} nm
          </span>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="icon-btn">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 p-4">
          <svg viewBox="0 0 500 300" preserveAspectRatio="xMidYMid meet" className="w-full h-full max-h-full bg-physics-bg rounded border border-physics-border">
            {/* 光源 */}
            <g transform="translate(30, 150)">
              <circle cx="0" cy="0" r="15" fill={lightColor} opacity="0.8" />
              <circle cx="0" cy="0" r="10" fill={lightColor} />
              <text x="0" y="35" fill="#8b949e" fontSize="10" textAnchor="middle">光源</text>
            </g>

            {/* 入射光 */}
            <line x1="45" y1="150" x2="120" y2="150" stroke={lightColor} strokeWidth="2" opacity="0.6" />

            {/* 双缝 */}
            <g transform="translate(130, 100)">
              <rect x="-5" y="0" width="10" height="40" fill="#30363d" />
              <rect x="-5" y="60" width="10" height="40" fill="#30363d" />
              <rect x="-2" y="42" width="4" height="6" fill={lightColor} opacity="0.8" />
              <rect x="-2" y="52" width="4" height="6" fill={lightColor} opacity="0.8" />
              <text x="0" y="115" fill="#8b949e" fontSize="10" textAnchor="middle">双缝</text>
              <text x="0" y="128" fill="#6e7681" fontSize="8" textAnchor="middle">d={slitDistance}mm</text>
            </g>

            {/* 衍射光线 */}
            {[-1, 0, 1].map(i => (
              <g key={i}>
                <line x1="135" y1="145" x2="400" y2={150 + i * 30}
                  stroke={lightColor} strokeWidth="1" opacity="0.3" strokeDasharray="4 2" />
                <line x1="135" y1="155" x2="400" y2={150 + i * 30}
                  stroke={lightColor} strokeWidth="1" opacity="0.3" strokeDasharray="4 2" />
              </g>
            ))}

            {/* 光屏 */}
            <g transform="translate(410, 50)">
              <rect x="0" y="0" width="20" height="200" fill="#21262d" stroke="#30363d" strokeWidth="1" />

              {/* 干涉条纹 */}
              {fringes.map((fringe, i) => (
                <rect
                  key={i}
                  x="2"
                  y={100 + fringe.x - 3}
                  width="16"
                  height="6"
                  fill={lightColor}
                  opacity={fringe.k % 2 === 0 ? 0.9 : 0.1}
                />
              ))}

              <text x="10" y="220" fill="#8b949e" fontSize="10" textAnchor="middle">光屏</text>
            </g>

            {/* 距离标注 */}
            <line x1="135" y1="270" x2="410" y2="270" stroke="#484f58" strokeWidth="1" />
            <line x1="135" y1="265" x2="135" y2="275" stroke="#484f58" strokeWidth="1" />
            <line x1="410" y1="265" x2="410" y2="275" stroke="#484f58" strokeWidth="1" />
            <text x="272" y="285" fill="#8b949e" fontSize="10" textAnchor="middle">L = {screenDistance} m</text>
          </svg>
        </div>

        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-physics-border bg-physics-surface p-4 space-y-4 overflow-y-auto">
          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">实验参数</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">波长 λ</span>
                <span className="measurement">{wavelength} nm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">缝间距 d</span>
                <span className="measurement">{slitDistance} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">屏距 L</span>
                <span className="measurement">{screenDistance} m</span>
              </div>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">测量结果</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">条纹间距 Δx</span>
                <span className="measurement">{fringeSpacing.toFixed(3)} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">计算波长</span>
                <span className="text-physics-primary font-mono">{wavelength} nm</span>
              </div>
            </div>
            <div className="formula mt-2 text-xs">
              Δx = λL/d
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">干涉条件</h4>
            <div className="space-y-1 text-xs text-physics-textSecondary">
              <p>明纹: δ = kλ (k=0,±1,±2...)</p>
              <p>暗纹: δ = (k+½)λ</p>
              <p>中央为零级明纹</p>
            </div>
          </div>

          {showSettings && (
            <div className="data-panel p-3 rounded">
              <h4 className="text-physics-text text-sm font-medium mb-2">参数调节</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-physics-textSecondary text-xs block mb-1">
                    波长: {wavelength} nm
                    <span className="ml-2" style={{ color: lightColor }}>●</span>
                  </label>
                  <input type="range" min="400" max="700" step="10" value={wavelength}
                    onChange={(e) => setWavelength(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-physics-textSecondary text-xs block mb-1">缝间距: {slitDistance} mm</label>
                  <input type="range" min="0.1" max="2" step="0.1" value={slitDistance}
                    onChange={(e) => setSlitDistance(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-physics-textSecondary text-xs block mb-1">屏距: {screenDistance} m</label>
                  <input type="range" min="0.5" max="3" step="0.1" value={screenDistance}
                    onChange={(e) => setScreenDistance(Number(e.target.value))} />
                </div>
              </div>
            </div>
          )}

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">可见光波长</h4>
            <div className="flex gap-1">
              {[
                { wl: 420, name: '紫' },
                { wl: 470, name: '蓝' },
                { wl: 520, name: '绿' },
                { wl: 580, name: '黄' },
                { wl: 610, name: '橙' },
                { wl: 660, name: '红' }
              ].map(c => (
                <button
                  key={c.wl}
                  onClick={() => setWavelength(c.wl)}
                  className="flex-1 py-1 text-xs rounded"
                  style={{
                    backgroundColor: wavelength === c.wl ? getWavelengthColor(c.wl) : '#21262d',
                    color: wavelength === c.wl ? '#0d1117' : '#8b949e'
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoubleslitInterferenceSimulation
