import { useState } from 'react'
import { Settings } from 'lucide-react'

const MagneticFieldSimulation = () => {
  const [current, setCurrent] = useState(5) // 电流 A
  const [wireType, setWireType] = useState<'straight' | 'solenoid'>('straight')
  const [showSettings, setShowSettings] = useState(false)

  // 磁场强度计算
  const mu0 = 4 * Math.PI * 1e-7 // 真空磁导率
  const r = 0.05 // 距离 5cm
  const n = 1000 // 螺线管匝数/米

  // 直导线磁场 B = μ₀I/(2πr)
  const B_straight = (mu0 * current) / (2 * Math.PI * r)
  // 螺线管磁场 B = μ₀nI
  const B_solenoid = mu0 * n * current

  const B = wireType === 'straight' ? B_straight : B_solenoid

  // 生成磁力线
  const generateFieldLines = () => {
    const lines = []
    if (wireType === 'straight') {
      // 同心圆磁力线
      for (let i = 1; i <= 5; i++) {
        const radius = 20 + i * 25
        lines.push(
          <circle
            key={i}
            cx="225"
            cy="150"
            r={radius}
            fill="none"
            stroke="#39d353"
            strokeWidth="1"
            strokeDasharray="4 2"
            opacity={0.3 + (6 - i) * 0.1}
          />
        )
        // 方向箭头
        const angle = Math.PI / 4
        const ax = 225 + radius * Math.cos(angle)
        const ay = 150 - radius * Math.sin(angle)
        lines.push(
          <polygon
            key={`arrow-${i}`}
            points={`${ax},${ay - 4} ${ax + 6},${ay} ${ax},${ay + 4}`}
            fill="#39d353"
            transform={`rotate(${current > 0 ? 45 : -135} ${ax} ${ay})`}
          />
        )
      }
    } else {
      // 螺线管磁力线
      for (let i = 0; i < 7; i++) {
        const y = 80 + i * 20
        // 内部平行线
        lines.push(
          <line
            key={`inner-${i}`}
            x1="150"
            y1={y}
            x2="300"
            y2={y}
            stroke="#39d353"
            strokeWidth="1"
            strokeDasharray="4 2"
            opacity={0.5}
          />
        )
        // 箭头
        lines.push(
          <polygon
            key={`arrow-inner-${i}`}
            points={`${current > 0 ? 280 : 170},${y - 3} ${current > 0 ? 286 : 164},${y} ${current > 0 ? 280 : 170},${y + 3}`}
            fill="#39d353"
          />
        )
      }
      // 外部回路
      lines.push(
        <path
          key="outer-top"
          d="M 300 80 Q 380 80 380 150 Q 380 220 300 220"
          fill="none"
          stroke="#39d353"
          strokeWidth="1"
          strokeDasharray="4 2"
          opacity={0.3}
        />,
        <path
          key="outer-bottom"
          d="M 150 80 Q 70 80 70 150 Q 70 220 150 220"
          fill="none"
          stroke="#39d353"
          strokeWidth="1"
          strokeDasharray="4 2"
          opacity={0.3}
        />
      )
    }
    return lines
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-physics-border bg-physics-surface">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWireType('straight')}
            className={`btn ${wireType === 'straight' ? 'btn-primary' : 'btn-secondary'}`}
          >
            直导线
          </button>
          <button
            onClick={() => setWireType('solenoid')}
            className={`btn ${wireType === 'solenoid' ? 'btn-primary' : 'btn-secondary'}`}
          >
            螺线管
          </button>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="icon-btn">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 p-4">
          <svg viewBox="0 0 450 300" preserveAspectRatio="xMidYMid meet" className="w-full h-full max-h-full bg-physics-bg rounded border border-physics-border">
            {/* 磁力线 */}
            {generateFieldLines()}

            {wireType === 'straight' ? (
              <>
                {/* 直导线（垂直于屏幕） */}
                <circle cx="225" cy="150" r="15" fill="#d29922" stroke="#e3b341" strokeWidth="2" />
                <text x="225" y="155" fill="#0d1117" fontSize="14" fontWeight="bold" textAnchor="middle">
                  {current > 0 ? '⊙' : '⊗'}
                </text>
                <text x="225" y="180" fill="#8b949e" fontSize="10" textAnchor="middle">
                  I = {current} A
                </text>

                {/* 安培定则示意 */}
                <text x="350" y="100" fill="#58a6ff" fontSize="10">安培定则</text>
                <text x="350" y="115" fill="#8b949e" fontSize="9">右手握住导线</text>
                <text x="350" y="128" fill="#8b949e" fontSize="9">拇指指向电流方向</text>
                <text x="350" y="141" fill="#8b949e" fontSize="9">四指弯曲方向为磁场方向</text>
              </>
            ) : (
              <>
                {/* 螺线管 */}
                <rect x="150" y="100" width="150" height="100" fill="none" stroke="#d29922" strokeWidth="3" rx="5" />
                {/* 线圈 */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                  <ellipse
                    key={i}
                    cx={160 + i * 14}
                    cy="150"
                    rx="5"
                    ry="45"
                    fill="none"
                    stroke="#d29922"
                    strokeWidth="1.5"
                  />
                ))}
                {/* 电流方向 */}
                <path d="M 130 150 L 150 150" stroke="#f85149" strokeWidth="2" markerEnd="url(#arrow-current)" />
                <path d="M 300 150 L 320 150" stroke="#f85149" strokeWidth="2" markerEnd="url(#arrow-current)" />
                <text x="225" y="230" fill="#8b949e" fontSize="10" textAnchor="middle">I = {current} A</text>

                {/* N/S极标注 */}
                <text x={current > 0 ? 310 : 140} y="155" fill="#f85149" fontSize="14" fontWeight="bold">N</text>
                <text x={current > 0 ? 140 : 310} y="155" fill="#58a6ff" fontSize="14" fontWeight="bold">S</text>
              </>
            )}

            <defs>
              <marker id="arrow-current" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="#f85149" />
              </marker>
            </defs>
          </svg>
        </div>

        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-physics-border bg-physics-surface p-4 space-y-4 overflow-y-auto">
          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">电流调节</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-physics-textSecondary">电流 I</span>
                <span className="measurement">{current} A</span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                value={current}
                onChange={(e) => setCurrent(Number(e.target.value))}
              />
              <p className="text-physics-textMuted text-xs">负值表示电流反向</p>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">磁场强度</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">B</span>
                <span className="measurement">{(B * 1e6).toFixed(2)} μT</span>
              </div>
              {wireType === 'straight' ? (
                <div className="flex justify-between">
                  <span className="text-physics-textSecondary">距离 r</span>
                  <span className="text-physics-amber font-mono">5 cm</span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-physics-textSecondary">匝数密度 n</span>
                  <span className="text-physics-amber font-mono">1000 匝/m</span>
                </div>
              )}
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">公式</h4>
            {wireType === 'straight' ? (
              <div className="formula text-sm">B = μ₀I/(2πr)</div>
            ) : (
              <div className="formula text-sm">B = μ₀nI</div>
            )}
            <p className="text-physics-textMuted text-xs mt-2">
              μ₀ = 4π×10⁻⁷ T·m/A
            </p>
          </div>

          {showSettings && (
            <div className="data-panel p-3 rounded">
              <h4 className="text-physics-text text-sm font-medium mb-2">说明</h4>
              <div className="text-physics-textSecondary text-xs space-y-1">
                <p>• 绿色虚线表示磁力线</p>
                <p>• 箭头表示磁场方向</p>
                <p>• ⊙表示电流出屏幕</p>
                <p>• ⊗表示电流入屏幕</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MagneticFieldSimulation
