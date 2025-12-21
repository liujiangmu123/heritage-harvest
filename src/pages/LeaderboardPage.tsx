import { motion } from 'framer-motion'
import EcoLeaderboard from '@/components/eco/EcoLeaderboard'
import { Card } from '@/components/ui/Card'
import { Trophy, Users, TrendingUp, Award } from 'lucide-react'

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full mb-4">
            <Trophy className="w-5 h-5" />
            <span className="font-medium">生态排行榜</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-ink-900 mb-3">
            与<span className="text-eco-600">生态守护者</span>一起竞争
          </h1>
          <p className="text-ink-500 max-w-2xl mx-auto">
            通过学习、体验、分享积累绿色积分，成为生态文明的先锋
          </p>
        </motion.div>

        {/* 统计卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <Card className="p-4 text-center bg-gradient-to-br from-eco-50 to-bamboo-50">
            <Users className="w-6 h-6 mx-auto text-eco-600 mb-2" />
            <div className="text-2xl font-bold text-ink-900">1,234</div>
            <div className="text-sm text-ink-500">参与用户</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-amber-50 to-orange-50">
            <TrendingUp className="w-6 h-6 mx-auto text-amber-600 mb-2" />
            <div className="text-2xl font-bold text-ink-900">45.6kg</div>
            <div className="text-sm text-ink-500">本周碳减排</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-pink-50">
            <Award className="w-6 h-6 mx-auto text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-ink-900">328</div>
            <div className="text-sm text-ink-500">成就解锁</div>
          </Card>
        </motion.div>

        {/* 排行榜 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <EcoLeaderboard />
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
