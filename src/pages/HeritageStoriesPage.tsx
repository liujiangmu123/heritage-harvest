import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Award, 
  MapPin, 
  ChevronRight,
  Sparkles,
  Users,
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { heritages } from '@/data/mockData'
import { Link } from 'react-router-dom'

export default function HeritageStoriesPage() {
  const [selectedHeritage, setSelectedHeritage] = useState(heritages[0])

  return (
    <div className="min-h-screen pt-20">
      {/* Hero区域 */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* 背景图片 */}
        <div className="absolute inset-0">
          <img
            src={selectedHeritage.images[0]}
            alt={selectedHeritage.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <motion.div
              key={selectedHeritage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge 
                variant={selectedHeritage.level === 'national' ? 'national' : 'provincial'}
                className="mb-6"
              >
                <Award className="w-4 h-4 mr-2" />
                {selectedHeritage.level === 'national' ? '国家级' : '省级'}非物质文化遗产
              </Badge>

              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                {selectedHeritage.name}
              </h1>

              <div className="flex items-center gap-6 text-white/80 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {selectedHeritage.region}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  传承人：{selectedHeritage.inheritor.name}
                </div>
              </div>

              <p className="text-lg text-white/90 leading-relaxed mb-8">
                {selectedHeritage.description}
              </p>

              <div className="flex gap-4">
                <Button variant="heritage" size="lg" asChild>
                  <Link to={`/vr/${selectedHeritage.vrSceneId}`}>
                    <Sparkles className="w-5 h-5 mr-2" />
                    VR沉浸体验
                  </Link>
                </Button>
                <Button variant="glass" size="lg" className="text-white border-white/30" asChild>
                  <Link to="/products">
                    <Play className="w-5 h-5 mr-2" />
                    探索相关产品
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 右侧选择器 */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2">
          <div className="space-y-4">
            {heritages.map((heritage) => (
              <button
                key={heritage.id}
                onClick={() => setSelectedHeritage(heritage)}
                className={`block w-20 h-20 rounded-xl overflow-hidden transition-all ${
                  selectedHeritage.id === heritage.id
                    ? 'ring-4 ring-heritage-500 scale-110'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={heritage.images[0]}
                  alt={heritage.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 详细介绍 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="heritage" className="mb-4">
                <BookOpen className="w-4 h-4 mr-2" />
                历史渊源
              </Badge>
              <h2 className="text-3xl font-bold text-ink-900 mb-6">
                千年传承的智慧
              </h2>
              <p className="text-ink-500 leading-relaxed mb-6">
                {selectedHeritage.history}
              </p>
              <div className="story-card">
                <p className="text-ink-600 italic leading-relaxed">
                  {selectedHeritage.story}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src={selectedHeritage.images[0]}
                alt={selectedHeritage.name}
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-heritage-100 rounded-2xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 核心技艺 */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-heritage-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="heritage" className="mb-4">核心技艺</Badge>
            <h2 className="text-3xl font-bold text-ink-900">
              匠心独运的工艺流程
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {selectedHeritage.techniques.map((technique, index) => (
              <motion.div
                key={technique}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center p-6 h-full">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-heritage-400 to-primary-500 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-white">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-ink-900 mb-2">{technique}</h3>
                  <p className="text-sm text-ink-500">
                    传统技艺的第{index + 1}道工序，凝聚匠人智慧
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 传承人 */}
      <section className="py-20 bg-ink-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src={selectedHeritage.inheritor.avatar}
                alt={selectedHeritage.inheritor.name}
                className="w-full max-w-md mx-auto rounded-2xl"
              />
              <div className="absolute -top-4 -right-4 w-24 h-24 border-4 border-heritage-500 rounded-2xl" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="heritage" className="mb-4">
                <Award className="w-4 h-4 mr-2" />
                非遗传承人
              </Badge>
              <h2 className="text-3xl font-bold mb-2">
                {selectedHeritage.inheritor.name}
              </h2>
              <p className="text-heritage-400 mb-6">
                {selectedHeritage.inheritor.title} · 从艺{selectedHeritage.inheritor.yearsOfPractice}年
              </p>
              <p className="text-ink-300 leading-relaxed mb-6">
                {selectedHeritage.inheritor.bio}
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {selectedHeritage.inheritor.achievements.map((achievement) => (
                  <Badge key={achievement} variant="outline" className="border-white/30 text-white">
                    {achievement}
                  </Badge>
                ))}
              </div>
              <Button variant="heritage" size="lg">
                了解更多传承人故事
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 所有非遗项目 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="heritage" className="mb-4">探索更多</Badge>
            <h2 className="text-3xl font-bold text-ink-900">
              非遗文化宝库
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {heritages.map((heritage, index) => (
              <motion.div
                key={heritage.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  variant="heritage" 
                  className={`group cursor-pointer overflow-hidden ${
                    selectedHeritage.id === heritage.id ? 'ring-2 ring-heritage-500' : ''
                  }`}
                  onClick={() => setSelectedHeritage(heritage)}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={heritage.images[0]}
                      alt={heritage.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge 
                        variant={heritage.level === 'national' ? 'national' : 'provincial'}
                        className="mb-2"
                      >
                        {heritage.level === 'national' ? '国家级' : '省级'}非遗
                      </Badge>
                      <h3 className="text-xl font-bold text-white">{heritage.name}</h3>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 text-sm text-ink-500 mb-3">
                      <MapPin className="w-4 h-4" />
                      {heritage.region}
                    </div>
                    <p className="text-ink-500 line-clamp-2 mb-4">
                      {heritage.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <img
                        src={heritage.inheritor.avatar}
                        alt={heritage.inheritor.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-ink-900">{heritage.inheritor.name}</p>
                        <p className="text-xs text-ink-400">{heritage.inheritor.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
