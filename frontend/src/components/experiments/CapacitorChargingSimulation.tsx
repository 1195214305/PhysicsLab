import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DataPoint {
  time: number
  voltage: number
  current: number
}

const CapacitorChargingSimulation = () => {
  const [capacitance, setCapacitance] = useState(100) // μF
  const [resistance, setResistance] = useState(10) // kΩ
  const [sourceVoltage, setSourceVoltage] = useState(12) // V
  const [isCharging, setIsCharging] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [voltage, setVoltage] = useState(0)
  const [current, setCurrent] = useState(0)
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [showSettings, setShowSettings] = useState(false)

  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // 时间常数 τ = RC (秒)
  const tau = (resistance * 1000) * (capacitance / 1000000)

  useEffect(() => {
    if (!isRunning) return

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const deltaTime = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp

      setTime(prev => {
        const newTime = prev + deltaTime

        let newVoltage: number, newCurrent: number
        if (isCharging) {
          newVoltage = sourceVoltage * (1 - Math.exp(-newTime / tau))
          newCurrent = (sourceVoltage / (resistance * 1000)) * Math.exp(-newTime / tau) * 1000 // mA
        } else {
          newVoltage = sourceVoltage * Math.exp(-newTime / tau)
          newCurrent = -(sourceVoltage / (resistance * 1000)) * Math.exp(-newTime / tau) * 1000 // mA
        }

        setVoltage(newVoltage)
        setCurrent(newCurrent)

        if (Math.floor(newTime * 20) > Math.floor(prev * 20)) {
          setDataPoints(p => [...p.slice(-50), { time: newTime, voltage: newVoltage, current: Math.abs(newCurrent) }])
        }

        return newTime
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isRunning, isCharging, sourceVoltage, tau, resistance])

  const toggleSimulation = () => {
    lastTimeRef.current = 0
    setIsRunning(!isRunning)
  }

  const resetSimulation = () => {
    setIsRunning(false)
    setTime(0)
    setVoltage(isCharging ? 0 : sourceVoltage)
    setCurrent(0)
    setDataPoints([])
    lastTimeRef.current = 0
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
  }

  const toggleMode = () => {
    setIsCharging(!isCharging)
    resetSimulation()
  }

  // 电容器充电百分比
  const chargePercent = (voltage / sourceVoltage) * 100

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
          <button onClick={toggleMode} className={`btn ${isCharging ? 'btn-primary' : 'btn-outline'}`}>
            {isCharging ? '充电' : '放电'}
          </button>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="icon-btn">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 p-4">
          <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid meet" className="w-full h-full max-h-full bg-physics-bg rounded border border-physics-border">
            {/* 电源 */}
            <g transform="translate(60, 100)">
              <rect x="-20" y="-30" width="40" height="60" fill="#21262d" stroke="#30363d" strokeWidth="1" rx="3" />
              <line x1="-10" y1="-15" x2="10" y2="-15" stroke="#39d353" strokeWidth="2" />
              <line x1="0" y1="-5" x2="0" y2="5" stroke="#39d353" strokeWidth="2" />
              <line x1="-6" y1="5" x2="6" y2="5" stroke="#39d353" strokeWidth="2" />
              <text x="0" y="45" fill="#8b949e" fontSize="10" textAnchor="middle">{sourceVoltage}V</text>
            </g>

            {/* 电阻 */}
            <g transform="translate(180, 50)">
              <rect x="-30" y="-10" width="60" height="20" fill="#21262d" stroke="#d29922" strokeWidth="1" rx="2" />
              <path d="M -20 0 L -15 -6 L -5 6 L 5 -6 L 15 6 L 20 0" fill="none" stroke="#d29922" strokeWidth="1.5" />
              <text x="0" y="30" fill="#8b949e" fontSize="10" textAnchor="middle">{resistance}kΩ</text>
            </g>

            {/* 电容器 */}
            <g transform="translate(300, 100)">
              <line x1="-15" y1="-25" x2="-15" y2="25" stroke="#58a6ff" strokeWidth="3" />
              <line x1="15" y1="-25" x2="15" y2="25" stroke="#58a6ff" strokeWidth="3" />
              {/* 充电指示 */}
              <rect x="-12" y={25 - chargePercent * 0.5} width="24" height={chargePercent * 0.5}
                fill="rgba(88, 166, 255, 0.3)" />
              <text x="0" y="45" fill="#8b949e" fontSize="10" textAnchor="middle">{capacitance}μF</text>
            </g>

            {/* 导线 */}
            <path d="M 60 70 L 60 50 L 150 50" fill="none" stroke="#39d353" strokeWidth="2" />
            <path d="M 210 50 L 300 50 L 300 75" fill="none" stroke="#39d353" strokeWidth="2" />
            <path d="M 300 125 L 300 200 L 60 200 L 60 130" fill="none" stroke="#39d353" strokeWidth="2" />

            {/* 开关 */}
            <g transform="translate(180, 200)">
              <circle cx="-20" cy="0" r="4" fill="#39d353" />
              <circle cx="20" cy="0" r="4" fill="#39d353" />
              <line x1="-16" y1="0" x2={isRunning ? "16" : "10"} y2={isRunning ? "0" : "-15"}
                stroke="#39d353" strokeWidth="2" />
            </g>

            {/* 电流方向 */}
            {isRunning && Math.abs(current) > 0.01 && (
              <g>
                <circle r="3" fill="#f85149">
                  <animateMotion
                    dur={`${Math.max(0.3, 2 - Math.abs(current) / 0.5)}s`}
                    repeatCount="indefinite"
                    path={isCharging
                      ? "M 60 70 L 60 50 L 300 50 L 300 200 L 60 200 L 60 130"
                      : "M 300 125 L 300 200 L 60 200 L 60 70 L 60 50 L 300 50 L 300 75"
                    }
                  />
                </circle>
              </g>
            )}

            {/* 电压表 */}
            <g transform="translate(300, 180)">
              <circle cx="0" cy="0" r="20" fill="#21262d" stroke="#58a6ff" strokeWidth="1" />
              <text x="0" y="-25" fill="#58a6ff" fontSize="8">V</text>
              <text x="0" y="5" fill="#39d353" fontSize="11" fontWeight="bold" textAnchor="middle">
                {voltage.toFixed(2)}
              </text>
            </g>
          </svg>
        </div>

        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-physics-border bg-physics-surface p-4 space-y-4 overflow-y-auto">
          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">实时数据</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">时间 t</span>
                <span className="measurement">{time.toFixed(2)} s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">电容电压 Uc</span>
                <span className="measurement">{voltage.toFixed(3)} V</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">电流 I</span>
                <span className="measurement">{Math.abs(current).toFixed(3)} mA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">充电量</span>
                <span className="text-physics-blue font-mono">{chargePercent.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">RC电路参数</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">时间常数 τ</span>
                <span className="text-physics-primary font-mono">{tau.toFixed(3)} s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">t/τ</span>
                <span className="text-physics-amber font-mono">{(time / tau).toFixed(2)}</span>
              </div>
            </div>
            <div className="formula mt-2 text-xs">
              τ = RC = {resistance}kΩ × {capacitance}μF
            </div>
          </div>

          {dataPoints.length > 2 && (
            <div className="data-panel p-3 rounded">
              <h4 className="text-physics-text text-sm font-medium mb-2">U-t 曲线</h4>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataPoints}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                    <XAxis dataKey="time" stroke="#6e7681" tick={{ fontSize: 9 }} />
                    <YAxis stroke="#6e7681" tick={{ fontSize: 9 }} domain={[0, sourceVoltage * 1.1]} />
                    <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '6px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="voltage" stroke="#58a6ff" strokeWidth={2} dot={false} name="U" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {showSettings && (
            <div className="data-panel p-3 rounded">
              <h4 className="text-physics-text text-sm font-medium mb-2">参数设置</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-physics-textSecondary text-xs block mb-1">电容 C: {capacitance} μF</label>
                  <input type="range" min="10" max="500" step="10" value={capacitance}
                    onChange={(e) => { setCapacitance(Number(e.target.value)); resetSimulation() }}
                    disabled={isRunning} />
                </div>
                <div>
                  <label className="text-physics-textSecondary text-xs block mb-1">电阻 R: {resistance} kΩ</label>
                  <input type="range" min="1" max="50" step="1" value={resistance}
                    onChange={(e) => { setResistance(Number(e.target.value)); resetSimulation() }}
                    disabled={isRunning} />
                </div>
                <div>
                  <label className="text-physics-textSecondary text-xs block mb-1">电源电压: {sourceVoltage} V</label>
                  <input type="range" min="3" max="24" step="1" value={sourceVoltage}
                    onChange={(e) => { setSourceVoltage(Number(e.target.value)); resetSimulation() }}
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

export default CapacitorChargingSimulation
