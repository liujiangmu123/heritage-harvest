import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sun, Cloud, Droplets, Leaf, Snowflake, Wind,
  Calendar, Clock, Award, Gift, ChevronRight, X,
  Star, Users, Zap, TreeDeciduous
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useGreenPointsStore } from '@/store/greenPointsStore'
import { useEcoAchievementStore } from '@/store/ecoAchievementStore'
import { Link } from 'react-router-dom'

/** 节气类型 */
interface SolarTerm {
  id: string
  name: string
  englishName: string
  date: string // MM-DD 格式
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  description: string
  ecoTheme: string
  heritage: string
  heritageLink: string
  activities: string[]
  rewards: {
    points: number
    badge?: string
    nft?: boolean
  }
}

/** 二十四节气数据 */
const SOLAR_TERMS: SolarTerm[] = [
  // 春季
  {
    id: 'lichun',
    name: '立春',
    englishName: 'Start of Spring',
    date: '02-04',
    season: 'spring',
    description: '春季开始，万物复苏',
    ecoTheme: '播种希望',
    heritage: '藤编工艺',
    heritageLink: '/experience/bamboo-weaving',
    activities: ['学习春季播种知识', '体验藤编春篮制作', '发布春季环保承诺'],
    rewards: { points: 100, badge: '立春守护者' }
  },
  {
    id: 'yushui',
    name: '雨水',
    englishName: 'Rain Water',
    date: '02-19',
    season: 'spring',
    description: '降雨开始，雨量渐增',
    ecoTheme: '水循环智慧',
    heritage: '哈尼梯田',
    heritageLink: '/experience/hani-terrace',
    activities: ['探索梯田水循环系统', '学习雨水收集利用', '参与水资源保护问答'],
    rewards: { points: 120, badge: '雨水使者' }
  },
  {
    id: 'jingzhe',
    name: '惊蛰',
    englishName: 'Awakening of Insects',
    date: '03-06',
    season: 'spring',
    description: '春雷惊醒蛰伏的昆虫',
    ecoTheme: '生物多样性',
    heritage: '茶道生态',
    heritageLink: '/experience/tea-ceremony',
    activities: ['了解茶园生态系统', '学习自然害虫控制', '探索生物多样性'],
    rewards: { points: 100, badge: '惊蛰探索者' }
  },
  {
    id: 'chunfen',
    name: '春分',
    englishName: 'Spring Equinox',
    date: '03-21',
    season: 'spring',
    description: '昼夜平分，春季过半',
    ecoTheme: '平衡之道',
    heritage: '剪纸艺术',
    heritageLink: '/experience/paper-cutting',
    activities: ['创作春分主题剪纸', '学习生态平衡知识', '分享春分环保心得'],
    rewards: { points: 150, badge: '春分守护者', nft: true }
  },
  {
    id: 'qingming',
    name: '清明',
    englishName: 'Pure Brightness',
    date: '04-05',
    season: 'spring',
    description: '天气清澈明朗',
    ecoTheme: '绿色祭扫',
    heritage: '凤翔泥塑',
    heritageLink: '/experience/fengxiang-clay',
    activities: ['体验天然材料泥塑', '学习绿色祭扫方式', '参与植树活动'],
    rewards: { points: 100, badge: '清明使者' }
  },
  {
    id: 'guyu',
    name: '谷雨',
    englishName: 'Grain Rain',
    date: '04-20',
    season: 'spring',
    description: '雨生百谷，春季最后一个节气',
    ecoTheme: '有机种植',
    heritage: '茶道生态',
    heritageLink: '/experience/tea-ceremony',
    activities: ['学习有机茶种植', '了解谷雨茶文化', '参与茶园碳汇计算'],
    rewards: { points: 120, badge: '谷雨播种者' }
  },
  // 夏季
  {
    id: 'lixia',
    name: '立夏',
    englishName: 'Start of Summer',
    date: '05-06',
    season: 'summer',
    description: '夏季开始，万物繁茂',
    ecoTheme: '节能降温',
    heritage: '藤编工艺',
    heritageLink: '/experience/bamboo-weaving',
    activities: ['体验竹编扇子制作', '学习自然降温方法', '参与节能挑战'],
    rewards: { points: 100, badge: '立夏守护者' }
  },
  {
    id: 'xiaozhi',
    name: '夏至',
    englishName: 'Summer Solstice',
    date: '06-21',
    season: 'summer',
    description: '一年中白昼最长的一天',
    ecoTheme: '太阳能利用',
    heritage: '蜡染工艺',
    heritageLink: '/experience/batik',
    activities: ['体验天然染料蜡染', '学习太阳能知识', '参与夏至环保活动'],
    rewards: { points: 150, badge: '夏至先锋', nft: true }
  },
  // 秋季
  {
    id: 'liqiu',
    name: '立秋',
    englishName: 'Start of Autumn',
    date: '08-08',
    season: 'autumn',
    description: '秋季开始，暑去凉来',
    ecoTheme: '丰收感恩',
    heritage: '哈尼梯田',
    heritageLink: '/experience/hani-terrace',
    activities: ['体验梯田丰收场景', '学习粮食节约知识', '参与感恩分享'],
    rewards: { points: 100, badge: '立秋守护者' }
  },
  {
    id: 'qiufen',
    name: '秋分',
    englishName: 'Autumn Equinox',
    date: '09-23',
    season: 'autumn',
    description: '昼夜平分，秋季过半',
    ecoTheme: '循环经济',
    heritage: '皮影戏',
    heritageLink: '/experience/shadow-puppet',
    activities: ['体验皮影戏制作', '学习循环经济理念', '参与物品交换活动'],
    rewards: { points: 150, badge: '秋分守护者', nft: true }
  },
  // 冬季
  {
    id: 'lidong',
    name: '立冬',
    englishName: 'Start of Winter',
    date: '11-08',
    season: 'winter',
    description: '冬季开始，万物收藏',
    ecoTheme: '节能保暖',
    heritage: '剪纸艺术',
    heritageLink: '/experience/paper-cutting',
    activities: ['创作冬季主题剪纸', '学习节能保暖方法', '参与冬季环保挑战'],
    rewards: { points: 100, badge: '立冬守护者' }
  },
  {
    id: 'dongzhi',
    name: '冬至',
    englishName: 'Winter Solstice',
    date: '12-22',
    season: 'winter',
    description: '一年中白昼最短的一天',
    ecoTheme: '团圆低碳',
    heritage: '凤翔泥塑',
    heritageLink: '/experience/fengxiang-clay',
    activities: ['体验冬至泥塑制作', '学习低碳过节方式', '参与冬至环保承诺'],
    rewards: { points: 150, badge: '冬至先锋', nft: true }
  }
]

