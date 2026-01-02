import { useState, useMemo } from 'react'
import { Settings } from 'lucide-react'

const AtomicSpectrumSimulation = () => {
  const [showSettings, setShowSettings] = useState(false)
  const [selectedSeries, setSelectedSeries] = useState<'lyman' | 'balmer' | 'paschen'>('balmer')
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null)

  // 里德伯常数
  const R = 1.097e7 // m^-1

  // 计算光谱线波长
  const calculateWavelength = (n1: number, n2: number) => {
    return 1 / (R * (1 / (n1 * n1) - 1 / (n2 * n2))) * 1e9 // nm
  }

  // 各系列的光谱线
  const spectralLines = useMemo(() => {
    const lines: { series: string; n1: number; n2: number; wavelength: number; color: string; name: string }[] = []

    // 莱曼系 (n1=1, 紫外)
    for (let n2 = 2; n2 <= 6; n2++) {
      const wl = calculateWavelength(1, n2)
      lines.push({
        series: 'lyman',
        n1: 1,
        n2,
        wavelength: wl,
        color: '#a371f7', // 紫外用紫色表示
        name: `Lα${n2 === 2 ? '' : String.fromCharCode(945 + n2 - 2)}`
      })
    }

    // 巴尔末系 (n1=2, 可见光)
    const balmerColors = ['#f85149', '#58a6ff', '#a371f7', '#39d353']
    for (let n2 = 3; n2 <= 6; n2++) {
      const wl = calculateWavelength(2, n2)
      lines.push({
        series: 'balmer',
        n1: 2,
        n2,
        wavelength: wl,
        color: balmerColors[n2 - 3],
        name: `H${String.fromCharCode(945 + n2 - 3)}`
      })
    }

    // 帕邢系 (n1=3, 红外)
    for (let n2 = 4; n2 <= 7; n2++) {
      const wl = calculateWavelength(3, n2)
      lines.push({
        series: 'paschen',
        n1: 3,
        n2,
        wavelength: wl,
        color: '#f85149', // 红外用红色表示
        name: `Pα${n2 === 4 ? '' : String.fromCharCode(945 + n2 - 4)}`
      })
    }

    return lines
  }, [])

  const currentLines = spectralLines.filter(l => l.series === selectedSeries)

  // 波长到可见光颜色
  const wavelengthToColor = (wl: number) => {
    if (wl < 380) return '#a371f7' // 紫外
    if (wl < 450) return '#a371f7' // 紫
    if (wl < 495) return '#58a6ff' // 蓝
    if (wl < 570) return '#39d353' // 绿
    if (wl < 590) return '#d29922' // 黄
    if (wl < 620) return '#f0883e' // 橙
    if (wl < 750) return '#f85149' // 红
    return '#f85149' // 红外
  }

  const seriesInfo = {
    lyman: { name: '莱曼系', n1: 1, range: '紫外区 (10-122 nm)' },
    balmer: { name: '巴尔末系', n1: 2, range: '可见光区 (365-656 nm)' },
    paschen: { name: '帕邢系', n1: 3, range: '红外区 (820-1875 nm)' }
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-physics-border bg-physics-surface">
        <div className="flex items-center gap-2">
          {(['lyman', 'balmer', 'paschen'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSelectedSeries(s)}
              className={`btn text-xs ${selectedSeries === s ? 'btn-primary' : 'btn-secondary'}`}
            >
              {seriesInfo[s].name}
            </button>
          ))}
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="icon-btn">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 p-4 flex flex-col gap-4">
          {/* 能级图 */}
          <div className="flex-1">
            <svg viewBox="0 0 450 250" preserveAspectRatio="xMidYMid meet" className="w-full h-full max-h-full bg-physics-bg rounded border border-physics-border">
              {/* 能级 */}
              {[1, 2, 3, 4, 5, 6].map(n => {
                const y = 230 - (1 - 1 / (n * n)) * 180
                const energy = -13.6 / (n * n)
                return (
                  <g key={n}>
                    <line x1="80" y1={y} x2="280" y2={y} stroke="#484f58" strokeWidth="2" />
                    <text x="60" y={y + 4} fill="#8b949e" fontSize="10" textAnchor="end">n={n}</text>
                    <text x="290" y={y + 4} fill="#6e7681" fontSize="9">{energy.toFixed(2)} eV</text>
                  </g>
                )
              })}

              {/* 跃迁箭头 */}
              {currentLines.map((line, i) => {
                const y1 = 230 - (1 - 1 / (line.n2 * line.n2)) * 180
                const y2 = 230 - (1 - 1 / (line.n1 * line.n1)) * 180
                const x = 120 + i * 35
                const isHighlighted = highlightedLine === i

                return (
                  <g
                    key={i}
                    onMouseEnter={() => setHighlightedLine(i)}
                    onMouseLeave={() => setHighlightedLine(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <line
                      x1={x}
                      y1={y1}
                      x2={x}
                      y2={y2}
                      stroke={wavelengthToColor(line.wavelength)}
                      strokeWidth={isHighlighted ? 3 : 2}
                      opacity={isHighlighted ? 1 : 0.7}
                    />
                    <polygon
                      points={`${x - 4},${y2 + 8} ${x},${y2} ${x + 4},${y2 + 8}`}
                      fill={wavelengthToColor(line.wavelength)}
                    />
                    <text
                      x={x}
                      y={y1 - 5}
                      fill={wavelengthToColor(line.wavelength)}
                      fontSize="8"
                      textAnchor="middle"
                    >
                      {line.name}
                    </text>
                  </g>
                )
              })}

              {/* 标题 */}
              <text x="180" y="25" fill="#c9d1d9" fontSize="12" textAnchor="middle" fontWeight="bold">
                氢原子能级跃迁 - {seriesInfo[selectedSeries].name}
              </text>

              {/* 光谱条 */}
              <rect x="330" y="50" width="100" height="180" fill="#0d1117" stroke="#484f58" strokeWidth="1" />
              {currentLines.map((line, i) => {
                const x = 335 + (line.wavelength - (selectedSeries === 'lyman' ? 90 : selectedSeries === 'balmer' ? 360 : 800)) * (selectedSeries === 'lyman' ? 2.5 : selectedSeries === 'balmer' ? 0.3 : 0.08)
                const isHighlighted = highlightedLine === i
                return (
                  <line
                    key={i}
                    x1={Math.max(335, Math.min(425, x))}
                    y1="55"
                    x2={Math.max(335, Math.min(425, x))}
                    y2="225"
                    stroke={wavelengthToColor(line.wavelength)}
                    strokeWidth={isHighlighted ? 4 : 2}
                    opacity={isHighlighted ? 1 : 0.8}
                  />
                )
              })}
              <text x="380" y="245" fill="#8b949e" fontSize="9" textAnchor="middle">光谱</text>
            </svg>
          </div>
        </div>

        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-physics-border bg-physics-surface p-4 space-y-4 overflow-y-auto">
          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">{seriesInfo[selectedSeries].name}</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">终态能级</span>
                <span className="measurement">n = {seriesInfo[selectedSeries].n1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">波长范围</span>
                <span className="text-physics-amber font-mono text-xs">{seriesInfo[selectedSeries].range}</span>
              </div>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">光谱线数据</h4>
            <div className="space-y-2">
              {currentLines.map((line, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center p-1.5 rounded ${highlightedLine === i ? 'bg-physics-card' : ''}`}
                  onMouseEnter={() => setHighlightedLine(i)}
                  onMouseLeave={() => setHighlightedLine(null)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: wavelengthToColor(line.wavelength) }}
                    />
                    <span className="text-physics-textSecondary text-xs">{line.name}</span>
                  </div>
                  <span className="font-mono text-xs" style={{ color: wavelengthToColor(line.wavelength) }}>
                    {line.wavelength.toFixed(1)} nm
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">里德伯公式</h4>
            <div className="formula text-sm">1/λ = R(1/n₁² - 1/n₂²)</div>
            <div className="text-physics-textMuted text-xs mt-2 space-y-1">
              <p>R = 1.097×10⁷ m⁻¹</p>
              <p>n₁ {'<'} n₂ (n₁为终态)</p>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">玻尔模型</h4>
            <div className="formula text-sm">Eₙ = -13.6/n² eV</div>
            <p className="text-physics-textMuted text-xs mt-2">
              电子从高能级跃迁到低能级时，释放光子，光子能量等于两能级之差
            </p>
          </div>

          {showSettings && (
            <div className="data-panel p-3 rounded">
              <h4 className="text-physics-text text-sm font-medium mb-2">说明</h4>
              <div className="text-physics-textSecondary text-xs space-y-1">
                <p>• 莱曼系：跃迁到n=1，紫外光</p>
                <p>• 巴尔末系：跃迁到n=2，可见光</p>
                <p>• 帕邢系：跃迁到n=3，红外光</p>
                <p>• 鼠标悬停查看详细信息</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AtomicSpectrumSimulation
