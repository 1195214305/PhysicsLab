import { useState } from 'react'
import { Settings } from 'lucide-react'

const SeriesParallelCircuitSimulation = () => {
  const [circuitType, setCircuitType] = useState<'series' | 'parallel'>('series')
  const [voltage, setVoltage] = useState(12) // 电源电压 V
  const [r1, setR1] = useState(100) // 电阻1 Ω
  const [r2, setR2] = useState(200) // 电阻2 Ω
  const [showSettings, setShowSettings] = useState(false)

  // 计算电路参数
  let totalR: number, current: number, i1: number, i2: number, u1: number, u2: number

  if (circuitType === 'series') {
    // 串联电路
    totalR = r1 + r2
    current = voltage / totalR
    i1 = current
    i2 = current
    u1 = current * r1
    u2 = current * r2
  } else {
    // 并联电路
    totalR = (r1 * r2) / (r1 + r2)
    current = voltage / totalR
    i1 = voltage / r1
    i2 = voltage / r2
    u1 = voltage
    u2 = voltage
  }

  // 功率
  const p1 = i1 * u1
  const p2 = i2 * u2
  const totalP = p1 + p2

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-physics-border bg-physics-surface">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCircuitType('series')}
            className={`btn ${circuitType === 'series' ? 'btn-primary' : 'btn-secondary'}`}
          >
            串联电路
          </button>
          <button
            onClick={() => setCircuitType('parallel')}
            className={`btn ${circuitType === 'parallel' ? 'btn-primary' : 'btn-secondary'}`}
          >
            并联电路
          </button>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="icon-btn">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 p-4">
          <svg viewBox="0 0 450 300" preserveAspectRatio="xMidYMid meet" className="w-full h-full max-h-full bg-physics-bg rounded border border-physics-border">
            {circuitType === 'series' ? (
              <>
                {/* 串联电路 */}
                {/* 电源 */}
                <line x1="50" y1="100" x2="50" y2="200" stroke="#6e7681" strokeWidth="2" />
                <line x1="40" y1="130" x2="60" y2="130" stroke="#f85149" strokeWidth="3" />
                <line x1="45" y1="145" x2="55" y2="145" stroke="#58a6ff" strokeWidth="2" />
                <text x="30" y="125" fill="#f85149" fontSize="10">+</text>
                <text x="30" y="155" fill="#58a6ff" fontSize="10">-</text>
                <text x="50" y="175" fill="#d29922" fontSize="10" textAnchor="middle">{voltage}V</text>

                {/* 导线 */}
                <line x1="50" y1="100" x2="150" y2="100" stroke="#6e7681" strokeWidth="2" />
                <line x1="250" y1="100" x2="350" y2="100" stroke="#6e7681" strokeWidth="2" />
                <line x1="350" y1="100" x2="350" y2="200" stroke="#6e7681" strokeWidth="2" />
                <line x1="350" y1="200" x2="50" y2="200" stroke="#6e7681" strokeWidth="2" />

                {/* 电阻R1 */}
                <rect x="150" y="85" width="50" height="30" fill="#21262d" stroke="#d29922" strokeWidth="2" rx="3" />
                <text x="175" y="105" fill="#d29922" fontSize="10" textAnchor="middle">R₁</text>
                <text x="175" y="130" fill="#8b949e" fontSize="9" textAnchor="middle">{r1}Ω</text>

                {/* 电阻R2 */}
                <rect x="250" y="85" width="50" height="30" fill="#21262d" stroke="#58a6ff" strokeWidth="2" rx="3" />
                <text x="275" y="105" fill="#58a6ff" fontSize="10" textAnchor="middle">R₂</text>
                <text x="275" y="130" fill="#8b949e" fontSize="9" textAnchor="middle">{r2}Ω</text>

                {/* 电流方向 */}
                <polygon points="100,95 110,100 100,105" fill="#39d353" />
                <text x="100" y="85" fill="#39d353" fontSize="9">I</text>

                {/* 电压标注 */}
                <line x1="150" y1="70" x2="200" y2="70" stroke="#f85149" strokeWidth="1" />
                <text x="175" y="65" fill="#f85149" fontSize="9" textAnchor="middle">U₁={u1.toFixed(2)}V</text>
                <line x1="250" y1="70" x2="300" y2="70" stroke="#58a6ff" strokeWidth="1" />
                <text x="275" y="65" fill="#58a6ff" fontSize="9" textAnchor="middle">U₂={u2.toFixed(2)}V</text>

                {/* 公式 */}
                <text x="225" y="250" fill="#8b949e" fontSize="11" textAnchor="middle">
                  串联: R = R₁ + R₂ = {totalR.toFixed(1)}Ω
                </text>
                <text x="225" y="270" fill="#8b949e" fontSize="11" textAnchor="middle">
                  I = U/R = {(current * 1000).toFixed(1)}mA (各处相等)
                </text>
              </>
            ) : (
              <>
                {/* 并联电路 */}
                {/* 电源 */}
                <line x1="50" y1="80" x2="50" y2="220" stroke="#6e7681" strokeWidth="2" />
                <line x1="40" y1="130" x2="60" y2="130" stroke="#f85149" strokeWidth="3" />
                <line x1="45" y1="145" x2="55" y2="145" stroke="#58a6ff" strokeWidth="2" />
                <text x="30" y="125" fill="#f85149" fontSize="10">+</text>
                <text x="30" y="155" fill="#58a6ff" fontSize="10">-</text>
                <text x="50" y="175" fill="#d29922" fontSize="10" textAnchor="middle">{voltage}V</text>

                {/* 上支路 */}
                <line x1="50" y1="80" x2="150" y2="80" stroke="#6e7681" strokeWidth="2" />
                <rect x="150" y="65" width="50" height="30" fill="#21262d" stroke="#d29922" strokeWidth="2" rx="3" />
                <text x="175" y="85" fill="#d29922" fontSize="10" textAnchor="middle">R₁</text>
                <line x1="200" y1="80" x2="350" y2="80" stroke="#6e7681" strokeWidth="2" />

                {/* 下支路 */}
                <line x1="50" y1="220" x2="150" y2="220" stroke="#6e7681" strokeWidth="2" />
                <rect x="150" y="205" width="50" height="30" fill="#21262d" stroke="#58a6ff" strokeWidth="2" rx="3" />
                <text x="175" y="225" fill="#58a6ff" fontSize="10" textAnchor="middle">R₂</text>
                <line x1="200" y1="220" x2="350" y2="220" stroke="#6e7681" strokeWidth="2" />

                {/* 右侧连接 */}
                <line x1="350" y1="80" x2="350" y2="220" stroke="#6e7681" strokeWidth="2" />

                {/* 分流点 */}
                <circle cx="100" cy="80" r="3" fill="#39d353" />
                <circle cx="100" cy="220" r="3" fill="#39d353" />
                <line x1="100" y1="80" x2="100" y2="220" stroke="#6e7681" strokeWidth="2" />

                {/* 电流标注 */}
                <polygon points="80,75 90,80 80,85" fill="#39d353" />
                <text x="75" y="65" fill="#39d353" fontSize="9">I</text>
                <polygon points="120,75 130,80 120,85" fill="#d29922" />
                <text x="125" y="65" fill="#d29922" fontSize="9">I₁</text>
                <polygon points="120,215 130,220 120,225" fill="#58a6ff" />
                <text x="125" y="245" fill="#58a6ff" fontSize="9">I₂</text>

                {/* 电阻值 */}
                <text x="175" y="55" fill="#8b949e" fontSize="9" textAnchor="middle">{r1}Ω</text>
                <text x="175" y="250" fill="#8b949e" fontSize="9" textAnchor="middle">{r2}Ω</text>

                {/* 公式 */}
                <text x="300" y="130" fill="#8b949e" fontSize="10" textAnchor="middle">
                  并联: 1/R = 1/R₁ + 1/R₂
                </text>
                <text x="300" y="150" fill="#8b949e" fontSize="10" textAnchor="middle">
                  R = {totalR.toFixed(1)}Ω
                </text>
                <text x="300" y="170" fill="#8b949e" fontSize="10" textAnchor="middle">
                  U₁ = U₂ = {voltage}V
                </text>
              </>
            )}
          </svg>
        </div>

        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-physics-border bg-physics-surface p-4 space-y-4 overflow-y-auto">
          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">参数设置</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-physics-textSecondary">电源电压 U</span>
                  <span className="measurement">{voltage} V</span>
                </div>
                <input type="range" min="1" max="24" value={voltage}
                  onChange={(e) => setVoltage(Number(e.target.value))} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-physics-textSecondary">电阻 R₁</span>
                  <span className="text-physics-amber font-mono">{r1} Ω</span>
                </div>
                <input type="range" min="10" max="500" step="10" value={r1}
                  onChange={(e) => setR1(Number(e.target.value))} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-physics-textSecondary">电阻 R₂</span>
                  <span className="text-physics-blue font-mono">{r2} Ω</span>
                </div>
                <input type="range" min="10" max="500" step="10" value={r2}
                  onChange={(e) => setR2(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">测量数据</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">总电阻 R</span>
                <span className="measurement">{totalR.toFixed(1)} Ω</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">总电流 I</span>
                <span className="measurement">{(current * 1000).toFixed(2)} mA</span>
              </div>
              <div className="divider my-2" />
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">I₁</span>
                <span className="text-physics-amber font-mono">{(i1 * 1000).toFixed(2)} mA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">I₂</span>
                <span className="text-physics-blue font-mono">{(i2 * 1000).toFixed(2)} mA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">U₁</span>
                <span className="text-physics-amber font-mono">{u1.toFixed(2)} V</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">U₂</span>
                <span className="text-physics-blue font-mono">{u2.toFixed(2)} V</span>
              </div>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">功率分析</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">P₁</span>
                <span className="text-physics-amber font-mono">{(p1 * 1000).toFixed(2)} mW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">P₂</span>
                <span className="text-physics-blue font-mono">{(p2 * 1000).toFixed(2)} mW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">总功率</span>
                <span className="measurement">{(totalP * 1000).toFixed(2)} mW</span>
              </div>
            </div>
          </div>

          {showSettings && (
            <div className="data-panel p-3 rounded">
              <h4 className="text-physics-text text-sm font-medium mb-2">电路特点</h4>
              <div className="text-physics-textSecondary text-xs space-y-1">
                {circuitType === 'series' ? (
                  <>
                    <p>• 电流处处相等: I₁ = I₂ = I</p>
                    <p>• 电压分配: U = U₁ + U₂</p>
                    <p>• 总电阻: R = R₁ + R₂</p>
                    <p>• 功率分配与电阻成正比</p>
                  </>
                ) : (
                  <>
                    <p>• 电压处处相等: U₁ = U₂ = U</p>
                    <p>• 电流分配: I = I₁ + I₂</p>
                    <p>• 总电阻: 1/R = 1/R₁ + 1/R₂</p>
                    <p>• 功率分配与电阻成反比</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SeriesParallelCircuitSimulation
