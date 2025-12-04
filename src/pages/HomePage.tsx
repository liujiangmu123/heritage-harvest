import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Play, 
  Sparkles, 
  Hand,
  Scissors,
  Mountain,
  Eye,
  Zap,
  Palette,
  Trophy,
  MapPin,
  Headphones,
  MessageSquare,
  Share2,
  Star,
  Box,
  Clock,
  Compass,
  Theater,
  Drum,
  Music,
  Shapes
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import AchievementPanel from '@/components/AchievementPanel'
import { useAchievementStore, SKILL_LEVELS } from '@/store/achievementStore'

// 非遗体验项目数据
const experiences = [
  {
    id: 'bamboo-weaving',
    name: '安溪藤铁工艺',
    subtitle: '手部追踪虚拟编织',
    description: '使用MediaPipe手势识别技术，通过摄像头捕捉手部动作，实时模拟藤铁编织过程。握拳编织，张开停止，体验指尖上的非遗艺术。',
    image: 'https://images.unsplash.com/photo-1595513046791-c87a6f0c3947?w=800',
    icon: Hand,
    color: 'from-amber-400 to-orange-600',
    level: 'national',
    region: '福建省安溪县',
    techniques: ['手部追踪', 'Three.js 3D渲染', '实时交互'],
    path: '/experience/bamboo-weaving',
  },
  {
    id: 'paper-cutting',
    name: '剪纸艺术',
    subtitle: '数字剪纸创作',
    description: '传统剪纸艺术的数字化呈现，通过触摸或鼠标操作，体验剪纸的对称美学和镂空艺术，感受民间艺术的魅力。',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    icon: Scissors,
    color: 'from-red-400 to-rose-600',
    level: 'national',
    region: '中国各地',
    techniques: ['SVG动态生成', '路径动画', '对称算法'],
    path: '/experience/paper-cutting',
  },
  {
    id: 'hani-terrace',
    name: '哈尼梯田',
    subtitle: 'VR全景体验',
    description: '360°全景沉浸式体验世界文化遗产哈尼梯田，探索千年农耕智慧，了解长街宴等民俗文化。',
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800',
    icon: Mountain,
    color: 'from-emerald-400 to-teal-600',
    level: 'world',
    region: '云南省元阳县',
    techniques: ['全景球体', '热点交互', 'WebGL渲染'],
    path: '/experience/hani-terrace',
  },
]

// 技术特性
const techFeatures = [
  {
    icon: Eye,
    title: 'MediaPipe 手势识别',
    description: '实时追踪21个手部关键点，识别握拳、张开、指向等手势',
  },
  {
    icon: Zap,
    title: 'Three.js 3D渲染',
    description: '高性能WebGL渲染引擎，打造流畅的3D可视化体验',
  },
  {
    icon: Palette,
    title: 'React Three Fiber',
    description: '声明式3D场景构建，无缝集成React生态系统',
  },
]

// 新功能特性
const newFeatures = [
  {
    icon: Headphones,
    title: '沉浸式音频',
    description: '3D空间音效与民族音乐，增强文化沉浸感',
    color: 'from-purple-400 to-indigo-600',
  },
  {
    icon: MessageSquare,
    title: 'AI语音导览',
    description: '智能语音讲解非遗历史与工艺技法',
    color: 'from-blue-400 to-cyan-600',
  },
  {
    icon: Trophy,
    title: '成就系统',
    description: '探索徽章与技能等级，激励深度学习',
    color: 'from-amber-400 to-orange-600',
  },
  {
    icon: Share2,
    title: '作品分享',
    description: '截图创作并生成分享卡片',
    color: 'from-pink-400 to-rose-600',
  },
  {
    icon: MapPin,
    title: '非遗地图',
    description: '交互式中国地图展示非遗分布',
    color: 'from-emerald-400 to-teal-600',
  },
]