/** 季节配置 */
const SEASON_CONFIG = {
  spring: { name: '春', icon: Leaf, color: 'text-eco-600 bg-eco-100', gradient: 'from-eco-400 to-bamboo-500' },
  summer: { name: '夏', icon: Sun, color: 'text-amber-600 bg-amber-100', gradient: 'from-amber-400 to-orange-500' },
  autumn: { name: '秋', icon: Wind, color: 'text-orange-600 bg-orange-100', gradient: 'from-orange-400 to-red-500' },
  winter: { name: '冬', icon: Snowflake, color: 'text-blue-600 bg-blue-100', gradient: 'from-blue-400 to-indigo-500' }
}

/** 获取当前节气 */
function getCurrentSolarTerm(): SolarTerm | null {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentDay = now.getDate()
  const currentDateStr = `${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`
  
  // 找到最近的节气
  let closestTerm: SolarTerm | null = null
  let minDiff = Infinity
  
  for (const term of SOLAR_TERMS) {
    const [month, day] = term.date.split('-').map(Number)
    const termDate = new Date(now.getFullYear(), month - 1, day)
    const diff = Math.abs(now.getTime() - termDate.getTime())
    
    if (diff < minDiff && termDate <= now) {
      minDiff = diff
      closestTerm = term
    }
  }
  
  return closestTerm
}

/** 获取下一个节气 */
function getNextSolarTerm(): SolarTerm | null {
  const now = new Date()
  
  for (const term of SOLAR_TERMS) {
    const [month, day] = term.date.split('-').map(Number)
    const termDate = new Date(now.getFullYear(), month - 1, day)
    
    if (termDate > now) {
      return term
    }
  }
  
  // 如果今年没有了，返回明年第一个
  return SOLAR_TERMS[0]
}

interface SeasonalEcoActivityProps {
  className?: string
}

