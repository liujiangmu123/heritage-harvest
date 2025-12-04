/**
 * 非遗历史时间线组件
 * 展示非遗的历史演变
 */

import { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause,
  Info,
  Sparkles,
  Calendar,
  MapPin,
  Award
} from 'lucide-react'
import { Link } from 'react-router-dom'

// 时间线数据
const TIMELINE_DATA = [
  {
    year: '公元前',
    period: '远古时期',
    title: '原始编织技艺萌芽',
    description: '人类开始使用植物纤维和动物皮毛进行简单编织，这是编织工艺的起源。',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
    color: '#92400E',
  },
  {
    year: '汉代',
    period: '公元前202年-公元220年',
    title: '剪纸艺术诞生',
    description: '纸张发明后，剪纸艺术开始萌芽。最初用于祭祀和装饰，逐渐发展成民间艺术。',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600',
    color: '#DC2626',
  },
  {
    year: '唐代',
    period: '公元618-907年',
    title: '剪纸艺术兴盛',
    description: '剪纸在民间广泛流传，出现专业剪纸艺人。窗花、礼花等形式日益丰富。',
    image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=600',
    color: '#EA580C',
  },
  {
    year: '元代',
    period: '公元1271-1368年',
    title: '哈尼梯田开垦',
    description: '哈尼族先民迁入红河南岸，开始在哀牢山区开垦梯田，形成独特的农耕文明。',
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600',
    color: '#059669',
  },
  {
    year: '明代',
    period: '公元1368-1644年',
    title: '四大名绣成型',
    description: '苏绣、湘绣、粤绣、蜀绣四大名绣流派逐渐形成，各具地方特色。',
    image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600',
    color: '#7C3AED',
  },
  {
    year: '清代',
    period: '公元1644-1912年',
    title: '安溪藤铁工艺发展',
    description: '福建安溪藤铁工艺逐渐成熟，产品远销海外，成为当地支柱产业。',
    image: 'https://images.unsplash.com/photo-1595513046791-c87a6f0c3947?w=600',
    color: '#D97706',
  },
  {
    year: '2003年',
    period: '现代保护',
    title: '非遗保护公约通过',
    description: '联合国教科文组织通过《保护非物质文化遗产公约》，开启全球非遗保护新纪元。',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600',
    color: '#2563EB',
  },
  {
    year: '2009年',
    period: '世界认可',
    title: '中国剪纸入选世界非遗',
    description: '中国剪纸被联合国教科文组织列入人类非物质文化遗产代表作名录。',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600',
    color: '#DC2626',
  },
  {
    year: '2013年',
    period: '世界认可',
    title: '哈尼梯田成为世界遗产',
    description: '红河哈尼梯田文化景观被列入世界文化遗产名录，是中国第45处世界遗产。',
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600',
    color: '#059669',
  },
  {
    year: '2014年',
    period: '国家保护',
    title: '安溪藤铁成为国家级非遗',
    description: '安溪藤铁工艺被列入国家级非物质文化遗产代表性项目名录。',
    image: 'https://images.unsplash.com/photo-1595513046791-c87a6f0c3947?w=600',
    color: '#D97706',
  },
  {
    year: '2024年',
    period: '数字传承',
    title: '非遗数字化新时代',
    description: '运用VR、AR、AI等技术，让非遗在数字世界焕发新生，传承文化薪火。',
    image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600',
    color: '#8B5CF6',
  },
]

export default function HeritageTimeline() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 自动播放
  useEffect(() => {
    if (!isPlaying) return
    
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % TIMELINE_DATA.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isPlaying])

  const activeItem = TIMELINE_DATA[activeIndex]

  return (
    <div className="min-h-screen bg-ink-950 text-white overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 transition-all duration-1000"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${activeItem.color}20 0%, transparent 50%)`,
          }}
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
      </div>

      {/* 顶部导航 */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          返回首页
        </Link>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full transition-colors
              ${isPlaying ? 'bg-heritage-500 text-white' : 'bg-white/10 hover:bg-white/20'}
            `}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? '暂停' : '自动播放'}
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 左侧：图片和信息 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* 年份大标题 */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <span 
                  className="text-8xl lg:text-9xl font-black opacity-20"
                  style={{ color: activeItem.color }}
                >
                  {activeItem.year}
                </span>
              </motion.div>

              {/* 图片 */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={activeItem.image}
                  alt={activeItem.title}
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* 时期标签 */}
                <div className="absolute top-4 left-4">
                  <span 
                    className="px-4 py-2 rounded-full text-white text-sm font-medium backdrop-blur"
                    style={{ backgroundColor: `${activeItem.color}CC` }}
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    {activeItem.period}
                  </span>
                </div>
              </div>

              {/* 标题和描述 */}
              <div className="mt-6">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  {activeItem.title}
                </h2>
                <p className="text-lg text-ink-300 leading-relaxed">
                  {activeItem.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 右侧：时间线 */}
          <div className="relative" ref={containerRef}>
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-heritage-500 via-primary-500 to-heritage-500" />
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-ink-700">
              {TIMELINE_DATA.map((item, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  whileHover={{ x: 10 }}
                  className={`
                    relative flex items-start gap-4 w-full text-left p-4 rounded-xl transition-all
                    ${index === activeIndex 
                      ? 'bg-white/10 backdrop-blur' 
                      : 'hover:bg-white/5'
                    }
                  `}
                >
                  {/* 时间点 */}
                  <div 
                    className={`
                      relative z-10 w-4 h-4 rounded-full border-2 shrink-0 mt-1
                      ${index === activeIndex 
                        ? 'scale-150' 
                        : ''
                      }
                    `}
                    style={{ 
                      backgroundColor: index === activeIndex ? item.color : 'transparent',
                      borderColor: item.color,
                    }}
                  >
                    {index === activeIndex && (
                      <motion.div
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        className="font-bold"
                        style={{ color: index === activeIndex ? item.color : 'white' }}
                      >
                        {item.year}
                      </span>
                      {index === activeIndex && (
                        <Sparkles className="w-4 h-4 text-heritage-400" />
                      )}
                    </div>
                    <p className={`text-sm ${index === activeIndex ? 'text-white' : 'text-ink-400'}`}>
                      {item.title}
                    </p>
                  </div>

                  {/* 箭头 */}
                  {index === activeIndex && (
                    <ChevronRight className="w-5 h-5 text-heritage-400 shrink-0" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 底部导航 */}
      <div className="relative z-10 fixed bottom-0 left-0 right-0 p-6">
        <div className="max-w-4xl mx-auto">
          {/* 进度条 */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setActiveIndex(prev => prev === 0 ? TIMELINE_DATA.length - 1 : prev - 1)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1 flex items-center gap-1">
              {TIMELINE_DATA.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className="flex-1 h-1 rounded-full transition-all overflow-hidden"
                  style={{
                    backgroundColor: index <= activeIndex ? TIMELINE_DATA[index].color : 'rgba(255,255,255,0.2)',
                  }}
                />
              ))}
            </div>
            
            <button
              onClick={() => setActiveIndex(prev => (prev + 1) % TIMELINE_DATA.length)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* 当前位置 */}
          <div className="text-center text-ink-400 text-sm">
            {activeIndex + 1} / {TIMELINE_DATA.length}
          </div>
        </div>
      </div>
    </div>
  )
}
