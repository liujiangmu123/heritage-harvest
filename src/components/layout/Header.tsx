import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Leaf,
  Home,
  Compass,
  Palette,
  Image,
  User,
  Coins
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGreenPointsStore } from '@/store/greenPointsStore'

// V2 简化导航：仅保留 5 个核心入口
const navLinks = [
  { href: '/', label: '首页', icon: Home, scrollTo: null },
  { href: '/', label: '体验', icon: Compass, scrollTo: 'experiences' },
  { href: '/experience/ai-polaroid', label: '创作', icon: Palette, scrollTo: null },
  { href: '/creative-gallery', label: '画廊', icon: Image, scrollTo: null },
  { href: '/user', label: '我的', icon: User, scrollTo: null },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const { totalPoints } = useGreenPointsStore()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 关闭移动端菜单当路由变化时
  useEffect(() => {
    if (isMenuOpen) setIsMenuOpen(false)
  }, [location.pathname])

  // 检查当前路径是否匹配导航项
  const isActiveLink = (href: string) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/20'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-eco-500 to-eco-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <Leaf className="w-5 h-5 lg:w-5 lg:h-5 text-white" />
              </div>
            </div>
            <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-eco-600 to-eco-500 bg-clip-text text-transparent">
              乡遗识
            </span>
          </Link>

          {/* Desktop Navigation - 简洁的 5 个入口 */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={(e) => {
                  if (link.scrollTo) {
                    e.preventDefault()
                    // 如果不在首页，先导航到首页
                    if (location.pathname !== '/') {
                      window.location.href = '/#/' + '#' + link.scrollTo
                    } else {
                      // 在首页，直接滚动
                      const element = document.getElementById(link.scrollTo)
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' })
                      }
                    }
                  }
                }}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  isActiveLink(link.href)
                    ? 'text-eco-600 bg-eco-50'
                    : 'text-ink-600 hover:text-eco-600 hover:bg-eco-50/50'
                )}
              >
                {link.label}
                {isActiveLink(link.href) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-eco-500 rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions - 简洁的积分显示 */}
          <div className="flex items-center gap-3">
            {/* 绿色积分入口 - 简化为图标+数字 */}
            <Link
              to="/user"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-eco-50 hover:bg-eco-100 transition-colors"
            >
              <Coins className="w-4 h-4 text-eco-500" />
              <span className="text-sm font-semibold text-eco-600">{totalPoints}</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-ink-500 hover:text-eco-600 hover:bg-eco-50 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - 简洁版 */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl shadow-lg border-t border-ink-100"
          >
            <nav className="flex flex-col p-3 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={(e) => {
                    if (link.scrollTo) {
                      e.preventDefault()
                      setIsMenuOpen(false)
                      if (location.pathname !== '/') {
                        window.location.href = '/#/' + '#' + link.scrollTo
                      } else {
                        const element = document.getElementById(link.scrollTo)
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' })
                        }
                      }
                    }
                  }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                    isActiveLink(link.href)
                      ? 'bg-eco-50 text-eco-600'
                      : 'text-ink-600 hover:bg-ink-50'
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
