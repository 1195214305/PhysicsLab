import { useParams, Link } from 'react-router-dom'
import { getCategoryById, getExperimentsByCategory, type Experiment } from '../store/experiments'
import { Clock, ArrowLeft, Target, BookOpen, Wrench } from 'lucide-react'

const difficultyConfig = {
  easy: { label: '基础', class: 'tag-success' },
  medium: { label: '中等', class: 'tag-warning' },
  hard: { label: '进阶', class: 'tag-error' }
}

const ExperimentCard = ({ experiment }: { experiment: Experiment }) => {
  const difficulty = difficultyConfig[experiment.difficulty]

  return (
    <Link to={`/experiment/${experiment.id}`} className="card block transition-all group">
      <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium transition-colors" style={{ color: 'var(--text)' }}>
            {experiment.name}
          </h3>
          <span className={`tag ${difficulty.class}`}>{difficulty.label}</span>
        </div>
        <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{experiment.description}</p>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
            <Target className="w-3 h-3" />
            实验目标
          </div>
          <ul className="space-y-1">
            {experiment.objectives.slice(0, 2).map((obj, i) => (
              <li key={i} className="text-sm flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--text)' }} />
                <span className="line-clamp-1">{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
            <BookOpen className="w-3 h-3" />
            核心公式
          </div>
          <div className="flex flex-wrap gap-1.5">
            {experiment.principles.slice(0, 2).map((p, i) => (
              <span key={i} className="formula text-xs py-0.5 px-2">{p}</span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
            <Wrench className="w-3 h-3" />
            实验器材
          </div>
          <p className="text-sm line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
            {experiment.equipment.join('、')}
          </p>
        </div>
      </div>

      <div className="px-4 py-2.5 flex items-center justify-between" style={{
        backgroundColor: 'var(--elevated)',
        borderTop: '1px solid var(--border)'
      }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {experiment.duration}
          </span>
          {experiment.tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="tag">{tag}</span>
          ))}
        </div>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>进入实验 →</span>
      </div>
    </Link>
  )
}

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>()
  const category = getCategoryById(categoryId || '')
  const experiments = getExperimentsByCategory(categoryId || '')

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-4" style={{ color: 'var(--text)' }}>分类不存在</h2>
          <Link to="/" className="hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>返回首页</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 返回链接 */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm mb-6 hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          返回实验大厅
        </Link>

        {/* 分类头部 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: 'var(--accent-bg)' }}
            >
              {category.icon === 'atom' && '⚛️'}
              {category.icon === 'zap' && '⚡'}
              {category.icon === 'sun' && '☀️'}
              {category.icon === 'thermometer' && '🌡️'}
              {category.icon === 'sparkles' && '✨'}
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{category.name}</h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{category.description}</p>
            </div>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>共 {experiments.length} 个实验</p>
        </div>

        {/* 实验列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiments.map((experiment) => (
            <ExperimentCard key={experiment.id} experiment={experiment} />
          ))}
        </div>

        {experiments.length === 0 && (
          <div className="text-center py-16">
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>该分类暂无实验</p>
            <Link to="/" className="hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>返回首页</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryPage
