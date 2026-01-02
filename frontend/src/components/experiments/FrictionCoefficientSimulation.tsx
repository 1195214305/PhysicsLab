import { useState } from 'react'
import { RotateCcw, Settings } from 'lucide-react'

const FrictionCoefficientSimulation = () => {
  const [angle, setAngle] = useState(30) // 斜面角度
  const [mass, setMass] = useState(1) // 质量 kg
  const [showSettings, setShowSettings] = useState(false)

  // 计算摩擦系数
  const mu = Math.tan(angle * Math.PI / 180)
  const normalForce = mass * 9.8 * Math.cos(angle * Math.PI / 180)
  const frictionForce = mu * normalForce
  const gravityComponent = mass * 9.8 * Math.sin(angle * Math.PI / 180)

  // 判断是否滑动（临界状态）
  const criticalAngle = Math.atan(mu) * 180 / Math.PI

  const resetSimulation = () => {
    setAngle(30)
    setMass(1)
  }

  // 斜面参数
  const slopeLength = 300
  const slopeHeight = slopeLength * Math.sin(angle * Math.PI / 180)
  const slopeWidth = slopeLength * Math.cos(angle * Math.PI / 180)

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-physics-border bg-physics-surface">
        <div className="flex items-center gap-2">
          <button onClick={resetSimulation} className="btn btn-secondary">
            <RotateCcw className="w-4 h-4" />
            <span>重置</span>
          </button>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="icon-btn">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 p-4 flex items-center justify-center">
          <svg viewBox="0 0 450 300" preserveAspectRatio="xMidYMid meet" className="w-full h-full max-h-full bg-physics-bg rounded border border-physics-border">
            {/* 地面 */}
            <line x1="50" y1="250" x2="400" y2="250" stroke="#484f58" strokeWidth="2" />

            {/* 斜面 */}
            <polygon
              points={`100,250 ${100 + slopeWidth},250 100,${250 - slopeHeight}`}
              fill="#21262d"
              stroke="#30363d"
              strokeWidth="2"
            />

            {/* 木块 */}
            <g transform={`translate(${100 + slopeWidth * 0.4}, ${250 - slopeHeight * 0.4}) rotate(${-angle})`}>
              <rect x="-20" y="-40" width="40" height="40" fill="#d29922" rx="2" />
              <text x="0" y="-15" fill="#0d1117" fontSize="12" fontWeight="bold" textAnchor="middle">m</text>
            </g>

            {/* 力的分析 */}
            <g transform={`translate(${100 + slopeWidth * 0.4}, ${250 - slopeHeight * 0.4})`}>
              {/* 重力 */}
              <line x1="0" y1="0" x2="0" y2="50" stroke="#f85149" strokeWidth="2" markerEnd="url(#arrow-red)" />
              <text x="10" y="55" fill="#f85149" fontSize="10">mg</text>

              {/* 支持力 */}
              <line x1="0" y1="0"
                x2={-40 * Math.sin(angle * Math.PI / 180)}
                y2={-40 * Math.cos(angle * Math.PI / 180)}
                stroke="#39d353" strokeWidth="2" markerEnd="url(#arrow-green)" />
              <text x={-45 * Math.sin(angle * Math.PI / 180) - 10}
                y={-45 * Math.cos(angle * Math.PI / 180)}
                fill="#39d353" fontSize="10">N</text>

              {/* 摩擦力 */}
              <line x1="0" y1="0"
                x2={-30 * Math.cos(angle * Math.PI / 180)}
                y2={30 * Math.sin(angle * Math.PI / 180)}
                stroke="#58a6ff" strokeWidth="2" markerEnd="url(#arrow-blue)" />
              <text x={-35 * Math.cos(angle * Math.PI / 180) - 5}
                y={35 * Math.sin(angle * Math.PI / 180) + 10}
                fill="#58a6ff" fontSize="10">f</text>
            </g>

            {/* 角度标注 */}
            <path
              d={`M 140 250 A 40 40 0 0 0 ${100 + 40 * Math.cos(angle * Math.PI / 180)} ${250 - 40 * Math.sin(angle * Math.PI / 180)}`}
              fill="none"
              stroke="#d29922"
              strokeWidth="1"
            />
            <text x="150" y="235" fill="#d29922" fontSize="12">θ = {angle}°</text>

            {/* 量角器刻度 */}
            <g transform="translate(100, 250)">
              {[0, 15, 30, 45, 60, 75].map(a => (
                <g key={a} transform={`rotate(${-a})`}>
                  <line x1="60" y1="0" x2="70" y2="0" stroke="#484f58" strokeWidth="0.5" />
                  <text x="80" y="4" fill="#6e7681" fontSize="8" transform={`rotate(${a})`}>{a}°</text>
                </g>
              ))}
            </g>

            <defs>
              <marker id="arrow-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="#f85149" />
              </marker>
              <marker id="arrow-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="#39d353" />
              </marker>
              <marker id="arrow-blue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="#58a6ff" />
              </marker>
            </defs>
          </svg>
        </div>

        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-physics-border bg-physics-surface p-4 space-y-4 overflow-y-auto">
          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">角度调节</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-physics-textSecondary">斜面角度 θ</span>
                <span className="measurement">{angle}°</span>
              </div>
              <input type="range" min="0" max="60" value={angle}
                onChange={(e) => setAngle(Number(e.target.value))} />
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">力的分析</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">重力 mg</span>
                <span className="text-physics-red font-mono">{(mass * 9.8).toFixed(2)} N</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">支持力 N</span>
                <span className="text-physics-primary font-mono">{normalForce.toFixed(2)} N</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">下滑分力</span>
                <span className="text-physics-amber font-mono">{gravityComponent.toFixed(2)} N</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">最大静摩擦力</span>
                <span className="text-physics-blue font-mono">{frictionForce.toFixed(2)} N</span>
              </div>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">摩擦系数测量</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">μ = tanθ</span>
                <span className="measurement">{mu.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">临界角</span>
                <span className="text-physics-amber font-mono">{criticalAngle.toFixed(1)}°</span>
              </div>
            </div>
            <div className="formula mt-2 text-xs">
              f = μN, μ = tanθ
            </div>
            <p className="text-physics-textMuted text-xs mt-2">
              当物体刚好开始滑动时，θ即为临界角，此时 μ = tanθ
            </p>
          </div>

          {showSettings && (
            <div className="data-panel p-3 rounded">
              <h4 className="text-physics-text text-sm font-medium mb-2">参数设置</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-physics-textSecondary text-xs block mb-1">质量 m: {mass} kg</label>
                  <input type="range" min="0.5" max="5" step="0.5" value={mass}
                    onChange={(e) => setMass(Number(e.target.value))} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FrictionCoefficientSimulation