export default function SeasonalEcoActivity({ className = '' }: SeasonalEcoActivityProps) {
  const [selectedTerm, setSelectedTerm] = useState<SolarTerm | null>(null)
  const [participatedTerms, setParticipatedTerms] = useState<Set<string>>(new Set())
  const [showAllTerms, setShowAllTerms] = useState(false)
  
  const { addPoints } = useGreenPointsStore()
  const { recordSeasonalActivity } = useEcoAchievementStore()
  
  const currentTerm = useMemo(() => getCurrentSolarTerm(), [])
  const nextTerm = useMemo(() => getNextSolarTerm(), [])
  
  // 计算距离下一个节气的天数
  const daysUntilNext = useMemo(() => {
    if (!nextTerm) return 0
    const now = new Date()
    const [month, day] = nextTerm.date.split('-').map(Number)
    const nextDate = new Date(now.getFullYear(), month - 1, day)
    if (nextDate < now) {
      nextDate.setFullYear(nextDate.getFullYear() + 1)
    }
    return Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }, [nextTerm])
  
  // 参与活动
  const participateActivity = (term: SolarTerm) => {
    if (participatedTerms.has(term.id)) return
    
    setParticipatedTerms(prev => new Set([...prev, term.id]))
    
    // 奖励积分
    addPoints({
      type: 'experience',
      points: term.rewards.points,
      description: `参与${term.name}节气活动`,
      relatedId: term.id
    })
    
    // 记录季节活动
    recordSeasonalActivity()
  }
  
  // 按季节分组
  const termsBySeason = useMemo(() => {
    const grouped: Record<string, SolarTerm[]> = {
      spring: [],
      summer: [],
      autumn: [],
      winter: []
    }
    SOLAR_TERMS.forEach(term => {
      grouped[term.season].push(term)
    })
    return grouped
  }, [])

  return (
    <div className={`${className}`}>
      {/* 头部 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-ink-900">二十四节气活动</h2>
            <p className="text-ink-500">跟随自然节律，体验传统生态智慧</p>
          </div>
          <Badge variant="eco" className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            已参与 {participatedTerms.size} 个节气
          </Badge>
        </div>
      </div>

      {/* 当前节气卡片 */}
      {currentTerm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className={`p-6 bg-gradient-to-br ${SEASON_CONFIG[currentTerm.season].gradient} text-white overflow-hidden relative`}>
            <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
              {(() => {
                const Icon = SEASON_CONFIG[currentTerm.season].icon
                return <Icon className="w-full h-full" />
              })()}
            </div>
            
            <Badge className="bg-white/20 text-white border-white/30 mb-4">
              当前节气
            </Badge>
            
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-3xl font-bold mb-1">{currentTerm.name}</h3>
                <p className="text-white/80 text-sm mb-4">{currentTerm.englishName}</p>
                <p className="text-white/90 mb-4">{currentTerm.description}</p>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4" />
                    <span className="text-sm">{currentTerm.ecoTheme}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    <span className="text-sm">+{currentTerm.rewards.points} 积分</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    className="bg-white text-ink-900 hover:bg-white/90"
                    onClick={() => setSelectedTerm(currentTerm)}
                  >
                    参与活动
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    asChild
                  >
                    <Link to={currentTerm.heritageLink}>
                      体验{currentTerm.heritage}
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-5xl font-bold opacity-90">
                  {SEASON_CONFIG[currentTerm.season].name}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* 下一个节气倒计时 */}
      {nextTerm && (
        <Card className="p-4 mb-8 bg-gradient-to-r from-eco-50 to-bamboo-50 border-eco-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${SEASON_CONFIG[nextTerm.season].color} flex items-center justify-center`}>
                {(() => {
                  const Icon = SEASON_CONFIG[nextTerm.season].icon
                  return <Icon className="w-6 h-6" />
                })()}
              </div>
              <div>
                <div className="text-sm text-ink-500">下一个节气</div>
                <div className="font-bold text-ink-900">{nextTerm.name} · {nextTerm.ecoTheme}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-eco-600">{daysUntilNext}</div>
              <div className="text-sm text-ink-500">天后开始</div>
            </div>
          </div>
        </Card>
      )}

      {/* 节气日历 */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-ink-900">节气日历</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAllTerms(!showAllTerms)}
        >
          {showAllTerms ? '收起' : '查看全部'}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(termsBySeason).map(([season, terms]) => {
          const config = SEASON_CONFIG[season as keyof typeof SEASON_CONFIG]
          const displayTerms = showAllTerms ? terms : terms.slice(0, 2)
          
          return (
            <Card key={season} className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                  <config.icon className="w-4 h-4" />
                </div>
                <span className="font-bold text-ink-900">{config.name}季</span>
              </div>
              
              <div className="space-y-2">
                {displayTerms.map(term => {
                  const isParticipated = participatedTerms.has(term.id)
                  const isCurrent = currentTerm?.id === term.id
                  
                  return (
                    <button
                      key={term.id}
                      onClick={() => setSelectedTerm(term)}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        isCurrent 
                          ? `bg-gradient-to-r ${config.gradient} text-white`
                          : isParticipated
                            ? 'bg-eco-50 border border-eco-200'
                            : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`font-medium ${isCurrent ? 'text-white' : 'text-ink-900'}`}>
                            {term.name}
                          </div>
                          <div className={`text-xs ${isCurrent ? 'text-white/80' : 'text-ink-500'}`}>
                            {term.date}
                          </div>
                        </div>
                        {isParticipated && !isCurrent && (
                          <Badge variant="eco" className="text-xs">已参与</Badge>
                        )}
                        {isCurrent && (
                          <Badge className="bg-white/20 text-white text-xs">进行中</Badge>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>

      {/* 活动详情弹窗 */}
      <AnimatePresence>
        {selectedTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTerm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className={`p-6 bg-gradient-to-br ${SEASON_CONFIG[selectedTerm.season].gradient} text-white rounded-t-2xl`}>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="bg-white/20 text-white border-white/30 mb-2">
                      {SEASON_CONFIG[selectedTerm.season].name}季 · {selectedTerm.date}
                    </Badge>
                    <h3 className="text-2xl font-bold">{selectedTerm.name}</h3>
                    <p className="text-white/80 text-sm">{selectedTerm.englishName}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTerm(null)}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="mt-4 text-white/90">{selectedTerm.description}</p>
              </div>
              
              {/* 内容 */}
              <div className="p-6">
                {/* 生态主题 */}
                <div className="mb-6">
                  <h4 className="font-bold text-ink-900 mb-2 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-eco-500" />
                    生态主题
                  </h4>
                  <p className="text-ink-600">{selectedTerm.ecoTheme}</p>
                </div>
                
                {/* 关联非遗 */}
                <div className="mb-6">
                  <h4 className="font-bold text-ink-900 mb-2 flex items-center gap-2">
                    <TreeDeciduous className="w-5 h-5 text-heritage-500" />
                    关联非遗
                  </h4>
                  <Link
                    to={selectedTerm.heritageLink}
                    className="flex items-center gap-2 p-3 bg-heritage-50 rounded-lg text-heritage-700 hover:bg-heritage-100 transition-colors"
                  >
                    <span>{selectedTerm.heritage}</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Link>
                </div>
                
                {/* 活动内容 */}
                <div className="mb-6">
                  <h4 className="font-bold text-ink-900 mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    活动内容
                  </h4>
                  <div className="space-y-2">
                    {selectedTerm.activities.map((activity, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-eco-100 rounded-full flex items-center justify-center text-eco-600 text-sm font-medium">
                          {i + 1}
                        </div>
                        <span className="text-ink-700">{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 奖励 */}
                <div className="p-4 bg-gradient-to-r from-eco-50 to-bamboo-50 rounded-xl mb-6">
                  <h4 className="font-bold text-eco-800 mb-3 flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    活动奖励
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-500" />
                      <span className="font-bold text-eco-700">+{selectedTerm.rewards.points} 积分</span>
                    </div>
                    {selectedTerm.rewards.badge && (
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-eco-500" />
                        <span className="text-eco-700">{selectedTerm.rewards.badge}</span>
                      </div>
                    )}
                    {selectedTerm.rewards.nft && (
                      <Badge variant="heritage">限定NFT</Badge>
                    )}
                  </div>
                </div>
                
                {/* 参与按钮 */}
                {participatedTerms.has(selectedTerm.id) ? (
                  <div className="p-4 bg-eco-50 rounded-xl text-center">
                    <Award className="w-8 h-8 text-eco-500 mx-auto mb-2" />
                    <p className="text-eco-700 font-medium">已参与此节气活动</p>
                  </div>
                ) : (
                  <Button
                    variant="eco"
                    className="w-full"
                    onClick={() => {
                      participateActivity(selectedTerm)
                      setSelectedTerm(null)
                    }}
                  >
                    参与活动
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
