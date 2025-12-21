import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, Medal, Crown, Leaf, TreeDeciduous, Share2, 
  TrendingUp, Calendar, Award, ChevronUp, ChevronDown
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useGreenPointsStore } from '@/store/greenPointsStore'
import { useCarbonAccountStore } from '@/store/carbonAccountStore'
import { useUserStore } from '@/store'
import { ECO_LEVELS, type EcoLevel } from '@/types/eco'

type LeaderboardPeriod = 'weekly' | 'monthly' | 'all-time'
type LeaderboardMetric = 'points' | 'carbon' | 'experiences' | 'shares'

interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  userAvatar: string
  ecoLevel: EcoLevel
  points: number
  carbonSaved: number
  experiencesCompleted: number
  sharesCount: number
  trend: 'up' | 'down' | 'same'
  trendValue?: number
}

// 模拟排行榜数据
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: '1',
    userName: '绿色先锋',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    ecoLevel: 'master',
    points: 2850,
    carbonSaved: 45000,
    experiencesCompleted: 28,
    sharesCount: 56,
    trend: 'same',
  },
  {
    rank: 2,
    userId: '2',
    userName: '生态守护者',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    ecoLevel: 'guardian',
    points: 2340,
    carbonSaved: 38000,
    experiencesCompleted: 24,
    sharesCount: 42,
    trend: 'up',
    trendValue: 2,
  },
  {
    rank: 3,
    userId: '3',
    userName: '环保达人',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    ecoLevel: 'guardian',
    points: 1980,
    carbonSaved: 32000,
    experiencesCompleted: 20,
    sharesCount: 35,
    trend: 'up',
    trendValue: 1,
  },
  {
    rank: 4,
    userId: '4',
    userName: '绿色使者',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    ecoLevel: 'sprout',
    points: 1560,
    carbonSaved: 25000,
    experiencesCompleted: 16,
    sharesCount: 28,
    trend: 'down',
    trendValue: 1,
  },
  {
    rank: 5,
    userId: '5',
    userName: '生态新星',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    ecoLevel: 'sprout',
    points: 1280,
    carbonSaved: 20000,
    experiencesCompleted: 14,
    sharesCount: 22,
    trend: 'up',
    trendValue: 3,
  },
  {
    rank: 6,
    userId: '6',
    userName: '环保小能手',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    ecoLevel: 'sprout',
    points: 980,
    carbonSaved: 15000,
    experiencesCompleted: 12,
    sharesCount: 18,
    trend: 'same',
  },
  {
    rank: 7,
    userId: '7',
    userName: '绿色行者',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    ecoLevel: 'seedling',
    points: 720,
    carbonSaved: 11000,
    experiencesCompleted: 9,
    sharesCount: 14,
    trend: 'up',
    trendValue: 2,
  },
  {
    rank: 8,
    userId: '8',
    userName: '生态学徒',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
    ecoLevel: 'seedling',
    points: 540,
    carbonSaved: 8000,
    experiencesCompleted: 7,
    sharesCount: 10,
    trend: 'down',
    trendValue: 2,
  },
  {
    rank: 9,
    userId: '9',
    userName: '环保新人',
    userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
    ecoLevel: 'seedling',
    points: 380,
    carbonSaved: 5500,
    experiencesCompleted: 5,
    sharesCount: 6,
    trend: 'same',
  },
  {
    rank: 10,
    userId: '10',
    userName: '绿色萌新',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
    ecoLevel: 'seedling',
    points: 220,
    carbonSaved: 3200,
    experiencesCompleted: 3,
    sharesCount: 4,
    trend: 'up',
    trendValue: 5,
  },
]

const PERIOD_LABELS: Record<LeaderboardPeriod, string> = {
  'weekly': '周榜',
  'monthly': '月榜',
  'all-time': '总榜',
}

const METRIC_LABELS: Record<LeaderboardMetric, { label: string; icon: typeof Trophy }> = {
  'points': { label: '绿色积分', icon: Leaf },
  'carbon': { label: '碳减排', icon: TreeDeciduous },
  'experiences': { label: '体验完成', icon: Award },
  'shares': { label: '分享次数', icon: Share2 },
}

// 排名图标组件
function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) {
    return <Crown className="w-6 h-6 text-amber-500" />
  }
  if (rank === 2) {
    return <Medal className="w-6 h-6 text-gray-400" />
  }
  if (rank === 3) {
    return <Medal className="w-6 h-6 text-amber-700" />
  }
  return (
    <span className="w-6 h-6 flex items-center justify-center text-ink-500 font-bold">
      {rank}
    </span>
  )
}

// 趋势指示器
function TrendIndicator({ trend, value }: { trend: 'up' | 'down' | 'same'; value?: number }) {
  if (trend === 'same') {
    return <span className="text-xs text-ink-400">-</span>
  }
  if (trend === 'up') {
    return (
      <span className="flex items-center text-xs text-eco-600">
        <ChevronUp className="w-3 h-3" />
        {value}
      </span>
    )
  }
  return (
    <span className="flex items-center text-xs text-red-500">
      <ChevronDown className="w-3 h-3" />
      {value}
    </span>
  )
}

// 排行榜条目组件
function LeaderboardItem({ entry, metric, isCurrentUser }: { 
  entry: LeaderboardEntry
  metric: LeaderboardMetric
  isCurrentUser: boolean 
}) {
  const levelInfo = ECO_LEVELS[entry.ecoLevel]
  
  const getValue = () => {
    switch (metric) {
      case 'points': return entry.points
      case 'carbon': return `${(entry.carbonSaved / 1000).toFixed(1)}kg`
      case 'experiences': return entry.experiencesCompleted
      case 'shares': return entry.sharesCount
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
        isCurrentUser 
          ? 'bg-eco-50 border-2 border-eco-300' 
          : entry.rank <= 3 
            ? 'bg-gradient-to-r from-amber-50 to-orange-50' 
            : 'bg-white hover:bg-gray-50'
      }`}
    >
      {/* 排名 */}
      <div className="w-8 flex-shrink-0">
        <RankIcon rank={entry.rank} />
      </div>

      {/* 头像 */}
      <div className="relative">
        <img
          src={entry.userAvatar}
          alt={entry.userName}
          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
        />
        <span className="absolute -bottom-1 -right-1 text-lg">{levelInfo.icon}</span>
      </div>

      {/* 用户信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-ink-900 truncate">{entry.userName}</span>
          {isCurrentUser && (
            <Badge variant="eco" className="text-xs">我</Badge>
          )}
        </div>
        <div className="text-sm text-ink-500">{levelInfo.name}</div>
      </div>

      {/* 趋势 */}
      <div className="w-8 flex-shrink-0 text-center">
        <TrendIndicator trend={entry.trend} value={entry.trendValue} />
      </div>

      {/* 数值 */}
      <div className="text-right">
        <div className="font-bold text-eco-600">{getValue()}</div>
        <div className="text-xs text-ink-400">{METRIC_LABELS[metric].label}</div>
      </div>
    </motion.div>
  )
}

interface EcoLeaderboardProps {
  className?: string
  compact?: boolean
}

export default function EcoLeaderboard({ className = '', compact = false }: EcoLeaderboardProps) {
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly')
  const [metric, setMetric] = useState<LeaderboardMetric>('points')
  
  const { user } = useUserStore()
  const { totalPoints } = useGreenPointsStore()
  const { totalCarbonSaved } = useCarbonAccountStore()

  // 排序后的排行榜数据
  const sortedLeaderboard = useMemo(() => {
    const data = [...MOCK_LEADERBOARD]
    
    // 根据指标排序
    data.sort((a, b) => {
      switch (metric) {
        case 'points': return b.points - a.points
        case 'carbon': return b.carbonSaved - a.carbonSaved
        case 'experiences': return b.experiencesCompleted - a.experiencesCompleted
        case 'shares': return b.sharesCount - a.sharesCount
      }
    })

    // 更新排名
    return data.map((entry, index) => ({ ...entry, rank: index + 1 }))
  }, [metric])

  // 当前用户的排名（模拟）
  const currentUserRank = useMemo(() => {
    if (!user) return null
    
    // 模拟当前用户数据
    return {
      rank: 15,
      userId: user.id,
      userName: user.nickname || user.name,
      userAvatar: user.avatar,
      ecoLevel: 'sprout' as EcoLevel,
      points: totalPoints,
      carbonSaved: totalCarbonSaved,
      experiencesCompleted: 8,
      sharesCount: 12,
      trend: 'up' as const,
      trendValue: 3,
    }
  }, [user, totalPoints, totalCarbonSaved])

  const displayData = compact ? sortedLeaderboard.slice(0, 5) : sortedLeaderboard

  return (
    <div className={`${className}`}>
      {/* 标题和筛选 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink-900">生态排行榜</h2>
            <p className="text-sm text-ink-500">与其他生态守护者一起竞争</p>
          </div>
        </div>

        {!compact && (
          <div className="flex gap-2">
            {/* 时间周期切换 */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(Object.keys(PERIOD_LABELS) as LeaderboardPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    period === p
                      ? 'bg-white text-eco-600 shadow-sm'
                      : 'text-ink-500 hover:text-ink-700'
                  }`}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 指标切换 */}
      {!compact && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(Object.keys(METRIC_LABELS) as LeaderboardMetric[]).map((m) => {
            const { label, icon: Icon } = METRIC_LABELS[m]
            return (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  metric === m
                    ? 'bg-eco-500 text-white'
                    : 'bg-eco-50 text-eco-700 hover:bg-eco-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            )
          })}
        </div>
      )}

      {/* 排行榜列表 */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {displayData.map((entry, index) => (
            <LeaderboardItem
              key={entry.userId}
              entry={entry}
              metric={metric}
              isCurrentUser={user?.id === entry.userId}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 当前用户排名（如果不在前10） */}
      {currentUserRank && currentUserRank.rank > 10 && !compact && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-ink-500 mb-2">我的排名</div>
          <LeaderboardItem
            entry={currentUserRank}
            metric={metric}
            isCurrentUser={true}
          />
        </div>
      )}

      {/* 查看更多 */}
      {compact && (
        <div className="mt-4 text-center">
          <a
            href="/leaderboard"
            className="text-sm text-eco-600 hover:text-eco-700 font-medium"
          >
            查看完整排行榜 →
          </a>
        </div>
      )}
    </div>
  )
}