// 高级体验入口
const premiumExperiences = [
  {
    id: 'gallery',
    title: '3D虚拟展厅',
    subtitle: '沉浸式空间漫游',
    description: '步入数字非遗博物馆，360°欣赏珍贵文化遗产',
    icon: Box,
    gradient: 'from-violet-500 via-purple-500 to-indigo-500',
    path: '/gallery',
  },
  {
    id: 'timeline',
    title: '非遗时间线',
    subtitle: '千年文化演变',
    description: '穿越历史长河，见证非遗从古至今的传承之路',
    icon: Clock,
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    path: '/timeline',
  },
  {
    id: 'map',
    title: '非遗知识地图',
    subtitle: '全国非遗分布',
    description: '探索中国各地非物质文化遗产，发现文化宝藏',
    icon: Compass,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    path: '/map',
  },
]

// 陕西非遗体验
const shaanxiExperiences = [
  {
    id: 'shadow-puppet',
    name: '华县皮影戏',
    subtitle: '手势操控皮影',
    description: '使用手势识别控制皮影人物，体验千年皮影艺术的魅力，双手操控皮影表演经典剧目。',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    icon: Theater,
    color: 'from-amber-500 to-red-600',
    level: 'national',
    region: '陕西省华县',
    techniques: ['手势识别', 'Canvas动画', '关节控制'],
    path: '/experience/shadow-puppet',
  },
  {
    id: 'qinqiang-mask',
    name: '秦腔脸谱',
    subtitle: 'AR实时上妆',
    description: '人脸检测实时叠加秦腔脸谱，体验生旦净丑各角色妆容，拍照留念分享。',
    image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=800',
    icon: Palette,
    color: 'from-red-500 to-rose-600',
    level: 'national',
    region: '陕西省',
    techniques: ['人脸检测', 'Canvas绘图', 'AR叠加'],
    path: '/experience/qinqiang-mask',
  },
  {
    id: 'ansai-drum',
    name: '安塞腰鼓',
    subtitle: '体感节奏游戏',
    description: '全身姿态识别捕捉动作，跟随节奏挥臂跳跃，评估动作标准度，挑战高分。',
    image: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=800',
    icon: Drum,
    color: 'from-orange-500 to-red-600',
    level: 'national',
    region: '陕西省安塞区',
    techniques: ['姿态识别', '节奏检测', '动作评分'],
    path: '/experience/ansai-drum',
  },
  {
    id: 'xian-music',
    name: '西安鼓乐',
    subtitle: '沉浸式古乐演奏',
    description: '虚拟演奏堂鼓、编钟、笙等古乐器，配合3D声波可视化，感受千年古乐魅力。',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
    icon: Music,
    color: 'from-amber-500 to-yellow-600',
    level: 'world',
    region: '陕西省西安市',
    techniques: ['Web Audio', '键盘交互', '音频可视化'],
    path: '/experience/xian-music',
  },
  {
    id: 'fengxiang-clay',
    name: '凤翔泥塑',
    subtitle: '3D虚拟捏塑',
    description: '使用Three.js模拟揉、捏、拉、压等手法制作泥塑，体验传统民间艺术。',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
    icon: Shapes,
    color: 'from-amber-400 to-orange-600',
    level: 'national',
    region: '陕西省凤翔区',
    techniques: ['3D建模', '网格变形', '触摸交互'],
    path: '/experience/fengxiang-clay',
  },
]

export default function HomePage() {
  const [showAchievements, setShowAchievements] = useState(false)
  const { totalXP, currentLevel, unlockedAchievements } = useAchievementStore()
  const levelInfo = SKILL_LEVELS[currentLevel]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* 背景装饰 */}
        <div className="absolute inset-0 ink-wash-bg" />
        <div className="absolute inset-0 pattern-overlay" />
        
        {/* 浮动装饰元素 */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/4 left-10 w-20 h-20 rounded-full bg-heritage-200/30 blur-xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-1/4 right-10 w-32 h-32 rounded-full bg-primary-200/30 blur-xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="heritage" className="mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                非遗可视化 · 沉浸式体验
              </Badge>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6"
            >
              <span className="text-gradient">指尖上的</span>
              <br />
              <span className="text-ink-800">非物质文化遗产</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg lg:text-xl text-ink-600 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              运用 WebXR、Three.js、MediaPipe 等先进前端技术，
              将传统非遗工艺转化为可交互的数字体验，让文化遗产在指尖重获新生。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button variant="heritage" size="lg" asChild>
                <a href="#experiences">
                  开始体验
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
              <Button variant="outline-heritage" size="lg" asChild>
                <Link to="/map">
                  <MapPin className="w-5 h-5 mr-2" />
                  非遗地图
                </Link>
              </Button>
            </motion.div>

            {/* 成就入口卡片 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8"
            >
              <button
                onClick={() => setShowAchievements(true)}
                className="inline-flex items-center gap-4 px-6 py-3 bg-white/90 backdrop-blur rounded-2xl shadow-lg hover:shadow-xl transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{levelInfo.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-ink-800">{levelInfo.name}</div>
                    <div className="text-xs text-ink-500">{totalXP} XP</div>
                  </div>
                </div>
                <div className="w-px h-8 bg-ink-200" />
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span className="text-sm text-ink-600">
                    {unlockedAchievements.length} 个成就
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-ink-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* 技术标签 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-3 mt-12"
            >
              {['Three.js', 'MediaPipe', 'React', 'WebGL', 'Framer Motion'].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-white/80 backdrop-blur rounded-full text-sm font-medium text-ink-600 shadow-sm"
                >
                  {tech}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* 滚动提示 */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2 text-ink-400">
            <span className="text-sm">向下滚动探索体验</span>
            <ArrowRight className="w-5 h-5 rotate-90" />
          </div>
        </motion.div>
      </section>

      {/* Experiences Section */}
      <section id="experiences" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="heritage" className="mb-4">沉浸式体验</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-ink-900 mb-4">
              非遗可视化展厅
            </h2>
            <p className="text-lg text-ink-500 max-w-2xl mx-auto">
              选择一项非遗体验，开启您的数字文化之旅
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={exp.path}>
                  <Card variant="heritage" className="group h-full overflow-hidden">
                    {/* 图片区域 */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={exp.image}
                        alt={exp.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      {/* 图标 */}
                      <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br ${exp.color} flex items-center justify-center shadow-lg`}>
                        <exp.icon className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* 级别标签 */}
                      <div className="absolute top-4 right-4">
                        <Badge variant={exp.level === 'world' ? 'national' : exp.level === 'national' ? 'national' : 'provincial'} size="sm">
                          {exp.level === 'world' ? '世界遗产' : exp.level === 'national' ? '国家级' : '省级'}
                        </Badge>
                      </div>

                      {/* 底部信息 */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white/70 text-sm mb-1">{exp.region}</p>
                        <h3 className="text-xl font-bold text-white">{exp.name}</h3>
                      </div>
                    </div>

                    {/* 内容区域 */}
                    <div className="p-6">
                      <p className="text-sm font-medium text-primary-600 mb-2">{exp.subtitle}</p>
                      <p className="text-ink-500 text-sm leading-relaxed mb-4">
                        {exp.description}
                      </p>
                      
                      {/* 技术标签 */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {exp.techniques.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-ink-100 rounded text-xs text-ink-600"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* 进入按钮 */}
                      <Button variant="heritage" className="w-full group-hover:shadow-lg transition-shadow">
                        进入体验
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Shaanxi Heritage Section - 陕西非遗 */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-red-950 via-amber-950 to-stone-900 relative overflow-hidden">
        {/* 装饰背景 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-600 to-transparent" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="heritage" className="mb-4 bg-red-600/20 border-red-500/30">
              🏛️ 陕西非遗
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
              三秦大地 · 文化瑰宝
            </h2>
            <p className="text-lg text-amber-200/70 max-w-2xl mx-auto">
              探索陕西丰富的非物质文化遗产，用创新技术体验千年传承
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shaanxiExperiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={exp.path}>
                  <div className="group relative bg-black/30 backdrop-blur rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all hover:-translate-y-1">
                    {/* 图片 */}
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={exp.image}
                        alt={exp.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* 图标 */}
                      <div className={`absolute top-3 left-3 w-10 h-10 rounded-xl bg-gradient-to-br ${exp.color} flex items-center justify-center`}>
                        <exp.icon className="w-5 h-5 text-white" />
                      </div>
                      
                      {/* 级别 */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${exp.level === 'world' ? 'bg-blue-500' : 'bg-amber-500'} text-white`}>
                          {exp.level === 'world' ? '世界非遗' : '国家级'}
                        </span>
                      </div>
                      
                      {/* 名称 */}
                      <div className="absolute bottom-3 left-3">
                        <h3 className="text-lg font-bold text-white">{exp.name}</h3>
                        <p className="text-amber-200/80 text-sm">{exp.subtitle}</p>
                      </div>
                    </div>
                    
                    {/* 内容 */}
                    <div className="p-4">
                      <p className="text-amber-100/70 text-sm leading-relaxed mb-3 line-clamp-2">
                        {exp.description}
                      </p>
                      
                      {/* 技术标签 */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {exp.techniques.map((tech) => (
                          <span key={tech} className="px-2 py-0.5 bg-white/10 rounded text-xs text-amber-200/70">
                            {tech}
                          </span>
                        ))}
                      </div>
                      
                      {/* 进入按钮 */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-amber-200/50">{exp.region}</span>
                        <span className="text-amber-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                          进入体验 <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Experiences Section - 高级沉浸体验 */}
      <section className="py-20 lg:py-32 bg-ink-950 relative overflow-hidden">
        {/* 动态背景 */}
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-float-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/20 rounded-full blur-[80px] animate-float-slower" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="heritage" className="mb-4">
              <Sparkles className="w-4 h-4 mr-1" />
              高级体验
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
              沉浸式数字文化空间
            </h2>
            <p className="text-lg text-ink-400 max-w-2xl mx-auto">
              突破传统展示边界，以全新视角探索非物质文化遗产
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {premiumExperiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Link to={exp.path}>
                  <div className="group relative h-full">
                    {/* 发光边框 */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${exp.gradient} rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity`} />
                    
                    <div className="relative h-full bg-ink-900 rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all">
                      {/* 图标 */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${exp.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                        <exp.icon className="w-8 h-8 text-white" />
                      </div>
                      
                      {/* 标题 */}
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all">
                        {exp.title}
                      </h3>
                      <p className={`text-sm font-medium bg-gradient-to-r ${exp.gradient} bg-clip-text text-transparent mb-4`}>
                        {exp.subtitle}
                      </p>
                      
                      {/* 描述 */}
                      <p className="text-ink-400 leading-relaxed mb-6">
                        {exp.description}
                      </p>
                      
                      {/* 进入按钮 */}
                      <div className="flex items-center text-white/70 group-hover:text-white transition-colors">
                        <span className="text-sm font-medium">立即体验</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Features Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="heritage" className="mb-4">技术架构</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-ink-900 mb-4">
              先进前端技术栈
            </h2>
            <p className="text-lg text-ink-500 max-w-2xl mx-auto">
              融合多项前沿Web技术，打造流畅的沉浸式体验
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {techFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="heritage" className="h-full p-8 text-center group">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-heritage-400 to-primary-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-ink-900 mb-3">{feature.title}</h3>
                  <p className="text-ink-500 leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New Features Section */}
      <section className="py-20 lg:py-32 bg-ink-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="heritage" className="mb-4">
              <Star className="w-4 h-4 mr-1" />
              全新功能
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              增强体验功能
            </h2>
            <p className="text-lg text-ink-400 max-w-2xl mx-auto">
              音频导览、成就系统、作品分享等功能，让非遗体验更加丰富
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {newFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur rounded-2xl p-6 text-center hover:bg-white/10 transition-colors group"
              >
                <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-ink-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* 地图入口 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link
              to="/map"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-heritage-500 to-primary-500 rounded-2xl text-white font-semibold hover:shadow-lg hover:shadow-heritage-500/25 transition-all group"
            >
              <MapPin className="w-5 h-5" />
              探索非遗知识地图
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-heritage-500 via-primary-500 to-heritage-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 pattern-overlay opacity-10" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Hand className="w-16 h-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              准备好开始体验了吗？
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              选择安溪藤铁工艺，使用摄像头开启手势交互，
              或探索其他非遗可视化体验。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="xl" className="bg-white text-primary-600 hover:bg-white/90" asChild>
                <Link to="/experience/bamboo-weaving">
                  <Hand className="w-5 h-5 mr-2" />
                  藤铁工艺体验
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="border-white/30 hover:bg-white/10" asChild>
                <Link to="/experience/hani-terrace">
                  <Mountain className="w-5 h-5 mr-2" />
                  哈尼梯田VR
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Achievement Panel */}
      <AchievementPanel
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
      />
    </div>
  )
}
