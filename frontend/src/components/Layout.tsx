import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Atom, Zap, Sun, Thermometer, Sparkles, Moon } from 'lucide-react'
import { useTheme } from '../store/theme'

const Layout = () => {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const navItems = [
    { path: '/', label: '实验大厅', icon: null },
    { path: '/category/mechanics', label: '力学', icon: <Atom className="w-4 h-4" /> },
    { path: '/category/electromagnetism', label: '电磁学', icon: <Zap className="w-4 h-4" /> },
    { path: '/category/optics', label: '光学', icon: <Sun className="w-4 h-4" /> },
    { path: '/category/thermodynamics', label: '热学', icon: <Thermometer className="w-4 h-4" /> },
    { path: '/category/modern', label: '近代物理', icon: <Sparkles className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 backdrop-blur" style={{
        backgroundColor: theme === 'dark' ? 'rgba(17, 17, 17, 0.95)' : 'rgba(250, 250, 250, 0.95)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <svg viewBox="0 0 32 32" className="w-7 h-7">
                <circle cx="16" cy="16" r="3" fill="var(--text)" />
                <ellipse cx="16" cy="16" rx="14" ry="5" fill="none" stroke="var(--text)" strokeWidth="1.5"
                  transform="rotate(-30 16 16)" />
                <ellipse cx="16" cy="16" rx="14" ry="5" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"
                  transform="rotate(30 16 16)" />
                <ellipse cx="16" cy="16" rx="14" ry="5" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"
                  transform="rotate(90 16 16)" />
              </svg>
              <span className="font-semibold" style={{ color: 'var(--text)' }}>PhysicsLab</span>
            </Link>

            {/* 桌面导航 */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path))
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors"
                    style={{
                      backgroundColor: isActive ? 'var(--card)' : 'transparent',
                      color: isActive ? 'var(--text)' : 'var(--text-secondary)',
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* 主题切换和移动端菜单 */}
            <div className="flex items-center gap-2">
              {/* 主题切换按钮 */}
              <button
                onClick={toggleTheme}
                className="theme-toggle"
                title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* 移动端菜单按钮 */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden icon-btn"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden" style={{
            backgroundColor: 'var(--surface)',
            borderTop: '1px solid var(--border)'
          }}>
            <nav className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path))
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm rounded transition-colors"
                    style={{
                      backgroundColor: isActive ? 'var(--card)' : 'transparent',
                      color: isActive ? 'var(--text)' : 'var(--text-secondary)',
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </header>

      {/* 主内容 */}
      <main className="min-h-[calc(100vh-56px)]">
        <Outlet />
      </main>

      {/* 底部 */}
      <footer className="py-6" style={{
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <svg viewBox="0 0 32 32" className="w-5 h-5">
                <circle cx="16" cy="16" r="3" fill="var(--text)" />
                <ellipse cx="16" cy="16" rx="14" ry="5" fill="none" stroke="var(--text)" strokeWidth="1.5"
                  transform="rotate(-30 16 16)" />
              </svg>
              <span>PhysicsLab - 高中物理虚拟实验室</span>
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Powered by</span>
              <a
                href="https://www.aliyun.com/product/esa"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
              >
                阿里云 ESA Pages
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
