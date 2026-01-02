import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, CircleDot } from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Line } from 'recharts'

interface DataPoint {
  voltage: number
  current: number
}

const OhmsLawSimulation = () => {
  // 实验参数
  const [voltage, setVoltage] = useState(6) // 电压 (V)
  const [resistance, setResistance] = useState(100) // 电阻 (Ω)
  const [showSettings, setShowSettings] = useState(false)

  // 计算电流
  const current = (voltage / resistance) * 1000 // mA

  // 数据记录
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])

  // 记录数据点
  const recordDataPoint = () => {
    const newPoint = { voltage, current: current }
    setDataPoints(prev => {
      // 避免重复记录相同的点
      const exists = prev.some(p => Math.abs(p.voltage - voltage) < 0.1)
      if (exists) return prev
      return [...prev, newPoint].sort((a, b) => a.voltage - b.voltage)
    })
  }

  // 清除数据
  const clearData = () => {
    setDataPoints([])
  }

  // 计算线性拟合
  const calculateFit = () => {
    if (dataPoints.length < 2) return null
    const n = dataPoints.length
    const sumX = dataPoints.reduce((acc, p) => acc + p.voltage, 0)
    const sumY = dataPoints.reduce((acc, p) => acc + p.current, 0)
    const sumXY = dataPoints.reduce((acc, p) => acc + p.voltage * p.current, 0)
    const sumX2 = dataPoints.reduce((acc, p) => acc + p.voltage * p.voltage, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return { slope, intercept, calculatedR: 1000 / slope }
  }

  const fitResult = calculateFit()

  // 电流表指针角度
  const meterAngle = Math.min(current / 100 * 90, 90) - 45

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* 控制栏 */}
      <div className="flex items-center justify-between p-4 border-b border-lab-border bg-lab-darker/50">
        <div className="flex items-center gap-3">
          <button onClick={recordDataPoint} className="control-btn primary">
            <CircleDot className="w-4 h-4" />
            <span className="ml-2">记录数据</span>
          </button>
          <button onClick={clearData} className="control-btn">
            清除数据
          </button>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`control-btn ${showSettings ? 'border-lab-accent' : ''}`}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex">
        {/* 电路图 */}
        <div className="flex-1 relative p-4">
          <svg className="w-full h-full" viewBox="0 0 500 400">
            {/* 背景网格 */}
            <defs>
              <pattern id="circuitGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuitGrid)" />

            {/* 电源 */}
            <g transform="translate(80, 150)">
              <rect x="-30" y="-40" width="60" height="80" rx="5" fill="#1a2332" stroke="#3b82f6" strokeWidth="2" />
              <line x1="-15" y1="-20" x2="15" y2="-20" stroke="#3b82f6" strokeWidth="3" />
              <line x1="0" y1="-10" x2="0" y2="10" stroke="#3b82f6" strokeWidth="3" />
              <line x1="-8" y1="10" x2="8" y2="10" stroke="#3b82f6" strokeWidth="3" />
              <text x="0" y="55" fill="#3b82f6" fontSize="12" textAnchor="middle">电源</text>
              <text x="0" y="70" fill="#00d4aa" fontSize="14" fontWeight="bold" textAnchor="middle">{voltage}V</text>
            </g>

            {/* 电阻 */}
            <g transform="translate(250, 80)">
              <rect x="-40" y="-15" width="80" height="30" rx="3" fill="#1a2332" stroke="#f59e0b" strokeWidth="2" />
              {/* 电阻符号 */}
              <path d="M -30 0 L -20 -10 L -10 10 L 0 -10 L 10 10 L 20 -10 L 30 0" fill="none" stroke="#f59e0b" strokeWidth="2" />
              <text x="0" y="35" fill="#f59e0b" fontSize="12" textAnchor="middle">电阻</text>
              <text x="0" y="50" fill="#00d4aa" fontSize="14" fontWeight="bold" textAnchor="middle">{resistance}Ω</text>
            </g>

            {/* 电流表 */}
            <g transform="translate(250, 280)">
              <circle cx="0" cy="0" r="40" fill="#1a2332" stroke="#00d4aa" strokeWidth="2" />
              {/* 刻度 */}
              {[-45, -22.5, 0, 22.5, 45].map((angle, i) => (
                <g key={i} transform={`rotate(${angle})`}>
                  <line x1="0" y1="-35" x2="0" y2="-30" stroke="#6b7280" strokeWidth="1" />
                </g>
              ))}
              {/* 指针 */}
              <motion.line
                x1="0"
                y1="5"
                x2="0"
                y2="-28"
                stroke="#ef4444"
                strokeWidth="2"
                animate={{ rotate: meterAngle }}
                transition={{ type: "spring", stiffness: 100 }}
                style={{ transformOrigin: "center" }}
              />
              <circle cx="0" cy="0" r="5" fill="#ef4444" />
              <text x="0" y="-50" fill="#00d4aa" fontSize="10" textAnchor="middle">A</text>
              <text x="0" y="60" fill="#9ca3af" fontSize="12" textAnchor="middle">电流表</text>
            </g>

            {/* 电压表 */}
            <g transform="translate(400, 180)">
              <circle cx="0" cy="0" r="35" fill="#1a2332" stroke="#3b82f6" strokeWidth="2" />
              <text x="0" y="-45" fill="#3b82f6" fontSize="10" textAnchor="middle">V</text>
              <text x="0" y="5" fill="#00d4aa" fontSize="16" fontWeight="bold" textAnchor="middle">{voltage.toFixed(1)}</text>
              <text x="0" y="55" fill="#9ca3af" fontSize="12" textAnchor="middle">电压表</text>
            </g>

            {/* 导线连接 */}
            <path
              d="M 80 110 L 80 80 L 210 80"
              fill="none"
              stroke="#00d4aa"
              strokeWidth="3"
            />
            <path
              d="M 290 80 L 420 80 L 420 145"
              fill="none"
              stroke="#00d4aa"
              strokeWidth="3"
            />
            <path
              d="M 420 215 L 420 280 L 290 280"
              fill="none"
              stroke="#00d4aa"
              strokeWidth="3"
            />
            <path
              d="M 210 280 L 80 280 L 80 190"
              fill="none"
              stroke="#00d4aa"
              strokeWidth="3"
            />

            {/* 电流方向箭头 */}
            <g transform="translate(150, 80)">
              <polygon points="0,-5 10,0 0,5" fill="#ef4444" />
              <text x="0" y="-15" fill="#ef4444" fontSize="10" textAnchor="middle">I</text>
            </g>

            {/* 电流动画 */}
            {current > 0 && (
              <>
                <circle r="4" fill="#00d4aa">
                  <animateMotion
                    dur={`${Math.max(0.5, 3 - current / 30)}s`}
                    repeatCount="indefinite"
                    path="M 80 110 L 80 80 L 420 80 L 420 280 L 80 280 L 80 190"
                  />
                </circle>
                <circle r="4" fill="#00d4aa">
                  <animateMotion
                    dur={`${Math.max(0.5, 3 - current / 30)}s`}
                    repeatCount="indefinite"
                    begin="0.5s"
                    path="M 80 110 L 80 80 L 420 80 L 420 280 L 80 280 L 80 190"
                  />
                </circle>
              </>
            )}
          </svg>
        </div>

        {/* 数据面板 */}
        <div className="w-80 border-l border-lab-border bg-lab-darker/30 p-4 space-y-4 overflow-y-auto">
          {/* 实时数据 */}
          <div className="data-panel p-4">
            <h4 className="text-lab-text font-medium mb-3">实时数据</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lab-muted text-sm">电压 U</span>
                <span className="measurement">{voltage.toFixed(1)} V</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lab-muted text-sm">电阻 R</span>
                <span className="measurement">{resistance} Ω</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lab-muted text-sm">电流 I</span>
                <span className="measurement">{current.toFixed(2)} mA</span>
              </div>
            </div>
          </div>

          {/* 欧姆定律验证 */}
          <div className="data-panel p-4">
            <h4 className="text-lab-text font-medium mb-3">欧姆定律验证</h4>
            <div className="space-y-2 text-sm">
              <div className="formula">
                I = U / R
              </div>
              <div className="formula">
                I = {voltage} / {resistance} = {(voltage / resistance * 1000).toFixed(2)} mA
              </div>
              <div className="flex justify-between mt-3">
                <span className="text-lab-muted">理论值</span>
                <span className="text-lab-accent font-mono">{(voltage / resistance * 1000).toFixed(2)} mA</span>
              </div>
            </div>
          </div>

          {/* U-I 特性曲线 */}
          {dataPoints.length > 0 && (
            <div className="data-panel p-4">
              <h4 className="text-lab-text font-medium mb-3">U-I 特性曲线</h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4f" />
                    <XAxis
                      dataKey="voltage"
                      name="U"
                      unit="V"
                      stroke="#6b7280"
                      tick={{ fontSize: 10 }}
                      label={{ value: 'U/V', position: 'bottom', fill: '#6b7280', fontSize: 10 }}
                    />
                    <YAxis
                      dataKey="current"
                      name="I"
                      unit="mA"
                      stroke="#6b7280"
                      tick={{ fontSize: 10 }}
                      label={{ value: 'I/mA', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a2332',
                        border: '1px solid #2d3a4f',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(2)} ${name === 'voltage' ? 'V' : 'mA'}`,
                        name === 'voltage' ? 'U' : 'I'
                      ]}
                    />
                    <Scatter data={dataPoints} fill="#00d4aa" />
                    {/* 拟合线 */}
                    {fitResult && (
                      <Line
                        data={[
                          { voltage: 0, current: fitResult.intercept },
                          { voltage: 12, current: fitResult.slope * 12 + fitResult.intercept }
                        ]}
                        type="linear"
                        dataKey="current"
                        stroke="#3b82f6"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    )}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              {fitResult && (
                <div className="mt-2 text-xs text-lab-muted">
                  <p>拟合斜率: {fitResult.slope.toFixed(4)} mA/V</p>
                  <p>计算电阻: {fitResult.calculatedR.toFixed(1)} Ω</p>
                </div>
              )}
            </div>
          )}

          {/* 数据记录表 */}
          {dataPoints.length > 0 && (
            <div className="data-panel p-4">
              <h4 className="text-lab-text font-medium mb-3">数据记录</h4>
              <div className="max-h-32 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-lab-muted border-b border-lab-border">
                      <th className="py-1 text-left">#</th>
                      <th className="py-1 text-right">U (V)</th>
                      <th className="py-1 text-right">I (mA)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataPoints.map((point, i) => (
                      <tr key={i} className="text-lab-text">
                        <td className="py-1">{i + 1}</td>
                        <td className="py-1 text-right font-mono">{point.voltage.toFixed(1)}</td>
                        <td className="py-1 text-right font-mono">{point.current.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 参数设置 */}
          {showSettings && (
            <div className="data-panel p-4">
              <h4 className="text-lab-text font-medium mb-3">参数设置</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-lab-muted text-sm block mb-2">
                    电压 U: {voltage.toFixed(1)} V
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="0.5"
                    value={voltage}
                    onChange={(e) => setVoltage(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-lab-muted text-sm block mb-2">
                    电阻 R: {resistance} Ω
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={resistance}
                    onChange={(e) => setResistance(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OhmsLawSimulation
