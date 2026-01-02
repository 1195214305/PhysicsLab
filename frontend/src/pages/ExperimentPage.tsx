import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getExperimentById, getCategoryById } from '../store/experiments'
import { ArrowLeft, Target, BookOpen, Wrench, Clock, Download, Share2, Check } from 'lucide-react'

// 实验模拟组件
import FreeFallSimulation from '../components/experiments/FreeFallSimulation'
import SpringOscillatorSimulation from '../components/experiments/SpringOscillatorSimulation'
import OhmsLawSimulation from '../components/experiments/OhmsLawSimulation'
import LightRefractionSimulation from '../components/experiments/LightRefractionSimulation'
import ProjectileMotionSimulation from '../components/experiments/ProjectileMotionSimulation'
import SimplePendulumSimulation from '../components/experiments/SimplePendulumSimulation'
import MomentumConservationSimulation from '../components/experiments/MomentumConservationSimulation'
import FrictionCoefficientSimulation from '../components/experiments/FrictionCoefficientSimulation'
import CapacitorChargingSimulation from '../components/experiments/CapacitorChargingSimulation'
import DoubleslitInterferenceSimulation from '../components/experiments/DoubleslitInterferenceSimulation'
import LensImagingSimulation from '../components/experiments/LensImagingSimulation'
import PhotoelectricEffectSimulation from '../components/experiments/PhotoelectricEffectSimulation'
import MagneticFieldSimulation from '../components/experiments/MagneticFieldSimulation'
import ElectromagneticInductionSimulation from '../components/experiments/ElectromagneticInductionSimulation'
import SeriesParallelCircuitSimulation from '../components/experiments/SeriesParallelCircuitSimulation'
import GasLawsSimulation from '../components/experiments/GasLawsSimulation'
import HeatConductionSimulation from '../components/experiments/HeatConductionSimulation'
import SpecificHeatSimulation from '../components/experiments/SpecificHeatSimulation'
import AtomicSpectrumSimulation from '../components/experiments/AtomicSpectrumSimulation'
import RadioactiveDecaySimulation from '../components/experiments/RadioactiveDecaySimulation'
import DefaultSimulation from '../components/experiments/DefaultSimulation'

const simulationComponents: Record<string, React.ComponentType> = {
  'free-fall': FreeFallSimulation,
  'spring-oscillator': SpringOscillatorSimulation,
  'ohms-law': OhmsLawSimulation,
  'light-refraction': LightRefractionSimulation,
  'projectile-motion': ProjectileMotionSimulation,
  'simple-pendulum': SimplePendulumSimulation,
  'momentum-conservation': MomentumConservationSimulation,
  'friction-coefficient': FrictionCoefficientSimulation,
  'capacitor-charging': CapacitorChargingSimulation,
  'double-slit-interference': DoubleslitInterferenceSimulation,
  'lens-imaging': LensImagingSimulation,
  'photoelectric-effect': PhotoelectricEffectSimulation,
  'total-reflection': LightRefractionSimulation, // 复用折射实验
  'magnetic-field': MagneticFieldSimulation,
  'electromagnetic-induction': ElectromagneticInductionSimulation,
  'series-parallel-circuit': SeriesParallelCircuitSimulation,
  'gas-laws': GasLawsSimulation,
  'heat-conduction': HeatConductionSimulation,
  'specific-heat': SpecificHeatSimulation,
  'atomic-spectrum': AtomicSpectrumSimulation,
  'radioactive-decay': RadioactiveDecaySimulation,
}

const difficultyConfig = {
  easy: { label: '基础', class: 'tag-success' },
  medium: { label: '中等', class: 'tag-warning' },
  hard: { label: '进阶', class: 'tag-error' }
}

