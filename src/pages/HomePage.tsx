import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  Mountain,
  Recycle,
  Theater,
  Palette,
  Shapes,
  Leaf,
  Droplets,
  Sprout,
  TreeDeciduous,
  Search,
  BookOpen,
  Gamepad2,
  Camera,
  Heart,
  Share2,
  Sparkles,
  Lightbulb,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useGreenPointsStore } from '@/store/greenPointsStore'
import { useCarbonAccountStore } from '@/store/carbonAccountStore'
import { useExperienceStore } from '@/store'

// 六大生态智慧分类
const ecoCategories = [
  { id: 'all', name: '全部', icon: Sparkles, color: 'from-eco-500 to-eco-600' },
  { id: 'water', name: '水资源智慧', icon: Droplets, color: 'from-blue-500 to-cyan-500' },
  { id: 'bamboo', name: '以竹代塑', icon: TreeDeciduous, color: 'from-green-500 to-emerald-500' },
  { id: 'recycle', name: '循环利用', icon: Recycle, color: 'from-amber-500 to-orange-500' },
  { id: 'degradable', name: '可降解材料', icon: Leaf, color: 'from-lime-500 to-green-500' },
  { id: 'natural', name: '天然材料', icon: Shapes, color: 'from-yellow-500 to-amber-500' },
  { id: 'farming', name: '农耕生态', icon: Sprout, color: 'from-teal-500 to-green-500' },
]

// V3 优化版：6 个核心生态非遗体验，增加分类和碳减排数据
const ecoExperiences = [
  {
    id: 'hani-terrace',
    name: '哈尼梯田',
    category: 'water',
    categoryName: '水资源智慧',
    categoryIcon: Droplets,
    ecoTag: '四素同构',
    description: '探索森林-村寨-梯田-水系的生态循环',
    image: '/heritage-harvest/images/1.梯田.png',
    icon: Mountain,
    path: '/experience/hani-terrace',
    carbonSaving: 2500, // 克
  },
  {
    id: 'bamboo-weaving',
    name: '藤编工艺',
    category: 'bamboo',
    categoryName: '以竹代塑',
    categoryIcon: TreeDeciduous,
    ecoTag: '可再生材料',
    description: '用竹藤替代塑料的传统智慧',
    image: '/heritage-harvest/images/2.竹编.png',
    icon: Recycle,
    path: '/experience/bamboo-weaving',
    carbonSaving: 500,
  },
  {
    id: 'shadow-puppet',
    name: '华县皮影戏',
    category: 'recycle',
    categoryName: '循环利用',
    categoryIcon: Recycle,
    ecoTag: '物尽其用',
    description: '一张牛皮的循环利用智慧',
    image: '/heritage-harvest/images/3.皮影戏.png',
    icon: Theater,
    path: '/experience/shadow-puppet',
    carbonSaving: 350,
  },
  {
    id: 'paper-cutting',
    name: '剪纸艺术',
    category: 'degradable',
    categoryName: '可降解材料',
    categoryIcon: Leaf,
    ecoTag: '100%可降解',
    description: '纸张艺术的环保优势',
    image: '/heritage-harvest/images/4.剪纸.png',
    icon: Palette,
    path: '/experience/paper-cutting',
    carbonSaving: 300,
  },
  {
    id: 'fengxiang-clay',
    name: '凤翔泥塑',
    category: 'natural',
    categoryName: '天然材料',
    categoryIcon: Shapes,
    ecoTag: '零化学添加',
    description: '纯天然黏土的传统工艺',
    image: '/heritage-harvest/images/5.泥老虎.png',
    icon: Shapes,
    path: '/experience/fengxiang-clay',
    carbonSaving: 400,
  },
  {
    id: 'tea-ceremony',
    name: '茶道生态',
    category: 'farming',
    categoryName: '农耕生态',
    categoryIcon: Sprout,
    ecoTag: '茶园碳汇',
    description: '茶园生态系统的碳中和智慧',
    image: '/heritage-harvest/images/6.茶园日出景.png',
    icon: Leaf,
    path: '/experience/tea-ceremony',
    carbonSaving: 450,
  },
]

// 用户旅程步骤
const journeySteps = [
  { id: 'discover', name: '发现', icon: Search, description: '探索生态非遗' },
  { id: 'learn', name: '学习', icon: BookOpen, description: '了解生态智慧' },
  { id: 'experience', name: '体验', icon: Gamepad2, description: '沉浸式互动' },
  { id: 'create', name: '创作', icon: Camera, description: 'AI拍立得留念' },
  { id: 'commit', name: '承诺', icon: Heart, description: '生态承诺墙' },
  { id: 'share', name: '分享', icon: Share2, description: '传播环保理念' },
]

// 已完成开发的体验ID列表
const completedExperienceIds = ['bamboo-weaving', 'shadow-puppet']

// 体验卡片组件 - V3优化版：增加分类标识和碳减排数据
function ExperienceCard({ experience, index, onComingSoon }: { experience: typeof ecoExperiences[0], index: number, onComingSoon: () => void }) {
  const CategoryIcon = experience.categoryIcon
  const isCompleted = completedExperienceIds.includes(experience.id)
  const navigate = useNavigate()
  
  const handleClick = (e: React.MouseEvent) => {
    if (!isCompleted) {
      e.preventDefault()
      onComingSoon()
    } else {
      navigate(experience.path)
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      layout
    >
      <div onClick={handleClick} className="cursor-pointer">
        <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {/* 大尺寸封面图 */}
          <div className="relative h-48 lg:h-56 overflow-hidden">
            <img
              src={experience.image}
              alt={experience.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* 分类标签 - 左上角 */}
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
                <CategoryIcon className="w-3.5 h-3.5 text-eco-600" />
                <span className="text-xs font-medium text-ink-700">{experience.categoryName}</span>
              </div>
            </div>
            
            {/* 生态标签 - 右上角 */}
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-eco-500 text-white shadow-lg">
                {experience.ecoTag}
              </span>
            </div>
            
            {/* 底部信息 */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-xl font-bold text-white mb-1">
                {experience.name}
              </h3>
              <p className="text-white/80 text-sm line-clamp-1">{experience.description}</p>
            </div>
          </div>
          
          {/* 未开发标识 */}
          {!isCompleted && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-full">
                即将上线
              </div>
            </div>
          )}
          
          {/* 卡片底部 - 碳减排数据 */}
          <div className="p-4 flex items-center justify-between bg-gradient-to-r from-eco-50 to-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-eco-100 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-eco-600" />
              </div>
              <div>
                <p className="text-xs text-ink-500">体验减碳</p>
                <p className="text-sm font-bold text-eco-600">
                  {experience.carbonSaving >= 1000 
                    ? `${(experience.carbonSaving / 1000).toFixed(1)}kg` 
                    : `${experience.carbonSaving}g`}
                </p>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-eco-500 group-hover:bg-eco-600' : 'bg-gray-400'}`}>
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showComingSoon, setShowComingSoon] = useState(false)
  const { totalPoints } = useGreenPointsStore()
  const { totalCarbonSaved, getEquivalentMetrics } = useCarbonAccountStore()
  const { completedExperiences } = useExperienceStore()
  const equivalent = getEquivalentMetrics()

  // 根据分类筛选体验
  const filteredExperiences = selectedCategory === 'all' 
    ? ecoExperiences 
    : ecoExperiences.filter(exp => exp.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-eco-50/30">
      {/* Hero Section - V3优化版：增加核心理念 */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-20">
        {/* 简洁背景 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-eco-100/50 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-eco-200/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* 大标题 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl sm:text-6xl lg:text-[72px] font-bold leading-tight mb-6"
          >
            <span className="bg-gradient-to-r from-eco-600 via-eco-500 to-bamboo-500 bg-clip-text text-transparent">
              乡遗识
            </span>
          </motion.h1>

          {/* 副标题 */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-xl lg:text-2xl text-ink-600 mb-8 font-light"
          >
            探寻乡村生态智慧，共享绿色文脉遗产
          </motion.p>

          {/* 核心理念卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-eco-50 border border-eco-200 mb-10"
          >
            <Lightbulb className="w-5 h-5 text-eco-600" />
            <span className="text-sm lg:text-base text-ink-700">
              <span className="font-semibold text-eco-700">核心理念：</span>
              非遗技艺 = 古人与自然和谐共生的智慧
            </span>
          </motion.div>

          {/* CTA 按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-eco-500 to-eco-600 hover:from-eco-600 hover:to-eco-700 text-white px-10 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all"
              asChild
            >
              <a href="#experiences">
                开始探索
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
          </motion.div>
        </div>

        {/* 滚动提示 */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-ink-300 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-ink-400 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* 体验卡片区域 - V3优化版：增加分类导航 */}
      <section id="experiences" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-ink-900 mb-4">
              生态非遗体验
            </h2>
            <p className="text-lg text-ink-500 max-w-2xl mx-auto">
              系统覆盖六大生态智慧分类，探索传统非遗中的可持续发展理念
            </p>
          </motion.div>

          {/* 六大分类导航 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {ecoCategories.map((category) => {
              const Icon = category.icon
              const isActive = selectedCategory === category.id
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : 'bg-white text-ink-600 hover:bg-ink-50 border border-ink-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              )
            })}
          </motion.div>

          {/* 2x3 网格布局 - 带动画切换 */}
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredExperiences.map((exp, index) => (
                <ExperienceCard key={exp.id} experience={exp} index={index} onComingSoon={() => setShowComingSoon(true)} />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* 用户旅程闭环展示 - V3新增 */}
      <section className="py-16 bg-ink-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-ink-900 mb-3">
              你的生态之旅
            </h2>
            <p className="text-ink-500">
              完整闭环体验，从发现到分享，让环保成为习惯
            </p>
          </motion.div>

          {/* 旅程步骤 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* 连接线 */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-eco-200 -translate-y-1/2 z-0" />
            
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 relative z-10">
              {journeySteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white shadow-sm border border-eco-100 flex items-center justify-center mb-3 group hover:bg-eco-500 hover:border-eco-500 transition-all cursor-pointer">
                      <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-eco-600 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-sm font-semibold text-ink-900">{step.name}</p>
                    <p className="text-xs text-ink-500 text-center mt-1 hidden lg:block">{step.description}</p>
                  </motion.div>
                )
              })}
            </div>

            {/* 闭环箭头提示 */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="text-center mt-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-eco-100 text-eco-700 text-sm">
                <Recycle className="w-4 h-4" />
                绿色积分 + 碳账户 贯穿全程，形成正向循环
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 生态数据展示 - V3优化版 */}
      <section className="py-16 bg-gradient-to-r from-eco-500 to-eco-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              我的生态影响力
            </h2>
            <p className="text-white/70 text-sm">
              每一次云游体验，都是对地球的温柔守护
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8 text-white"
          >
            {/* 绿色积分 */}
            <div className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
              <p className="text-3xl lg:text-4xl font-bold">{totalPoints}</p>
              <p className="text-sm text-white/70 mt-1">绿色积分</p>
            </div>
            
            {/* 碳减排 */}
            <div className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
              <p className="text-3xl lg:text-4xl font-bold">
                {totalCarbonSaved >= 1000 ? `${(totalCarbonSaved / 1000).toFixed(1)}` : totalCarbonSaved}
                <span className="text-lg ml-1">{totalCarbonSaved >= 1000 ? 'kg' : 'g'}</span>
              </p>
              <p className="text-sm text-white/70 mt-1">碳减排量</p>
            </div>
            
            {/* 完成体验 */}
            <div className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
              <p className="text-3xl lg:text-4xl font-bold">{completedExperiences.length}</p>
              <p className="text-sm text-white/70 mt-1">完成体验</p>
            </div>
            
            {/* 等效种树 */}
            <div className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
              <p className="text-3xl lg:text-4xl font-bold">≈ {equivalent.treesPlanted}</p>
              <p className="text-sm text-white/70 mt-1">棵树</p>
            </div>

            {/* 覆盖分类 */}
            <div className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm col-span-2 lg:col-span-1">
              <p className="text-3xl lg:text-4xl font-bold">6</p>
              <p className="text-sm text-white/70 mt-1">大生态智慧分类</p>
            </div>
          </motion.div>

          {/* 底部提示 */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center text-white/60 text-sm mt-8"
          >
            💡 每次云游体验，相当于减少一次实地旅游的碳排放
          </motion.p>
        </div>
      </section>

      {/* 等待开发弹窗 */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowComingSoon(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-ink-900 mb-2">敬请期待</h3>
              <p className="text-ink-600 mb-6">
                该体验正在开发中，即将上线。<br />
                目前可体验「藤编工艺」和「华县皮影戏」
              </p>
              <button
                onClick={() => setShowComingSoon(false)}
                className="px-6 py-2.5 bg-eco-500 text-white rounded-full font-medium hover:bg-eco-600 transition-colors"
              >
                我知道了
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
