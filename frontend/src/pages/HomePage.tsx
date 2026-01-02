import { Link } from 'react-router-dom'
import { categories, getFeaturedExperiments, type Experiment } from '../store/experiments'
import { Atom, Zap, Sun, Thermometer, Sparkles, Clock, ArrowRight, Beaker, BarChart3, Cpu } from 'lucide-react'

const categoryIcons: Record<string, React.ReactNode> = {
  mechanics: <Atom className="w-6 h-6" />,
  electromagnetism: <Zap className="w-6 h-6" />,
  optics: <Sun className="w-6 h-6" />,
  thermodynamics: <Thermometer className="w-6 h-6" />,
  modern: <Sparkles className="w-6 h-6" />
}

const difficultyConfig = {
  easy: { label: '基础', class: 'tag-success' },
  medium: { label: '中等', class: 'tag-warning' },
  hard: { label: '进阶', class: 'tag-error' }
}

const ExperimentCard = ({ experiment }: { experiment: Experiment }) => {
  const difficulty = difficultyConfig[experiment.difficulty]
  return (
    <Link
      to={`/experiment/${experiment.id}`}
      className="card p-4 block transition-all group"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium transition-colors" style={{ color: 'var(--text)' }}>
          {experiment.name}
        </h3>
        <span className={`tag ${difficulty.class}`}>{difficulty.label}</span>
      </div>
      <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{experiment.description}</p>
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {experiment.duration}
        </span>
        <span className="tag">{experiment.category}</span>
      </div>
    </Link>
  )
}

const HomePage = () => {
  const featuredExperiments = getFeaturedExperiments()

  return (
    <div>
      {/* Hero */}
      <section className="py-16 px-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <svg viewBox="0 0 64 64" className="w-16 h-16">
              <circle cx="32" cy="32" r="5" fill="var(--text)" />
              <ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="var(--text)" strokeWidth="2" transform="rotate(-30 32 32)" />
              <ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="var(--text-secondary)" strokeWidth="2" transform="rotate(30 32 32)" />
              <ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="var(--text-muted)" strokeWidth="2" transform="rotate(90 32 32)" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--text)' }}>
            PhysicsLab
          </h1>
          <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>高中物理虚拟实验室</p>
          <p className="max-w-2xl mx-auto mb-8" style={{ color: 'var(--text-muted)' }}>
            涵盖人教版高中物理教材全部实验，通过交互式模拟帮助你深入理解物理原理。
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/category/mechanics" className="btn btn-primary">
              开始实验
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#categories" className="btn btn-secondary">浏览分类</a>
          </div>

          {/* 统计 */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-12">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>21</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>实验项目</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>5</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>实验分类</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>13</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>交互模拟</div>
            </div>
          </div>
        </div>
      </section>

      {/* 分类 */}
      <section id="categories" className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>实验分类</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="card p-4 text-center transition-all group"
              >
                <div
                  className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--text)' }}
                >
                  {categoryIcons[category.id]}
                </div>
                <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>{category.name}</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{category.experimentCount} 个实验</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 推荐实验 */}
      <section className="py-12 px-4" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>推荐实验</h2>
            <Link
              to="/category/mechanics"
              className="text-sm flex items-center gap-1 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
            >
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredExperiments.map((experiment) => (
              <ExperimentCard key={experiment.id} experiment={experiment} />
            ))}
          </div>
        </div>
      </section>

      {/* 特点 */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold mb-6 text-center" style={{ color: 'var(--text)' }}>平台特点</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <Beaker className="w-5 h-5" />, title: '交互式模拟', desc: '拖拽调整参数，实时观察物理现象' },
              { icon: <BarChart3 className="w-5 h-5" />, title: '数据分析', desc: '自动采集数据，生成专业图表' },
              { icon: <Cpu className="w-5 h-5" />, title: '边缘加速', desc: '阿里云ESA边缘节点，毫秒级响应' }
            ].map((feature) => (
              <div key={feature.title} className="card p-5">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--text)' }}
                >
                  {feature.icon}
                </div>
                <h3 className="font-medium mb-1" style={{ color: 'var(--text)' }}>{feature.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4" style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text)' }}>开始你的物理实验之旅</h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>无需安装，打开浏览器即可开始。完全免费，随时随地学习物理。</p>
          <Link to="/category/mechanics" className="btn btn-primary">
            <Beaker className="w-4 h-4" />
            立即开始
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
