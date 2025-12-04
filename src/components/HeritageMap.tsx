/**
 * 非遗知识地图组件
 * 交互式中国地图展示非遗分布
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Star, ChevronRight, Sparkles } from 'lucide-react'

// 非遗项目数据
interface HeritageItem {
  id: string
  name: string
  type: string
  level: 'national' | 'provincial'
  description: string
  image?: string
}

// 省份数据
interface ProvinceData {
  id: string
  name: string
  heritages: HeritageItem[]
  position: { x: number; y: number }
}

// 中国各省非遗数据
const PROVINCE_DATA: ProvinceData[] = [
  {
    id: 'fujian',
    name: '福建',
    position: { x: 78, y: 62 },
    heritages: [
      { id: 'anxi-rattan', name: '安溪藤铁工艺', type: '传统技艺', level: 'national', description: '将藤条与铁丝巧妙结合的编织工艺，已有数百年历史。' },
      { id: 'fujian-puppetry', name: '福建木偶戏', type: '传统戏剧', level: 'national', description: '中国木偶戏的重要流派，包括提线木偶和布袋木偶。' },
      { id: 'dehua-porcelain', name: '德化白瓷', type: '传统技艺', level: 'national', description: '以"中国白"闻名于世的瓷器烧制技艺。' },
    ],
  },
  {
    id: 'yunnan',
    name: '云南',
    position: { x: 42, y: 62 },
    heritages: [
      { id: 'hani-terrace', name: '哈尼梯田', type: '农耕文化', level: 'national', description: '哈尼族一千三百多年农耕智慧的结晶，世界文化遗产。' },
      { id: 'dai-water', name: '傣族泼水节', type: '民俗', level: 'national', description: '傣族最隆重的传统节日，象征洗去旧年的不顺。' },
      { id: 'bai-tie-dye', name: '白族扎染', type: '传统技艺', level: 'national', description: '大理白族传统染色工艺，以蓝白色调为主。' },
    ],
  },
  {
    id: 'shaanxi',
    name: '陕西',
    position: { x: 55, y: 42 },
    heritages: [
      { id: 'paper-cutting', name: '陕北剪纸', type: '传统美术', level: 'national', description: '中国剪纸艺术的重要代表，图案粗犷豪放。' },
      { id: 'shadow-play', name: '华县皮影', type: '传统戏剧', level: 'national', description: '中国皮影戏的发源地之一，造型优美。' },
      { id: 'qinqiang', name: '秦腔', type: '传统戏剧', level: 'national', description: '中国最古老的戏曲剧种之一，被誉为"百戏之祖"。' },
    ],
  },
  {
    id: 'sichuan',
    name: '四川',
    position: { x: 45, y: 52 },
    heritages: [
      { id: 'shu-embroidery', name: '蜀绣', type: '传统技艺', level: 'national', description: '中国四大名绣之一，以细腻精美著称。' },
      { id: 'sichuan-opera', name: '川剧变脸', type: '传统戏剧', level: 'national', description: '川剧中的绝技，瞬间变换脸谱。' },
      { id: 'bamboo-weaving', name: '青神竹编', type: '传统技艺', level: 'national', description: '以慈竹为原料的精细竹编工艺。' },
    ],
  },
  {
    id: 'jiangsu',
    name: '江苏',
    position: { x: 75, y: 48 },
    heritages: [
      { id: 'suzhou-embroidery', name: '苏绣', type: '传统技艺', level: 'national', description: '中国四大名绣之首，精细雅洁。' },
      { id: 'kunqu', name: '昆曲', type: '传统戏剧', level: 'national', description: '中国最古老的戏曲剧种，"百戏之母"。' },
      { id: 'nanjing-brocade', name: '南京云锦', type: '传统技艺', level: 'national', description: '中国传统丝织工艺的巅峰之作。' },
    ],
  },
  {
    id: 'zhejiang',
    name: '浙江',
    position: { x: 78, y: 52 },
    heritages: [
      { id: 'longquan-sword', name: '龙泉宝剑', type: '传统技艺', level: 'national', description: '中国古代兵器制作技艺的杰出代表。' },
      { id: 'yueju', name: '越剧', type: '传统戏剧', level: 'national', description: '中国第二大剧种，有"第二国剧"之称。' },
      { id: 'silk-umbrella', name: '西湖绸伞', type: '传统技艺', level: 'national', description: '杭州特色工艺品，造型优美精致。' },
    ],
  },
  {
    id: 'guangdong',
    name: '广东',
    position: { x: 70, y: 70 },
    heritages: [
      { id: 'cantonese-opera', name: '粤剧', type: '传统戏剧', level: 'national', description: '岭南文化的代表，声腔优美动听。' },
      { id: 'chaozhou-embroidery', name: '潮绣', type: '传统技艺', level: 'national', description: '中国四大名绣之一，立体感强。' },
      { id: 'lion-dance', name: '广东醒狮', type: '传统舞蹈', level: 'national', description: '岭南民间传统舞蹈，喜庆热闹。' },
    ],
  },
  {
    id: 'guizhou',
    name: '贵州',
    position: { x: 50, y: 60 },
    heritages: [
      { id: 'miao-batik', name: '苗族蜡染', type: '传统技艺', level: 'national', description: '苗族传统印染工艺，图案神秘古朴。' },
      { id: 'miao-embroidery', name: '苗绣', type: '传统技艺', level: 'national', description: '苗族刺绣艺术，色彩艳丽。' },
      { id: 'dong-song', name: '侗族大歌', type: '传统音乐', level: 'national', description: '多声部无伴奏合唱，世界非遗。' },
    ],
  },
  {
    id: 'beijing',
    name: '北京',
    position: { x: 68, y: 32 },
    heritages: [
      { id: 'peking-opera', name: '京剧', type: '传统戏剧', level: 'national', description: '中国国粹，被誉为"国剧"。' },
      { id: 'cloisonne', name: '景泰蓝', type: '传统技艺', level: 'national', description: '北京著名的传统工艺品。' },
      { id: 'dough-figurine', name: '面人', type: '传统技艺', level: 'national', description: '以面粉为主料的民间塑型艺术。' },
    ],
  },
  {
    id: 'shandong',
    name: '山东',
    position: { x: 72, y: 40 },
    heritages: [
      { id: 'weifang-kite', name: '潍坊风筝', type: '传统技艺', level: 'national', description: '世界风筝之都的代表工艺。' },
      { id: 'lyu-opera', name: '吕剧', type: '传统戏剧', level: 'national', description: '山东最具代表性的地方戏曲。' },
      { id: 'nianyhua', name: '杨家埠木版年画', type: '传统美术', level: 'national', description: '中国民间木版年画三大产地之一。' },
    ],
  },
  {
    id: 'gansu',
    name: '甘肃',
    position: { x: 42, y: 38 },
    heritages: [
      { id: 'dunhuang-dance', name: '敦煌舞', type: '传统舞蹈', level: 'national', description: '源自敦煌壁画的古典舞蹈。' },
      { id: 'lanzhou-drum', name: '兰州太平鼓', type: '传统舞蹈', level: 'national', description: '具有六百多年历史的民间舞蹈。' },
      { id: 'qingyang-sachet', name: '庆阳香包', type: '传统技艺', level: 'national', description: '历史悠久的民间刺绣工艺品。' },
    ],
  },
  {
    id: 'xinjiang',
    name: '新疆',
    position: { x: 25, y: 28 },
    heritages: [
      { id: 'uyghur-muqam', name: '维吾尔木卡姆', type: '传统音乐', level: 'national', description: '维吾尔族古典音乐，世界非遗。' },
      { id: 'kazakh-felt', name: '哈萨克毡房', type: '传统技艺', level: 'national', description: '游牧民族的传统居住形式。' },
    ],
  },
  {
    id: 'tibet',
    name: '西藏',
    position: { x: 28, y: 48 },
    heritages: [
      { id: 'tibetan-opera', name: '藏戏', type: '传统戏剧', level: 'national', description: '藏族戏剧艺术，世界非遗。' },
      { id: 'thangka', name: '唐卡', type: '传统美术', level: 'national', description: '藏族宗教绘画艺术。' },
    ],
  },
  {
    id: 'inner-mongolia',
    name: '内蒙古',
    position: { x: 55, y: 25 },
    heritages: [
      { id: 'morin-khuur', name: '马头琴', type: '传统音乐', level: 'national', description: '蒙古族弓弦乐器，世界非遗。' },
      { id: 'long-song', name: '蒙古长调', type: '传统音乐', level: 'national', description: '草原音乐文化的代表。' },
    ],
  },
  {
    id: 'hubei',
    name: '湖北',
    position: { x: 62, y: 52 },
    heritages: [
      { id: 'hanchu-embroidery', name: '汉绣', type: '传统技艺', level: 'national', description: '楚文化的代表性刺绣工艺。' },
      { id: 'chime-bells', name: '编钟', type: '传统音乐', level: 'national', description: '中国古代大型打击乐器。' },
    ],
  },
]

// 省份SVG路径简化版（使用圆点标记）
export default function HeritageMap() {
  const [selectedProvince, setSelectedProvince] = useState<ProvinceData | null>(null)
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null)
  const [selectedHeritage, setSelectedHeritage] = useState<HeritageItem | null>(null)

  // 统计数据
  const stats = useMemo(() => {
    const total = PROVINCE_DATA.reduce((sum, p) => sum + p.heritages.length, 0)
    const national = PROVINCE_DATA.reduce(
      (sum, p) => sum + p.heritages.filter(h => h.level === 'national').length,
      0
    )
    return { total, national, provinces: PROVINCE_DATA.length }
  }, [])

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-ink-900 via-ink-800 to-primary-900 p-4 md:p-8">
      {/* 标题 */}
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-white mb-2"
        >
          <Sparkles className="inline-block w-8 h-8 mr-2 text-heritage-400" />
          中国非遗知识地图
        </motion.h1>
        <p className="text-ink-300">点击省份探索当地非物质文化遗产</p>
      </div>

      {/* 统计卡片 */}
      <div className="flex justify-center gap-4 md:gap-8 mb-8">
        {[
          { label: '覆盖省份', value: stats.provinces, icon: '🗺️' },
          { label: '非遗项目', value: stats.total, icon: '🏛️' },
          { label: '国家级', value: stats.national, icon: '⭐' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center"
          >
            <span className="text-2xl">{stat.icon}</span>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-ink-300">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* 地图容器 */}
      <div className="relative max-w-4xl mx-auto">
        {/* 中国地图轮廓（简化SVG） */}
        <svg
          viewBox="0 0 100 80"
          className="w-full h-auto"
          style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))' }}
        >
          {/* 简化的中国轮廓 */}
          <path
            d="M20,25 Q25,15 40,12 Q55,10 70,15 Q85,20 88,35 Q90,45 85,55 Q80,65 70,70 Q55,75 45,72 Q35,70 30,65 Q20,55 15,45 Q12,35 20,25 Z"
            fill="rgba(255,255,255,0.05)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="0.5"
          />
          
          {/* 省份标记点 */}
          {PROVINCE_DATA.map((province) => (
            <g key={province.id}>
              {/* 外发光效果 */}
              {(hoveredProvince === province.id || selectedProvince?.id === province.id) && (
                <circle
                  cx={province.position.x}
                  cy={province.position.y}
                  r="4"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="1"
                  opacity="0.6"
                >
                  <animate
                    attributeName="r"
                    values="3;5;3"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;0.2;0.6"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              
              {/* 主标记点 */}
              <circle
                cx={province.position.x}
                cy={province.position.y}
                r={selectedProvince?.id === province.id ? 3 : 2.5}
                fill={
                  selectedProvince?.id === province.id
                    ? '#F59E0B'
                    : hoveredProvince === province.id
                    ? '#FBBF24'
                    : '#10B981'
                }
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedProvince(province)}
                onMouseEnter={() => setHoveredProvince(province.id)}
                onMouseLeave={() => setHoveredProvince(null)}
              />
              
              {/* 省份名称 */}
              <text
                x={province.position.x}
                y={province.position.y - 4}
                textAnchor="middle"
                fill="white"
                fontSize="2.5"
                fontWeight="500"
                className="pointer-events-none select-none"
                opacity={hoveredProvince === province.id || selectedProvince?.id === province.id ? 1 : 0.7}
              >
                {province.name}
              </text>
            </g>
          ))}
        </svg>

        {/* 图例 */}
        <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm rounded-lg p-3 text-xs text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>非遗分布点</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>当前选中</span>
          </div>
        </div>
      </div>

      {/* 省份详情侧边栏 */}
      <AnimatePresence>
        {selectedProvince && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 h-full w-full md:w-96 bg-ink-900/95 backdrop-blur-lg shadow-2xl z-50 overflow-y-auto"
          >
            {/* 头部 */}
            <div className="sticky top-0 bg-gradient-to-r from-heritage-600 to-primary-600 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-white" />
                  <h2 className="text-xl font-bold text-white">{selectedProvince.name}</h2>
                </div>
                <button
                  onClick={() => {
                    setSelectedProvince(null)
                    setSelectedHeritage(null)
                  }}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <p className="text-white/80 text-sm mt-1">
                共 {selectedProvince.heritages.length} 项非物质文化遗产
              </p>
            </div>

            {/* 非遗列表 */}
            <div className="p-4 space-y-3">
              {selectedProvince.heritages.map((heritage, index) => (
                <motion.div
                  key={heritage.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedHeritage(heritage)}
                  className={`
                    p-4 rounded-xl cursor-pointer transition-all
                    ${selectedHeritage?.id === heritage.id
                      ? 'bg-heritage-500/30 border border-heritage-400'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{heritage.name}</h3>
                        {heritage.level === 'national' && (
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      <span className="inline-block px-2 py-0.5 bg-primary-500/30 text-primary-300 text-xs rounded-full">
                        {heritage.type}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-ink-400" />
                  </div>
                  
                  {selectedHeritage?.id === heritage.id && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 text-sm text-ink-300 leading-relaxed"
                    >
                      {heritage.description}
                    </motion.p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* 底部提示 */}
            <div className="p-4 border-t border-ink-700">
              <p className="text-xs text-ink-400 text-center">
                点击非遗项目查看详细介绍
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 移动端遮罩 */}
      <AnimatePresence>
        {selectedProvince && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedProvince(null)
              setSelectedHeritage(null)
            }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
