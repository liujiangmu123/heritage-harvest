import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Phone, Sparkles, ArrowRight } from 'lucide-react'
import { useUIStore, useUserStore } from '@/store'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

type AuthMode = 'login' | 'register' | 'phone'

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal } = useUIStore()
  const { login } = useUserStore()
  const [mode, setMode] = useState<AuthMode>('login')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // 模拟登录
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模拟用户数据
    login({
      id: '1',
      nickname: '文化守护者',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      email: 'user@example.com',
      level: 3,
      experience: 2500,
      fragments: [],
      badges: [],
      collectibles: [],
      orders: [],
      favorites: [],
      createdAt: new Date().toISOString(),
    })
    
    setIsLoading(false)
    closeLoginModal()
  }

  const socialLogins = [
    { icon: '📱', name: '微信', color: 'bg-green-500' },
    { icon: '📧', name: '邮箱', color: 'bg-blue-500' },
    { icon: '🔑', name: '手机号', color: 'bg-orange-500' },
  ]

  return (
    <AnimatePresence>
      {isLoginModalOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLoginModal}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* 模态框 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* 关闭按钮 */}
              <button
                onClick={closeLoginModal}
                className="absolute top-4 right-4 z-10 p-2 rounded-lg text-ink-400 hover:text-ink-600 hover:bg-ink-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* 头部装饰 */}
              <div className="relative h-32 bg-gradient-to-br from-heritage-400 via-primary-500 to-heritage-500 overflow-hidden">
                <div className="absolute inset-0 pattern-overlay opacity-20" />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                </motion.div>
              </div>

              {/* 内容 */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-center text-ink-900 mb-2">
                  {mode === 'login' ? '欢迎回来' : mode === 'register' ? '加入我们' : '手机登录'}
                </h2>
                <p className="text-center text-ink-500 mb-6">
                  {mode === 'login' 
                    ? '登录后开启您的文化探索之旅' 
                    : mode === 'register' 
                    ? '成为非遗文化的传承者'
                    : '使用手机号快速登录'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <Input
                      label="昵称"
                      placeholder="给自己取个文化范的名字"
                      icon={<User className="w-5 h-5" />}
                    />
                  )}

                  {mode === 'phone' ? (
                    <>
                      <Input
                        label="手机号"
                        type="tel"
                        placeholder="请输入手机号"
                        icon={<Phone className="w-5 h-5" />}
                      />
                      <div className="flex gap-3">
                        <Input
                          placeholder="验证码"
                          className="flex-1"
                        />
                        <Button type="button" variant="outline" className="shrink-0">
                          获取验证码
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Input
                        label="邮箱"
                        type="email"
                        placeholder="请输入邮箱地址"
                        icon={<Mail className="w-5 h-5" />}
                      />
                      <Input
                        label="密码"
                        type="password"
                        placeholder="请输入密码"
                        icon={<Lock className="w-5 h-5" />}
                      />
                    </>
                  )}

                  {mode === 'login' && (
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-ink-300" />
                        <span className="text-ink-500">记住我</span>
                      </label>
                      <button type="button" className="text-primary-600 hover:underline">
                        忘记密码？
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="heritage"
                    className="w-full"
                    size="lg"
                    isLoading={isLoading}
                  >
                    {mode === 'login' ? '登录' : mode === 'register' ? '注册' : '登录'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>

                {/* 分割线 */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-ink-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-ink-400">或使用其他方式</span>
                  </div>
                </div>

                {/* 社交登录 */}
                <div className="flex justify-center gap-4">
                  {socialLogins.map((social) => (
                    <button
                      key={social.name}
                      type="button"
                      onClick={() => {
                        if (social.name === '手机号') setMode('phone')
                      }}
                      className="w-12 h-12 rounded-xl bg-ink-100 hover:bg-ink-200 flex items-center justify-center text-xl transition-colors"
                      title={social.name}
                    >
                      {social.icon}
                    </button>
                  ))}
                </div>

                {/* 切换模式 */}
                <p className="text-center text-sm text-ink-500 mt-6">
                  {mode === 'login' ? (
                    <>
                      还没有账号？{' '}
                      <button
                        type="button"
                        onClick={() => setMode('register')}
                        className="text-primary-600 font-medium hover:underline"
                      >
                        立即注册
                      </button>
                    </>
                  ) : (
                    <>
                      已有账号？{' '}
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-primary-600 font-medium hover:underline"
                      >
                        立即登录
                      </button>
                    </>
                  )}
                </p>

                {/* 协议 */}
                <p className="text-center text-xs text-ink-400 mt-4">
                  登录即表示您同意我们的{' '}
                  <a href="/terms" className="text-primary-600 hover:underline">用户协议</a>
                  {' '}和{' '}
                  <a href="/privacy" className="text-primary-600 hover:underline">隐私政策</a>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
