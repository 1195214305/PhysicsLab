import { useState, useMemo } from 'react'
import { Settings } from 'lucide-react'

const LensImagingSimulation = () => {
  const [objectDistance, setObjectDistance] = useState(30) // 物距 cm
  const [focalLength, setFocalLength] = useState(10) // 焦距 cm
  const [objectHeight] = useState(20) // 物高 (像素)
  const [showSettings, setShowSettings] = useState(false)

  // 透镜成像公式: 1/u + 1/v = 1/f
  const imageDistance = useMemo(() => {
    if (objectDistance === focalLength) return Infinity
    return (objectDistance * focalLength) / (objectDistance - focalLength)
  }, [objectDistance, focalLength])

  // 放大率 m = v/u = -h'/h
  const magnification = imageDistance / objectDistance

  // 像高
  const imageHeight = -objectHeight * magnification

  // 成像特点
  const imageType = useMemo(() => {
    if (objectDistance > 2 * focalLength) return { type: '倒立缩小实像', position: 'f < v < 2f' }
    if (objectDistance === 2 * focalLength) return { type: '倒立等大实像', position: 'v = 2f' }
    if (objectDistance > focalLength) return { type: '倒立放大实像', position: 'v > 2f' }
    if (objectDistance === focalLength) return { type: '不成像', position: '平行光' }
    return { type: '正立放大虚像', position: '同侧' }
  }, [objectDistance, focalLength])

  // 画布参数
  const centerX = 250
  const centerY = 150
  const scale = 3 // 像素/cm

  // 物体位置
  const objX = centerX - objectDistance * scale
  const objY = centerY

  // 像位置
  const imgX = imageDistance > 0 ? centerX + imageDistance * scale : centerX + imageDistance * scale
  const imgY = centerY

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-physics-border bg-physics-surface">
        <div className="flex items-center gap-2">
          <span className="text-physics-textSecondary text-sm">凸透镜成像</span>
          <span className={`tag ${imageDistance > 0 ? 'tag-primary' : 'tag-amber'}`}>
            {imageType.type}
          </span>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="icon-btn">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 p-4">
          <svg viewBox="0 0 500 300" preserveAspectRatio="xMidYMid meet" className="w-full h-full max-h-full bg-physics-bg rounded border border-physics-border">
            {/* 主光轴 */}
            <line x1="20" y1={centerY} x2="480" y2={centerY} stroke="#484f58" strokeWidth="1" />

            {/* 透镜 */}
            <ellipse cx={centerX} cy={centerY} rx="8" ry="80" fill="none" stroke="#58a6ff" strokeWidth="2" />
            <polygon points={`${centerX - 5},${centerY - 85} ${centerX},${centerY - 90} ${centerX + 5},${centerY - 85}`} fill="#58a6ff" />
            <polygon points={`${centerX - 5},${centerY + 85} ${centerX},${centerY + 90} ${centerX + 5},${centerY + 85}`} fill="#58a6ff" />

            {/* 焦点标记 */}
            <g>
              <line x1={centerX - focalLength * scale} y1={centerY - 5} x2={centerX - focalLength * scale} y2={centerY + 5} stroke="#d29922" strokeWidth="2" />
              <text x={centerX - focalLength * scale} y={centerY + 20} fill="#d29922" fontSize="10" textAnchor="middle">F</text>

              <line x1={centerX + focalLength * scale} y1={centerY - 5} x2={centerX + focalLength * scale} y2={centerY + 5} stroke="#d29922" strokeWidth="2" />
              <text x={centerX + focalLength * scale} y={centerY + 20} fill="#d29922" fontSize="10" textAnchor="middle">F'</text>

              {/* 2f点 */}
              <line x1={centerX - 2 * focalLength * scale} y1={centerY - 3} x2={centerX - 2 * focalLength * scale} y2={centerY + 3} stroke="#6e7681" strokeWidth="1" />
              <text x={centerX - 2 * focalLength * scale} y={centerY + 15} fill="#6e7681" fontSize="8" textAnchor="middle">2F</text>

              <line x1={centerX + 2 * focalLength * scale} y1={centerY - 3} x2={centerX + 2 * focalLength * scale} y2={centerY + 3} stroke="#6e7681" strokeWidth="1" />
              <text x={centerX + 2 * focalLength * scale} y={centerY + 15} fill="#6e7681" fontSize="8" textAnchor="middle">2F'</text>
            </g>

            {/* 物体 (蜡烛/箭头) */}
            <g>
              <line x1={objX} y1={objY} x2={objX} y2={objY - objectHeight} stroke="#39d353" strokeWidth="3" />
              <polygon points={`${objX - 5},${objY - objectHeight + 5} ${objX},${objY - objectHeight - 5} ${objX + 5},${objY - objectHeight + 5}`} fill="#39d353" />
              <text x={objX} y={objY + 15} fill="#39d353" fontSize="10" textAnchor="middle">物</text>
            </g>

            {/* 三条特殊光线 */}
            {objectDistance > focalLength && isFinite(imageDistance) && (
              <g opacity="0.6">
                {/* 平行于主光轴的光线 -> 过焦点 */}
                <line x1={objX} y1={objY - objectHeight} x2={centerX} y2={objY - objectHeight} stroke="#f85149" strokeWidth="1" />
                <line x1={centerX} y1={objY - objectHeight} x2={imgX} y2={imgY - imageHeight} stroke="#f85149" strokeWidth="1" />

                {/* 过光心的光线 -> 直线传播 */}
                <line x1={objX} y1={objY - objectHeight} x2={imgX} y2={imgY - imageHeight} stroke="#58a6ff" strokeWidth="1" />

                {/* 过焦点的光线 -> 平行射出 */}
                <line x1={objX} y1={objY - objectHeight} x2={centerX} y2={centerY - (objectHeight * (centerX - objX)) / (centerX - focalLength * scale - objX)} stroke="#d29922" strokeWidth="1" />
              </g>
            )}

            {/* 虚像光线延长 */}
            {objectDistance < focalLength && (
              <g opacity="0.4">
                <line x1={objX} y1={objY - objectHeight} x2={centerX} y2={objY - objectHeight} stroke="#f85149" strokeWidth="1" />
                <line x1={centerX} y1={objY - objectHeight} x2={centerX + 100} y2={objY - objectHeight + 100 * (objY - objectHeight - centerY + objectHeight * focalLength * scale / (focalLength * scale - (centerX - objX))) / 100} stroke="#f85149" strokeWidth="1" strokeDasharray="4 2" />
              </g>
            )}

            {/* 像 */}
            {isFinite(imageDistance) && Math.abs(imageDistance) < 100 && (
              <g>
                <line x1={imgX} y1={imgY} x2={imgX} y2={imgY - imageHeight}
                  stroke={imageDistance > 0 ? '#f85149' : '#d29922'}
                  strokeWidth="3"
                  strokeDasharray={imageDistance > 0 ? 'none' : '4 2'} />
                <polygon
                  points={`${imgX - 5},${imgY - imageHeight + (imageHeight > 0 ? 5 : -5)} ${imgX},${imgY - imageHeight + (imageHeight > 0 ? -5 : 5)} ${imgX + 5},${imgY - imageHeight + (imageHeight > 0 ? 5 : -5)}`}
                  fill={imageDistance > 0 ? '#f85149' : '#d29922'}
                  opacity={imageDistance > 0 ? 1 : 0.7} />
                <text x={imgX} y={imgY + 15} fill={imageDistance > 0 ? '#f85149' : '#d29922'} fontSize="10" textAnchor="middle">
                  {imageDistance > 0 ? '实像' : '虚像'}
                </text>
              </g>
            )}

            {/* 光心标记 */}
            <circle cx={centerX} cy={centerY} r="3" fill="#58a6ff" />
            <text x={centerX} y={centerY + 25} fill="#58a6ff" fontSize="10" textAnchor="middle">O</text>
          </svg>
        </div>

        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-physics-border bg-physics-surface p-4 space-y-4 overflow-y-auto">
          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">物距调节</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-physics-textSecondary">物距 u</span>
                <span className="measurement">{objectDistance} cm</span>
              </div>
              <input type="range" min="5" max="60" value={objectDistance}
                onChange={(e) => setObjectDistance(Number(e.target.value))} />
              <div className="flex gap-1 mt-2">
                {[
                  { label: 'u>2f', value: focalLength * 2.5 },
                  { label: 'u=2f', value: focalLength * 2 },
                  { label: 'f<u<2f', value: focalLength * 1.5 },
                  { label: 'u<f', value: focalLength * 0.7 }
                ].map(p => (
                  <button key={p.label} onClick={() => setObjectDistance(Math.round(p.value))}
                    className="flex-1 py-1 text-xs btn-secondary rounded">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">成像数据</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">焦距 f</span>
                <span className="text-physics-amber font-mono">{focalLength} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">像距 v</span>
                <span className="measurement">
                  {isFinite(imageDistance) ? imageDistance.toFixed(1) : '∞'} cm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">放大率 |m|</span>
                <span className="measurement">
                  {isFinite(magnification) ? Math.abs(magnification).toFixed(2) : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-physics-textSecondary">成像类型</span>
                <span className={`${imageDistance > 0 ? 'text-physics-red' : 'text-physics-amber'}`}>
                  {imageType.type}
                </span>
              </div>
            </div>
            <div className="formula mt-2 text-xs">
              1/u + 1/v = 1/f
            </div>
          </div>

          <div className="data-panel p-3 rounded">
            <h4 className="text-physics-text text-sm font-medium mb-2">成像规律</h4>
            <div className="space-y-1 text-xs text-physics-textSecondary">
              <p>• u {'>'} 2f: 倒立缩小实像</p>
              <p>• u = 2f: 倒立等大实像</p>
              <p>• f {'<'} u {'<'} 2f: 倒立放大实像</p>
              <p>• u = f: 不成像(平行光)</p>
              <p>• u {'<'} f: 正立放大虚像</p>
            </div>
          </div>

          {showSettings && (
            <div className="data-panel p-3 rounded">
              <h4 className="text-physics-text text-sm font-medium mb-2">透镜参数</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-physics-textSecondary text-xs block mb-1">焦距 f: {focalLength} cm</label>
                  <input type="range" min="5" max="20" value={focalLength}
                    onChange={(e) => setFocalLength(Number(e.target.value))} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LensImagingSimulation
