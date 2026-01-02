import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'

const MomentumConservationSimulation = () => {
  const [mass1, setMass1] = useState(2) // kg
  const [mass2, setMass2] = useState(1) // kg
  const [velocity1, setVelocity1] = useState(5) // m/s
  const [velocity2, setVelocity2] = useState(-2) // m/s
  const [elasticity, setElasticity] = useState(1) // 1=完全弹性, 0=完全非弹性
  const [isRunning, setIsRunning] = useState(false)
  const [phase, setPhase] = useState<'before' | 'collision' | 'after'>('before')
  const [, setTime] = useState(0)
  const [pos1, setPos1] = useState(100)
  const [pos2, setPos2] = useState(300)
  const [v1, setV1] = useState(5)
  const [v2, setV2] = useState(-2)
  const [showSettings, setShowSettings] = useState(false)

  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // 计算碰撞后速度
  const calculateAfterCollision = () => {
    const m1 = mass1, m2 = mass2
    const u1 = velocity1, u2 = velocity2
    const e = elasticity

    // 动量守恒 + 恢复系数
    // m1*v1' + m2*v2' = m1*u1 + m2*u2
    // v2' - v1' = -e*(u2 - u1)
    const v1After = ((m1 - e * m2) * u1 + (1 + e) * m2 * u2) / (m1 + m2)
    const v2After = ((m2 - e * m1) * u2 + (1 + e) * m1 * u1) / (m1 + m2)

    return { v1After, v2After }
  }

  const { v1After, v2After } = calculateAfterCollision()

  // 动量和动能计算
  const momentumBefore = mass1 * velocity1 + mass2 * velocity2
  const momentumAfter = mass1 * v1After + mass2 * v2After
  const keBefore = 0.5 * mass1 * velocity1 ** 2 + 0.5 * mass2 * velocity2 ** 2
  const keAfter = 0.5 * mass1 * v1After ** 2 + 0.5 * mass2 * v2After ** 2

  useEffect(() => {
    if (!isRunning) return

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const deltaTime = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp

      setTime(prev => prev + deltaTime)

      setPos1(prev => {
        const newPos = prev + v1 * deltaTime * 30
        return newPos
      })

      setPos2(prev => {
        const newPos = prev + v2 * deltaTime * 30
        return newPos
      })

      // 碰撞检测
      if (phase === 'before') {
        const dist = pos2 - pos1
        if (dist <= 50) {
          setPhase('collision')
          setV1(v1After)
          setV2(v2After)
          setTimeout(() => setPhase('after'), 100)
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isRunning, v1, v2, phase, pos1, pos2, v1After, v2After])

  const toggleSimulation = () => {
    lastTimeRef.current = 0
    setIsRunning(!isRunning)
  }

  const resetSimulation = () => {
    setIsRunning(false)
    setPhase('before')
    setTime(0)
    setPos1(100)
    setPos2(300)
    setV1(velocity1)
    setV2(velocity2)
    lastTimeRef.current = 0
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
  }

  // 滑块大小根据质量
  const size1 = 30 + mass1 * 5
  const size2 = 30 + mass2 * 5

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-physics-border bg-physics-surface">
        <div className="flex items-center gap-2">
          <button onClick={toggleSimulation} className={`btn ${isRunning ? 'btn-secondary' : 'btn-primary'}`}>
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? '暂停' : '开始'}</span>
          </button>
          <button onClick={resetSimulation} className="btn btn-secondary">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className={`tag ${phase === 'before' ? 'tag-amber' : phase === 'collision' ? 'tag-red' : 'tag-primary'}`}>
            {phase === 'before' ? '碰撞前' : phase === 'collision' ? '碰撞中' : '碰撞后'}
          </span>
          <button onClick={() => setShowSettings(!showSettings)} className="icon-btn">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 p-4">
          <svg viewBox="0 0 500 250" preserveAspectRatio="xMidYMid meet" className="w-full h-full max-h-full bg-physics-bg rounded border border-physics-border">
            {/* 气垫导轨 */}
            <rect x="20" y="140" width="460" height="20" fill="#21262d" rx="2" />
            <line x1="20" y1="140" x2="480" y2="140" stroke="#30363d" strokeWidth="1" />

            {/* 刻度 */}
            {[0, 100, 200, 300, 400].map(x => (
              <g key={x}>
                <line x1={40 + x} y1="165" x2={40 + x} y2="175" stroke="#484f58" strokeWidth="1" />
                <text x={40 + x} y="190" fill="#6e7681" fontSize="10" textAnchor="middle">{x}</text>
              </g>
            ))}

            {/* 滑块1 */}
            <g transform={`translate(${pos1}, 100)`}>
              <rect x={-size1 / 2} y={0} width={size1} height={40} fill="#39d353" rx="3" />
              <text x="0" y="25" fill="#0d1117" fontSize="12" fontWeight="bold" textAnchor="middle">m₁</text>
              {/* 速度箭头 */}
              {v1 !== 0 && (
                <line x1={size1 / 2 + 5} y1="20" x2={size1 / 2 + 5 + v1 * 5} y2="20"
                  stroke="#58a6ff" strokeWidth="2" markerEnd="url(#arrow)" />
              )}
            </g>

            {/* 滑块2 */}
            <g transform={`translate(${pos2}, 100)`}>
              <rect x={-size2 / 2} y={0} width={size2} height={40} fill="#d29922" rx="3" />
              <text x="0" y="25" fill="#0d1117" fontSize="12" fontWeight="bold" textAnchor="middle">m₂</text>
              {/* 速度箭头 */}
              {v2 !== 0 && (
                <line x1={-size2 / 2 - 5} y1="20" x2={-size2 / 2 - 5 + v2 * 5} y2="20"
                  stroke="#58a6ff" strokeWidth="2" markerEnd="url(#arrow)" />
              )}
            </g>

            {/* 碰撞效果 */}
            {phase === 'collision' && (
              <circle cx={(pos1 + pos2) / 2} cy="120" r="20" fill="none" stroke="#f85149" strokeWidth="2" opacity="0.8">
                <animate attributeName="r" from="10" to="30" dur="0.2s" />
                <animate attributeName="opacity" from="1" to="0" dur="0.2s" />
              </circle>
            )}

            <defs>
              <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="#58a6ff" />
              </marker>
            </defs>

            {/* 图例 */}
            <g transform="translate(20, 220)">
              <rect x="0" y="0" width="12" height="12" fill="#39d353" rx="2" />
              <text x="18" y="10" fill="#8b949e" fontSize="10">m₁ = {mass1} kg</text>
              <rect x="100" y="0" width="12" height="12" fill="#d29922" rx="2" />
              <text x="118" y="10" fill="#8b949e" fontSize="10">m₂ = {mass2} kg</text>
            </g>
          </svg>
        </div>

        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-physics-border bg-physics-surface p-4 space-y-4 overflow-y-auto">
          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">碰撞前</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-physics-textMuted text-xs">v₁</span>
                <div className="measurement">{velocity1.toFixed(1)} m/s</div>
              </div>
              <div>
                <span className="text-physics-textMuted text-xs">v₂</span>
                <div className="measurement">{velocity2.toFixed(1)} m/s</div>
              </div>
              <div>
                <span className="text-physics-textMuted text-xs">总动量</span>
                <div className="text-physics-primary font-mono">{momentumBefore.toFixed(2)} kg·m/s</div>
              </div>
              <div>
                <span className="text-physics-textMuted text-xs">总动能</span>
                <div className="text-physics-amber font-mono">{keBefore.toFixed(2)} J</div>
              </div>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">碰撞后</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-physics-textMuted text-xs">v₁'</span>
                <div className="measurement">{v1After.toFixed(2)} m/s</div>
              </div>
              <div>
                <span className="text-physics-textMuted text-xs">v₂'</span>
                <div className="measurement">{v2After.toFixed(2)} m/s</div>
              </div>
              <div>
                <span className="text-physics-textMuted text-xs">总动量</span>
                <div className="text-physics-primary font-mono">{momentumAfter.toFixed(2)} kg·m/s</div>
              </div>
              <div>
                <span className="text-physics-textMuted text-xs">总动能</span>
                <div className="text-physics-amber font-mono">{keAfter.toFixed(2)} J</div>
              </div>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">守恒验证</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">动量变化</span>
                <span className={`font-mono ${Math.abs(momentumAfter - momentumBefore) < 0.01 ? 'text-physics-primary' : 'text-physics-red'}`}>
                  {(momentumAfter - momentumBefore).toFixed(4)} kg·m/s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">动能损失</span>
                <span className="text-physics-amber font-mono">
                  {((1 - keAfter / keBefore) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">碰撞类型</span>
                <span className="text-physics-text">
                  {elasticity === 1 ? '完全弹性' : elasticity === 0 ? '完全非弹性' : '非完全弹性'}
                </span>
              </div>
            </div>
            <div className="formula mt-2 text-xs">
              m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'
            </div>
          </div>

          {showSettings && (
            <div className="data-panel p-3 rounded">
              <h4 className="text-physics-text text-sm font-medium mb-2">参数设置</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-physics-textSecondary text-xs block mb-1">m₁: {mass1} kg</label>
                  <input type="range" min="0.5" max="5" step="0.5" value={mass1}
                    onChange={(e) => { setMass1(Number(e.target.value)); resetSimulation() }}
                    disabled={isRunning} />
                </div>
                <div>
                  <label className="text-physics-textSecondary text-xs block mb-1">m₂: {mass2} kg</label>
                  <input type="range" min="0.5" max="5" step="0.5" value={mass2}
                    onChange={(e) => { setMass2(Number(e.target.value)); resetSimulation() }}
                    disabled={isRunning} />
                </div>
                <div>
                  <label className="text-physics-textSecondary text-xs block mb-1">v₁: {velocity1} m/s</label>
                  <input type="range" min="-10" max="10" step="1" value={velocity1}
                    onChange={(e) => { setVelocity1(Number(e.target.value)); resetSimulation() }}
                    disabled={isRunning} />
                </div>
                <div>
                  <label className="text-physics-textSecondary text-xs block mb-1">v₂: {velocity2} m/s</label>
                  <input type="range" min="-10" max="10" step="1" value={velocity2}
                    onChange={(e) => { setVelocity2(Number(e.target.value)); resetSimulation() }}
                    disabled={isRunning} />
                </div>
                <div>
                  <label className="text-physics-textSecondary text-xs block mb-1">
                    恢复系数 e: {elasticity} ({elasticity === 1 ? '弹性' : elasticity === 0 ? '非弹性' : '部分弹性'})
                  </label>
                  <input type="range" min="0" max="1" step="0.1" value={elasticity}
                    onChange={(e) => { setElasticity(Number(e.target.value)); resetSimulation() }}
                    disabled={isRunning} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MomentumConservationSimulation
