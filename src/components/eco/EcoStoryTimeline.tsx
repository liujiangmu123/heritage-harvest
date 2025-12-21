import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, Leaf, TreeDeciduous, Droplets, Mountain, 
  ChevronRight, Award, X, ExternalLink
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useGreenPointsStore } from '@/store/greenPointsStore'

interface TimelineEvent {
  id: string
  year: string
  era: string
  title: string
  description: string
  ecoWisdom: string
  heritage: string
  heritageLink?: string
  icon: 'water' | 'forest' | 'agriculture' | 'craft'
  image: string
  details: string[]
}

const TIMELINE_DATA: TimelineEvent[] = [
  {
    id: '1',
    year: '公元前2000年',
    era: '新石器时代',
    title: '哈尼梯田的起源',
    description: '哈尼族先民开始在哀牢山区开垦梯田，创造了"森林-村寨-梯田-水系"四素同构的生态系统。',
    ecoWisdom: '顺应自然地形，利用重力实现水资源的自然循环，零能耗灌溉系统。',
    heritage: '哈尼梯田',
    heritageLink: '/experience/hani-terrace',
    icon: 'water',
    image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800',
    details: [
      '森林涵养水源，年均降水量1400mm',
      '村寨位于半山腰，便于管理梯田',
      '梯田层层叠叠，最多可达3000级',
      '水系自上而下流动，实现自然灌溉',
    ],
  },
  {
    id: '2',
    year: '公元前500年',
    era: '春秋战国',
    title: '竹编技艺的诞生',
    description: '四川青神地区的先民开始利用当地丰富的竹资源，发展出精湛的竹编技艺。',
    ecoWisdom: '竹子3-5年即可成材，是最可持续的天然材料之一，可完全生物降解。',
    heritage: '青神竹编',
    heritageLink: '/experience/bamboo-weaving',
    icon: 'forest',
    image: 'https://images.unsplash.com/photo-1595513046791-c87a6f0c3947?w=800',
    details: [
      '竹子生长速度快，每天可长30-100cm',
      '竹林是天然的碳汇，固碳能力是普通森林的1.5倍',
      '竹制品可替代塑料，减少白色污染',
      '竹编技艺传承3000年，至今仍在使用',
    ],
  },
  {
    id: '3',
    year: '公元200年',
    era: '东汉时期',
    title: '天然染料的发现',
    description: '苗族先民发现板蓝根可提取靛蓝染料，开创了蜡染艺术的先河。',
    ecoWisdom: '天然植物染料零污染，染色废水可直接灌溉农田，实现循环利用。',
    heritage: '苗族蜡染',
    heritageLink: '/experience/batik',
    icon: 'craft',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    details: [
      '板蓝根既是染料原料，也是中药材',
      '天然染色节省90%的水资源',
      '染料可完全生物降解，零化学残留',
      '蜡染图案承载着苗族的生态信仰',
    ],
  },
  {
    id: '4',
    year: '公元700年',
    era: '唐朝',
    title: '茶园生态系统',
    description: '安溪茶农发展出独特的茶园生态种植模式，茶树与其他植物共生。',
    ecoWisdom: '生态茶园不使用农药化肥，依靠生物多样性实现自然害虫控制。',
    heritage: '铁观音制茶',
    heritageLink: '/experience/tea-ceremony',
    icon: 'agriculture',
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800',
    details: [
      '茶园与森林交错，形成天然屏障',
      '每亩茶园年吸收1.5吨二氧化碳',
      '生态茶园是鸟类和昆虫的栖息地',
      '传统制茶工艺零碳排放',
    ],
  },
  {
    id: '5',
    year: '公元1000年',
    era: '宋朝',
    title: '泥塑的天然材料',
    description: '凤翔泥塑使用当地特有的黄土泥料，不添加任何化学物质。',
    ecoWisdom: '取材于自然，回归于自然。泥塑作品可完全降解，实现"从土地来，回土地去"。',
    heritage: '凤翔泥塑',
    heritageLink: '/experience/fengxiang-clay',
    icon: 'craft',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
    details: [
      '黄土泥料100%天然，零化学添加',
      '泥塑制作过程零碳排放',
      '作品可完全生物降解',
      '传承千年的环保艺术形式',
    ],
  },
  {
    id: '6',
    year: '公元1300年',
    era: '元朝',
    title: '皮影的循环经济',
    description: '皮影戏使用动物皮革制作，体现了"物尽其用"的传统智慧。',
    ecoWisdom: '利用畜牧业副产品，减少浪费。传统皮影可使用100年以上，是真正的可持续艺术。',
    heritage: '皮影戏',
    heritageLink: '/experience/shadow-puppet',
    icon: 'craft',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    details: [
      '皮革来自畜牧业副产品，减少浪费',
      '传统鞣制使用植物提取物，无化学污染',
      '一件皮影可传承使用100年以上',
      '体现了古人"物尽其用"的生态智慧',
    ],
  },
]

const ICON_MAP = {
  water: Droplets,
  forest: TreeDeciduous,
  agriculture: Leaf,
  craft: Mountain,
}

interface EcoStoryTimelineProps {
  className?: string
  onComplete?: () => void
}

export default function EcoStoryTimeline({ className = '', onComplete }: EcoStoryTimelineProps) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [viewedEvents, setViewedEvents] = useState<Set<string>>(new Set())
  const { addPoints } = useGreenPointsStore()

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event)
    
    // 标记为已查看并奖励积分
    if (!viewedEvents.has(event.id)) {
      setViewedEvents(prev => new Set([...prev, event.id]))
      addPoints({
        type: 'learn',
        points: 10,
        description: `学习了"${event.title}"的生态智慧`,
      })
    }
  }

  const handleCloseDetail = () => {
    setSelectedEvent(null)
    
    // 检查是否完成所有事件
    if (viewedEvents.size === TIMELINE_DATA.length && onComplete) {
      onComplete()
    }
  }

  const progress = (viewedEvents.size / TIMELINE_DATA.length) * 100

  return (
    <div className={`${className}`}>
      {/* 进度条 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-ink-600">探索进度</span>
          <span className="text-sm font-medium text-eco-600">
            {viewedEvents.size}/{TIMELINE_DATA.length} 已探索
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-eco-500 to-bamboo-500"
          />
        </div>
        {viewedEvents.size === TIMELINE_DATA.length && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center gap-2 text-eco-600"
          >
            <Award className="w-4 h-4" />
            <span className="text-sm font-medium">恭喜！你已解锁"生态历史学家"徽章</span>
          </motion.div>
        )}
      </div>

      {/* 时间线 */}
      <div className="relative">
        {/* 中心线 */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-eco-300 via-eco-500 to-eco-300 transform -translate-x-1/2" />

        {/* 时间线事件 */}
        <div className="space-y-12">
          {TIMELINE_DATA.map((event, index) => {
            const Icon = ICON_MAP[event.icon]
            const isViewed = viewedEvents.has(event.id)
            const isLeft = index % 2 === 0

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
              >
                {/* 内容卡片 */}
                <div className={`w-5/12 ${isLeft ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      isViewed ? 'border-eco-300 bg-eco-50/50' : 'hover:border-eco-200'
                    }`}
                    onClick={() => handleEventClick(event)}
                  >
                    <CardContent className="p-4">
                      <div className={`flex items-center gap-2 mb-2 ${isLeft ? 'justify-end' : 'justify-start'}`}>
                        <Badge variant="eco" className="text-xs">{event.era}</Badge>
                        {isViewed && <Leaf className="w-4 h-4 text-eco-500" />}
                      </div>
                      <h3 className="font-bold text-ink-900 mb-1">{event.title}</h3>
                      <p className="text-sm text-ink-500 line-clamp-2">{event.description}</p>
                      <div className={`flex items-center gap-1 mt-2 text-eco-600 text-sm ${isLeft ? 'justify-end' : 'justify-start'}`}>
                        <span>了解更多</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 中心节点 */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                      isViewed
                        ? 'bg-gradient-to-br from-eco-500 to-bamboo-500 text-white'
                        : 'bg-white border-2 border-eco-300 text-eco-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                </div>

                {/* 年份 */}
                <div className={`w-5/12 ${isLeft ? 'pl-8' : 'pr-8 text-right'}`}>
                  <span className="text-lg font-bold text-eco-600">{event.year}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* 详情弹窗 */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseDetail}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 图片 */}
              <div className="relative h-48 overflow-hidden rounded-t-2xl">
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  onClick={handleCloseDetail}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge variant="eco" className="mb-2">{selectedEvent.era} · {selectedEvent.year}</Badge>
                  <h2 className="text-2xl font-bold text-white">{selectedEvent.title}</h2>
                </div>
              </div>

              {/* 内容 */}
              <div className="p-6">
                <p className="text-ink-600 mb-6">{selectedEvent.description}</p>

                {/* 生态智慧 */}
                <div className="bg-eco-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="w-5 h-5 text-eco-600" />
                    <span className="font-medium text-eco-800">生态智慧</span>
                  </div>
                  <p className="text-eco-700">{selectedEvent.ecoWisdom}</p>
                </div>

                {/* 详细信息 */}
                <h3 className="font-bold text-ink-900 mb-3">深入了解</h3>
                <ul className="space-y-2 mb-6">
                  {selectedEvent.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-ink-600">
                      <span className="w-1.5 h-1.5 bg-eco-500 rounded-full mt-2 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>

                {/* 关联体验 */}
                {selectedEvent.heritageLink && (
                  <a
                    href={selectedEvent.heritageLink}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-eco-50 to-bamboo-50 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="text-sm text-ink-500">关联体验</div>
                      <div className="font-medium text-ink-900">{selectedEvent.heritage}</div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-eco-600" />
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