const ExperimentPage = () => {
  const { experimentId } = useParams<{ experimentId: string }>()
  const experiment = getExperimentById(experimentId || '')
  const category = experiment ? getCategoryById(experiment.categoryId) : null
  const [shareSuccess, setShareSuccess] = useState(false)

  // 导出实验报告为文本文件
  const handleExport = () => {
    if (!experiment) return

    const reportContent = `
=====================================
PhysicsLab 实验报告
=====================================

实验名称：${experiment.name}
实验分类：${category?.name || experiment.category}
难度等级：${difficultyConfig[experiment.difficulty].label}
建议时长：${experiment.duration}

-------------------------------------
实验简介
-------------------------------------
${experiment.description}

-------------------------------------
实验目标
-------------------------------------
${experiment.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

-------------------------------------
核心公式
-------------------------------------
${experiment.principles.join('\n')}

-------------------------------------
实验器材
-------------------------------------
${experiment.equipment.join('、')}

-------------------------------------
实验步骤
-------------------------------------
1. 调整实验参数到合适的初始值
2. 点击"开始"按钮运行模拟
3. 观察物理现象并记录数据
4. 分析数据，验证物理规律

-------------------------------------
注意事项
-------------------------------------
- 确保参数在合理范围内
- 多次实验取平均值减小误差
- 注意观察数据变化趋势
- 结合理论公式分析结果

-------------------------------------
误差分析
-------------------------------------
- 系统误差：模型简化带来的偏差
- 随机误差：测量精度限制
- 可通过多次测量减小误差

=====================================
导出时间：${new Date().toLocaleString('zh-CN')}
来源：PhysicsLab 高中物理虚拟实验室
=====================================
`.trim()

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `实验报告_${experiment.name}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 分享实验链接
  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareText = `【PhysicsLab】${experiment?.name} - 高中物理虚拟实验`

    // 优先使用 Web Share API（移动端）
    if (navigator.share) {
      try {
        await navigator.share({
          title: experiment?.name,
          text: shareText,
          url: shareUrl,
        })
        return
      } catch {
        // 用户取消或不支持，回退到复制链接
      }
    }

    // 复制链接到剪贴板
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)
    } catch {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)
    }
  }

  if (!experiment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-4" style={{ color: 'var(--text)' }}>实验不存在</h2>
          <Link to="/" className="hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>返回首页</Link>
        </div>
      </div>
    )
  }

  const SimulationComponent = simulationComponents[experiment.id] || DefaultSimulation
  const difficulty = difficultyConfig[experiment.difficulty]

  return (
    <div className="min-h-screen">
      {/* 顶部信息栏 */}
      <div style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* 面包屑 */}
          <div className="flex items-center gap-2 text-sm mb-2">
            <Link to="/" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>实验大厅</Link>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            {category && (
              <>
                <Link to={`/category/${category.id}`} className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                  {category.name}
                </Link>
                <span style={{ color: 'var(--text-muted)' }}>/</span>
              </>
            )}
            <span style={{ color: 'var(--text)' }}>{experiment.name}</span>
          </div>

          {/* 标题行 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>{experiment.name}</h1>
              <span className={`tag ${difficulty.class}`}>{difficulty.label}</span>
            </div>
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {experiment.duration}
              </span>
              <Link to={category ? `/category/${category.id}` : '/'} className="flex items-center gap-1 hover:opacity-70 transition-opacity">
                <ArrowLeft className="w-4 h-4" />
                返回
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-4">
        {/* 实验模拟区域 - 全宽 */}
        <div className="card overflow-hidden relative mb-4" style={{ height: 'calc(100vh - 200px)', minHeight: '550px', maxHeight: '800px' }}>
          <SimulationComponent />
        </div>

        {/* 下方信息面板 - 横向排列 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 实验目标 */}
          <div className="card p-4">
            <div className="flex items-center gap-2 font-medium mb-3" style={{ color: 'var(--text)' }}>
              <Target className="w-4 h-4" />
              实验目标
            </div>
            <ul className="space-y-2">
              {experiment.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--text)' }}>
                    {i + 1}
                  </span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 核心公式 */}
          <div className="card p-4">
            <div className="flex items-center gap-2 font-medium mb-3" style={{ color: 'var(--text)' }}>
              <BookOpen className="w-4 h-4" />
              核心公式
            </div>
            <div className="space-y-2">
              {experiment.principles.map((principle, i) => (
                <div key={i} className="formula text-sm">{principle}</div>
              ))}
            </div>
          </div>

          {/* 实验器材 */}
          <div className="card p-4">
            <div className="flex items-center gap-2 font-medium mb-3" style={{ color: 'var(--text)' }}>
              <Wrench className="w-4 h-4" />
              实验器材
            </div>
            <div className="flex flex-wrap gap-1.5">
              {experiment.equipment.map((item, i) => (
                <span key={i} className="tag">{item}</span>
              ))}
            </div>
          </div>

          {/* 标签和操作 */}
          <div className="card p-4">
            <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>相关标签</div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {experiment.tags.map((tag, i) => (
                <span key={i} className="tag tag-primary">{tag}</span>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleExport} className="flex-1 btn btn-secondary text-sm">
                <Download className="w-4 h-4" />
                导出
              </button>
              <button onClick={handleShare} className="flex-1 btn btn-secondary text-sm">
                {shareSuccess ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {shareSuccess ? '已复制' : '分享'}
              </button>
            </div>
          </div>
        </div>

        {/* 实验说明 */}
        <div className="card p-4 mt-4">
          <h3 className="font-medium mb-3" style={{ color: 'var(--text)' }}>实验说明</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{experiment.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--text)' }}>实验步骤</h4>
              <ol className="space-y-1 list-decimal list-inside" style={{ color: 'var(--text-secondary)' }}>
                <li>调整实验参数到合适的初始值</li>
                <li>点击"开始"按钮运行模拟</li>
                <li>观察物理现象并记录数据</li>
                <li>分析数据，验证物理规律</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--text)' }}>注意事项</h4>
              <ul className="space-y-1 list-disc list-inside" style={{ color: 'var(--text-secondary)' }}>
                <li>确保参数在合理范围内</li>
                <li>多次实验取平均值减小误差</li>
                <li>注意观察数据变化趋势</li>
                <li>结合理论公式分析结果</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--text)' }}>误差分析</h4>
              <ul className="space-y-1 list-disc list-inside" style={{ color: 'var(--text-secondary)' }}>
                <li>系统误差：模型简化带来的偏差</li>
                <li>随机误差：测量精度限制</li>
                <li>可通过多次测量减小误差</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExperimentPage
