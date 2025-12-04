import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Package, Heart, Award, Settings, LogOut, ChevronRight, Star, MapPin, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { useUserStore, useUIStore } from '@/store'
import { Link, Navigate } from 'react-router-dom'

const menuItems = [
  { icon: Package, label: '我的订单', href: '/user/orders', badge: '2' },
  { icon: Heart, label: '我的收藏', href: '/user/favorites' },
  { icon: Award, label: '我的藏品', href: '/collection' },
  { icon: Settings, label: '账户设置', href: '/user/settings' },
]

export default function UserCenterPage() {
  const { isAuthenticated, user, logout } = useUserStore()
  const { openLoginModal } = useUIStore()
  const [activeTab, setActiveTab] = useState('overview')

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const levelProgress = user ? (user.experience % 1000) / 10 : 0

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 用户信息卡片 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="heritage" className="p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* 头像 */}
              <div className="relative">
                <img
                  src={user?.avatar || '/avatars/default.png'}
                  alt={user?.nickname}
                  className="w-28 h-28 rounded-2xl object-cover border-4 border-heritage-300"
                />
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-heritage-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* 用户信息 */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-ink-900">{user?.nickname}</h1>
                  <Badge variant="heritage">Lv.{user?.level}</Badge>
                </div>
                <p className="text-ink-500 mb-4">{user?.email}</p>

                {/* 经验进度 */}
                <div className="max-w-md">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-ink-500">成长进度</span>
                    <span className="text-heritage-600 font-medium">{user?.experience} / {(user?.level || 1) * 1000}</span>
                  </div>
                  <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${levelProgress}%` }}
                      className="h-full bg-gradient-to-r from-heritage-500 to-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* 统计数据 */}
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-heritage-600">{user?.fragments?.length || 0}</div>
                  <div className="text-sm text-ink-500">碎片</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-heritage-600">{user?.badges?.length || 0}</div>
                  <div className="text-sm text-ink-500">徽章</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-heritage-600">{user?.orders?.length || 0}</div>
                  <div className="text-sm text-ink-500">订单</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* 左侧菜单 */}
          <div className="md:col-span-1">
            <Card className="p-4">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-primary-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-ink-400 group-hover:text-primary-600" />
                      <span className="text-ink-700 group-hover:text-primary-600">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-primary-100 text-primary-600 text-xs rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-ink-300" />
                    </div>
                  </Link>
                ))}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-red-500"
                >
                  <LogOut className="w-5 h-5" />
                  <span>退出登录</span>
                </button>
              </nav>
            </Card>
          </div>

          {/* 右侧内容 */}
          <div className="md:col-span-2 space-y-6">
            {/* 我的藏品预览 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-ink-900">我的藏品</h2>
                <Link to="/collection" className="text-sm text-primary-600 hover:underline">
                  查看全部
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square rounded-xl bg-ink-100 flex items-center justify-center">
                    <Award className="w-10 h-10 text-ink-300" />
                  </div>
                ))}
              </div>
            </Card>

            {/* 最近订单 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-ink-900">最近订单</h2>
                <Link to="/user/orders" className="text-sm text-primary-600 hover:underline">
                  查看全部
                </Link>
              </div>
              <div className="text-center py-8 text-ink-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无订单</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
