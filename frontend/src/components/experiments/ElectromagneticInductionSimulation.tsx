import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'

const ElectromagneticInductionSimulation = () => {
  const [magnetPosition, setMagnetPosition] = useState(50) // 磁铁位置 0-100
  const [magnetVelocity, setMagnetVelocity] = useState(0) // 磁铁速度
  const [isAutoMode, setIsAutoMode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const animationRef = useRef<number>()
  const lastPositionRef = useRef(50)

  // 计算感应电动势 (简化模型)
  const emf = -magnetVelocity * 0.5 // 感应电动势与速度成正比

  // 自动模式动画
  useEffect(() => {
    if (isAutoMode) {
      let direction = 1
      let pos = magnetPosition

      const animate = () => {
        pos += direction * 2
        if (pos >= 90) direction = -1
        if (pos <= 10) direction = 1

        const velocity = direction * 2
        setMagnetPosition(pos)
        setMagnetVelocity(velocity)

        animationRef.current = requestAnimationFrame(animate)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAutoMode])

  // 手动拖动时计算速度
  const handlePositionChange = (newPos: number) => {
    const velocity = (newPos - lastPositionRef.current) * 0.5
    setMagnetVelocity(velocity)
    setMagnetPosition(newPos)
    lastPositionRef.current = newPos
  }

  const reset = () => {
    setIsAutoMode(false)
    setMagnetPosition(50)
    setMagnetVelocity(0)
    lastPositionRef.current = 50
  }

  // 电流计指针角度
  const needleAngle = Math.max(-45, Math.min(45, emf * 10))

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-physics-border bg-physics-surface">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoMode(!isAutoMode)}
            className={`btn ${isAutoMode ? 'btn-primary' : 'btn-secondary'}`}
          >
            {isAutoMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isAutoMode ? '暂停' : '自动'}</span>
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
            {/* 线圈 */}
            <rect x="180" y="100" width="90" height="100" fill="none" stroke="#d29922" strokeWidth="3" rx="5" />
            {[0, 1, 2, 3, 4].map(i => (
              <ellipse
                key={i}
                cx={195 + i * 15}
                cy="150"
                rx="6"
                ry="45"
                fill="none"
                stroke="#d29922"
                strokeWidth="1.5"
              />
            ))}

            {/* 磁铁 */}
            <g transform={`translate(${50 + magnetPosition * 3}, 150)`}>
              {/* N极 */}
              <rect x="-40" y="-20" width="40" height="40" fill="#f85149" rx="3" />
              <text x="-20" y="5" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">N</text>
              {/* S极 */}
              <rect x="0" y="-20" width="40" height="40" fill="#58a6ff" rx="3" />
              <text x="20" y="5" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">S</text>

              {/* 速度箭头 */}
              {Math.abs(magnetVelocity) > 0.1 && (
                <g>
                  <line
                    x1="0"
                    y1="-35"
                    x2={magnetVelocity * 15}
                    y2="-35"
                    stroke="#39d353"
                    strokeWidth="2"
                  />
                  <polygon
                    points={magnetVelocity > 0 ? `${magnetVelocity * 15 - 5},-40 ${magnetVelocity * 15},-35 ${magnetVelocity * 15 - 5},-30` : `${magnetVelocity * 15 + 5},-40 ${magnetVelocity * 15},-35 ${magnetVelocity * 15 + 5},-30`}
                    fill="#39d353"
                  />
                  <text x="0" y="-45" fill="#39d353" fontSize="10" textAnchor="middle">v</text>
                </g>
              )}
            </g>

            {/* 电流计 */}
            <g transform="translate(350, 150)">
              <circle cx="0" cy="0" r="40" fill="#21262d" stroke="#484f58" strokeWidth="2" />
              <text x="0" y="-50" fill="#8b949e" fontSize="10" textAnchor="middle">电流计</text>

              {/* 刻度 */}
              {[-45, -30, -15, 0, 15, 30, 45].map(angle => (
                <line
                  key={angle}
                  x1={30 * Math.cos((angle - 90) * Math.PI / 180)}
                  y1={30 * Math.sin((angle - 90) * Math.PI / 180)}
                  x2={35 * Math.cos((angle - 90) * Math.PI / 180)}
                  y2={35 * Math.sin((angle - 90) * Math.PI / 180)}
                  stroke="#6e7681"
                  strokeWidth="1"
                />
              ))}

              {/* 指针 */}
              <line
                x1="0"
                y1="0"
                x2={28 * Math.cos((needleAngle - 90) * Math.PI / 180)}
                y2={28 * Math.sin((needleAngle - 90) * Math.PI / 180)}
                stroke="#f85149"
                strokeWidth="2"
              />
              <circle cx="0" cy="0" r="4" fill="#f85149" />

              {/* 标签 */}
              <text x="-25" y="25" fill="#58a6ff" fontSize="8">-</text>
              <text x="22" y="25" fill="#f85149" fontSize="8">+</text>
            </g>

            {/* 连接线 */}
            <path d="M 270 120 Q 300 100 350 110" fill="none" stroke="#6e7681" strokeWidth="1.5" />
            <path d="M 270 180 Q 300 200 350 190" fill="none" stroke="#6e7681" strokeWidth="1.5" />

            {/* 磁力线示意 */}
            {[1, 2, 3].map(i => (
              <path
                key={i}
                d={`M ${50 + magnetPosition * 3 - 30} ${130 + i * 15} Q ${50 + magnetPosition * 3 + 50} ${130 + i * 15 - 20} ${50 + magnetPosition * 3 + 100} ${130 + i * 15}`}
                fill="none"
                stroke="#39d353"
                strokeWidth="0.5"
                strokeDasharray="3 2"
                opacity="0.5"
              />
            ))}

            {/* 说明文字 */}
            <text x="225" y="250" fill="#8b949e" fontSize="10" textAnchor="middle">
              {isAutoMode ? '磁铁自动往复运动' : '拖动滑块移动磁铁'}
            </text>
          </svg>
        </div>

        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-physics-border bg-physics-surface p-4 space-y-4 overflow-y-auto">
          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">磁铁位置</h4>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                value={magnetPosition}
                onChange={(e) => handlePositionChange(Number(e.target.value))}
                disabled={isAutoMode}
              />
              <p className="text-physics-textMuted text-xs">
                {isAutoMode ? '自动模式中...' : '拖动滑块移动磁铁'}
              </p>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">测量数据</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">磁铁速度 v</span>
                <span className="measurement">{magnetVelocity.toFixed(2)} m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">感应电动势 ε</span>
                <span className={`font-mono ${emf > 0 ? 'text-physics-red' : emf < 0 ? 'text-physics-blue' : 'text-physics-textSecondary'}`}>
                  {emf.toFixed(3)} V
                </span>
              </div>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">法拉第定律</h4>
            <div className="formula text-sm">ε = -dΦ/dt</div>
            <p className="text-physics-textMuted text-xs mt-2">
              感应电动势的大小等于穿过线圈的磁通量变化率
            </p>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">楞次定律</h4>
            <div className="text-physics-textSecondary text-xs space-y-1">
              <p>感应电流的磁场总是阻碍引起感应电流的磁通量的变化</p>
              <p className="text-physics-amber">• 磁铁靠近：感应电流产生排斥</p>
              <p className="text-physics-blue">• 磁铁远离：感应电流产生吸引</p>
            </div>
          </div>

          {showSettings && (
            <div className="data-panel p-3 rounded">
              <h4 className="text-physics-text text-sm font-medium mb-2">实验说明</h4>
              <div className="text-physics-textSecondary text-xs space-y-1">
                <p>1. 点击"自动"让磁铁往复运动</p>
                <p>2. 或手动拖动滑块控制磁铁</p>
                <p>3. 观察电流计指针偏转</p>
                <p>4. 速度越快，感应电动势越大</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ElectromagneticInductionSimulation
