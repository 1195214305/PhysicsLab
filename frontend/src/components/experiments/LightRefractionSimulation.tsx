import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Settings, RotateCcw } from 'lucide-react'

const LightRefractionSimulation = () => {
  // 实验参数
  const [incidentAngle, setIncidentAngle] = useState(45) // 入射角 (度)
  const [n1, setN1] = useState(1.0) // 介质1折射率 (空气)
  const [n2, setN2] = useState(1.5) // 介质2折射率 (玻璃)
  const [showSettings, setShowSettings] = useState(false)
  const [showNormal, setShowNormal] = useState(true)

  // 计算折射角 (斯涅尔定律)
  const refractedAngle = useMemo(() => {
    const sinTheta1 = Math.sin(incidentAngle * Math.PI / 180)
    const sinTheta2 = (n1 / n2) * sinTheta1

    // 检查全反射
    if (Math.abs(sinTheta2) > 1) {
      return null // 全反射
    }

    return Math.asin(sinTheta2) * 180 / Math.PI
  }, [incidentAngle, n1, n2])

  // 临界角
  const criticalAngle = useMemo(() => {
    if (n1 <= n2) return null
    return Math.asin(n2 / n1) * 180 / Math.PI
  }, [n1, n2])

  // 是否发生全反射
  const isTotalReflection = refractedAngle === null

  // 画布参数
  const centerX = 250
  const centerY = 200
  const rayLength = 150

  // 计算光线端点
  const incidentStart = {
    x: centerX - rayLength * Math.sin(incidentAngle * Math.PI / 180),
    y: centerY - rayLength * Math.cos(incidentAngle * Math.PI / 180)
  }

  const refractedEnd = refractedAngle !== null ? {
    x: centerX + rayLength * Math.sin(refractedAngle * Math.PI / 180),
    y: centerY + rayLength * Math.cos(refractedAngle * Math.PI / 180)
  } : null

  // 反射光线
  const reflectedEnd = {
    x: centerX + rayLength * Math.sin(incidentAngle * Math.PI / 180),
    y: centerY - rayLength * Math.cos(incidentAngle * Math.PI / 180)
  }

  // 重置
  const resetSimulation = () => {
    setIncidentAngle(45)
    setN1(1.0)
    setN2(1.5)
  }

  // 介质预设
  const mediaPresets = [
    { name: '空气→玻璃', n1: 1.0, n2: 1.5 },
    { name: '空气→水', n1: 1.0, n2: 1.33 },
    { name: '玻璃→空气', n1: 1.5, n2: 1.0 },
    { name: '水→空气', n1: 1.33, n2: 1.0 },
    { name: '玻璃→水', n1: 1.5, n2: 1.33 }
  ]

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* 控制栏 */}
      <div className="flex items-center justify-between p-4 border-b border-lab-border bg-lab-darker/50">
        <div className="flex items-center gap-3">
          <button onClick={resetSimulation} className="control-btn">
            <RotateCcw className="w-4 h-4" />
            <span className="ml-2">重置</span>
          </button>
          <label className="flex items-center gap-2 text-sm text-lab-muted">
            <input
              type="checkbox"
              checked={showNormal}
              onChange={(e) => setShowNormal(e.target.checked)}
              className="rounded"
            />
            显示法线
          </label>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`control-btn ${showSettings ? 'border-lab-accent' : ''}`}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex">
        {/* 模拟画布 */}
        <div className="flex-1 relative p-4">
          <svg className="w-full h-full" viewBox="0 0 500 400">
            {/* 介质1 (上方) */}
            <rect x="0" y="0" width="500" height="200" fill="rgba(135, 206, 250, 0.1)" />
            <text x="30" y="30" fill="#87CEEB" fontSize="14">
              介质1: n₁ = {n1.toFixed(2)}
            </text>
            <text x="30" y="50" fill="#6b7280" fontSize="12">
              {n1 === 1.0 ? '(空气)' : n1 === 1.33 ? '(水)' : n1 === 1.5 ? '(玻璃)' : ''}
            </text>

            {/* 介质2 (下方) */}
            <rect x="0" y="200" width="500" height="200" fill="rgba(0, 212, 170, 0.1)" />
            <text x="30" y="380" fill="#00d4aa" fontSize="14">
              介质2: n₂ = {n2.toFixed(2)}
            </text>
            <text x="30" y="360" fill="#6b7280" fontSize="12">
              {n2 === 1.0 ? '(空气)' : n2 === 1.33 ? '(水)' : n2 === 1.5 ? '(玻璃)' : ''}
            </text>

            {/* 分界面 */}
            <line x1="0" y1="200" x2="500" y2="200" stroke="#2d3a4f" strokeWidth="2" />

            {/* 法线 */}
            {showNormal && (
              <>
                <line
                  x1={centerX}
                  y1="50"
                  x2={centerX}
                  y2="350"
                  stroke="#6b7280"
                  strokeWidth="1"
                  strokeDasharray="5 5"
                />
                <text x={centerX + 10} y="60" fill="#6b7280" fontSize="10">法线</text>
              </>
            )}

            {/* 入射光线 */}
            <defs>
              <marker id="arrowRed" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
              </marker>
              <marker id="arrowGreen" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#00d4aa" />
              </marker>
              <marker id="arrowBlue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
              </marker>
            </defs>

            {/* 入射光 */}
            <motion.line
              x1={incidentStart.x}
              y1={incidentStart.y}
              x2={centerX}
              y2={centerY}
              stroke="#ef4444"
              strokeWidth="3"
              markerEnd="url(#arrowRed)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />

            {/* 入射角标注 */}
            <path
              d={`M ${centerX} ${centerY - 40} A 40 40 0 0 0 ${centerX - 40 * Math.sin(incidentAngle * Math.PI / 180)} ${centerY - 40 * Math.cos(incidentAngle * Math.PI / 180)}`}
              fill="none"
              stroke="#ef4444"
              strokeWidth="1"
            />
            <text
              x={centerX - 25 * Math.sin(incidentAngle * Math.PI / 360)}
              y={centerY - 50}
              fill="#ef4444"
              fontSize="12"
            >
              θ₁={incidentAngle}°
            </text>

            {/* 折射光或全反射 */}
            {!isTotalReflection && refractedEnd && (
              <>
                <motion.line
                  x1={centerX}
                  y1={centerY}
                  x2={refractedEnd.x}
                  y2={refractedEnd.y}
                  stroke="#00d4aa"
                  strokeWidth="3"
                  markerEnd="url(#arrowGreen)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                />

                {/* 折射角标注 */}
                <path
                  d={`M ${centerX} ${centerY + 40} A 40 40 0 0 1 ${centerX + 40 * Math.sin(refractedAngle! * Math.PI / 180)} ${centerY + 40 * Math.cos(refractedAngle! * Math.PI / 180)}`}
                  fill="none"
                  stroke="#00d4aa"
                  strokeWidth="1"
                />
                <text
                  x={centerX + 25 * Math.sin(refractedAngle! * Math.PI / 360)}
                  y={centerY + 60}
                  fill="#00d4aa"
                  fontSize="12"
                >
                  θ₂={refractedAngle!.toFixed(1)}°
                </text>
              </>
            )}

            {/* 反射光 (全反射时更亮) */}
            <motion.line
              x1={centerX}
              y1={centerY}
              x2={reflectedEnd.x}
              y2={reflectedEnd.y}
              stroke="#3b82f6"
              strokeWidth={isTotalReflection ? 3 : 1.5}
              strokeOpacity={isTotalReflection ? 1 : 0.5}
              markerEnd="url(#arrowBlue)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />

            {/* 全反射提示 */}
            {isTotalReflection && (
              <text x={centerX + 60} y={centerY - 80} fill="#f59e0b" fontSize="14" fontWeight="bold">
                全反射!
              </text>
            )}

            {/* 入射点 */}
            <circle cx={centerX} cy={centerY} r="5" fill="#fff" />

            {/* 量角器刻度 */}
            <g opacity="0.3">
              {[0, 15, 30, 45, 60, 75, 90].map((angle) => (
                <g key={angle}>
                  {/* 上半部分 */}
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={centerX - 100 * Math.sin(angle * Math.PI / 180)}
                    y2={centerY - 100 * Math.cos(angle * Math.PI / 180)}
                    stroke="#6b7280"
                    strokeWidth="0.5"
                  />
                  <text
                    x={centerX - 110 * Math.sin(angle * Math.PI / 180)}
                    y={centerY - 110 * Math.cos(angle * Math.PI / 180)}
                    fill="#6b7280"
                    fontSize="8"
                    textAnchor="middle"
                  >
                    {angle}°
                  </text>
                  {/* 下半部分 */}
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={centerX + 100 * Math.sin(angle * Math.PI / 180)}
                    y2={centerY + 100 * Math.cos(angle * Math.PI / 180)}
                    stroke="#6b7280"
                    strokeWidth="0.5"
                  />
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* 数据面板 */}
        <div className="w-80 border-l border-lab-border bg-lab-darker/30 p-4 space-y-4 overflow-y-auto">
          {/* 角度控制 */}
          <div className="data-panel p-4">
            <h4 className="text-lab-text font-medium mb-3">入射角调节</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lab-muted text-sm">入射角 θ₁</span>
                <span className="measurement">{incidentAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="89"
                value={incidentAngle}
                onChange={(e) => setIncidentAngle(Number(e.target.value))}
              />
            </div>
          </div>

          {/* 实时数据 */}
          <div className="data-panel p-4">
            <h4 className="text-lab-text font-medium mb-3">测量数据</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lab-muted text-sm">入射角 θ₁</span>
                <span className="text-red-400 font-mono">{incidentAngle}°</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lab-muted text-sm">折射角 θ₂</span>
                <span className="text-lab-accent font-mono">
                  {isTotalReflection ? '全反射' : `${refractedAngle!.toFixed(1)}°`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lab-muted text-sm">sin θ₁</span>
                <span className="text-lab-muted font-mono">
                  {Math.sin(incidentAngle * Math.PI / 180).toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lab-muted text-sm">sin θ₂</span>
                <span className="text-lab-muted font-mono">
                  {isTotalReflection ? '-' : Math.sin(refractedAngle! * Math.PI / 180).toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* 斯涅尔定律验证 */}
          <div className="data-panel p-4">
            <h4 className="text-lab-text font-medium mb-3">斯涅尔定律</h4>
            <div className="formula mb-3">
              n₁ sin θ₁ = n₂ sin θ₂
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-lab-muted">n₁ sin θ₁</span>
                <span className="text-lab-accent font-mono">
                  {(n1 * Math.sin(incidentAngle * Math.PI / 180)).toFixed(4)}
                </span>
              </div>
              {!isTotalReflection && (
                <div className="flex justify-between">
                  <span className="text-lab-muted">n₂ sin θ₂</span>
                  <span className="text-lab-accent font-mono">
                    {(n2 * Math.sin(refractedAngle! * Math.PI / 180)).toFixed(4)}
                  </span>
                </div>
              )}
              {criticalAngle && (
                <div className="flex justify-between mt-2 pt-2 border-t border-lab-border">
                  <span className="text-lab-warning text-sm">临界角</span>
                  <span className="text-lab-warning font-mono">{criticalAngle.toFixed(1)}°</span>
                </div>
              )}
            </div>
          </div>

          {/* 介质预设 */}
          <div className="data-panel p-4">
            <h4 className="text-lab-text font-medium mb-3">介质预设</h4>
            <div className="grid grid-cols-2 gap-2">
              {mediaPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setN1(preset.n1)
                    setN2(preset.n2)
                  }}
                  className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                    n1 === preset.n1 && n2 === preset.n2
                      ? 'bg-lab-accent/20 border-lab-accent text-lab-accent'
                      : 'bg-lab-surface border-lab-border text-lab-muted hover:border-lab-accent/50'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* 参数设置 */}
          {showSettings && (
            <div className="data-panel p-4">
              <h4 className="text-lab-text font-medium mb-3">自定义折射率</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-lab-muted text-sm block mb-2">
                    介质1 n₁: {n1.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="1.0"
                    max="2.5"
                    step="0.01"
                    value={n1}
                    onChange={(e) => setN1(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-lab-muted text-sm block mb-2">
                    介质2 n₂: {n2.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="1.0"
                    max="2.5"
                    step="0.01"
                    value={n2}
                    onChange={(e) => setN2(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 常见介质折射率 */}
          <div className="data-panel p-4">
            <h4 className="text-lab-text font-medium mb-3">常见介质折射率</h4>
            <div className="space-y-1 text-xs text-lab-muted">
              <div className="flex justify-between">
                <span>真空/空气</span>
                <span className="font-mono">1.00</span>
              </div>
              <div className="flex justify-between">
                <span>水</span>
                <span className="font-mono">1.33</span>
              </div>
              <div className="flex justify-between">
                <span>普通玻璃</span>
                <span className="font-mono">1.50</span>
              </div>
              <div className="flex justify-between">
                <span>钻石</span>
                <span className="font-mono">2.42</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LightRefractionSimulation
