import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Package, Heart, Award, Settings, LogOut, ChevronRight, Star, MapPin, Edit2, Leaf, TreeDeciduous, Trophy, Recycle, Target } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { useUserStore, useUIStore } from '@/store'
import { useGreenPointsStore } from '@/store/greenPointsStore'
import { useCarbonAccountStore } from '@/store/carbonAccountStore'
import { useEcoAchievementStore } from '@/store/ecoAchievementStore'
import { ECO_LEVELS } from '@/types/eco'
import { Link, Navigate } from 'react-router-dom'

const menuItems = [
  { icon: Leaf, label: '绿色积分', href: '/user/green-points' },
  { icon: TreeDeciduous, label: '碳账户', href: '/user/carbon-account' },
  { icon: Trophy, label: '排行榜', href: '/leaderboard' },
  { icon: Package, label: '我的订单', href: '/user/orders', badge: '2' },
  { icon: Heart, label: '我的收藏', href: '/user/favorites' },
  { icon: Award, label: '我的藏品', href: '/collection' },
  { icon: Settings, label: '账户设置', href: '/user/settings' },
]

export default function UserCenterPage() {
  const { isAuthenticated, user, logout } = useUserStore()
  const { openLoginModal } = useUIStore()
  const [activeTab, setActiveTab] = useState('overview')
  
  // 绿色积分系统
  const { totalPoints, currentLevel: ecoLevel, getLevelProgress } = useGreenPointsStore()
  const ecoLevelInfo = ECO_LEVELS[ecoLevel]
  const ecoProgress = getLevelProgress()
  
  // 碳账户系统
  const { totalCarbonSaved, getEquivalentMetrics, milestones } = useCarbonAccountStore()
  const equivalent = getEquivalentMetrics()
  const unlockedMilestones = milestones.filter(m => m.unlocked)
  
  // 生态成就系统
  const { achievements } = useEcoAchievementStore()
  const unlockedAchievements = achievements.filter(a => a.unlocked)

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const levelProgress = user?.experience ? (user.experience % 1000) / 10 : 0

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
            {/* 绿色积分卡片 */}
            <Card variant="eco" className="p-6 bg-gradient-to-br from-eco-50 to-bamboo-50 border-eco-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-eco-800 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-eco-600" />
                  绿色积分
                </h2>
                <Link to="/user/green-points" className="text-sm text-eco-600 hover:underline">
                  查看详情
                </Link>
              </div>
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{ecoLevelInfo.icon}</span>
                  <div>
                    <div className="text-2xl font-bold text-eco-700">{totalPoints}</div>
                    <div className="text-sm text-eco-600">{ecoLevelInfo.name}</div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-eco-600">升级进度</span>
                    <span className="text-eco-700 font-medium">
                      {ecoProgress.next ? `${Math.round(ecoProgress.progress * 100)}%` : '已满级'}
                    </span>
                  </div>
                  <div className="h-2 bg-eco-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ecoProgress.progress * 100}%` }}
                      className="h-full bg-gradient-to-r from-eco-500 to-bamboo-500"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-eco-200">
                {ecoLevelInfo.benefits.slice(0, 3).map((benefit, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xs text-eco-600">{benefit}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 碳账户卡片 */}
            <Card variant="carbon" className="p-6 bg-gradient-to-br from-carbon-50 to-eco-50 border-carbon-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-carbon-800 flex items-center gap-2">
                  <TreeDeciduous className="w-5 h-5 text-carbon-600" />
                  碳账户
                </h2>
                <Link to="/user/carbon-account" className="text-sm text-carbon-600 hover:underline">
                  查看详情
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-white/60 rounded-xl">
                  <div className="text-2xl font-bold text-eco-600">
                    {totalCarbonSaved >= 1000 ? `${(totalCarbonSaved / 1000).toFixed(1)}kg` : `${totalCarbonSaved}g`}
                  </div>
                  <div className="text-xs text-carbon-500">累计碳减排</div>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-xl">
                  <div className="text-2xl font-bold text-eco-600">{equivalent.treesPlanted}</div>
                  <div className="text-xs text-carbon-500">等效种树</div>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-xl">
                  <div className="text-2xl font-bold text-eco-600">{equivalent.kmNotDriven}</div>
                  <div className="text-xs text-carbon-500">不开车公里</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-carbon-600">
                <Target className="w-4 h-4" />
                <span>已解锁 {unlockedMilestones.length} 个碳减排里程碑</span>
              </div>
            </Card>

            {/* 生态成就徽章 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-ink-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  生态成就
                </h2>
                <Link to="/collection" className="text-sm text-primary-600 hover:underline">
                  查看全部
                </Link>
              </div>
              {unlockedAchievements.length > 0 ? (
                <div className="grid grid-cols-4 gap-4">
                  {unlockedAchievements.slice(0, 8).map((achievement) => (
                    <div key={achievement.id} className="text-center group">
                      <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-eco-100 to-bamboo-100 flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
                        {achievement.icon}
                      </div>
                      <div className="text-xs text-ink-600 truncate">{achievement.name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-ink-400">
                  <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>完成体验解锁成就</p>
                </div>
              )}
            </Card>

            {/* 排行榜入口 */}
            <Link to="/leaderboard">
              <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-ink-900">生态排行榜</h3>
                      <p className="text-sm text-ink-500">查看你的生态贡献排名</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-ink-400" />
                </div>
              </Card>
            </Link>

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
